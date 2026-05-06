'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react'
import NextLink from 'next/link'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

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

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">{label}</p>
      <p className={cn('text-xl font-bold', color ?? 'text-text-primary')}>{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-0.5">{sub}</p>}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4 h-20 animate-pulse" />
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg h-64 animate-pulse" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <BarChart2 className="h-12 w-12 text-text-disabled mb-4" />
      <p className="text-text-primary font-semibold text-base mb-1">No portfolio data yet</p>
      <p className="text-text-secondary text-sm max-w-sm mb-6">
        Deploy an AI agent and let it execute trades to see your portfolio performance here.
      </p>
      <NextLink
        href="/dashboard/agents/deploy"
        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
      >
        Deploy Your First Agent →
      </NextLink>
    </div>
  )
}

const STATUS_STYLE: Record<string, string> = {
  open:   'bg-success-bg text-success',
  closed: 'bg-surface text-text-disabled',
}

export default function PortfolioPage() {
  const { data: snapshot, isLoading: loadingSnap } = useQuery<PortfolioSnapshot>({
    queryKey: ['portfolio', 'snapshot'],
    queryFn: () => api.get('/portfolio/snapshot').then(r => r.data.data),
  })

  const { data: positions, isLoading: loadingPos } = useQuery<PositionRow[]>({
    queryKey: ['portfolio', 'positions'],
    queryFn: () => api.get('/portfolio/positions').then(r => r.data.data),
  })

  const isLoading = loadingSnap || loadingPos
  const isEmpty = !isLoading && (!positions || positions.length === 0)

  if (isLoading) return <Skeleton />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Portfolio</h2>
        <p className="text-sm text-text-secondary mt-0.5">Live view of all positions and performance across your agents.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Portfolio Value"
          value={snapshot ? `$${snapshot.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
          sub="Live estimate"
        />
        <StatCard
          label="Total P&L"
          value={snapshot ? `${snapshot.totalPnl >= 0 ? '+' : ''}$${Math.abs(snapshot.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
          sub={snapshot ? `${snapshot.totalRoi >= 0 ? '+' : ''}${snapshot.totalRoi.toFixed(2)}% all time` : undefined}
          color={snapshot && snapshot.totalPnl >= 0 ? 'text-success' : 'text-error'}
        />
        <StatCard
          label="24h Change"
          value={snapshot ? `${snapshot.dayPnl >= 0 ? '+' : ''}$${Math.abs(snapshot.dayPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
          sub={snapshot ? `${snapshot.dayPnlPct >= 0 ? '+' : ''}${snapshot.dayPnlPct.toFixed(2)}%` : undefined}
          color={snapshot && snapshot.dayPnl >= 0 ? 'text-success' : 'text-error'}
        />
        <StatCard
          label="Sharpe Ratio"
          value={snapshot ? snapshot.sharpeRatio.toFixed(2) : '—'}
          sub={snapshot ? `Win rate: ${snapshot.winRate.toFixed(1)}%` : undefined}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Max Drawdown"
          value={snapshot ? `${snapshot.maxDrawdown.toFixed(2)}%` : '—'}
          color={snapshot ? (snapshot.maxDrawdown < 5 ? 'text-success' : snapshot.maxDrawdown < 15 ? 'text-warning' : 'text-error') : undefined}
        />
        <StatCard label="Active Positions"  value={positions ? String(positions.filter(p => p.status === 'open').length) : '—'} />
        <StatCard label="Closed Positions"  value={positions ? String(positions.filter(p => p.status === 'closed').length) : '—'} />
        <StatCard label="Total Protocols"   value="3" sub="Merchant Moe, Agni, Fluxion" />
      </div>

      {/* Positions table */}
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid bg-page px-4 py-2.5" style={{ gridTemplateColumns: '14% 14% 10% 12% 12% 12% 12% 10% 10%' }}>
            {['ASSET', 'PROTOCOL', 'SIDE', 'SIZE', 'ENTRY', 'CURRENT', 'P&L', 'P&L %', 'STATUS'].map(h => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{h}</span>
            ))}
          </div>

          {positions?.map((pos, i) => {
            const pnlColor = pos.pnl >= 0 ? 'text-success' : 'text-error'
            return (
              <div
                key={pos.id}
                className={cn('grid px-4 items-center hover:bg-surface transition-colors', i % 2 === 0 ? 'bg-card' : 'bg-page')}
                style={{ gridTemplateColumns: '14% 14% 10% 12% 12% 12% 12% 10% 10%', minHeight: '52px' }}
              >
                <span className="text-sm font-medium text-text-primary">{pos.asset}</span>
                <span className="text-xs text-text-secondary capitalize">{pos.protocol.replace('_', ' ')}</span>
                <div className="flex items-center gap-1">
                  {pos.direction === 'long'
                    ? <TrendingUp className="h-3.5 w-3.5 text-success" />
                    : <TrendingDown className="h-3.5 w-3.5 text-error" />
                  }
                  <span className={cn('text-xs font-medium', pos.direction === 'long' ? 'text-success' : 'text-error')}>
                    {pos.direction.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-text-primary">${pos.size.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-sm text-text-secondary">${pos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-sm text-text-primary">${pos.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className={cn('text-sm font-medium', pnlColor)}>
                  {pos.pnl >= 0 ? '+' : ''}${Math.abs(pos.pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className={cn('text-sm font-medium', pnlColor)}>
                  {pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                </span>
                <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded w-fit', STATUS_STYLE[pos.status])}>
                  {pos.status}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Allocation breakdown */}
      {!isEmpty && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
            <h4 className="text-sm font-semibold text-text-primary mb-4">Allocation by Protocol</h4>
            {[
              { name: 'Merchant Moe', pct: 40, color: 'bg-primary' },
              { name: 'Agni Finance', pct: 35, color: 'bg-accent' },
              { name: 'Fluxion',      pct: 25, color: 'bg-success' },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-xs text-text-secondary w-28 shrink-0">{p.name}</span>
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div className={`h-2 rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-xs font-medium text-text-primary w-10 text-right">{p.pct}%</span>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <h4 className="text-sm font-semibold text-text-primary mb-4">Risk Exposure</h4>
            {[
              { label: 'Current Drawdown', value: `${snapshot?.maxDrawdown?.toFixed(2) ?? '—'}%`, color: 'text-success' },
              { label: 'Sharpe Ratio',     value: snapshot ? snapshot.sharpeRatio.toFixed(2) : '—', color: 'text-text-primary' },
              { label: 'Win Rate',         value: snapshot ? `${snapshot.winRate.toFixed(1)}%` : '—', color: 'text-success' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-xs text-text-secondary">{r.label}</span>
                <span className={cn('text-sm font-medium', r.color)}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
