export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          plan: 'operator' | 'strategist' | 'institution'
          trial_ends_at: string | null
          ens_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          plan?: 'operator' | 'strategist' | 'institution'
          trial_ends_at?: string | null
          ens_name?: string | null
        }
        Update: {
          email?: string
          name?: string
          plan?: 'operator' | 'strategist' | 'institution'
          trial_ends_at?: string | null
          ens_name?: string | null
        }
      }
      mandates: {
        Row: {
          id: string
          user_id: string
          name: string
          mandate_text: string
          parsed_policy: Json | null
          policy_hash: string | null
          base_currency: string
          strategy_type: string | null
          risk_params: Json
          capital_cap: number | null
          status: 'draft' | 'active' | 'paused' | 'archived'
          on_chain_tx: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          mandate_text: string
          parsed_policy?: Json | null
          policy_hash?: string | null
          base_currency?: string
          strategy_type?: string | null
          risk_params?: Json
          capital_cap?: number | null
          status?: 'draft' | 'active' | 'paused' | 'archived'
          on_chain_tx?: string | null
        }
        Update: {
          name?: string
          mandate_text?: string
          parsed_policy?: Json | null
          policy_hash?: string | null
          base_currency?: string
          strategy_type?: string | null
          risk_params?: Json
          capital_cap?: number | null
          status?: 'draft' | 'active' | 'paused' | 'archived'
          on_chain_tx?: string | null
        }
      }
      agents: {
        Row: {
          id: string
          user_id: string
          mandate_id: string
          name: string
          status: 'active' | 'paused' | 'failed' | 'stopped' | 'inactive'
          capital_cap: number
          total_pnl: number
          total_roi: number
          total_volume: number
          drawdown_current: number
          deployed_at: string | null
          last_trade_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          mandate_id: string
          name: string
          status?: 'active' | 'paused' | 'failed' | 'stopped' | 'inactive'
          capital_cap?: number
          deployed_at?: string | null
        }
        Update: {
          name?: string
          status?: 'active' | 'paused' | 'failed' | 'stopped' | 'inactive'
          capital_cap?: number
          total_pnl?: number
          total_roi?: number
          total_volume?: number
          drawdown_current?: number
          deployed_at?: string | null
          last_trade_at?: string | null
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          address: string
          chain_id: number
          label: string | null
          balance_usd: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          address: string
          chain_id?: number
          label?: string | null
          balance_usd?: number
          is_primary?: boolean
        }
        Update: {
          label?: string | null
          balance_usd?: number
          is_primary?: boolean
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          agent_id: string
          mandate_id: string
          asset_pair: string
          direction: 'buy' | 'sell'
          amount_usd: number
          price: number
          pnl: number | null
          protocol: string
          tx_hash: string | null
          block_number: number | null
          status: 'pending' | 'success' | 'failed'
          mandate_rule_applied: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          agent_id: string
          mandate_id: string
          asset_pair: string
          direction: 'buy' | 'sell'
          amount_usd: number
          price: number
          pnl?: number | null
          protocol?: string
          tx_hash?: string | null
          block_number?: number | null
          status?: 'pending' | 'success' | 'failed'
          mandate_rule_applied?: string | null
        }
        Update: {
          pnl?: number | null
          tx_hash?: string | null
          block_number?: number | null
          status?: 'pending' | 'success' | 'failed'
        }
      }
      portfolio_history: {
        Row: {
          id: string
          user_id: string
          date: string
          value: number
          pnl: number
          created_at: string
        }
        Insert: {
          user_id: string
          date: string
          value: number
          pnl?: number
        }
        Update: {
          value?: number
          pnl?: number
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          type: string
          severity: 'info' | 'warning' | 'critical'
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          type: string
          severity?: 'info' | 'warning' | 'critical'
          title: string
          message: string
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          agent_id: string | null
          trade_id: string | null
          event_type: string
          decision_hash: string | null
          tx_hash: string | null
          block_number: number | null
          details: Json
          created_at: string
        }
        Insert: {
          user_id: string
          agent_id?: string | null
          trade_id?: string | null
          event_type: string
          decision_hash?: string | null
          tx_hash?: string | null
          block_number?: number | null
          details?: Json
        }
        Update: Record<string, never>
      }
    }
  }
}
