-- Fix classification: GS must be counted as kindergarten (maternelle)
CREATE OR REPLACE FUNCTION public.get_school_class_group_for_period(
  p_period_id uuid,
  p_school_class text
) RETURNS school_class_group
LANGUAGE plpgsql
AS $function$
DECLARE
  normalized_class text;
  period_name text;
  is_summer_period boolean := false;
BEGIN
  -- Normalize school class
  normalized_class := UPPER(TRIM(p_school_class));
  
  -- Get period name to check for summer specific rule
  SELECT name INTO period_name 
  FROM public.available_holiday_periods 
  WHERE id = p_period_id;
  
  -- Identify summer period (for CM2 special rule only)
  IF period_name IN ('ETE-01', 'ETE-02', 'ETE-03', 'ETE-04') THEN
    is_summer_period := true;
  END IF;
  
  -- Kindergarten (Maternelle): PS, MS, GS
  IF normalized_class IN ('PS', 'MS', 'GS', 'PETITE SECTION', 'MOYENNE SECTION', 'GRANDE SECTION') THEN
    RETURN 'kindergarten'::school_class_group;
  END IF;
  
  -- Primary (Primaire): CP, CE1, CE2, CM1, CM2 (handled below for CM2)
  IF normalized_class IN ('CP', 'CE1', 'CE2', 'CM1') THEN
    RETURN 'primary'::school_class_group;
  END IF;
  
  -- CM2 - Special rule for summer
  IF normalized_class = 'CM2' THEN
    IF is_summer_period THEN
      RETURN 'teen'::school_class_group;  -- Summer periods → Teen
    ELSE
      RETURN 'primary'::school_class_group;  -- Other periods → Primary
    END IF;
  END IF;
  
  -- Teen (Adolescent): 6ème to Terminale
  IF normalized_class IN ('6EME', '6ÈME', '5EME', '5ÈME', '4EME', '4ÈME', '3EME', '3ÈME', 
                          'SECONDE', 'PREMIERE', 'PREMIÈRE', 'TERMINALE') THEN
    RETURN 'teen'::school_class_group;
  END IF;
  
  -- Default: primary for unknown classes
  RETURN 'primary'::school_class_group;
END;
$function$;