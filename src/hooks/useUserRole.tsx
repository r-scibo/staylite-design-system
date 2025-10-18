import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "Guest" | "Host" | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user is host@test.com and auto-assign Host role
        if (user.email === "host@test.com") {
          const { data: existingRole } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "Host")
            .single();

          if (!existingRole) {
            await supabase
              .from("user_roles")
              .insert({ user_id: user.id, role: "Host" });
          }
        }

        // Fetch user roles
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) throw error;

        // Check if user has Host role, otherwise default to Guest
        const hasHostRole = data?.some((r) => r.role === "Host");
        setRole(hasHostRole ? "Host" : "Guest");
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole("Guest"); // Default to Guest on error
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading };
};
