CREATE OR REPLACE FUNCTION public.get_school_class_group_for_period(p_period_id uuid, p_school_class text)
 RETURNS school_class_group
 LANGUAGE plpgsql
AS $function$
DECLARE
  normalized_class text;
  period_name text;
  is_summer_period boolean := false;
  custom_category text;
BEGIN
  normalized_class := UPPER(TRIM(p_school_class));

  -- 1. Vérifier d'abord s'il existe un mapping personnalisé pour cette période et cette classe
  SELECT category INTO custom_category
  FROM public.holiday_period_class_mappings
  WHERE holiday_period_id = p_period_id
    AND UPPER(TRIM(school_class)) = normalized_class
  LIMIT 1;

  IF custom_category IS NOT NULL THEN
    -- Traduire la catégorie frontend (français) vers l'enum
    IF custom_category IN ('maternelle', 'kindergarten') THEN
      RETURN 'kindergarten'::school_class_group;
    ELSIF custom_category IN ('primaire', 'primary') THEN
      RETURN 'primary'::school_class_group;
    ELSIF custom_category IN ('adolescent', 'teen') THEN
      RETURN 'teen'::school_class_group;
    ELSIF custom_category = 'aucune' THEN
      RETURN NULL;
    END IF;
  END IF;

  -- 2. Sinon, appliquer la logique par défaut
  SELECT name INTO period_name 
  FROM public.available_holiday_periods 
  WHERE id = p_period_id;
  
  IF period_name IN ('ETE-01', 'ETE-02', 'ETE-03', 'ETE-04') THEN
    is_summer_period := true;
  END IF;
  
  IF normalized_class IN ('PS', 'MS', 'GS', 'PETITE SECTION', 'MOYENNE SECTION', 'GRANDE SECTION') THEN
    RETURN 'kindergarten'::school_class_group;
  END IF;
  
  IF normalized_class IN ('CP', 'CE1', 'CE2', 'CM1') THEN
    RETURN 'primary'::school_class_group;
  END IF;
  
  IF normalized_class = 'CM2' THEN
    IF is_summer_period THEN
      RETURN 'teen'::school_class_group;
    ELSE
      RETURN 'primary'::school_class_group;
    END IF;
  END IF;
  
  IF normalized_class IN ('6EME', '6ÈME', '5EME', '5ÈME', '4EME', '4ÈME', '3EME', '3ÈME', 
                          'SECONDE', 'PREMIERE', 'PREMIÈRE', 'TERMINALE') THEN
    RETURN 'teen'::school_class_group;
  END IF;
  
  RETURN 'primary'::school_class_group;
END;
$function$;