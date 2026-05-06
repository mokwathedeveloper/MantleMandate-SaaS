'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Agent } from '@/types/agent'

export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: () => api.get('/agents').then((r) => r.data.data),
    refetchInterval: 15_000,
  })
}

export function useAgent(id: string) {
  return useQuery<Agent>({
    queryKey: ['agents', id],
    queryFn: () => api.get(`/agents/${id}`).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function usePauseAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/agents/${id}/pause`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useResumeAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/agents/${id}/resume`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useStopAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/agents/${id}/stop`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}

interface DeployPayload { name: string; mandateId: string; capitalCap?: number }

export function useDeployAgent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DeployPayload) =>
      api.post<{ data: Agent }>('/agents', {
        name:        payload.name,
        mandate_id:  payload.mandateId,
        capital_cap: payload.capitalCap,   // was wrong: 'capital_limit'
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  })
}
