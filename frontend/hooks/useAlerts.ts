'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useAlertStore } from '@/store/alertStore'

export interface Alert {
  id:        string
  agentId:   string | null
  alertType: string
  severity:  'high' | 'medium' | 'low'
  title:     string
  message:   string
  isRead:    boolean
  createdAt: string
}

interface AlertsResponse {
  data:        Alert[]
  total:       number
  unreadCount: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAlert(row: Record<string, any>): Alert {
  return {
    id:        row.id,
    agentId:   row.agent_id ?? null,
    alertType: row.type,
    severity:  row.severity === 'critical' ? 'high' : row.severity === 'warning' ? 'medium' : 'low',
    title:     row.title,
    message:   row.message,
    isRead:    row.is_read,
    createdAt: row.created_at,
  }
}

export function useAlerts() {
  const { session } = useAuthStore()
  const { unreadCount } = useAlertStore()

  const query = useQuery<AlertsResponse>({
    queryKey: ['alerts'],
    queryFn: async () => {
      try {
        const { data, error, count } = await supabase
          .from('alerts')
          .select('*', { count: 'exact' })
          .eq('user_id', session!.user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        const alerts: Alert[] = (data ?? []).map(rowToAlert)
        return {
          data:        alerts,
          total:       count ?? 0,
          unreadCount: alerts.filter(a => !a.isRead).length,
        }
      } catch {
        return { data: [], total: 0, unreadCount: 0 }
      }
    },
    retry: false,
    enabled: !!session,
    refetchInterval: 10_000,
  })

  useEffect(() => {
    if (query.data?.unreadCount !== undefined) {
      useAlertStore.setState({ unreadCount: query.data.unreadCount })
    }
  }, [query.data?.unreadCount])

  return { ...query, alerts: query.data?.data ?? [], unreadCount }
}

export function useMarkAllRead() {
  const { session } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!session) return
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
      if (error) throw error
    },
    onSuccess: () => {
      useAlertStore.setState({ unreadCount: 0 })
      qc.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
