'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Search, Bot, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useMandates } from '@/hooks/useMandates'
import { useAuthStore } from '@/store/authStore'
import { formatDate, cn } from '@/lib/utils'
import { TokenIcon } from '@/components/ui/TokenIcon'
import type { Mandate } from '@/types/mandate'

// ── mock data ─────────────────────────────────────────────────────────────────

const MOCK_MANDATES: Mandate[] = [
  {
    id: 'mandate-1',
    name: 'ETH Conservative Buyer',
    mandateText: 'Buy ETH when RSI drops below 30, sell when it hits 70. Max 20% per position, 2% stop loss. Only trade during high liquidity windows.',
    parsedPolicy: { asset: 'ETH', trigger: 'RSI < 30', riskPerTrade: 20, takeProfit: 70, schedule: 'On signal', venue: 'Merchant Moe' },
    policyHash: '0x8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c',
    baseCurrency: 'USDC',
    strategyType: 'MEAN_REVERSION',
    riskParams: { maxDrawdown: 10, maxPosition: 20, stopLoss: 2, maxPositions: 3, cooldownHours: 4 },
    capitalCap: 50000,
    status: 'active',
    onChainTx: '0x3f8a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'mandate-2',
    name: 'Stable Yield Farmer',
    mandateText: 'Yield farm USDC on Agni Finance. Reinvest profits daily. Never hold more than 50% in a single pool. Stop if APY drops below 8%.',
    parsedPolicy: { asset: 'USDC', trigger: 'Daily', riskPerTrade: 50, takeProfit: null, schedule: 'Daily 08:00 UTC', venue: 'Agni Finance' },
    policyHash: '0x2b4c8d1a3e5f7b9c0d2e4f6a8b0c2e4f',
    baseCurrency: 'USDC',
    strategyType: 'YIELD',
    riskParams: { maxDrawdown: 5, maxPosition: 50, stopLoss: 5, maxPositions: 2, cooldownHours: 24 },
    capitalCap: 30000,
    status: 'active',
    onChainTx: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-05-05T09:00:00Z',
  },
  {
    id: 'mandate-3',
    name: 'MNT DCA Strategy',
    mandateText: 'DCA into MNT weekly. Stop if drawdown exceeds 15% of capital. Maximum 5 concurrent positions. Use Fluxion for best pricing.',
    parsedPolicy: { asset: 'MNT', trigger: 'Weekly Monday', riskPerTrade: 10, takeProfit: null, schedule: 'Weekly', venue: 'Fluxion' },
    policyHash: '0x6d8f2b4c1a3e5f7b9c0d2e4f6a8b0c2e',
    baseCurrency: 'USDC',
    strategyType: 'DCA',
    riskParams: { maxDrawdown: 15, maxPosition: 10, stopLoss: 15, maxPositions: 5, cooldownHours: 168 },
    capitalCap: 10000,
    status: 'active',
    onChainTx: '0xc4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-04-28T12:00:00Z',
  },
  {
    id: 'mandate-4',
    name: 'Arb Scanner Alpha',
    mandateText: 'Arbitrage stablecoin pairs on Merchant Moe and Agni Finance when spread exceeds 0.3%. Never trade more than $10k per transaction.',
    parsedPolicy: { asset: 'USDC/USDT', trigger: 'Spread > 0.3%', riskPerTrade: 5, takeProfit: null, schedule: 'On signal', venue: 'Merchant Moe' },
    policyHash: null,
    baseCurrency: 'USDC',
    strategyType: 'ARBITRAGE',
    riskParams: { maxDrawdown: 3, maxPosition: 5, stopLoss: 1, maxPositions: 2, cooldownHours: 1 },
    capitalCap: 20000,
    status: 'paused',
    onChainTx: null,
    createdAt: '2026-04-10T14:00:00Z',
    updatedAt: '2026-04-30T14:00:00Z',
  },
  {
    id: 'mandate-5',
    name: 'BTC Momentum Rider',
    mandateText: 'Buy WBTC when 4-hour price breaks above 20-day high. Sell 50% at 5% profit, trail stop at 3% for the rest.',
    parsedPolicy: { asset: 'WBTC', trigger: '4h high breakout', riskPerTrade: 15, takeProfit: 5, schedule: 'On signal', venue: 'Merchant Moe' },
    policyHash: '0xf0e1d2c3b4a5968778695a4b3c2d1e0f',
    baseCurrency: 'USDC',
    strategyType: 'MOMENTUM',
    riskParams: { maxDrawdown: 8, maxPosition: 15, stopLoss: 5, maxPositions: 2, cooldownHours: 8 },
    capitalCap: 25000,
    status: 'draft',
    onChainTx: null,
    createdAt: '2026-05-04T16:00:00Z',
    updatedAt: '2026-05-04T16:00:00Z',
  },
  {
    id: 'mandate-6',
    name: 'Q1 Yield Archive',
    mandateText: 'Historical Q1 2026 yield farming strategy on Agni Finance. Achieved 12.4% APY over 90 days.',
    parsedPolicy: null,
    policyHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    baseCurrency: 'USDC',
    strategyType: 'YIELD',
    riskParams: { maxDrawdown: 5, maxPosition: 50, stopLoss: 5, maxPositions: 2, cooldownHours: 24 },
    capitalCap: 50000,
    status: 'archived',
    onChainTx: '0x9f0e1d2c3b4a5968778695a4b3c2d1e0f',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-31T23:59:00Z',
  },
]

// ── status styles using design tokens ─────────────────────────────────────────

const STATUS_CLASS: Record<string, { badge: string; label: string }> = {
  active:   { badge: 'bg-success-bg text-success border border-success/20',       label: 'Active' },
  paused:   { badge: 'bg-warning-bg text-warning border border-warning/20',       label: 'Paused' },
  draft:    { badge: 'bg-card text-text-secondary border border-border',           label: 'Draft' },
  archived: { badge: 'bg-card text-text-disabled border border-border',            label: 'Archived' },
}

