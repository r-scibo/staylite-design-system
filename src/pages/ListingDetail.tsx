import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { 
  MapPin, Users, Star, Wifi, Utensils, Wind, Flame, 
  WashingMachine, Tv, Car, Home, ArrowLeft 
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { PriceBreakdown } from "@/components/PriceBreakdown";

interface Listing {
  id: string;
  title: string;
  slug: string;
  city: string;
  country: string;
  address: string | null;
  property_type: string;
  max_guests: number;
  base_price: number;
  cleaning_fee: number;
  host_approval_required: boolean;
  description: string | null;
  rating_avg: number | null;
  rating_count: number | null;
}

interface Photo {
  id: string;
  url: string;
  sort_order: number;
}

interface Amenity {
  id: string;
  name: string;
  icon: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    name: string | null;
  };
}

interface AvailabilityDate {
  date: string;
  status: string;
  price_override: number | null;
}

const ICON_MAP: Record<string, any> = {
  wifi: Wifi,
  utensils: Utensils,
  wind: Wind,
  flame: Flame,
  "washing-machine": WashingMachine,
  tv: Tv,
  car: Car,
  home: Home,
};

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [listing, setListing] = useState<Listing | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [availability, setAvailability] = useState<AvailabilityDate[]>([]);
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(2);
  const [isBooking, setIsBooking] = useState(false);

  // Initialize dates and guests from URL params
  useEffect(() => {
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");
    const guestsParam = searchParams.get("guests");

    if (checkInParam) {
      try {
        setCheckIn(parseISO(checkInParam));
      } catch (e) {
        console.error("Invalid checkIn date:", e);
      }
    }

    if (checkOutParam) {
      try {
        setCheckOut(parseISO(checkOutParam));
      } catch (e) {
        console.error("Invalid checkOut date:", e);
      }
    }

    if (guestsParam) {
      const guestsNum = parseInt(guestsParam);
      if (!isNaN(guestsNum) && guestsNum > 0) {
        setGuests(guestsNum);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetchListingData();
  }, [slug]);

  const fetchListingData = async () => {
    if (!slug) return;

    setLoading(true);
    try {
      // Fetch listing
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("slug", slug)
        .single();

      if (listingError) throw listingError;
      setListing(listingData);

      // Fetch photos
      const { data: photosData } = await supabase
        .from("listing_photos")
        .select("*")
        .eq("listing_id", listingData.id)
        .order("sort_order");
      if (photosData) setPhotos(photosData);

      // Fetch amenities
      const { data: amenitiesData } = await supabase
        .from("listing_amenities")
        .select("amenities(id, name, icon)")
        .eq("listing_id", listingData.id);
      if (amenitiesData) {
        setAmenities(
          amenitiesData
            .map((item: any) => item.amenities)
            .filter((a: any) => a !== null)
        );
      }

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*, profiles(name)")
        .eq("listing_id", listingData.id)
        .order("created_at", { ascending: false });
      if (reviewsData) setReviews(reviewsData);

      // Fetch availability for next 90 days
      const today = new Date();
      const future = new Date();
      future.setDate(future.getDate() + 90);

      const { data: availabilityData } = await supabase
        .from("availability")
        .select("date, status, price_override")
        .eq("listing_id", listingData.id)
        .gte("date", format(today, "yyyy-MM-dd"))
        .lte("date", format(future, "yyyy-MM-dd"))
        .order("date");

      if (availabilityData) setAvailability(availabilityData);
    } catch (error: any) {
      console.error("Error fetching listing:", error);
      toast({
        title: "Error",
        description: "Failed to load listing details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!listing || !checkIn || !checkOut) {
      return null;
    }

    const nights = differenceInDays(checkOut, checkIn);
    if (nights < 1) return null;

    // Calculate nightly prices
    let subtotal = 0;
    const currentDate = new Date(checkIn);
    
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

  const validateBooking = (): string | null => {
    if (!user) return "Please log in to make a reservation";
    if (!checkIn || !checkOut) return "Please select check-in and check-out dates";
    
    const nights = differenceInDays(checkOut, checkIn);
    if (nights < 2) return "Minimum stay is 2 nights";
    
    if (!listing) return "Listing not found";
    if (guests > listing.max_guests) {
      return `Maximum ${listing.max_guests} guests allowed`;
    }

    // Check if all dates are available
    const currentDate = new Date(checkIn);
    for (let i = 0; i < nights; i++) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const avail = availability.find((a) => a.date === dateStr);
      if (avail && (avail.status === "BLOCKED" || avail.status === "BOOKED")) {
        return `Selected dates are not available`;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return null;
  };

  const handleReserve = async () => {
    const validationError = validateBooking();
    if (validationError) {
      toast({
        title: "Invalid Booking",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (!user || !listing || !checkIn || !checkOut) return;

    setIsBooking(true);
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

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          listing_id: listing.id,
          guest_id: profileData.id,
          check_in: format(checkIn, "yyyy-MM-dd"),
          check_out: format(checkOut, "yyyy-MM-dd"),
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
        title: "Booking Created",
        description: status === "PENDING" 
          ? "Your booking request has been sent to the host"
          : "Your booking is confirmed!",
      });

      navigate(`/confirm/${bookingData.id}`);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
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

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Listing not found</h1>
          <Button onClick={() => navigate("/search")} className="mt-4">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-foreground">{listing.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <div className="flex items-center gap-1">
              {listing.rating_avg && listing.rating_count ? (
                <>
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">
                    {listing.rating_avg.toFixed(1)}
                  </span>
                  <span>({listing.rating_count} reviews)</span>
                </>
              ) : (
                <span>No reviews yet</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {listing.city}, {listing.country}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Up to {listing.max_guests} guests</span>
            </div>
            <Badge variant="secondary" className="capitalize">
              {listing.property_type}
            </Badge>
          </div>
        </div>

        {/* Photo Carousel */}
        {photos.length > 0 && <PhotoCarousel photos={photos} />}

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">About this place</h2>
                <p className="whitespace-pre-wrap text-muted">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Amenities</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {amenities.map((amenity) => {
                    const Icon = amenity.icon ? ICON_MAP[amenity.icon] : Home;
                    return (
                      <div key={amenity.id} className="flex items-center gap-3">
                        {Icon && <Icon className="h-5 w-5 text-accent" />}
                        <span className="text-foreground">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Reviews */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                Reviews {listing.rating_count ? `(${listing.rating_count})` : ""}
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-accent text-accent"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-foreground">
                            {review.profiles.name || "Guest"}
                          </span>
                          <span className="text-sm text-muted">
                            {format(parseISO(review.created_at), "dd MMM yyyy")}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-muted">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      €{listing.base_price}
                    </span>
                    <span className="text-muted">/ night</span>
                  </div>
                  {listing.host_approval_required && (
                    <Badge variant="outline" className="text-xs">
                      Host approval required
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Calendar */}
                <div>
                  <h3 className="mb-3 font-semibold text-foreground">Select Dates</h3>
                  <AvailabilityCalendar
                    availability={availability}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onCheckInChange={setCheckIn}
                    onCheckOutChange={setCheckOut}
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
                  >
                    {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map(
                      (num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "guest" : "guests"}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Price Breakdown */}
                {pricing && (
                  <>
                    <Separator />
                    <PriceBreakdown pricing={pricing} />
                  </>
                )}

                {/* Reserve Button */}
                <Button
                  onClick={handleReserve}
                  disabled={!checkIn || !checkOut || isBooking}
                  className="w-full"
                  size="lg"
                >
                  {isBooking ? "Processing..." : "Reserve"}
                </Button>

                {!user && (
                  <p className="text-center text-sm text-muted">
                    Please{" "}
                    <button
                      onClick={() => navigate("/auth?next=" + window.location.pathname)}
                      className="text-accent hover:underline"
                    >
                      log in
                    </button>{" "}
                    to book
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
