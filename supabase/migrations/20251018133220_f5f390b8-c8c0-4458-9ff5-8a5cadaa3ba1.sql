-- Set default to require host approval for all listings
ALTER TABLE public.listings 
ALTER COLUMN host_approval_required SET DEFAULT true;

-- Update all existing listings to require host approval
UPDATE public.listings 
SET host_approval_required = true 
WHERE host_approval_required = false;