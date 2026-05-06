'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield, Download, ExternalLink, Copy, Link2,
  Search, ChevronDown, X, CheckCircle2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

type TxStatus = 'SUCCESS' | 'FAILED' | 'PENDING'

interface AuditEntry {
  id: string
  txHash: string
  timestamp: string
  from: string
  to: string
  mandate: string
  mandateId: string
  agentId: string
  agent: string
  amount: string
  status: TxStatus
  blockNumber: number
  gasUsed: number
  gasPrice: string
  decisionHash: string
  ruleApplied: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: '1',
    txHash:       '0xabc123def456789abc123def456789abc123def456789abc123def456789abc1',
    timestamp:    '2026-04-12 09:45:21',
    from:         '0xDe4d...3Fa1',
    to:           'Merchant Moe',
    mandate:      'ETH Conservative Buyer',
    mandateId:    'mandate-1',
    agentId:      'agent-1',
    agent:        'Agent-001',
    amount:       '$4,200.00',
    status:       'SUCCESS',
    blockNumber:  14823910,
    gasUsed:      21000,
    gasPrice:     '0.001 Gwei',
    decisionHash: '0x9f3c2b4a8d1e5f6a9c0d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
    ruleApplied:  'RSI < 30 trigger, 5% position limit checked',
  },
  {
    id: '2',
    txHash:       '0xdef456abc789def456abc789def456abc789def456abc789def456abc789def4',
    timestamp:    '2026-04-12 08:22:04',
    from:         '0xDe4d...3Fa1',
    to:           'Agni Finance',
    mandate:      'ETH Conservative Buyer',
    mandateId:    'mandate-1',
    agentId:      'agent-1',
    agent:        'Agent-001',
    amount:       '$2,800.00',
    status:       'SUCCESS',
    blockNumber:  14823750,
    gasUsed:      28400,
    gasPrice:     '0.001 Gwei',
    decisionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    ruleApplied:  'Diversification rule: MNT allocation below 35%',
  },
  {
    id: '3',
    txHash:       '0x789abc123def789abc123def789abc123def789abc123def789abc123def7891',
    timestamp:    '2026-04-11 16:05:33',
    from:         '0xDe4d...3Fa1',
    to:           'Merchant Moe',
    mandate:      'MNT Momentum Trader',
    mandateId:    'mandate-2',
    agentId:      'agent-2',
    agent:        'Agent-002',
    amount:       '$3,500.00',
    status:       'SUCCESS',
    blockNumber:  14823590,
    gasUsed:      19800,
    gasPrice:     '0.001 Gwei',
    decisionHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
    ruleApplied:  'Take-profit at +5.2%. Mandate cooldown: 4 hours after close.',
  },
  {
    id: '4',
    txHash:       '0x321cba987fed321cba987fed321cba987fed321cba987fed321cba987fed3214',
    timestamp:    '2026-04-11 11:44:18',
    from:         '0x8bC2...1D9E',
    to:           'Fluxion',
    mandate:      'DeFi Yield Optimizer',
    mandateId:    'mandate-3',
    agentId:      'agent-3',
    agent:        'Agent-003',
    amount:       '$5,000.00',
    status:       'FAILED',
    blockNumber:  0,
    gasUsed:      12000,
    gasPrice:     '0.001 Gwei',
    decisionHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
    ruleApplied:  'Insufficient liquidity on Fluxion pool. Retrying next cycle.',
  },
  {
    id: '5',
    txHash:       '0x654fed321abc654fed321abc654fed321abc654fed321abc654fed321abc6545',
    timestamp:    '2026-04-10 20:11:09',
    from:         '0xDe4d...3Fa1',
    to:           'Agni Finance',
    mandate:      'ETH Conservative Buyer',
    mandateId:    'mandate-1',
    agentId:      'agent-1',
    agent:        'Agent-001',
    amount:       '$1,900.00',
    status:       'SUCCESS',
    blockNumber:  14822870,
    gasUsed:      22400,
    gasPrice:     '0.001 Gwei',
    decisionHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    ruleApplied:  'MNT take-profit at +4%. Position sized within 35% cap.',
  },
  {
    id: '6',
    txHash:       '0x987abc654def987abc654def987abc654def987abc654def987abc654def9876',
    timestamp:    '2026-04-10 14:30:55',
    from:         '0x8bC2...1D9E',
    to:           'Merchant Moe',
    mandate:      'MNT Momentum Trader',
    mandateId:    'mandate-2',
    agentId:      'agent-2',
    agent:        'Agent-002',
    amount:       '$8,100.00',
    status:       'SUCCESS',
    blockNumber:  14822340,
    gasUsed:      31200,
    gasPrice:     '0.001 Gwei',
    decisionHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    ruleApplied:  'Momentum signal: 3-day trend positive. Entry within drawdown limit.',
  },
  {
    id: '7',
    txHash:       '0xaaa111bbb222ccc333ddd444eee555fff666aaa111bbb222ccc333ddd444eee5',
    timestamp:    '2026-04-09 08:00:12',
    from:         '0x1aB3...9cD4',
    to:           'Fluxion',
    mandate:      'DeFi Yield Optimizer',
    mandateId:    'mandate-3',
    agentId:      'agent-3',
    agent:        'Agent-003',
    amount:       '$2,250.00',
    status:       'PENDING',
    blockNumber:  14821900,
    gasUsed:      0,
    gasPrice:     '0.001 Gwei',
    decisionHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7',
    ruleApplied:  'Yield rebalance: USDC/USDT pool above 8% APY threshold.',
  },
  {
    id: '8',
    txHash:       '0xbbb222ccc333ddd444eee555fff666aaa111bbb222ccc333ddd444eee555fff6',
    timestamp:    '2026-04-08 19:55:44',
    from:         '0xDe4d...3Fa1',
    to:           'Merchant Moe',
    mandate:      'ETH Conservative Buyer',
    mandateId:    'mandate-1',
    agentId:      'agent-1',
    agent:        'Agent-001',
    amount:       '$6,100.00',
    status:       'SUCCESS',
    blockNumber:  14821100,
    gasUsed:      24600,
    gasPrice:     '0.001 Gwei',
    decisionHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8',
    ruleApplied:  'Dip buy: ETH -3.1% from 7-day MA. Position within 40% cap.',
  },
]

