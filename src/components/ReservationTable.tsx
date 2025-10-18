import { useState } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Users, MapPin, Euro, Eye } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

type Reservation = Database["public"]["Tables"]["bookings"]["Row"] & {
  listings: {
    title: string;
    city: string;
    property_type: string;
  };
  profiles: {
    name: string | null;
  } | null;
};

interface ReservationTableProps {
  reservations: Reservation[];
  onUpdate: () => void;
}

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  CONFIRMED: "bg-green-500/10 text-green-700 border-green-500/20",
  DECLINED: "bg-red-500/10 text-red-700 border-red-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function ReservationTable({ reservations, onUpdate }: ReservationTableProps) {
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);

  const filteredReservations = reservations.filter((r) => {
    // Status filter
    if (filter !== "ALL" && r.status !== filter) return false;

    // Date range filter
    if (startDate && endDate) {
      try {
        const checkIn = parseISO(r.check_in);
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        if (!isWithinInterval(checkIn, { start, end })) return false;
      } catch {
        // Invalid date, skip filter
      }
    }

    // Search filter (guest name or listing title)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const guestName = r.profiles?.name?.toLowerCase() || "";
      const listingTitle = r.listings.title.toLowerCase();
      if (!guestName.includes(query) && !listingTitle.includes(query)) {
        return false;
      }
    }

    return true;
  });

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      const { error } = await supabase.rpc("fn_host_update_booking_status", {
        _booking_id: bookingId,
        _new_status: newStatus,
      });

      if (error) throw error;

      toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
      onUpdate();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Guest or listing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Label>Status</Label>
              <Select value={filter} onValueChange={(v) => setFilter(v as BookingStatus | "ALL")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label htmlFor="start-date">Check-in From</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end-date">Check-in To</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(filter !== "ALL" || startDate || endDate || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilter("ALL");
                setStartDate("");
                setEndDate("");
                setSearchQuery("");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredReservations.length} of {reservations.length} reservations
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Listing</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No reservations found
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.profiles?.name || "Guest"}</TableCell>
                  <TableCell className="font-medium">{reservation.listings.title}</TableCell>
                  <TableCell>{format(new Date(reservation.check_in), "dd MMM yyyy")}</TableCell>
                  <TableCell>{format(new Date(reservation.check_out), "dd MMM yyyy")}</TableCell>
                  <TableCell>{reservation.guests_count}</TableCell>
                  <TableCell>€{Number(reservation.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[reservation.status]}>
                      {reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* View Details */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBooking(reservation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                          </DialogHeader>
                          {selectedBooking && (
                            <div className="space-y-6">
                              {/* Guest & Listing Info */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Guest</h4>
                                  <p className="text-lg font-semibold">{selectedBooking.profiles?.name || "Guest User"}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
                                  <Badge className={statusColors[selectedBooking.status]}>
                                    {selectedBooking.status}
                                  </Badge>
                                </div>
                              </div>

                              {/* Listing */}
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Listing
                                </h4>
                                <p className="font-medium">{selectedBooking.listings.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedBooking.listings.city} • {selectedBooking.listings.property_type}
                                </p>
                              </div>

                              {/* Dates */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Check-in
                                  </h4>
                                  <p className="font-medium">{format(new Date(selectedBooking.check_in), "EEEE, dd MMM yyyy")}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Check-out
                                  </h4>
                                  <p className="font-medium">{format(new Date(selectedBooking.check_out), "EEEE, dd MMM yyyy")}</p>
                                </div>
                              </div>

                              {/* Pricing Details */}
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                                  <Euro className="h-4 w-4" />
                                  Payment Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nightly Rate</span>
                                    <span>€{Number(selectedBooking.nightly_price).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cleaning Fee</span>
                                    <span>€{Number(selectedBooking.cleaning_fee).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Service Fee</span>
                                    <span>€{Number(selectedBooking.service_fee).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxes</span>
                                    <span>€{Number(selectedBooking.taxes).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t font-semibold">
                                    <span>Total</span>
                                    <span>€{Number(selectedBooking.total).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Guests */}
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Guests
                                </h4>
                                <p className="font-medium">{selectedBooking.guests_count} {selectedBooking.guests_count === 1 ? "guest" : "guests"}</p>
                              </div>

                              {/* Timestamps */}
                              <div className="text-xs text-muted-foreground pt-4 border-t">
                                <p>Requested: {format(new Date(selectedBooking.created_at), "dd MMM yyyy, HH:mm")}</p>
                                {selectedBooking.updated_at !== selectedBooking.created_at && (
                                  <p>Last updated: {format(new Date(selectedBooking.updated_at), "dd MMM yyyy, HH:mm")}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Action Buttons */}
                      {reservation.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(reservation.id, "CONFIRMED")}
                            disabled={updatingId === reservation.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(reservation.id, "DECLINED")}
                            disabled={updatingId === reservation.id}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {reservation.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(reservation.id, "CANCELLED")}
                          disabled={updatingId === reservation.id}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
