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
  const { session } = useAuthStore()
  const page = params?.page ?? 1
  const pageSize = 20

  return useQuery<MandateListResponse>({
    queryKey: ['mandates', params],
    queryFn: async () => {
      let q = supabase
        .from('mandates')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (params?.status) q = q.eq('status', params.status)

      const { data, error, count } = await q
      if (error) throw error
      const total = count ?? 0
      return {
        data:        (data ?? []).map(rowToMandate),
        total,
        page,
        total_pages: Math.ceil(total / pageSize),
      }
    },
    retry: false,
    enabled: params?.enabled !== false && !!session,
  })
}

export function useMandate(id: string) {
  const { session } = useAuthStore()
  return useQuery<Mandate>({
    queryKey: ['mandates', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mandates')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return rowToMandate(data)
    },
    enabled: !!id && !!session,
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
}

export function useCreateMandate() {
  const { session } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      if (!session) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('mandates')
        .insert({
          user_id:       session.user.id,
          name:          payload.name,
          mandate_text:  payload.mandate_text,
          base_currency: payload.base_currency ?? 'USDC',
          strategy_type: payload.strategy_type ?? null,
          capital_cap:   payload.capital_cap   ?? null,
          risk_params:   payload.risk_params   ?? {},
          status:        payload.status ?? 'draft',
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

  const parse = useCallback((text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!text || text.length < 10) {
      setResult(null)
      setError(null)
      return
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/mandates/parse', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ mandate_text: text }),
        })
        const json = await res.json() as { data?: ParsePreviewResult; error?: string }
        if (!res.ok || json.error) throw new Error(json.error ?? 'Parse failed')
        setResult(json.data!)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Parse failed')
        setResult(null)
      } finally {
        setLoading(false)
      }
    }, 900)
  }, [])

  return { parse, result, loading, error }
}
