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
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
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
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path: string
        }
        Update: {
          application_id?: string
          created_at?: string
          file_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          mime_type?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
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
          {
            foreignKeyName: "application_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_sign_requests: {
        Row: {
          body_hash: string
          client_id: string
          code_attempts: number
          code_expires_at: string | null
          code_hash: string | null
          code_sent_at: string | null
          codes_sent: number
          contract_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
        }
        ComputedFields: never
        Insert: {
          body_hash: string
          client_id: string
          code_attempts?: number
          code_expires_at?: string | null
          code_hash?: string | null
          code_sent_at?: string | null
          codes_sent?: number
          contract_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          token_hash: string
          used_at?: string | null
        }
        Update: {
          body_hash?: string
          client_id?: string
          code_attempts?: number
          code_expires_at?: string | null
          code_hash?: string | null
          code_sent_at?: string | null
          codes_sent?: number
          contract_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_sign_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_sign_requests_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          accepted_terms: boolean
          body_hash: string
          contract_id: string
          document_number: string | null
          document_type: string | null
          id: string
          ip: string | null
          method: string
          signature_height: number | null
          signature_image_path: string | null
          signature_svg: string | null
          signature_width: number | null
          signed_at: string
          signer_id: string
          signer_name: string | null
          signer_role: Database["public"]["Enums"]["user_role"]
          user_agent: string | null
        }
        ComputedFields: never
        Insert: {
          accepted_terms?: boolean
          body_hash: string
          contract_id: string
          document_number?: string | null
          document_type?: string | null
          id?: string
          ip?: string | null
          method?: string
          signature_height?: number | null
          signature_image_path?: string | null
          signature_svg?: string | null
          signature_width?: number | null
          signed_at?: string
          signer_id: string
          signer_name?: string | null
          signer_role: Database["public"]["Enums"]["user_role"]
          user_agent?: string | null
        }
        Update: {
          accepted_terms?: boolean
          body_hash?: string
          contract_id?: string
          document_number?: string | null
          document_type?: string | null
          id?: string
          ip?: string | null
          method?: string
          signature_height?: number | null
          signature_image_path?: string | null
          signature_svg?: string | null
          signature_width?: number | null
          signed_at?: string
          signer_id?: string
          signer_name?: string | null
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
          statement: string | null
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
          statement?: string | null
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
          statement?: string | null
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
      departments: {
        Row: {
          code: string
          name: string
          official_name: string
        }
        ComputedFields: never
        Insert: {
          code: string
          name: string
          official_name: string
        }
        Update: {
          code?: string
          name?: string
          official_name?: string
        }
        Relationships: []
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
          department_code: string | null
          email: string
          experience_years: number | null
          expires_at: string
          full_name: string
          id: string
          municipality_code: string | null
          occupation_code: string | null
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
          department_code?: string | null
          email: string
          experience_years?: number | null
          expires_at?: string
          full_name: string
          id?: string
          municipality_code?: string | null
          occupation_code?: string | null
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
          department_code?: string | null
          email?: string
          experience_years?: number | null
          expires_at?: string
          full_name?: string
          id?: string
          municipality_code?: string | null
          occupation_code?: string | null
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
            foreignKeyName: "expert_applications_department_code_fkey"
            columns: ["department_code"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "expert_applications_municipality_code_fkey"
            columns: ["municipality_code"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "expert_applications_occupation_code_fkey"
            columns: ["occupation_code"]
            isOneToOne: false
            referencedRelation: "occupations"
            referencedColumns: ["code"]
          },
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
      municipalities: {
        Row: {
          code: string
          department_code: string
          kind: string | null
          name: string
          official_name: string
        }
        ComputedFields: never
        Insert: {
          code: string
          department_code: string
          kind?: string | null
          name: string
          official_name: string
        }
        Update: {
          code?: string
          department_code?: string
          kind?: string | null
          name?: string
          official_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipalities_department_code_fkey"
            columns: ["department_code"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["code"]
          },
        ]
      }
      notifications: {
        Row: {
          application_id: string | null
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          service_id: string | null
          title: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          application_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          service_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          service_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "expert_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "notifications_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      occupations: {
        Row: {
          active: boolean
          category_id: string
          code: string
          name: string
          sort_order: number
        }
        ComputedFields: never
        Insert: {
          active?: boolean
          category_id: string
          code: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          category_id?: string
          code?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "occupations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      online_payments: {
        Row: {
          amount: number
          charged_amount: number | null
          client_id: string
          created_at: string
          id: string
          payload: Json | null
          payment_id: string | null
          payment_method_type: string | null
          provider_transaction_id: string | null
          reference: string
          service_id: string
          stage_id: string | null
          status: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          amount: number
          charged_amount?: number | null
          client_id: string
          created_at?: string
          id?: string
          payload?: Json | null
          payment_id?: string | null
          payment_method_type?: string | null
          provider_transaction_id?: string | null
          reference: string
          service_id: string
          stage_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          charged_amount?: number | null
          client_id?: string
          created_at?: string
          id?: string
          payload?: Json | null
          payment_id?: string | null
          payment_method_type?: string | null
          provider_transaction_id?: string | null
          reference?: string
          service_id?: string
          stage_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_payments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "online_payments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_payments_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "service_stages"
            referencedColumns: ["id"]
          },
        ]
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
      payment_settings: {
        Row: {
          advance_pct: number
          daily_limit: number
          gateway_fee_fixed: number
          gateway_fee_pct: number
          gateway_vat_pct: number
          id: boolean
          max_charge: number
          max_payment: number
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          advance_pct?: number
          daily_limit?: number
          gateway_fee_fixed?: number
          gateway_fee_pct?: number
          gateway_vat_pct?: number
          id?: boolean
          max_charge?: number
          max_payment?: number
          updated_at?: string
        }
        Update: {
          advance_pct?: number
          daily_limit?: number
          gateway_fee_fixed?: number
          gateway_fee_pct?: number
          gateway_vat_pct?: number
          id?: boolean
          max_charge?: number
          max_payment?: number
          updated_at?: string
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
      profile_identity: {
        Row: {
          document_number: string
          document_type: string
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          document_number: string
          document_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          document_number?: string
          document_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_identity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
          department_code: string | null
          email: string | null
          full_name: string
          id: string
          is_super_admin: boolean
          municipality_code: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          department_code?: string | null
          email?: string | null
          full_name?: string
          id: string
          is_super_admin?: boolean
          municipality_code?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          department_code?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_super_admin?: boolean
          municipality_code?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_code_fkey"
            columns: ["department_code"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "profiles_municipality_code_fkey"
            columns: ["municipality_code"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["code"]
          },
        ]
      }
      quote_ai_runs: {
        Row: {
          cost_usd: number | null
          created_at: string
          error: string | null
          expert_id: string
          id: string
          input_tokens: number | null
          kind: string | null
          model: string | null
          output_tokens: number | null
          photo_paths: string[]
          result: Json | null
          service_id: string
        }
        ComputedFields: never
        Insert: {
          cost_usd?: number | null
          created_at?: string
          error?: string | null
          expert_id: string
          id?: string
          input_tokens?: number | null
          kind?: string | null
          model?: string | null
          output_tokens?: number | null
          photo_paths: string[]
          result?: Json | null
          service_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          error?: string | null
          expert_id?: string
          id?: string
          input_tokens?: number | null
          kind?: string | null
          model?: string | null
          output_tokens?: number | null
          photo_paths?: string[]
          result?: Json | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_ai_runs_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_ai_runs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "quote_ai_runs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string
          from_ai: boolean
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
          from_ai?: boolean
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
          from_ai?: boolean
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
          from_ai: boolean
          id: string
          line_total: number | null
          name: string
          notes: string | null
          position: number
          quantity: number
          quote_id: string
          unit: string
          unit_price: number | null
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          from_ai?: boolean
          id?: string
          line_total?: never
          name: string
          notes?: string | null
          position?: number
          quantity?: number
          quote_id: string
          unit?: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          from_ai?: boolean
          id?: string
          line_total?: never
          name?: string
          notes?: string | null
          position?: number
          quantity?: number
          quote_id?: string
          unit?: string
          unit_price?: number | null
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
      service_orders: {
        Row: {
          accepted_at: string | null
          accepted_ip: string | null
          accepted_user_agent: string | null
          body_hash: string
          body_md: string
          created_at: string
          expert_id: string
          id: string
          service_id: string
          status: string
          updated_at: string
          version: number
        }
        ComputedFields: never
        Insert: {
          accepted_at?: string | null
          accepted_ip?: string | null
          accepted_user_agent?: string | null
          body_hash: string
          body_md: string
          created_at?: string
          expert_id: string
          id?: string
          service_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          accepted_at?: string | null
          accepted_ip?: string | null
          accepted_user_agent?: string | null
          body_hash?: string
          body_md?: string
          created_at?: string
          expert_id?: string
          id?: string
          service_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
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
          client_fee_total: number
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
          total_all_inclusive: number | null
          total_labor_only: number | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          admin_notes?: string | null
          approved_labor_total?: number | null
          client_fee_total?: number
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
          total_all_inclusive?: number | null
          total_labor_only?: number | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approved_labor_total?: number | null
          client_fee_total?: number
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
          total_all_inclusive?: number | null
          total_labor_only?: number | null
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
          kind: string
          name: string
          opens_on: string | null
          period_end_day: number | null
          period_start_day: number | null
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
          kind?: string
          name: string
          opens_on?: string | null
          period_end_day?: number | null
          period_start_day?: number | null
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
          kind?: string
          name?: string
          opens_on?: string | null
          period_end_day?: number | null
          period_start_day?: number | null
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
          client_fee_pct: number
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
          installment_frequency:
            Database["public"]["Enums"]["installment_frequency"] | null
          pause_reason: string | null
          payment_date: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"] | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          pricing_mode: Database["public"]["Enums"]["pricing_mode"] | null
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
          client_fee_pct?: number
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
          installment_frequency?:
            Database["public"]["Enums"]["installment_frequency"] | null
          pause_reason?: string | null
          payment_date?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"] | null
          payout_frequency?: Database["public"]["Enums"]["payout_frequency"]
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"] | null
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
          client_fee_pct?: number
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
          installment_frequency?:
            Database["public"]["Enums"]["installment_frequency"] | null
          pause_reason?: string | null
          payment_date?: string | null
          payment_plan?: Database["public"]["Enums"]["payment_plan"] | null
          payout_frequency?: Database["public"]["Enums"]["payout_frequency"]
          pricing_mode?: Database["public"]["Enums"]["pricing_mode"] | null
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
      start_act_signatures: {
        Row: {
          act_id: string
          body_hash: string
          document_number: string | null
          document_type: string | null
          id: string
          ip: string | null
          signature_height: number
          signature_svg: string
          signature_width: number
          signed_at: string
          signer_id: string
          signer_name: string | null
          signer_role: Database["public"]["Enums"]["user_role"]
          user_agent: string | null
        }
        ComputedFields: never
        Insert: {
          act_id: string
          body_hash: string
          document_number?: string | null
          document_type?: string | null
          id?: string
          ip?: string | null
          signature_height: number
          signature_svg: string
          signature_width: number
          signed_at?: string
          signer_id: string
          signer_name?: string | null
          signer_role: Database["public"]["Enums"]["user_role"]
          user_agent?: string | null
        }
        Update: {
          act_id?: string
          body_hash?: string
          document_number?: string | null
          document_type?: string | null
          id?: string
          ip?: string | null
          signature_height?: number
          signature_svg?: string
          signature_width?: number
          signed_at?: string
          signer_id?: string
          signer_name?: string | null
          signer_role?: Database["public"]["Enums"]["user_role"]
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "start_act_signatures_act_id_fkey"
            columns: ["act_id"]
            isOneToOne: false
            referencedRelation: "start_acts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "start_act_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      start_acts: {
        Row: {
          body_hash: string
          body_md: string
          created_at: string
          id: string
          service_id: string
          signed_at: string | null
          statement: string | null
          status: string
          updated_at: string
          version: number
        }
        ComputedFields: never
        Insert: {
          body_hash: string
          body_md: string
          created_at?: string
          id?: string
          service_id: string
          signed_at?: string | null
          statement?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          body_hash?: string
          body_md?: string
          created_at?: string
          id?: string
          service_id?: string
          signed_at?: string | null
          statement?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "start_acts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "service_schedule"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "start_acts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "services"
            referencedColumns: ["id"]
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
      xpertos_party: {
        Row: {
          address: string | null
          city: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          id: boolean
          legal_name: string | null
          phone: string | null
          signature_path: string | null
          signer_name: string | null
          trade_name: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          address?: string | null
          city?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: boolean
          legal_name?: string | null
          phone?: string | null
          signature_path?: string | null
          signer_name?: string | null
          trade_name?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          id?: boolean
          legal_name?: string | null
          phone?: string | null
          signature_path?: string | null
          signer_name?: string | null
          trade_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      service_schedule: {
        Row: {
          business_days_to_start: number | null
          estimated_days: number | null
          estimated_end_date: string | null
          payment_date: string | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          pricing_mode: Database["public"]["Enums"]["pricing_mode"] | null
          review_due_date: string | null
          service_id: string
          start_date: string | null
          start_offset_days: number | null
          status: Database["public"]["Enums"]["service_status"]
        }
        ComputedFields: never
        Relationships: []
      }
    }
    Functions: {
      _apply_payments_to_stages: {
        Args: { p_extra?: number; p_service_id: string }
        Returns: undefined
      }
      _apply_pricing_mode: {
        Args: {
          p_actor: string
          p_mode: Database["public"]["Enums"]["pricing_mode"]
          p_service_id: string
        }
        Returns: {
          admin_notes: string | null
          approved_labor_total: number | null
          client_fee_total: number
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
          total_all_inclusive: number | null
          total_labor_only: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "service_quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _build_contract: {
        Args: { p_extra_terms?: string; p_service_id: string }
        Returns: {
          body_hash: string
          body_md: string
          created_at: string
          created_by: string | null
          id: string
          service_id: string
          statement: string | null
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
      _build_service_order: {
        Args: { p_service_id: string }
        Returns: {
          accepted_at: string | null
          accepted_ip: string | null
          accepted_user_agent: string | null
          body_hash: string
          body_md: string
          created_at: string
          expert_id: string
          id: string
          service_id: string
          status: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "service_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _build_start_act: {
        Args: { p_service_id: string }
        Returns: {
          body_hash: string
          body_md: string
          created_at: string
          id: string
          service_id: string
          signed_at: string | null
          statement: string | null
          status: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "start_acts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _check_signature: {
        Args: { p_height: number; p_svg: string; p_width: number }
        Returns: undefined
      }
      _contract_statement: { Args: { p_service_id: string }; Returns: string }
      _create_payment_stages: {
        Args: { p_service_id: string }
        Returns: undefined
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
      _issue_contract_sign_request: {
        Args: { p_contract_id: string }
        Returns: undefined
      }
      _join_es: { Args: { p_items: string[] }; Returns: string }
      _mask_email: { Args: { p: string }; Returns: string }
      _notification_text: {
        Args: { p_audience: string; p_data: Json; p_template: string }
        Returns: {
          body: string
          link: string
          title: string
        }[]
      }
      _payment_accounts_json: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      _refresh_pending_contracts: {
        Args: { p_client: string }
        Returns: undefined
      }
      _request_ip: { Args: Record<PropertyKey, never>; Returns: string }
      _schedule_installments: {
        Args: { p_service_id: string }
        Returns: undefined
      }
      _schedule_when_advance_paid: {
        Args: { p_at: string; p_service_id: string }
        Returns: undefined
      }
      _service_email_data: { Args: { p_service: string }; Returns: Json }
      _sha256: { Args: { p: string }; Returns: string }
      _sign_request_by_token: {
        Args: { p_token: string }
        Returns: {
          body_hash: string
          client_id: string
          code_attempts: number
          code_expires_at: string | null
          code_hash: string | null
          code_sent_at: string | null
          codes_sent: number
          contract_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "contract_sign_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _upsert_identity: {
        Args: { p_number: string; p_type: string; p_user: string }
        Returns: undefined
      }
      accept_service_order: {
        Args: { p_body_hash: string; p_order_id: string; p_user_agent?: string }
        Returns: {
          accepted_at: string | null
          accepted_ip: string | null
          accepted_user_agent: string | null
          body_hash: string
          body_md: string
          created_at: string
          expert_id: string
          id: string
          service_id: string
          status: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "service_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
          client_fee_pct: number
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
          installment_frequency:
            Database["public"]["Enums"]["installment_frequency"] | null
          pause_reason: string | null
          payment_date: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"] | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          pricing_mode: Database["public"]["Enums"]["pricing_mode"] | null
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
      application_missing_requirements: {
        Args: { p_application_id: string }
        Returns: string[]
      }
      approve_application: {
        Args: { p_application_id: string; p_notes?: string }
        Returns: {
          admin_notes: string | null
          bio: string | null
          category_ids: string[]
          city: string | null
          created_at: string
          department_code: string | null
          email: string
          experience_years: number | null
          expires_at: string
          full_name: string
          id: string
          municipality_code: string | null
          occupation_code: string | null
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
          p_material_prices?: Json
          p_notes?: string
          p_service_id: string
        }
        Returns: {
          admin_notes: string | null
          approved_labor_total: number | null
          client_fee_total: number
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
          total_all_inclusive: number | null
          total_labor_only: number | null
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
          client_fee_pct: number
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
          installment_frequency:
            Database["public"]["Enums"]["installment_frequency"] | null
          pause_reason: string | null
          payment_date: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"] | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          pricing_mode: Database["public"]["Enums"]["pricing_mode"] | null
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
      choose_payment_plan: {
        Args: {
          p_frequency?: Database["public"]["Enums"]["installment_frequency"]
          p_plan: Database["public"]["Enums"]["payment_plan"]
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
          client_fee_pct: number
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
          installment_frequency:
            Database["public"]["Enums"]["installment_frequency"] | null
          pause_reason: string | null
          payment_date: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"] | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          pricing_mode: Database["public"]["Enums"]["pricing_mode"] | null
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
      choose_pricing_mode: {
        Args: {
          p_mode: Database["public"]["Enums"]["pricing_mode"]
          p_service_id: string
        }
        Returns: {
          admin_notes: string | null
          approved_labor_total: number | null
          client_fee_total: number
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
          total_all_inclusive: number | null
          total_labor_only: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "service_quotes"
          isOneToOne: true
          isSetofReturn: false
        }
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
          client_fee_pct: number
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
          installment_frequency:
            Database["public"]["Enums"]["installment_frequency"] | null
          pause_reason: string | null
          payment_date: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"] | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          pricing_mode: Database["public"]["Enums"]["pricing_mode"] | null
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
      contract_sign_confirm: {
        Args: {
          p_code: string
          p_signature_height: number
          p_signature_svg: string
          p_signature_width: number
          p_token: string
          p_user_agent?: string
        }
        Returns: Json
      }
      contract_sign_send_code: { Args: { p_token: string }; Returns: Json }
      contract_sign_set_identity: {
        Args: {
          p_document_number: string
          p_document_type: string
          p_token: string
        }
        Returns: Json
      }
      contract_sign_view: { Args: { p_token: string }; Returns: Json }
      create_admin_user: {
        Args: {
          p_city?: string
          p_email: string
          p_full_name: string
          p_password: string
          p_phone?: string
        }
        Returns: string
      }
      current_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      dispatch_email_outbox: {
        Args: { p_only_if_due?: boolean }
        Returns: number
      }
      document_kind_label: {
        Args: { p: Database["public"]["Enums"]["document_kind"] }
        Returns: string
      }
      document_type_label: { Args: { p_type: string }; Returns: string }
      expert_can_choose_frequency: {
        Args: { p_expert_id: string }
        Returns: boolean
      }
      expert_satisfactory_count: {
        Args: { p_expert_id: string }
        Returns: number
      }
      expire_stale_applications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      fmt_cop: { Args: { p: number }; Returns: string }
      fmt_date_es: { Args: { p: string }; Returns: string }
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
          statement: string | null
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
      installment_frequencies_for: {
        Args: { p_days: number }
        Returns: Database["public"]["Enums"]["installment_frequency"][]
      }
      installment_frequency_label: {
        Args: { p: Database["public"]["Enums"]["installment_frequency"] }
        Returns: string
      }
      installment_period_days: {
        Args: { p: Database["public"]["Enums"]["installment_frequency"] }
        Returns: number
      }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_business_day: { Args: { p_day: string }; Returns: boolean }
      is_service_party: { Args: { p_service_id: string }; Returns: boolean }
      is_super_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      mark_all_notifications_read: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      online_charge: { Args: { p_amount: number }; Returns: number }
      open_next_stage: { Args: { p_service_id: string }; Returns: undefined }
      payment_plan_options: { Args: { p_service_id: string }; Returns: Json }
      payment_plan_schedule: {
        Args: {
          p_advance_pct: number
          p_days: number
          p_frequency: Database["public"]["Enums"]["installment_frequency"]
          p_max: number
          p_plan: Database["public"]["Enums"]["payment_plan"]
          p_total: number
        }
        Returns: {
          end_day: number
          pos: number
          stage_amount: number
          stage_description: string
          stage_kind: string
          stage_name: string
          start_day: number
        }[]
      }
      payout_frequency_label: {
        Args: { p: Database["public"]["Enums"]["payout_frequency"] }
        Returns: string
      }
      payout_method_label: {
        Args: { p: Database["public"]["Enums"]["payout_method"] }
        Returns: string
      }
      pricing_mode_label: {
        Args: { p: Database["public"]["Enums"]["pricing_mode"] }
        Returns: string
      }
      process_installments: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      promote_to_admin: { Args: { p_email: string }; Returns: string }
      reapply_application: { Args: Record<PropertyKey, never>; Returns: string }
      reject_application_document: {
        Args: { p_document_id: string; p_reason: string }
        Returns: undefined
      }
      retry_email: { Args: { p_id: string }; Returns: undefined }
      return_quote: {
        Args: { p_notes: string; p_service_id: string }
        Returns: {
          admin_notes: string | null
          approved_labor_total: number | null
          client_fee_total: number
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
          total_all_inclusive: number | null
          total_labor_only: number | null
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
          department_code: string | null
          email: string
          experience_years: number | null
          expires_at: string
          full_name: string
          id: string
          municipality_code: string | null
          occupation_code: string | null
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
      set_my_identity: {
        Args: { p_document_number: string; p_document_type: string }
        Returns: undefined
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
          client_fee_pct: number
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
          installment_frequency:
            Database["public"]["Enums"]["installment_frequency"] | null
          pause_reason: string | null
          payment_date: string | null
          payment_plan: Database["public"]["Enums"]["payment_plan"] | null
          payout_frequency: Database["public"]["Enums"]["payout_frequency"]
          pricing_mode: Database["public"]["Enums"]["pricing_mode"] | null
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
      set_super_admin: {
        Args: { p_email: string; p_enabled?: boolean }
        Returns: string
      }
      sign_contract: {
        Args: {
          p_body_hash: string
          p_contract_id: string
          p_signature_height: number
          p_signature_svg: string
          p_signature_width: number
          p_user_agent?: string
        }
        Returns: {
          accepted_terms: boolean
          body_hash: string
          contract_id: string
          document_number: string | null
          document_type: string | null
          id: string
          ip: string | null
          method: string
          signature_height: number | null
          signature_image_path: string | null
          signature_svg: string | null
          signature_width: number | null
          signed_at: string
          signer_id: string
          signer_name: string | null
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
      sign_start_act: {
        Args: {
          p_act_id: string
          p_body_hash: string
          p_signature_height: number
          p_signature_svg: string
          p_signature_width: number
          p_user_agent?: string
        }
        Returns: {
          act_id: string
          body_hash: string
          document_number: string | null
          document_type: string | null
          id: string
          ip: string | null
          signature_height: number
          signature_svg: string
          signature_width: number
          signed_at: string
          signer_id: string
          signer_name: string | null
          signer_role: Database["public"]["Enums"]["user_role"]
          user_agent: string | null
        }
        SetofOptions: {
          from: "*"
          to: "start_act_signatures"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_due_services: { Args: Record<PropertyKey, never>; Returns: number }
      start_offset_days: {
        Args: { p: Database["public"]["Enums"]["pricing_mode"] }
        Returns: number
      }
      submit_landing_application: {
        Args: {
          p_email: string
          p_full_name: string
          p_municipality_code: string
          p_occupation_code: string
          p_phone: string
          p_temp_password?: string
          p_user_id: string
        }
        Returns: string
      }
      submit_quote: {
        Args: { p_service_id: string }
        Returns: {
          admin_notes: string | null
          approved_labor_total: number | null
          client_fee_total: number
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
          total_all_inclusive: number | null
          total_labor_only: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "service_quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sync_application_status: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      today_co: { Args: Record<PropertyKey, never>; Returns: string }
      try_uuid: { Args: { p: string }; Returns: string }
      unit_price_label: { Args: { p_unit: string }; Returns: string }
    }
    Enums: {
      application_status:
        | "pending"
        | "in_review"
        | "needs_info"
        | "approved"
        | "rejected"
        | "expired"
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
      installment_frequency: "weekly" | "biweekly" | "monthly"
      payment_method:
        "transfer" | "cash" | "mercado_pago" | "tucompra" | "wompi"
      payment_plan: "single" | "installments"
      payment_status: "submitted" | "verified" | "rejected"
      payout_frequency:
        "daily" | "weekly" | "biweekly" | "monthly" | "on_completion"
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
        "pending" | "awaiting_payment" | "proof_uploaded" | "paid" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
        "expired",
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
      installment_frequency: ["weekly", "biweekly", "monthly"],
      payment_method: ["transfer", "cash", "mercado_pago", "tucompra", "wompi"],
      payment_plan: ["single", "installments"],
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
