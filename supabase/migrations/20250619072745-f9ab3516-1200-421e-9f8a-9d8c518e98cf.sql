
-- Modifier les valeurs par défaut des colonnes d'accès dans la table profiles
ALTER TABLE public.profiles 
ALTER COLUMN hide_rdv_access SET DEFAULT false;

ALTER TABLE public.profiles 
ALTER COLUMN hide_wednesday_access SET DEFAULT false;

-- Mettre à jour les utilisateurs existants qui ont actuellement ces accès masqués
UPDATE public.profiles 
SET hide_rdv_access = false, hide_wednesday_access = false 
WHERE hide_rdv_access = true OR hide_wednesday_access = true;
