-- Create RPC function for host to update booking status
CREATE OR REPLACE FUNCTION public.fn_host_update_booking_status(
  _booking_id UUID,
  _new_status booking_status
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _listing_id UUID;
  _host_profile_id UUID;
  _check_in DATE;
  _check_out DATE;
  _current_date DATE;
BEGIN
  -- Get the host's profile ID
  SELECT id INTO _host_profile_id
  FROM profiles
  WHERE auth_user_id = auth.uid();

  IF _host_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Get booking details and verify ownership
  SELECT b.listing_id, b.check_in, b.check_out
  INTO _listing_id, _check_in, _check_out
  FROM bookings b
  INNER JOIN listings l ON l.id = b.listing_id
  WHERE b.id = _booking_id
    AND l.host_id = _host_profile_id;

  IF _listing_id IS NULL THEN
    RAISE EXCEPTION 'Booking not found or you do not own this listing';
  END IF;

  -- Update booking status
  UPDATE bookings
  SET status = _new_status, updated_at = now()
  WHERE id = _booking_id;

  -- Handle availability updates based on new status
  IF _new_status = 'CONFIRMED' THEN
    -- Mark dates as BOOKED
    _current_date := _check_in;
    WHILE _current_date < _check_out LOOP
      INSERT INTO availability (listing_id, date, status)
      VALUES (_listing_id, _current_date, 'BOOKED')
      ON CONFLICT (listing_id, date)
      DO UPDATE SET status = 'BOOKED';
      
      _current_date := _current_date + INTERVAL '1 day';
    END LOOP;

  ELSIF _new_status IN ('DECLINED', 'CANCELLED') THEN
    -- Re-open dates to OPEN if no other confirmed bookings overlap
    _current_date := _check_in;
    WHILE _current_date < _check_out LOOP
      -- Check if there are any other confirmed bookings for this date
      IF NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.listing_id = _listing_id
          AND b.id != _booking_id
          AND b.status = 'CONFIRMED'
          AND _current_date >= b.check_in
          AND _current_date < b.check_out
      ) THEN
        -- No overlap, mark as OPEN
        INSERT INTO availability (listing_id, date, status)
        VALUES (_listing_id, _current_date, 'OPEN')
        ON CONFLICT (listing_id, date)
        DO UPDATE SET status = 'OPEN';
      END IF;
      
      _current_date := _current_date + INTERVAL '1 day';
    END LOOP;
  END IF;
END;
$$;