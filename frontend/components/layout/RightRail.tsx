'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Bell, Activity, ShieldCheck, Gauge, X, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAlertStore } from '@/store/alertStore'
import { useRecentActivity, type ActivityItem } from '@/hooks/useRecentActivity'
import { useRiskSummary, type RiskSummary } from '@/hooks/useRiskSummary'
import { fetchOnChainAuditEvents, MANTLE_AUDIT_LOOKBACK_BLOCKS } from '@/hooks/useOnChain'
import { useTranslation } from '@/hooks/useTranslation'

// ─────────────────────────────────────────────────────────────────
// Reusable rail components
// ─────────────────────────────────────────────────────────────────

function RailSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="px-4 py-3 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">
          {title}
        </h4>
        {action}
      </div>
      {children}
    </section>
  )
}

function PolicyEngineCard({ count24h, t }: { count24h: number; t: (s: string) => string }) {
  return (
    <div className="px-4 pt-4">
      <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 flex items-center gap-2.5">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-success">{t('Policy Engine Online')}</p>
          <p className="text-[11px] text-text-secondary leading-tight mt-0.5">
            {count24h === 0
              ? t('No events in the last 24h')
              : t(count24h === 1 ? '{n} event / 24h' : '{n} events / 24h').replace('{n}', count24h.toLocaleString())}
          </p>
        </div>
        <CheckCircle2 className="h-4 w-4 text-success" />
      </div>
    </div>
  )
}

const TIME_AGO_RE = /^(\d+)\s*(min ago|h ago|d ago)$/

function translateTimeAgo(value: string, t: (s: string) => string): string {
  if (value === 'just now') return t('just now')
  const match = value.match(TIME_AGO_RE)
  if (!match) return value
  const [, n, unit] = match
  const key = unit === 'min ago' ? '{n} min ago' : unit === 'h ago' ? '{n}h ago' : '{n}d ago'
  return t(key).replace('{n}', n)
}

