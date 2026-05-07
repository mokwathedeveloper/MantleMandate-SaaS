'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Bell, Activity, UserPlus, ShieldCheck, KeyRound,
  Zap, Globe, Gauge,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAlertStore } from '@/store/alertStore'
import { RECENT_ACTIVITY, USER_LOCATIONS } from '@/mocks/users'
import { DASHBOARD_RISK_SUMMARY } from '@/mocks/dashboard'

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

function PolicyEngineCard() {
  return (
    <div className="px-4 pt-4">
      <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 flex items-center gap-2.5">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-success">Policy Engine Online</p>
          <p className="text-[11px] text-text-secondary leading-tight mt-0.5">
            All checks passing · 4,812 events / 24h
          </p>
        </div>
        <CheckCircle2 className="h-4 w-4 text-success" />
      </div>
    </div>
  )
}

function RecentActivityList() {
  return (
    <div className="space-y-2.5">
      {RECENT_ACTIVITY.slice(0, 4).map((a) => (
        <div key={a.id} className="flex items-start gap-2.5">
          <Activity className="h-3.5 w-3.5 text-text-disabled shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-text-primary leading-snug">
              <span className="font-semibold">{a.actor}</span>{' '}
              <span className="text-text-secondary">{a.action}</span>
            </p>
            <p className="text-[10px] text-text-disabled mt-0.5">{a.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const QUICK_ACTIONS = [
  { label: 'Invite User',    Icon: UserPlus,    href: '/dashboard/users'    },
  { label: 'Run Audit',      Icon: ShieldCheck, href: '/dashboard/audit'    },
  { label: 'Generate Token', Icon: KeyRound,    href: '/dashboard/api'      },
  { label: 'Generate Trade', Icon: Zap,         href: '/dashboard/trades'   },
]

function QuickActionGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {QUICK_ACTIONS.map(({ label, Icon, href }) => (
        <Link
          key={label}
          href={href}
          className="flex items-center gap-1.5 rounded-md border border-border bg-page hover:border-primary/40 hover:bg-primary/5 px-2.5 py-2 transition-colors"
        >
          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-[11px] font-medium text-text-primary truncate">{label}</span>
        </Link>
      ))}
    </div>
  )
}

function UserLocationsList() {
  const total = Math.max(...USER_LOCATIONS.map((l) => l.users))
  return (
    <div className="space-y-2.5">
      {USER_LOCATIONS.slice(0, 4).map((loc) => (
        <div key={loc.region}>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-text-primary font-medium flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-text-disabled" />
              {loc.region}
            </span>
            <span className="text-text-secondary">{loc.pct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-page overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${(loc.users / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function RiskSummaryCard() {
  const { score, scale, level } = DASHBOARD_RISK_SUMMARY
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
        <span className="text-text-secondary text-xs">/ {scale}</span>
        <span className={cn(
          'ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]',
          score < 30 && 'bg-success/15 text-success',
          score >= 30 && score < 60 && 'bg-warning/15 text-warning',
          score >= 60 && 'bg-error/15 text-error',
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', dotTone)} />
          {level}
        </span>
      </div>
      <Link
        href="/dashboard/risk"
        className="block w-full text-center text-[11px] font-medium text-primary hover:text-primary-hover py-1.5 rounded-md border border-primary/30 hover:bg-primary/5 transition-colors"
      >
        View report →
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Main RightRail
// ─────────────────────────────────────────────────────────────────

export function RightRail() {
  const { unreadCount } = useAlertStore()

  return (
    <aside className="hidden xl:flex h-full w-[280px] flex-col border-l border-border bg-card shrink-0 overflow-y-auto scrollbar-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
        <h4 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-text-secondary" />
          Real-Time Ops
        </h4>
        {unreadCount > 0 && (
          <span className="text-[10px] font-semibold text-error bg-error/15 px-1.5 py-0.5 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      <PolicyEngineCard />

      <RailSection title="Recent Activity" action={
        <Link href="/dashboard/audit" className="text-[10px] text-text-link hover:text-text-link-hover">
          View all
        </Link>
      }>
        <RecentActivityList />
      </RailSection>

      <RailSection title="Quick Actions">
        <QuickActionGrid />
      </RailSection>

      <RailSection title="User Locations">
        <UserLocationsList />
      </RailSection>

      <RailSection title="Risk Summary" action={
        <Gauge className="h-3 w-3 text-text-disabled" />
      }>
        <RiskSummaryCard />
      </RailSection>
    </aside>
  )
}
