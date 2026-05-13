ALTER TABLE public.waitlist
ADD COLUMN IF NOT EXISTS without_meal boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS early_dropoff boolean NOT NULL DEFAULT false;