export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      amenities: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      availability: {
        Row: {
          created_at: string
          date: string
          id: string
          listing_id: string
          price_override: number | null
          status: Database["public"]["Enums"]["availability_status"]
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          listing_id: string
          price_override?: number | null
          status?: Database["public"]["Enums"]["availability_status"]
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          listing_id?: string
          price_override?: number | null
          status?: Database["public"]["Enums"]["availability_status"]
        }
        Relationships: [
          {
            foreignKeyName: "availability_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_summary_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          check_in: string
          check_out: string
          cleaning_fee: number
          created_at: string
          guest_id: string
          guests_count: number
          id: string
          listing_id: string
          nightly_price: number
          service_fee: number
          status: Database["public"]["Enums"]["booking_status"]
          taxes: number
          total: number
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          cleaning_fee?: number
          created_at?: string
          guest_id: string
          guests_count: number
          id?: string
          listing_id: string
          nightly_price: number
          service_fee?: number
          status?: Database["public"]["Enums"]["booking_status"]
          taxes?: number
          total: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          cleaning_fee?: number
          created_at?: string
          guest_id?: string
          guests_count?: number
          id?: string
          listing_id?: string
          nightly_price?: number
          service_fee?: number
          status?: Database["public"]["Enums"]["booking_status"]
          taxes?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_summary_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_amenities: {
        Row: {
          amenity_id: string
          listing_id: string
        }
        Insert: {
          amenity_id: string
          listing_id: string
        }
        Update: {
          amenity_id?: string
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_amenities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_summary_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_amenities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_summary_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string | null
          base_price: number
          city: string
          cleaning_fee: number
          country: string
          created_at: string
          description: string | null
          host_approval_required: boolean | null
          host_id: string
          id: string
          lat: number | null
          lng: number | null
          max_guests: number
          property_type: string
          rating_avg: number | null
          rating_count: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          base_price: number
          city: string
          cleaning_fee?: number
          country?: string
          created_at?: string
          description?: string | null
          host_approval_required?: boolean | null
          host_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          max_guests: number
          property_type: string
          rating_avg?: number | null
          rating_count?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          base_price?: number
          city?: string
          cleaning_fee?: number
          country?: string
          created_at?: string
          description?: string | null
          host_approval_required?: boolean | null
          host_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          max_guests?: number
          property_type?: string
          rating_avg?: number | null
          rating_count?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          guest_id: string
          id: string
          listing_id: string
          rating: number
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          guest_id: string
          id?: string
          listing_id: string
          rating: number
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          guest_id?: string
          id?: string
          listing_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_summary_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      listing_summary_v: {
        Row: {
          base_price: number | null
          city: string | null
          cleaning_fee: number | null
          country: string | null
          first_photo_url: string | null
          host_approval_required: boolean | null
          host_id: string | null
          id: string | null
          max_guests: number | null
          property_type: string | null
          rating_avg: number | null
          rating_count: number | null
          slug: string | null
          title: string | null
        }
        Insert: {
          base_price?: number | null
          city?: string | null
          cleaning_fee?: number | null
          country?: string | null
          first_photo_url?: never
          host_approval_required?: boolean | null
          host_id?: string | null
          id?: string | null
          max_guests?: number | null
          property_type?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          base_price?: number | null
          city?: string | null
          cleaning_fee?: number | null
          country?: string | null
          first_photo_url?: never
          host_approval_required?: boolean | null
          host_id?: string | null
          id?: string | null
          max_guests?: number | null
          property_type?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          slug?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      fn_compute_total: {
        Args: { _cleaning: number; _nightly: number; _nights: number }
        Returns: Database["public"]["CompositeTypes"]["pricing_breakdown"]
        SetofOptions: {
          from: "*"
          to: "pricing_breakdown"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fn_host_update_booking_status: {
        Args: {
          _booking_id: string
          _new_status: Database["public"]["Enums"]["booking_status"]
        }
        Returns: undefined
      }
      fn_range_available: {
        Args: { _check_in: string; _check_out: string; _listing_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "Guest" | "Host"
      availability_status: "OPEN" | "BLOCKED" | "BOOKED"
      booking_status: "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED"
      property_type: "apartment" | "house" | "villa" | "studio" | "loft"
      user_role: "Guest" | "Host"
    }
    CompositeTypes: {
      pricing_breakdown: {
        subtotal: number | null
        service_fee: number | null
        taxes: number | null
        total: number | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["Guest", "Host"],
      availability_status: ["OPEN", "BLOCKED", "BOOKED"],
      booking_status: ["PENDING", "CONFIRMED", "DECLINED", "CANCELLED"],
      property_type: ["apartment", "house", "villa", "studio", "loft"],
      user_role: ["Guest", "Host"],
    },
  },
} as const
