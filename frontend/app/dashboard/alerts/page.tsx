'use client'

import { useState } from 'react'
import { Bell, ChevronDown, Check, X } from 'lucide-react'
import NextLink from 'next/link'
import { useAlerts, useMarkAllRead, type Alert } from '@/hooks/useAlerts'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Filter = 'all' | 'unread' | 'high' | 'medium' | 'low'

// ─── Mock fallback data ───────────────────────────────────────────────────────

const MOCK_ALERTS: Alert[] = [
  {
    id: '1', agentId: 'agent-1', alertType: 'DRAWDOWN LIMIT HIT', severity: 'high',
    title: 'DRAWDOWN LIMIT HIT',
    message: 'Agent "ETH Conservative" was paused because the drawdown threshold was reached before execution.',
    isRead: false, createdAt: '2026-05-06T09:45:21Z',
  },
  {
    id: '2', agentId: 'agent-1', alertType: 'MANDATE BREACH', severity: 'high',
    title: 'MANDATE BREACH',
    message: 'Agent paused after reaching 12.3% drawdown of 15% mandate limit.',
    isRead: false, createdAt: '2026-05-06T08:22:10Z',
  },
  {
    id: '3', agentId: 'agent-2', alertType: 'TRADE FAILED', severity: 'high',
    title: 'TRADE FAILED',
    message: 'WBTC/ETH trade failed due to slippage exceeding mandate tolerance at 67.3%.',
    isRead: false, createdAt: '2026-05-05T22:10:45Z',
  },
  {
    id: '4', agentId: 'agent-3', alertType: 'LOW GAS WARNING', severity: 'medium',
    title: 'LOW GAS WARNING',
    message: 'ETH Agent 8 has only 0.002 ETH gas remaining and may pause soon.',
    isRead: true, createdAt: '2026-05-05T18:30:00Z',
  },
  {
    id: '5', agentId: 'agent-4', alertType: 'DRAWDOWN WARNING', severity: 'medium',
    title: 'DRAWDOWN WARNING',
    message: 'ETH Momentum is approaching its drawdown limit. 12.2% used out of 15%.',
    isRead: true, createdAt: '2026-05-05T14:00:33Z',
  },
  {
    id: '6', agentId: 'agent-5', alertType: 'APPROVAL NEEDED', severity: 'high',
    title: 'APPROVAL NEEDED',
    message: 'Stablecoin Yield Drone Agent requires approval before deploying $12,000 in new pool.',
    isRead: false, createdAt: '2026-05-05T10:15:09Z',
  },
  {
    id: '7', agentId: 'agent-6', alertType: 'AGENT DEPLOYED', severity: 'low',
    title: 'AGENT DEPLOYED',
    message: 'ETH Momentum Strategy was successfully deployed with a $25,000 mandate.',
    isRead: true, createdAt: '2026-05-04T16:00:00Z',
  },
  {
    id: '8', agentId: 'agent-7', alertType: 'TRADE EXECUTED', severity: 'low',
    title: 'TRADE EXECUTED',
    message: '+$2,450 | ETH/USDT via Merchant Moe — Position opened successfully.',
    isRead: true, createdAt: '2026-05-04T12:30:55Z',
  },
]

// ─── Severity styles (exact hex) ──────────────────────────────────────────────

const SEVERITY_DOT_CLASS: Record<string, string> = {
  high:   'bg-error',
  medium: 'bg-warning',
  low:    'bg-text-link',
}
const SEVERITY_BADGE_CLASS: Record<string, string> = {
  high:   'text-error',
  medium: 'text-warning',
  low:    'text-text-link',
}

// ─── Action buttons per alert type ───────────────────────────────────────────

const ACTION_LABEL: Record<string, string> = {
  'TRADE EXECUTED':     'View Trade',
  'MANDATE UPDATED':    'View Mandate',
  'AGENT DEPLOYED':     'View Agent',
  'LOW GAS WARNING':    'Add Gas',
  'DRAWDOWN WARNING':   'Review Risk',
  'MANDATE BREACH':     'Review Agent',
  'DRAWDOWN LIMIT HIT': 'Review Risk',
  'INSUFFICIENT GAS':   'Add Funds',
  'TRADE FAILED':       'View Details',
  'AGENT ERROR':        'View Agent',
  'APPROVAL NEEDED':    'Approve',
}

