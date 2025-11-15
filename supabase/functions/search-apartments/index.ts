import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { location, checkIn, checkOut, guests, minPrice, maxPrice, propertyType } = await req.json();

    console.log('Search request:', { location, checkIn, checkOut, guests, minPrice, maxPrice, propertyType });

    // Build query
    let query = supabase
      .from('listing_summary_v')
      .select('*');

    // Filter by location (case-insensitive city match)
    if (location) {
      query = query.ilike('city', `%${location}%`);
    }

    // Filter by guests capacity
    if (guests) {
      query = query.gte('max_guests', guests);
    }

    // Filter by price range
    if (minPrice) {
      query = query.gte('base_price', minPrice);
    }
    if (maxPrice) {
      query = query.lte('base_price', maxPrice);
    }

    // Filter by property type
    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }

    const { data: listings, error: listingsError } = await query;

    if (listingsError) {
      console.error('Listings query error:', listingsError);
      throw listingsError;
    }

    // If dates provided, filter by availability
    let availableListings = listings || [];
    if (checkIn && checkOut && listings && listings.length > 0) {
      const listingIds = listings.map(l => l.id);
      
      const { data: blockedAvailability, error: availError } = await supabase
        .from('availability')
        .select('listing_id')
        .in('listing_id', listingIds)
        .gte('date', checkIn)
        .lt('date', checkOut)
        .in('status', ['BLOCKED', 'BOOKED']);

      if (availError) {
        console.error('Availability query error:', availError);
      } else {
        const blockedListingIds = new Set(blockedAvailability?.map(a => a.listing_id) || []);
        availableListings = listings.filter(l => !blockedListingIds.has(l.id));
      }
    }

    // Format response for ElevenLabs
    const formattedResults = availableListings.map(listing => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      city: listing.city,
      country: listing.country,
      propertyType: listing.property_type,
      maxGuests: listing.max_guests,
      pricePerNight: listing.base_price,
      cleaningFee: listing.cleaning_fee,
      rating: listing.rating_avg,
      reviewCount: listing.rating_count,
      photoUrl: listing.first_photo_url,
      requiresHostApproval: listing.host_approval_required,
      detailsUrl: `${req.headers.get('origin') || 'https://staylite.lovable.app'}/listing/${listing.slug}`
    }));

    return new Response(
      JSON.stringify({
        success: true,
        count: formattedResults.length,
        listings: formattedResults,
        message: formattedResults.length > 0 
          ? `Found ${formattedResults.length} available properties` 
          : 'No properties found matching your criteria'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
