'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield, Download, ExternalLink, Copy, Link2,
  Search, ChevronDown, X, CheckCircle2, ChevronLeft, ChevronRight,
  FileCode,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { fetchOnChainAuditEvents, type OnChainEvent } from '@/hooks/useOnChain'
import { MANTLE_TESTNET_EXPLORER as EXPLORER, CONTRACTS as _CONTRACTS } from '@/lib/constants'

const CONTRACTS = {
  MandatePolicy: _CONTRACTS.MANDATE_POLICY,
  AgentExecutor: _CONTRACTS.AGENT_EXECUTOR,
  RiskGuard:     _CONTRACTS.RISK_GUARD,
} as const

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
  isLive?:     boolean
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

// ── On-chain event converter ──────────────────────────────────────────────────

function onChainEventToEntry(e: OnChainEvent, idx: number): AuditEntry {
  const d   = new Date(e.timestamp * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    id:           `live-${idx}`,
    txHash:       e.txHash,
    timestamp:    `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    from:         `Agent #${e.agentId}`,
    to:           'AgentExecutor',
    mandate:      `Agent ${e.agentId.toString()}`,
    mandateId:    '',
    agentId:      e.agentId.toString(),
    agent:        `Agent #${e.agentId}`,
    amount:       `$${e.amountUsd.toFixed(2)}`,
    status:       'SUCCESS' as TxStatus,
    blockNumber:  Number(e.blockNumber),
    gasUsed:      0,
    gasPrice:     '—',
    decisionHash: e.txHash,
    ruleApplied:  `${e.isBuy ? 'BUY' : 'SELL'} ${e.asset} · exec #${e.execIndex}`,
    isLive:       true,
  }
}

const TOTAL = 1248

// ── Helpers ───────────────────────────────────────────────────────────────────