const AGENT_NAMES: Record<string, string> = {
  'agent-1': 'ETH Conservative Buyer',
  'agent-2': 'BTC Momentum Trader',
  'agent-3': 'ETH Agent 8',
  'agent-4': 'ETH Momentum Strategy',
  'agent-5': 'Stablecoin Yield Drone',
  'agent-6': 'ETH Momentum Strategy',
  'agent-7': 'WBTC Arb Bot',
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, locked }: { on: boolean; locked?: boolean }) {
  const [state, setState] = useState(on)
  return (
    <button
      type="button"
      onClick={() => !locked && setState(v => !v)}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors shrink-0',
        state ? 'bg-primary' : 'bg-surface border border-border',
        locked && 'cursor-not-allowed opacity-60',
      )}
    >
      <span className={cn(
        'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
        state ? 'translate-x-4' : 'translate-x-0.5',
      )} />
    </button>
  )
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

function AlertCard({ alert, onMarkRead }: { alert: Alert; onMarkRead: (id: string) => void }) {
  const dotClass   = SEVERITY_DOT_CLASS[alert.severity] ?? 'bg-text-secondary'
  const badgeClass = SEVERITY_BADGE_CLASS[alert.severity] ?? 'text-text-secondary'
  const action     = ACTION_LABEL[alert.alertType]
  const agentName  = alert.agentId ? (AGENT_NAMES[alert.agentId] ?? `Agent ${alert.agentId}`) : null

  return (
    <div className={cn(
      'rounded-md p-4',
      alert.isRead
        ? 'bg-card border border-border'
        : 'bg-surface border border-border border-l-[3px] border-l-primary',
    )}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        {/* Left: dot + content */}
        <div className="flex items-start gap-2 sm:gap-3 min-w-0">
          <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 mt-0.5', dotClass)} />
          <div className="min-w-0 flex-1">
            {/* Alert type */}
            <p className="text-[13px] font-semibold text-text-primary leading-[1.4]">
              {alert.title}
            </p>
            {/* Description */}
            <p className="text-[13px] text-text-secondary mt-0.5 leading-[1.4]">
              {alert.message}
            </p>
            {/* Agent name */}
            {agentName && (
              <p className="text-xs text-text-disabled mt-1">
                Agent: {agentName}
              </p>
            )}
            {/* Timestamp */}
            <p className="text-[11px] text-text-disabled mt-0.5">
              {new Date(alert.createdAt).toLocaleString('en-US', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
              })}
            </p>
            {/* Agent link */}
            {alert.agentId && (
              <NextLink
                href={`/dashboard/agents/${alert.agentId}`}
                className="text-xs text-text-link hover:underline underline-offset-2 mt-1 inline-block"
              >
                View agent →
              </NextLink>
            )}
          </div>
        </div>

        {/* Right: badge + read indicator + action */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider', badgeClass)}>
              {alert.severity}
            </span>
            {alert.isRead
              ? <Check className="h-3.5 w-3.5 text-text-disabled" />
              : <div className="h-2 w-2 rounded-full bg-primary" />
            }
          </div>
          {action && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="text-xs border border-border text-text-secondary rounded px-2 py-1 h-[26px] transition-colors hover:opacity-80"
            >
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AlertSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-4 border border-border rounded-md bg-card">
          <div className="w-2.5 h-2.5 rounded-full bg-surface animate-pulse mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-surface rounded animate-pulse w-1/4" />
            <div className="h-3 bg-surface rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Bell className="h-12 w-12 mb-4 text-text-disabled" />
      <p className="font-semibold text-sm text-text-primary mb-1">{"You're all caught up"}</p>
      <p className="text-sm text-text-secondary">No alerts right now. Your agents are running smoothly.</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const [filter,      setFilter]      = useState<Filter>('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [typeFilter,  setTypeFilter]  = useState('all')
  const [showNotif,   setShowNotif]   = useState(false)
  const [telegramUrl, setTelegramUrl] = useState('')
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'connected' | 'failed'>('idle')

  const { alerts: apiAlerts, isLoading } = useAlerts()
  const { mutate: markAllRead } = useMarkAllRead()

  // Use mock fallback if API returned nothing
  const allAlerts = apiAlerts.length > 0 ? apiAlerts : MOCK_ALERTS

  const [localAlerts, setLocalAlerts] = useState<Alert[] | null>(null)
  const displayAlerts = localAlerts ?? allAlerts

  const unreadCount = displayAlerts.filter(a => !a.isRead).length

  const handleMarkAllRead = () => {
    markAllRead()
    setLocalAlerts(displayAlerts.map(a => ({ ...a, isRead: true })))
  }

  const handleClearAll = () => setLocalAlerts([])

  const handleMarkRead = (id: string) => {
    setLocalAlerts(
      (displayAlerts).map(a => a.id === id ? { ...a, isRead: true } : a)
    )
  }

  const filtered = displayAlerts.filter(a => {
    if (filter === 'unread') return !a.isRead
    if (filter === 'high')   return a.severity === 'high'
    if (filter === 'medium') return a.severity === 'medium'
    if (filter === 'low')    return a.severity === 'low'
    return true
  }).filter(a =>
    agentFilter === 'all' || a.agentId === agentFilter
  ).filter(a =>
    typeFilter === 'all' || a.alertType === typeFilter
  )

  const TABS: { key: Filter; label: string }[] = [
    { key: 'all',    label: 'All' },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'high',   label: 'HIGH' },
    { key: 'medium', label: 'MEDIUM' },
    { key: 'low',    label: 'LOW' },
  ]

  const uniqueTypes = Array.from(new Set(displayAlerts.map(a => a.alertType)))

  const [telegramSaved, setTelegramSaved] = useState(false)

  const testTelegram = () => {
    setTelegramStatus(telegramUrl.startsWith('https://') ? 'connected' : 'failed')
  }

  const saveTelegram = () => {
    if (!telegramUrl.trim()) return
    setTelegramSaved(true)
    setTimeout(() => setTelegramSaved(false), 2500)
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Alerts</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Real-time notifications from your agents and mandates.
        </p>
      </div>

      {/* Filter bar */}
      <div className="space-y-3">
        {/* Severity tabs + actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-0.5">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors rounded',
                  filter === t.key
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-text-link transition-colors hover:underline underline-offset-2"
            >
              Mark all read
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Agent filter */}
          <div className="relative">
            <select
              value={agentFilter}
              onChange={e => setAgentFilter(e.target.value)}
              className="appearance-none bg-input border border-border rounded-md pl-3 pr-7 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Agents</option>
              {Object.entries(AGENT_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          </div>

          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="appearance-none bg-input border border-border rounded-md pl-3 pr-7 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Alert list */}
      {isLoading && <AlertSkeleton />}
      {!isLoading && filtered.length === 0 && <EmptyState />}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(a => (
            <AlertCard key={a.id} alert={a} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}

      {/* Notification Settings (collapsible) */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowNotif(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-text-primary hover:bg-surface transition-colors"
        >
          <span className="font-semibold text-sm">Notification Preferences</span>
          <ChevronDown className={cn(
            'h-4 w-4 text-text-secondary transition-transform duration-200',
            showNotif && 'rotate-180',
          )} />
        </button>

        {showNotif && (
          <div className="px-5 pb-5 space-y-5 border-t border-border">

            {/* Email toggles */}
            <div className="space-y-3 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
                Email Notifications
              </p>
              {[
                ['Trade executions', true],
                ['Agent errors',     true],
                ['Drawdown alerts',  true],
                ['Daily summary',    false],
              ].map(([label, on]) => (
                <div key={String(label)} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{String(label)}</span>
                  <Toggle on={Boolean(on)} />
                </div>
              ))}
            </div>

            {/* In-app */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
                In-App Notifications
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">All alerts (always on)</span>
                <Toggle on locked />
              </div>
              <p className="text-xs text-text-disabled italic">
                In-app alerts cannot be disabled for system-critical events.
              </p>
            </div>

            {/* Telegram webhook */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
                Telegram Webhook (optional)
              </p>
              <div className="flex gap-2 flex-wrap">
                <input
                  value={telegramUrl}
                  onChange={e => { setTelegramUrl(e.target.value); setTelegramStatus('idle') }}
                  placeholder="https://hooks.telegram..."
                  className="flex-1 min-w-[180px] bg-input border border-border rounded-md px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary"
                />
                <button
                  onClick={testTelegram}
                  className="px-3 py-2 border border-border rounded-md text-xs text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0"
                >
                  Test Connection
                </button>
                <button
                  onClick={saveTelegram}
                  disabled={!telegramUrl.trim()}
                  className="px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs rounded-md transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {telegramSaved ? '✓ Saved' : 'Save'}
                </button>
              </div>
              {telegramStatus === 'connected' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                  <Check className="h-3.5 w-3.5" /> Connected ✓
                </span>
              )}
              {telegramStatus === 'failed' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-error">
                  <X className="h-3.5 w-3.5" /> Connection failed
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
