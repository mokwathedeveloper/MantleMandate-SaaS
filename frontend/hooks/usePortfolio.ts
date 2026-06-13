'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export interface PortfolioStats {
  totalValue:   number
  totalPnl24h:  number
  totalPnlPct:  number
  activeAgents: number
  totalTrades:  number
  winRate:      number
}

export interface PortfolioPoint {
  date:  string
  value: number
  pnl:   number
}

const EMPTY_STATS: PortfolioStats = {
  totalValue:   0,
  totalPnl24h:  0,
  totalPnlPct:  0,
  activeAgents: 0,
  totalTrades:  0,
  winRate:      0,
}

export function usePortfolioStats() {
  const { user } = useAuthStore()

  return useQuery<PortfolioStats>({
    queryKey: ['portfolio', 'stats'],
    queryFn: async () => {
      if (!user) return EMPTY_STATS

      const uid = user.id
      const [agents, trades] = await Promise.all([
        supabase.from('agents').select('status, capital_cap, total_pnl').eq('user_id', uid),
        supabase.from('trades').select('pnl, status').eq('user_id', uid),
      ])

      const agentRows: { status: string; capital_cap?: number | null; total_pnl?: number | null }[] = agents.data ?? []
      const totalValue   = agentRows.reduce((s, a) => s + (a.capital_cap ?? 0), 0)
      const totalPnl24h  = agentRows.reduce((s, a) => s + (a.total_pnl  ?? 0), 0)
      const totalPnlPct  = totalValue > 0 ? (totalPnl24h / totalValue) * 100 : 0
      const activeAgents = agentRows.filter(a => a.status === 'active').length
      const allTrades: { pnl?: number | null; status: string }[] = trades.data ?? []
      const totalTrades  = allTrades.length
      const wins         = allTrades.filter(t => t.status === 'success' && (t.pnl ?? 0) > 0).length
      const winRate      = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

      return { totalValue, totalPnl24h, totalPnlPct, activeAgents, totalTrades, winRate }
    },
    enabled: !!user,
    refetchInterval: 30_000,
  })
}

export function usePortfolioHistory(days = 30) {
  const { user } = useAuthStore()

  return useQuery<PortfolioPoint[]>({
    queryKey: ['portfolio', 'history', days],
    queryFn: async () => {
      if (!user) return []

      const since = new Date()
      since.setDate(since.getDate() - days)
      const { data, error } = await supabase
        .from('portfolio_history')
        .select('date, value, pnl')
        .eq('user_id', user.id)
        .gte('date', since.toISOString().split('T')[0])
        .order('date', { ascending: true })
      if (error || !data) return []
      return (data as { date: string; value: number; pnl: number }[]).map(r => ({ date: r.date, value: r.value, pnl: r.pnl }))
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}