function RecentActivityList({ items, t }: { items: ActivityItem[]; t: (s: string) => string }) {
  if (items.length === 0) {
    return <p className="text-[12px] text-text-secondary py-1">{t('No recent activity yet.')}</p>
  }
  return (
    <div className="space-y-2.5">
      {items.map((a) => (
        <div key={a.id} className="flex items-start gap-2.5">
          <Activity className="h-3.5 w-3.5 text-text-disabled shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-text-primary leading-snug">{t(a.label)}</p>
            <p className="text-[10px] text-text-disabled mt-0.5">{translateTimeAgo(a.time, t)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Modal shell
// ─────────────────────────────────────────────────────────────────

function ActionModal({
  title, icon: Icon, onClose, children,
}: {
  title: string
  icon: React.ElementType
  onClose: () => void
  children: ReactNode
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[min(360px,calc(100vw-1.5rem))] rounded-xl overflow-hidden shadow-modal
                   bg-card border border-border"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-[13px] font-semibold text-text-primary">{title}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────
// Run Audit modal — real on-chain scan via AgentExecutor events
// ─────────────────────────────────────────────────────────────────

function RunAuditModal({ onClose, t }: { onClose: () => void; t: (s: string) => string }) {
  const [running, setRunning] = useState(false)
  const [result, setResult]   = useState<number | null>(null)
  const [failed, setFailed]   = useState(false)

  const handleRun = async () => {
    setRunning(true)
    setFailed(false)
    try {
      const events = await fetchOnChainAuditEvents()
      setResult(events.length)
    } catch {
      setFailed(true)
    } finally {
      setRunning(false)
    }
  }

  const blocks = MANTLE_AUDIT_LOOKBACK_BLOCKS.toLocaleString()

  return (
    <ActionModal title={t('Run Audit')} icon={ShieldCheck} onClose={onClose}>
      <div className="p-4 space-y-3">
        {result !== null ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{t('Audit complete')}</p>
              <p className="text-xs text-text-secondary mt-1">
                {result === 0
                  ? t('No on-chain order executions found in the last {blocks} blocks on Mantle Sepolia.').replace('{blocks}', blocks)
                  : t(result === 1
                      ? 'Found {n} on-chain order execution in the last {blocks} blocks.'
                      : 'Found {n} on-chain order executions in the last {blocks} blocks.')
                      .replace('{n}', String(result))
                      .replace('{blocks}', blocks)}
              </p>
            </div>
            <div className="flex gap-2 pt-1 w-full">
              <Link
                href="/dashboard/audit"
                onClick={onClose}
                className="flex-1 text-center py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
              >
                {t('View Audit Log →')}
              </Link>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('Close')}
              </button>
            </div>
          </div>
        ) : failed ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm font-semibold text-error">{t('Audit failed')}</p>
            <p className="text-xs text-text-secondary">
              {t("Couldn't reach the Mantle Sepolia RPC. Please try again.")}
            </p>
            <button
              onClick={handleRun}
              className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              {t('Retry')}
            </button>
          </div>
        ) : running ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-xs text-text-secondary">{t('Scanning AgentExecutor events on Mantle Sepolia…')}</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-text-secondary">
              {t('Scans the AgentExecutor contract for on-chain order executions in the last {blocks} blocks on Mantle Sepolia.').replace('{blocks}', blocks)}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleRun}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> {t('Start Audit')}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('Cancel')}
              </button>
            </div>
          </>
        )}
      </div>
    </ActionModal>
  )
}

// ─────────────────────────────────────────────────────────────────
// Quick actions
// ─────────────────────────────────────────────────────────────────

type ModalKey = 'audit'

function QuickActionGrid({ onAction, t }: { onAction: (m: ModalKey) => void; t: (s: string) => string }) {
  return (
    <button
      onClick={() => onAction('audit')}
      className="w-full flex items-center gap-1.5 rounded-md border border-border bg-page hover:border-primary/40 hover:bg-primary/5 px-2.5 py-2 transition-colors text-left"
    >
      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-[11px] font-medium text-text-primary truncate">{t('Run Audit')}</span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────
// Risk summary
// ─────────────────────────────────────────────────────────────────

function RiskSummaryCard({ summary, t }: { summary: RiskSummary; t: (s: string) => string }) {
  if (!summary.hasData) {
    return (
      <div className="space-y-2">
        <p className="text-[12px] text-text-secondary leading-snug">
          {t('No active agents yet — risk metrics will appear once an agent is deployed.')}
        </p>
        <Link
          href="/dashboard/risk"
          className="block w-full text-center text-[11px] font-medium text-primary hover:text-primary-hover py-1.5 rounded-md border border-primary/30 hover:bg-primary/5 transition-colors"
        >
          {t('Open Risk Engine →')}
        </Link>
      </div>
    )
  }

  const { score, level } = summary
  const tone =
    score < 30 ? 'text-success'
    : score < 60 ? 'text-warning'
    : 'text-error'
  const dotTone =
    score < 30 ? 'bg-success'
    : score < 60 ? 'bg-warning'
    : 'bg-error'

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold leading-none', tone)}>{score}</span>
        <span className="text-text-secondary text-xs">/ 100</span>
        <span className={cn(
          'ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]',
          score < 30 && 'bg-success/15 text-success',
          score >= 30 && score < 60 && 'bg-warning/15 text-warning',
          score >= 60 && 'bg-error/15 text-error',
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', dotTone)} />
          {t(level)}
        </span>
      </div>
      <Link
        href="/dashboard/risk"
        className="block w-full text-center text-[11px] font-medium text-primary hover:text-primary-hover py-1.5 rounded-md border border-primary/30 hover:bg-primary/5 transition-colors"
      >
        {t('View report →')}
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Main RightRail
// ─────────────────────────────────────────────────────────────────

const EMPTY_RISK_SUMMARY: RiskSummary = { score: 0, level: 'Low Risk', hasData: false, drivers: [] }

export function RightRail() {
  const { unreadCount } = useAlertStore()
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null)
  const { data: activity } = useRecentActivity(4)
  const { data: riskSummary } = useRiskSummary()
  const t = useTranslation()

  return (
    <>
      <aside className="hidden xl:flex h-full w-[280px] flex-col border-l border-border bg-card shrink-0 overflow-y-auto scrollbar-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <h4 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-text-secondary" />
            {t('Real-Time Ops')}
          </h4>
          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold text-error bg-error/15 px-1.5 py-0.5 rounded-full">
              {t('{n} new').replace('{n}', String(unreadCount))}
            </span>
          )}
        </div>

        <PolicyEngineCard count24h={activity?.count24h ?? 0} t={t} />

        <RailSection title={t('Recent Activity')} action={
          <Link href="/dashboard/audit" className="text-[10px] text-text-link hover:text-text-link-hover">
            {t('View all')}
          </Link>
        }>
          <RecentActivityList items={activity?.items ?? []} t={t} />
        </RailSection>

        <RailSection title={t('Quick Actions')}>
          <QuickActionGrid onAction={setActiveModal} t={t} />
        </RailSection>

        <RailSection title={t('Risk Summary')} action={
          <Gauge className="h-3 w-3 text-text-disabled" />
        }>
          <RiskSummaryCard summary={riskSummary ?? EMPTY_RISK_SUMMARY} t={t} />
        </RailSection>
      </aside>

      {/* Modals */}
      {activeModal === 'audit' && <RunAuditModal onClose={() => setActiveModal(null)} t={t} />}
    </>
  )
}
