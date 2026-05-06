'use client'

import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Bot, BarChart3, Zap, Plus,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { usePortfolioStats, usePortfolioHistory } from '@/hooks/usePortfolio'
import { useRecentTrades } from '@/hooks/useTrades'
import { useAgents } from '@/hooks/useAgents'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/components/ui/Badge'
import { useState } from 'react'

// ── KPI Cards ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label:       string
  value:       string
  sub?:        string
  change?:     number
  changeText?: string
  isLoading?:  boolean
  extra?:      React.ReactNode
  valueCls?:   string
  bgCls?:      string
}

function KpiCard({ label, value, sub, change, changeText, isLoading, extra, valueCls, bgCls }: KpiCardProps) {
  if (isLoading) return <SkeletonCard />
  return (
    <div className={cn('rounded-lg border border-border p-5 bg-card', bgCls)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-2">
        {label}
      </p>
      <p className={cn('text-[28px] font-bold text-text-primary leading-tight', valueCls)}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-text-secondary mt-1">{sub}</p>
      )}
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium',
          change >= 0 ? 'text-success' : 'text-error',
        )}>
          {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {changeText ?? formatPercent(change)} (24h)
        </div>
      )}
      {extra}
    </div>
  )
}

// ── KPI: Active Agents with ratio bar ─────────────────────────────────────────

function ActiveAgentsCard({ isLoading }: { isLoading: boolean }) {
  const { data: agents } = useAgents()
  if (isLoading) return <SkeletonCard />

  const total   = agents?.length ?? 0
  const active  = agents?.filter((a) => a.status === 'active').length  ?? 0
  const paused  = agents?.filter((a) => a.status === 'paused').length  ?? 0
  const stopped = agents?.filter((a) => a.status === 'stopped' || a.status === 'inactive').length ?? 0

  const pct = (n: number) => total > 0 ? (n / total) * 100 : 0

  return (
    <div className="rounded-lg border border-border p-5 bg-card">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-2">
        Active Agents
      </p>
      <p className="text-[28px] font-bold text-text-primary leading-tight">{active}</p>
      <p className="text-xs text-text-secondary mt-1">of {total} total</p>
      {/* Ratio bar */}
      {total > 0 && (
        <div className="flex h-1.5 rounded-full overflow-hidden mt-3 gap-px bg-border">
          {active  > 0 && <div style={{ width: `${pct(active)}%`  }} className="bg-success rounded-full"  />}
          {paused  > 0 && <div style={{ width: `${pct(paused)}%`  }} className="bg-warning rounded-full"  />}
          {stopped > 0 && <div style={{ width: `${pct(stopped)}%` }} className="bg-text-disabled rounded-full" />}
        </div>
      )}
    </div>
  )
}

// ── KPI: Max Drawdown with color coding ───────────────────────────────────────

function MaxDrawdownCard({ drawdown, isLoading }: { drawdown?: number; isLoading: boolean }) {
  if (isLoading) return <SkeletonCard />

  const dd = drawdown ?? 0
  const abs = Math.abs(dd)
  const [valueCls, bgCls] = abs <= 5
    ? ['text-success', 'bg-success/5']
    : abs <= 15
      ? ['text-warning', 'bg-warning/5']
      : ['text-error',   'bg-error/5']

  return (
    <div className={cn('rounded-lg border border-border p-5', bgCls, 'bg-card')}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-2">
        Max Drawdown
      </p>
      <p className={cn('text-[28px] font-bold leading-tight', valueCls)}>
        {dd > 0 ? '+' : ''}{dd.toFixed(2)}%
      </p>
      <p className="text-xs text-text-secondary mt-1">
        {abs <= 5 ? 'Healthy' : abs <= 15 ? 'Warning' : 'Critical'}
      </p>
    </div>
  )
}

// ── Portfolio Chart ───────────────────────────────────────────────────────────

const TIME_TABS = ['1D', '1W', '1M', '3M', '1Y', 'All'] as const
type TimeTab = typeof TIME_TABS[number]
const TAB_DAYS: Record<TimeTab, number> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365, 'All': 365 }

