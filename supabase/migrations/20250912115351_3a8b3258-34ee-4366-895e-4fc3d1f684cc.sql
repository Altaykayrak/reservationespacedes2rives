-- Ensure GS is classified as kindergarten for holiday spots calculations
CREATE OR REPLACE FUNCTION public.get_school_class_group_for_period(
  p_school_class text,
  p_period_id uuid
) RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_class text;
  v_category text;
BEGIN
  IF p_school_class IS NULL THEN
    RETURN NULL;
  END IF;

  -- Normalize class input
  v_class := upper(trim(p_school_class));

  -- Normalize common spellings
  IF v_class = 'PETITE SECTION' THEN v_class := 'PS'; END IF;
  IF v_class = 'MOYENNE SECTION' THEN v_class := 'MS'; END IF;
  IF v_class = 'GRANDE SECTION' THEN v_class := 'GS'; END IF;
  IF v_class IN ('6ÈME','6EME') THEN v_class := '6EME'; END IF;
  IF v_class IN ('5ÈME','5EME') THEN v_class := '5EME'; END IF;
  IF v_class IN ('4ÈME','4EME') THEN v_class := '4EME'; END IF;
  IF v_class IN ('3ÈME','3EME') THEN v_class := '3EME'; END IF;

  -- Check period-specific mappings first
  IF p_period_id IS NOT NULL THEN
    SELECT category
      INTO v_category
      FROM public.holiday_period_class_mappings
     WHERE holiday_period_id = p_period_id
       AND upper(trim(school_class)) = v_class
     LIMIT 1;

    IF v_category IS NOT NULL THEN
      -- Respect explicit mapping; convert French to English groups used by views
      IF lower(v_category) IN ('aucune','none') THEN
        RETURN NULL; -- explicitly excluded
      ELSIF lower(v_category) IN ('maternelle','kindergarten') THEN
        RETURN 'kindergarten';
      ELSIF lower(v_category) IN ('primaire','primary') THEN
        RETURN 'primary';
      ELSE
        RETURN 'teen';
      END IF;
    END IF;
  END IF;

  -- Default classification (ensure GS -> kindergarten)
  IF v_class IN ('PS','MS','GS') THEN
    RETURN 'kindergarten';
  ELSIF v_class IN ('CP','CE1','CE2','CM1','CM2') THEN
    RETURN 'primary';
  ELSE
    RETURN 'teen';
  END IF;
END;
$$;

-- Optional: make sure school_class_categories has GS set to kindergarten as a sane default
UPDATE public.school_class_categories
   SET category = 'kindergarten'
 WHERE upper(trim(name)) IN ('GS','GRANDE SECTION');

-- Insert defaults if missing
INSERT INTO public.school_class_categories (name, category)
SELECT 'GS', 'kindergarten'
WHERE NOT EXISTS (
  SELECT 1 FROM public.school_class_categories WHERE upper(trim(name)) = 'GS'
);

INSERT INTO public.school_class_categories (name, category)
SELECT 'GRANDE SECTION', 'kindergarten'
WHERE NOT EXISTS (
  SELECT 1 FROM public.school_class_categories WHERE upper(trim(name)) = 'GRANDE SECTION'
);