const TOTAL = 1248
const PER_PAGE = 20

// ── Helpers ───────────────────────────────────────────────────────────────────

function truncateHash(hash: string): string {
  if (!hash || hash.length < 14) return hash || '—'
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}


// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TxStatus }) {
  const styles: Record<TxStatus, { bg: string; color: string }> = {
    SUCCESS: { bg: '#0D2818', color: '#22C55E' },
    FAILED:  { bg: '#2D0F0F', color: '#EF4444' },
    PENDING: { bg: '#2A2000', color: '#F5C542' },
  }
  const s = styles[status]
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  )
}

// ── Expanded row detail ───────────────────────────────────────────────────────

function ExpandedRow({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const [copiedTx,  setCopiedTx]  = useState(false)
  const [copiedDec, setCopiedDec] = useState(false)

  const copyTx  = () => { navigator.clipboard.writeText(entry.txHash);       setCopiedTx(true);  setTimeout(() => setCopiedTx(false),  2000) }
  const copyDec = () => { navigator.clipboard.writeText(entry.decisionHash); setCopiedDec(true); setTimeout(() => setCopiedDec(false), 2000) }

  return (
    <div
      style={{
        background: '#1C2128',
        borderTop: '1px solid #21262D',
        borderBottom: '1px solid #21262D',
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: '#8B949E' }}
          >
            Transaction Detail
          </p>
          <button onClick={onClose} style={{ color: '#484F58' }} className="hover:opacity-70">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-xs">
          {/* Full TX Hash */}
          <div className="col-span-2">
            <span className="block mb-1" style={{ color: '#484F58' }}>Full TX Hash</span>
            <div className="flex items-center gap-2">
              <span
                className="font-mono truncate"
                style={{ color: '#F0F6FC', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}
              >
                {entry.txHash}
              </span>
              <button onClick={copyTx} style={{ color: '#8B949E' }} className="hover:opacity-70 shrink-0">
                {copiedTx
                  ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22C55E' }} />
                  : <Copy className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          </div>

          <div>
            <span className="block mb-1" style={{ color: '#484F58' }}>Mandate</span>
            <span style={{ color: '#F0F6FC' }}>{entry.mandate}</span>
          </div>

          <div>
            <span className="block mb-1" style={{ color: '#484F58' }}>Agent</span>
            <span style={{ color: '#F0F6FC' }}>{entry.agent}</span>
          </div>

          {/* Decision Hash */}
          <div className="col-span-2">
            <span className="block mb-1" style={{ color: '#484F58' }}>Decision Hash</span>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[11px] truncate"
                style={{ color: '#8B949E', fontFamily: '"JetBrains Mono", monospace' }}
              >
                {truncateHash(entry.decisionHash)}
              </span>
              <button onClick={copyDec} style={{ color: '#8B949E' }} className="hover:opacity-70 shrink-0">
                {copiedDec
                  ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22C55E' }} />
                  : <Copy className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          </div>

          <div className="col-span-2">
            <span className="block mb-1" style={{ color: '#484F58' }}>Rule Applied</span>
            <span style={{ color: '#F0F6FC' }}>{entry.ruleApplied}</span>
          </div>

          <div>
            <span className="block mb-1" style={{ color: '#484F58' }}>Gas Used</span>
            <span style={{ color: '#F0F6FC' }}>{entry.gasUsed > 0 ? entry.gasUsed.toLocaleString() : '—'}</span>
          </div>

          <div>
            <span className="block mb-1" style={{ color: '#484F58' }}>Gas Price</span>
            <span style={{ color: '#F0F6FC' }}>{entry.gasPrice}</span>
          </div>
        </div>

        {entry.txHash && entry.status !== 'PENDING' && (
          <a
            href={`https://explorer.mantle.xyz/tx/${entry.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs transition-opacity hover:opacity-70"
            style={{ color: '#58A6FF' }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on Mantle Explorer
          </a>
        )}
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
      style={{
        background: '#0D2818',
        border: '1px solid #22C55E',
        color: '#22C55E',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {message}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const COLS = '14% 12% 10% 11% 15% 10% 10% 8% 10%'
const HEADERS = ['TX HASH', 'TIMESTAMP', 'FROM', 'TO', 'MANDATE', 'AMOUNT', 'STATUS', 'BLOCK', 'ACTIONS']

export default function AuditPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [status,   setStatus]   = useState('All Status')
  const [agent,    setAgent]    = useState('All Agents')
  const [mandate,  setMandate]  = useState('All Mandates')
  const [dateFrom, setDateFrom] = useState('2026-04-01')
  const [dateTo,   setDateTo]   = useState('2026-04-30')
  const [toast,    setToast]    = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<{ key: string; label: string }[]>([])

  // Derive filtered entries (mock: all 8, filtered by search/status)
  const entries = MOCK_ENTRIES.filter(e => {
    if (search && !e.txHash.includes(search) && !e.from.includes(search) && !e.to.toLowerCase().includes(search.toLowerCase())) return false
    if (status !== 'All Status' && e.status !== status.toUpperCase()) return false
    if (mandate !== 'All Mandates' && e.mandate !== mandate) return false
    return true
  })

  const handleShare = useCallback(() => {
    const token = Math.random().toString(36).slice(2, 10)
    navigator.clipboard.writeText(`${window.location.origin}/public/audit/${token}`)
    setToast('Public audit link copied to clipboard')
  }, [])

  const handleExport = useCallback(() => {
    const header = 'TX Hash,Timestamp,From,To,Mandate,Amount,Status,Block\n'
    const rows   = MOCK_ENTRIES.map(e =>
      `${e.txHash},${e.timestamp},${e.from},${e.to},${e.mandate},${e.amount},${e.status},${e.blockNumber}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'audit-trail.csv'; a.click()
    URL.revokeObjectURL(url)
    setToast('audit-trail.csv downloaded')
  }, [])

  const removeFilter = (key: string) => {
    if (key === 'status')  { setStatus('All Status'); }
    if (key === 'mandate') { setMandate('All Mandates'); }
    setActiveFilters(prev => prev.filter(f => f.key !== key))
  }

  const applyStatus = (s: string) => {
    setStatus(s)
    if (s !== 'All Status') {
      setActiveFilters(prev => {
        const filtered = prev.filter(f => f.key !== 'status')
        return [...filtered, { key: 'status', label: `Status: ${s}` }]
      })
    } else {
      setActiveFilters(prev => prev.filter(f => f.key !== 'status'))
    }
  }

  const totalPages = Math.ceil(TOTAL / PER_PAGE)
  const visiblePages = [1, 2, 3]

  return (
    <div className="p-6 space-y-6">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#F0F6FC' }}>On-Chain Audit Viewer</h2>
          <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
            Every decision and trade recorded immutably on Mantle Network.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Share Public Audit Link */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{ border: '1px solid #30363D', color: '#8B949E' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0066FF'; (e.currentTarget as HTMLElement).style.color = '#F0F6FC' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#30363D'; (e.currentTarget as HTMLElement).style.color = '#8B949E' }}
          >
            <Link2 className="h-4 w-4" />
            Share Public Audit Link
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{ border: '1px solid #30363D', color: '#8B949E' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0066FF'; (e.currentTarget as HTMLElement).style.color = '#F0F6FC' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#30363D'; (e.currentTarget as HTMLElement).style.color = '#8B949E' }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          {/* View on Explorer */}
          <a
            href="https://explorer.mantle.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{ border: '1px solid #30363D', color: '#8B949E' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0066FF'; (e.currentTarget as HTMLElement).style.color = '#F0F6FC' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#30363D'; (e.currentTarget as HTMLElement).style.color = '#8B949E' }}
          >
            View on Mantle Explorer
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ── Summary KPI cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Total Transactions', value: '1,248',          sub: 'All time',          subColor: '#8B949E' },
          { label: 'Total Volume',       value: '$24,589,435.21', sub: 'Verified on-chain', subColor: '#8B949E' },
          { label: 'Success Rate',       value: '98.74%',         sub: '',                  valColor: '#22C55E' },
          { label: 'Last 7 Days',        value: '18 transactions',sub: '3 pending',         subColor: '#F5C542' },
        ] as { label: string; value: string; sub: string; valColor?: string; subColor?: string }[]).map(c => (
          <div
            key={c.label}
            className="rounded-lg p-4"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: '#8B949E' }}
            >
              {c.label}
            </p>
            <p className="text-xl font-bold" style={{ color: c.valColor ?? '#F0F6FC' }}>{c.value}</p>
            {c.sub && (
              <p className="text-xs mt-0.5" style={{ color: c.subColor ?? '#8B949E' }}>{c.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date range */}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8B949E' }}>
            <span>Date:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="rounded-md px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
              style={{ background: '#161B22', border: '1px solid #21262D', color: '#8B949E' }}
            />
            <span>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="rounded-md px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
              style={{ background: '#161B22', border: '1px solid #21262D', color: '#8B949E' }}
            />
          </div>

          {/* Dropdowns */}
          {([
            { label: 'Chain',    value: 'All Chains',   opts: ['All Chains', 'Mantle', 'Ethereum'] },
            { label: 'Status',   value: status,         opts: ['All Status', 'Success', 'Failed', 'Pending'], onChange: applyStatus },
            { label: 'Agent',    value: agent,          opts: ['All Agents', 'Agent-001', 'Agent-002', 'Agent-003'], onChange: (v: string) => setAgent(v) },
            { label: 'Mandate',  value: mandate,        opts: ['All Mandates', 'ETH Conservative Buyer', 'MNT Momentum Trader', 'DeFi Yield Optimizer'], onChange: (v: string) => setMandate(v) },
          ] as { label: string; value: string; opts: string[]; onChange?: (v: string) => void }[]).map(f => (
            <div key={f.label} className="relative">
              <select
                value={f.value}
                onChange={e => f.onChange?.(e.target.value)}
                className="appearance-none rounded-md pl-3 pr-7 py-1.5 text-xs focus:outline-none cursor-pointer"
                style={{
                  background: '#161B22',
                  border: `1px solid ${f.value.startsWith('All') ? '#21262D' : '#0066FF'}`,
                  color: f.value.startsWith('All') ? '#8B949E' : '#58A6FF',
                }}
              >
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none"
                style={{ color: '#484F58' }}
              />
            </div>
          ))}

          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
              style={{ color: '#484F58' }}
            />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by hash or address..."
              className="w-full rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none"
              style={{
                background: '#161B22',
                border: '1px solid #21262D',
                color: '#F0F6FC',
              }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#0066FF'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#21262D'}
            />
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map(f => (
              <span
                key={f.key}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
                style={{ background: '#1C2128', border: '1px solid #30363D', color: '#8B949E' }}
              >
                {f.label}
                <button onClick={() => removeFilter(f.key)} className="hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setStatus('All Status'); setMandate('All Mandates'); setActiveFilters([])
              }}
              className="text-xs transition-colors hover:opacity-70"
              style={{ color: '#58A6FF' }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Audit table ───────────────────────────────────────────────────────── */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid #21262D' }}
      >
        {/* Table header */}
        <div
          className="grid px-4 py-2.5"
          style={{
            gridTemplateColumns: COLS,
            background: '#0D1117',
          }}
        >
          {HEADERS.map(h => (
            <span
              key={h}
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: '#8B949E' }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center" style={{ background: '#161B22' }}>
            <Shield className="h-12 w-12 mb-4" style={{ color: '#484F58' }} />
            <p className="font-semibold text-base mb-1" style={{ color: '#F0F6FC' }}>No on-chain activity yet</p>
            <p className="text-sm max-w-sm mb-6" style={{ color: '#8B949E' }}>
              Once your AI agent executes its first trade on Mantle Network, every transaction will appear here with full verification.
            </p>
            <Link
              href="/dashboard/agents"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ background: '#0066FF' }}
            >
              Deploy Your First Agent →
            </Link>
          </div>
        ) : (
          entries.map((entry, i) => (
            <div key={entry.id}>
              {/* Main row */}
              <div
                className="grid px-4 items-center cursor-pointer transition-colors"
                style={{
                  gridTemplateColumns: COLS,
                  minHeight: 52,
                  background: expanded === entry.id ? '#1C2128' : i % 2 === 0 ? '#161B22' : '#0D1117',
                  borderBottom: '1px solid #21262D',
                }}
                onClick={() => setExpanded(prev => prev === entry.id ? null : entry.id)}
                onMouseEnter={e => {
                  if (expanded !== entry.id) (e.currentTarget as HTMLElement).style.background = '#1C2128'
                }}
                onMouseLeave={e => {
                  if (expanded !== entry.id) (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#161B22' : '#0D1117'
                }}
              >
                {/* TX Hash */}
                <span
                  title={entry.txHash}
                  style={{
                    color: '#58A6FF',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                  }}
                >
                  {truncateHash(entry.txHash)}
                </span>

                {/* Timestamp */}
                <span
                  style={{
                    color: '#8B949E',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                  }}
                >
                  {entry.timestamp}
                </span>

                {/* From */}
                <span
                  style={{
                    color: '#8B949E',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                  }}
                >
                  {entry.from}
                </span>

                {/* To */}
                <span
                  style={{
                    color: '#F0F6FC',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                  }}
                >
                  {entry.to}
                </span>

                {/* Mandate */}
                <span
                  className="truncate text-xs"
                  style={{ color: '#58A6FF' }}
                  title={entry.mandate}
                >
                  {entry.mandate}
                </span>

                {/* Amount */}
                <span className="text-xs font-medium" style={{ color: '#F0F6FC' }}>{entry.amount}</span>

                {/* Status */}
                <StatusBadge status={entry.status} />

                {/* Block */}
                <span
                  style={{
                    color: '#8B949E',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 11,
                  }}
                >
                  {entry.blockNumber > 0 ? `#${entry.blockNumber.toLocaleString()}` : '—'}
                </span>

                {/* Actions */}
                <a
                  href={entry.txHash ? `https://explorer.mantle.xyz/tx/${entry.txHash}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-0.5 text-xs transition-opacity hover:opacity-70"
                  style={{ color: '#58A6FF' }}
                >
                  Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Expanded detail */}
              {expanded === entry.id && (
                <ExpandedRow entry={entry} onClose={() => setExpanded(null)} />
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-sm flex-wrap gap-3">
        <span style={{ color: '#8B949E' }}>
          Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, TOTAL)} of {TOTAL.toLocaleString()} transactions
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-0.5 px-2.5 py-1.5 rounded text-xs transition-colors disabled:opacity-40"
            style={{ border: '1px solid #21262D', color: '#8B949E' }}
            onMouseEnter={e => { if (page > 1) (e.currentTarget as HTMLElement).style.borderColor = '#0066FF' }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#21262D'}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>

          {visiblePages.map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className="h-8 w-8 rounded-full text-xs font-medium transition-colors"
              style={{
                background: page === n ? '#0066FF' : 'transparent',
                color: page === n ? '#fff' : '#8B949E',
                border: page === n ? 'none' : '1px solid transparent',
              }}
            >
              {n}
            </button>
          ))}

          <span style={{ color: '#484F58', padding: '0 4px' }}>...</span>

          <button
            onClick={() => setPage(totalPages)}
            className="h-8 w-8 rounded-full text-xs font-medium transition-colors"
            style={{
              background: page === totalPages ? '#0066FF' : 'transparent',
              color: page === totalPages ? '#fff' : '#8B949E',
            }}
          >
            {totalPages}
          </button>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-0.5 px-2.5 py-1.5 rounded text-xs transition-colors disabled:opacity-40"
            style={{ border: '1px solid #21262D', color: '#8B949E' }}
            onMouseEnter={e => { if (page < totalPages) (e.currentTarget as HTMLElement).style.borderColor = '#0066FF' }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#21262D'}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <select
          className="rounded text-xs px-2 py-1.5 focus:outline-none cursor-pointer"
          style={{
            background: '#161B22',
            border: '1px solid #21262D',
            color: '#8B949E',
          }}
        >
          <option>20 per page</option>
          <option>50 per page</option>
          <option>100 per page</option>
        </select>
      </div>
    </div>
  )
}
