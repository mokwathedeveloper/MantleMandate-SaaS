'use client'

import Link from 'next/link'
import { useState } from 'react'
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

import {
  DASHBOARD_KPIS, DASHBOARD_PNL_30D, DASHBOARD_RECENT_TRADES,
} from '@/mocks/dashboard'
import { MOCK_AGENTS } from '@/mocks/agents'
import { formatCurrency, cn } from '@/lib/utils'

const TIME_TABS = ['7D', '30D', '90D', 'YTD', 'All'] as const
type TimeTab = typeof TIME_TABS[number]

function formatLargeUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export default function DashboardPage() {
  const [tab, setTab] = useState<TimeTab>('30D')

  const k = DASHBOARD_KPIS
  const trades = DASHBOARD_RECENT_TRADES
  const activeAgents = MOCK_AGENTS.filter((a) => a.status === 'active')

  return (
    <div className="px-6 pt-8 pb-10 space-y-6">
      <PageHeader
        breadcrumb="OPERATIONS"
        title="Dashboard"
        subtitle="Real-time overview of mandates, agents, executions, and policy posture across your Mantle deployment."
        actions={
          <>
            <PrimaryButton variant="secondary" icon={<BarChart2 className="h-4 w-4" />}>
              View Reports
            </PrimaryButton>
            <Link href="/dashboard/mandates/new">
              <PrimaryButton variant="primary" icon={<Plus className="h-4 w-4" />}>
                New Mandate
              </PrimaryButton>
            </Link>
          </>
        }
      />

      {/* Live market prices */}
      <MarketTicker />

      <InlineAlert
        tone="success"
        title="All systems operational — Policy Engine, Risk Engine, and 4 protocols are online."
        description="12 active agents executed 412 trades in the last 24h with 99.8% uptime."
        action={
          <button className="text-xs font-semibold text-success hover:underline">
            View status →
          </button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Portfolio Value"
          value={formatLargeUsd(k.portfolioValue.value)}
          delta={k.portfolioValue.deltaText}
          deltaTone="positive"
        />
        <MetricCard
          label="P&L (24h)"
          value={`+${formatLargeUsd(k.pnl24h.value)}`}
          delta={k.pnl24h.deltaText}
          deltaTone="positive"
        />
        <MetricCard
          label="Active Agents"
          value={k.activeAgents.value.toString()}
          delta={k.activeAgents.deltaText}
          deltaTone="neutral"
        />
        <MetricCard
          label="Total Trades"
          value={k.totalTrades.value.toLocaleString()}
          delta={k.totalTrades.deltaText}
          deltaTone="positive"
        />
        <MetricCard
          label="Max Drawdown"
          value={`${k.drawdown.value.toFixed(2)}%`}
          delta={k.drawdown.deltaText}
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
            <div className="flex items-center gap-1 rounded-md border border-border bg-page p-0.5">
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
            <AreaChart data={DASHBOARD_PNL_30D} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
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
          subtitle={`${activeAgents.length} running · ${MOCK_AGENTS.length - activeAgents.length} paused/stopped`}
          action={
            <Link href="/dashboard/agents" className="text-[12px] text-text-link hover:text-text-link-hover">
              Manage →
            </Link>
          }
          padding="none"
        >
          <div className="divide-y divide-border">
            {activeAgents.slice(0, 5).map((a) => {
              const positive = a.pnlPct >= 0
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
                          {a.protocol} · {a.strategy}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        'text-[12px] font-semibold tabular-nums',
                        positive ? 'text-success' : 'text-error',
                      )}>
                        {positive ? '+' : ''}{a.pnlPct.toFixed(2)}%
                      </p>
                      <p className="text-[10px] text-text-disabled">{a.lastTradeAt}</p>
                    </div>
                  </div>
                </div>
              )
            })}
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
                      <span className="inline-flex items-center gap-1 font-mono text-[12px] text-text-link hover:text-text-link-hover cursor-pointer">
                        {t.txHash}
                        <ExternalLink className="h-3 w-3" />
                      </span>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
