-- Update property photos with more diverse images
DO $$
DECLARE
  listing_record RECORD;
  photo_urls TEXT[];
BEGIN
  -- Define diverse photo sets for different property types
  
  -- Update photos for each listing with unique, varied images
  FOR listing_record IN 
    SELECT id, slug, property_type FROM listings WHERE city = 'Milan'
  LOOP
    -- Delete existing photos
    DELETE FROM listing_photos WHERE listing_id = listing_record.id;
    
    -- Assign unique photo sets based on slug to ensure variety
    CASE listing_record.slug
      WHEN 'test-milan-duomo-loft' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
        ];
      WHEN 'milan-navigli-canal-house' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800'
        ];
      WHEN 'brera-design-studio' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
          'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800'
        ];
      WHEN 'porta-nuova-skyline-loft' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
          'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
          'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800'
        ];
      WHEN 'navigli-waterfront-house' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
          'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'
        ];
      WHEN 'quadrilatero-fashion-suite' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
          'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800'
        ];
      WHEN 'isola-trendy-loft' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
          'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
          'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800'
        ];
      WHEN 'san-siro-football-apartment' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
          'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
          'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800'
        ];
      WHEN 'sempione-park-villa' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800',
          'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800'
        ];
      WHEN 'corso-como-chic-studio' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
          'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800'
        ];
      WHEN 'porta-romana-garden-apartment' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800',
          'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
        ];
      WHEN 'citylife-towers-view' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
          'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
          'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
          'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800'
        ];
      WHEN 'ticinese-vintage-loft' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
          'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
          'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800'
        ];
      WHEN 'lambrate-design-apartment' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600573472605-d5ebcefabf42?w=800',
          'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=800',
          'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800'
        ];
      WHEN 'centrale-business-apartment' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600566752229-250ed79470f5?w=800',
          'https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?w=800',
          'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800',
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800'
        ];
      WHEN 'magenta-quiet-cottage' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
          'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800'
        ];
      WHEN 'nolo-hip-apartment' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
          'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
          'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800'
        ];
      WHEN 'bovisa-student-studio' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800',
          'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
          'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800'
        ];
      WHEN 'moscova-bohemian-loft' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
          'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
        ];
      WHEN 'bicocca-family-house' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
          'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
          'https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?w=800',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'
        ];
      WHEN 'cinque-vie-medieval-studio' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
          'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=800',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
        ];
      WHEN 'porta-venezia-liberty-apartment' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800',
          'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
        ];
      WHEN 'sarpi-chinatown-apartment' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
          'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800'
        ];
      WHEN 'washington-residential-loft' THEN
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800',
          'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
          'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800'
        ];
      ELSE
        -- Default set for any other listings
        photo_urls := ARRAY[
          'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
          'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
          'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800'
        ];
    END CASE;
    
    -- Insert the new photo URLs
    FOR i IN 1..array_length(photo_urls, 1) LOOP
      INSERT INTO listing_photos (listing_id, url, sort_order)
      VALUES (listing_record.id, photo_urls[i], i - 1);
    END LOOP;
  END LOOP;
  
END $$;