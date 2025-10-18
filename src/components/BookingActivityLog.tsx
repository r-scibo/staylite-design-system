import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface ActivityItem {
  id: string;
  booking_id: string;
  status: BookingStatus;
  created_at: string;
  listing_title: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
}

const statusConfig = {
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-500/10" },
  CONFIRMED: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-500/10" },
  DECLINED: { icon: XCircle, color: "text-red-600", bg: "bg-red-500/10" },
  CANCELLED: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-500/10" },
};

export function BookingActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          created_at,
          updated_at,
          check_in,
          check_out,
          listings!inner (
            title,
            host_id
          ),
          profiles!bookings_guest_id_fkey (
            name
          )
        `)
        .eq("listings.host_id", profile.id)
        .order("updated_at", { ascending: false })
        .limit(20);

      if (data) {
        const formatted = data.map((item: any) => ({
          id: item.id,
          booking_id: item.id,
          status: item.status,
          created_at: item.updated_at || item.created_at,
          listing_title: item.listings.title,
          guest_name: item.profiles?.name,
          check_in: item.check_in,
          check_out: item.check_out,
        }));
        setActivities(formatted);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Real-time subscription
    const channel = supabase
      .channel("booking-activity")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading activity...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const config = statusConfig[activity.status];
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className={`mt-1 rounded-full p-2 ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            Booking <Badge variant="outline" className="ml-1">{activity.status}</Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.listing_title}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(activity.created_at), "MMM dd, HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Guest: {activity.guest_name || "Unknown"}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(activity.check_in), "dd MMM")} - {format(new Date(activity.check_out), "dd MMM")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
