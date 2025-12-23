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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_status: Database["public"]["Enums"]["booking_status"]
          check_in_date: string
          check_out_date: string
          created_at: string
          currency: string
          guests: number
          id: string
          paid_amount: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          payment_type: string | null
          property_id: string
          room_id: string | null
          special_requests: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_status?: Database["public"]["Enums"]["booking_status"]
          check_in_date: string
          check_out_date: string
          created_at?: string
          currency?: string
          guests?: number
          id?: string
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payment_type?: string | null
          property_id: string
          room_id?: string | null
          special_requests?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_status?: Database["public"]["Enums"]["booking_status"]
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          currency?: string
          guests?: number
          id?: string
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payment_type?: string | null
          property_id?: string
          room_id?: string | null
          special_requests?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      host_payout_methods: {
        Row: {
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_branch: string | null
          bank_name: string | null
          created_at: string
          esewa_id: string | null
          esewa_phone: string | null
          host_id: string
          id: string
          is_primary: boolean | null
          method_type: string
          updated_at: string
        }
        Insert: {
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string
          esewa_id?: string | null
          esewa_phone?: string | null
          host_id: string
          id?: string
          is_primary?: boolean | null
          method_type: string
          updated_at?: string
        }
        Update: {
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string
          esewa_id?: string | null
          esewa_phone?: string | null
          host_id?: string
          id?: string
          is_primary?: boolean | null
          method_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          base_price: number
          category: Database["public"]["Enums"]["property_category"]
          created_at: string
          currency: string | null
          description: string | null
          featured_order: number | null
          featured_order_daycation: number | null
          featured_order_full_stay: number | null
          featured_order_hourly: number | null
          featured_order_main: number | null
          featured_order_vibe_chill: number | null
          host_id: string
          hourly_available_slots: string[] | null
          hourly_end_time: string | null
          hourly_minimum_hours: number | null
          hourly_start_time: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_featured_daycation: boolean | null
          is_featured_full_stay: boolean | null
          is_featured_hourly: boolean | null
          is_featured_main: boolean | null
          is_featured_vibe_chill: boolean | null
          is_published: boolean | null
          location: string
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          base_price: number
          category: Database["public"]["Enums"]["property_category"]
          created_at?: string
          currency?: string | null
          description?: string | null
          featured_order?: number | null
          featured_order_daycation?: number | null
          featured_order_full_stay?: number | null
          featured_order_hourly?: number | null
          featured_order_main?: number | null
          featured_order_vibe_chill?: number | null
          host_id: string
          hourly_available_slots?: string[] | null
          hourly_end_time?: string | null
          hourly_minimum_hours?: number | null
          hourly_start_time?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_featured_daycation?: boolean | null
          is_featured_full_stay?: boolean | null
          is_featured_hourly?: boolean | null
          is_featured_main?: boolean | null
          is_featured_vibe_chill?: boolean | null
          is_published?: boolean | null
          location: string
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          base_price?: number
          category?: Database["public"]["Enums"]["property_category"]
          created_at?: string
          currency?: string | null
          description?: string | null
          featured_order?: number | null
          featured_order_daycation?: number | null
          featured_order_full_stay?: number | null
          featured_order_hourly?: number | null
          featured_order_main?: number | null
          featured_order_vibe_chill?: number | null
          host_id?: string
          hourly_available_slots?: string[] | null
          hourly_end_time?: string | null
          hourly_minimum_hours?: number | null
          hourly_start_time?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_featured_daycation?: boolean | null
          is_featured_full_stay?: boolean | null
          is_featured_hourly?: boolean | null
          is_featured_main?: boolean | null
          is_featured_vibe_chill?: boolean | null
          is_published?: boolean | null
          location?: string
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      property_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean
          price_override: number | null
          property_id: string
          room_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean
          price_override?: number | null
          property_id: string
          room_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean
          price_override?: number | null
          property_id?: string
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_availability_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      property_ratings: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          is_visible: boolean | null
          property_id: string
          rating: number
          review: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          property_id: string
          rating: number
          review?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean | null
          property_id?: string
          rating?: number
          review?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_ratings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          bed_type: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          max_guests: number | null
          name: string
          price_override: number | null
          property_id: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          bed_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          max_guests?: number | null
          name: string
          price_override?: number | null
          property_id: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          bed_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          max_guests?: number | null
          name?: string
          price_override?: number | null
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "host" | "user"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      payment_status: "pending" | "partial" | "paid" | "refunded"
      property_category: "hourly" | "daycation" | "full_stay" | "vibe_chill"
    }
    CompositeTypes: {
      [_ in never]: never
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
      app_role: ["admin", "host", "user"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      payment_status: ["pending", "partial", "paid", "refunded"],
      property_category: ["hourly", "daycation", "full_stay", "vibe_chill"],
    },
  },
} as const
