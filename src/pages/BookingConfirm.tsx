import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Calendar, MapPin, Users } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  nightly_price: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total: number;
  status: string;
  created_at: string;
  listings: {
    title: string;
    city: string;
    country: string;
    property_type: string;
  };
}

export default function BookingConfirm() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    if (!bookingId) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          listings (
            title,
            city,
            country,
            property_type
          )
        `)
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setLoading(false);
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Booking not found</h1>
          <Button onClick={() => navigate("/profile")} className="mt-4">
            View My Bookings
          </Button>
        </div>
      </div>
    );
  }

  const checkInDate = parseISO(booking.check_in);
  const checkOutDate = parseISO(booking.check_out);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const subtotal = booking.nightly_price * nights;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex rounded-full bg-accent/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-accent" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            {booking.status === "CONFIRMED" 
              ? "Booking Confirmed!" 
              : "Booking Request Sent"}
          </h1>
          <p className="text-lg text-muted">
            {booking.status === "CONFIRMED"
              ? "Your reservation is all set. We've sent a confirmation to your email."
              : "Your booking request has been sent to the host for approval."}
          </p>
        </div>

        {/* Reference Code */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Booking Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted">Reference Code</p>
              <p className="text-2xl font-mono font-bold text-foreground">
                {booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Badge 
                variant={booking.status === "CONFIRMED" ? "default" : "secondary"}
                className="text-sm"
              >
                {booking.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Property */}
            <div>
              <h3 className="mb-1 font-semibold text-foreground">
                {booking.listings.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {booking.listings.city}, {booking.listings.country}
                </div>
                <Badge variant="secondary" className="capitalize text-xs">
                  {booking.listings.property_type}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm text-muted">
                  <Calendar className="h-4 w-4" />
                  <span>Check-in</span>
                </div>
                <p className="font-semibold text-foreground">
                  {format(checkInDate, "dd MMM yyyy")}
                </p>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm text-muted">
                  <Calendar className="h-4 w-4" />
                  <span>Check-out</span>
                </div>
                <p className="font-semibold text-foreground">
                  {format(checkOutDate, "dd MMM yyyy")}
                </p>
              </div>
            </div>

            <Separator />

            {/* Guests */}
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-muted">
                <Users className="h-4 w-4" />
                <span>Guests</span>
              </div>
              <p className="font-semibold text-foreground">
                {booking.guests_count} {booking.guests_count === 1 ? "guest" : "guests"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Price Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-foreground">
              <span>€{booking.nightly_price.toFixed(2)} × {nights} nights</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>Cleaning fee</span>
              <span>€{booking.cleaning_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>Service fee (12%)</span>
              <span>€{booking.service_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>Taxes (10%)</span>
              <span>€{booking.taxes.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total</span>
              <span>€{booking.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Booking Date */}
        <p className="mb-6 text-center text-sm text-muted">
          Booked on {format(parseISO(booking.created_at), "dd MMM yyyy 'at' HH:mm")}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => navigate("/profile")}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            View My Bookings
          </Button>
          <Button
            onClick={() => navigate("/search")}
            className="flex-1"
            size="lg"
          >
            Continue Browsing
          </Button>
        </div>
      </main>
    </div>
  );
}
