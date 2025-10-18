import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format, differenceInDays, parseISO } from "date-fns";
import { MapPin, Calendar, Users, CreditCard, Lock, ArrowLeft } from "lucide-react";
import { PriceBreakdown } from "@/components/PriceBreakdown";

interface Listing {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  property_type: string;
  max_guests: number;
  base_price: number;
  cleaning_fee: number;
  host_approval_required: boolean;
  first_photo_url?: string;
}

interface AvailabilityDate {
  date: string;
  status: string;
  price_override: number | null;
}

export default function BookingReview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [availability, setAvailability] = useState<AvailabilityDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get booking details from URL params
  const listingId = searchParams.get("listingId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = parseInt(searchParams.get("guests") || "2");

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!listingId || !checkIn || !checkOut) {
      toast({
        title: "Invalid Booking",
        description: "Missing booking details",
        variant: "destructive",
      });
      navigate("/search");
      return;
    }

    fetchBookingData();
  }, [listingId, user]);

  const fetchBookingData = async () => {
    if (!listingId) return;

    setLoading(true);
    try {
      // Fetch listing with first photo
      const { data: listingData, error: listingError } = await supabase
        .from("listing_summary_v")
        .select("*")
        .eq("id", listingId)
        .single();

      if (listingError) throw listingError;
      setListing(listingData);

      // Fetch availability
      const { data: availabilityData } = await supabase
        .from("availability")
        .select("date, status, price_override")
        .eq("listing_id", listingId)
        .gte("date", checkIn)
        .lt("date", checkOut)
        .order("date");

      if (availabilityData) setAvailability(availabilityData);
    } catch (error: any) {
      console.error("Error fetching booking data:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
      navigate("/search");
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!listing || !checkIn || !checkOut) return null;

    const checkInDate = parseISO(checkIn);
    const checkOutDate = parseISO(checkOut);
    const nights = differenceInDays(checkOutDate, checkInDate);
    
    if (nights < 1) return null;

    // Calculate nightly prices
    let subtotal = 0;
    const currentDate = new Date(checkInDate);
    
    for (let i = 0; i < nights; i++) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const avail = availability.find((a) => a.date === dateStr);
      const nightlyPrice = avail?.price_override ?? listing.base_price;
      subtotal += Number(nightlyPrice);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const cleaningFee = Number(listing.cleaning_fee);
    const serviceFee = Math.round(subtotal * 0.12 * 100) / 100;
    const taxes = Math.round(subtotal * 0.10 * 100) / 100;
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      nights,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total,
    };
  };

  const handleConfirmPayment = async () => {
    if (!user || !listing || !checkIn || !checkOut) return;

    setIsProcessing(true);
    try {
      // Get guest profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profileData) throw new Error("Profile not found");

      const pricing = calculatePricing();
      if (!pricing) throw new Error("Could not calculate pricing");

      const status = listing.host_approval_required ? "PENDING" : "CONFIRMED";

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          listing_id: listing.id,
          guest_id: profileData.id,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guests,
          nightly_price: pricing.subtotal / pricing.nights,
          cleaning_fee: pricing.cleaningFee,
          service_fee: pricing.serviceFee,
          taxes: pricing.taxes,
          total: pricing.total,
          status,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      toast({
        title: "Payment Authorized",
        description: status === "PENDING" 
          ? "Your booking request has been sent to the host"
          : "Your booking is confirmed!",
      });

      navigate(`/confirm/${bookingData.id}`);
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!listing || !checkIn || !checkOut) {
    return null;
  }

  const pricing = calculatePricing();
  if (!pricing) return null;

  const checkInDate = parseISO(checkIn);
  const checkOutDate = parseISO(checkOut);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="mb-8 text-3xl font-bold text-foreground">Review and Pay</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Booking Details */}
          <div className="space-y-6">
            {/* Listing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Trip</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {listing.first_photo_url && (
                    <img
                      src={listing.first_photo_url}
                      alt={listing.title}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{listing.title}</h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.city}, {listing.country}</span>
                    </div>
                    <Badge variant="secondary" className="mt-2 capitalize text-xs">
                      {listing.property_type}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Dates</div>
                      <div className="text-sm text-muted">
                        {format(checkInDate, "dd MMM yyyy")} → {format(checkOutDate, "dd MMM yyyy")}
                      </div>
                      <div className="text-xs text-muted">
                        {pricing.nights} {pricing.nights === 1 ? "night" : "nights"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Guests</div>
                      <div className="text-sm text-muted">
                        {guests} {guests === 1 ? "guest" : "guests"}
                      </div>
                    </div>
                  </div>
                </div>

                {listing.host_approval_required && (
                  <>
                    <Separator />
                    <Badge variant="outline" className="w-full justify-center py-2">
                      Host approval required
                    </Badge>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Method (Simulated) */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-lg border border-input p-4">
                  <CreditCard className="h-6 w-6 text-accent" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Credit Card (Demo)</div>
                    <div className="text-xs text-muted">•••• •••• •••• 4242</div>
                  </div>
                  <Lock className="h-4 w-4 text-muted" />
                </div>
                <p className="mt-3 text-xs text-muted">
                  This is a simulated payment interface. No actual charges will be made.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Breakdown */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Price Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PriceBreakdown pricing={pricing} />

                <Separator />

                <div className="space-y-3">
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Confirm & Pay
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted">
                    You won't be charged yet. This is a demo payment flow.
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted">
                  <div className="mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium">Secure Payment</span>
                  </div>
                  <p>
                    Your payment information is encrypted and secure. This demo uses
                    simulated payment processing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
