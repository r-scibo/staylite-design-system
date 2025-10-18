import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { LoadingSpinner } from "./LoadingSpinner";

interface Listing {
  id: string;
  title: string;
}

interface AvailabilityRecord {
  date: string;
  status: "OPEN" | "BLOCKED" | "BOOKED";
  price_override: number | null;
}

export const HostCalendarTab = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, AvailabilityRecord>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [priceOverride, setPriceOverride] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, [user]);

  useEffect(() => {
    if (selectedListing) {
      fetchAvailability();
    }
  }, [selectedListing, currentMonth]);

  const fetchListings = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from("listings")
        .select("id, title")
        .eq("host_id", profile.id);

      if (error) throw error;
      setListings(data || []);
      if (data && data.length > 0) {
        setSelectedListing(data[0].id);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("availability")
      .select("date, status, price_override")
      .eq("listing_id", selectedListing)
      .gte("date", start)
      .lte("date", end);

    if (error) {
      toast.error(error.message);
      return;
    }

    const availabilityMap: Record<string, AvailabilityRecord> = {};
    data?.forEach((record) => {
      availabilityMap[record.date] = record;
    });
    setAvailability(availabilityMap);
  };

  const updateDateStatus = async (date: Date, status: "OPEN" | "BLOCKED") => {
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      const { error } = await supabase
        .from("availability")
        .upsert({
          listing_id: selectedListing,
          date: dateStr,
          status: status,
        });

      if (error) throw error;

      setAvailability((prev) => ({
        ...prev,
        [dateStr]: { ...prev[dateStr], date: dateStr, status, price_override: prev[dateStr]?.price_override || null },
      }));

      toast.success(`Date marked as ${status}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const setPriceForDate = async () => {
    if (!selectedDate || !priceOverride) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      const { error } = await supabase
        .from("availability")
        .upsert({
          listing_id: selectedListing,
          date: dateStr,
          status: availability[dateStr]?.status || "OPEN",
          price_override: parseFloat(priceOverride),
        });

      if (error) throw error;

      setAvailability((prev) => ({
        ...prev,
        [dateStr]: {
          ...prev[dateStr],
          date: dateStr,
          status: prev[dateStr]?.status || "OPEN",
          price_override: parseFloat(priceOverride),
        },
      }));

      toast.success("Price override set");
      setPriceOverride("");
      setSelectedDate(undefined);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted">No listings yet. Create a listing first.</p>
        </CardContent>
      </Card>
    );
  }

  const getDateStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availability[dateStr]?.status;
  };

  const getDatePrice = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availability[dateStr]?.price_override;
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Select Listing</Label>
        <Select value={selectedListing} onValueChange={setSelectedListing}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {listings.map((listing) => (
              <SelectItem key={listing.id} value={listing.id}>
                {listing.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                open: (date) => getDateStatus(date) === "OPEN",
                blocked: (date) => getDateStatus(date) === "BLOCKED",
                booked: (date) => getDateStatus(date) === "BOOKED",
              }}
              modifiersClassNames={{
                open: "bg-green-100 text-green-900",
                blocked: "bg-gray-300 text-gray-700",
                booked: "bg-blue-100 text-blue-900",
              }}
              className="pointer-events-auto"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-900">Open</Badge>
                <Badge className="bg-gray-300 text-gray-700">Blocked</Badge>
                <Badge className="bg-blue-100 text-blue-900">Booked</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate ? (
              <>
                <div>
                  <p className="font-medium">{format(selectedDate, "dd MMM yyyy")}</p>
                  <p className="text-sm text-muted">
                    Current status: {getDateStatus(selectedDate) || "Not set"}
                  </p>
                  {getDatePrice(selectedDate) && (
                    <p className="text-sm text-muted">
                      Price override: €{getDatePrice(selectedDate)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateDateStatus(selectedDate, "OPEN")}
                    disabled={getDateStatus(selectedDate) === "BOOKED"}
                  >
                    Mark OPEN
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateDateStatus(selectedDate, "BLOCKED")}
                    disabled={getDateStatus(selectedDate) === "BOOKED"}
                  >
                    Mark BLOCKED
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Set Price Override (€)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={priceOverride}
                      onChange={(e) => setPriceOverride(e.target.value)}
                      placeholder="Custom price"
                      disabled={getDateStatus(selectedDate) === "BOOKED"}
                    />
                    <Button onClick={setPriceForDate} disabled={getDateStatus(selectedDate) === "BOOKED"}>
                      Set
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Select a date to manage availability</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};