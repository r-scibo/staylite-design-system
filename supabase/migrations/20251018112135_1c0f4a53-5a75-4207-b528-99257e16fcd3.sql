-- Fix search_path for fn_compute_total
CREATE OR REPLACE FUNCTION public.fn_compute_total(
  _nights INTEGER,
  _nightly NUMERIC,
  _cleaning NUMERIC
)
RETURNS pricing_breakdown
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
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

-- Fix search_path for fn_range_available
CREATE OR REPLACE FUNCTION public.fn_range_available(
  _listing_id UUID,
  _check_in DATE,
  _check_out DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = public
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