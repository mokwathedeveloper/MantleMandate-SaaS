'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import api from '@/lib/api'
import type { Mandate } from '@/types/mandate'

interface MandateListResponse {
  data:        Mandate[]
  total:       number
  page:        number
  total_pages: number
}

export function useMandates(params?: { page?: number; status?: string; enabled?: boolean }) {
  const query = new URLSearchParams()
  if (params?.page)   query.set('page',   String(params.page))
  if (params?.status) query.set('status', params.status)

  return useQuery<MandateListResponse>({
    queryKey: ['mandates', params],
    queryFn: () => api.get(`/mandates?${query}`).then((r) => r.data),
    retry: false,
    enabled: params?.enabled !== false,
  })
}

export function useMandate(id: string) {
  return useQuery<Mandate>({
    queryKey: ['mandates', id],
    queryFn: () => api.get(`/mandates/${id}`).then((r) => r.data.data),
    enabled: !!id,
  })
}

interface CreatePayload {
  name:          string
  mandate_text:  string
  base_currency?: string
  strategy_type?: string
  capital_cap?:   number
  risk_params?:   Record<string, number>
}

export function useCreateMandate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePayload) =>
      api.post<{ data: Mandate }>('/mandates', payload).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mandates'] }),
  })
}

export function useUpdateMandate(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<CreatePayload & { status: string }>) =>
      api.put<{ data: Mandate }>(`/mandates/${id}`, payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mandates'] })
      qc.invalidateQueries({ queryKey: ['mandates', id] })
    },
  })
}

export function useDeleteMandate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/mandates/${id}`),
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
        const res = await api.post<{ data: ParsePreviewResult }>('/mandates/parse-preview', {
          mandate_text: text,
        })
        setResult(res.data.data)
      } catch (err: any) {
        const msg = err.response?.data?.message ?? 'Parse failed'
        setError(msg)
        setResult(null)
      } finally {
        setLoading(false)
      }
    }, 800)
  }, [])

  return { parse, result, loading, error }
}
