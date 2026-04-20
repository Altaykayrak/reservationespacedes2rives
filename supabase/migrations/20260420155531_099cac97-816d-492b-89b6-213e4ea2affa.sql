ALTER TABLE public.holiday_period_class_mappings DROP CONSTRAINT IF EXISTS holiday_period_class_mappings_category_check;

ALTER TABLE public.holiday_period_class_mappings
ADD CONSTRAINT holiday_period_class_mappings_category_check
CHECK (category = ANY (ARRAY['maternelle'::text, 'primaire'::text, 'adolescent'::text, 'aucune'::text]));