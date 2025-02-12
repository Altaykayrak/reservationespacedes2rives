export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        ]
      }
      profiles: {
        Row: {
          accepted_cgu: boolean
          automatic_payment: boolean
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          school_city: string
          secret_answer: string
          secret_question: string
          updated_at: string
        }
        Insert: {
          accepted_cgu?: boolean
          automatic_payment?: boolean
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          school_city: string
          secret_answer: string
          secret_question: string
          updated_at?: string
        }
        Update: {
          accepted_cgu?: boolean
          automatic_payment?: boolean
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          school_city?: string
          secret_answer?: string
          secret_question?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          child_id: string
          created_at: string
          early_dropoff: boolean | null
          id: string
          period_id: string | null
          reservation_date: string
          reservation_number: string
          status: string | null
          updated_at: string
          wednesday_id: string | null
          without_meal: boolean | null
        }
        Insert: {
          child_id: string
          created_at?: string
          early_dropoff?: boolean | null
          id?: string
          period_id?: string | null
          reservation_date: string
          reservation_number: string
          status?: string | null
          updated_at?: string
          wednesday_id?: string | null
          without_meal?: boolean | null
        }
        Update: {
          child_id?: string
          created_at?: string
          early_dropoff?: boolean | null
          id?: string
          period_id?: string | null
          reservation_date?: string
          reservation_number?: string
          status?: string | null
          updated_at?: string
          wednesday_id?: string | null
          without_meal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_period"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "available_holiday_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "available_holiday_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_wednesday_id_fkey"
            columns: ["wednesday_id"]
            isOneToOne: false
            referencedRelation: "available_wednesdays"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_wednesday_spots_available: {
        Args: {
          wednesday_id: string
          child_school_class: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      set_admin_username: {
        Args: {
          username: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "user"
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
