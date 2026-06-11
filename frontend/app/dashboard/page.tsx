'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Plus, ExternalLink, Wallet as WalletIcon, Bot, Zap, BarChart2,
  ShieldCheck,
} from 'lucide-react'

import { PageHeader } from '@/components/ui/PageHeader'
import { MetricCard } from '@/components/ui/MetricCard'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { MarketTicker } from '@/components/ui/MarketTicker'
import { GettingStartedBanner } from '@/components/dashboard/GettingStartedBanner'

import { usePortfolioStats, usePortfolioHistory } from '@/hooks/usePortfolio'
import { useAgents } from '@/hooks/useAgents'
import { useRecentTrades } from '@/hooks/useTrades'
import type { Trade } from '@/types/trade'

import { DASHBOARD_RECENT_TRADES, type DashboardTrade } from '@/mocks/dashboard'
import { formatCurrency, formatPercent, truncateAddress, explorerTxUrl, cn } from '@/lib/utils'

const TIME_TABS = ['7D', '30D', '90D', 'YTD', 'All'] as const
type TimeTab = typeof TIME_TABS[number]

function tabToDays(tab: TimeTab): number {
  switch (tab) {
    case '7D':  return 7
    case '90D': return 90
    case 'YTD': {
      const now  = new Date()
      const jan1 = new Date(now.getFullYear(), 0, 1)
      return Math.max(1, Math.ceil((now.getTime() - jan1.getTime()) / 86_400_000))
    }
    case 'All': return 365
    case '30D':
    default:    return 30
  }
}

function formatLargeUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
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

interface DisplayTrade {
  id:            string
  pair:          string
  side:          'BUY' | 'SELL'
  amountUsd:     number
  pnl:           number | null
  protocol:      string
  status:        'success' | 'pending' | 'failed'
  txHashDisplay: string
  txHashHref:    string
}

function tradeToDisplay(t: Trade): DisplayTrade {
  return {
    id:            t.id,
    pair:          t.assetPair,
    side:          t.direction === 'sell' ? 'SELL' : 'BUY',
    amountUsd:     t.amountUsd,
    pnl:           t.pnl,
    protocol:      t.protocol,
    status:        t.status,
    txHashDisplay: t.txHash ? truncateAddress(t.txHash, 6) : '—',
    txHashHref:    t.txHash ? explorerTxUrl(t.txHash) : '/dashboard/audit',
  }
}

function mockToDisplay(t: DashboardTrade): DisplayTrade {
  return {
    id:            t.id,
    pair:          t.pair,
    side:          t.side,
    amountUsd:     t.amountUsd,
    pnl:           t.pnl,
    protocol:      t.protocol,
    status:        t.status,
    txHashDisplay: t.txHash,
    txHashHref:    t.txHash.includes('...') ? '/dashboard/audit' : explorerTxUrl(t.txHash),
  }
}

