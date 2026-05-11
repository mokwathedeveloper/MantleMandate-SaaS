'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react'
import NextLink from 'next/link'
import {
  ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

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

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: 8, padding: '14px 16px' }}>
      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B949E', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: color ?? '#F0F6FC', margin: '0 0 2px' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#8B949E', margin: 0 }}>{sub}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ fontSize: 11, color: '#8B949E', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#F0F6FC', margin: 0 }}>
        ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [chartDays, setChartDays] = useState(30)
  const { data: snapshot, isLoading: loadingSnap } = useQuery<PortfolioSnapshot>({
    queryKey: ['portfolio', 'snapshot'],
    queryFn: () => fetch('/api/portfolio/snapshot').then(r => r.json()),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const { data: positions, isLoading: loadingPos } = useQuery<PositionRow[]>({
    queryKey: ['portfolio', 'positions'],
    queryFn: () => fetch('/api/portfolio/positions').then(r => r.json()),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const isLoading = loadingSnap || loadingPos
  const snap      = snapshot ?? MOCK_SNAPSHOT
  const pos       = positions?.length ? positions : MOCK_POSITIONS

  const openPositions   = pos.filter(p => p.status === 'open')
  const closedPositions = pos.filter(p => p.status === 'closed')

  const allocationByProtocol = useMemo(() => {
    const totals: Record<string, number> = {}
    openPositions.forEach(p => { totals[p.protocol] = (totals[p.protocol] ?? 0) + p.size })
    const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0)
    return Object.entries(totals).map(([k, v]) => ({ protocol: k, pct: Math.round((v / grandTotal) * 100) }))
  }, [openPositions])

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ height: 72, borderRadius: 8, background: '#161B22', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
        <div style={{ height: 260, borderRadius: 8, background: '#161B22', animation: 'pulse 1.5s infinite' }} />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F0F6FC', margin: 0 }}>Portfolio</h2>
          <p style={{ fontSize: 13, color: '#8B949E', margin: '4px 0 0' }}>
            Live view of all positions and performance across your agents
          </p>
        </div>
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
          color={snap.totalPnl >= 0 ? '#22C55E' : '#EF4444'}
        />
        <StatCard
          label="24h Change"
          value={`${snap.dayPnl >= 0 ? '+' : ''}$${Math.abs(snap.dayPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub={`${snap.dayPnlPct >= 0 ? '+' : ''}${snap.dayPnlPct.toFixed(2)}%`}
          color={snap.dayPnl >= 0 ? '#22C55E' : '#EF4444'}
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
          color={snap.maxDrawdown < 5 ? '#22C55E' : snap.maxDrawdown < 15 ? '#F5C542' : '#EF4444'}
        />
        <StatCard label="Active Positions"  value={String(openPositions.length)} />
        <StatCard label="Closed Positions"  value={String(closedPositions.length)} />
        <StatCard label="Protocols Active"  value="3" sub="Merchant Moe · Agni · Fluxion" />
      </div>

      {/* PnL Chart */}
      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: 8, padding: 20 }}>
        <div className="flex flex-wrap items-center justify-between gap-2" style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#F0F6FC', margin: 0 }}>Portfolio Value</h4>
          <div className="flex flex-wrap gap-1">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setChartDays(d)}
                style={{
                  height: 26, padding: '0 10px', borderRadius: 4, fontSize: 11,
                  border: `1px solid ${chartDays === d ? '#0066FF' : '#30363D'}`,
                  background: chartDays === d ? '#0066FF1A' : 'transparent',
                  color: chartDays === d ? '#58A6FF' : '#8B949E',
                  cursor: 'pointer',
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={MOCK_PNL_HISTORY.slice(-chartDays)} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#21262D" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B949E' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              tick={{ fontSize: 10, fill: '#8B949E' }} tickLine={false} axisLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone" dataKey="value"
              stroke="#22C55E" strokeWidth={2}
              fill="url(#portfolioGrad)"
              dot={false} activeDot={{ r: 4, fill: '#22C55E' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Positions table */}
      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #21262D' }}>
      <div style={{ minWidth: 780 }}>
        <div className="flex flex-wrap items-center justify-between gap-2" style={{ padding: '14px 16px', background: '#161B22', borderBottom: '1px solid #21262D' }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#F0F6FC', margin: 0 }}>Open Positions</h4>
          <span style={{ fontSize: 11, color: '#8B949E' }}>{openPositions.length} positions</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 120px 80px 100px 100px 100px 90px 90px 80px',
          padding: '8px 16px',
          background: '#0D1117',
          borderBottom: '1px solid #21262D',
        }}>
          {['ASSET', 'PROTOCOL', 'SIDE', 'SIZE', 'ENTRY', 'CURRENT', 'P&L', 'P&L %', 'STATUS'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#8B949E' }}>{h}</span>
          ))}
        </div>

        {openPositions.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 16px', gap: 12 }}>
            <BarChart2 style={{ width: 40, height: 40, color: '#8B949E', opacity: 0.4 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#F0F6FC', margin: 0 }}>No open positions</p>
            <NextLink
              href="/dashboard/agents/deploy"
              style={{ fontSize: 12, color: '#58A6FF', textDecoration: 'none' }}
            >
              Deploy an agent →
            </NextLink>
          </div>
        ) : (
          openPositions.map((pos, i) => {
            const pnlColor = pos.pnl >= 0 ? '#22C55E' : '#EF4444'
            return (
              <div
                key={pos.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 120px 80px 100px 100px 100px 90px 90px 80px',
                  padding: '0 16px',
                  minHeight: 52,
                  alignItems: 'center',
                  background: i % 2 === 0 ? '#0D1117' : '#161B22',
                  borderBottom: i < openPositions.length - 1 ? '1px solid #21262D' : 'none',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F0F6FC' }}>{pos.asset}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                    background: PROTOCOL_COLORS[pos.protocol] ?? '#8B949E', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, color: '#8B949E' }}>{PROTOCOL_LABELS[pos.protocol] ?? pos.protocol}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {pos.direction === 'long'
                    ? <TrendingUp style={{ width: 12, height: 12, color: '#22C55E' }} />
                    : <TrendingDown style={{ width: 12, height: 12, color: '#EF4444' }} />
                  }
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: pos.direction === 'long' ? '#22C55E' : '#EF4444' }}>
                    {pos.direction}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#F0F6FC' }}>
                  ${pos.size.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
                <span style={{ fontSize: 12, color: '#8B949E' }}>
                  ${pos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: pos.entryPrice < 10 ? 4 : 2 })}
                </span>
                <span style={{ fontSize: 12, color: '#F0F6FC' }}>
                  ${pos.currentPrice.toLocaleString('en-US', { minimumFractionDigits: pos.currentPrice < 10 ? 4 : 2 })}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: pnlColor }}>
                  {pos.pnl >= 0 ? '+' : ''}${Math.abs(pos.pnl).toFixed(2)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: pnlColor }}>
                  {pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: 4,
                  background: pos.status === 'open' ? '#0D2818' : '#161B22',
                  color: pos.status === 'open' ? '#22C55E' : '#8B949E',
                }}>
                  {pos.status}
                </span>
              </div>
            )
          })
        )}
      </div>{/* /minWidth */}
      </div>{/* /overflow-x-auto */}

      {/* Bottom row: allocation + risk */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        {/* Allocation by protocol */}
        <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: 8, padding: '16px 20px' }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#F0F6FC', margin: '0 0 14px' }}>Allocation by Protocol</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allocationByProtocol.map(({ protocol, pct }) => (
              <div key={protocol} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#8B949E', minWidth: 80, flexShrink: 0 }}>
                  {PROTOCOL_LABELS[protocol] ?? protocol}
                </span>
                <div style={{ flex: 1, height: 8, background: '#21262D', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: 8, borderRadius: 999, background: PROTOCOL_COLORS[protocol] ?? '#8B949E', width: `${pct}%`, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#F0F6FC', width: 36, textAlign: 'right' }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk exposure */}
        <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: 8, padding: '16px 20px' }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#F0F6FC', margin: '0 0 14px' }}>Risk Exposure</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Current Drawdown', value: `${snap.maxDrawdown.toFixed(2)}%`, color: snap.maxDrawdown < 5 ? '#22C55E' : '#F5C542' },
              { label: 'Sharpe Ratio',     value: snap.sharpeRatio.toFixed(2), color: '#F0F6FC' },
              { label: 'Win Rate',         value: `${snap.winRate.toFixed(1)}%`, color: snap.winRate > 60 ? '#22C55E' : '#F5C542' },
              { label: 'Total ROI',        value: `${snap.totalRoi >= 0 ? '+' : ''}${snap.totalRoi.toFixed(2)}%`, color: snap.totalRoi >= 0 ? '#22C55E' : '#EF4444' },
            ].map((r, i, arr) => (
              <div
                key={r.label}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #21262D' : 'none',
                }}
              >
                <span style={{ fontSize: 12, color: '#8B949E' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
