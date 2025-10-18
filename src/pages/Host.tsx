import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReservationTable } from "@/components/ReservationTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HostListingsTab } from "@/components/HostListingsTab";
import { HostCalendarTab } from "@/components/HostCalendarTab";
import { PendingBookingRequests } from "@/components/PendingBookingRequests";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Reservation = Database["public"]["Tables"]["bookings"]["Row"] & {
  listings: {
    title: string;
  };
  profiles: {
    name: string | null;
  };
};

const Host = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
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
          *,
          listings!inner (
            title,
            host_id
          ),
          profiles!bookings_guest_id_fkey (
            name
          )
        `)
        .eq("listings.host_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Host-only area (seed account: host@test.com / Host!234)
          </AlertDescription>
        </Alert>
        
        <h1 className="text-4xl font-bold mb-6">Host Dashboard</h1>
        
        {/* Pending Requests Section */}
        <div className="mb-6">
          <PendingBookingRequests />
        </div>
        
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <HostListingsTab />
          </TabsContent>

          <TabsContent value="calendar">
            <HostCalendarTab />
          </TabsContent>

          <TabsContent value="reservations">
            <ReservationTable
              reservations={reservations}
              onUpdate={fetchReservations}
            />
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12 text-muted">
              Settings coming soon
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Host;
