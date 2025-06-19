
-- Mettre à jour la fonction handle_new_user pour définir explicitement les accès par défaut
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    automatic_payment,
    accepted_cgu,
    hide_rdv_access,
    hide_wednesday_access
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'firstName',
    new.raw_user_meta_data->>'lastName',
    COALESCE((new.raw_user_meta_data->>'automaticPayment')::boolean, false),
    COALESCE((new.raw_user_meta_data->>'acceptedCgu')::boolean, false),
    false,
    false
  );
  RETURN new;
END;
$$;
