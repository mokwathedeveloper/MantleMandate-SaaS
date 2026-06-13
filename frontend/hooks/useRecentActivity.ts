'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export interface ActivityItem {
  id:    string
  label: string
  time:  string
}

export interface RecentActivity {
  items:     ActivityItem[]
  count24h:  number
}

const EMPTY: RecentActivity = { items: [], count24h: 0 }

const EVENT_LABELS: Record<string, string> = {
  trade_executed:  'Trade executed',
  trade_failed:    'Trade failed',
  agent_deployed:  'Agent deployed',
  agent_paused:    'Agent paused',
  agent_resumed:   'Agent resumed',
  agent_stopped:   'Agent stopped',
  mandate_check:   'Mandate policy checked',
  policy_submitted: 'Mandate policy submitted on-chain',
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1)  return 'just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24)  return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

export function useRecentActivity(limit = 4) {
  const { user } = useAuthStore()

  return useQuery<RecentActivity>({
    queryKey: ['recent-activity', user?.id, limit],
    queryFn: async () => {
      if (!user) return EMPTY

      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const [recent, count24h] = await Promise.all([
        supabase
          .from('audit_logs')
          .select('id, event_type, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('audit_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', since24h),
      ])

      const rows = (recent.data ?? []) as { id: string; event_type: string; created_at: string }[]
      const items = rows.map((row) => ({
        id:    row.id,
        label: EVENT_LABELS[row.event_type] ?? row.event_type,
        time:  timeAgo(row.created_at),
      }))

      return { items, count24h: count24h.count ?? 0 }
    },
    enabled: !!user,
    refetchInterval: 30_000,
  })
}