const STRATEGY_ICONS: Record<string, string> = {
  MEAN_REVERSION: '↕',
  YIELD:          '🌾',
  DCA:            '📅',
  ARBITRAGE:      '⚡',
  MOMENTUM:       '🚀',
}

// ── MandateCard ───────────────────────────────────────────────────────────────

function MandateCard({ mandate }: { mandate: Mandate }) {
  const st   = STATUS_CLASS[mandate.status] ?? STATUS_CLASS.draft
  const icon = mandate.strategyType ? (STRATEGY_ICONS[mandate.strategyType] ?? '📋') : '📋'

  return (
    <Link href={`/dashboard/mandates/${mandate.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-colors hover:border-border/80 group-hover:border-text-disabled">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg shrink-0">{icon}</span>
            <h3 className="text-sm font-semibold text-text-primary truncate">{mandate.name}</h3>
          </div>
          <span className={cn(
            'text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded shrink-0',
            st.badge,
          )}>
            {st.label}
          </span>
        </div>

        {/* Mandate text */}
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
          {mandate.mandateText}
        </p>

        {/* Parsed policy chips */}
        {mandate.parsedPolicy && (
          <div className="flex flex-wrap gap-1.5">
            {mandate.parsedPolicy.asset && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-text-link border border-primary/20">
                {mandate.parsedPolicy.asset}
              </span>
            )}
            {mandate.parsedPolicy.venue && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-text-secondary border border-border">
                {mandate.parsedPolicy.venue}
              </span>
            )}
            {mandate.parsedPolicy.schedule && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface text-text-secondary border border-border">
                {mandate.parsedPolicy.schedule}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-2.5">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-text-disabled">{mandate.baseCurrency}</span>
            {mandate.capitalCap && (
              <span className="text-[11px] text-text-disabled">
                Cap: ${mandate.capitalCap.toLocaleString('en-US')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {mandate.policyHash && (
              <CheckCircle2 className="h-3 w-3 text-success" aria-label="Policy anchored on-chain" />
            )}
            {mandate.onChainTx && (
              <TrendingUp className="h-3 w-3 text-text-link" aria-label="On-chain transaction exists" />
            )}
            <span className="text-[11px] text-text-disabled">{formatDate(mandate.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'paused' | 'draft' | 'archived'

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'active',   label: 'Active' },
  { key: 'paused',   label: 'Paused' },
  { key: 'draft',    label: 'Draft' },
  { key: 'archived', label: 'Archived' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MandatesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search,       setSearch]       = useState('')

  const { session } = useAuthStore()
  const { data, isLoading, isError } = useMandates({ enabled: !!session })
  const apiMandates = data?.data ?? []
  const isMock = !session || (!isLoading && apiMandates.length === 0) || isError

  const allMandates = isMock ? MOCK_MANDATES : apiMandates

  const filtered = allMandates.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        m.name.toLowerCase().includes(q) ||
        m.mandateText.toLowerCase().includes(q) ||
        (m.strategyType ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = FILTER_TABS.slice(1).reduce((acc, t) => {
    acc[t.key] = allMandates.filter(m => m.status === t.key).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">

      {/* Error banner */}
      {isError && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error flex items-center gap-2">
          <span className="font-semibold">API error</span>
          <span className="text-text-secondary">— showing demo data while we reconnect.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Mandates</h2>
          <p className="text-sm text-text-secondary mt-1">
            {allMandates.length} mandate{allMandates.length !== 1 ? 's' : ''} — plain-English strategies executed by AI agents
          </p>
        </div>
        <Link
          href="/dashboard/mandates/new"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Mandate
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1 bg-card border border-border rounded-lg p-1">
          {FILTER_TABS.map(({ key, label }) => {
            const count  = key === 'all' ? allMandates.length : (counts[key] ?? 0)
            const active = statusFilter === key
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  'h-8 px-3 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                  active
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface',
                )}
              >
                {label}
                {count > 0 && (
                  <span className={cn(
                    'text-[10px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1',
                    active ? 'bg-white/20 text-white' : 'bg-surface text-text-disabled',
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto w-full sm:w-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          <input
            placeholder="Search mandates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-52 h-9 pl-8 pr-3 rounded-md border border-border bg-page text-text-primary text-xs placeholder:text-text-disabled focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <FileText className="h-12 w-12 text-text-secondary opacity-40" />
          <div>
            <p className="text-base font-semibold text-text-primary mb-1">
              {search || statusFilter !== 'all' ? 'No mandates match' : 'No mandates yet'}
            </p>
            <p className="text-sm text-text-secondary max-w-sm">
              {search || statusFilter !== 'all'
                ? 'Try clearing the search or switching to All tab.'
                : 'Write your first investment mandate in plain English and let AI deploy an agent.'}
            </p>
          </div>
          {!search && statusFilter === 'all' && (
            <Link
              href="/dashboard/mandates/new"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first mandate
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(m => <MandateCard key={m.id} mandate={m} />)}
        </div>
      )}

      {/* Bottom CTA strip */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-success-bg border border-success/20 rounded-lg px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Bot className="h-5 w-5 text-success shrink-0" />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {allMandates.filter(m => m.status === 'active').length} active mandate{allMandates.filter(m => m.status === 'active').length !== 1 ? 's' : ''} running
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                AI agents are executing your strategies autonomously on Mantle Network
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/agents"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md border border-success/40 text-success text-xs font-semibold hover:bg-success/5 transition-colors shrink-0"
          >
            View agents →
          </Link>
        </div>
      )}
    </div>
  )
}
