import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function usePendingBookingsCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        if (!profile) return;

        const { count: pendingCount } = await supabase
          .from("bookings")
          .select("*, listings!inner(host_id)", { count: "exact", head: true })
          .eq("status", "PENDING")
          .eq("listings.host_id", profile.id);

        setCount(pendingCount || 0);
      } catch (error) {
        console.error("Error fetching pending count:", error);
      }
    };

    fetchCount();

    // Set up realtime subscription
    const channel = supabase
      .channel("pending-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return count;
}

