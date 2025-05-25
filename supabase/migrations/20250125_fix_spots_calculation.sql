

-- Correction de la fonction check_holiday_spots_available pour gérer les types correctement
CREATE OR REPLACE FUNCTION public.check_holiday_spots_available(p_period_id uuid, p_reservation_date date, p_child_school_class text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  class_group_text text;
  capacity INTEGER;
  reserved_count INTEGER;
BEGIN
  -- 1. Sécurité sur les paramètres
  IF p_child_school_class IS NULL OR TRIM(p_child_school_class) = '' THEN
    RAISE EXCEPTION 'Classe de l''enfant non spécifiée';
  END IF;

  -- 2. Déterminer le groupe en texte directement
  class_group_text := get_school_class_group_for_period(p_period_id, p_child_school_class)::text;
  
  RAISE NOTICE '🧠 Groupe de classe déterminé : %', class_group_text;

  -- 3. Obtenir la capacité correspondant au groupe
  IF class_group_text = 'primary' THEN
    SELECT max_participants_primary INTO capacity
    FROM public.available_holiday_periods
    WHERE id = p_period_id;
  ELSIF class_group_text = 'kindergarten' THEN
    SELECT max_participants_kindergarten INTO capacity
    FROM public.available_holiday_periods
    WHERE id = p_period_id;
  ELSIF class_group_text = 'teen' THEN
    SELECT max_participants_teen INTO capacity
    FROM public.available_holiday_periods
    WHERE id = p_period_id;
  ELSE
    RAISE EXCEPTION 'Groupe de classe inconnu: %', class_group_text;
  END IF;

  IF capacity IS NULL THEN
    RAISE EXCEPTION 'Capacité non définie pour la période % et le groupe %', p_period_id, class_group_text;
  END IF;

  RAISE NOTICE '📦 Capacité trouvée : % places pour le groupe %', capacity, class_group_text;

  -- 4. Compter les réservations confirmées de ce groupe à cette date
  SELECT COUNT(*) INTO reserved_count
  FROM public.holiday_reservations hr
  JOIN public.children c ON c.id = hr.child_id
  WHERE hr.period_id = p_period_id
    AND hr.reservation_date = p_reservation_date
    AND hr.status = 'confirmed'
    AND get_school_class_group_for_period(p_period_id, c.school_class)::text = class_group_text;

  RAISE NOTICE '📊 Réservations confirmées : % pour le groupe %', reserved_count, class_group_text;

  -- 5. Retourner le nombre de places restantes
  RETURN GREATEST(capacity - reserved_count, 0);
END;
$function$;

