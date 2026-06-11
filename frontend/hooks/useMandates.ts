'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Mandate } from '@/types/mandate'

function rowToMandate(row: Record<string, unknown>): Mandate {
  const rp = (row.risk_params as Record<string, number> | null) ?? {}
  return {
    id:            row.id as string,
    name:          row.name as string,
    mandateText:   row.mandate_text as string,
    parsedPolicy:  row.parsed_policy as Mandate['parsedPolicy'],
    policyHash:    row.policy_hash as string | null,
    baseCurrency:  row.base_currency as string,
    strategyType:  row.strategy_type as string | null,
    riskParams: {
      maxDrawdown:   rp.maxDrawdown   ?? 15,
      maxPosition:   rp.maxPosition   ?? 20,
      stopLoss:      rp.stopLoss      ?? 5,
      maxPositions:  rp.maxPositions  ?? 5,
      cooldownHours: rp.cooldownHours ?? 1,
    },
    capitalCap:    row.capital_cap as number | null,
    status:        row.status as Mandate['status'],
    onChainTx:     row.on_chain_tx as string | null,
    createdAt:     row.created_at as string,
    updatedAt:     row.updated_at as string,
  }
}

interface MandateListResponse {
  data:        Mandate[]
  total:       number
  page:        number
  total_pages: number
}

export function useMandates(params?: { page?: number; status?: string; enabled?: boolean }) {
  const { user } = useAuthStore()
  const page     = params?.page   ?? 1
  const status   = params?.status ?? null
  const pageSize = 20

  return useQuery<MandateListResponse>({
    // Use specific scalar deps — not the whole params object — so React Query
    // can correctly detect when only the filter changes (and resets to page 1).
    queryKey: ['mandates', page, status],
    queryFn: async () => {
      try {
        let q = supabase
          .from('mandates')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1)

        if (status) q = q.eq('status', status)

        const { data, error, count } = await q
        if (error) throw error
        const total = count ?? 0
        return {
          data:        (data ?? []).map(rowToMandate),
          total,
          page,
          total_pages: Math.ceil(total / pageSize),
        }
      } catch {
        return { data: [], total: 0, page, total_pages: 0 }
      }
    },
    retry: false,
    enabled: params?.enabled !== false && !!user,
    // Reset to first page when a new status filter fires
    placeholderData: (prev) => page === 1 ? undefined : prev,
  })
}

export function useMandate(id: string) {
  const { user } = useAuthStore()
  return useQuery<Mandate>({
    queryKey: ['mandates', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('mandates')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        return rowToMandate(data)
      } catch {
        throw new Error('Mandate not found')
      }
    },
    retry: false,
    enabled: !!id && !!user,
  })
}

interface CreatePayload {
  name:           string
  mandate_text:   string
  base_currency?: string
  strategy_type?: string
  capital_cap?:   number
  risk_params?:   Record<string, number>
  status?:        'draft' | 'active'
  parsed_policy?: Record<string, unknown> | null
  policy_hash?:   string | null
}

export function useCreateMandate() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('mandates')
        .insert({
          user_id:       user.id,
          name:          payload.name,
          mandate_text:  payload.mandate_text,
          base_currency: payload.base_currency ?? 'USDC',
          strategy_type: payload.strategy_type ?? null,
          capital_cap:   payload.capital_cap   ?? null,
          risk_params:   payload.risk_params   ?? {},
          status:        payload.status ?? 'draft',
          parsed_policy: payload.parsed_policy ?? null,
          policy_hash:   payload.policy_hash   ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return rowToMandate(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mandates'] }),
  })
}

export function useUpdateMandate(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<CreatePayload & { status: string }>) => {
      const { data, error } = await supabase
        .from('mandates')
        .update({
          ...(payload.name          && { name: payload.name }),
          ...(payload.mandate_text  && { mandate_text: payload.mandate_text }),
          ...(payload.base_currency && { base_currency: payload.base_currency }),
          ...(payload.strategy_type && { strategy_type: payload.strategy_type }),
          ...(payload.capital_cap   !== undefined && { capital_cap: payload.capital_cap }),
          ...(payload.risk_params   && { risk_params: payload.risk_params }),
          ...(payload.status        && { status: payload.status as Mandate['status'] }),
          ...(payload.parsed_policy !== undefined && { parsed_policy: payload.parsed_policy }),
          ...(payload.policy_hash   !== undefined && { policy_hash: payload.policy_hash }),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return rowToMandate(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mandates'] })
      qc.invalidateQueries({ queryKey: ['mandates', id] })
    },
  })
}

export function useDeleteMandate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('mandates').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mandates'] }),
  })
}

interface ParsePreviewResult {
  parsed_policy: Record<string, unknown>
  policy_hash:   string
}

export function useParsePreview() {
  const [result, setResult]   = useState<ParsePreviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef              = useRef<AbortController | null>(null)

  const parse = useCallback((text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    abortRef.current?.abort()

    if (!text || text.length < 10) {
      setResult(null)
      setError(null)
      return
    }

    timerRef.current = setTimeout(async () => {
      abortRef.current = new AbortController()
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/mandates/parse', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ mandate_text: text }),
          signal:  abortRef.current.signal,
        })
        const json = await res.json() as { data?: ParsePreviewResult; error?: string }
        if (!res.ok || json.error) throw new Error(json.error ?? 'Parse failed')
        setResult(json.data!)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Parse failed')
        setResult(null)
      } finally {
        setLoading(false)
      }
    }, 900)
  }, [])

  return { parse, result, loading, error }
}
