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

    const { listingId, slug, checkIn, checkOut } = await req.json();

    console.log('Get listing details:', { listingId, slug, checkIn, checkOut });

    // Get listing by ID or slug
    let query = supabase
      .from('listings')
      .select('*, listing_photos(url, sort_order)');

    if (listingId) {
      query = query.eq('id', listingId);
    } else if (slug) {
      query = query.eq('slug', slug);
    } else {
      throw new Error('Either listingId or slug is required');
    }

    const { data: listing, error: listingError } = await query.single();

    if (listingError) {
      console.error('Listing query error:', listingError);
      throw listingError;
    }

    // Get amenities
    const { data: amenities } = await supabase
      .from('listing_amenities')
      .select('amenity_id, amenities(name, icon)')
      .eq('listing_id', listing.id);

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, comment, created_at, profiles(name)')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Check availability if dates provided
    let isAvailable = true;
    let availabilityMessage = '';
    if (checkIn && checkOut) {
      const { data: blockedDates } = await supabase
        .from('availability')
        .select('date, status')
        .eq('listing_id', listing.id)
        .gte('date', checkIn)
        .lt('date', checkOut)
        .in('status', ['BLOCKED', 'BOOKED']);

      isAvailable = !blockedDates || blockedDates.length === 0;
      availabilityMessage = isAvailable 
        ? `Available for ${checkIn} to ${checkOut}` 
        : `Not available for selected dates`;
    }

    // Format response
    const formattedListing = {
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      description: listing.description,
      city: listing.city,
      country: listing.country,
      address: listing.address,
      propertyType: listing.property_type,
      maxGuests: listing.max_guests,
      pricePerNight: listing.base_price,
      cleaningFee: listing.cleaning_fee,
      rating: listing.rating_avg,
      reviewCount: listing.rating_count,
      requiresHostApproval: listing.host_approval_required,
      photos: listing.listing_photos?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((p: any) => p.url) || [],
      amenities: amenities?.map((a: any) => ({
        name: a.amenities.name,
        icon: a.amenities.icon
      })) || [],
      recentReviews: reviews?.map((r: any) => ({
        rating: r.rating,
        comment: r.comment,
        guestName: r.profiles?.name || 'Anonymous',
        date: r.created_at
      })) || [],
      availability: {
        isAvailable,
        message: availabilityMessage,
        checkIn,
        checkOut
      },
      detailsUrl: `${req.headers.get('origin') || 'https://staylite.lovable.app'}/listing/${listing.slug}`,
      bookingUrl: `${req.headers.get('origin') || 'https://staylite.lovable.app'}/listing/${listing.slug}?checkIn=${checkIn}&checkOut=${checkOut}`
    };

    return new Response(
      JSON.stringify({
        success: true,
        listing: formattedListing
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get listing error:', error);
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
