'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

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

export function usePortfolioStats() {
  return useQuery<PortfolioStats>({
    queryKey: ['portfolio', 'stats'],
    queryFn: () => api.get('/portfolio/stats').then((r) => r.data.data),
    refetchInterval: 30_000,
  })
}

export function usePortfolioHistory(days = 30) {
  return useQuery<PortfolioPoint[]>({
    queryKey: ['portfolio', 'history', days],
    queryFn: () => api.get(`/portfolio/history?days=${days}`).then((r) => r.data.data),
    staleTime: 60_000,
  })
}
