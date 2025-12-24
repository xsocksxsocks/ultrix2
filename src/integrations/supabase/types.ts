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
      car_inquiries: {
        Row: {
          car_brand: string
          car_id: string
          car_model: string
          car_price: number
          car_year: number
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          is_read: boolean | null
          message: string | null
          notes: string | null
        }
        Insert: {
          car_brand: string
          car_id: string
          car_model: string
          car_price: number
          car_year: number
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          notes?: string | null
        }
        Update: {
          car_brand?: string
          car_id?: string
          car_model?: string
          car_price?: number
          car_year?: number
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_inquiries_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars_for_sale"
            referencedColumns: ["id"]
          },
        ]
      }
      car_sell_requests: {
        Row: {
          appointment_confirmed: boolean | null
          appointment_date: string | null
          appointment_time: string | null
          asking_price: number | null
          brand: string
          color: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          description: string | null
          fuel_type: string
          id: string
          images: string[]
          is_read: boolean | null
          mileage: number
          model: string
          notes: string | null
          status: string | null
          transmission: string
          year: number
        }
        Insert: {
          appointment_confirmed?: boolean | null
          appointment_date?: string | null
          appointment_time?: string | null
          asking_price?: number | null
          brand: string
          color?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          description?: string | null
          fuel_type: string
          id?: string
          images: string[]
          is_read?: boolean | null
          mileage: number
          model: string
          notes?: string | null
          status?: string | null
          transmission: string
          year: number
        }
        Update: {
          appointment_confirmed?: boolean | null
          appointment_date?: string | null
          appointment_time?: string | null
          asking_price?: number | null
          brand?: string
          color?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          description?: string | null
          fuel_type?: string
          id?: string
          images?: string[]
          is_read?: boolean | null
          mileage?: number
          model?: string
          notes?: string | null
          status?: string | null
          transmission?: string
          year?: number
        }
        Relationships: []
      }
      cars_for_sale: {
        Row: {
          brand: string
          color: string | null
          created_at: string
          description: string | null
          features: string[] | null
          fuel_type: string
          id: string
          images: string[]
          is_featured: boolean | null
          is_reserved: boolean | null
          is_sold: boolean | null
          mileage: number
          model: string
          power_hp: number | null
          price: number
          transmission: string
          updated_at: string
          year: number
        }
        Insert: {
          brand: string
          color?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          fuel_type: string
          id?: string
          images: string[]
          is_featured?: boolean | null
          is_reserved?: boolean | null
          is_sold?: boolean | null
          mileage: number
          model: string
          power_hp?: number | null
          price: number
          transmission: string
          updated_at?: string
          year: number
        }
        Update: {
          brand?: string
          color?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          fuel_type?: string
          id?: string
          images?: string[]
          is_featured?: boolean | null
          is_reserved?: boolean | null
          is_sold?: boolean | null
          mileage?: number
          model?: string
          power_hp?: number | null
          price?: number
          transmission?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
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
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
