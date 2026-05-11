'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { MOCK_AGENTS } from '@/mocks/agents'
import type { Agent } from '@/types/agent'

// Converts mock agent shape → Agent type for fallback display
const MOCK_AS_AGENTS: Agent[] = MOCK_AGENTS.map(m => ({
  id:              m.id,
  mandateId:       '',
  mandateName:     m.strategy,
  name:            m.name,
  status:          m.status === 'error' ? 'failed' : m.status === 'stopped' ? 'stopped' : m.status as Agent['status'],
  capitalCap:      m.capitalUsd,
  totalPnl:        m.pnl24h,
  totalRoi:        m.pnlPct,
  totalVolume:     m.capitalUsd * 0.45,
  drawdownCurrent: m.riskScore / 5,
  deployedAt:      m.createdAt,
  lastTradeAt:     m.lastTradeAt,
}))

function rowToAgent(row: Record<string, unknown>): Agent {
  return {
    id:              row.id as string,
    mandateId:       row.mandate_id as string,
    mandateName:     (row.mandate as Record<string, string> | null)?.name ?? '',
    name:            row.name as string,
    status:          row.status as Agent['status'],
    capitalCap:      row.capital_cap as number,
    totalPnl:        row.total_pnl as number,
    totalRoi:        row.total_roi as number,
    totalVolume:     row.total_volume as number,
    drawdownCurrent: row.drawdown_current as number,
    deployedAt:      row.deployed_at as string | null,
    lastTradeAt:     row.last_trade_at as string | null,
  }
}

export function useAgents() {
  const { session } = useAuthStore()

  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*, mandate:mandates(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      const rows = (data ?? []).map(rowToAgent)
      return rows.length > 0 ? rows : MOCK_AS_AGENTS
    },
    enabled: !!session,
    refetchInterval: 15_000,
  })
}

export function useAgent(id: string) {
  const { session } = useAuthStore()

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
    enabled: !!id && !!session,
  })
}

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
    // Optimistic update — flip the status instantly in the cache
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['agents'] })
      const prev = qc.getQueryData<Agent[]>(['agents'])
      qc.setQueryData<Agent[]>(['agents'], old =>
        old?.map(a => a.id === id ? { ...a, status: newStatus } : a) ?? []
      )
      return { prev }
    },
    // Roll back if Supabase call fails
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['agents'], ctx.prev)
    },
    // Sync with server after settle
    onSettled: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function usePauseAgent()  { return useAgentStatusMutation('paused')  }
export function useResumeAgent() { return useAgentStatusMutation('active')  }
export function useStopAgent()   { return useAgentStatusMutation('stopped') }

interface DeployPayload { name: string; mandateId: string; capitalCap?: number }

export function useDeployAgent() {
  const { session } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: DeployPayload) => {
      if (!session) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('agents')
        .insert({
          user_id:     session.user.id,
          mandate_id:  payload.mandateId,
          name:        payload.name,
          capital_cap: payload.capitalCap ?? 0,
          status:      'active',
          deployed_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}
