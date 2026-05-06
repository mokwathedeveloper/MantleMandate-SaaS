'use client'

import { useState } from 'react'
import { Eye, Settings, Plus, Search, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Protocol {
  id: string
  name: string
  status: 'ACTIVE' | 'INACTIVE' | 'MONITORING'
  volume: string
  tvl: string
  allocation: number
  trades: number
  lastSync: string
  primary?: boolean
  reason?: string
}

const PROTOCOLS: Protocol[] = [
  { id: 'moe',      name: 'Merchant Moe',  status: 'ACTIVE',     volume: '$5.2M',  tvl: '$145.2M', allocation: 40, trades: 892, lastSync: '2 min ago', primary: true },
  { id: 'agni',     name: 'Agni Finance',  status: 'ACTIVE',     volume: '$3.8M',  tvl: '$89.4M',  allocation: 35, trades: 644, lastSync: '2 min ago' },
  { id: 'fluxion',  name: 'Fluxion',       status: 'ACTIVE',     volume: '$2.1M',  tvl: '$45.8M',  allocation: 25, trades: 312, lastSync: '3 min ago' },
  { id: 'uniswap',  name: 'Uniswap',       status: 'INACTIVE',   volume: '$0',     tvl: '—',       allocation: 0,  trades: 0,   lastSync: '—', reason: 'Paused — low Mantle Network liquidity below threshold' },
  { id: 'aave',     name: 'Aave',          status: 'INACTIVE',   volume: '$0',     tvl: '—',       allocation: 0,  trades: 0,   lastSync: '—' },
  { id: 'yearn',    name: 'Yearn Finance', status: 'MONITORING', volume: '$0.8M',  tvl: '$12.4M',  allocation: 0,  trades: 0,   lastSync: '5 min ago' },
  { id: 'balancer', name: 'Balancer',      status: 'INACTIVE',   volume: '$0',     tvl: '—',       allocation: 0,  trades: 0,   lastSync: '—' },
  { id: 'curve',    name: 'Curve',         status: 'INACTIVE',   volume: '$0',     tvl: '—',       allocation: 0,  trades: 0,   lastSync: '—' },
]

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:     'bg-success-bg text-success',
  INACTIVE:   'bg-surface text-text-disabled',
  MONITORING: 'bg-warning-bg text-warning',
}

type TabFilter = 'All' | 'Active' | 'Inactive' | 'Mantle Native' | 'Other'
const MANTLE_NATIVE = ['moe', 'agni', 'fluxion']

function ProtocolCard({ p }: { p: Protocol }) {
  return (
    <div className={cn('bg-card border border-border rounded-lg p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors', p.status === 'INACTIVE' && 'opacity-60')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-10 w-10 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
            {p.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">{p.name}</p>
            {p.primary && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Primary Execution</span>
            )}
          </div>
        </div>
        <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shrink-0', STATUS_BADGE[p.status])}>
          {p.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {([
          { label: 'Volume',     value: p.volume },
          { label: 'TVL',        value: p.tvl },
          { label: 'Allocation', value: `${p.allocation}%` },
          { label: 'Trades',     value: p.trades.toLocaleString() },
        ] as { label: string; value: string }[]).map(m => (
          <div key={m.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{m.label}</p>
            <p className="text-sm font-semibold text-text-primary mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-[11px] text-text-disabled">Last sync: {p.lastSync}</span>
        <div className="flex items-center gap-1">
          {p.status !== 'INACTIVE' && (
            <>
              <button className="p-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-primary transition-colors" title="Monitor">
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-primary transition-colors" title="Configure">
                <Settings className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {p.status === 'INACTIVE' && (
            <button className="px-2 py-1 text-xs border border-border rounded text-text-secondary hover:text-text-primary hover:border-primary transition-colors">
              Enable
            </button>
          )}
          {p.status === 'ACTIVE' && (
            <button className="px-2 py-1 text-xs border border-border rounded text-text-secondary hover:text-error hover:border-error transition-colors">
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AddProtocolModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-[560px] p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">Add New Protocol</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-text-secondary hover:text-text-primary" /></button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled pointer-events-none" />
          <input placeholder="Search protocols..." className="w-full bg-input border border-border rounded-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary" />
        </div>

        {[
          { heading: 'Mantle Native', items: ['Merchant Moe', 'Agni Finance', 'Fluxion'] },
          { heading: 'Other DeFi Protocols', items: ['Uniswap', 'Aave', 'Compound', 'Balancer', 'Curve'] },
          { heading: 'CEX Data Sources (Read-only)', items: ['Bybit', 'Binance', 'OKX'] },
        ].map(section => (
          <div key={section.heading}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled mb-2">{section.heading}</p>
            <div className="flex flex-wrap gap-2">
              {section.items.map(item => (
                <button key={item} className="px-3 py-1.5 text-xs border border-border rounded-full text-text-secondary hover:border-primary hover:text-primary transition-colors">
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-text-disabled italic">CEX data sources are read-only signal feeds. All execution happens on Mantle Network protocols.</p>
      </div>
    </div>
  )
}

export default function ProtocolsPage() {
  const [tab, setTab]           = useState<TabFilter>('All')
  const [search, setSearch]     = useState('')
  const [showModal, setModal]   = useState(false)

  const filtered = PROTOCOLS.filter(p => {
    if (tab === 'Active')       return p.status === 'ACTIVE'
    if (tab === 'Inactive')     return p.status === 'INACTIVE'
    if (tab === 'Mantle Native') return MANTLE_NATIVE.includes(p.id)
    if (tab === 'Other')        return !MANTLE_NATIVE.includes(p.id)
    return true
  }).filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  const TABS: TabFilter[] = ['All', 'Active', 'Inactive', 'Mantle Native', 'Other']
  const COUNTS = { All: PROTOCOLS.length, Active: 9, Inactive: 3, 'Mantle Native': 3, Other: PROTOCOLS.length - 3 }

  return (
    <div className="space-y-6">
      {showModal && <AddProtocolModal onClose={() => setModal(false)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Multi-Protocol Integration</h2>
          <p className="text-sm text-text-secondary mt-0.5">Monitor and manage your DeFi protocol connections across Mantle Network.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search protocols..."
              className="bg-input border border-border rounded-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary w-48"
            />
          </div>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Protocol
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Active Protocols',  value: '12',                sub: 'Connected' },
          { label: 'Active Monitoring', value: '8',                 sub: 'Live tracking' },
          { label: 'Total Volume',      value: '$24,589,435.21',    sub: 'All time' },
          { label: 'Find New Protocol', value: '+',                 sub: 'Browse marketplace', onClick: () => setModal(true) },
        ] as { label: string; value: string; sub: string; onClick?: () => void }[]).map(c => (
          <button
            key={c.label}
            onClick={c.onClick}
            className={cn('bg-card border border-border rounded-lg p-4 text-left transition-colors', c.onClick && 'hover:border-primary cursor-pointer')}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">{c.label}</p>
            <p className="text-xl font-bold text-text-primary">{c.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{c.sub}</p>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              tab === t
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {t} ({COUNTS[t]})
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(p => <ProtocolCard key={p.id} p={p} />)}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-text-secondary">
        <span>Monitoring 12 active protocols · $24.5M total volume routed · Last sync: 2 minutes ago</span>
        <button className="flex items-center gap-1.5 text-text-link hover:text-text-link-hover transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
          Sync All
        </button>
      </div>
    </div>
  )
}