function PortfolioChart() {
  const [tab, setTab] = useState<TimeTab>('1M')
  const { data, isLoading } = usePortfolioHistory(TAB_DAYS[tab])

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
        <div className="flex items-center gap-0.5">
          {TIME_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-2 py-0.5 text-xs font-medium transition-colors rounded',
                tab === t
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-52 w-full" />
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-2">
            <BarChart3 className="h-10 w-10 text-text-secondary opacity-40" />
            <p className="text-sm text-text-secondary">No portfolio data yet</p>
            <p className="text-xs text-text-secondary opacity-70">Deploy an agent to start tracking</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={208}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0066FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8B949E', fontSize: 11 }}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8B949E', fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip
                contentStyle={{ background: '#161B22', border: '1px solid #21262D', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#8B949E' }}
                itemStyle={{ color: '#F0F6FC' }}
                formatter={(value) => [formatCurrency(Number(value)), 'Portfolio']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0066FF"
                strokeWidth={2}
                fill="url(#portfolioGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#0066FF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Recent Trades ─────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  success: 'success',
  failed:  'error',
  pending: 'warning',
}

function RecentTrades() {
  const { data, isLoading } = useRecentTrades(6)
  const trades = data?.data ?? []

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <Link href="/dashboard/trades" className="text-[13px] text-text-link hover:text-text-link-hover transition-colors">
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Zap className="h-8 w-8 text-text-secondary opacity-40" />
            <p className="text-sm text-text-secondary">No trades yet</p>
            <p className="text-xs text-text-secondary opacity-70">Deploy an agent to start trading</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-secondary">Asset</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-secondary">Mandate</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-text-secondary">Amount</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-text-secondary">P&amp;L</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-secondary">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-text-secondary">Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-surface transition-colors h-[52px]">
                    <td className="px-4 py-2">
                      <div>
                        <span className="font-medium text-text-primary">{t.assetPair}</span>
                        <span className={cn('ml-2 text-xs font-medium', t.direction === 'buy' ? 'text-success' : 'text-error')}>
                          {t.direction.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-text-secondary text-sm">
                      {t.mandateName ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-text-primary">{formatCurrency(t.amountUsd)}</td>
                    <td className={cn('px-4 py-2 text-right font-medium',
                      t.pnl == null ? 'text-text-secondary' :
                      t.pnl >= 0   ? 'text-success' : 'text-error'
                    )}>
                      {t.pnl != null ? formatCurrency(t.pnl) : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-text-secondary text-xs">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyDashboard() {
  return (
    <div className="rounded-lg border border-border bg-card p-16 flex flex-col items-center justify-center gap-4 text-center">
      <Bot className="h-12 w-12 text-primary" />
      <div>
        <p className="text-text-primary font-semibold text-lg">Your dashboard is waiting for your first trade</p>
        <p className="text-text-secondary text-sm mt-1">Deploy an AI agent to see live portfolio data here.</p>
      </div>
      <Link
        href="/dashboard/mandates/new"
        className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-hover transition-colors mt-2"
      >
        <Zap className="h-4 w-4" />
        Create My First Mandate
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = usePortfolioStats()
  const hasData = !statsLoading && (stats?.totalTrades ?? 0) > 0

  return (
    <div className="p-6 space-y-5">
      {/* Alert banner is rendered globally in layout.tsx */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Real-time overview of your trading agents</p>
        </div>
        <Link
          href="/dashboard/mandates/new"
          className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Mandate
        </Link>
      </div>

      {/* KPI Cards or Empty State */}
      {!hasData && !statsLoading ? (
        <EmptyDashboard />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Portfolio Value */}
            <KpiCard
              label="Portfolio Value"
              value={stats ? formatCurrency(stats.totalValue) : '—'}
              change={stats?.totalPnlPct}
              changeText={stats ? `+${formatCurrency(stats.totalPnl24h)} (${stats.totalPnlPct.toFixed(2)}%) today` : undefined}
              isLoading={statsLoading}
            />

            {/* Card 2: Total P&L */}
            <KpiCard
              label="Total P&L"
              value={stats ? formatCurrency(stats.totalPnl24h) : '—'}
              valueCls={stats ? (stats.totalPnl24h >= 0 ? 'text-success' : 'text-error') : undefined}
              changeText={stats ? `${stats.totalPnlPct >= 0 ? '+' : ''}${stats.totalPnlPct.toFixed(1)}% all time` : undefined}
              isLoading={statsLoading}
            />

            {/* Card 3: Active Agents — with ratio bar */}
            <ActiveAgentsCard isLoading={statsLoading} />

            {/* Card 4: Total Trades */}
            <KpiCard
              label="Total Trades"
              value={stats ? stats.totalTrades.toLocaleString() : '—'}
              sub="+152 today"
              isLoading={statsLoading}
            />

            {/* Card 5: Max Drawdown */}
            <MaxDrawdownCard drawdown={-(stats?.winRate ? (100 - stats.winRate) * 0.1 : 1.38)} isLoading={statsLoading} />
          </div>

          {/* 60/40 split: Chart | Trades */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <PortfolioChart />
            </div>
            <div className="lg:col-span-2">
              <RecentTrades />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
