'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, TriangleAlert, Zap, X } from 'lucide-react'
import { useAlertStore } from '@/store/alertStore'

// ─── Severity → banner style map ──────────────────────────────────────────────

type BannerVariant = 'success' | 'high' | 'warning'

const VARIANT_STYLE: Record<BannerVariant, {
  bg: string; border: string; color: string; Icon: typeof X
}> = {
  success: { bg: '#0D2818', border: '#22C55E', color: '#22C55E', Icon: CheckCircle2 },
  high:    { bg: '#2D0F0F', border: '#EF4444', color: '#EF4444', Icon: TriangleAlert },
  warning: { bg: '#2A2000', border: '#F5C542', color: '#F5C542', Icon: Zap },
}

// Map alert severity to banner variant
function toVariant(severity: string): BannerVariant {
  if (severity === 'low')    return 'success'
  if (severity === 'medium') return 'warning'
  return 'high'
}

// Contextual action buttons per alert type
const ACTION_MAP: Record<string, string[]> = {
  'INSUFFICIENT GAS':     ['Add Funds', 'Pause Agent'],
  'DRAWDOWN LIMIT HIT':   ['Review Risk', 'Pause Agent'],
  'MANDATE BREACH':       ['Review Agent'],
  'TRADE FAILED':         ['View Details'],
  'AGENT ERROR':          ['View Agent'],
  'APPROVAL NEEDED':      ['Approve'],
  'LOW GAS WARNING':      ['Add Gas'],
  'DRAWDOWN WARNING':     ['Review Risk'],
  'TRADE EXECUTED':       ['View Trade'],
  'AGENT DEPLOYED':       ['View Agent'],
  'MANDATE UPDATED':      ['View Mandate'],
}

// ─── Banner ───────────────────────────────────────────────────────────────────

export function AppAlertBanner() {
  const { alerts, markRead } = useAlertStore()
  const [dismissed, setDismissed] = useState<string[]>([])
  const [progress, setProgress]   = useState(100)

  // Pick the most severe unread, non-dismissed alert
  const topAlert = (() => {
    const unread = alerts.filter(a => !a.isRead && !dismissed.includes(a.id))
    return (
      unread.find(a => a.severity === 'high')   ??
      unread.find(a => a.severity === 'medium') ??
      unread[0]
    )
  })()

  const variant  = topAlert ? toVariant(topAlert.severity) : 'success'
  const style    = VARIANT_STYLE[variant]
  const isSuccess = variant === 'success'

  // Auto-dismiss for success/low only (8 s)
  useEffect(() => {
    if (!topAlert || !isSuccess) return
    setProgress(100)
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p - (100 / 80)          // 80 ticks × 100 ms = 8 s
        if (next <= 0) {
          clearInterval(interval)
          setDismissed(prev => [...prev, topAlert.id])
          markRead(topAlert.id)
          return 0
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [topAlert?.id, isSuccess])   // eslint-disable-line react-hooks/exhaustive-deps

  if (!topAlert) return null

  const dismiss = () => {
    setDismissed(prev => [...prev, topAlert.id])
    markRead(topAlert.id)
  }

  const actions = ACTION_MAP[topAlert.alertType?.toUpperCase()] ?? []

  return (
    <div
      className="relative flex items-center gap-3 px-4 shrink-0 overflow-hidden"
      style={{
        height: 48,
        background: style.bg,
        borderLeft: `4px solid ${style.border}`,
      }}
    >
      <style.Icon className="h-4 w-4 shrink-0" style={{ color: style.color }} />

      <p className="text-[14px] font-medium flex-1 truncate" style={{ color: style.color }}>
        {topAlert.title}: {topAlert.message}
      </p>

      {/* Inline action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {actions.map((label, i) => (
          i === 0 ? (
            <button
              key={label}
              className="text-xs px-3 font-medium text-white rounded transition-opacity hover:opacity-80"
              style={{ background: style.border, height: 28 }}
            >
              {label}
            </button>
          ) : (
            <button
              key={label}
              className="text-xs px-3 font-medium rounded transition-opacity hover:opacity-80"
              style={{
                border: `1px solid ${style.border}`,
                color: style.color,
                height: 28,
              }}
            >
              {label}
            </button>
          )
        ))}

        {/* Dismiss */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 ml-1 hover:opacity-70 transition-opacity"
          style={{ color: style.color }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Auto-dismiss progress bar (success only) */}
      {isSuccess && (
        <div
          className="absolute bottom-0 left-0 h-0.5 transition-none"
          style={{ width: `${progress}%`, background: style.border }}
        />
      )}
    </div>
  )
}
