'use client'

import { useAlertStore } from '@/store/alertStore'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { Bell } from 'lucide-react'
import type { BadgeVariant } from '@/components/ui/Badge'

const SEVERITY_VARIANT: Record<string, BadgeVariant> = {
  high:   'error',
  medium: 'warning',
  low:    'default',
}

const SEVERITY_DOT: Record<string, string> = {
  high:   'bg-error',
  medium: 'bg-warning',
  low:    'bg-primary',
}

function timeAgo(dateStr: string) {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60)   return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

export function AlertsPanel() {
  const { alerts, unreadCount, markRead, markAllRead, clearAll } = useAlertStore()

  return (
    <aside className="flex h-full w-80 flex-col border-l border-border bg-card shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
        <h4 className="text-base font-semibold text-text-primary">Real-Time Alerts</h4>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[13px] text-text-link hover:text-text-link-hover transition-colors"
            >
              Mark all read
            </button>
          )}
          {alerts.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
            <Bell className="h-8 w-8 text-text-disabled" />
            <p className="text-[13px] text-text-disabled font-medium">No alerts right now</p>
            <p className="text-[13px] text-text-disabled">Your agents are running smoothly.</p>
          </div>
        ) : (
          <div className="py-2 space-y-0">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => markRead(alert.id)}
                className={cn(
                  'flex gap-3 px-5 py-3.5 border-b border-border/50 cursor-pointer transition-colors',
                  alert.isRead ? 'opacity-50' : 'hover:bg-surface',
                )}
              >
                {/* Severity dot */}
                <div className="mt-1.5 shrink-0">
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    SEVERITY_DOT[alert.severity] ?? 'bg-primary',
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-text-primary leading-snug truncate">
                      {alert.title}
                    </p>
                    <Badge variant={SEVERITY_VARIANT[alert.severity]} className="shrink-0 text-[10px] py-0 px-1.5 uppercase">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed line-clamp-2">
                    {alert.message}
                  </p>
                  <p className="text-[11px] text-text-disabled mt-1">
                    {timeAgo(alert.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
