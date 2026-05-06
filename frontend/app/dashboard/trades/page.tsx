'use client'

import { useState, useMemo } from 'react'
import { Activity, ChevronLeft, ChevronRight, Download, ExternalLink, TrendingUp, TrendingDown, Search, X } from 'lucide-react'
import { useTrades } from '@/hooks/useTrades'
import type { Trade } from '@/types/trade'

const PROTOCOL_LABELS: Record<string, string> = {
  merchant_moe: 'Merchant Moe',
  agni:         'Agni Finance',
  fluxion:      'Fluxion',
}

const PROTOCOL_COLORS: Record<string, string> = {
  merchant_moe: '#F5C542',
  agni:         '#22C55E',
  fluxion:      '#58A6FF',
}

// ── mock data ─────────────────────────────────────────────────────────────────

const MOCK_TRADES: Trade[] = [
  {
    id: 'tr-001', agentId: 'agent-1', mandateId: 'mandate-1',
    mandateName: 'ETH Conservative Buyer',
    assetPair: 'ETH/USDC', direction: 'buy', amountUsd: 4200, price: 2847.32,
    pnl: 318.45, protocol: 'merchant_moe',
    txHash: '0x3f8a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    blockNumber: 58_234_101, status: 'success',
    mandateRuleApplied: 'RSI < 30 trigger', createdAt: '2026-05-06T09:14:22Z',
  },
  {
    id: 'tr-002', agentId: 'agent-1', mandateId: 'mandate-1',
    mandateName: 'ETH Conservative Buyer',
    assetPair: 'ETH/USDC', direction: 'sell', amountUsd: 4518, price: 3054.10,
    pnl: 206.78, protocol: 'merchant_moe',
    txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    blockNumber: 58_231_847, status: 'success',
    mandateRuleApplied: 'RSI > 70 exit', createdAt: '2026-05-05T16:43:11Z',
  },
  {
    id: 'tr-003', agentId: 'agent-2', mandateId: 'mandate-2',
    mandateName: 'Stable Yield Farmer',
    assetPair: 'USDC/USDT', direction: 'buy', amountUsd: 10000, price: 1.0001,
    pnl: 42.30, protocol: 'agni',
    txHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    blockNumber: 58_229_034, status: 'success',
    mandateRuleApplied: 'Daily yield reinvest', createdAt: '2026-05-05T08:00:00Z',
  },
  {
    id: 'tr-004', agentId: 'agent-3', mandateId: 'mandate-3',
    mandateName: 'MNT DCA Strategy',
    assetPair: 'MNT/USDC', direction: 'buy', amountUsd: 500, price: 0.8234,
    pnl: -12.50, protocol: 'fluxion',
    txHash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    blockNumber: 58_224_211, status: 'success',
    mandateRuleApplied: 'Weekly DCA', createdAt: '2026-05-04T12:00:00Z',
  },
  {
    id: 'tr-005', agentId: 'agent-2', mandateId: 'mandate-2',
    mandateName: 'Stable Yield Farmer',
    assetPair: 'USDC/USDT', direction: 'buy', amountUsd: 8500, price: 0.9998,
    pnl: 38.75, protocol: 'agni',
    txHash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
    blockNumber: 58_220_008, status: 'success',
    mandateRuleApplied: 'Daily yield reinvest', createdAt: '2026-05-04T08:00:00Z',
  },
  {
    id: 'tr-006', agentId: 'agent-1', mandateId: 'mandate-1',
    mandateName: 'ETH Conservative Buyer',
    assetPair: 'WBTC/USDC', direction: 'buy', amountUsd: 2100, price: 62_430.00,
    pnl: null, protocol: 'merchant_moe',
    txHash: null,
    blockNumber: null, status: 'pending',
    mandateRuleApplied: 'Momentum breakout', createdAt: '2026-05-06T10:02:44Z',
  },
  {
    id: 'tr-007', agentId: 'agent-3', mandateId: 'mandate-3',
    mandateName: 'MNT DCA Strategy',
    assetPair: 'MNT/USDC', direction: 'buy', amountUsd: 500, price: 0.7918,
    pnl: 8.40, protocol: 'fluxion',
    txHash: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
    blockNumber: 58_214_344, status: 'success',
    mandateRuleApplied: 'Weekly DCA', createdAt: '2026-04-28T12:00:00Z',
  },
  {
    id: 'tr-008', agentId: 'agent-1', mandateId: 'mandate-1',
    mandateName: 'ETH Conservative Buyer',
    assetPair: 'ETH/USDC', direction: 'buy', amountUsd: 3850, price: 2690.14,
    pnl: -74.20, protocol: 'merchant_moe',
    txHash: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
    blockNumber: 58_209_101, status: 'success',
    mandateRuleApplied: 'RSI < 30 trigger', createdAt: '2026-04-27T14:33:09Z',
  },
  {
    id: 'tr-009', agentId: 'agent-4', mandateId: 'mandate-4',
    mandateName: 'Arb Scanner Alpha',
    assetPair: 'ETH/USDT', direction: 'sell', amountUsd: 7200, price: 3041.50,
    pnl: null, protocol: 'agni',
    txHash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
    blockNumber: 58_207_800, status: 'failed',
    mandateRuleApplied: 'Arb spread > 0.3%', createdAt: '2026-04-26T19:11:45Z',
  },
  {
    id: 'tr-010', agentId: 'agent-2', mandateId: 'mandate-2',
    mandateName: 'Stable Yield Farmer',
    assetPair: 'USDC/USDT', direction: 'buy', amountUsd: 9200, price: 1.0002,
    pnl: 44.10, protocol: 'agni',
    txHash: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
    blockNumber: 58_204_550, status: 'success',
    mandateRuleApplied: 'Daily yield reinvest', createdAt: '2026-04-26T08:00:00Z',
  },
  {
    id: 'tr-011', agentId: 'agent-1', mandateId: 'mandate-1',
    mandateName: 'ETH Conservative Buyer',
    assetPair: 'ETH/USDC', direction: 'buy', amountUsd: 5000, price: 2722.80,
    pnl: 445.60, protocol: 'merchant_moe',
    txHash: '0xc9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
    blockNumber: 58_199_233, status: 'success',
    mandateRuleApplied: 'RSI < 30 trigger', createdAt: '2026-04-25T10:55:18Z',
  },
  {
    id: 'tr-012', agentId: 'agent-3', mandateId: 'mandate-3',
    mandateName: 'MNT DCA Strategy',
    assetPair: 'MNT/USDC', direction: 'buy', amountUsd: 500, price: 0.8102,
    pnl: 19.70, protocol: 'fluxion',
    txHash: '0xd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
    blockNumber: 58_195_088, status: 'success',
    mandateRuleApplied: 'Weekly DCA', createdAt: '2026-04-21T12:00:00Z',
  },
  {
    id: 'tr-013', agentId: 'agent-4', mandateId: 'mandate-4',
    mandateName: 'Arb Scanner Alpha',
    assetPair: 'WETH/USDC', direction: 'buy', amountUsd: 6800, price: 2915.40,
    pnl: 138.90, protocol: 'fluxion',
    txHash: '0xe1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    blockNumber: 58_190_722, status: 'success',
    mandateRuleApplied: 'Arb spread > 0.3%', createdAt: '2026-04-20T07:24:33Z',
  },
  {
    id: 'tr-014', agentId: 'agent-2', mandateId: 'mandate-2',
    mandateName: 'Stable Yield Farmer',
    assetPair: 'USDC/USDT', direction: 'buy', amountUsd: 11000, price: 0.9999,
    pnl: 47.80, protocol: 'agni',
    txHash: '0xf2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
    blockNumber: 58_187_409, status: 'success',
    mandateRuleApplied: 'Daily yield reinvest', createdAt: '2026-04-19T08:00:00Z',
  },
  {
    id: 'tr-015', agentId: 'agent-1', mandateId: 'mandate-1',
    mandateName: 'ETH Conservative Buyer',
    assetPair: 'ETH/USDC', direction: 'sell', amountUsd: 5445, price: 3089.00,
    pnl: 322.80, protocol: 'merchant_moe',
    txHash: '0xa3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    blockNumber: 58_183_144, status: 'success',
    mandateRuleApplied: 'RSI > 70 exit', createdAt: '2026-04-18T15:08:57Z',
  },
]

