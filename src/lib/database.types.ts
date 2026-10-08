export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          file_name: string
          id: string
          kind: Database["public"]["Enums"]["document_kind"]
          mime_type: string | null
          storage_path: string
        }
        Insert: {
          application_id: string
          created_at?: string
          file_name: string
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          mime_type?: string | null
          storage_path: string
        }
        Update: {
          application_id?: string
          created_at?: string
          file_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          mime_type?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "expert_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          accepted_terms: boolean
          body_hash: string
          contract_id: string
          id: string
          ip: string | null
          signature_image_path: string | null
          signed_at: string
          signer_id: string
          signer_role: Database["public"]["Enums"]["user_role"]
          user_agent: string | null
        }
        Insert: {
          accepted_terms?: boolean
          body_hash: string
          contract_id: string
          id?: string
          ip?: string | null
          signature_image_path?: string | null
          signed_at?: string
          signer_id: string
          signer_role: Database["public"]["Enums"]["user_role"]
          user_agent?: string | null
        }
        Update: {
          accepted_terms?: boolean
          body_hash?: string
          contract_id?: string
          id?: string
          ip?: string | null
          signature_image_path?: string | null
          signed_at?: string
          signer_id?: string
          signer_role?: Database["public"]["Enums"]["user_role"]
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          body_hash: string
          body_md: string
          created_at: string
          created_by: string | null
          id: string
          service_id: string
          status: Database["public"]["Enums"]["contract_status"]
          updated_at: string
          version: number
        }
        Insert: {
          body_hash: string
          body_md: string
          created_at?: string
          created_by?: string | null
          id?: string
          service_id: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          body_hash?: string
          body_md?: string
          created_at?: string
          created_by?: string | null
          id?: string
          service_id?: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_applications: {
        Row: {
          admin_notes: string | null
          bio: string | null
          category_ids: string[]
          city: string | null
          created_at: string
          email: string
          experience_years: number | null
          full_name: string
          id: string
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          bio?: string | null
          category_ids?: string[]
          city?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          bio?: string | null
          category_ids?: string[]
          city?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_availability: {
        Row: {
          end_time: string
          expert_id: string
          id: string
          start_time: string
          weekday: number
        }
        Insert: {
          end_time: string
          expert_id: string
          id?: string
          start_time: string
          weekday: number
        }
        Update: {
          end_time?: string
          expert_id?: string
          id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "expert_availability_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      expert_profiles: {
        Row: {
          approved_at: string
          approved_by: string | null
          bio: string | null
          category_ids: string[]
          is_available: boolean
          rating_avg: number
          rating_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string
          approved_by?: string | null
          bio?: string | null
          category_ids?: string[]
          is_available?: boolean
          rating_avg?: number
          rating_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string
          approved_by?: string | null
          bio?: string | null
          category_ids?: string[]
          is_available?: boolean
          rating_avg?: number
          rating_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          proof_path: string | null
          provider_ref: string | null
          service_id: string
          stage_id: string
          status: Database["public"]["Enums"]["payment_status"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          proof_path?: string | null
          provider_ref?: string | null
          service_id: string
          stage_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          proof_path?: string | null
          provider_ref?: string | null
          service_id?: string
          stage_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "service_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          active: boolean
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      service_events: {
        Row: {
          actor_id: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["service_status"] | null
          id: string
          payload: Json
          service_id: string
          to_status: Database["public"]["Enums"]["service_status"] | null
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["service_status"] | null
          id?: string
          payload?: Json
          service_id: string
          to_status?: Database["public"]["Enums"]["service_status"] | null
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["service_status"] | null
          id?: string
          payload?: Json
          service_id?: string
          to_status?: Database["public"]["Enums"]["service_status"] | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_events_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_photos: {
        Row: {
          created_at: string
          id: string
          service_id: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_photos_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          author_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          service_id: string
          target_id: string
        }
        Insert: {
          author_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          service_id: string
          target_id: string
        }
        Update: {
          author_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          service_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_stages: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          position: number
          service_id: string
          status: Database["public"]["Enums"]["stage_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          position?: number
          service_id: string
          status?: Database["public"]["Enums"]["stage_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          position?: number
          service_id?: string
          status?: Database["public"]["Enums"]["stage_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_stages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          address: string | null
          assigned_at: string | null
          assigned_by: string | null
          availability: Json
          cancel_reason: string | null
          category_id: string
          city: string | null
          client_id: string
          commission_pct: number
          completed_at: string | null
          created_at: string
          description: string
          estimated_price: number | null
          expert_id: string | null
          id: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["service_status"]
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          availability?: Json
          cancel_reason?: string | null
          category_id: string
          city?: string | null
          client_id: string
          commission_pct?: number
          completed_at?: string | null
          created_at?: string
          description: string
          estimated_price?: number | null
          expert_id?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["service_status"]
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          availability?: Json
          cancel_reason?: string | null
          category_id?: string
          city?: string | null
          client_id?: string
          commission_pct?: number
          completed_at?: string | null
          created_at?: string
          description?: string
          estimated_price?: number | null
          expert_id?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["service_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_dashboard: { Args: never; Returns: Json }
      approve_application: {
        Args: { p_application_id: string; p_notes?: string }
        Returns: {
          admin_notes: string | null
          bio: string | null
          category_ids: string[]
          city: string | null
          created_at: string
          email: string
          experience_years: number | null
          full_name: string
          id: string
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "expert_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_service: {
        Args: {
          p_estimated_price: number
          p_expert_id: string
          p_scheduled_at?: string
          p_service_id: string
          p_stages: Json
        }
        Returns: {
          address: string | null
          assigned_at: string | null
          assigned_by: string | null
          availability: Json
          cancel_reason: string | null
          category_id: string
          city: string | null
          client_id: string
          commission_pct: number
          completed_at: string | null
          created_at: string
          description: string
          estimated_price: number | null
          expert_id: string | null
          id: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["service_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "services"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      generate_contract: {
        Args: { p_extra_terms?: string; p_service_id: string }
        Returns: {
          body_hash: string
          body_md: string
          created_at: string
          created_by: string | null
          id: string
          service_id: string
          status: Database["public"]["Enums"]["contract_status"]
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "contracts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_expert_application: { Args: { p_user_id: string }; Returns: boolean }
      has_services_as_client: { Args: { p_user_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_service_party: { Args: { p_service_id: string }; Returns: boolean }
      open_next_stage: { Args: { p_service_id: string }; Returns: undefined }
      review_application: {
        Args: {
          p_application_id: string
          p_notes?: string
          p_status: Database["public"]["Enums"]["application_status"]
        }
        Returns: {
          admin_notes: string | null
          bio: string | null
          category_ids: string[]
          city: string | null
          created_at: string
          email: string
          experience_years: number | null
          full_name: string
          id: string
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "expert_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sign_contract: {
        Args: {
          p_body_hash: string
          p_contract_id: string
          p_ip?: string
          p_signature_image_path?: string
          p_user_agent?: string
        }
        Returns: {
          accepted_terms: boolean
          body_hash: string
          contract_id: string
          id: string
          ip: string | null
          signature_image_path: string | null
          signed_at: string
          signer_id: string
          signer_role: Database["public"]["Enums"]["user_role"]
          user_agent: string | null
        }
        SetofOptions: {
          from: "*"
          to: "contract_signatures"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      try_uuid: { Args: { p: string }; Returns: string }
    }
    Enums: {
      application_status:
        | "pending"
        | "in_review"
        | "needs_info"
        | "approved"
        | "rejected"
      contract_status: "draft" | "pending_signatures" | "signed" | "void"
      document_kind:
        | "id_front"
        | "id_back"
        | "rut"
        | "certificate"
        | "portfolio"
        | "background_check"
        | "social_security"
        | "other"
        | "photo"
        | "recommendation_letter"
      payment_method: "transfer" | "cash" | "mercado_pago" | "tucompra"
      payment_status: "submitted" | "verified" | "rejected"
      service_status:
        | "requested"
        | "in_review"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      stage_status:
        | "pending"
        | "awaiting_payment"
        | "proof_uploaded"
        | "paid"
        | "rejected"
      user_role: "client" | "expert" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "pending",
        "in_review",
        "needs_info",
        "approved",
        "rejected",
      ],
      contract_status: ["draft", "pending_signatures", "signed", "void"],
      document_kind: [
        "id_front",
        "id_back",
        "rut",
        "certificate",
        "portfolio",
        "background_check",
        "social_security",
        "other",
        "photo",
        "recommendation_letter",
      ],
      payment_method: ["transfer", "cash", "mercado_pago", "tucompra"],
      payment_status: ["submitted", "verified", "rejected"],
      service_status: [
        "requested",
        "in_review",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      stage_status: [
        "pending",
        "awaiting_payment",
        "proof_uploaded",
        "paid",
        "rejected",
      ],
      user_role: ["client", "expert", "admin"],
    },
  },
} as const

