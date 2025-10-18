import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar as CalendarIcon, MessageSquare } from "lucide-react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { AirbnbStyleCalendar } from "@/components/AirbnbStyleCalendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type AvailabilityStatus = Database["public"]["Enums"]["availability_status"];
type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface Listing {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  property_type: string;
  max_guests: number;
  base_price: number;
  cleaning_fee: number;
  listing_photos: Array<{ url: string; sort_order: number }>;
}

interface Availability {
  date: string;
  status: AvailabilityStatus;
  price_override: number | null;
}

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total: number;
  status: BookingStatus;
  created_at: string;
  profiles: {
    name: string | null;
  } | null;
}

export default function HostListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bulkStatus, setBulkStatus] = useState<AvailabilityStatus>("OPEN");
  const [bulkPrice, setBulkPrice] = useState("");
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    if (!user || !id) return;

    try {
      // Verify ownership
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Fetch listing
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          description,
          city,
          country,
          property_type,
          max_guests,
          base_price,
          cleaning_fee,
          listing_photos (url, sort_order)
        `)
        .eq("id", id)
        .eq("host_id", profile.id)
        .single();

      if (listingError) throw listingError;
      if (!listingData) {
        toast.error("Listing not found");
        navigate("/host");
        return;
      }

      setListing(listingData as Listing);

      // Fetch availability for next 3 months
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(addMonths(currentMonth, 2));

      const { data: availData } = await supabase
        .from("availability")
        .select("date, status, price_override")
        .eq("listing_id", id)
        .gte("date", format(start, "yyyy-MM-dd"))
        .lte("date", format(end, "yyyy-MM-dd"));

      setAvailability(availData || []);

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          id,
          check_in,
          check_out,
          guests_count,
          total,
          status,
          created_at,
          profiles (name)
        `)
        .eq("listing_id", id)
        .order("created_at", { ascending: false });

      setBookings(bookingsData as Booking[] || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDateStatus = (date: Date): AvailabilityStatus | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    const avail = availability.find(a => a.date === dateStr);
    return avail?.status || null;
  };

  const handleBulkUpdate = async () => {
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    try {
      const updates = selectedDates.map(date => ({
        listing_id: id,
        date: format(date, "yyyy-MM-dd"),
        status: bulkStatus,
        price_override: bulkPrice ? parseFloat(bulkPrice) : null,
      }));

      // Upsert availability
      const { error } = await supabase
        .from("availability")
        .upsert(updates, { onConflict: "listing_id,date" });

      if (error) throw error;

      toast.success("Availability updated");
      setSelectedDates([]);
      setBulkPrice("");
      setShowBulkDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBookingUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingBooking(bookingId);
    try {
      const { error } = await supabase.rpc("fn_host_update_booking_status", {
        _booking_id: bookingId,
        _new_status: newStatus,
      });

      if (error) throw error;
      toast.success(`Booking ${newStatus.toLowerCase()}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdatingBooking(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!listing) return null;

  const pendingBookings = bookings.filter(b => b.status === "PENDING");
  const sortedPhotos = [...listing.listing_photos].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate("/host")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Listings
      </Button>

      {/* Header with photos */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
        <div className="grid grid-cols-4 gap-2 rounded-lg overflow-hidden">
          {sortedPhotos.slice(0, 5).map((photo, idx) => (
            <div key={idx} className={idx === 0 ? "col-span-2 row-span-2" : ""}>
              <img
                src={photo.url}
                alt={`${listing.title} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">€{listing.base_price}</div>
            <div className="text-sm text-muted-foreground">per night</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{listing.max_guests}</div>
            <div className="text-sm text-muted-foreground">max guests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
            <div className="text-sm text-muted-foreground">pending requests</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar & Pricing
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <MessageSquare className="h-4 w-4 mr-2" />
            Booking Requests ({pendingBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Booked</span>
                </div>
              </div>

              <AirbnbStyleCalendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates((dates as Date[]) || [])}
                modifiers={{
                  open: (date) => getDateStatus(date) === "OPEN",
                  blocked: (date) => getDateStatus(date) === "BLOCKED",
                  booked: (date) => getDateStatus(date) === "BOOKED",
                }}
                modifiersClassNames={{
                  open: "bg-green-500/20 text-green-700 hover:bg-green-500/30",
                  blocked: "bg-red-500/20 text-red-700 line-through hover:bg-red-500/30",
                  booked: "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30",
                }}
                numberOfMonths={2}
              />

              {selectedDates.length > 0 && (
                <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      Update {selectedDates.length} Selected Date{selectedDates.length !== 1 ? "s" : ""}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Availability</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Status</Label>
                        <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as AvailabilityStatus)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="BLOCKED">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Price Override (optional)</Label>
                        <Input
                          type="number"
                          placeholder={`Default: €${listing.base_price}`}
                          value={bulkPrice}
                          onChange={(e) => setBulkPrice(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleBulkUpdate} className="w-full">
                        Apply Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending booking requests
              </CardContent>
            </Card>
          ) : (
            pendingBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-semibold text-lg">{booking.profiles?.name || "Guest"}</div>
                      <div className="text-sm text-muted-foreground">
                        Requested {format(new Date(booking.created_at), "dd MMM yyyy")}
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                      Pending
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Check-in</div>
                      <div className="font-medium">{format(new Date(booking.check_in), "dd MMM yyyy")}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Check-out</div>
                      <div className="font-medium">{format(new Date(booking.check_out), "dd MMM yyyy")}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Guests</div>
                      <div className="font-medium">{booking.guests_count}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-medium">€{Number(booking.total).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleBookingUpdate(booking.id, "CONFIRMED")}
                      disabled={updatingBooking === booking.id}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBookingUpdate(booking.id, "DECLINED")}
                      disabled={updatingBooking === booking.id}
                      className="flex-1"
                    >
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {bookings.filter(b => b.status !== "PENDING").length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Past Bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookings
                  .filter(b => b.status !== "PENDING")
                  .map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div className="flex-1">
                        <div className="font-medium">{booking.profiles?.name || "Guest"}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.check_in), "dd MMM")} - {format(new Date(booking.check_out), "dd MMM yyyy")}
                        </div>
                      </div>
                      <Badge className={
                        booking.status === "CONFIRMED"
                          ? "bg-green-500/10 text-green-700 border-green-500/20"
                          : booking.status === "DECLINED"
                          ? "bg-red-500/10 text-red-700 border-red-500/20"
                          : "bg-muted text-muted-foreground"
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
