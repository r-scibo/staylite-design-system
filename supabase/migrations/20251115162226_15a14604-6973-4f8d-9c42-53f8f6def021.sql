-- Allow anyone to view basic profile info (names) for public features like reviews
CREATE POLICY "Anyone can view profile names"
ON public.profiles
FOR SELECT
USING (true);