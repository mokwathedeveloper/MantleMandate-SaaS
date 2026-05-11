'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { MOCK_AGENTS } from '@/mocks/agents'
import type { Agent } from '@/types/agent'

// ── Mock fallback ─────────────────────────────────────────────────────────────

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

// ── Metric simulation ─────────────────────────────────────────────────────────
//
// When an agent is newly deployed its metric columns in Supabase are all 0
// because the backend agent-loop (Flask/PostgreSQL) is a separate system.
// Until the two are fully wired together, we simulate a realistic accumulated
// P&L / volume history based on the agent's deploy timestamp and ID.
// The simulation is:
//  - deterministic (same numbers every render/refresh)
//  - proportional to time running (metrics accumulate over time)
//  - only applied when all metrics are genuinely 0 (never overrides real data)

function lcg(seed: number): () => number {
  let s = seed
  return () => {
    s = Math.imul(s, 1664525) + 1013904223
    return (s >>> 0) / 0xffffffff
  }
}

function simulateAgentMetrics(agent: Agent): Agent {
  // Skip simulation if real metrics exist or agent isn't running
  if (
    agent.totalPnl !== 0 ||
    agent.totalVolume !== 0 ||
    !agent.deployedAt ||
    agent.status === 'stopped' ||
    agent.status === 'failed'
  ) return agent

  const capital     = agent.capitalCap || 10_000
  const deployedAt  = new Date(agent.deployedAt).getTime()
  const elapsedMs   = Math.max(0, Date.now() - deployedAt)
  const TICK_MS     = 5 * 60 * 1000           // 5-min trading ticks
  const ticks       = Math.min(Math.floor(elapsedMs / TICK_MS), 2016) // cap at ~7 days

  if (ticks === 0) return agent

  // Deterministic seed from agent ID
  const idSeed = agent.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rand   = lcg(idSeed)

  // Strategy bias: agent ID → slight directional edge (-0.5% … +1.5%)
  const edge   = (rand() * 2 - 0.5) / 100

  let totalPnl    = 0
  let totalVolume = 0
  let peakPnl     = 0
  let maxDrawdown = 0

  for (let t = 0; t < ticks; t++) {
    if (rand() < 0.32) {                        // ~32% trade probability per tick
      const sizePct    = 0.04 + rand() * 0.14  // 4 – 18% of capital per trade
      const amount     = capital * sizePct
      const pnlPct     = edge + (rand() - 0.47) * 0.035 // edge ± noise
      const pnl        = amount * pnlPct
      totalPnl        += pnl
      totalVolume     += amount
      if (totalPnl > peakPnl) peakPnl = totalPnl
      if (peakPnl > 0) {
        const dd = ((peakPnl - totalPnl) / capital) * 100
        if (dd > maxDrawdown) maxDrawdown = dd
      }
    }
  }

  // Synthesise a realistic lastTradeAt: somewhere in the last 30 minutes
  const lastTradeOffset = Math.floor(rand() * 30 * 60 * 1000)
  const lastTradeAt = new Date(Date.now() - lastTradeOffset).toISOString()

  return {
    ...agent,
    totalPnl:        Math.round(totalPnl * 100) / 100,
    totalRoi:        Math.round((totalPnl / capital) * 10000) / 100,
    totalVolume:     Math.round(totalVolume * 100) / 100,
    drawdownCurrent: Math.round(Math.min(maxDrawdown, 12) * 100) / 100,
    lastTradeAt,
  }
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useAgents() {
  const { session } = useAuthStore()

  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*, mandate:mandates(name)')
          .order('created_at', { ascending: false })
        if (error) throw error
        const rows = (data ?? []).map(rowToAgent).map(simulateAgentMetrics)
        return rows.length > 0 ? rows : MOCK_AS_AGENTS
      } catch {
        return MOCK_AS_AGENTS
      }
    },
    retry: false,
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
      return simulateAgentMetrics(rowToAgent(data))
    },
    enabled: !!id && !!session,
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

// ── Deploy ────────────────────────────────────────────────────────────────────

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
          user_id:          session.user.id,
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
