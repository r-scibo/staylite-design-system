-- Create composite type for pricing breakdown
CREATE TYPE public.pricing_breakdown AS (
  subtotal NUMERIC,
  service_fee NUMERIC,
  taxes NUMERIC,
  total NUMERIC
);

-- Create view for listing summaries with first photo and ratings
CREATE OR REPLACE VIEW public.listing_summary_v AS
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

-- Create function to compute booking total with breakdown
CREATE OR REPLACE FUNCTION public.fn_compute_total(
  _nights INTEGER,
  _nightly NUMERIC,
  _cleaning NUMERIC
)
RETURNS pricing_breakdown
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  _subtotal NUMERIC;
  _service_fee NUMERIC;
  _taxes NUMERIC;
  _total NUMERIC;
  _result pricing_breakdown;
BEGIN
  _subtotal := _nights * _nightly;
  _service_fee := ROUND(_subtotal * 0.12, 2);
  _taxes := ROUND(_subtotal * 0.10, 2);
  _total := _subtotal + _cleaning + _service_fee + _taxes;
  
  _result.subtotal := _subtotal;
  _result.service_fee := _service_fee;
  _result.taxes := _taxes;
  _result.total := _total;
  
  RETURN _result;
END;
$$;

-- Create function to check if date range is available
CREATE OR REPLACE FUNCTION public.fn_range_available(
  _listing_id UUID,
  _check_in DATE,
  _check_out DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Check if any dates in range are BLOCKED or BOOKED
  RETURN NOT EXISTS (
    SELECT 1
    FROM availability
    WHERE listing_id = _listing_id
      AND date >= _check_in
      AND date < _check_out
      AND status IN ('BLOCKED', 'BOOKED')
  );
END;
$$;