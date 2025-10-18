-- Enable realtime for bookings table to ensure live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;