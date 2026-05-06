'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Search, Bot, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useMandates } from '@/hooks/useMandates'
import { formatDate } from '@/lib/utils'
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

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#0D2818', color: '#22C55E', label: 'Active' },
  paused:   { bg: '#2A2000', color: '#F5C542', label: 'Paused' },
  draft:    { bg: '#161B22', color: '#8B949E', label: 'Draft' },
  archived: { bg: '#161B22', color: '#484F58', label: 'Archived' },
}

const STRATEGY_ICONS: Record<string, string> = {
  MEAN_REVERSION: '↕',
  YIELD: '🌾',
  DCA: '📅',
  ARBITRAGE: '⚡',
  MOMENTUM: '🚀',
}

function MandateCard({ mandate }: { mandate: Mandate }) {
  const st = STATUS_STYLE[mandate.status] ?? STATUS_STYLE.draft
  const icon = mandate.strategyType ? (STRATEGY_ICONS[mandate.strategyType] ?? '📋') : '📋'

  return (
    <Link href={`/dashboard/mandates/${mandate.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#161B22',
        border: '1px solid #21262D',
        borderRadius: 10,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#30363D')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#21262D')}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F0F6FC', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {mandate.name}
            </h3>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '2px 8px', borderRadius: 4,
            background: st.bg, color: st.color, flexShrink: 0,
          }}>
            {st.label}
          </span>
        </div>

        {/* Mandate text */}
        <p style={{
          fontSize: 12, color: '#8B949E', margin: 0, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {mandate.mandateText}
        </p>

        {/* Parsed policy chips */}
        {mandate.parsedPolicy && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {mandate.parsedPolicy.asset && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: '#0066FF1A', color: '#58A6FF', border: '1px solid #0066FF33' }}>
                {mandate.parsedPolicy.asset}
              </span>
            )}
            {mandate.parsedPolicy.venue && (
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#21262D', color: '#8B949E', border: '1px solid #30363D' }}>
                {mandate.parsedPolicy.venue}
              </span>
            )}
            {mandate.parsedPolicy.schedule && (
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#21262D', color: '#8B949E', border: '1px solid #30363D' }}>
                {mandate.parsedPolicy.schedule}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #21262D', paddingTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#484F58' }}>{mandate.baseCurrency}</span>
            {mandate.capitalCap && (
              <span style={{ fontSize: 11, color: '#484F58' }}>
                Cap: ${mandate.capitalCap.toLocaleString('en-US')}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {mandate.policyHash && (
              <CheckCircle2 style={{ width: 12, height: 12, color: '#22C55E' }} />
            )}
            {mandate.onChainTx && (
              <TrendingUp style={{ width: 12, height: 12, color: '#58A6FF' }} />
            )}
            <span style={{ fontSize: 11, color: '#484F58' }}>{formatDate(mandate.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── filter tabs ───────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'paused' | 'draft' | 'archived'

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'active',   label: 'Active' },
  { key: 'paused',   label: 'Paused' },
  { key: 'draft',    label: 'Draft' },
  { key: 'archived', label: 'Archived' },
]

// ── page ──────────────────────────────────────────────────────────────────────

export default function MandatesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useMandates()
  const apiMandates = data?.data ?? []
  const isMock = !isLoading && apiMandates.length === 0

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
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F0F6FC', margin: 0 }}>Mandates</h2>
          <p style={{ fontSize: 13, color: '#8B949E', margin: '4px 0 0' }}>
            {allMandates.length} mandate{allMandates.length !== 1 ? 's' : ''} — plain-English strategies executed by AI agents
          </p>
        </div>
        <Link
          href="/dashboard/mandates/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 38, padding: '0 16px',
            borderRadius: 8, background: '#0066FF', color: '#fff',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          New Mandate
        </Link>
      </div>

      {/* Demo notice */}
      {isMock && !isLoading && (
        <div style={{
          background: '#2A2000', border: '1px solid #F5C54266', borderRadius: 8,
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#F5C542', letterSpacing: '0.08em' }}>DEMO</span>
          <span style={{ fontSize: 12, color: '#8B949E' }}>
            Showing sample mandates — connect backend to see your live strategies.
          </span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#161B22', border: '1px solid #21262D', borderRadius: 8, padding: 4 }}>
          {FILTER_TABS.map(({ key, label }) => {
            const count = key === 'all' ? allMandates.length : (counts[key] ?? 0)
            const active = statusFilter === key
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  height: 30, padding: '0 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? '#0066FF' : 'transparent',
                  color: active ? '#fff' : '#8B949E',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, minWidth: 16, height: 16,
                    borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? 'rgba(255,255,255,0.2)' : '#21262D',
                    color: active ? '#fff' : '#484F58',
                    padding: '0 4px',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#8B949E', pointerEvents: 'none' }} />
          <input
            placeholder="Search mandates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              height: 34, paddingLeft: 30, paddingRight: 12, paddingTop: 0, paddingBottom: 0,
              borderRadius: 6, border: '1px solid #30363D', background: '#0D1117',
              color: '#F0F6FC', fontSize: 12, outline: 'none', width: 200,
            }}
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 200, borderRadius: 10, background: '#161B22', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', gap: 16, textAlign: 'center' }}>
          <FileText style={{ width: 48, height: 48, color: '#8B949E', opacity: 0.4 }} />
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#F0F6FC', margin: '0 0 4px' }}>
              {search || statusFilter !== 'all' ? 'No mandates match' : 'No mandates yet'}
            </p>
            <p style={{ fontSize: 13, color: '#8B949E', margin: 0, maxWidth: 360 }}>
              {search || statusFilter !== 'all'
                ? 'Try clearing the filters'
                : 'Write your first investment mandate in plain English and let AI deploy an agent'}
            </p>
          </div>
          {!search && statusFilter === 'all' && (
            <Link
              href="/dashboard/mandates/new"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 38, padding: '0 20px',
                borderRadius: 8, background: '#0066FF', color: '#fff',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Create your first mandate
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(m => <MandateCard key={m.id} mandate={m} />)}
        </div>
      )}

      {/* Bottom CTA strip */}
      {filtered.length > 0 && (
        <div style={{
          background: '#0D2818', border: '1px solid #22C55E33',
          borderRadius: 8, padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bot style={{ width: 18, height: 18, color: '#22C55E' }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#F0F6FC', margin: '0 0 1px' }}>
                {allMandates.filter(m => m.status === 'active').length} active mandate{allMandates.filter(m => m.status === 'active').length !== 1 ? 's' : ''} running
              </p>
              <p style={{ fontSize: 11, color: '#8B949E', margin: 0 }}>AI agents are executing your strategies autonomously on Mantle Network</p>
            </div>
          </div>
          <Link
            href="/dashboard/agents"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              height: 32, padding: '0 14px',
              borderRadius: 6, border: '1px solid #22C55E66',
              color: '#22C55E', fontSize: 12, fontWeight: 600, textDecoration: 'none',
              background: 'transparent',
            }}
          >
            View agents →
          </Link>
        </div>
      )}
    </div>
  )
}
