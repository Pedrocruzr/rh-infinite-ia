export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          price_cents: number;
          billing_interval: string;
          monthly_credits: number;
          max_users: number;
          active: boolean;
          stripe_product_id: string | null;
          stripe_price_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          price_cents: number;
          billing_interval?: string;
          monthly_credits: number;
          max_users?: number;
          active?: boolean;
          stripe_product_id?: string | null;
          stripe_price_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string | null;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id?: string | null;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
      credit_wallets: {
        Row: {
          user_id: string;
          balance: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          updated_at?: string;
        };
        Update: {
          balance?: number;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          delta: number;
          balance_after: number | null;
          transaction_type: string;
          source_type: string | null;
          source_id: string | null;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          delta: number;
          balance_after?: number | null;
          transaction_type: string;
          source_type?: string | null;
          source_id?: string | null;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["credit_transactions"]["Insert"]>;
      };
      topup_products: {
        Row: {
          id: string;
          code: string;
          name: string;
          credits: number;
          price_cents: number;
          active: boolean;
          stripe_product_id: string | null;
          stripe_price_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          credits: number;
          price_cents: number;
          active?: boolean;
          stripe_product_id?: string | null;
          stripe_price_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["topup_products"]["Insert"]>;
      };
      agents: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: string;
          short_description: string | null;
          image_path: string | null;
          required_plan: string | null;
          credit_cost: number;
          active: boolean;
          model: string | null;
          temperature: number | null;
          prompt_id: string | null;
          input_schema: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category: string;
          short_description?: string | null;
          image_path?: string | null;
          required_plan?: string | null;
          credit_cost?: number;
          active?: boolean;
          model?: string | null;
          temperature?: number | null;
          prompt_id?: string | null;
          input_schema?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
      };
      agent_runs: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          status: string;
          started_at: string;
          completed_at: string | null;
          duration_ms: number | null;
          input_summary: string | null;
          output_summary: string | null;
          credits_consumed: number;
          prompt_version: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          duration_ms?: number | null;
          input_summary?: string | null;
          output_summary?: string | null;
          credits_consumed?: number;
          prompt_version?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_runs"]["Insert"]>;
      };
      usage_events: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string | null;
          agent_run_id: string | null;
          event_type: string;
          credits_delta: number;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id?: string | null;
          agent_run_id?: string | null;
          event_type?: string;
          credits_delta?: number;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["usage_events"]["Insert"]>;
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string | null;
          subject: string;
          priority: string;
          status: string;
          message: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          subject: string;
          priority?: string;
          status?: string;
          message: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["support_tickets"]["Insert"]>;
      };
      tutorial_videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          youtube_url: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          youtube_url: string;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tutorial_videos"]["Insert"]>;
      };
      job_openings: {
        Row: {
          id: string;
          user_id: string;
          nome_vaga: string;
          data_abertura: string;
          data_fechamento: string | null;
          status: string;
          dias_em_aberto: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome_vaga: string;
          data_abertura: string;
          data_fechamento?: string | null;
          status?: string;
          dias_em_aberto?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["job_openings"]["Insert"]>;
      };
      webhook_events: {
        Row: {
          id: string;
          provider: string;
          event_id: string;
          event_type: string;
          payload: Json;
          processing_status: string;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider?: string;
          event_id: string;
          event_type: string;
          payload: Json;
          processing_status?: string;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["webhook_events"]["Insert"]>;
      };
    };
  };
}
