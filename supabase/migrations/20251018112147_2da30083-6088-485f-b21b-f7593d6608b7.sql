-- Recreate view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.listing_summary_v;

CREATE VIEW public.listing_summary_v 
WITH (security_invoker = true)
AS
SELECT 
  l.id,
  l.title,
  l.slug,
  l.city,
  l.country,
  l.property_type,
  l.max_guests,
  l.base_price,
  l.cleaning_fee,
  l.rating_avg,
  l.rating_count,
  l.host_id,
  l.host_approval_required,
  COALESCE(
    (SELECT url 
     FROM listing_photos 
     WHERE listing_id = l.id 
     ORDER BY sort_order 
     LIMIT 1),
    ''
  ) AS first_photo_url
FROM listings l;