const MOCK_RESPONSE = {
  data: MOCK_TRADES,
  total: MOCK_TRADES.length,
  page: 1,
  page_size: 25,
  total_pages: 1,
}

type Filter = { status?: string; direction?: string; search?: string }

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 500,
        border: `1px solid ${active ? 'transparent' : '#30363D'}`,
        background: active ? '#0066FF' : '#161B22',
        color: active ? '#fff' : '#8B949E',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function ProtocolDot({ protocol }: { protocol: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7, height: 7,
        borderRadius: '50%',
        background: PROTOCOL_COLORS[protocol] ?? '#8B949E',
        marginRight: 5,
        flexShrink: 0,
      }}
    />
  )
}

export default function TradesPage() {
  const [page,   setPage]   = useState(1)
  const [filter, setFilter] = useState<Filter>({})

  const { data: apiData, isLoading } = useTrades({
    page,
    per_page: 25,
    status:   filter.status,
  })

  const isMock  = !isLoading && !apiData?.data?.length
  const raw     = isMock ? MOCK_RESPONSE : (apiData ?? MOCK_RESPONSE)

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
        (PROTOCOL_LABELS[t.protocol] ?? t.protocol).toLowerCase().includes(q)
      )
    }
    return list
  }, [raw.data, filter])

  const stats = useMemo(() => {
    const trades = raw.data
    const success = trades.filter(t => t.status === 'success')
    const totalPnl = success.reduce((s, t) => s + (t.pnl ?? 0), 0)
    const volume = trades.reduce((s, t) => s + t.amountUsd, 0)
    return { total: trades.length, success: success.length, failed: trades.filter(t => t.status === 'failed').length, totalPnl, volume }
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
      ].join(',')
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'trades.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F0F6FC', margin: 0 }}>Trade History</h2>
          <p style={{ fontSize: 13, color: '#8B949E', margin: '4px 0 0' }}>
            All trade executions across agents and protocols
          </p>
        </div>
        <button
          onClick={handleExport}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 34, padding: '0 14px',
            border: '1px solid #30363D', borderRadius: 6,
            background: '#161B22', color: '#8B949E', fontSize: 12, cursor: 'pointer',
          }}
        >
          <Download style={{ width: 14, height: 14 }} />
          Export CSV
        </button>
      </div>

      {/* Demo banner */}
      {isMock && (
        <div style={{
          background: '#2A2000', border: '1px solid #F5C542', borderRadius: 8,
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#F5C542', letterSpacing: '0.08em' }}>DEMO</span>
          <span style={{ fontSize: 12, color: '#8B949E' }}>
            Showing sample data — connect backend to see live trades.
          </span>
        </div>
      )}

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Trades',  value: String(stats.total) },
          { label: 'Successful',    value: String(stats.success), color: '#22C55E' },
          { label: 'Failed',        value: String(stats.failed),  color: stats.failed > 0 ? '#EF4444' : '#F0F6FC' },
          { label: 'Total P&L',     value: `${stats.totalPnl >= 0 ? '+' : ''}$${Math.abs(stats.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: stats.totalPnl >= 0 ? '#22C55E' : '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: 8, padding: '12px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B949E', margin: '0 0 4px' }}>{label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: color ?? '#F0F6FC', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <FilterButton label="All"     active={!filter.status && !filter.direction} onClick={() => setFilter({})} />
        <FilterButton label="Success" active={filter.status === 'success'} onClick={() => toggleStatus('success')} />
        <FilterButton label="Failed"  active={filter.status === 'failed'}  onClick={() => toggleStatus('failed')} />
        <FilterButton label="Pending" active={filter.status === 'pending'} onClick={() => toggleStatus('pending')} />
        <div style={{ width: 1, height: 24, background: '#21262D', margin: '0 4px' }} />
        <FilterButton label="Buys"  active={filter.direction === 'buy'}  onClick={() => toggleDir('buy')} />
        <FilterButton label="Sells" active={filter.direction === 'sell'} onClick={() => toggleDir('sell')} />

        {/* Search */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#8B949E', pointerEvents: 'none' }} />
          <input
            placeholder="Search pair, mandate, tx…"
            value={filter.search ?? ''}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value || undefined }))}
            style={{
              height: 30, paddingLeft: 30, paddingRight: 28, paddingTop: 0, paddingBottom: 0,
              borderRadius: 6, border: '1px solid #30363D', background: '#0D1117',
              color: '#F0F6FC', fontSize: 12, outline: 'none', width: 220,
            }}
          />
          {filter.search && (
            <button
              onClick={() => setFilter(f => ({ ...f, search: undefined }))}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B949E', padding: 0 }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #21262D', borderRadius: 8, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '130px 68px 96px 88px 88px 120px 150px 80px 1fr',
          padding: '10px 16px',
          background: '#161B22',
          borderBottom: '1px solid #21262D',
        }}>
          {['PAIR', 'SIDE', 'AMOUNT', 'PRICE', 'P&L', 'PROTOCOL', 'TX HASH', 'STATUS', 'TIME'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#8B949E' }}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 44, borderRadius: 4, background: '#21262D', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : visibleTrades.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 16px', gap: 12, textAlign: 'center' }}>
            <Activity style={{ width: 40, height: 40, color: '#8B949E', opacity: 0.4 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#F0F6FC', margin: 0 }}>No trades found</p>
            <p style={{ fontSize: 12, color: '#8B949E', margin: 0 }}>
              {Object.keys(filter).length > 0 ? 'Try clearing the filters' : 'Deploy an agent to start trading'}
            </p>
          </div>
        ) : (
          visibleTrades.map((t, i) => {
            const pnlColor = t.pnl == null ? '#8B949E' : t.pnl >= 0 ? '#22C55E' : '#EF4444'
            const statusStyle = t.status === 'success'
              ? { background: '#0D2818', color: '#22C55E', border: '1px solid #22C55E33' }
              : t.status === 'failed'
              ? { background: '#2D0F0F', color: '#EF4444', border: '1px solid #EF444433' }
              : { background: '#2A2000', color: '#F5C542', border: '1px solid #F5C54233' }
            return (
              <div
                key={t.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '130px 68px 96px 88px 88px 120px 150px 80px 1fr',
                  padding: '0 16px',
                  minHeight: 48,
                  alignItems: 'center',
                  background: i % 2 === 0 ? '#0D1117' : '#161B22',
                  borderBottom: i < visibleTrades.length - 1 ? '1px solid #21262D' : 'none',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F0F6FC' }}>{t.assetPair}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {t.direction === 'buy'
                    ? <TrendingUp style={{ width: 12, height: 12, color: '#22C55E' }} />
                    : <TrendingDown style={{ width: 12, height: 12, color: '#EF4444' }} />
                  }
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.direction === 'buy' ? '#22C55E' : '#EF4444', textTransform: 'uppercase' }}>
                    {t.direction}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#F0F6FC', fontVariantNumeric: 'tabular-nums' }}>
                  ${t.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
                <span style={{ fontSize: 12, color: '#8B949E', fontVariantNumeric: 'tabular-nums' }}>
                  ${t.price.toFixed(t.price > 100 ? 2 : 4)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: pnlColor, fontVariantNumeric: 'tabular-nums' }}>
                  {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${Math.abs(t.pnl).toFixed(2)}` : '—'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ProtocolDot protocol={t.protocol} />
                  <span style={{ fontSize: 11, color: '#8B949E' }}>{PROTOCOL_LABELS[t.protocol] ?? t.protocol}</span>
                </div>
                <div>
                  {t.txHash ? (
                    <a
                      href={`https://explorer.mantle.xyz/tx/${t.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#58A6FF', fontSize: 11, textDecoration: 'none', fontFamily: 'monospace' }}
                    >
                      {t.txHash.slice(0, 8)}…{t.txHash.slice(-4)}
                      <ExternalLink style={{ width: 10, height: 10 }} />
                    </a>
                  ) : (
                    <span style={{ fontSize: 11, color: '#484F58' }}>—</span>
                  )}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  padding: '2px 7px', borderRadius: 4,
                  ...statusStyle,
                }}>
                  {t.status}
                </span>
                <span style={{ fontSize: 11, color: '#484F58', whiteSpace: 'nowrap' }}>
                  {new Date(t.createdAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#8B949E' }}>
            {visibleTrades.length} trades · Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                height: 30, padding: '0 12px',
                border: '1px solid #30363D', borderRadius: 6,
                background: '#161B22', color: page <= 1 ? '#484F58' : '#8B949E',
                fontSize: 12, cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                height: 30, padding: '0 12px',
                border: '1px solid #30363D', borderRadius: 6,
                background: '#161B22', color: page >= totalPages ? '#484F58' : '#8B949E',
                fontSize: 12, cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
