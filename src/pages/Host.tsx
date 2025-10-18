import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReservationTable } from "@/components/ReservationTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
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
        
        <Card>
          <CardHeader>
            <CardTitle>Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationTable
              reservations={reservations}
              onUpdate={fetchReservations}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Host;