export default function DashboardPage() {
  const [tab, setTab] = useState<TimeTab>('30D')

  const { data: stats }     = usePortfolioStats()
  const { data: history }   = usePortfolioHistory(tabToDays(tab))
  const { data: agents = [] } = useAgents()
  const { data: tradesResp } = useRecentTrades(6)

  const k = stats ?? { totalValue: 0, totalPnl24h: 0, totalPnlPct: 0, activeAgents: 0, totalTrades: 0, winRate: 0 }
  const chartData = history ?? []
  const activeAgents = useMemo(() => agents.filter((a) => a.status === 'active'), [agents])
  const maxDrawdown = useMemo(
    () => agents.length ? Math.max(...agents.map((a) => a.drawdownCurrent)) : 0,
    [agents],
  )

  const trades = useMemo(() => {
    const real = tradesResp?.data ?? []
    return real.length > 0 ? real.map(tradeToDisplay) : DASHBOARD_RECENT_TRADES.map(mockToDisplay)
  }, [tradesResp])

  return (
    <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-10 space-y-6">
      <PageHeader
        breadcrumb="OPERATIONS"
        title="Dashboard"
        subtitle="Real-time overview of mandates, agents, executions, and policy posture across your Mantle deployment."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/reports">
              <PrimaryButton variant="secondary" icon={<BarChart2 className="h-4 w-4" />}>
                View Reports
              </PrimaryButton>
            </Link>
            <Link href="/dashboard/mandates/new">
              <PrimaryButton variant="primary" icon={<Plus className="h-4 w-4" />}>
                New Mandate
              </PrimaryButton>
            </Link>
          </div>
        }
      />

      {/* Onboarding checklist — visible until user dismisses */}
      <GettingStartedBanner />

      {/* Live market prices */}
      <MarketTicker />

      <InlineAlert
        tone="success"
        title="All systems operational — Policy Engine, Risk Engine, and 4 protocols are online."
        description={`${k.activeAgents} active agent${k.activeAgents === 1 ? '' : 's'} · ${trades.filter(t => t.status === 'success').length} successful trades shown · on-chain via Mantle Network`}
        action={
          <Link href="/dashboard/agents" className="text-xs font-semibold text-success hover:underline">
            View status →
          </Link>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          label="Portfolio Value"
          value={formatCurrency(k.totalValue)}
          delta={`${agents.length} agent${agents.length === 1 ? '' : 's'} deployed`}
          deltaTone="neutral"
        />
        <MetricCard
          label="P&L (24h)"
          value={formatCurrency(k.totalPnl24h)}
          delta={formatPercent(k.totalPnlPct)}
          deltaTone={k.totalPnlPct >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          label="Active Agents"
          value={k.activeAgents.toString()}
          delta={`of ${agents.length} agent${agents.length === 1 ? '' : 's'}`}
          deltaTone="neutral"
        />
        <MetricCard
          label="Total Trades"
          value={k.totalTrades.toLocaleString()}
          delta={`${k.winRate.toFixed(0)}% win rate`}
          deltaTone={k.winRate >= 50 ? 'positive' : 'neutral'}
        />
        <MetricCard
          label="Max Drawdown"
          value={`-${maxDrawdown.toFixed(2)}%`}
          delta="within healthy range"
          deltaTone="positive"
        />
      </div>

      {/* Chart + Active Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          className="lg:col-span-2"
          title="Portfolio Value"
          subtitle={`${tab} performance — net of fees and gas`}
          action={
            <div className="flex flex-wrap items-center gap-0.5 rounded-md border border-border bg-page p-0.5">
              {TIME_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-semibold rounded transition-colors',
                    tab === t
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          }
          bodyClassName="px-2 py-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#0066FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
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
                tickFormatter={(v) => formatLargeUsd(Number(v))}
                width={56}
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
                fill="url(#pnlGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#0066FF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Active Agents"
          subtitle={`${activeAgents.length} running · ${agents.length - activeAgents.length} paused/stopped`}
          action={
            <Link href="/dashboard/agents" className="text-[12px] text-text-link hover:text-text-link-hover">
              Manage →
            </Link>
          }
          padding="none"
        >
          <div className="divide-y divide-border">
            {activeAgents.slice(0, 5).map((a) => {
              const positive = a.totalRoi >= 0
              return (
                <div key={a.id} className="px-4 py-3 hover:bg-surface transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-text-primary truncate">{a.name}</p>
                        <p className="text-[11px] text-text-secondary truncate">
                          {a.mandateName || 'No mandate'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        'text-[12px] font-semibold tabular-nums',
                        positive ? 'text-success' : 'text-error',
                      )}>
                        {positive ? '+' : ''}{a.totalRoi.toFixed(2)}%
                      </p>
                      <p className="text-[10px] text-text-disabled">{a.lastTradeAt ? timeAgo(a.lastTradeAt) : 'no trades yet'}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            {activeAgents.length === 0 && (
              <div className="px-4 py-6 text-center text-[12px] text-text-secondary">
                No active agents yet.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Recent trades + Risk posture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          className="lg:col-span-2"
          title="Recent Trades"
          subtitle="Last 6 executions across all active agents"
          action={
            <Link href="/dashboard/trades" className="text-[12px] text-text-link hover:text-text-link-hover">
              View all →
            </Link>
          }
          padding="none"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-page border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Pair</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Side</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">P&amp;L</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Protocol</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">TX</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-b-0 hover:bg-surface transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium">{t.pair}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide',
                        t.side === 'BUY' ? 'text-success' : 'text-error',
                      )}>
                        {t.side}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary font-medium tabular-nums">
                      {formatCurrency(t.amountUsd)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {t.pnl == null ? (
                        <span className="text-text-disabled">—</span>
                      ) : (
                        <span className={cn('font-medium', t.pnl >= 0 ? 'text-success' : 'text-error')}>
                          {t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{t.protocol}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status === 'success' ? 'success' : t.status === 'pending' ? 'pending' : 'failed'} />
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={t.txHashHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[12px] text-text-link hover:text-text-link-hover transition-colors"
                      >
                        {t.txHashDisplay}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Risk Posture"
          subtitle="Current exposure across mandates"
          action={<ShieldCheck className="h-4 w-4 text-success" />}
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-success leading-none tabular-nums">23</span>
                <span className="text-text-secondary text-xs">/ 100</span>
                <StatusBadge status="active" label="Low Risk" className="ml-auto" />
              </div>
              <div className="h-2 rounded-full bg-page overflow-hidden">
                <div className="h-full bg-success" style={{ width: '23%' }} />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              {[
                { label: 'Concentration risk',    value: 'Low',     tone: 'text-success' },
                { label: 'Liquidity depth',       value: 'Healthy', tone: 'text-success' },
                { label: 'Volatility (30d)',      value: 'Normal',  tone: 'text-text-primary' },
                { label: 'Counterparty exposure', value: 'Low',     tone: 'text-success' },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between text-[12px]">
                  <span className="text-text-secondary">{r.label}</span>
                  <span className={cn('font-semibold', r.tone)}>{r.value}</span>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/risk"
              className="block w-full text-center text-[12px] font-semibold text-primary hover:text-primary-hover py-2 rounded-md border border-primary/30 hover:bg-primary/5 transition-colors"
            >
              Open Risk Engine →
            </Link>
          </div>
        </SectionCard>
      </div>

      {/* Quick actions row */}
      <SectionCard title="Quick Actions" subtitle="Common operational shortcuts">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: 'Create Mandate',  Icon: Plus,         href: '/dashboard/mandates/new', desc: 'Plain-English strategy → on-chain policy' },
            { label: 'Deploy Agent',    Icon: Bot,          href: '/dashboard/agents',       desc: 'Spin up a new AI execution agent' },
            { label: 'Execute Trade',   Icon: Zap,          href: '/dashboard/trades',       desc: 'Manual override execution' },
            { label: 'Connect Wallet',  Icon: WalletIcon,   href: '/dashboard/wallets',      desc: 'Add a multisig or EOA' },
          ].map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="flex flex-col gap-1 rounded-md border border-border bg-page p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <q.Icon className="h-4 w-4 text-primary" />
              <p className="text-[13px] font-semibold text-text-primary">{q.label}</p>
              <p className="text-[11px] text-text-secondary leading-snug">{q.desc}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
