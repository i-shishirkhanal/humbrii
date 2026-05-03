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
      admin_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          details: string | null
          event_type: string | null
          id: string
          metadata: Json | null
          record_id: string | null
          table_name: string | null
          target: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          details?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          record_id?: string | null
          table_name?: string | null
          target?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          details?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          record_id?: string | null
          table_name?: string | null
          target?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_status: Database["public"]["Enums"]["booking_status"]
          check_in_date: string
          check_out_date: string
          created_at: string
          currency: string
          esewa_ref_id: string | null
          guests: number
          id: string
          paid_amount: number | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          payment_type: Database["public"]["Enums"]["payment_provider"] | null
          property_id: string
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
          esewa_ref_id?: string | null
          guests: number
          id?: string
          paid_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payment_type?: Database["public"]["Enums"]["payment_provider"] | null
          property_id: string
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
          esewa_ref_id?: string | null
          guests?: number
          id?: string
          paid_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payment_type?: Database["public"]["Enums"]["payment_provider"] | null
          property_id?: string
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
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          booking_id: string
          created_at: string
          guest_id: string
          host_id: string
          id: string
          priority: string
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          guest_id: string
          host_id: string
          id?: string
          priority?: string
          reason: string
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          guest_id?: string
          host_id?: string
          id?: string
          priority?: string
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      host_payout_methods: {
        Row: {
          account_holder_name: string
          account_number: string | null
          bank_name: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          provider: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_holder_name: string
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          provider: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          provider?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "host_payout_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          base_price: number
          bathrooms: number
          bedrooms: number
          beds: number
          category: Database["public"]["Enums"]["property_category"]
          check_in_time: string | null
          check_out_time: string | null
          city: string
          created_at: string | null
          currency: string
          description: string | null
          featured_order: number | null
          featured_order_daycation: number | null
          featured_order_full_stay: number | null
          featured_order_hourly: number | null
          featured_order_main: number | null
          featured_order_vibe_chill: number | null
          host_id: string
          host_name: string | null
          hourly_available_slots: string[] | null
          hourly_end_time: string | null
          hourly_minimum_hours: number
          hourly_start_time: string | null
          house_rules: string[] | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_featured_daycation: boolean | null
          is_featured_full_stay: boolean | null
          is_featured_hourly: boolean | null
          is_featured_main: boolean | null
          is_featured_vibe_chill: boolean | null
          is_published: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          max_guests: number
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          base_price: number
          bathrooms?: number
          bedrooms?: number
          beds?: number
          category?: Database["public"]["Enums"]["property_category"]
          check_in_time?: string | null
          check_out_time?: string | null
          city: string
          created_at?: string | null
          currency?: string
          description?: string | null
          featured_order?: number | null
          featured_order_daycation?: number | null
          featured_order_full_stay?: number | null
          featured_order_hourly?: number | null
          featured_order_main?: number | null
          featured_order_vibe_chill?: number | null
          host_id: string
          host_name?: string | null
          hourly_available_slots?: string[] | null
          hourly_end_time?: string | null
          hourly_minimum_hours?: number
          hourly_start_time?: string | null
          house_rules?: string[] | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_featured_daycation?: boolean | null
          is_featured_full_stay?: boolean | null
          is_featured_hourly?: boolean | null
          is_featured_main?: boolean | null
          is_featured_vibe_chill?: boolean | null
          is_published?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_guests?: number
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          base_price?: number
          bathrooms?: number
          bedrooms?: number
          beds?: number
          category?: Database["public"]["Enums"]["property_category"]
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          featured_order?: number | null
          featured_order_daycation?: number | null
          featured_order_full_stay?: number | null
          featured_order_hourly?: number | null
          featured_order_main?: number | null
          featured_order_vibe_chill?: number | null
          host_id?: string
          host_name?: string | null
          hourly_available_slots?: string[] | null
          hourly_end_time?: string | null
          hourly_minimum_hours?: number
          hourly_start_time?: string | null
          house_rules?: string[] | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_featured_daycation?: boolean | null
          is_featured_full_stay?: boolean | null
          is_featured_hourly?: boolean | null
          is_featured_main?: boolean | null
          is_featured_vibe_chill?: boolean | null
          is_published?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          max_guests?: number
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_availability: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_available: boolean | null
          price_override: number | null
          property_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_available?: boolean | null
          price_override?: number | null
          property_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_available?: boolean | null
          price_override?: number | null
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_ratings: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          property_id: string | null
          rating: number
          review: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          property_id?: string | null
          rating: number
          review?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          property_id?: string | null
          rating?: number
          review?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ratings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_booking_payment: {
        Args: {
          p_booking_id: string
          p_amount_paid: number
          p_provider_tx_id: string
          p_payment_method?: string
        }
        Returns: Json
      }
      create_booking: {
        Args: {
          property_id: string
          check_in_date: string
          check_out_date: string
          guests: number
          payment_type: string
        }
        Returns: Json
      }
      create_property: {
        Args: {
          payload: Json
        }
        Returns: Json
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      request_host_access: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      update_property: {
        Args: {
          property_id: string
          payload: Json
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "host" | "user"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      payment_intent_status:
      | "initiated"
      | "paid"
      | "failed"
      | "expired"
      | "refund_needed"
      payment_provider: "esewa" | "cash"
      payment_status: "pending" | "partial" | "paid" | "refunded"
      property_category: "hourly" | "daycation" | "full_stay" | "vibe_chill"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
