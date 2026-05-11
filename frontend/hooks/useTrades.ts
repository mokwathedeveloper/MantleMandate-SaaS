'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Trade } from '@/types/trade'

interface TradesResponse {
  data:        Trade[]
  total:       number
  page:        number
  page_size:   number
  total_pages: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTrade(row: Record<string, any>): Trade {
  return {
    id:                  row.id,
    agentId:             row.agent_id,
    mandateId:           row.mandate_id,
    mandateName:         row.mandate?.name ?? '',
    assetPair:           row.asset_pair,
    direction:           row.direction,
    amountUsd:           row.amount_usd,
    price:               row.price,
    pnl:                 row.pnl ?? null,
    protocol:            row.protocol,
    txHash:              row.tx_hash ?? null,
    blockNumber:         row.block_number ?? null,
    status:              row.status,
    mandateRuleApplied:  row.mandate_rule_applied ?? null,
    createdAt:           row.created_at,
  }
}

export function useTrades(params?: {
  page?: number
  per_page?: number
  agent_id?: string
  status?: string
  direction?: string
  enabled?: boolean
}) {
  const { session } = useAuthStore()
  const page     = params?.page     ?? 1
  const pageSize = params?.per_page ?? 20

  return useQuery<TradesResponse>({
    queryKey: ['trades', params],
    queryFn: async () => {
      let q = supabase
        .from('trades')
        .select('*, mandate:mandates(name)', { count: 'exact' })
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (params?.agent_id)  q = q.eq('agent_id', params.agent_id)
      if (params?.status)    q = q.eq('status',   params.status)
      if (params?.direction) q = q.eq('direction', params.direction)

      const { data, error, count } = await q
      if (error) throw error
      const total = count ?? 0
      return {
        data:        (data ?? []).map(rowToTrade),
        total,
        page,
        page_size:   pageSize,
        total_pages: Math.ceil(total / pageSize),
      }
    },
    retry: false,
    enabled: params?.enabled !== false && !!session,
    refetchInterval: params?.enabled !== false ? 15_000 : false,
  })
}

export function useRecentTrades(limit = 10) {
  return useTrades({ per_page: limit, page: 1 })
}
