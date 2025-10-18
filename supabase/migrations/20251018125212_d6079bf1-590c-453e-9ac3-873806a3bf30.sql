-- Create storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-photos',
  'listing-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- RLS policies for listing photos bucket
CREATE POLICY "Anyone can view listing photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-photos');

CREATE POLICY "Hosts can upload listing photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-photos' 
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'Host')
);

CREATE POLICY "Hosts can update their own listing photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-photos'
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'Host')
);

CREATE POLICY "Hosts can delete their own listing photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-photos'
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'Host')
);