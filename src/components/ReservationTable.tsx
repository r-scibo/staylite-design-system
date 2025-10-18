import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

type Reservation = Database["public"]["Tables"]["bookings"]["Row"] & {
  listings: {
    title: string;
  };
  profiles: {
    name: string | null;
  };
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

  const filteredReservations = reservations.filter(
    (r) => filter === "ALL" || r.status === filter
  );

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
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Filter by status:</span>
        <Select value={filter} onValueChange={(v) => setFilter(v as BookingStatus | "ALL")}>
          <SelectTrigger className="w-[180px]">
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
                  <TableCell>{reservation.profiles.name || "Guest"}</TableCell>
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
