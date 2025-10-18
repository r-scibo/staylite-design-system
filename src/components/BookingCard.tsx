import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, MapPin, Users } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  listings: {
    title: string;
    city: string;
    country: string;
  };
};

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
  isCancelling?: boolean;
}

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  CONFIRMED: "bg-green-500/10 text-green-700 border-green-500/20",
  DECLINED: "bg-red-500/10 text-red-700 border-red-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function BookingCard({ booking, onCancel, isCancelling }: BookingCardProps) {
  const checkIn = new Date(booking.check_in);
  const checkOut = new Date(booking.check_out);
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{booking.listings.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              {booking.listings.city}, {booking.listings.country}
            </div>
          </div>
          <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>
              {format(checkIn, "dd MMM yyyy")} → {format(checkOut, "dd MMM yyyy")}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{booking.guests_count} guests</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-sm">€{Number(booking.nightly_price * (Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Cleaning fee</span>
            <span className="text-sm">€{Number(booking.cleaning_fee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Service fee</span>
            <span className="text-sm">€{Number(booking.service_fee).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Taxes</span>
            <span className="text-sm">€{Number(booking.taxes).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center font-semibold text-lg border-t pt-2 mt-2">
            <span>Total</span>
            <span>€{Number(booking.total).toFixed(2)}</span>
          </div>
        </div>

        {canCancel && onCancel && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => onCancel(booking.id)}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
