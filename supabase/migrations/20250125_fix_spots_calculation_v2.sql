
-- Correction de la fonction check_holiday_spots_available pour bien déduire les réservations existantes
CREATE OR REPLACE FUNCTION public.check_holiday_spots_available(p_period_id uuid, p_reservation_date date, p_child_school_class text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  class_group_enum school_class_group;
  capacity INTEGER;
  reserved_count INTEGER;
BEGIN
  -- 1. Sécurité sur les paramètres
  IF p_child_school_class IS NULL OR TRIM(p_child_school_class) = '' THEN
    RAISE EXCEPTION 'Classe de l''enfant non spécifiée';
  END IF;

  -- 2. Déterminer le groupe : primary / kindergarten / teen (retourne un enum)
  class_group_enum := get_school_class_group_for_period(p_period_id, p_child_school_class);
  
  RAISE NOTICE '🧠 Groupe de classe déterminé : % (enum: %)', class_group_enum::text, class_group_enum;

  -- 3. Obtenir la capacité correspondant au groupe
  IF class_group_enum = 'primary'::school_class_group THEN
    SELECT max_participants_primary INTO capacity
    FROM public.available_holiday_periods
    WHERE id = p_period_id;
  ELSIF class_group_enum = 'kindergarten'::school_class_group THEN
    SELECT max_participants_kindergarten INTO capacity
    FROM public.available_holiday_periods
    WHERE id = p_period_id;
  ELSIF class_group_enum = 'teen'::school_class_group THEN
    SELECT max_participants_teen INTO capacity
    FROM public.available_holiday_periods
    WHERE id = p_period_id;
  ELSE
    RAISE EXCEPTION 'Groupe de classe inconnu: %', class_group_enum;
  END IF;

  IF capacity IS NULL THEN
    RAISE EXCEPTION 'Capacité non définie pour la période % et le groupe %', p_period_id, class_group_enum::text;
  END IF;

  RAISE NOTICE '📦 Capacité trouvée : % places pour le groupe %', capacity, class_group_enum::text;

  -- 4. Compter les réservations confirmées de ce groupe à cette date
  -- Correction: utiliser directement la table holiday_reservations avec une jointure sur children
  SELECT COUNT(*) INTO reserved_count
  FROM public.holiday_reservations hr
  INNER JOIN public.children c ON c.id = hr.child_id
  WHERE hr.period_id = p_period_id
    AND hr.reservation_date = p_reservation_date
    AND hr.status = 'confirmed'
    AND get_school_class_group_for_period(p_period_id, c.school_class) = class_group_enum;

  RAISE NOTICE '📊 Réservations confirmées comptées : % pour le groupe % à la date %', reserved_count, class_group_enum::text, p_reservation_date;

  -- 5. Calculer et retourner le nombre de places restantes
  DECLARE
    remaining_spots INTEGER;
  BEGIN
    remaining_spots := capacity - reserved_count;
    RAISE NOTICE '🎯 Calcul final : % (capacité) - % (réservées) = % places restantes', capacity, reserved_count, remaining_spots;
    RETURN GREATEST(remaining_spots, 0);
  END;
END;
$function$;
