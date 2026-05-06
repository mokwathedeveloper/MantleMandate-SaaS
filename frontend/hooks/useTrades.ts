'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Trade } from '@/types/trade'

interface TradesResponse {
  data:        Trade[]
  total:       number
  page:        number
  page_size:   number
  total_pages: number
}

export function useTrades(params?: { page?: number; per_page?: number; agent_id?: string; status?: string; direction?: string }) {
  const query = new URLSearchParams()
  if (params?.page)      query.set('page',      String(params.page))
  if (params?.per_page)  query.set('per_page',  String(params.per_page))
  if (params?.agent_id)  query.set('agent_id',  params.agent_id)
  if (params?.status)    query.set('status',    params.status)
  if (params?.direction) query.set('direction', params.direction)

  return useQuery<TradesResponse>({
    queryKey: ['trades', params],
    queryFn: () => api.get(`/trades?${query}`).then((r) => r.data),
    refetchInterval: 15_000,
  })
}

export function useRecentTrades(limit = 10) {
  return useTrades({ per_page: limit, page: 1 })
}
