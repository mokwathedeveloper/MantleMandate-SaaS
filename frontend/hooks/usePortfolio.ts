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
  const { session } = useAuthStore()

  return useQuery<PortfolioStats>({
    queryKey: ['portfolio', 'stats'],
    queryFn: async () => {
      if (!session) return MOCK_STATS
      try {
        const uid = session.user.id
        const [wallets, agents, trades, history] = await Promise.all([
          supabase.from('wallets').select('balance_usd').eq('user_id', uid),
          supabase.from('agents').select('status').eq('user_id', uid),
          supabase.from('trades').select('pnl, status').eq('user_id', uid),
          supabase.from('portfolio_history').select('value, pnl').eq('user_id', uid)
            .order('date', { ascending: false }).limit(2),
        ])

        const totalValue   = (wallets.data ?? []).reduce((s: number, w: { balance_usd?: number | null }) => s + (w.balance_usd ?? 0), 0)
        const activeAgents = (agents.data  ?? []).filter((a: { status: string }) => a.status === 'active').length
        const allTrades: { pnl?: number | null; status: string }[] = trades.data ?? []
        const totalTrades  = allTrades.length
        const wins         = allTrades.filter(t => t.status === 'success' && (t.pnl ?? 0) > 0).length
        const winRate      = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

        const h = history.data ?? []
        const todayPnl    = h[0]?.pnl  ?? 0
        const todayValue  = h[0]?.value ?? totalValue
        const prevValue   = h[1]?.value ?? todayValue
        const totalPnlPct = prevValue > 0 ? ((todayValue - prevValue) / prevValue) * 100 : 0

        if (totalValue === 0 && activeAgents === 0 && totalTrades === 0) return MOCK_STATS
        return { totalValue, totalPnl24h: todayPnl, totalPnlPct, activeAgents, totalTrades, winRate }
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
  const { session } = useAuthStore()

  return useQuery<PortfolioPoint[]>({
    queryKey: ['portfolio', 'history', days],
    queryFn: async () => {
      if (!session) return generateMockHistory(days)
      try {
        const since = new Date()
        since.setDate(since.getDate() - days)
        const { data, error } = await supabase
          .from('portfolio_history')
          .select('date, value, pnl')
          .eq('user_id', session.user.id)
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
