'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Shield, Download, ExternalLink, Copy, Link2, Search, ChevronDown } from 'lucide-react'
import NextLink from 'next/link'
import api from '@/lib/api'
import type { AuditLog } from '@/types/trade'
import { cn } from '@/lib/utils'

function truncateHash(hash: string) {
  if (!hash || hash.length < 14) return hash || '—'
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase()
  const styles: Record<string, string> = {
    SUCCESS: 'bg-success-bg text-success',
    FAILED:  'bg-error-bg text-error',
    PENDING: 'bg-warning-bg text-warning',
  }
  return (
    <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded', styles[s] ?? styles.PENDING)}>
      {s}
    </span>
  )
}

function TableSkeleton() {
  return (
    <div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={cn('flex gap-4 px-4 py-3', i % 2 === 0 ? 'bg-card' : 'bg-page')}>
          {[14, 12, 12, 12, 14, 10, 10, 8, 8].map((w, j) => (
            <div key={j} className="h-3 bg-surface rounded animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Shield className="h-12 w-12 text-text-disabled mb-4" />
      <p className="text-text-primary font-semibold text-base mb-1">No on-chain activity yet</p>
      <p className="text-text-secondary text-sm max-w-sm mb-6">
        Once your AI agent executes its first trade on Mantle Network, every transaction will appear here with full verification.
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

function ExpandedRow({ entry }: { entry: AuditLog }) {
  const copy = (text: string) => navigator.clipboard.writeText(text)
  const rows = [
    ['Full TX Hash',    entry.txHash || '—'],
    ['Decision Hash',  entry.decisionHash || '—'],
    ['Rule Applied',   (entry.details as Record<string, unknown> & { reason?: string })?.reason || '—'],
    ['Block',          entry.blockNumber ? String(entry.blockNumber) : '—'],
  ]
  return (
    <div className="bg-surface border-t border-b border-border px-6 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-3">Transaction Detail</p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-text-secondary w-32 shrink-0 text-xs">{label}:</span>
            <span className="font-mono text-[11px] text-text-primary truncate">{value}</span>
            {(label === 'Full TX Hash' || label === 'Decision Hash') && value !== '—' && (
              <button onClick={() => copy(value)} className="text-text-secondary hover:text-text-primary shrink-0">
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {entry.txHash && (
        <a
          href={`https://explorer.mantle.xyz/tx/${entry.txHash}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-text-link hover:text-text-link-hover text-xs"
        >
          View on Mantle Explorer <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}

const COLS = '14% 12% 12% 12% 14% 10% 10% 8% 8%'
const HEADERS = ['TX HASH', 'TIMESTAMP', 'FROM', 'TO', 'MANDATE', 'AMOUNT', 'STATUS', 'BLOCK', 'ACTIONS']

export default function AuditPage() {
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [search,   setSearch]     = useState('')
  const [page,     setPage]       = useState(1)
  const perPage = 20

  const { data, isLoading, isError } = useQuery<AuditLog[]>({
    queryKey: ['audit', page, search],
    queryFn: () => api.get('/audit', { params: { page, per_page: perPage, search } }).then(r => r.data.data),
  })

  const isEmpty = !isLoading && !isError && (!data || data.length === 0)

  const handleShare = () => {
    const token = Math.random().toString(36).slice(2, 10)
    navigator.clipboard.writeText(`${window.location.origin}/public/audit/${token}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">On-Chain Audit Viewer</h2>
          <p className="text-sm text-text-secondary mt-0.5">Every decision and trade recorded immutably on Mantle Network.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
          >
            <Link2 className="h-4 w-4" />
            Share Public Audit Link
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:border-primary transition-colors">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <a
            href="https://explorer.mantle.xyz"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
          >
            View on Mantle Explorer
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Total Transactions', value: '1,248',          sub: 'All time' },
          { label: 'Total Volume',       value: '$24,589,435.21', sub: 'Verified on-chain' },
          { label: 'Success Rate',       value: '98.74%',         sub: '',              color: 'text-success' },
          { label: 'Last 7 Days',        value: '18 transactions',sub: '3 pending',     subColor: 'text-warning' },
        ] as { label: string; value: string; sub: string; color?: string; subColor?: string }[]).map(c => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">{c.label}</p>
            <p className={cn('text-xl font-bold', c.color ?? 'text-text-primary')}>{c.value}</p>
            {c.sub && <p className={cn('text-xs mt-0.5', c.subColor ?? 'text-text-secondary')}>{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled pointer-events-none" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by hash or address..."
            className="w-full bg-input border border-border rounded-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary"
          />
        </div>
        {['Chain', 'Status', 'Agent', 'Mandate'].map(f => (
          <div key={f} className="relative">
            <select className="appearance-none bg-input border border-border rounded-md pl-3 pr-7 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer">
              <option>All {f}s</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div
          className="grid bg-page px-4 py-2.5"
          style={{ gridTemplateColumns: COLS }}
        >
          {HEADERS.map(h => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{h}</span>
          ))}
        </div>

        {isLoading && <TableSkeleton />}

        {isError && (
          <div className="flex items-center justify-center py-12 text-error gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Failed to load audit trail. Please try again.
          </div>
        )}

        {isEmpty && <EmptyState />}

        {!isLoading && !isError && data && data.map((entry, i) => (
          <div key={entry.id}>
            <div
              className={cn(
                'grid px-4 items-center cursor-pointer hover:bg-surface transition-colors',
                i % 2 === 0 ? 'bg-card' : 'bg-page'
              )}
              style={{ gridTemplateColumns: COLS, minHeight: '52px' }}
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
            >
              <span className="font-mono text-[11px] text-text-primary" title={entry.txHash || ''}>
                {truncateHash(entry.txHash || '')}
              </span>
              <span className="font-mono text-[11px] text-text-secondary">
                {new Date(entry.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
              </span>
              <span className="font-mono text-[11px] text-text-secondary">—</span>
              <span className="font-mono text-[11px] text-text-secondary">—</span>
              <span className="text-xs text-text-link truncate">—</span>
              <span className="text-xs text-text-primary">—</span>
              <StatusBadge status={entry.eventType === 'trade_executed' ? 'SUCCESS' : 'PENDING'} />
              <span className="font-mono text-[11px] text-text-secondary">{entry.blockNumber ?? '—'}</span>
              <a
                href={entry.txHash ? `https://explorer.mantle.xyz/tx/${entry.txHash}` : '#'}
                target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-text-link hover:text-text-link-hover flex items-center gap-0.5"
              >
                View <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {expanded === entry.id && <ExpandedRow entry={entry} />}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!isEmpty && (
        <div className="flex items-center justify-between text-sm text-text-secondary flex-wrap gap-3">
          <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, 1248)} of 1,248 transactions</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 border border-border rounded text-xs hover:border-primary disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={cn(
                  'w-8 h-8 rounded-full text-xs transition-colors',
                  page === n ? 'bg-primary text-white' : 'border border-transparent text-text-secondary hover:border-primary'
                )}
              >
                {n}
              </button>
            ))}
            <span className="text-text-disabled px-1">...</span>
            <button className="w-8 h-8 rounded-full text-xs text-text-secondary hover:border-primary border border-transparent">63</button>
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-2 py-1 border border-border rounded text-xs hover:border-primary transition-colors"
            >
              Next →
            </button>
          </div>
          <select className="bg-input border border-border rounded text-xs px-2 py-1.5 text-text-secondary">
            <option>20 per page</option>
            <option>50 per page</option>
          </select>
        </div>
      )}
    </div>
  )
}
