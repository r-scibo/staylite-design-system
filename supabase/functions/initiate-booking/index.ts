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

    const { listingId, slug, checkIn, checkOut, guests } = await req.json();

    console.log('Initiate booking:', { listingId, slug, checkIn, checkOut, guests });

    // Get listing
    let query = supabase
      .from('listings')
      .select('id, slug, title, base_price, cleaning_fee, max_guests, host_approval_required');

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

    // Validate guests
    if (guests > listing.max_guests) {
      return new Response(
        JSON.stringify({
          success: false,
          canProceed: false,
          error: `This property can accommodate maximum ${listing.max_guests} guests. You requested ${guests} guests.`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check availability
    const { data: blockedDates } = await supabase
      .from('availability')
      .select('date, status')
      .eq('listing_id', listing.id)
      .gte('date', checkIn)
      .lt('date', checkOut)
      .in('status', ['BLOCKED', 'BOOKED']);

    if (blockedDates && blockedDates.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          canProceed: false,
          error: 'Selected dates are not available. Please choose different dates.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate pricing
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = nights * listing.base_price;
    const serviceFee = Math.round(subtotal * 0.12 * 100) / 100;
    const taxes = Math.round(subtotal * 0.10 * 100) / 100;
    const total = subtotal + listing.cleaning_fee + serviceFee + taxes;

    // Generate booking URL
    const origin = req.headers.get('origin') || 'https://staylite.lovable.app';
    const bookingUrl = `${origin}/listing/${listing.slug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;

    return new Response(
      JSON.stringify({
        success: true,
        canProceed: true,
        listing: {
          id: listing.id,
          title: listing.title,
          slug: listing.slug,
          requiresHostApproval: listing.host_approval_required
        },
        booking: {
          checkIn,
          checkOut,
          guests,
          nights,
          pricing: {
            pricePerNight: listing.base_price,
            subtotal,
            cleaningFee: listing.cleaning_fee,
            serviceFee,
            taxes,
            total
          }
        },
        bookingUrl,
        message: listing.host_approval_required 
          ? `Great! This property requires host approval. I'll direct you to complete your booking at: ${bookingUrl}. The host will review your request.`
          : `Perfect! I'll direct you to complete your booking at: ${bookingUrl}. Your reservation will be confirmed immediately.`,
        nextStep: 'Please visit the booking URL to sign in/register and complete your payment.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Initiate booking error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        canProceed: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
