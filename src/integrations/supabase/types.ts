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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      authorized_emails: {
        Row: {
          created_at: string
          email: string
          email_lower: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_lower?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_lower?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      available_holiday_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          max_participants_kindergarten: number
          max_participants_primary: number
          max_participants_teen: number
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          max_participants_kindergarten?: number
          max_participants_primary?: number
          max_participants_teen?: number
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          max_participants_kindergarten?: number
          max_participants_primary?: number
          max_participants_teen?: number
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      available_wednesdays: {
        Row: {
          created_at: string
          date: string
          id: string
          max_participants_kindergarten: number
          max_participants_primary: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          max_participants_kindergarten?: number
          max_participants_primary?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          max_participants_kindergarten?: number
          max_participants_primary?: number
          updated_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
          profile_id: string
          school_class: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          profile_id: string
          school_class: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          profile_id?: string
          school_class?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      closed_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          reason: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          reason: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          reason?: string
          start_date?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          created_at: string
          hide_rdv_page: boolean
          hide_wednesday_reservations: boolean
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hide_rdv_page?: boolean
          hide_wednesday_reservations?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hide_rdv_page?: boolean
          hide_wednesday_reservations?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      holiday_allowed_classes: {
        Row: {
          created_at: string
          holiday_period_id: string | null
          id: string
          school_class: string
        }
        Insert: {
          created_at?: string
          holiday_period_id?: string | null
          id?: string
          school_class: string
        }
        Update: {
          created_at?: string
          holiday_period_id?: string | null
          id?: string
          school_class?: string
        }
        Relationships: [
          {
            foreignKeyName: "holiday_allowed_classes_holiday_period_id_fkey"
            columns: ["holiday_period_id"]
            isOneToOne: false
            referencedRelation: "available_holiday_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holiday_allowed_classes_holiday_period_id_fkey"
            columns: ["holiday_period_id"]
            isOneToOne: false
            referencedRelation: "holiday_period_dates"
            referencedColumns: ["period_id"]
          },
        ]
      }
      holiday_period_class_mappings: {
        Row: {
          category: string
          created_at: string
          holiday_period_id: string
          id: string
          school_class: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          holiday_period_id: string
          id?: string
          school_class: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          holiday_period_id?: string
          id?: string
          school_class?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "holiday_period_class_mappings_holiday_period_id_fkey"
            columns: ["holiday_period_id"]
            isOneToOne: false
            referencedRelation: "available_holiday_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holiday_period_class_mappings_holiday_period_id_fkey"
            columns: ["holiday_period_id"]
            isOneToOne: false
            referencedRelation: "holiday_period_dates"
            referencedColumns: ["period_id"]
          },
        ]
      }
      holiday_reservations: {
        Row: {
          child_id: string
          created_at: string
          early_dropoff: boolean | null
          id: string
          period_id: string
          reservation_date: string
          reservation_number: string
          status: string | null
          updated_at: string
          without_meal: boolean | null
        }
        Insert: {
          child_id: string
          created_at?: string
          early_dropoff?: boolean | null
          id?: string
          period_id: string
          reservation_date: string
          reservation_number: string
          status?: string | null
          updated_at?: string
          without_meal?: boolean | null
        }
        Update: {
          child_id?: string
          created_at?: string
          early_dropoff?: boolean | null
          id?: string
          period_id?: string
          reservation_date?: string
          reservation_number?: string
          status?: string | null
          updated_at?: string
          without_meal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "holiday_reservations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holiday_reservations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "available_holiday_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holiday_reservations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "holiday_period_dates"
            referencedColumns: ["period_id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepted_cgu: boolean
          automatic_payment: boolean
          created_at: string
          first_name: string | null
          hide_rdv_access: boolean | null
          hide_wednesday_access: boolean | null
          id: string
          is_closed: boolean | null
          is_waiting: boolean | null
          last_name: string | null
          updated_at: string
        }
        Insert: {
          accepted_cgu?: boolean
          automatic_payment?: boolean
          created_at?: string
          first_name?: string | null
          hide_rdv_access?: boolean | null
          hide_wednesday_access?: boolean | null
          id: string
          is_closed?: boolean | null
          is_waiting?: boolean | null
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          accepted_cgu?: boolean
          automatic_payment?: boolean
          created_at?: string
          first_name?: string | null
          hide_rdv_access?: boolean | null
          hide_wednesday_access?: boolean | null
          id?: string
          is_closed?: boolean | null
          is_waiting?: boolean | null
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rdv: {
        Row: {
          created_at: string
          date: string
          heure_debut: string
          heure_fin: string
          id: string
          motifs: string[] | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          heure_debut: string
          heure_fin: string
          id?: string
          motifs?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          heure_debut?: string
          heure_fin?: string
          id?: string
          motifs?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      school_class: {
        Row: {
          category: string
          created_at: string
          id: string
          level: number
          name: string
          order: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          level: number
          name: string
          order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          level?: number
          name?: string
          order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      school_class_categories: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wednesday_allowed_classes: {
        Row: {
          created_at: string
          id: string
          school_class: string
          wednesday_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          school_class: string
          wednesday_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          school_class?: string
          wednesday_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wednesday_allowed_classes_wednesday_id_fkey"
            columns: ["wednesday_id"]
            isOneToOne: false
            referencedRelation: "available_wednesdays"
            referencedColumns: ["id"]
          },
        ]
      }
      wednesday_reservations: {
        Row: {
          child_id: string
          created_at: string
          early_dropoff: boolean | null
          id: string
          reservation_number: string
          status: string | null
          updated_at: string
          wednesday_id: string
          without_meal: boolean | null
        }
        Insert: {
          child_id: string
          created_at?: string
          early_dropoff?: boolean | null
          id?: string
          reservation_number: string
          status?: string | null
          updated_at?: string
          wednesday_id: string
          without_meal?: boolean | null
        }
        Update: {
          child_id?: string
          created_at?: string
          early_dropoff?: boolean | null
          id?: string
          reservation_number?: string
          status?: string | null
          updated_at?: string
          wednesday_id?: string
          without_meal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_wednesday_id"
            columns: ["wednesday_id"]
            isOneToOne: false
            referencedRelation: "available_wednesdays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wednesday_reservations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wednesday_reservations_wednesday_id_fkey"
            columns: ["wednesday_id"]
            isOneToOne: false
            referencedRelation: "available_wednesdays"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      holiday_period_dates: {
        Row: {
          period_id: string | null
          reservation_date: string | null
        }
        Relationships: []
      }
      holiday_reservations_count_by_group: {
        Row: {
          class_group: Database["public"]["Enums"]["school_class_group"] | null
          period_id: string | null
          reservation_count: number | null
          reservation_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holiday_reservations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "available_holiday_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holiday_reservations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "holiday_period_dates"
            referencedColumns: ["period_id"]
          },
        ]
      }
      holiday_reservations_with_children: {
        Row: {
          child_id: string | null
          children: Json | null
          created_at: string | null
          early_dropoff: boolean | null
          id: string | null
          period_id: string | null
          reservation_date: string | null
          reservation_number: string | null
          status: string | null
          updated_at: string | null
          without_meal: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "holiday_reservations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holiday_reservations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "available_holiday_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holiday_reservations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "holiday_period_dates"
            referencedColumns: ["period_id"]
          },
        ]
      }
      holiday_spots_available: {
        Row: {
          available_spots: number | null
          class_group: Database["public"]["Enums"]["school_class_group"] | null
          max_capacity: number | null
          period_id: string | null
          reservation_date: string | null
          reserved_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holiday_reservations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "available_holiday_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holiday_reservations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "holiday_period_dates"
            referencedColumns: ["period_id"]
          },
        ]
      }
      profiles_with_emails: {
        Row: {
          accepted_cgu: boolean | null
          automatic_payment: boolean | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          is_closed: boolean | null
          is_waiting: boolean | null
          last_name: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      wednesday_reservations_with_children: {
        Row: {
          child_id: string | null
          children: Json | null
          created_at: string | null
          early_dropoff: boolean | null
          id: string | null
          reservation_number: string | null
          status: string | null
          updated_at: string | null
          wednesday_id: string | null
          without_meal: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_wednesday_id"
            columns: ["wednesday_id"]
            isOneToOne: false
            referencedRelation: "available_wednesdays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wednesday_reservations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wednesday_reservations_wednesday_id_fkey"
            columns: ["wednesday_id"]
            isOneToOne: false
            referencedRelation: "available_wednesdays"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_holiday_spots_available: {
        Args: {
          p_child_school_class: string
          p_period_id: string
          p_reservation_date: string
        }
        Returns: number
      }
      check_wednesday_spots_available: {
        Args: { child_school_class: string; wednesday_id: string }
        Returns: boolean
      }
      check_wednesday_spots_remaining: {
        Args: { child_school_class: string; wednesday_id: string }
        Returns: number
      }
      debug_holiday_spots_available: {
        Args: {
          p_child_school_class: string
          p_period_id: string
          p_reservation_date: string
        }
        Returns: Json
      }
      get_profiles_with_reservations: {
        Args: { has_reservations: boolean }
        Returns: string[]
      }
      get_school_class_group: {
        Args: { school_class: string }
        Returns: Database["public"]["Enums"]["school_class_group"]
      }
      get_school_class_group_for_period: {
        Args: { p_period_id: string; p_school_class: string }
        Returns: Database["public"]["Enums"]["school_class_group"]
      }
      get_user_emails: {
        Args: { user_ids: string[] }
        Returns: {
          email: string
          id: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      set_admin_username: {
        Args: { username: string }
        Returns: undefined
      }
    }
    Enums: {
      school_class_group: "kindergarten" | "primary" | "teen"
      user_role: "admin" | "user"
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
      school_class_group: ["kindergarten", "primary", "teen"],
      user_role: ["admin", "user"],
    },
  },
} as const
