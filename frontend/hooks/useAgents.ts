'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Agent } from '@/types/agent'

// ── Row mapper ────────────────────────────────────────────────────────────────

function rowToAgent(row: Record<string, unknown>): Agent {
  return {
    id:              row.id as string,
    mandateId:       row.mandate_id as string,
    mandateName:     (row.mandate as Record<string, string> | null)?.name ?? '',
    name:            row.name as string,
    status:          row.status as Agent['status'],
    capitalCap:      (row.capital_cap as number) || 0,
    totalPnl:        (row.total_pnl as number) ?? 0,
    totalRoi:        (row.total_roi as number) ?? 0,
    totalVolume:     (row.total_volume as number) ?? 0,
    drawdownCurrent: (row.drawdown_current as number) ?? 0,
    deployedAt:      row.deployed_at as string | null,
    lastTradeAt:     row.last_trade_at as string | null,
  }
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useAgents() {
  const { user } = useAuthStore()

  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*, mandate:mandates(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(rowToAgent)
    },
    enabled: !!user,
    refetchInterval: 15_000,
  })
}

export function useAgent(id: string) {
  const { user } = useAuthStore()

  return useQuery<Agent>({
    queryKey: ['agents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*, mandate:mandates(name)')
        .eq('id', id)
        .single()
      if (error) throw error
      return rowToAgent(data)
    },
    enabled: !!id && !!user,
    refetchInterval: 15_000,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

function useAgentStatusMutation(newStatus: Agent['status']) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agents')
        .update({ status: newStatus })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['agents'] })
      const prev = qc.getQueryData<Agent[]>(['agents'])
      qc.setQueryData<Agent[]>(['agents'], old =>
        old?.map(a => a.id === id ? { ...a, status: newStatus } : a) ?? []
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['agents'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function usePauseAgent()  { return useAgentStatusMutation('paused')  }
export function useResumeAgent() { return useAgentStatusMutation('active')  }
export function useStopAgent()   { return useAgentStatusMutation('stopped') }

// ── On-chain trading cycle ────────────────────────────────────────────────────

export interface TickResult {
  decision: {
    action:       'buy' | 'sell' | 'hold'
    confidence:   number
    reasoning:    string
    amount_pct:   number
    urgency:      'low' | 'medium' | 'high'
    live_price:   number | null
    price_change: number | null
    rsi:          number | null
    asset:        string
    source:       'bybit'
  }
  executed:        boolean
  txHash?:         string
  swapTxHash?:     string
  onchainAgentId?: string
  pnl?:            number
  reason?:         string
}

export function useRunAgentTick() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/agents/${id}/tick`, { method: 'POST' })
      const json = await res.json() as { data?: TickResult; error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Trading cycle failed')
      return json.data!
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      qc.invalidateQueries({ queryKey: ['agents', id] })
      qc.invalidateQueries({ queryKey: ['agent-trades', id] })
      qc.invalidateQueries({ queryKey: ['agent-logs', id] })
    },
  })
}

// ── Deploy ────────────────────────────────────────────────────────────────────

interface DeployPayload { name: string; mandateId: string; capitalCap?: number }

export function useDeployAgent() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: DeployPayload) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('agents')
        .insert({
          user_id:          user.id,
          mandate_id:       payload.mandateId,
          name:             payload.name,
          capital_cap:      payload.capitalCap ?? 0,
          status:           'active',
          deployed_at:      new Date().toISOString(),
          total_pnl:        0,
          total_roi:        0,
          total_volume:     0,
          drawdown_current: 0,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}
