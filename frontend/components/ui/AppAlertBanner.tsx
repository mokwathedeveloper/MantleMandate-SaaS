'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, TriangleAlert, Zap, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAlertStore } from '@/store/alertStore'

type BannerVariant = 'success' | 'high' | 'warning'

const VARIANT: Record<BannerVariant, {
  wrapper: string
  bar:     string
  icon:    string
  text:    string
  btn:     string
  outline: string
  Icon:    typeof X
}> = {
  success: {
    wrapper: 'bg-success-bg border-l-4 border-success',
    bar:     'bg-success',
    icon:    'text-success',
    text:    'text-success',
    btn:     'bg-success text-white hover:opacity-90',
    outline: 'border border-success text-success hover:bg-success/10',
    Icon:    CheckCircle2,
  },
  high: {
    wrapper: 'bg-error-bg border-l-4 border-error',
    bar:     'bg-error',
    icon:    'text-error',
    text:    'text-error',
    btn:     'bg-error text-white hover:opacity-90',
    outline: 'border border-error text-error hover:bg-error/10',
    Icon:    TriangleAlert,
  },
  warning: {
    wrapper: 'bg-warning-bg border-l-4 border-warning',
    bar:     'bg-warning',
    icon:    'text-warning',
    text:    'text-warning',
    btn:     'bg-warning text-black hover:opacity-90',
    outline: 'border border-warning text-warning hover:bg-warning/10',
    Icon:    Zap,
  },
}

function toVariant(severity: string): BannerVariant {
  if (severity === 'low')    return 'success'
  if (severity === 'medium') return 'warning'
  return 'high'
}

const ACTION_MAP: Record<string, string[]> = {
  'INSUFFICIENT GAS':   ['Add Funds', 'Pause Agent'],
  'DRAWDOWN LIMIT HIT': ['Review Risk', 'Pause Agent'],
  'MANDATE BREACH':     ['Review Agent'],
  'TRADE FAILED':       ['View Details'],
  'AGENT ERROR':        ['View Agent'],
  'APPROVAL NEEDED':    ['Approve'],
  'LOW GAS WARNING':    ['Add Gas'],
  'DRAWDOWN WARNING':   ['Review Risk'],
  'TRADE EXECUTED':     ['View Trade'],
  'AGENT DEPLOYED':     ['View Agent'],
  'MANDATE UPDATED':    ['View Mandate'],
}

const ACTION_ROUTES: Record<string, string> = {
  'Add Funds':    '/dashboard/wallets',
  'Add Gas':      '/dashboard/wallets',
  'Pause Agent':  '/dashboard/agents',
  'Review Risk':  '/dashboard/mandates',
  'Review Agent': '/dashboard/agents',
  'View Agent':   '/dashboard/agents',
  'View Trade':   '/dashboard/trades',
  'View Details': '/dashboard/trades',
  'Approve':      '/dashboard/agents',
  'View Mandate': '/dashboard/mandates',
}

export function AppAlertBanner() {
  const { alerts, markRead } = useAlertStore()
  const router = useRouter()
  const [dismissed, setDismissed] = useState<string[]>([])
  const [progress, setProgress]   = useState(100)

  const topAlert = (() => {
    const unread = alerts.filter(a => !a.isRead && !dismissed.includes(a.id))
    return (
      unread.find(a => a.severity === 'high')   ??
      unread.find(a => a.severity === 'medium') ??
      unread[0]
    )
  })()

  const variant   = topAlert ? toVariant(topAlert.severity) : 'success'
  const v         = VARIANT[variant]
  const isSuccess = variant === 'success'

  // Capture only the ID so the timer closure never holds a stale object ref
  const topAlertId = topAlert?.id ?? null

  // Auto-dismiss success alerts after 8 s
  useEffect(() => {
    if (!topAlertId || !isSuccess) return
    setProgress(100)
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p - (100 / 80)
        if (next <= 0) {
          clearInterval(interval)
          setDismissed(prev => [...prev, topAlertId])
          markRead(topAlertId)
          return 0
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [topAlertId, isSuccess, markRead])

  if (!topAlert) return null

  const dismiss = () => {
    setDismissed(prev => [...prev, topAlert.id])
    markRead(topAlert.id)
  }

  const actions = ACTION_MAP[topAlert.alertType?.toUpperCase()] ?? []

  return (
    <div
      role="alert"
      aria-live={variant === 'high' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'relative shrink-0 overflow-hidden',
        'flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1.5',
        'px-4 py-2.5 min-h-[48px]',
        v.wrapper,
      )}
    >
      {/* Icon */}
      <v.Icon className={cn('h-4 w-4 shrink-0', v.icon)} aria-hidden="true" />

      {/* Message — fills available width, wraps naturally on narrow screens */}
      <p className={cn('flex-1 min-w-0 text-[13px] sm:text-sm font-medium leading-snug', v.text)}>
        <span className="font-semibold">{topAlert.title}:</span>{' '}
        {topAlert.message}
      </p>

      {/* Action buttons — hidden on xs (< 480px) to prevent overflow */}
      {actions.length > 0 && (
        <div className="hidden xs:flex items-center gap-2 shrink-0">
          {actions.map((label, i) => (
            <button
              key={label}
              onClick={() => router.push(ACTION_ROUTES[label] ?? '/dashboard')}
              className={cn(
                'text-xs px-3 h-7 rounded font-semibold transition-opacity',
                i === 0 ? v.btn : v.outline,
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        className={cn('shrink-0 ml-1 hover:opacity-70 transition-opacity', v.icon)}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Auto-dismiss progress bar (success only) */}
      {isSuccess && (
        <div
          aria-hidden="true"
          className={cn('absolute bottom-0 left-0 h-0.5 transition-none', v.bar)}
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  )
}
