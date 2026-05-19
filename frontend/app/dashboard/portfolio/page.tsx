'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react'
import NextLink from 'next/link'
import {
  ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { cn } from '@/lib/utils'
import { TokenIcon } from '@/components/ui/TokenIcon'

// ── types ─────────────────────────────────────────────────────────────────────

interface PortfolioSnapshot {
  totalValue: number
  totalPnl: number
  totalRoi: number
  dayPnl: number
  dayPnlPct: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
}

interface PositionRow {
  id: string
  asset: string
  protocol: string
  direction: 'long' | 'short'
  size: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPct: number
  status: 'open' | 'closed'
}

interface PnlPoint { date: string; value: number }

// ── mock data ─────────────────────────────────────────────────────────────────

const MOCK_SNAPSHOT: PortfolioSnapshot = {
  totalValue:  52_847.22,
  totalPnl:    3_847.22,
  totalRoi:    7.84,
  dayPnl:      312.45,
  dayPnlPct:   0.60,
  maxDrawdown: 3.2,
  sharpeRatio: 1.87,
  winRate:     74.2,
}

const MOCK_POSITIONS: PositionRow[] = [
  { id: 'pos-1', asset: 'ETH',  protocol: 'merchant_moe', direction: 'long',  size: 12_400, entryPrice: 2847.32, currentPrice: 3041.50, pnl: 318.45,  pnlPct: 2.57,  status: 'open' },
  { id: 'pos-2', asset: 'USDC', protocol: 'agni',         direction: 'long',  size: 18_500, entryPrice: 1.0001,  currentPrice: 1.0003,  pnl: 42.30,   pnlPct: 0.23,  status: 'open' },
  { id: 'pos-3', asset: 'MNT',  protocol: 'fluxion',      direction: 'long',  size: 3_200,  entryPrice: 0.8234,  currentPrice: 0.8480,  pnl: 95.60,   pnlPct: 2.99,  status: 'open' },
  { id: 'pos-4', asset: 'WBTC', protocol: 'merchant_moe', direction: 'long',  size: 8_100,  entryPrice: 62_430,  currentPrice: 63_180,  pnl: 97.40,   pnlPct: 1.20,  status: 'open' },
  { id: 'pos-5', asset: 'ETH',  protocol: 'fluxion',      direction: 'short', size: 5_200,  entryPrice: 3089.00, currentPrice: 3041.50, pnl: 79.80,   pnlPct: 1.54,  status: 'open' },
  { id: 'pos-6', asset: 'USDT', protocol: 'agni',         direction: 'long',  size: 9_000,  entryPrice: 1.0000,  currentPrice: 0.9998,  pnl: -18.00,  pnlPct: -0.20, status: 'closed' },
  { id: 'pos-7', asset: 'ETH',  protocol: 'merchant_moe', direction: 'long',  size: 4_500,  entryPrice: 2690.14, currentPrice: 3041.50, pnl: 585.20,  pnlPct: 13.06, status: 'closed' },
]

function generatePnlHistory(): PnlPoint[] {
  const points: PnlPoint[] = []
  let val = 49_000
  for (let i = 29; i >= 0; i--) {
    const d = new Date(2026, 4, 6)
    d.setDate(d.getDate() - i)
    val += (Math.random() - 0.42) * 800
    val = Math.max(47_000, val)
    points.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(val * 100) / 100,
    })
  }
  points[points.length - 1].value = 52_847.22
  return points
}

const MOCK_PNL_HISTORY = generatePnlHistory()

// Protocol colors are brand-specific — kept as data to avoid arbitrary Tailwind
const PROTOCOL_LABELS: Record<string, string> = {
  merchant_moe: 'Merchant Moe',
  agni:         'Agni Finance',
  fluxion:      'Fluxion',
}

const PROTOCOL_COLORS: Record<string, string> = {
  merchant_moe: '#0066FF',
  agni:         '#22C55E',
  fluxion:      '#58A6FF',
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, valueClass,
}: {
  label: string
  value: string
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-1">
        {label}
      </p>
      <p className={cn('text-xl font-bold mb-0.5', valueClass ?? 'text-text-primary')}>{value}</p>
      {sub && <p className="text-[11px] text-text-secondary">{sub}</p>}
    </div>
  )
}

// ── CustomTooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-md px-3 py-2 shadow-modal">
      <p className="text-[11px] text-text-secondary mb-0.5">{label}</p>
      <p className="text-[13px] font-bold text-text-primary">
        ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [chartDays, setChartDays] = useState(30)

  const {
    data: snapshot, isLoading: loadingSnap, isError: snapError,
  } = useQuery<PortfolioSnapshot>({
    queryKey: ['portfolio', 'snapshot'],
    queryFn: () => fetch('/api/portfolio/snapshot').then(r => r.json()),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const {
    data: positions, isLoading: loadingPos, isError: posError,
  } = useQuery<PositionRow[]>({
    queryKey: ['portfolio', 'positions'],
    queryFn: () => fetch('/api/portfolio/positions').then(r => r.json()),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const isLoading = loadingSnap || loadingPos
  const hasError  = snapError || posError
  const snap      = snapshot ?? MOCK_SNAPSHOT
  const pos       = positions?.length ? positions : MOCK_POSITIONS

  const openPositions   = pos.filter(p => p.status === 'open')
  const closedPositions = pos.filter(p => p.status === 'closed')

  const allocationByProtocol = useMemo(() => {
    const totals: Record<string, number> = {}
    openPositions.forEach(p => { totals[p.protocol] = (totals[p.protocol] ?? 0) + p.size })
    const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0)
    return Object.entries(totals).map(([k, v]) => ({
      protocol: k, pct: Math.round((v / grandTotal) * 100),
    }))
  }, [openPositions])

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-lg bg-card border border-border animate-pulse" />
          ))}
        </div>
        <div className="h-[260px] rounded-lg bg-card border border-border animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">

      {/* Error banner */}
      {hasError && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 flex items-center gap-2">
          <span className="text-sm font-semibold text-error">API error</span>
          <span className="text-sm text-text-secondary">
            — portfolio data unavailable, showing last known values.
          </span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Portfolio</h2>
        <p className="text-sm text-text-secondary mt-1">
          Live view of all positions and performance across your agents
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Portfolio Value"
          value={`$${snap.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="Live estimate"
        />
        <StatCard
          label="Total P&L"
          value={`${snap.totalPnl >= 0 ? '+' : ''}$${Math.abs(snap.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub={`${snap.totalRoi >= 0 ? '+' : ''}${snap.totalRoi.toFixed(2)}% all time`}
          valueClass={snap.totalPnl >= 0 ? 'text-success' : 'text-error'}
        />
        <StatCard
          label="24h Change"
          value={`${snap.dayPnl >= 0 ? '+' : ''}$${Math.abs(snap.dayPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub={`${snap.dayPnlPct >= 0 ? '+' : ''}${snap.dayPnlPct.toFixed(2)}%`}
          valueClass={snap.dayPnl >= 0 ? 'text-success' : 'text-error'}
        />
        <StatCard
          label="Sharpe Ratio"
          value={snap.sharpeRatio.toFixed(2)}
          sub={`Win rate: ${snap.winRate.toFixed(1)}%`}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Max Drawdown"
          value={`${snap.maxDrawdown.toFixed(2)}%`}
          valueClass={snap.maxDrawdown < 5 ? 'text-success' : snap.maxDrawdown < 15 ? 'text-warning' : 'text-error'}
        />
        <StatCard label="Active Positions" value={String(openPositions.length)} />
        <StatCard label="Closed Positions" value={String(closedPositions.length)} />
        <StatCard label="Protocols Active" value="3" sub="Merchant Moe · Agni · Fluxion" />
      </div>

      {/* PnL Chart */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h4 className="text-sm font-semibold text-text-primary">Portfolio Value</h4>
          <div className="flex flex-wrap gap-1">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setChartDays(d)}
                className={cn(
                  'h-7 px-2.5 rounded text-[11px] border transition-colors',
                  chartDays === d
                    ? 'border-primary bg-primary/10 text-text-link'
                    : 'border-border bg-transparent text-text-secondary hover:text-text-primary hover:border-text-disabled',
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={MOCK_PNL_HISTORY.slice(-chartDays)}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#21262D" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#8B949E' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#8B949E' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#portfolioGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#22C55E' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Positions table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-card border-b border-border">
          <h4 className="text-sm font-semibold text-text-primary">Open Positions</h4>
          <span className="text-[11px] text-text-secondary">{openPositions.length} positions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 780 }}>
            <thead>
              <tr className="bg-page border-b border-border">
                {['Asset', 'Protocol', 'Side', 'Size', 'Entry', 'Current', 'P&L', 'P&L %', 'Status'].map(h => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {openPositions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <BarChart2 className="h-10 w-10 text-text-secondary opacity-40" />
                      <p className="text-sm font-semibold text-text-primary">No open positions</p>
                      <NextLink
                        href="/dashboard/agents/deploy"
                        className="text-xs text-text-link hover:text-text-link-hover transition-colors"
                      >
                        Deploy an agent →
                      </NextLink>
                    </div>
                  </td>
                </tr>
              ) : (
                openPositions.map(p => {
                  const positive = p.pnl >= 0
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border/60 last:border-b-0 hover:bg-surface transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TokenIcon symbol={p.asset} />
                          <span className="text-[13px] font-semibold text-text-primary">{p.asset}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Protocol dot — data-driven brand color stays inline */}
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ background: PROTOCOL_COLORS[p.protocol] ?? '#8B949E' }}
                          />
                          <span className="text-[11px] text-text-secondary whitespace-nowrap">
                            {PROTOCOL_LABELS[p.protocol] ?? p.protocol}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {p.direction === 'long'
                            ? <TrendingUp className="h-3 w-3 text-success" />
                            : <TrendingDown className="h-3 w-3 text-error" />
                          }
                          <span className={cn(
                            'text-[11px] font-bold uppercase',
                            p.direction === 'long' ? 'text-success' : 'text-error',
                          )}>
                            {p.direction}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-primary tabular-nums">
                        ${p.size.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary tabular-nums">
                        ${p.entryPrice.toLocaleString('en-US', { minimumFractionDigits: p.entryPrice < 10 ? 4 : 2 })}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-primary tabular-nums">
                        ${p.currentPrice.toLocaleString('en-US', { minimumFractionDigits: p.currentPrice < 10 ? 4 : 2 })}
                      </td>
                      <td className={cn(
                        'px-4 py-3 text-xs font-semibold tabular-nums',
                        positive ? 'text-success' : 'text-error',
                      )}>
                        {positive ? '+' : ''}${Math.abs(p.pnl).toFixed(2)}
                      </td>
                      <td className={cn(
                        'px-4 py-3 text-xs font-semibold tabular-nums',
                        positive ? 'text-success' : 'text-error',
                      )}>
                        {p.pnlPct >= 0 ? '+' : ''}{p.pnlPct.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-[10px] font-bold uppercase px-2 py-0.5 rounded',
                          p.status === 'open'
                            ? 'bg-success-bg text-success border border-success/20'
                            : 'bg-card text-text-secondary border border-border',
                        )}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row: allocation + risk */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">

        {/* Allocation by protocol */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Allocation by Protocol</h4>
          <div className="flex flex-col gap-3">
            {allocationByProtocol.map(({ protocol, pct }) => (
              <div key={protocol} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-28 shrink-0">
                  {PROTOCOL_LABELS[protocol] ?? protocol}
                </span>
                <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                  {/* Dynamic width + brand color — must be inline */}
                  <div
                    className="h-2 rounded-full transition-[width] duration-500"
                    style={{ width: `${pct}%`, background: PROTOCOL_COLORS[protocol] ?? '#8B949E' }}
                  />
                </div>
                <span className="text-xs font-semibold text-text-primary w-9 text-right shrink-0">
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk exposure */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h4 className="text-sm font-semibold text-text-primary mb-4">Risk Exposure</h4>
          <div className="flex flex-col divide-y divide-border">
            {[
              {
                label: 'Current Drawdown',
                value: `${snap.maxDrawdown.toFixed(2)}%`,
                valueClass: snap.maxDrawdown < 5 ? 'text-success' : 'text-warning',
              },
              {
                label: 'Sharpe Ratio',
                value: snap.sharpeRatio.toFixed(2),
                valueClass: 'text-text-primary',
              },
              {
                label: 'Win Rate',
                value: `${snap.winRate.toFixed(1)}%`,
                valueClass: snap.winRate > 60 ? 'text-success' : 'text-warning',
              },
              {
                label: 'Total ROI',
                value: `${snap.totalRoi >= 0 ? '+' : ''}${snap.totalRoi.toFixed(2)}%`,
                valueClass: snap.totalRoi >= 0 ? 'text-success' : 'text-error',
              },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-2.5">
                <span className="text-xs text-text-secondary">{r.label}</span>
                <span className={cn('text-sm font-semibold', r.valueClass)}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
