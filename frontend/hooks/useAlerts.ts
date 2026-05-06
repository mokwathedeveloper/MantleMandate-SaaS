'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/api'
import { useAlertStore } from '@/store/alertStore'

// Matches backend Alert.to_dict() after camelCase transform
export interface Alert {
  id: string
  agentId: string | null
  alertType: string
  severity: 'high' | 'medium' | 'low'
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

interface AlertsResponse {
  data: Alert[]
  total: number
  unreadCount: number
}

export function useAlerts() {
  const { unreadCount } = useAlertStore()

  const query = useQuery<AlertsResponse>({
    queryKey: ['alerts'],
    queryFn: () => api.get('/alerts').then((r) => r.data),
    refetchInterval: 10_000,
  })

  // Keep store unreadCount in sync with server's authoritative value
  useEffect(() => {
    if (query.data?.unreadCount !== undefined) {
      // Patch Zustand store's unreadCount without touching the alerts array
      useAlertStore.setState({ unreadCount: query.data.unreadCount })
    }
  }, [query.data?.unreadCount])

  return { ...query, alerts: query.data?.data ?? [], unreadCount }
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/alerts/read-all').then((r) => r.data),
    onSuccess: () => {
      useAlertStore.setState({ unreadCount: 0 })
      qc.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/alerts/${id}/read`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
