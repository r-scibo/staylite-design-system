import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { Calendar, MapPin, Users, Search, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface Reservation {
  id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total: number;
  status: BookingStatus;
  created_at: string;
  listings: {
    id: string;
    title: string;
    city: string;
    property_type: string;
  };
  profiles: {
    name: string | null;
  } | null;
}

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  CONFIRMED: "bg-green-500/10 text-green-700 border-green-500/20",
  DECLINED: "bg-red-500/10 text-red-700 border-red-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function CurrentReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) return;

      const today = format(new Date(), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          check_in,
          check_out,
          guests_count,
          total,
          status,
          created_at,
          listings!inner (
            id,
            title,
            city,
            property_type,
            host_id
          ),
          profiles!bookings_guest_id_fkey (
            name
          )
        `)
        .eq("listings.host_id", profile.id)
        .in("status", ["PENDING", "CONFIRMED"])
        .gte("check_out", today)
        .order("check_in", { ascending: true });

      if (error) throw error;
      setReservations(data as Reservation[] || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();

    // Real-time updates
    const channel = supabase
      .channel("current-reservations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredReservations = reservations.filter((r) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const guestName = r.profiles?.name?.toLowerCase() || "";
      const listingTitle = r.listings.title.toLowerCase();
      const city = r.listings.city.toLowerCase();
      
      if (!guestName.includes(query) && !listingTitle.includes(query) && !city.includes(query)) {
        return false;
      }
    }

    // Date filter
    if (dateFilter) {
      try {
        const filterDate = parseISO(dateFilter);
        const checkIn = parseISO(r.check_in);
        const checkOut = parseISO(r.check_out);
        
        // Check if filter date is within the booking period
        if (isBefore(filterDate, checkIn) || isAfter(filterDate, checkOut)) {
          return false;
        }
      } catch {
        // Invalid date, skip filter
      }
    }

    return true;
  });

  // Separate into active (currently staying) and upcoming
  const today = new Date();
  const activeReservations = filteredReservations.filter(r => {
    const checkIn = parseISO(r.check_in);
    const checkOut = parseISO(r.check_out);
    return isBefore(checkIn, today) && isAfter(checkOut, today) && r.status === "CONFIRMED";
  });

  const upcomingReservations = filteredReservations.filter(r => {
    const checkIn = parseISO(r.check_in);
    return isAfter(checkIn, today) || r.status === "PENDING";
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading reservations...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current & Upcoming Reservations</span>
          <Badge variant="outline">
            {activeReservations.length} Active • {upcomingReservations.length} Upcoming
          </Badge>
        </CardTitle>
        
        {/* Search & Filter */}
        <div className="flex gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by guest, property, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Input
            type="date"
            placeholder="Filter by date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[180px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredReservations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchQuery || dateFilter ? "No reservations match your search" : "No current or upcoming reservations"}
          </p>
        ) : (
          <div className="space-y-6">
            {/* Active Reservations */}
            {activeReservations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Currently Staying
                </h3>
                <div className="space-y-3">
                  {activeReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onViewDetails={setSelectedReservation}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Reservations */}
            {upcomingReservations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Upcoming
                </h3>
                <div className="space-y-3">
                  {upcomingReservations.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onViewDetails={setSelectedReservation}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reservation Details</DialogTitle>
            </DialogHeader>
            {selectedReservation && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Guest</p>
                    <p className="font-semibold">{selectedReservation.profiles?.name || "Guest User"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedReservation.status]}>
                      {selectedReservation.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Property</p>
                  <p className="font-medium">{selectedReservation.listings.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReservation.listings.city} • {selectedReservation.listings.property_type}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Check-in</p>
                    <p className="font-medium">{format(new Date(selectedReservation.check_in), "EEEE, dd MMM yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Check-out</p>
                    <p className="font-medium">{format(new Date(selectedReservation.check_out), "EEEE, dd MMM yyyy")}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Guests</p>
                    <p className="font-medium">{selectedReservation.guests_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="font-medium text-lg">€{Number(selectedReservation.total).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface ReservationCardProps {
  reservation: Reservation;
  onViewDetails: (reservation: Reservation) => void;
}

function ReservationCard({ reservation, onViewDetails }: ReservationCardProps) {
  return (
    <Card className="border-l-4 border-l-accent">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{reservation.listings.title}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {reservation.listings.city}
                </div>
              </div>
              <Badge className={statusColors[reservation.status]}>
                {reservation.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Guest</p>
                <p className="font-medium">{reservation.profiles?.name || "Guest User"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Guests</p>
                <p className="font-medium flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {reservation.guests_count}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{format(new Date(reservation.check_in), "dd MMM")}</span>
                <span className="text-muted-foreground">→</span>
                <span>{format(new Date(reservation.check_out), "dd MMM yyyy")}</span>
              </div>
              <div className="ml-auto font-semibold">
                €{Number(reservation.total).toFixed(2)}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(reservation)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
