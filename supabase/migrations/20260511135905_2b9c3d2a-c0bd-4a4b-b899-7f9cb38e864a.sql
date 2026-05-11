
-- Enum status
CREATE TYPE public.waitlist_status AS ENUM ('waiting', 'notified');

-- Main waitlist table
CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id),
  date date NOT NULL,
  school_class_category_id uuid NOT NULL REFERENCES public.school_class_categories(id),
  status public.waitlist_status NOT NULL DEFAULT 'waiting',
  notified_at timestamptz DEFAULT NULL,
  deleted_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_unique_active
  ON public.waitlist (child_id, date, school_class_category_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_waitlist_date_category
  ON public.waitlist (date, school_class_category_id)
  WHERE deleted_at IS NULL AND status = 'waiting';

CREATE INDEX idx_waitlist_child
  ON public.waitlist (child_id)
  WHERE deleted_at IS NULL;

-- Outbox for notifications
CREATE TABLE public.waitlist_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_id uuid REFERENCES public.waitlist(id),
  child_id uuid,
  date date,
  school_class_category_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz DEFAULT NULL
);

-- RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_select_waitlist" ON public.waitlist
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admins_insert_waitlist" ON public.waitlist
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admins_update_waitlist" ON public.waitlist
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- No DELETE policy = no physical delete allowed

CREATE POLICY "admins_all_waitlist_notifications" ON public.waitlist_notifications
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Guard trigger: prevent frontend from changing status/notified_at
-- The server-side function bypasses this by setting a session flag.
CREATE OR REPLACE FUNCTION public.guard_waitlist_status_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW.status IS DISTINCT FROM OLD.status
      OR NEW.notified_at IS DISTINCT FROM OLD.notified_at)
     AND coalesce(current_setting('app.waitlist_internal', true), '') <> 'on' THEN
    RAISE EXCEPTION 'Modification de status/notified_at interdite depuis le frontend';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guard_waitlist_status
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_waitlist_status_update();

-- Core function: check if a spot opened up and notify next waitlist entry
CREATE OR REPLACE FUNCTION public.check_waitlist_on_cancellation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date date;
  v_period_id uuid;
  v_wednesday_id uuid;
  v_child_class text;
  v_class_group public.school_class_group;
  v_capacity integer;
  v_count_before integer;
  v_count_after integer;
  v_category_name text;
  v_category_id uuid;
  v_waitlist_row public.waitlist%ROWTYPE;
BEGIN
  -- Determine if this is a real cancellation
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = OLD.status OR NEW.status NOT IN ('cancelled') THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Get child class
  SELECT school_class INTO v_child_class
  FROM public.children
  WHERE id = COALESCE(OLD.child_id, NEW.child_id);

  IF v_child_class IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_TABLE_NAME = 'holiday_reservations' THEN
    v_date := OLD.reservation_date;
    v_period_id := OLD.period_id;
    v_class_group := public.get_school_class_group_for_period(v_period_id, v_child_class);

    IF v_class_group = 'kindergarten' THEN
      SELECT max_participants_kindergarten INTO v_capacity FROM public.available_holiday_periods WHERE id = v_period_id;
    ELSIF v_class_group = 'primary' THEN
      SELECT max_participants_primary INTO v_capacity FROM public.available_holiday_periods WHERE id = v_period_id;
    ELSIF v_class_group = 'teen' THEN
      SELECT max_participants_teen INTO v_capacity FROM public.available_holiday_periods WHERE id = v_period_id;
    ELSE
      RETURN COALESCE(NEW, OLD);
    END IF;

    SELECT COUNT(*) INTO v_count_after
    FROM public.holiday_reservations hr
    JOIN public.children c ON c.id = hr.child_id
    WHERE hr.period_id = v_period_id
      AND hr.reservation_date = v_date
      AND hr.status = 'confirmed'
      AND public.get_school_class_group_for_period(v_period_id, c.school_class) = v_class_group;

  ELSIF TG_TABLE_NAME = 'wednesday_reservations' THEN
    v_wednesday_id := OLD.wednesday_id;
    SELECT date INTO v_date FROM public.available_wednesdays WHERE id = v_wednesday_id;

    IF v_child_class IN ('PS','MS','GS','Petite Section','Moyenne Section','Grande Section') THEN
      v_class_group := 'kindergarten';
      SELECT max_participants_kindergarten INTO v_capacity FROM public.available_wednesdays WHERE id = v_wednesday_id;
    ELSIF v_child_class IN ('CP','CE1','CE2','CM1','CM2') THEN
      v_class_group := 'primary';
      SELECT max_participants_primary INTO v_capacity FROM public.available_wednesdays WHERE id = v_wednesday_id;
    ELSE
      RETURN COALESCE(NEW, OLD);
    END IF;

    SELECT COUNT(*) INTO v_count_after
    FROM public.wednesday_reservations wr
    JOIN public.children c ON c.id = wr.child_id
    WHERE wr.wednesday_id = v_wednesday_id
      AND wr.status = 'confirmed'
      AND (
        (v_class_group = 'kindergarten' AND c.school_class IN ('PS','MS','GS','Petite Section','Moyenne Section','Grande Section'))
        OR (v_class_group = 'primary' AND c.school_class IN ('CP','CE1','CE2','CM1','CM2'))
      );
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_count_before := v_count_after + 1;

  IF NOT (v_count_after < v_capacity AND v_count_before >= v_capacity) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Map class group to a school_class_categories row
  SELECT id, name INTO v_category_id, v_category_name
  FROM public.school_class_categories
  WHERE lower(category) = CASE
    WHEN v_class_group = 'kindergarten' THEN 'maternelle'
    WHEN v_class_group = 'primary' THEN 'primaire'
    WHEN v_class_group = 'teen' THEN 'adolescent'
  END
  LIMIT 1;

  IF v_category_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Find next waiting child
  SELECT * INTO v_waitlist_row
  FROM public.waitlist
  WHERE date = v_date
    AND school_class_category_id = v_category_id
    AND deleted_at IS NULL
    AND status = 'waiting'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE;

  IF v_waitlist_row.id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Update with internal flag to bypass guard trigger
  PERFORM set_config('app.waitlist_internal', 'on', true);
  UPDATE public.waitlist
  SET status = 'notified', notified_at = now()
  WHERE id = v_waitlist_row.id;
  PERFORM set_config('app.waitlist_internal', 'off', true);

  INSERT INTO public.waitlist_notifications (waitlist_id, child_id, date, school_class_category_id)
  VALUES (v_waitlist_row.id, v_waitlist_row.child_id, v_waitlist_row.date, v_waitlist_row.school_class_category_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers on reservations
CREATE TRIGGER trg_waitlist_holiday_cancel
  AFTER DELETE OR UPDATE OF status ON public.holiday_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_waitlist_on_cancellation();

CREATE TRIGGER trg_waitlist_wednesday_cancel
  AFTER DELETE OR UPDATE OF status ON public.wednesday_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_waitlist_on_cancellation();
