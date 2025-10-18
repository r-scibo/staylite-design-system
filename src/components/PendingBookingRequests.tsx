import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { Calendar, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface PendingBooking {
  id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total: number;
  created_at: string;
  listings: {
    title: string;
    city: string;
  };
  profiles: {
    name: string | null;
  } | null;
}

export function PendingBookingRequests() {
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPendingBookings = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          check_in,
          check_out,
          guests_count,
          total,
          created_at,
          listings!inner (
            title,
            city,
            host_id
          ),
          profiles!bookings_guest_id_fkey (
            name
          )
        `)
        .eq("listings.host_id", profile.id)
        .eq("status", "PENDING")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPendingBookings(data as PendingBooking[] || []);
    } catch (error: any) {
      console.error("Error fetching pending bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();

    // Set up realtime subscription for new bookings
    const channel = supabase
      .channel("pending-bookings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchPendingBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      const { error } = await supabase.rpc("fn_host_update_booking_status", {
        _booking_id: bookingId,
        _new_status: newStatus,
      });

      if (error) throw error;

      toast.success(
        newStatus === "CONFIRMED"
          ? "Booking approved! Guest has been notified."
          : "Booking declined."
      );
      fetchPendingBookings();
    } catch (error: any) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading pending requests...
        </CardContent>
      </Card>
    );
  }

  if (pendingBookings.length === 0) {
    return null;
  }

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Pending Booking Requests
            <Badge variant="default" className="ml-2">
              {pendingBookings.length}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingBookings.map((booking) => (
          <Card key={booking.id} className="border-border">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.listings.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {booking.listings.city}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                    Pending
                  </Badge>
                </div>

                {/* Guest Info */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Guest:</span>
                  <span className="text-muted-foreground">{booking.profiles?.name || "Guest User"}</span>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      Check-in
                    </div>
                    <div className="font-medium">{format(new Date(booking.check_in), "dd MMM yyyy")}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      Check-out
                    </div>
                    <div className="font-medium">{format(new Date(booking.check_out), "dd MMM yyyy")}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Users className="h-3 w-3" />
                      Guests
                    </div>
                    <div className="font-medium">{booking.guests_count}</div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="ml-2 text-lg font-semibold">€{Number(booking.total).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Requested {format(new Date(booking.created_at), "dd MMM, HH:mm")}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                    disabled={updatingId === booking.id}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(booking.id, "DECLINED")}
                    disabled={updatingId === booking.id}
                    className="flex-1"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
