'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Eye, Settings, Plus, Search, X, RefreshCw,
  ExternalLink, Copy, CheckCircle2, ChevronDown,
  BarChart2, Clock, Zap, Shield,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type ProtocolStatus = 'ACTIVE' | 'INACTIVE' | 'MONITORING'
type TabFilter = 'All' | 'Active' | 'Inactive' | 'Mantle Native' | 'Other'

interface Protocol {
  id: string
  name: string
  category: 'mantle' | 'other' | 'cex'
  status: ProtocolStatus
  volume: string
  tvl: string
  allocation: number
  trades: number
  lastSync: string
  primary?: boolean
  reason?: string
  description: string
  contract?: string
  logoColor: string
  logoBg: string
  logoLetter: string
  tvlRaw: number
}

// ── Protocol data ─────────────────────────────────────────────────────────────

const PROTOCOLS: Protocol[] = [
  {
    id: 'moe', name: 'Merchant Moe', category: 'mantle', status: 'ACTIVE',
    volume: '$5.2M', tvl: '$145.2M', tvlRaw: 145200000, allocation: 40, trades: 892,
    lastSync: '2 min ago', primary: true,
    description: 'Native Mantle DEX offering concentrated liquidity and optimized routing for MNT pairs.',
    contract: '0x4aE5...9F2C',
    logoColor: '#5B8DF6', logoBg: '#0D1A3A', logoLetter: 'M',
  },
  {
    id: 'agni', name: 'Agni Finance', category: 'mantle', status: 'ACTIVE',
    volume: '$3.8M', tvl: '$89.4M', tvlRaw: 89400000, allocation: 35, trades: 644,
    lastSync: '2 min ago',
    description: 'Concentrated liquidity AMM on Mantle with dynamic fee tiers and yield optimization.',
    contract: '0x7bC1...2A4E',
    logoColor: '#F97316', logoBg: '#2A1000', logoLetter: 'A',
  },
  {
    id: 'fluxion', name: 'Fluxion', category: 'mantle', status: 'ACTIVE',
    volume: '$2.1M', tvl: '$45.8M', tvlRaw: 45800000, allocation: 25, trades: 312,
    lastSync: '3 min ago',
    description: 'Perpetual futures and options protocol native to Mantle with low-latency settlement.',
    contract: '0x9dF5...1B7A',
    logoColor: '#A855F7', logoBg: '#1A0A3A', logoLetter: 'F',
  },
  {
    id: 'uniswap', name: 'Uniswap', category: 'other', status: 'INACTIVE',
    volume: '$0', tvl: '—', tvlRaw: 0, allocation: 0, trades: 0,
    lastSync: '—',
    reason: 'Paused — low Mantle Network liquidity below threshold',
    description: 'Leading decentralized exchange with V3 concentrated liquidity positions.',
    logoColor: '#FF007A', logoBg: '#3A0A25', logoLetter: 'U',
  },
  {
    id: 'aave', name: 'Aave', category: 'other', status: 'INACTIVE',
    volume: '$0', tvl: '—', tvlRaw: 0, allocation: 0, trades: 0,
    lastSync: '—',
    reason: 'Paused — awaiting Aave V3 Mantle deployment completion',
    description: 'Leading DeFi lending protocol with variable and stable rate borrowing.',
    logoColor: '#B6509E', logoBg: '#2A0A35', logoLetter: 'Aa',
  },
  {
    id: 'yearn', name: 'Yearn Finance', category: 'other', status: 'MONITORING',
    volume: '$0.8M', tvl: '$12.4M', tvlRaw: 12400000, allocation: 0, trades: 0,
    lastSync: '5 min ago',
    description: 'Yield aggregator that automatically moves funds between DeFi protocols.',
    logoColor: '#006AE3', logoBg: '#00203A', logoLetter: 'Y',
  },
  {
    id: 'balancer', name: 'Balancer', category: 'other', status: 'INACTIVE',
    volume: '$0', tvl: '—', tvlRaw: 0, allocation: 0, trades: 0,
    lastSync: '—',
    reason: 'Not yet deployed on Mantle Network mainnet',
    description: 'Automated portfolio manager and DEX with flexible pool weights.',
    logoColor: '#FFE02B', logoBg: '#1A1A00', logoLetter: 'B',
  },
  {
    id: 'makerdao', name: 'MakerDAO', category: 'other', status: 'ACTIVE',
    volume: '$1.2M', tvl: '$38.6M', tvlRaw: 38600000, allocation: 0, trades: 89,
    lastSync: '4 min ago',
    description: 'Decentralized credit platform and issuer of the DAI stablecoin.',
    logoColor: '#1AAB9B', logoBg: '#0A2A1A', logoLetter: 'MK',
  },
  {
    id: 'curve', name: 'Curve Finance', category: 'other', status: 'INACTIVE',
    volume: '$0', tvl: '—', tvlRaw: 0, allocation: 0, trades: 0,
    lastSync: '—',
    reason: 'Curve deployment on Mantle in progress — expected next quarter',
    description: 'Stablecoin DEX optimized for low slippage and high efficiency.',
    logoColor: '#D04040', logoBg: '#2A0A0A', logoLetter: 'C',
  },
  {
    id: 'compound', name: 'Compound', category: 'other', status: 'INACTIVE',
    volume: '$0', tvl: '—', tvlRaw: 0, allocation: 0, trades: 0,
    lastSync: '—',
    reason: 'Compound V3 Mantle support pending governance approval',
    description: 'Algorithmic money market protocol for earning interest and borrowing assets.',
    logoColor: '#00D395', logoBg: '#003A1A', logoLetter: 'Co',
  },
  {
    id: 'gmx', name: 'GMX', category: 'other', status: 'MONITORING',
    volume: '$0.4M', tvl: '$8.2M', tvlRaw: 8200000, allocation: 0, trades: 0,
    lastSync: '8 min ago',
    description: 'Decentralized spot and perpetual exchange with low swap fees.',
    logoColor: '#2D42FC', logoBg: '#000A2A', logoLetter: 'G',
  },
  {
    id: 'silo', name: 'Silo Finance', category: 'other', status: 'ACTIVE',
    volume: '$0.9M', tvl: '$22.8M', tvlRaw: 22800000, allocation: 0, trades: 211,
    lastSync: '6 min ago',
    description: 'Isolated lending markets enabling permissionless collateral for any token.',
    logoColor: '#F5C542', logoBg: '#1A1500', logoLetter: 'Si',
  },
]