function truncateHash(hash: string): string {
  if (!hash || hash.length < 14) return hash || '—'
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<TxStatus, string> = {
  SUCCESS: 'bg-success-bg text-success border border-success/20',
  FAILED:  'bg-error-bg text-error border border-error/20',
  PENDING: 'bg-warning-bg text-warning border border-warning/20',
}

function StatusBadge({ status }: { status: TxStatus }) {
  return (
    <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap', STATUS_CLASS[status])}>
      {status}
    </span>
  )
}

// ── Expanded row detail ───────────────────────────────────────────────────────

function ExpandedRow({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  const [copiedTx,  setCopiedTx]  = useState(false)
  const [copiedDec, setCopiedDec] = useState(false)

  const copyTx  = async () => { try { await navigator.clipboard.writeText(entry.txHash);       setCopiedTx(true);  setTimeout(() => setCopiedTx(false),  2000) } catch {} }
  const copyDec = async () => { try { await navigator.clipboard.writeText(entry.decisionHash); setCopiedDec(true); setTimeout(() => setCopiedDec(false), 2000) } catch {} }

  return (
    <div className="bg-surface border-y border-border">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            Transaction Detail
          </p>
          <button onClick={onClose} className="text-text-disabled hover:text-text-secondary transition-colors" aria-label="Close detail">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
          {/* Full TX Hash */}
          <div className="sm:col-span-2">
            <span className="block mb-1 text-text-disabled">Full TX Hash</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-text-primary truncate">
                {entry.txHash}
              </span>
              <button onClick={copyTx} className="text-text-secondary hover:text-text-primary transition-colors shrink-0" aria-label="Copy TX hash">
                {copiedTx
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  : <Copy className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          </div>

          <div>
            <span className="block mb-1 text-text-disabled">Mandate</span>
            <span className="text-text-primary">{entry.mandate}</span>
          </div>

          <div>
            <span className="block mb-1 text-text-disabled">Agent</span>
            <span className="text-text-primary">{entry.agent}</span>
          </div>

          {/* Decision Hash */}
          <div className="sm:col-span-2">
            <span className="block mb-1 text-text-disabled">Decision Hash</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-text-secondary truncate">
                {truncateHash(entry.decisionHash)}
              </span>
              <button onClick={copyDec} className="text-text-secondary hover:text-text-primary transition-colors shrink-0" aria-label="Copy decision hash">
                {copiedDec
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  : <Copy className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="block mb-1 text-text-disabled">Rule Applied</span>
            <span className="text-text-primary">{entry.ruleApplied}</span>
          </div>

          <div>
            <span className="block mb-1 text-text-disabled">Gas Used</span>
            <span className="text-text-primary">{entry.gasUsed > 0 ? entry.gasUsed.toLocaleString() : '—'}</span>
          </div>

          <div>
            <span className="block mb-1 text-text-disabled">Gas Price</span>
            <span className="text-text-primary">{entry.gasPrice}</span>
          </div>
        </div>

        {entry.txHash && entry.status !== 'PENDING' && (
          <a
            href={`${EXPLORER}/tx/${entry.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs text-text-link hover:opacity-70 transition-opacity"
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
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-success-bg border border-success text-success shadow-modal"
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
  const [perPage,  setPerPage]  = useState(20)
  const [status,   setStatus]   = useState('All Status')
  const [agent,    setAgent]    = useState('All Agents')
  const [mandate,  setMandate]  = useState('All Mandates')
  const [dateFrom, setDateFrom] = useState('2026-04-01')
  const [dateTo,   setDateTo]   = useState('2026-04-30')
  const [toast,    setToast]    = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<{ key: string; label: string }[]>([])
  const [liveEntries,   setLiveEntries]   = useState<AuditEntry[]>([])
  const [loadingLive,   setLoadingLive]   = useState(true)

  useEffect(() => {
    fetchOnChainAuditEvents().then(events => {
      setLiveEntries(events.map(onChainEventToEntry))
      setLoadingLive(false)
    })
  }, [])

  const sourceEntries = liveEntries.length > 0 ? liveEntries : MOCK_ENTRIES
  const displayTotal  = liveEntries.length > 0 ? liveEntries.length : TOTAL
  const entries = sourceEntries.filter(e => {
    if (search && !e.txHash.includes(search) && !e.from.includes(search) && !e.to.toLowerCase().includes(search.toLowerCase())) return false
    if (status !== 'All Status' && e.status !== status.toUpperCase()) return false
    if (mandate !== 'All Mandates' && e.mandate !== mandate) return false
    if (dateFrom && e.timestamp.slice(0, 10) < dateFrom) return false
    if (dateTo   && e.timestamp.slice(0, 10) > dateTo) return false
    return true
  })

  const handleShare = useCallback(async () => {
    const token = Math.random().toString(36).slice(2, 10)
    try { await navigator.clipboard.writeText(`${window.location.origin}/public/audit/${token}`) } catch {}
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
    if (key === 'status')  { setStatus('All Status') }
    if (key === 'mandate') { setMandate('All Mandates') }
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

  const totalPages = Math.ceil(displayTotal / perPage)
  const visiblePages = [1, 2, 3]

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">On-Chain Audit Viewer</h2>
          <p className="text-sm mt-0.5 text-text-secondary">
            Every decision and trade recorded immutably on Mantle Network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-border text-text-secondary hover:border-primary hover:text-text-primary transition-colors"
          >
            <Link2 className="h-4 w-4" />
            Share Public Audit Link
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-border text-text-secondary hover:border-primary hover:text-text-primary transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <a
            href={`${EXPLORER}/address/${CONTRACTS.AgentExecutor}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-border text-text-secondary hover:border-primary hover:text-text-primary transition-colors"
          >
            View on Mantle Explorer
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ── Live contract links ──────────────────────────────────────────────── */}
      <div className="bg-page border border-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs shrink-0 text-text-disabled">
          <FileCode className="h-3.5 w-3.5" />
          <span className="font-semibold uppercase tracking-wider">Live Contracts · Mantle Sepolia</span>
        </div>
        <div className="flex flex-wrap gap-2 ml-auto">
          {(Object.entries(CONTRACTS) as [string, string][]).map(([name, addr]) => (
            <a
              key={name}
              href={`${EXPLORER}/address/${addr}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-card border border-border text-text-link font-mono hover:opacity-70 transition-opacity"
            >
              {name}
              <span className="text-text-disabled">{addr.slice(0, 6)}…{addr.slice(-4)}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* ── Summary KPI cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {([
          {
            label:    'Total Transactions',
            value:    liveEntries.length > 0 ? liveEntries.length.toLocaleString() : '1,248',
            sub:      liveEntries.length > 0 ? 'Live on-chain' : 'All time',
            subClass: liveEntries.length > 0 ? 'text-success' : 'text-text-secondary',
          },
          {
            label:    'Total Volume',
            value:    liveEntries.length > 0
              ? `$${liveEntries.reduce((s, e) => s + Number(e.amount.replace(/[^0-9.]/g, '')), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '$24,589,435.21',
            sub:      'Verified on-chain',
            subClass: 'text-text-secondary',
          },
          {
            label:    'Success Rate',
            value:    liveEntries.length > 0 ? '100%' : '98.74%',
            sub:      '',
            valClass: 'text-success',
          },
          {
            label:    'Last 7 Days',
            value:    liveEntries.length > 0 ? `${liveEntries.length} transaction${liveEntries.length !== 1 ? 's' : ''}` : '18 transactions',
            sub:      liveEntries.length > 0 ? 'Live data' : '3 pending',
            subClass: liveEntries.length > 0 ? 'text-success' : 'text-warning',
          },
        ] as { label: string; value: string; sub: string; valClass?: string; subClass?: string }[]).map(c => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-text-secondary">
              {c.label}
            </p>
            <p className={cn('text-lg font-bold truncate', c.valClass ?? 'text-text-primary')}>{c.value}</p>
            {c.sub && (
              <p className={cn('text-xs mt-0.5', c.subClass ?? 'text-text-secondary')}>{c.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-secondary">
            <span>Date:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="rounded-md px-2 py-1.5 text-xs bg-card border border-border text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
            />
            <span>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="rounded-md px-2 py-1.5 text-xs bg-card border border-border text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
            />
          </div>

          {/* Dropdowns */}
          {([
            { label: 'Chain',   value: 'All Chains',   opts: ['All Chains', 'Mantle', 'Ethereum'] },
            { label: 'Status',  value: status,          opts: ['All Status', 'Success', 'Failed', 'Pending'], onChange: applyStatus },
            { label: 'Agent',   value: agent,           opts: ['All Agents', 'Agent-001', 'Agent-002', 'Agent-003'], onChange: (v: string) => setAgent(v) },
            { label: 'Mandate', value: mandate,         opts: ['All Mandates', 'ETH Conservative Buyer', 'MNT Momentum Trader', 'DeFi Yield Optimizer'], onChange: (v: string) => setMandate(v) },
          ] as { label: string; value: string; opts: string[]; onChange?: (v: string) => void }[]).map(f => (
            <div key={f.label} className="relative">
              <select
                value={f.value}
                onChange={e => f.onChange?.(e.target.value)}
                className={cn(
                  'appearance-none rounded-md pl-3 pr-7 py-1.5 text-xs bg-card border focus:outline-none cursor-pointer',
                  f.value.startsWith('All') ? 'border-border text-text-secondary' : 'border-primary text-text-link'
                )}
              >
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-text-disabled" />
            </div>
          ))}

          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-text-disabled" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by hash or address..."
              className="w-full rounded-md pl-8 pr-3 py-1.5 text-xs bg-card border border-border text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map(f => (
              <span
                key={f.key}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-surface border border-border text-text-secondary"
              >
                {f.label}
                <button onClick={() => removeFilter(f.key)} className="hover:opacity-70" aria-label={`Remove ${f.label} filter`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => { setStatus('All Status'); setMandate('All Mandates'); setActiveFilters([]) }}
              className="text-xs text-text-link hover:opacity-70 transition-opacity"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Live / demo indicator ───────────────────────────────────────────── */}
      {!loadingLive && (
        <div className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-xs',
          liveEntries.length > 0
            ? 'bg-success-bg border border-success/30 text-success'
            : 'bg-surface border border-border text-text-disabled'
        )}>
          <span className="text-[8px] leading-none">●</span>
          {liveEntries.length > 0
            ? `${liveEntries.length} live on-chain transaction${liveEntries.length !== 1 ? 's' : ''} fetched from the AgentExecutor contract`
            : 'Showing demo data — real transactions will appear here once agents execute trades on Mantle Network'}
        </div>
      )}

      {/* ── Audit table ───────────────────────────────────────────────────────── */}
      <div className="border border-border rounded-lg overflow-x-auto">
        <div style={{ minWidth: 820 }}>
          {/* Table header */}
          <div
            className="grid px-4 py-2.5 bg-page"
            style={{ gridTemplateColumns: COLS }}
          >
            {HEADERS.map(h => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card">
              <Shield className="h-12 w-12 mb-4 text-text-disabled" />
              <p className="font-semibold text-base mb-1 text-text-primary">No on-chain activity yet</p>
              <p className="text-sm max-w-sm mb-6 text-text-secondary">
                Once your AI agent executes its first trade on Mantle Network, every transaction will appear here with full verification.
              </p>
              <Link
                href="/dashboard/agents"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:opacity-90 transition-opacity"
              >
                Deploy Your First Agent →
              </Link>
            </div>
          ) : (
            entries.map((entry, i) => (
              <div key={entry.id}>
                {/* Main row */}
                <div
                  className={cn(
                    'grid px-4 items-center cursor-pointer transition-colors border-b border-border hover:bg-surface',
                    expanded === entry.id ? 'bg-surface' : i % 2 === 0 ? 'bg-card' : 'bg-page'
                  )}
                  style={{ gridTemplateColumns: COLS, minHeight: 52 }}
                  onClick={() => setExpanded(prev => prev === entry.id ? null : entry.id)}
                >
                  {/* TX Hash */}
                  <span
                    className="flex items-center gap-1 text-text-link font-mono text-[11px]"
                    title={entry.txHash}
                  >
                    {entry.isLive && <span className="text-success text-[8px] leading-none">●</span>}
                    {truncateHash(entry.txHash)}
                  </span>

                  {/* Timestamp */}
                  <span className="text-text-secondary font-mono text-[11px]">
                    {entry.timestamp}
                  </span>

                  {/* From */}
                  <span className="text-text-secondary font-mono text-[11px]">
                    {entry.from}
                  </span>

                  {/* To */}
                  <span className="text-text-primary font-mono text-[11px]">
                    {entry.to}
                  </span>

                  {/* Mandate */}
                  <span className="truncate text-xs text-text-link" title={entry.mandate}>
                    {entry.mandate}
                  </span>

                  {/* Amount */}
                  <span className="text-xs font-medium text-text-primary">{entry.amount}</span>

                  {/* Status */}
                  <StatusBadge status={entry.status} />

                  {/* Block */}
                  <span className="text-text-secondary font-mono text-[11px]">
                    {entry.blockNumber > 0 ? `#${entry.blockNumber.toLocaleString()}` : '—'}
                  </span>

                  {/* Actions */}
                  <a
                    href={entry.txHash ? `${EXPLORER}/tx/${entry.txHash}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-0.5 text-xs text-text-link hover:opacity-70 transition-opacity"
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
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-sm flex-wrap gap-3">
        <span className="text-text-secondary">
          Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, displayTotal)} of {displayTotal.toLocaleString()} transactions
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-0.5 px-2.5 py-1.5 rounded text-xs border border-border text-text-secondary hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>

          {visiblePages.map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={cn(
                'h-8 w-8 rounded-full text-xs font-medium transition-colors',
                page === n ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {n}
            </button>
          ))}

          <span className="text-text-disabled px-1">...</span>

          <button
            onClick={() => setPage(totalPages)}
            className={cn(
              'h-8 w-8 rounded-full text-xs font-medium transition-colors',
              page === totalPages ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {totalPages}
          </button>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-0.5 px-2.5 py-1.5 rounded text-xs border border-border text-text-secondary hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <select
          value={perPage}
          onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }}
          className="rounded text-xs px-2 py-1.5 bg-card border border-border text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>
    </div>
  )
}
