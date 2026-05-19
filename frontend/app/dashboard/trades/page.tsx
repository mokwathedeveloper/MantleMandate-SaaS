'use client'

import { useState, useMemo } from 'react'
import {
  Activity, ChevronLeft, ChevronRight, Download, ExternalLink,
  TrendingUp, TrendingDown, Search, X,
} from 'lucide-react'
import { useTrades } from '@/hooks/useTrades'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { TokenIcon } from '@/components/ui/TokenIcon'
import type { Trade } from '@/types/trade'

const PROTOCOL_LABELS: Record<string, string> = {
  merchant_moe: 'Merchant Moe',
  agni:         'Agni Finance',
  fluxion:      'Fluxion',
}

// Brand-specific protocol colors — data-driven, kept as data not Tailwind
const PROTOCOL_COLORS: Record<string, string> = {
  merchant_moe: '#F5C542',
  agni:         '#22C55E',
  fluxion:      '#58A6FF',
}

// ── mock data ─────────────────────────────────────────────────────────────────

const MOCK_TRADES: Trade[] = [
  { id: 'tr-001', agentId: 'agent-1', mandateId: 'mandate-1', mandateName: 'ETH Conservative Buyer',  assetPair: 'ETH/USDC',   direction: 'buy',  amountUsd: 4200,  price: 2847.32, pnl: 318.45,  protocol: 'merchant_moe', txHash: '0x3f8a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a', blockNumber: 58_234_101, status: 'success', mandateRuleApplied: 'RSI < 30 trigger',    createdAt: '2026-05-06T09:14:22Z' },
  { id: 'tr-002', agentId: 'agent-1', mandateId: 'mandate-1', mandateName: 'ETH Conservative Buyer',  assetPair: 'ETH/USDC',   direction: 'sell', amountUsd: 4518,  price: 3054.10, pnl: 206.78,  protocol: 'merchant_moe', txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', blockNumber: 58_231_847, status: 'success', mandateRuleApplied: 'RSI > 70 exit',       createdAt: '2026-05-05T16:43:11Z' },
  { id: 'tr-003', agentId: 'agent-2', mandateId: 'mandate-2', mandateName: 'Stable Yield Farmer',     assetPair: 'USDC/USDT',  direction: 'buy',  amountUsd: 10000, price: 1.0001,  pnl: 42.30,   protocol: 'agni',         txHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', blockNumber: 58_229_034, status: 'success', mandateRuleApplied: 'Daily yield reinvest', createdAt: '2026-05-05T08:00:00Z' },
  { id: 'tr-004', agentId: 'agent-3', mandateId: 'mandate-3', mandateName: 'MNT DCA Strategy',        assetPair: 'MNT/USDC',   direction: 'buy',  amountUsd: 500,   price: 0.8234,  pnl: -12.50,  protocol: 'fluxion',      txHash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', blockNumber: 58_224_211, status: 'success', mandateRuleApplied: 'Weekly DCA',          createdAt: '2026-05-04T12:00:00Z' },
  { id: 'tr-005', agentId: 'agent-2', mandateId: 'mandate-2', mandateName: 'Stable Yield Farmer',     assetPair: 'USDC/USDT',  direction: 'buy',  amountUsd: 8500,  price: 0.9998,  pnl: 38.75,   protocol: 'agni',         txHash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3', blockNumber: 58_220_008, status: 'success', mandateRuleApplied: 'Daily yield reinvest', createdAt: '2026-05-04T08:00:00Z' },
  { id: 'tr-006', agentId: 'agent-1', mandateId: 'mandate-1', mandateName: 'ETH Conservative Buyer',  assetPair: 'WBTC/USDC',  direction: 'buy',  amountUsd: 2100,  price: 62_430,  pnl: null,    protocol: 'merchant_moe', txHash: null,                                        blockNumber: null,        status: 'pending', mandateRuleApplied: 'Momentum breakout',   createdAt: '2026-05-06T10:02:44Z' },
  { id: 'tr-007', agentId: 'agent-3', mandateId: 'mandate-3', mandateName: 'MNT DCA Strategy',        assetPair: 'MNT/USDC',   direction: 'buy',  amountUsd: 500,   price: 0.7918,  pnl: 8.40,    protocol: 'fluxion',      txHash: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4', blockNumber: 58_214_344, status: 'success', mandateRuleApplied: 'Weekly DCA',          createdAt: '2026-04-28T12:00:00Z' },
  { id: 'tr-008', agentId: 'agent-1', mandateId: 'mandate-1', mandateName: 'ETH Conservative Buyer',  assetPair: 'ETH/USDC',   direction: 'buy',  amountUsd: 3850,  price: 2690.14, pnl: -74.20,  protocol: 'merchant_moe', txHash: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5', blockNumber: 58_209_101, status: 'success', mandateRuleApplied: 'RSI < 30 trigger',    createdAt: '2026-04-27T14:33:09Z' },
  { id: 'tr-009', agentId: 'agent-4', mandateId: 'mandate-4', mandateName: 'Arb Scanner Alpha',       assetPair: 'ETH/USDT',   direction: 'sell', amountUsd: 7200,  price: 3041.50, pnl: null,    protocol: 'agni',         txHash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6', blockNumber: 58_207_800, status: 'failed',  mandateRuleApplied: 'Arb spread > 0.3%',   createdAt: '2026-04-26T19:11:45Z' },
  { id: 'tr-010', agentId: 'agent-2', mandateId: 'mandate-2', mandateName: 'Stable Yield Farmer',     assetPair: 'USDC/USDT',  direction: 'buy',  amountUsd: 9200,  price: 1.0002,  pnl: 44.10,   protocol: 'agni',         txHash: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7', blockNumber: 58_204_550, status: 'success', mandateRuleApplied: 'Daily yield reinvest', createdAt: '2026-04-26T08:00:00Z' },
  { id: 'tr-011', agentId: 'agent-1', mandateId: 'mandate-1', mandateName: 'ETH Conservative Buyer',  assetPair: 'ETH/USDC',   direction: 'buy',  amountUsd: 5000,  price: 2722.80, pnl: 445.60,  protocol: 'merchant_moe', txHash: '0xc9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', blockNumber: 58_199_233, status: 'success', mandateRuleApplied: 'RSI < 30 trigger',    createdAt: '2026-04-25T10:55:18Z' },
  { id: 'tr-012', agentId: 'agent-3', mandateId: 'mandate-3', mandateName: 'MNT DCA Strategy',        assetPair: 'MNT/USDC',   direction: 'buy',  amountUsd: 500,   price: 0.8102,  pnl: 19.70,   protocol: 'fluxion',      txHash: '0xd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9', blockNumber: 58_195_088, status: 'success', mandateRuleApplied: 'Weekly DCA',          createdAt: '2026-04-21T12:00:00Z' },
  { id: 'tr-013', agentId: 'agent-4', mandateId: 'mandate-4', mandateName: 'Arb Scanner Alpha',       assetPair: 'WETH/USDC',  direction: 'buy',  amountUsd: 6800,  price: 2915.40, pnl: 138.90,  protocol: 'fluxion',      txHash: '0xe1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', blockNumber: 58_190_722, status: 'success', mandateRuleApplied: 'Arb spread > 0.3%',   createdAt: '2026-04-20T07:24:33Z' },
  { id: 'tr-014', agentId: 'agent-2', mandateId: 'mandate-2', mandateName: 'Stable Yield Farmer',     assetPair: 'USDC/USDT',  direction: 'buy',  amountUsd: 11000, price: 0.9999,  pnl: 47.80,   protocol: 'agni',         txHash: '0xf2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', blockNumber: 58_187_409, status: 'success', mandateRuleApplied: 'Daily yield reinvest', createdAt: '2026-04-19T08:00:00Z' },
  { id: 'tr-015', agentId: 'agent-1', mandateId: 'mandate-1', mandateName: 'ETH Conservative Buyer',  assetPair: 'ETH/USDC',   direction: 'sell', amountUsd: 5445,  price: 3089.00, pnl: 322.80,  protocol: 'merchant_moe', txHash: '0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', blockNumber: 58_183_144, status: 'success', mandateRuleApplied: 'RSI > 70 exit',       createdAt: '2026-04-18T15:08:57Z' },
]

const MOCK_RESPONSE = { data: MOCK_TRADES, total: MOCK_TRADES.length, page: 1, page_size: 25, total_pages: 1 }

type Filter = { status?: string; direction?: string; search?: string }

// ── sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-1">{label}</p>
      <p className={cn('text-lg font-bold', valueClass ?? 'text-text-primary')}>{value}</p>
    </div>
  )
}

function FilterPill({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
        active
          ? 'bg-primary border-transparent text-white'
          : 'bg-card border-border text-text-secondary hover:text-text-primary hover:border-text-disabled',
      )}
    >
      {label}
    </button>
  )
}

const STATUS_CLASS: Record<string, string> = {
  success: 'bg-success-bg text-success border border-success/20',
  failed:  'bg-error-bg  text-error  border border-error/20',
  pending: 'bg-warning-bg text-warning border border-warning/20',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TradesPage() {
  const [page,   setPage]   = useState(1)
  const [filter, setFilter] = useState<Filter>({})

  const { user } = useAuthStore()
  const { data: apiData, isLoading, isError } = useTrades({
    page,
    per_page: 25,
    status:   filter.status,
    enabled:  !!user,
  })

  const isMock = !user || (!isLoading && !apiData?.data?.length) || isError
  const raw    = isMock ? MOCK_RESPONSE : (apiData ?? MOCK_RESPONSE)

  const visibleTrades = useMemo(() => {
    let list = raw.data
    if (filter.status)    list = list.filter(t => t.status === filter.status)
    if (filter.direction) list = list.filter(t => t.direction === filter.direction)
    if (filter.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(t =>
        t.assetPair.toLowerCase().includes(q) ||
        t.mandateName.toLowerCase().includes(q) ||
        (t.txHash ?? '').toLowerCase().includes(q) ||
        (PROTOCOL_LABELS[t.protocol] ?? t.protocol).toLowerCase().includes(q),
      )
    }
    return list
  }, [raw.data, filter])

  const stats = useMemo(() => {
    const trades   = raw.data
    const success  = trades.filter(t => t.status === 'success')
    const totalPnl = success.reduce((s, t) => s + (t.pnl ?? 0), 0)
    const volume   = trades.reduce((s, t) => s + t.amountUsd, 0)
    return {
      total: trades.length,
      success: success.length,
      failed: trades.filter(t => t.status === 'failed').length,
      totalPnl, volume,
    }
  }, [raw.data])

  const totalPages = Math.ceil(visibleTrades.length / 25) || 1

  const toggleStatus = (s: string) =>
    setFilter(f => ({ ...f, status: f.status === s ? undefined : s, search: f.search }))
  const toggleDir = (d: string) =>
    setFilter(f => ({ ...f, direction: f.direction === d ? undefined : d, search: f.search }))

  const handleExport = () => {
    const header = 'Time,Pair,Direction,Amount,Price,P&L,Protocol,Status,TX Hash\n'
    const rows = raw.data.map(t =>
      [
        new Date(t.createdAt).toLocaleString(),
        t.assetPair, t.direction,
        t.amountUsd.toFixed(2), t.price.toFixed(4),
        t.pnl != null ? t.pnl.toFixed(2) : '',
        PROTOCOL_LABELS[t.protocol] ?? t.protocol,
        t.status, t.txHash ?? '',
      ].join(','),
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'trades.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">

      {/* Error banner */}
      {isError && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 flex items-center gap-2">
          <span className="text-sm font-semibold text-error">API error</span>
          <span className="text-sm text-text-secondary">— showing demo data.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Trade History</h2>
          <p className="text-sm text-text-secondary mt-1">
            All trade executions across agents and protocols
          </p>
        </div>
        <button
          onClick={handleExport}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md text-sm border border-border bg-card text-text-secondary hover:text-text-primary hover:border-text-disabled transition-colors shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Trades" value={String(stats.total)} />
        <KpiCard
          label="Successful"
          value={String(stats.success)}
          valueClass="text-success"
        />
        <KpiCard
          label="Failed"
          value={String(stats.failed)}
          valueClass={stats.failed > 0 ? 'text-error' : undefined}
        />
        <KpiCard
          label="Total P&L"
          value={`${stats.totalPnl >= 0 ? '+' : ''}$${Math.abs(stats.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          valueClass={stats.totalPnl >= 0 ? 'text-success' : 'text-error'}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill label="All"     active={!filter.status && !filter.direction} onClick={() => setFilter({})} />
        <FilterPill label="Success" active={filter.status === 'success'} onClick={() => toggleStatus('success')} />
        <FilterPill label="Failed"  active={filter.status === 'failed'}  onClick={() => toggleStatus('failed')} />
        <FilterPill label="Pending" active={filter.status === 'pending'} onClick={() => toggleStatus('pending')} />
        <div className="w-px h-6 bg-border mx-1" />
        <FilterPill label="Buys"  active={filter.direction === 'buy'}  onClick={() => toggleDir('buy')} />
        <FilterPill label="Sells" active={filter.direction === 'sell'} onClick={() => toggleDir('sell')} />

        {/* Search */}
        <div className="relative sm:ml-auto w-full sm:w-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          <input
            name="trade-search"
            placeholder="Search pair, mandate, tx…"
            value={filter.search ?? ''}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value || undefined }))}
            className="w-full sm:w-56 h-8 pl-8 pr-8 rounded-md border border-border bg-page text-text-primary text-xs placeholder:text-text-disabled focus:outline-none focus:border-primary"
          />
          {filter.search && (
            <button
              onClick={() => setFilter(f => ({ ...f, search: undefined }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 900 }}>
            <thead>
              <tr className="bg-card border-b border-border">
                {['Pair', 'Side', 'Amount', 'Price', 'P&L', 'Protocol', 'TX Hash', 'Status', 'Time'].map(h => (
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
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-2">
                      <div className="h-9 rounded bg-surface animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : visibleTrades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <Activity className="h-10 w-10 text-text-secondary opacity-40" />
                      <p className="text-sm font-semibold text-text-primary">No trades found</p>
                      <p className="text-xs text-text-secondary">
                        {Object.keys(filter).length > 0 ? 'Try clearing the filters' : 'Deploy an agent to start trading'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleTrades.map(t => {
                  const pnlPositive = t.pnl != null && t.pnl >= 0
                  const pnlClass    = t.pnl == null ? 'text-text-disabled' : pnlPositive ? 'text-success' : 'text-error'
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border/60 last:border-b-0 hover:bg-surface transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TokenIcon symbol={t.assetPair.split('/')[0]} size="sm" />
                          <span className="text-[13px] font-semibold text-text-primary">{t.assetPair}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {t.direction === 'buy'
                            ? <TrendingUp className="h-3 w-3 text-success" />
                            : <TrendingDown className="h-3 w-3 text-error" />
                          }
                          <span className={cn(
                            'text-[11px] font-bold uppercase',
                            t.direction === 'buy' ? 'text-success' : 'text-error',
                          )}>
                            {t.direction}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-primary tabular-nums whitespace-nowrap">
                        ${t.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary tabular-nums whitespace-nowrap">
                        ${t.price.toFixed(t.price > 100 ? 2 : 4)}
                      </td>
                      <td className={cn('px-4 py-3 text-xs font-semibold tabular-nums whitespace-nowrap', pnlClass)}>
                        {t.pnl != null ? `${pnlPositive ? '+' : ''}$${Math.abs(t.pnl).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Brand-specific dot color stays inline */}
                          <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ background: PROTOCOL_COLORS[t.protocol] ?? '#8B949E' }}
                          />
                          <span className="text-[11px] text-text-secondary whitespace-nowrap">
                            {PROTOCOL_LABELS[t.protocol] ?? t.protocol}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {t.txHash ? (
                          <a
                            href={`https://explorer.sepolia.mantle.xyz/tx/${t.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-text-link hover:text-text-link-hover transition-colors font-mono"
                          >
                            {t.txHash.slice(0, 8)}…{t.txHash.slice(-4)}
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-text-disabled">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded whitespace-nowrap',
                          STATUS_CLASS[t.status] ?? 'bg-card text-text-secondary border border-border',
                        )}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-text-disabled whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-text-secondary">
            {visibleTrades.length} trades · Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs border border-border text-text-secondary hover:border-text-disabled hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs border border-border text-text-secondary hover:border-text-disabled hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
