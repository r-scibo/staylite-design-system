-- Add 20+ Milan properties with complete data
DO $$
DECLARE
  host_profile_id UUID;
  guest_profile_id UUID;
  listing_id UUID;
  current_date_iter DATE;
  wifi_id UUID;
  kitchen_id UUID;
  ac_id UUID;
  heating_id UUID;
  washer_id UUID;
  tv_id UUID;
  elevator_id UUID;
  workspace_id UUID;
  parking_id UUID;
  balcony_id UUID;
  pool_id UUID;
  gym_id UUID;
  pet_id UUID;
BEGIN
  -- Get host and guest profiles
  SELECT id INTO host_profile_id FROM public.profiles WHERE auth_user_id IN (SELECT id FROM auth.users WHERE email = 'host@test.com') LIMIT 1;
  SELECT id INTO guest_profile_id FROM public.profiles WHERE id != host_profile_id LIMIT 1;

  -- Get amenity IDs
  SELECT id INTO wifi_id FROM public.amenities WHERE name = 'WiFi' LIMIT 1;
  SELECT id INTO kitchen_id FROM public.amenities WHERE name = 'Kitchen' LIMIT 1;
  SELECT id INTO ac_id FROM public.amenities WHERE name = 'Air conditioning' LIMIT 1;
  SELECT id INTO heating_id FROM public.amenities WHERE name = 'Heating' LIMIT 1;
  SELECT id INTO washer_id FROM public.amenities WHERE name = 'Washer' LIMIT 1;
  SELECT id INTO tv_id FROM public.amenities WHERE name = 'TV' LIMIT 1;
  SELECT id INTO elevator_id FROM public.amenities WHERE name = 'Elevator' LIMIT 1;
  SELECT id INTO workspace_id FROM public.amenities WHERE name = 'Workspace' LIMIT 1;
  SELECT id INTO parking_id FROM public.amenities WHERE name = 'Parking' LIMIT 1;
  SELECT id INTO balcony_id FROM public.amenities WHERE name = 'Balcony' LIMIT 1;
  SELECT id INTO pool_id FROM public.amenities WHERE name = 'Pool' LIMIT 1;
  SELECT id INTO gym_id FROM public.amenities WHERE name = 'Gym' LIMIT 1;
  SELECT id INTO pet_id FROM public.amenities WHERE name = 'Pet friendly' LIMIT 1;

  -- Listing 1: Brera Design Studio
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Artistic Brera Design Studio', 'brera-design-studio', 'Milan', 'Italy', 'Via Brera 15', 'Studio', 2, 145.00, 30.00, false, 'Charming studio in the heart of Brera art district. Surrounded by galleries, boutiques, and authentic Milanese cafes. Perfect for couples seeking culture and style.', 45.4719, 9.1883, 4.8, 12);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '2 days';
  FOR i IN 1..12 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;
  
  IF guest_profile_id IS NOT NULL THEN
    INSERT INTO public.reviews (listing_id, guest_id, rating, comment, created_at) VALUES
      (listing_id, guest_profile_id, 5, 'Perfect location in Brera! The studio is beautifully designed and very comfortable.', CURRENT_TIMESTAMP - INTERVAL '20 days');
  END IF;

  -- Listing 2: Porta Nuova Modern Loft
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Porta Nuova Skyline Loft', 'porta-nuova-skyline-loft', 'Milan', 'Italy', 'Via Gaetano de Castillia 23', 'Loft', 4, 225.00, 45.00, false, 'Ultra-modern loft in Milan''s newest district with stunning skyline views. Walking distance to Corso Como and Gae Aulenti square.', 45.4850, 9.1910, 4.9, 18);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, elevator_id), (listing_id, workspace_id), (listing_id, gym_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '1 day';
  FOR i IN 1..15 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 3: Navigli Waterfront House
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Navigli Waterfront House', 'navigli-waterfront-house', 'Milan', 'Italy', 'Ripa di Porta Ticinese 55', 'House', 6, 280.00, 50.00, false, 'Spacious house directly on the famous Navigli canals. Enjoy aperitivo from your private terrace overlooking the water. 3 bedrooms, perfect for families.', 45.4470, 9.1730, 4.7, 15);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, washer_id), (listing_id, balcony_id), (listing_id, pet_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '3 days';
  FOR i IN 1..10 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 4: Quadrilatero Fashion Apartment
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Quadrilatero della Moda Suite', 'quadrilatero-fashion-suite', 'Milan', 'Italy', 'Via Monte Napoleone 8', 'Apartment', 3, 295.00, 40.00, false, 'Luxury apartment in the golden rectangle of fashion. Steps from Armani, Prada, and Versace. High-end finishes and impeccable style.', 45.4685, 9.1960, 4.9, 22);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, elevator_id), (listing_id, workspace_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '4 days';
  FOR i IN 1..14 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 5: Isola Trendy Loft
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Isola Neighborhood Trendy Loft', 'isola-trendy-loft', 'Milan', 'Italy', 'Via Pastrengo 12', 'Loft', 4, 175.00, 38.00, false, 'Hip loft in the vibrant Isola district. Surrounded by street art, vintage shops, and local trattorias. A true Milanese experience.', 45.4920, 9.1890, 4.6, 14);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, washer_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '5 days';
  FOR i IN 1..11 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 6: San Siro Stadium Apartment
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'San Siro Football Fan Apartment', 'san-siro-football-apartment', 'Milan', 'Italy', 'Via dei Piccolomini 5', 'Apartment', 4, 135.00, 32.00, false, 'Perfect for football fans! Just 10 minutes walk from San Siro stadium. Cozy 2-bedroom apartment with sports memorabilia.', 45.4780, 9.1240, 4.5, 9);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, heating_id), (listing_id, tv_id), (listing_id, parking_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '2 days';
  FOR i IN 1..13 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 7: Sempione Park Villa
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Sempione Park Elegant Villa', 'sempione-park-villa', 'Milan', 'Italy', 'Via Palermo 16', 'Villa', 8, 420.00, 65.00, true, 'Stunning villa overlooking Parco Sempione and Castello Sforzesco. 4 bedrooms, private garden, luxury amenities. Perfect for large groups.', 45.4740, 9.1760, 4.9, 11);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, washer_id), (listing_id, tv_id), (listing_id, parking_id), (listing_id, balcony_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '7 days';
  FOR i IN 1..10 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 8: Corso Como Boutique Studio
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Corso Como Chic Studio', 'corso-como-chic-studio', 'Milan', 'Italy', 'Corso Como 10', 'Studio', 2, 165.00, 28.00, false, 'Stylish studio on famous Corso Como street. Nightlife, shopping, and restaurants at your doorstep. Modern design with vintage touches.', 45.4810, 9.1880, 4.7, 16);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '1 day';
  FOR i IN 1..12 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 9: Porta Romana Garden Apartment
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Porta Romana Garden Retreat', 'porta-romana-garden-apartment', 'Milan', 'Italy', 'Viale Sabotino 18', 'Apartment', 4, 185.00, 38.00, false, 'Peaceful apartment with private garden in residential Porta Romana. Close to Fondazione Prada and transport. Ground floor, family-friendly.', 45.4490, 9.2060, 4.6, 13);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, washer_id), (listing_id, balcony_id), (listing_id, pet_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '3 days';
  FOR i IN 1..11 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 10: CityLife Towers View
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'CityLife Towers Panoramic Apartment', 'citylife-towers-view', 'Milan', 'Italy', 'Piazza Tre Torri 3', 'Apartment', 3, 215.00, 42.00, false, 'Modern apartment with breathtaking views of the three CityLife towers. Brand new building with gym, concierge, and shopping mall below.', 45.4790, 9.1580, 4.8, 17);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, elevator_id), (listing_id, workspace_id), (listing_id, gym_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '2 days';
  FOR i IN 1..14 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 11: Ticinese Vintage Loft
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Ticinese Vintage Industrial Loft', 'ticinese-vintage-loft', 'Milan', 'Italy', 'Via Vigevano 8', 'Loft', 5, 195.00, 40.00, false, 'Converted factory loft with exposed brick and high ceilings. In the heart of Ticinese nightlife. 2 bedrooms plus sofa bed.', 45.4490, 9.1710, 4.7, 19);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, washer_id), (listing_id, workspace_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '4 days';
  FOR i IN 1..12 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 12: Lambrate Design District Apartment
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Lambrate Design Week Apartment', 'lambrate-design-apartment', 'Milan', 'Italy', 'Via Conte Rosso 12', 'Apartment', 3, 125.00, 30.00, false, 'Creative apartment in the emerging Lambrate design district. Perfect during Salone del Mobile. Artistic vibe with convenient metro access.', 45.4870, 9.2290, 4.5, 8);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, heating_id), (listing_id, workspace_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '5 days';
  FOR i IN 1..10 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 13: Centrale Station Business Apartment
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Milano Centrale Business Hub', 'centrale-business-apartment', 'Milan', 'Italy', 'Via Vitruvio 43', 'Apartment', 2, 155.00, 32.00, false, 'Efficient apartment steps from Central Station. Perfect for business travelers. Fast WiFi, desk workspace, and excellent transport links.', 45.4860, 9.2040, 4.6, 21);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, elevator_id), (listing_id, workspace_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '1 day';
  FOR i IN 1..15 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 14: Magenta Quiet Cottage
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Magenta Quiet Residential Cottage', 'magenta-quiet-cottage', 'Milan', 'Italy', 'Via San Vittore 25', 'Cottage', 4, 165.00, 35.00, false, 'Charming cottage in quiet residential area near Santa Maria delle Grazie. Garden, parking, and authentic local atmosphere.', 45.4640, 9.1700, 4.7, 10);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, heating_id), (listing_id, parking_id), (listing_id, balcony_id), (listing_id, pet_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '6 days';
  FOR i IN 1..11 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 15: NoLo (North of Loreto) Hip Apartment
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'NoLo Multicultural Hip Apartment', 'nolo-hip-apartment', 'Milan', 'Italy', 'Via Padova 88', 'Apartment', 3, 115.00, 28.00, false, 'Discover Milan''s most multicultural neighborhood! Authentic street food, vintage markets, and local art scene. Budget-friendly and unique.', 45.5000, 9.2190, 4.4, 7);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, heating_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '3 days';
  FOR i IN 1..13 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 16: Bovisa University District Studio
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Bovisa Student District Modern Studio', 'bovisa-student-studio', 'Milan', 'Italy', 'Via Bovisasca 50', 'Studio', 2, 98.00, 25.00, false, 'Affordable studio near Politecnico university. Young, vibrant area with cafes and student nightlife. Great value for money.', 45.5070, 9.1590, 4.3, 6);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, heating_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '2 days';
  FOR i IN 1..14 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 17: Moscova Bohemian Loft
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Moscova Bohemian Artist Loft', 'moscova-bohemian-loft', 'Milan', 'Italy', 'Via Solferino 11', 'Loft', 3, 188.00, 36.00, false, 'Artistic loft with original frescoes and bohemian decor. Near Brera and Garibaldi. High ceilings and natural light. Inspiring space.', 45.4760, 9.1870, 4.8, 14);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, workspace_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '4 days';
  FOR i IN 1..12 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 18: Bicocca University Area House
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Bicocca Family-Friendly House', 'bicocca-family-house', 'Milan', 'Italy', 'Viale Sarca 185', 'House', 6, 195.00, 45.00, false, 'Spacious house near Bicocca university and Hangar Bicocca art center. 3 bedrooms, garden, parking. Quiet residential area with good transport.', 45.5200, 9.2110, 4.6, 11);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, heating_id), (listing_id, washer_id), (listing_id, parking_id), (listing_id, balcony_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '5 days';
  FOR i IN 1..10 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 19: Cinque Vie Medieval Studio
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Cinque Vie Historic Medieval Studio', 'cinque-vie-medieval-studio', 'Milan', 'Italy', 'Via Torino 28', 'Studio', 2, 158.00, 30.00, false, 'Romantic studio in Milan''s medieval heart. Original stone walls and vaulted ceilings. Steps from Duomo, hidden in charming alleyway.', 45.4620, 9.1850, 4.9, 15);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '1 day';
  FOR i IN 1..11 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 20: Porta Venezia Liberty Apartment
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Porta Venezia Art Nouveau Apartment', 'porta-venezia-liberty-apartment', 'Milan', 'Italy', 'Corso Buenos Aires 33', 'Apartment', 4, 175.00, 38.00, false, 'Beautiful Art Nouveau apartment with original Liberty-style details. On Milan''s longest shopping street. 2 bedrooms, elegant and central.', 45.4780, 9.2050, 4.7, 13);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, elevator_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '3 days';
  FOR i IN 1..12 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 21: Sarpi Chinatown Experience
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Sarpi Chinatown Cultural Apartment', 'sarpi-chinatown-apartment', 'Milan', 'Italy', 'Via Paolo Sarpi 65', 'Apartment', 3, 135.00, 32.00, false, 'Immerse yourself in Milan''s vibrant Chinatown! Surrounded by authentic Asian restaurants, shops, and markets. Unique cultural experience.', 45.4820, 9.1760, 4.5, 9);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, heating_id), (listing_id, washer_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '2 days';
  FOR i IN 1..13 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

  -- Listing 22: Washington Residential Loft
  listing_id := gen_random_uuid();
  INSERT INTO public.listings (id, host_id, title, slug, city, country, address, property_type, max_guests, base_price, cleaning_fee, host_approval_required, description, lat, lng, rating_avg, rating_count)
  VALUES (listing_id, host_profile_id, 'Washington Green Residential Loft', 'washington-residential-loft', 'Milan', 'Italy', 'Via Washington 70', 'Loft', 4, 205.00, 40.00, false, 'Modern loft in upscale residential area. Close to Fiera Milano convention center. Quiet, elegant, with nearby parks and restaurants.', 45.4610, 9.1650, 4.8, 12);
  
  INSERT INTO public.listing_photos (listing_id, url, sort_order) VALUES
    (listing_id, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 0),
    (listing_id, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 1),
    (listing_id, 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 2);
  
  INSERT INTO public.listing_amenities (listing_id, amenity_id) VALUES (listing_id, wifi_id), (listing_id, kitchen_id), (listing_id, ac_id), (listing_id, heating_id), (listing_id, elevator_id), (listing_id, workspace_id), (listing_id, parking_id);
  
  current_date_iter := CURRENT_DATE + INTERVAL '4 days';
  FOR i IN 1..11 LOOP INSERT INTO public.availability (listing_id, date, status) VALUES (listing_id, current_date_iter, 'OPEN'::availability_status); current_date_iter := current_date_iter + INTERVAL '1 day'; END LOOP;

END $$;