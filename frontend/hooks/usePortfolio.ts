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

const MOCK_STATS: PortfolioStats = {
  totalValue:   52_847.22,
  totalPnl24h:  312.45,
  totalPnlPct:  0.60,
  activeAgents: 3,
  totalTrades:  47,
  winRate:      74.2,
}

function generateMockHistory(days: number): PortfolioPoint[] {
  const points: PortfolioPoint[] = []
  let val = 49_000
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    val += (Math.random() - 0.42) * 800
    val = Math.max(47_000, val)
    points.push({
      date:  d.toISOString().split('T')[0],
      value: Math.round(val * 100) / 100,
      pnl:   Math.round((Math.random() - 0.4) * 400 * 100) / 100,
    })
  }
  if (points.length) points[points.length - 1].value = 52_847.22
  return points
}

export function usePortfolioStats() {
  const { user } = useAuthStore()

  return useQuery<PortfolioStats>({
    queryKey: ['portfolio', 'stats'],
    queryFn: async () => {
      if (!user) return MOCK_STATS
      try {
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

        if (totalValue === 0 && activeAgents === 0 && totalTrades === 0) return MOCK_STATS
        return { totalValue, totalPnl24h, totalPnlPct, activeAgents, totalTrades, winRate }
      } catch {
        return MOCK_STATS
      }
    },
    retry: false,
    placeholderData: MOCK_STATS,
    refetchInterval: 30_000,
  })
}

export function usePortfolioHistory(days = 30) {
  const { user } = useAuthStore()

  return useQuery<PortfolioPoint[]>({
    queryKey: ['portfolio', 'history', days],
    queryFn: async () => {
      if (!user) return generateMockHistory(days)
      try {
        const since = new Date()
        since.setDate(since.getDate() - days)
        const { data, error } = await supabase
          .from('portfolio_history')
          .select('date, value, pnl')
          .eq('user_id', user.id)
          .gte('date', since.toISOString().split('T')[0])
          .order('date', { ascending: true })
        if (error || !data || data.length === 0) return generateMockHistory(days)
        return (data as { date: string; value: number; pnl: number }[]).map(r => ({ date: r.date, value: r.value, pnl: r.pnl }))
      } catch {
        return generateMockHistory(days)
      }
    },
    placeholderData: generateMockHistory(days),
    staleTime: 60_000,
  })
}