const MANTLE_NATIVE = ['moe', 'agni', 'fluxion']

const ADD_MODAL_SECTIONS = [
  { heading: 'Mantle Native', ids: ['moe', 'agni', 'fluxion'] },
  { heading: 'Other DeFi Protocols', ids: ['uniswap', 'aave', 'yearn', 'balancer', 'makerdao', 'curve', 'compound', 'gmx', 'silo'] },
  { heading: 'CEX Data Sources (Read-only)', ids: ['bybit', 'binance', 'okx'] },
]

const CEX_LOGOS: Record<string, { letter: string; logoColor: string; logoBg: string; name: string }> = {
  bybit:   { letter: 'By', logoColor: '#F7A600', logoBg: '#2A1C00', name: 'Bybit' },
  binance: { letter: 'Bn', logoColor: '#F0B90B', logoBg: '#2A2000', name: 'Binance' },
  okx:     { letter: 'OK', logoColor: '#F0F6FC', logoBg: '#1A1A1A', name: 'OKX' },
}

// ── Protocol Logo ─────────────────────────────────────────────────────────────

function ProtocolLogo({ p, size = 40, opacity = 1 }: { p: Protocol | null; size?: number; opacity?: number }) {
  if (!p) return null
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: p.logoBg,
        border: `1px solid ${p.logoColor}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, opacity,
      }}
    >
      <span style={{ color: p.logoColor, fontWeight: 700, fontSize: size * 0.3, letterSpacing: -0.5 }}>
        {p.logoLetter}
      </span>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProtocolStatus }) {
  const style =
    status === 'ACTIVE'     ? { bg: '#0D2818', color: '#22C55E' } :
    status === 'MONITORING' ? { bg: '#2A2000', color: '#F5C542' } :
                               { bg: '#1C2128', color: '#484F58' }
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
      style={{ background: style.bg, color: style.color }}
    >
      {status}
    </span>
  )
}

// ── Protocol Card ─────────────────────────────────────────────────────────────

function ProtocolCard({
  p, onConfigure, onAdd,
}: {
  p: Protocol
  onConfigure: (p: Protocol) => void
  onAdd: (p: Protocol) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const isInactive = p.status === 'INACTIVE'

  return (
    <div
      className="relative rounded-lg p-5 flex flex-col gap-4 transition-all duration-150 cursor-default"
      style={{
        background: '#161B22',
        border: `1px solid ${hovered ? 'rgba(0,102,255,0.5)' : '#21262D'}`,
        opacity: isInactive ? 0.6 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowTooltip(false) }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <ProtocolLogo p={p} size={40} />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#F0F6FC' }}>{p.name}</p>
            {p.primary && (
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#0066FF' }}>
                Primary Execution
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={p.status} />
      </div>

      {/* Metrics 2×2 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {([
          { label: 'Volume',     value: p.volume },
          { label: 'TVL',        value: p.tvl },
          { label: 'Allocation', value: `${p.allocation}%` },
          { label: 'Trades',     value: p.trades.toLocaleString() },
        ] as { label: string; value: string }[]).map(m => (
          <div key={m.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8B949E' }}>
              {m.label}
            </p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: '#F0F6FC' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Card footer */}
      <div
        className="flex items-center justify-between pt-1"
        style={{ borderTop: '1px solid #21262D' }}
      >
        <span className="text-[11px]" style={{ color: '#484F58' }}>Last sync: {p.lastSync}</span>

        <div className="flex items-center gap-1">
          {p.status !== 'INACTIVE' && (
            <>
              <button
                className="p-1.5 rounded transition-colors"
                style={{ border: '1px solid #30363D', color: '#8B949E' }}
                title="Monitor"
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#0066FF'
                  ;(e.currentTarget as HTMLElement).style.color = '#F0F6FC'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#30363D'
                  ;(e.currentTarget as HTMLElement).style.color = '#8B949E'
                }}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onConfigure(p)}
                className="p-1.5 rounded transition-colors"
                style={{ border: '1px solid #30363D', color: '#8B949E' }}
                title="Configure"
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#0066FF'
                  ;(e.currentTarget as HTMLElement).style.color = '#F0F6FC'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#30363D'
                  ;(e.currentTarget as HTMLElement).style.color = '#8B949E'
                }}
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {p.status === 'INACTIVE' && (
            <button
              onClick={() => onAdd(p)}
              className="px-2.5 py-1 text-xs rounded font-medium transition-colors"
              style={{ border: '1px solid #30363D', color: '#8B949E' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = '#22C55E'
                ;(e.currentTarget as HTMLElement).style.color = '#22C55E'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = '#30363D'
                ;(e.currentTarget as HTMLElement).style.color = '#8B949E'
              }}
            >
              Enable
            </button>
          )}
          {p.status === 'ACTIVE' && (
            <button
              className="px-2.5 py-1 text-xs rounded font-medium transition-colors"
              style={{ border: '1px solid #30363D', color: '#8B949E' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = '#EF4444'
                ;(e.currentTarget as HTMLElement).style.color = '#EF4444'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = '#30363D'
                ;(e.currentTarget as HTMLElement).style.color = '#8B949E'
              }}
            >
              Disconnect
            </button>
          )}

          {/* Tooltip trigger for inactive */}
          {isInactive && p.reason && (
            <div className="relative">
              <button
                className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ml-1"
                style={{ background: '#30363D', color: '#8B949E' }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                ?
              </button>
              {showTooltip && (
                <div
                  className="absolute bottom-6 right-0 z-30 rounded-md px-3 py-2 text-[11px] w-48 leading-tight"
                  style={{
                    background: '#1C2128',
                    border: '1px solid #30363D',
                    color: '#8B949E',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  }}
                >
                  {p.reason}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Add Protocol Panel ────────────────────────────────────────────────────────

function AddProtocolPanel({
  onClose,
}: {
  onClose: () => void
}) {
  const [panelSearch, setPanelSearch] = useState('')
  const [selected, setSelected]       = useState<Protocol | null>(PROTOCOLS.find(p => p.id === 'moe') ?? null)
  const [copied, setCopied]           = useState(false)

  const allItems = [
    ...PROTOCOLS,
    ...Object.entries(CEX_LOGOS).map(([id, c]) => ({
      id, name: c.name, logoLetter: c.letter, logoColor: c.logoColor, logoBg: c.logoBg,
      category: 'cex' as const, status: 'INACTIVE' as const,
      volume: '$0', tvl: '—', tvlRaw: 0, allocation: 0, trades: 0, lastSync: '—',
      description: 'CEX data source — read-only signal feed.',
    })),
  ]

  const filterItems = (ids: string[]) =>
    ids
      .map(id => allItems.find(p => p.id === id))
      .filter((p): p is typeof allItems[0] =>
        !!p && (!panelSearch || p.name.toLowerCase().includes(panelSearch.toLowerCase()))
      )

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="ml-auto h-full flex"
        style={{ width: 680 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left: Browse */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            width: 320,
            background: '#161B22',
            borderLeft: '1px solid #21262D',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: '1px solid #21262D' }}
          >
            <h3 className="text-sm font-semibold" style={{ color: '#F0F6FC' }}>Add New Protocol</h3>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity" style={{ color: '#8B949E' }}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-3 shrink-0" style={{ borderBottom: '1px solid #21262D' }}>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                style={{ color: '#484F58' }}
              />
              <input
                value={panelSearch}
                onChange={e => setPanelSearch(e.target.value)}
                placeholder="Search protocols..."
                className="w-full rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                style={{
                  background: '#0D1117',
                  border: '1px solid #30363D',
                  color: '#F0F6FC',
                }}
              />
            </div>
          </div>

          {/* Protocol sections */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5">
            {ADD_MODAL_SECTIONS.map(section => {
              const items = filterItems(section.ids)
              if (items.length === 0) return null
              return (
                <div key={section.heading}>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#484F58' }}
                  >
                    {section.heading}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {items.map(item => {
                      const isSel = selected?.id === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelected(item as Protocol)}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-md transition-all"
                          style={{
                            background: isSel ? '#1C2128' : 'transparent',
                            border: `1px solid ${isSel ? '#0066FF' : '#21262D'}`,
                          }}
                          onMouseEnter={e => {
                            if (!isSel) (e.currentTarget as HTMLElement).style.borderColor = '#30363D'
                          }}
                          onMouseLeave={e => {
                            if (!isSel) (e.currentTarget as HTMLElement).style.borderColor = '#21262D'
                          }}
                        >
                          <div
                            style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: item.logoBg,
                              border: `1px solid ${item.logoColor}40`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <span style={{ color: item.logoColor, fontWeight: 700, fontSize: 11 }}>
                              {item.logoLetter}
                            </span>
                          </div>
                          <span
                            className="text-[10px] text-center leading-tight"
                            style={{ color: isSel ? '#F0F6FC' : '#8B949E' }}
                          >
                            {item.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* CEX note */}
          <div
            className="px-5 py-3 text-[10px] shrink-0"
            style={{
              borderTop: '1px solid #21262D',
              color: '#484F58',
              fontStyle: 'italic',
            }}
          >
            CEX data sources are read-only signal feeds. All execution happens on Mantle Network protocols.
          </div>
        </div>

        {/* Right: Detail */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            background: '#1C2128',
            borderLeft: '1px solid #21262D',
          }}
        >
          {selected ? (
            <>
              <div
                className="flex items-start gap-3 px-5 py-4 shrink-0"
                style={{ borderBottom: '1px solid #21262D' }}
              >
                <ProtocolLogo p={selected as Protocol} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold" style={{ color: '#F0F6FC' }}>{selected.name}</p>
                    <StatusBadge status={selected.status} />
                  </div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#8B949E' }}>
                    {selected.description}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Stats */}
                {(selected as Protocol).tvlRaw > 0 && (
                  <div
                    className="rounded-md p-4 space-y-3"
                    style={{ background: '#161B22', border: '1px solid #21262D' }}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#484F58' }}>TVL on Mantle</span>
                      <span className="font-semibold" style={{ color: '#F0F6FC' }}>{selected.tvl}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#484F58' }}>Volume Routed</span>
                      <span className="font-semibold" style={{ color: '#F0F6FC' }}>{selected.volume}</span>
                    </div>
                    {(selected as Protocol).trades > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: '#484F58' }}>Tradeable Pools</span>
                        <span className="font-semibold" style={{ color: '#F0F6FC' }}>
                          {Math.floor((selected as Protocol).trades / 4)} active
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Contract address */}
                {(selected as Protocol).contract && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#484F58' }}>
                      Contract Address
                    </p>
                    <div
                      className="flex items-center justify-between rounded-md px-3 py-2 gap-2"
                      style={{ background: '#161B22', border: '1px solid #21262D' }}
                    >
                      <span
                        className="text-xs"
                        style={{ color: '#F0F6FC', fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        {(selected as Protocol).contract}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText((selected as Protocol).contract ?? '')
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }}
                          style={{ color: '#8B949E' }}
                          className="hover:opacity-70 transition-opacity"
                        >
                          {copied
                            ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22C55E' }} />
                            : <Copy className="h-3.5 w-3.5" />
                          }
                        </button>
                        <a
                          href={`https://explorer.mantle.xyz/address/${(selected as Protocol).contract}`}
                          target="_blank" rel="noreferrer"
                          style={{ color: '#8B949E' }}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Required permissions */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#484F58' }}>
                    Required Permissions
                  </p>
                  <div className="space-y-1.5">
                    {['Read market data', 'Submit transactions', 'View liquidity pools'].map(perm => (
                      <div key={perm} className="flex items-center gap-2 text-xs" style={{ color: '#8B949E' }}>
                        <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: '#22C55E' }} />
                        {perm}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reason if inactive */}
                {selected.status === 'INACTIVE' && (selected as Protocol).reason && (
                  <div
                    className="rounded-md px-3 py-2.5 text-xs"
                    style={{
                      background: '#2A2000',
                      border: '1px solid rgba(245,197,66,0.3)',
                      color: '#F5C542',
                    }}
                  >
                    <strong>Note:</strong> {(selected as Protocol).reason}
                  </div>
                )}
              </div>

              {/* Connect button */}
              <div className="px-5 py-4 shrink-0" style={{ borderTop: '1px solid #21262D' }}>
                <button
                  className="w-full py-2.5 rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#0066FF' }}
                >
                  {selected.status === 'ACTIVE' ? 'Already Connected' : 'Connect Protocol'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm" style={{ color: '#484F58' }}>Select a protocol to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Configure Panel ───────────────────────────────────────────────────────────

type ConfigTab = 'overview' | 'execution' | 'history' | 'logs'

function ConfigurePanel({ p, onClose }: { p: Protocol; onClose: () => void }) {
  const [configTab, setConfigTab] = useState<ConfigTab>('overview')
  const [copied, setCopied]       = useState(false)
  const [maxAlloc, setMaxAlloc]   = useState(p.allocation)

  const CONFIG_TABS: { id: ConfigTab; label: string }[] = [
    { id: 'overview',  label: 'Overview' },
    { id: 'execution', label: 'Execution Settings' },
    { id: 'history',   label: 'History' },
    { id: 'logs',      label: 'Logs' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="ml-auto h-full flex flex-col overflow-hidden"
        style={{
          width: 420,
          background: '#161B22',
          borderLeft: '1px solid #21262D',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid #21262D' }}
        >
          <ProtocolLogo p={p} size={36} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold" style={{ color: '#F0F6FC' }}>{p.name}</p>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>Last sync: {p.lastSync}</p>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity" style={{ color: '#8B949E' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div
          className="flex shrink-0"
          style={{ borderBottom: '1px solid #21262D' }}
        >
          {CONFIG_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setConfigTab(t.id)}
              className="flex-1 py-2.5 text-xs font-medium transition-colors"
              style={{
                color: configTab === t.id ? '#F0F6FC' : '#8B949E',
                borderBottom: `2px solid ${configTab === t.id ? '#0066FF' : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {configTab === 'overview' && (
            <>
              <p className="text-xs leading-relaxed" style={{ color: '#8B949E' }}>{p.description}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: BarChart2, label: 'Volume Routed', value: p.volume },
                  { icon: Zap,       label: 'TVL',           value: p.tvl },
                  { icon: Clock,     label: 'Allocation',    value: `${p.allocation}%` },
                  { icon: Shield,    label: 'Total Trades',  value: p.trades.toLocaleString() },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-md p-3"
                    style={{ background: '#1C2128', border: '1px solid #21262D' }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3 w-3" style={{ color: '#484F58' }} />
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: '#484F58' }}>{label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#F0F6FC' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Contract address */}
              {p.contract && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#484F58' }}>
                    Contract Address
                  </p>
                  <div
                    className="flex items-center justify-between rounded-md px-3 py-2"
                    style={{ background: '#0D1117', border: '1px solid #21262D' }}
                  >
                    <span
                      className="text-xs truncate"
                      style={{ color: '#F0F6FC', fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      {p.contract}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(p.contract ?? ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                        style={{ color: '#8B949E' }}
                        className="hover:opacity-70"
                      >
                        {copied ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22C55E' }} /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <a
                        href={`https://explorer.mantle.xyz/address/${p.contract}`}
                        target="_blank" rel="noreferrer"
                        style={{ color: '#8B949E' }}
                        className="hover:opacity-70"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {configTab === 'execution' && (
            <div className="space-y-5">
              {/* Max allocation slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: '#F0F6FC' }}>Max Allocation</label>
                  <span className="text-sm font-bold" style={{ color: '#0066FF' }}>{maxAlloc}%</span>
                </div>
                <input
                  type="range"
                  min={0} max={100} value={maxAlloc}
                  onChange={e => setMaxAlloc(Number(e.target.value))}
                  className="w-full accent-blue-500"
                  style={{ accentColor: '#0066FF' }}
                />
                <p className="text-[10px] mt-1" style={{ color: '#484F58' }}>Synced with Risk Engine settings</p>
              </div>

              {/* Settings rows */}
              {[
                { label: 'Min Trade Size',        value: '$100',    note: 'Per execution' },
                { label: 'Max Trade Size',         value: '$10,000', note: 'Per execution' },
                { label: 'Price Slippage Tolerance', value: '0.5%',  note: 'Max acceptable slippage' },
                { label: 'Gas Limit',              value: '500,000 gwei', note: 'Per transaction' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #21262D' }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#F0F6FC' }}>{s.label}</p>
                    <p className="text-[10px]" style={{ color: '#484F58' }}>{s.note}</p>
                  </div>
                  <button
                    className="text-xs px-2.5 py-1 rounded font-mono transition-colors"
                    style={{
                      background: '#1C2128',
                      border: '1px solid #30363D',
                      color: '#8B949E',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#0066FF'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#30363D'}
                  >
                    {s.value}
                  </button>
                </div>
              ))}
            </div>
          )}

          {configTab === 'history' && (
            <div className="space-y-2">
              {p.trades > 0 ? (
                Array.from({ length: Math.min(p.trades, 6) }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 text-xs"
                    style={{ borderBottom: '1px solid #21262D' }}
                  >
                    <div>
                      <p style={{ color: '#F0F6FC' }}>ETH/USDT {i % 2 === 0 ? 'Buy' : 'Sell'}</p>
                      <p style={{ color: '#484F58' }}>{i + 1}h ago</p>
                    </div>
                    <div className="text-right">
                      <p style={{ color: i % 3 === 2 ? '#EF4444' : '#22C55E' }}>
                        {i % 3 === 2 ? '-' : '+'}${(Math.random() * 500 + 50).toFixed(2)}
                      </p>
                      <p style={{ color: '#484F58' }}>200 OK</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-sm" style={{ color: '#484F58' }}>
                  No trade history for this protocol
                </p>
              )}
            </div>
          )}

          {configTab === 'logs' && (
            <div
              className="rounded-md overflow-hidden"
              style={{ background: '#0D1117', border: '1px solid #21262D' }}
            >
              {[
                { ts: '14:23:01', level: 'INFO',  msg: `${p.name} sync complete — 0.4ms` },
                { ts: '14:22:55', level: 'INFO',  msg: 'Market data fetched — 124 rows' },
                { ts: '14:22:49', level: 'INFO',  msg: 'Connection health check passed' },
                { ts: '14:20:30', level: 'WARN',  msg: 'Rate limit at 80% — throttling' },
                { ts: '14:18:12', level: 'INFO',  msg: 'Route optimization completed' },
              ].map((l, i) => (
                <div
                  key={i}
                  className="flex gap-2 px-3 py-1.5 text-[11px]"
                  style={{ fontFamily: '"JetBrains Mono", monospace', borderBottom: '1px solid #21262D' }}
                >
                  <span className="shrink-0" style={{ color: '#484F58', width: 50 }}>{l.ts}</span>
                  <span style={{
                    color: l.level === 'INFO' ? '#58A6FF' : l.level === 'WARN' ? '#F5C542' : '#EF4444',
                    width: 42,
                  }}>
                    [{l.level}]
                  </span>
                  <span style={{ color: '#8B949E' }}>{l.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProtocolsPage() {
  const [tab, setTab]               = useState<TabFilter>('All')
  const [search, setSearch]         = useState('')
  const [showAdd, setShowAdd]       = useState(false)
  const [configProtocol, setConfig] = useState<Protocol | null>(null)
  const [statusFilter, setStatus]   = useState('All Protocols')
  const [showStatusDd, setStatusDd] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusDd(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const TABS: TabFilter[] = ['All', 'Active', 'Inactive', 'Mantle Native', 'Other']
  const COUNTS: Record<TabFilter, number> = {
    'All':          PROTOCOLS.length,
    'Active':       PROTOCOLS.filter(p => p.status === 'ACTIVE').length,
    'Inactive':     PROTOCOLS.filter(p => p.status === 'INACTIVE').length,
    'Mantle Native': MANTLE_NATIVE.length,
    'Other':        PROTOCOLS.filter(p => !MANTLE_NATIVE.includes(p.id)).length,
  }

  const filtered = PROTOCOLS.filter(p => {
    if (tab === 'Active')        return p.status === 'ACTIVE'
    if (tab === 'Inactive')      return p.status === 'INACTIVE'
    if (tab === 'Mantle Native') return MANTLE_NATIVE.includes(p.id)
    if (tab === 'Other')         return !MANTLE_NATIVE.includes(p.id)
    return true
  }).filter(p => {
    if (statusFilter === 'Active Only')   return p.status === 'ACTIVE'
    if (statusFilter === 'Inactive Only') return p.status === 'INACTIVE'
    if (statusFilter === 'Monitoring')    return p.status === 'MONITORING'
    return true
  }).filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {showAdd      && <AddProtocolPanel onClose={() => setShowAdd(false)} />}
      {configProtocol && <ConfigurePanel p={configProtocol} onClose={() => setConfig(null)} />}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#F0F6FC' }}>Multi-Protocol Integration</h2>
          <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
            Monitor and manage your DeFi protocol connections across Mantle Network.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Protocol */}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: '#0066FF' }}
          >
            <Plus className="h-4 w-4" />
            Add New Protocol
          </button>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
              style={{ color: '#484F58' }}
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search protocols..."
              className="rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none"
              style={{
                background: '#161B22',
                border: '1px solid #21262D',
                color: '#F0F6FC',
                width: 180,
              }}
            />
          </div>

          {/* Status dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setStatusDd(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                background: '#161B22',
                border: '1px solid #21262D',
                color: '#8B949E',
              }}
            >
              {statusFilter}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showStatusDd && (
              <div
                className="absolute right-0 mt-1 rounded-md overflow-hidden z-20"
                style={{
                  background: '#1C2128',
                  border: '1px solid #30363D',
                  minWidth: 160,
                  top: '100%',
                }}
              >
                {['All Protocols', 'Active Only', 'Inactive Only', 'Monitoring'].map(opt => (
                  <button
                    key={opt}
                    className="w-full text-left px-3 py-2 text-sm transition-colors"
                    style={{
                      color: statusFilter === opt ? '#F0F6FC' : '#8B949E',
                      background: statusFilter === opt ? '#21262D' : 'transparent',
                    }}
                    onClick={() => { setStatus(opt); setStatusDd(false) }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Active Protocols',  value: '12',               sub: 'Connected' },
          { label: 'Active Monitoring', value: '8',                sub: 'Live tracking' },
          { label: 'Total Trade Volume', value: '$24,589,435.21',  sub: 'All time' },
          { label: 'Find New Protocol', value: '+',                sub: 'Browse marketplace', onClick: () => setShowAdd(true) },
        ] as { label: string; value: string; sub: string; onClick?: () => void }[]).map(c => (
          <button
            key={c.label}
            onClick={c.onClick}
            className="rounded-lg p-4 text-left transition-all"
            style={{
              background: '#161B22',
              border: '1px solid #21262D',
              cursor: c.onClick ? 'pointer' : 'default',
            }}
            onMouseEnter={e => {
              if (c.onClick) (e.currentTarget as HTMLElement).style.borderColor = '#0066FF'
            }}
            onMouseLeave={e => {
              if (c.onClick) (e.currentTarget as HTMLElement).style.borderColor = '#21262D'
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#8B949E' }}>
              {c.label}
            </p>
            <p className="text-xl font-bold" style={{ color: '#F0F6FC' }}>{c.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>{c.sub}</p>
          </button>
        ))}
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0" style={{ borderBottom: '1px solid #21262D' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap"
            style={{
              color: tab === t ? '#F0F6FC' : '#8B949E',
              borderBottom: `2px solid ${tab === t ? '#0066FF' : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            {t} ({COUNTS[t]})
          </button>
        ))}
      </div>

      {/* ── Protocol card grid ────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3" style={{ color: '#484F58' }}>
          <Search className="h-10 w-10 opacity-40" />
          <p className="text-sm">No protocols match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProtocolCard
              key={p.id}
              p={p}
              onConfigure={setConfig}
              onAdd={(proto) => setShowAdd(true)}
            />
          ))}
        </div>
      )}

      {/* ── Summary footer ────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between pt-4 text-xs"
        style={{ borderTop: '1px solid #21262D', color: '#8B949E' }}
      >
        <span>
          Monitoring 12 active protocols&nbsp;&nbsp;·&nbsp;&nbsp;$24.5M total volume routed&nbsp;&nbsp;·&nbsp;&nbsp;Last sync: 2 minutes ago
        </span>
        <button
          className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
          style={{ color: '#58A6FF' }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync All
        </button>
      </div>
    </div>
  )
}
