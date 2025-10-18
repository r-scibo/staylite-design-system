-- 1. Create enums for availability and booking status
CREATE TYPE public.availability_status AS ENUM ('OPEN', 'BLOCKED', 'BOOKED');
CREATE TYPE public.booking_status AS ENUM ('PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED');
CREATE TYPE public.property_type AS ENUM ('apartment', 'house', 'villa', 'studio', 'loft');

-- 2. Create listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Italy',
  address TEXT,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  property_type TEXT NOT NULL,
  max_guests INTEGER NOT NULL CHECK (max_guests > 0),
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  cleaning_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cleaning_fee >= 0),
  rating_avg NUMERIC(3,2) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
  description TEXT,
  host_approval_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_city ON public.listings(city);
CREATE INDEX idx_listings_slug ON public.listings(slug);
CREATE INDEX idx_listings_host_id ON public.listings(host_id);

-- 3. Create listing_photos table
CREATE TABLE public.listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_photos_listing_id ON public.listing_photos(listing_id);

-- 4. Create amenities table
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create listing_amenities junction table
CREATE TABLE public.listing_amenities (
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

-- 6. Create availability table
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status availability_status NOT NULL DEFAULT 'OPEN',
  price_override NUMERIC(10,2) CHECK (price_override IS NULL OR price_override >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, date)
);

CREATE INDEX idx_availability_listing_date ON public.availability(listing_id, date);

-- 7. Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL CHECK (guests_count > 0),
  nightly_price NUMERIC(10,2) NOT NULL CHECK (nightly_price >= 0),
  cleaning_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cleaning_fee >= 0),
  service_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  taxes NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (taxes >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status booking_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);

CREATE INDEX idx_bookings_listing_id ON public.bookings(listing_id);
CREATE INDEX idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_listing_status ON public.bookings(listing_id, status);

-- 8. Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

CREATE INDEX idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX idx_reviews_guest_id ON public.reviews(guest_id);

-- 9. Add triggers for updated_at
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. Enable RLS on all tables
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for listings (public read, host write)
CREATE POLICY "Anyone can view listings"
  ON public.listings FOR SELECT
  USING (true);

CREATE POLICY "Hosts can create their own listings"
  ON public.listings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'Host') AND host_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Hosts can update their own listings"
  ON public.listings FOR UPDATE
  USING (host_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Hosts can delete their own listings"
  ON public.listings FOR DELETE
  USING (host_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  ));

-- 12. RLS Policies for listing_photos (follow listing permissions)
CREATE POLICY "Anyone can view listing photos"
  ON public.listing_photos FOR SELECT
  USING (true);

CREATE POLICY "Hosts can manage their listing photos"
  ON public.listing_photos FOR ALL
  USING (listing_id IN (
    SELECT id FROM public.listings 
    WHERE host_id IN (
      SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
  ));

-- 13. RLS Policies for amenities (public read, no client write)
CREATE POLICY "Anyone can view amenities"
  ON public.amenities FOR SELECT
  USING (true);

-- 14. RLS Policies for listing_amenities (follow listing permissions)
CREATE POLICY "Anyone can view listing amenities"
  ON public.listing_amenities FOR SELECT
  USING (true);

CREATE POLICY "Hosts can manage their listing amenities"
  ON public.listing_amenities FOR ALL
  USING (listing_id IN (
    SELECT id FROM public.listings 
    WHERE host_id IN (
      SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
  ));

-- 15. RLS Policies for availability (public read, host write)
CREATE POLICY "Anyone can view availability"
  ON public.availability FOR SELECT
  USING (true);

CREATE POLICY "Hosts can manage their listing availability"
  ON public.availability FOR ALL
  USING (listing_id IN (
    SELECT id FROM public.listings 
    WHERE host_id IN (
      SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
  ));

-- 16. RLS Policies for bookings (guest/host access)
CREATE POLICY "Guests can view their own bookings"
  ON public.bookings FOR SELECT
  USING (guest_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Hosts can view bookings for their listings"
  ON public.bookings FOR SELECT
  USING (listing_id IN (
    SELECT id FROM public.listings 
    WHERE host_id IN (
      SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Guests can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (guest_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Hosts can update bookings for their listings"
  ON public.bookings FOR UPDATE
  USING (listing_id IN (
    SELECT id FROM public.listings 
    WHERE host_id IN (
      SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Guests can cancel their own bookings"
  ON public.bookings FOR UPDATE
  USING (
    guest_id IN (
      SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
    AND status IN ('PENDING', 'CONFIRMED')
  )
  WITH CHECK (status = 'CANCELLED');

-- 17. RLS Policies for reviews (public read, guest write)
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Guests can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    guest_id IN (
      SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
    )
    AND booking_id IN (
      SELECT id FROM public.bookings 
      WHERE guest_id IN (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
      )
      AND status = 'CONFIRMED'
    )
  );

CREATE POLICY "Guests can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (guest_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Guests can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (guest_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  ));