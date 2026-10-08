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
        ComputedFields: never
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
        ComputedFields: never
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
        ComputedFields: never
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
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
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
      email_outbox: {
        Row: {
          application_id: string | null
          attempts: number
          audience: string
          created_at: string
          data: NonNullable<Json>
          dedupe_key: string | null
          id: string
          last_error: string | null
          locked_at: string | null
          next_attempt_at: string
          provider: string | null
          provider_id: string | null
          recipient_id: string | null
          sent_at: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["email_status"]
          subject: string | null
          template: string
          to_email: string
          to_name: string | null
        }
        ComputedFields: never
        Insert: {
          application_id?: string | null
          attempts?: number
          audience: string
          created_at?: string
          data?: NonNullable<Json>
          dedupe_key?: string | null
          id?: string
          last_error?: string | null
          locked_at?: string | null
          next_attempt_at?: string
          provider?: string | null
          provider_id?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string | null
          template: string
          to_email: string
          to_name?: string | null
        }
        Update: {
          application_id?: string | null
          attempts?: number
          audience?: string
          created_at?: string
          data?: NonNullable<Json>
          dedupe_key?: string | null
          id?: string
          last_error?: string | null
          locked_at?: string | null
          next_attempt_at?: string
          provider?: string | null
          provider_id?: string | null
          recipient_id?: string | null
          sent_at?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string | null
          template?: string
          to_email?: string
          to_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_outbox_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "expert_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_outbox_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_outbox_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "email_outbox_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
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
          payout_account: string | null
          payout_method: Database["public"]["Enums"]["payout_method"] | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string | null
        }
        ComputedFields: never
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
          payout_account?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
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
          payout_account?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
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
        ComputedFields: never
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
      expert_payouts: {
        Row: {
          account: string | null
          amount: number
          created_by: string | null
          expert_id: string
          id: string
          method: Database["public"]["Enums"]["payout_method"]
          paid_at: string
          period_label: string | null
          reference: string | null
          service_id: string
        }
        ComputedFields: never
        Insert: {
          account?: string | null
          amount: number
          created_by?: string | null
          expert_id: string
          id?: string
          method: Database["public"]["Enums"]["payout_method"]
          paid_at?: string
          period_label?: string | null
          reference?: string | null
          service_id: string
        }
        Update: {
          account?: string | null
          amount?: number
          created_by?: string | null
          expert_id?: string
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          paid_at?: string
          period_label?: string | null
          reference?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_payouts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_payouts_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_payouts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "expert_payouts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
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
          payout_account: string | null
          payout_method: Database["public"]["Enums"]["payout_method"] | null
          rating_avg: number
          rating_count: number
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          approved_at?: string
          approved_by?: string | null
          bio?: string | null
          category_ids?: string[]
          is_available?: boolean
          payout_account?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
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
          payout_account?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
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
      holidays: {
        Row: {
          day: string
          name: string
        }
        ComputedFields: never
        Insert: {
          day: string
          name: string
        }
        Update: {
          day?: string
          name?: string
        }
        Relationships: []
      }
      payment_accounts: {
        Row: {
          account_number: string
          account_type: string
          active: boolean
          bank: string
          created_at: string
          holder: string
          holder_id: string | null
          id: string
          sort_order: number
        }
        ComputedFields: never
        Insert: {
          account_number: string
          account_type: string
          active?: boolean
          bank: string
          created_at?: string
          holder: string
          holder_id?: string | null
          id?: string
          sort_order?: number
        }
        Update: {
          account_number?: string
          account_type?: string
          active?: boolean
          bank?: string
          created_at?: string
          holder?: string
          holder_id?: string | null
          id?: string
          sort_order?: number
        }
        Relationships: []
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
        ComputedFields: never
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
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
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
        ComputedFields: never
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
      quote_items: {
        Row: {
          created_at: string
          description: string
          id: string
          line_total: number | null
          measurement: string | null
          position: number
          quantity: number
          quote_id: string
          unit: string
          unit_price: number
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          description: string
          id?: string
          line_total?: never
          measurement?: string | null
          position?: number
          quantity?: number
          quote_id: string
          unit?: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          line_total?: never
          measurement?: string | null
          position?: number
          quantity?: number
          quote_id?: string
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "service_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_materials: {
        Row: {
          created_at: string
          estimated_cost: number | null
          id: string
          name: string
          notes: string | null
          position: number
          quantity: number
          quote_id: string
          unit: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          name: string
          notes?: string | null
          position?: number
          quantity?: number
          quote_id: string
          unit?: string
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          name?: string
          notes?: string | null
          position?: number
          quantity?: number
          quote_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_materials_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "service_quotes"
            referencedColumns: ["id"]
          },
        ]
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
        ComputedFields: never
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
          payload: NonNullable<Json>
          service_id: string
          to_status: Database["public"]["Enums"]["service_status"] | null
          type: string
        }
        ComputedFields: never
        Insert: {
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["service_status"] | null
          id?: string
          payload?: NonNullable<Json>
          service_id: string
          to_status?: Database["public"]["Enums"]["service_status"] | null
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["service_status"] | null
          id?: string
          payload?: NonNullable<Json>
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
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
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
          kind: string
          service_id: string
          storage_path: string
          uploaded_by: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          service_id: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          service_id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_photos_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
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
      service_quotes: {
        Row: {
          admin_notes: string | null
          approved_labor_total: number | null
          created_at: string
          estimated_days: number | null
          expert_id: string
          id: string
          labor_total: number
          materials_total: number
          notes: string | null
          pricing_mode: Database["public"]["Enums"]["pricing_mode"]
          reviewed_at: string | null
          reviewed_by: string | null
          service_id: string
          status: Database["public"]["Enums"]["quote_status"]
          submitted_at: string | null
          total: number | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          admin_notes?: string | null
          approved_labor_total?: number | null
          created_at?: string
          estimated_days?: number | null
          expert_id: string
          id?: string
          labor_total?: number
          materials_total?: number
          notes?: string | null
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_id: string
          status?: Database["public"]["Enums"]["quote_status"]
          submitted_at?: string | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approved_labor_total?: number | null
          created_at?: string
          estimated_days?: number | null
          expert_id?: string
          id?: string
          labor_total?: number
          materials_total?: number
          notes?: string | null
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_id?: string
          status?: Database["public"]["Enums"]["quote_status"]
          submitted_at?: string | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_quotes_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_quotes_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_quotes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_quotes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "services"
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
        ComputedFields: never
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
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
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
        ComputedFields: never
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
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
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
          availability: NonNullable<Json>
          cancel_reason: string | null
          category_id: string
          city: string | null
          client_id: string
          closed_at: string | null
          closing_notes: string | null
          commission_pct: number
          completed_at: string | null
          created_at: string
          description: string
          estimated_price: number | null
          expert_id: string | null
          id: string
          pause_reason: string | null
          payment_date: string | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          review_due_date: string | null
          scheduled_at: string | null
          start_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["service_status"]
          title: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          address?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          availability?: NonNullable<Json>
          cancel_reason?: string | null
          category_id: string
          city?: string | null
          client_id: string
          closed_at?: string | null
          closing_notes?: string | null
          commission_pct?: number
          completed_at?: string | null
          created_at?: string
          description: string
          estimated_price?: number | null
          expert_id?: string | null
          id?: string
          pause_reason?: string | null
          payment_date?: string | null
          payout_frequency?: Database["public"]["Enums"]["payout_frequency"]
          review_due_date?: string | null
          scheduled_at?: string | null
          start_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["service_status"]
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          availability?: NonNullable<Json>
          cancel_reason?: string | null
          category_id?: string
          city?: string | null
          client_id?: string
          closed_at?: string | null
          closing_notes?: string | null
          commission_pct?: number
          completed_at?: string | null
          created_at?: string
          description?: string
          estimated_price?: number | null
          expert_id?: string | null
          id?: string
          pause_reason?: string | null
          payment_date?: string | null
          payout_frequency?: Database["public"]["Enums"]["payout_frequency"]
          review_due_date?: string | null
          scheduled_at?: string | null
          start_date?: string | null
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
      work_log_photos: {
        Row: {
          created_at: string
          id: string
          log_id: string
          storage_path: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          log_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          log_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_log_photos_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "work_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      work_logs: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          expert_id: string
          id: string
          notes: string | null
          service_id: string
          updated_at: string
          work_date: string
        }
        ComputedFields: never
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          expert_id: string
          id?: string
          notes?: string | null
          service_id: string
          updated_at?: string
          work_date: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          expert_id?: string
          id?: string
          notes?: string | null
          service_id?: string
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_logs_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_logs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "work_logs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      service_schedule: {
        Row: {
          business_days_to_start: number | null
          estimated_days: number | null
          estimated_end_date: string | null
          payment_date: string | null
          payout_frequency:
            | Database["public"]["Enums"]["payout_frequency"]
            | null
          pricing_mode: Database["public"]["Enums"]["pricing_mode"] | null
          review_due_date: string | null
          service_id: string | null
          start_date: string | null
          start_offset_days: number | null
          status: Database["public"]["Enums"]["service_status"] | null
        }
        ComputedFields: never
        Relationships: []
      }
    }
    Functions: {
      _build_contract: {
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
      _emails_enabled: { Args: Record<PropertyKey, never>; Returns: boolean }
      _enqueue_admin_email: {
        Args: {
          p_application: string
          p_data: Json
          p_dedupe: string
          p_service: string
          p_template: string
        }
        Returns: undefined
      }
      _enqueue_email: {
        Args: {
          p_application: string
          p_audience: string
          p_data: Json
          p_dedupe: string
          p_email: string
          p_name: string
          p_recipient: string
          p_service: string
          p_template: string
        }
        Returns: undefined
      }
      _enqueue_profile_email: {
        Args: {
          p_application: string
          p_audience: string
          p_data: Json
          p_dedupe: string
          p_profile: string
          p_service: string
          p_template: string
        }
        Returns: undefined
      }
      _payment_accounts_json: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      _service_email_data: { Args: { p_service: string }; Returns: Json }
      add_business_days: {
        Args: { p_days: number; p_from: string }
        Returns: string
      }
      admin_dashboard: { Args: Record<PropertyKey, never>; Returns: Json }
      admin_move_service: {
        Args: {
          p_reason?: string
          p_service_id: string
          p_target: Database["public"]["Enums"]["service_status"]
        }
        Returns: {
          address: string | null
          assigned_at: string | null
          assigned_by: string | null
          availability: NonNullable<Json>
          cancel_reason: string | null
          category_id: string
          city: string | null
          client_id: string
          closed_at: string | null
          closing_notes: string | null
          commission_pct: number
          completed_at: string | null
          created_at: string
          description: string
          estimated_price: number | null
          expert_id: string | null
          id: string
          pause_reason: string | null
          payment_date: string | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          review_due_date: string | null
          scheduled_at: string | null
          start_date: string | null
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
          payout_account: string | null
          payout_method: Database["public"]["Enums"]["payout_method"] | null
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
      approve_quote: {
        Args: {
          p_labor_total: number
          p_materials_total?: number
          p_notes?: string
          p_service_id: string
        }
        Returns: {
          admin_notes: string | null
          approved_labor_total: number | null
          created_at: string
          estimated_days: number | null
          expert_id: string
          id: string
          labor_total: number
          materials_total: number
          notes: string | null
          pricing_mode: Database["public"]["Enums"]["pricing_mode"]
          reviewed_at: string | null
          reviewed_by: string | null
          service_id: string
          status: Database["public"]["Enums"]["quote_status"]
          submitted_at: string | null
          total: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "service_quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_service: {
        Args: {
          p_expert_id: string
          p_scheduled_at?: string
          p_service_id: string
        }
        Returns: {
          address: string | null
          assigned_at: string | null
          assigned_by: string | null
          availability: NonNullable<Json>
          cancel_reason: string | null
          category_id: string
          city: string | null
          client_id: string
          closed_at: string | null
          closing_notes: string | null
          commission_pct: number
          completed_at: string | null
          created_at: string
          description: string
          estimated_price: number | null
          expert_id: string | null
          id: string
          pause_reason: string | null
          payment_date: string | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          review_due_date: string | null
          scheduled_at: string | null
          start_date: string | null
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
      business_days_between: {
        Args: { p_from: string; p_to: string }
        Returns: number
      }
      can_edit_quote: { Args: { p_quote_id: string }; Returns: boolean }
      can_log_work: {
        Args: { p_service_id: string; p_work_date: string }
        Returns: boolean
      }
      claim_email_outbox: {
        Args: { p_limit?: number }
        Returns: {
          application_id: string | null
          attempts: number
          audience: string
          created_at: string
          data: NonNullable<Json>
          dedupe_key: string | null
          id: string
          last_error: string | null
          locked_at: string | null
          next_attempt_at: string
          provider: string | null
          provider_id: string | null
          recipient_id: string | null
          sent_at: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["email_status"]
          subject: string | null
          template: string
          to_email: string
          to_name: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "email_outbox"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      close_work: {
        Args: { p_notes?: string; p_service_id: string }
        Returns: {
          address: string | null
          assigned_at: string | null
          assigned_by: string | null
          availability: NonNullable<Json>
          cancel_reason: string | null
          category_id: string
          city: string | null
          client_id: string
          closed_at: string | null
          closing_notes: string | null
          commission_pct: number
          completed_at: string | null
          created_at: string
          description: string
          estimated_price: number | null
          expert_id: string | null
          id: string
          pause_reason: string | null
          payment_date: string | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          review_due_date: string | null
          scheduled_at: string | null
          start_date: string | null
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
      close_work_missing: { Args: { p_service_id: string }; Returns: string[] }
      configure_email_dispatch: {
        Args: { p_key: string; p_url: string }
        Returns: undefined
      }
      current_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      dispatch_email_outbox: {
        Args: { p_only_if_due?: boolean }
        Returns: number
      }
      expert_can_choose_frequency: {
        Args: { p_expert_id: string }
        Returns: boolean
      }
      expert_satisfactory_count: {
        Args: { p_expert_id: string }
        Returns: number
      }
      fmt_cop: { Args: { p: number }; Returns: string }
      fmt_qty: { Args: { p: number }; Returns: string }
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
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_business_day: { Args: { p_day: string }; Returns: boolean }
      is_service_party: { Args: { p_service_id: string }; Returns: boolean }
      open_next_stage: { Args: { p_service_id: string }; Returns: undefined }
      payout_frequency_label: {
        Args: { p: Database["public"]["Enums"]["payout_frequency"] }
        Returns: string
      }
      payout_method_label: {
        Args: { p: Database["public"]["Enums"]["payout_method"] }
        Returns: string
      }
      retry_email: { Args: { p_id: string }; Returns: undefined }
      return_quote: {
        Args: { p_notes: string; p_service_id: string }
        Returns: {
          admin_notes: string | null
          approved_labor_total: number | null
          created_at: string
          estimated_days: number | null
          expert_id: string
          id: string
          labor_total: number
          materials_total: number
          notes: string | null
          pricing_mode: Database["public"]["Enums"]["pricing_mode"]
          reviewed_at: string | null
          reviewed_by: string | null
          service_id: string
          status: Database["public"]["Enums"]["quote_status"]
          submitted_at: string | null
          total: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "service_quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
          payout_account: string | null
          payout_method: Database["public"]["Enums"]["payout_method"] | null
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
      set_payout_frequency: {
        Args: {
          p_frequency: Database["public"]["Enums"]["payout_frequency"]
          p_service_id: string
        }
        Returns: {
          address: string | null
          assigned_at: string | null
          assigned_by: string | null
          availability: NonNullable<Json>
          cancel_reason: string | null
          category_id: string
          city: string | null
          client_id: string
          closed_at: string | null
          closing_notes: string | null
          commission_pct: number
          completed_at: string | null
          created_at: string
          description: string
          estimated_price: number | null
          expert_id: string | null
          id: string
          pause_reason: string | null
          payment_date: string | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          review_due_date: string | null
          scheduled_at: string | null
          start_date: string | null
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
      start_due_services: { Args: Record<PropertyKey, never>; Returns: number }
      start_offset_days: {
        Args: { p: Database["public"]["Enums"]["pricing_mode"] }
        Returns: number
      }
      submit_quote: {
        Args: { p_service_id: string }
        Returns: {
          admin_notes: string | null
          approved_labor_total: number | null
          created_at: string
          estimated_days: number | null
          expert_id: string
          id: string
          labor_total: number
          materials_total: number
          notes: string | null
          pricing_mode: Database["public"]["Enums"]["pricing_mode"]
          reviewed_at: string | null
          reviewed_by: string | null
          service_id: string
          status: Database["public"]["Enums"]["quote_status"]
          submitted_at: string | null
          total: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "service_quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      today_co: { Args: Record<PropertyKey, never>; Returns: string }
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
        | "bank_certificate"
      email_status: "pending" | "sending" | "sent" | "failed"
      payment_method: "transfer" | "cash" | "mercado_pago" | "tucompra"
      payment_status: "submitted" | "verified" | "rejected"
      payout_frequency:
        | "daily"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "on_completion"
      payout_method: "bank_account" | "nequi" | "efecty"
      pricing_mode: "labor_only" | "all_inclusive"
      quote_status: "draft" | "submitted" | "returned" | "approved"
      service_status:
        | "requested"
        | "quoting"
        | "pending_payment"
        | "scheduled"
        | "assigned"
        | "in_progress"
        | "paused"
        | "under_review"
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
        "bank_certificate",
      ],
      email_status: ["pending", "sending", "sent", "failed"],
      payment_method: ["transfer", "cash", "mercado_pago", "tucompra"],
      payment_status: ["submitted", "verified", "rejected"],
      payout_frequency: [
        "daily",
        "weekly",
        "biweekly",
        "monthly",
        "on_completion",
      ],
      payout_method: ["bank_account", "nequi", "efecty"],
      pricing_mode: ["labor_only", "all_inclusive"],
      quote_status: ["draft", "submitted", "returned", "approved"],
      service_status: [
        "requested",
        "quoting",
        "pending_payment",
        "scheduled",
        "assigned",
        "in_progress",
        "paused",
        "under_review",
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
