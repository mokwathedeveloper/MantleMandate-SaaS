'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export interface RiskDriver {
  label: string
  value: string
}

export interface RiskSummary {
  score:    number
  level:    'Low Risk' | 'Medium Risk' | 'High Risk'
  hasData:  boolean
  drivers:  RiskDriver[]
}

const EMPTY: RiskSummary = { score: 0, level: 'Low Risk', hasData: false, drivers: [] }

export function useRiskSummary() {
  const { user } = useAuthStore()

  return useQuery<RiskSummary>({
    queryKey: ['risk-summary', user?.id],
    queryFn: async () => {
      if (!user) return EMPTY

      const [{ data: agents }, { data: mandates }] = await Promise.all([
        supabase
          .from('agents')
          .select('status, drawdown_current, capital_cap')
          .eq('user_id', user.id),
        supabase
          .from('mandates')
          .select('risk_params')
          .eq('user_id', user.id)
          .eq('status', 'active'),
      ])

      const agentRows = (agents ?? []) as { status: string; drawdown_current: number | null; capital_cap: number | null }[]
      const mandateRows = (mandates ?? []) as { risk_params: unknown }[]

      const activeAgents = agentRows.filter((a) => a.status === 'active')
      if (activeAgents.length === 0) return EMPTY

      const avgDrawdown = activeAgents.reduce((s, a) => s + (a.drawdown_current ?? 0), 0) / activeAgents.length

      const limits = mandateRows
        .map((m) => (m.risk_params as { maxDrawdown?: number } | null)?.maxDrawdown)
        .filter((v): v is number => typeof v === 'number')
      const avgLimit = limits.length > 0 ? limits.reduce((a, b) => a + b, 0) / limits.length : 15

      const utilization = avgLimit > 0 ? (avgDrawdown / avgLimit) * 100 : 0
      const score = Math.round(Math.min(100, Math.max(0, utilization)))
      const level: RiskSummary['level'] = score < 30 ? 'Low Risk' : score < 60 ? 'Medium Risk' : 'High Risk'

      const totalCapital = activeAgents.reduce((s, a) => s + (a.capital_cap ?? 0), 0)
      const maxAgentCapital = Math.max(...activeAgents.map((a) => a.capital_cap ?? 0))
      const concentration = totalCapital > 0 ? (maxAgentCapital / totalCapital) * 100 : 0

      return {
        score,
        level,
        hasData: true,
        drivers: [
          { label: 'Drawdown utilization',         value: `${avgDrawdown.toFixed(1)}% / ${avgLimit.toFixed(0)}% limit` },
          { label: 'Active agents',                 value: String(activeAgents.length) },
          { label: 'Total capital at risk',         value: `$${totalCapital.toLocaleString()}` },
          { label: 'Largest agent concentration',   value: `${concentration.toFixed(1)}%` },
        ],
      }
    },
    enabled: !!user,
    refetchInterval: 30_000,
  })
}
