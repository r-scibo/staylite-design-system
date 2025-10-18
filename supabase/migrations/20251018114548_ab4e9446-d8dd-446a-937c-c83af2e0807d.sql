-- Seed amenities
INSERT INTO public.amenities (name, icon) VALUES
  ('WiFi', 'wifi'),
  ('Kitchen', 'utensils'),
  ('Air conditioning', 'wind'),
  ('Heating', 'flame'),
  ('Washer', 'washing-machine'),
  ('Dryer', 'wind'),
  ('TV', 'tv'),
  ('Parking', 'car'),
  ('Pool', 'waves'),
  ('Hot tub', 'bath'),
  ('Gym', 'dumbbell'),
  ('Elevator', 'arrow-up'),
  ('Workspace', 'briefcase'),
  ('Pet friendly', 'dog'),
  ('Balcony', 'home')
ON CONFLICT DO NOTHING;

-- Get host profile ID for host@test.com
DO $$
DECLARE
  host_profile_id UUID;
  listing1_id UUID;
  listing2_id UUID;
  listing3_id UUID;
  listing4_id UUID;
  listing5_id UUID;
  listing6_id UUID;
  guest_profile_id UUID;
  current_date_iter DATE;
BEGIN
  -- Get host profile
  SELECT id INTO host_profile_id
  FROM public.profiles
  WHERE auth_user_id IN (
    SELECT id FROM auth.users WHERE email = 'host@test.com'
  )
  LIMIT 1;

  -- Get a guest profile for reviews (use first non-host profile)
  SELECT id INTO guest_profile_id
  FROM public.profiles
  WHERE id != host_profile_id
  LIMIT 1;

  IF host_profile_id IS NULL THEN
    RAISE EXCEPTION 'Host profile not found. Please ensure host@test.com user exists.';
  END IF;

  -- Create Listing 1: TEST—Milan Duomo Loft (EXACT name, host approval required)
  listing1_id := gen_random_uuid();
  INSERT INTO public.listings (
    id, host_id, title, slug, city, country, address,
    property_type, max_guests, base_price, cleaning_fee,
    host_approval_required, description, lat, lng,
    rating_avg, rating_count
  ) VALUES (
    listing1_id, host_profile_id,
    'TEST—Milan Duomo Loft',
    'test-milan-duomo-loft',
    'Milan', 'Italy', 'Via del Duomo 5',
    'Apartment', 4, 185.00, 35.00,
    true,
    'Stunning loft apartment in the heart of Milan, steps from the iconic Duomo. This spacious 2-bedroom loft features high ceilings, modern amenities, and breathtaking views of the cathedral.',
    45.4642, 9.1900,
    4.8, 3
  );

  -- Photos for Listing 1
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing1_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing1_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1),
    (listing1_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 2),
    (listing1_id, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 3);

  -- Amenities for Listing 1
  INSERT INTO public.listing_amenities (listing_id, amenity_id)
  SELECT listing1_id, id FROM public.amenities
  WHERE name IN ('WiFi', 'Kitchen', 'Air conditioning', 'Heating', 'Washer', 'TV', 'Elevator', 'Workspace');

  -- Availability for Listing 1 (≥10 OPEN dates + some BLOCKED)
  current_date_iter := CURRENT_DATE + INTERVAL '5 days';
  FOR i IN 1..15 LOOP
    INSERT INTO public.availability (listing_id, date, status)
    VALUES (
      listing1_id,
      current_date_iter,
      CASE WHEN i IN (3, 7, 12) THEN 'BLOCKED'::availability_status ELSE 'OPEN'::availability_status END
    );
    current_date_iter := current_date_iter + INTERVAL '1 day';
  END LOOP;

  -- Reviews for Listing 1 (≥3 reviews)
  IF guest_profile_id IS NOT NULL THEN
    INSERT INTO public.reviews (listing_id, guest_id, rating, comment, created_at) VALUES
      (listing1_id, guest_profile_id, 5, 'Absolutely perfect location! The view of the Duomo from the windows is incredible. The loft is spacious, clean, and has everything you need.', CURRENT_TIMESTAMP - INTERVAL '45 days'),
      (listing1_id, guest_profile_id, 5, 'Amazing stay in Milan! The host was very responsive and the apartment exceeded our expectations. Highly recommend!', CURRENT_TIMESTAMP - INTERVAL '30 days'),
      (listing1_id, guest_profile_id, 4, 'Great apartment in an unbeatable location. Only minor issue was some street noise at night, but the location makes up for it.', CURRENT_TIMESTAMP - INTERVAL '15 days');
  END IF;

  -- Create Listing 2: Milan Navigli Canal House
  listing2_id := gen_random_uuid();
  INSERT INTO public.listings (
    id, host_id, title, slug, city, country, address,
    property_type, max_guests, base_price, cleaning_fee,
    host_approval_required, description, lat, lng,
    rating_avg, rating_count
  ) VALUES (
    listing2_id, host_profile_id,
    'Charming House by Navigli Canals',
    'milan-navigli-canal-house',
    'Milan', 'Italy', 'Alzaia Naviglio Grande 42',
    'House', 6, 220.00, 45.00,
    false,
    'Beautiful traditional house along the historic Navigli canals. Perfect for families or groups, with 3 bedrooms and a lovely terrace overlooking the water.',
    45.4484, 9.1696,
    4.6, 8
  );

  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing2_id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 0),
    (listing2_id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
    (listing2_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 2);

  INSERT INTO public.listing_amenities (listing_id, amenity_id)
  SELECT listing2_id, id FROM public.amenities
  WHERE name IN ('WiFi', 'Kitchen', 'Air conditioning', 'Washer', 'Dryer', 'TV', 'Balcony', 'Pet friendly');

  current_date_iter := CURRENT_DATE + INTERVAL '3 days';
  FOR i IN 1..10 LOOP
    INSERT INTO public.availability (listing_id, date, status)
    VALUES (listing2_id, current_date_iter, 'OPEN'::availability_status);
    current_date_iter := current_date_iter + INTERVAL '1 day';
  END LOOP;

  -- Create Listing 3: Rome Colosseum View
  listing3_id := gen_random_uuid();
  INSERT INTO public.listings (
    id, host_id, title, slug, city, country, address,
    property_type, max_guests, base_price, cleaning_fee,
    host_approval_required, description, lat, lng,
    rating_avg, rating_count
  ) VALUES (
    listing3_id, host_profile_id,
    'Colosseum View Luxury Apartment',
    'rome-colosseum-view-apartment',
    'Rome', 'Italy', 'Via dei Fori Imperiali 12',
    'Apartment', 4, 195.00, 40.00,
    false,
    'Stunning apartment with panoramic views of the Colosseum. Modern, elegant interiors in the heart of ancient Rome.',
    41.8902, 12.4924,
    4.9, 12
  );

  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing3_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 0),
    (listing3_id, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 1),
    (listing3_id, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 2);

  INSERT INTO public.listing_amenities (listing_id, amenity_id)
  SELECT listing3_id, id FROM public.amenities
  WHERE name IN ('WiFi', 'Kitchen', 'Air conditioning', 'Heating', 'TV', 'Elevator', 'Workspace');

  current_date_iter := CURRENT_DATE + INTERVAL '2 days';
  FOR i IN 1..8 LOOP
    INSERT INTO public.availability (listing_id, date, status)
    VALUES (listing3_id, current_date_iter, 'OPEN'::availability_status);
    current_date_iter := current_date_iter + INTERVAL '1 day';
  END LOOP;

  -- Create Listing 4: Florence Historic Center
  listing4_id := gen_random_uuid();
  INSERT INTO public.listings (
    id, host_id, title, slug, city, country, address,
    property_type, max_guests, base_price, cleaning_fee,
    host_approval_required, description, lat, lng,
    rating_avg, rating_count
  ) VALUES (
    listing4_id, host_profile_id,
    'Renaissance Palazzo Suite',
    'florence-renaissance-palazzo',
    'Florence', 'Italy', 'Via dei Calzaiuoli 28',
    'Apartment', 2, 165.00, 30.00,
    false,
    'Elegant suite in a historic palazzo, walking distance to the Duomo and Uffizi Gallery. Experience Renaissance Florence in style.',
    43.7696, 11.2558,
    4.7, 15
  );

  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing4_id, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', 0),
    (listing4_id, 'https://images.unsplash.com/photo-1600573472556-265f5d0a64c8?w=800', 1),
    (listing4_id, 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800', 2);

  INSERT INTO public.listing_amenities (listing_id, amenity_id)
  SELECT listing4_id, id FROM public.amenities
  WHERE name IN ('WiFi', 'Kitchen', 'Air conditioning', 'Heating', 'Washer', 'TV');

  current_date_iter := CURRENT_DATE + INTERVAL '4 days';
  FOR i IN 1..9 LOOP
    INSERT INTO public.availability (listing_id, date, status)
    VALUES (listing4_id, current_date_iter, 'OPEN'::availability_status);
    current_date_iter := current_date_iter + INTERVAL '1 day';
  END LOOP;

  -- Create Listing 5: Venice Canal Studio
  listing5_id := gen_random_uuid();
  INSERT INTO public.listings (
    id, host_id, title, slug, city, country, address,
    property_type, max_guests, base_price, cleaning_fee,
    host_approval_required, description, lat, lng,
    rating_avg, rating_count
  ) VALUES (
    listing5_id, host_profile_id,
    'Romantic Venice Canal Studio',
    'venice-canal-studio',
    'Venice', 'Italy', 'Calle Larga San Marco 789',
    'Studio', 2, 145.00, 25.00,
    false,
    'Cozy studio apartment overlooking a picturesque Venice canal. Perfect for couples seeking a romantic getaway.',
    45.4408, 12.3155,
    4.5, 9
  );

  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing5_id, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 0),
    (listing5_id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
    (listing5_id, 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800', 2);

  INSERT INTO public.listing_amenities (listing_id, amenity_id)
  SELECT listing5_id, id FROM public.amenities
  WHERE name IN ('WiFi', 'Kitchen', 'Air conditioning', 'Heating', 'TV');

  current_date_iter := CURRENT_DATE + INTERVAL '6 days';
  FOR i IN 1..7 LOOP
    INSERT INTO public.availability (listing_id, date, status)
    VALUES (listing5_id, current_date_iter, 'OPEN'::availability_status);
    current_date_iter := current_date_iter + INTERVAL '1 day';
  END LOOP;

  -- Create Listing 6: Turin Modern Loft
  listing6_id := gen_random_uuid();
  INSERT INTO public.listings (
    id, host_id, title, slug, city, country, address,
    property_type, max_guests, base_price, cleaning_fee,
    host_approval_required, description, lat, lng,
    rating_avg, rating_count
  ) VALUES (
    listing6_id, host_profile_id,
    'Contemporary Turin Design Loft',
    'turin-modern-design-loft',
    'Turin', 'Italy', 'Via Roma 156',
    'Loft', 5, 175.00, 38.00,
    false,
    'Sleek, modern loft in central Turin with designer furniture and all amenities. Great for business or leisure stays.',
    45.0703, 7.6869,
    4.6, 7
  );

  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing6_id, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 0),
    (listing6_id, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 1),
    (listing6_id, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 2);

  INSERT INTO public.listing_amenities (listing_id, amenity_id)
  SELECT listing6_id, id FROM public.amenities
  WHERE name IN ('WiFi', 'Kitchen', 'Air conditioning', 'Heating', 'Washer', 'Dryer', 'TV', 'Elevator', 'Workspace', 'Gym');

  current_date_iter := CURRENT_DATE + INTERVAL '1 day';
  FOR i IN 1..10 LOOP
    INSERT INTO public.availability (listing_id, date, status)
    VALUES (listing6_id, current_date_iter, 'OPEN'::availability_status);
    current_date_iter := current_date_iter + INTERVAL '1 day';
  END LOOP;

END $$;