'use client'

import { useState, useRef, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, ChevronDown, X } from 'lucide-react'

// ── Preset definitions ────────────────────────────────────────────────────────

const PRESETS = {
  Conservative: { maxDrawdown: 10, maxNotional: 5000,  maxPositions: 5,  stopLoss: 3,  drawdownLimit: 5,  maxDailyLoss: '250' },
  Balanced:     { maxDrawdown: 15, maxNotional: 10000, maxPositions: 10, stopLoss: 5,  drawdownLimit: 10, maxDailyLoss: '500' },
  Aggressive:   { maxDrawdown: 30, maxNotional: 50000, maxPositions: 25, stopLoss: 10, drawdownLimit: 20, maxDailyLoss: '2000' },
} as const

type PresetKey = keyof typeof PRESETS

const COOLDOWN_OPTIONS = ['None', '30 min', '1 hour', '4 hours', '12 hours', '24 hours', '1 week']

// ── Slider component ──────────────────────────────────────────────────────────

function sliderColor(v: number, label: string): string {
  if (label.includes('Drawdown') || label.includes('Draw')) {
    if (v < 10)  return '#22C55E'
    if (v <= 20) return '#F5C542'
    return '#EF4444'
  }
  return '#0066FF'
}

function RangeSlider({
  label, description, min, max, value, onChange, format,
  colorFn,
}: {
  label: string
  description: string
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  colorFn?: (v: number) => string
}) {
  const pct    = ((value - min) / (max - min)) * 100
  const color  = colorFn ? colorFn(value) : sliderColor(value, label)
  const display = format ? format(value) : String(value)

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: '#F0F6FC' }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>{description}</p>
        </div>
        <span className="text-xl font-bold shrink-0" style={{ color }}>
          {display}
        </span>
      </div>

      <div className="relative h-2 rounded-full" style={{ background: '#21262D' }}>
        {/* Filled track */}
        <div
          className="absolute h-2 rounded-full pointer-events-none"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.1s' }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 pointer-events-none shadow-md"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: '#F0F6FC',
            borderColor: color,
          }}
        />
        <input
          name="risk-range"
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 1 }}
        />
      </div>
    </div>
  )
}

// ── Protocol logo mini ────────────────────────────────────────────────────────

const PROTO_COLORS: Record<string, { color: string; bg: string }> = {
  'Merchant Moe': { color: '#5B8DF6', bg: '#0D1A3A' },
  'Agni Finance': { color: '#F97316', bg: '#2A1000' },
  'Fluxion':      { color: '#A855F7', bg: '#1A0A3A' },
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium animate-in slide-in-from-bottom-4"
      style={{
        background: '#0D2818',
        border: '1px solid #22C55E',
        color: '#22C55E',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      Risk settings applied — on-chain hash updated
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RiskPage() {
  const [maxDrawdown,   setMaxDrawdown]   = useState(15)
  const [maxNotional,   setMaxNotional]   = useState(10000)
  const [maxPositions,  setMaxPositions]  = useState(10)
  const [stopLoss,      setStopLoss]      = useState(5)
  const [drawdownLimit, setDrawdownLimit] = useState(10)
  const [maxDailyLoss,  setMaxDailyLoss]  = useState('500')

  const [activePreset,  setActivePreset]  = useState<PresetKey>('Balanced')
  const [changed,       setChanged]       = useState(false)
  const [confirm,       setConfirm]       = useState(false)
  const [showToast,     setShowToast]     = useState(false)
  const [applying,      setApplying]      = useState(false)
  const [showTemplate,  setShowTemplate]  = useState(false)

  const [allocs, setAllocs] = useState({ 'Merchant Moe': 40, 'Agni Finance': 35, 'Fluxion': 25 })
  const [cooldowns, setCooldowns] = useState({
    stopLoss: '4 hours',
    drawdown: '24 hours',
    failure:  '1 hour',
    repeat:   'None',
  })

  const templateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) setShowTemplate(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const allocTotal = Object.values(allocs).reduce((a, b) => a + b, 0)
  const allocOk    = allocTotal === 100

  const applyPreset = (key: PresetKey) => {
    const p = PRESETS[key]
    setMaxDrawdown(p.maxDrawdown)
    setMaxNotional(p.maxNotional)
    setMaxPositions(p.maxPositions)
    setStopLoss(p.stopLoss)
    setDrawdownLimit(p.drawdownLimit)
    setMaxDailyLoss(p.maxDailyLoss)
    setActivePreset(key)
    setChanged(true)
    setShowTemplate(false)
  }

  const handleApply = () => {
    setApplying(true)
    setTimeout(() => {
      setApplying(false)
      setConfirm(false)
      setChanged(false)
      setShowToast(true)
    }, 1200)
  }

  const mark = (fn: () => void) => { fn(); setChanged(true) }

  const riskScore   = 4.13
  const riskColor   = riskScore < 10 ? '#22C55E' : riskScore < 20 ? '#F5C542' : '#EF4444'
  const riskLabel   = riskScore < 10 ? 'LOW RISK' : riskScore < 20 ? 'MEDIUM RISK' : 'HIGH RISK'

  const METRICS = [
    { label: 'Current Drawdown',               value: '-2.45%',        ok: true,  warn: false },
    { label: 'Largest Open Position',           value: '$8,450',        ok: true,  warn: false },
    { label: 'Open Positions',                  value: '7 / 10',        ok: true,  warn: false },
    { label: 'Venue Concentration (Moe)',        value: '42%',           ok: false, warn: true },
    { label: 'Daily Loss',                      value: '-$180 / $500',  ok: true,  warn: false },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {showToast && <Toast onDone={() => setShowToast(false)} />}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#F0F6FC' }}>Risk Engine</h2>
          <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
            Hard limits your AI agents can never exceed. Applied to all mandates unless overridden.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          {/* Load Template dropdown */}
          <div className="relative" ref={templateRef}>
            <button
              onClick={() => setShowTemplate(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                border: '1px solid #30363D',
                color: '#8B949E',
                background: 'transparent',
              }}
            >
              Load Template
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showTemplate && (
              <div
                className="absolute right-0 mt-1 rounded-md overflow-hidden z-20"
                style={{
                  background: '#1C2128',
                  border: '1px solid #30363D',
                  minWidth: 160,
                  top: '100%',
                }}
              >
                {(Object.keys(PRESETS) as PresetKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => applyPreset(k)}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                    style={{
                      color: activePreset === k ? '#F0F6FC' : '#8B949E',
                      background: activePreset === k ? '#21262D' : 'transparent',
                    }}
                    onMouseEnter={e => { if (activePreset !== k) (e.currentTarget as HTMLElement).style.background = '#21262D' }}
                    onMouseLeave={e => { if (activePreset !== k) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    {k}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #21262D' }}>
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm"
                    style={{ color: '#484F58' }}
                  >
                    Custom
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Apply Changes */}
          <button
            onClick={() => changed ? setConfirm(true) : undefined}
            disabled={!changed}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: changed ? '#0066FF' : '#1C2128',
              color: changed ? '#fff' : '#484F58',
              cursor: changed ? 'pointer' : 'not-allowed',
            }}
          >
            Apply Changes
          </button>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── LEFT: Risk Controls (60%) ────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Section 1: Global Thresholds */}
          <div
            className="rounded-lg p-5 space-y-5"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <div>
              <h4 className="text-sm font-semibold" style={{ color: '#F0F6FC' }}>Global Risk Thresholds</h4>
              <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>
                These apply across all agents unless a mandate specifies tighter limits.
              </p>
            </div>

            <RangeSlider
              label="Max Drawdown (%)"
              description="If total portfolio drops by this %, all agents pause automatically."
              min={0} max={50} value={maxDrawdown}
              format={v => `${v.toFixed(2)}%`}
              colorFn={v => v < 10 ? '#22C55E' : v <= 20 ? '#F5C542' : '#EF4444'}
              onChange={v => mark(() => setMaxDrawdown(v))}
            />

            <RangeSlider
              label="Max Notional Per Trade ($)"
              description="Maximum USD value of a single trade position."
              min={100} max={100000} value={maxNotional}
              format={v => `$${v.toLocaleString()}`}
              colorFn={() => '#0066FF'}
              onChange={v => mark(() => setMaxNotional(v))}
            />

            <RangeSlider
              label="Max Positions Open"
              description="Maximum number of concurrent open positions across all agents."
              min={1} max={50} value={maxPositions}
              colorFn={() => '#0066FF'}
              onChange={v => mark(() => setMaxPositions(v))}
            />

            <RangeSlider
              label="Stop Loss (%)"
              description="Auto-close a position if it falls this % below entry price."
              min={0} max={50} value={stopLoss}
              format={v => `${v.toFixed(2)}%`}
              colorFn={() => '#F5C542'}
              onChange={v => mark(() => setStopLoss(v))}
            />

            <RangeSlider
              label="Per-Agent Drawdown Limit (%)"
              description="Per-agent drawdown limit before that agent pauses."
              min={0} max={30} value={drawdownLimit}
              format={v => `${v.toFixed(2)}%`}
              colorFn={v => v < 10 ? '#22C55E' : v <= 20 ? '#F5C542' : '#EF4444'}
              onChange={v => mark(() => setDrawdownLimit(v))}
            />

            {/* Max Daily Loss — input field */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium" style={{ color: '#F0F6FC' }}>Max Daily Loss ($)</p>
              <p className="text-xs" style={{ color: '#8B949E' }}>
                If total realized + unrealized loss exceeds this today, all agents pause until midnight UTC.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium" style={{ color: '#484F58' }}>$</span>
                <input
                  name="max-daily-loss"
                  type="number"
                  value={maxDailyLoss}
                  onChange={e => mark(() => setMaxDailyLoss(e.target.value))}
                  className="rounded-md px-3 py-2 text-sm focus:outline-none w-40"
                  style={{
                    background: '#0D1117',
                    border: '1px solid #30363D',
                    color: '#EF4444',
                    fontWeight: 700,
                  }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#0066FF'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#30363D'}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Venue Selection & Allocation */}
          <div
            className="rounded-lg p-5 space-y-4"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <div>
              <h4 className="text-sm font-semibold" style={{ color: '#F0F6FC' }}>Venue Selection &amp; Allocation</h4>
              <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>
                Select which protocols agents may use and set allocation limits.
              </p>
            </div>

            {/* Table — scrollable on small screens */}
            <div className="overflow-x-auto">
            <div style={{ minWidth: 560 }}>
            {/* Table header */}
            <div
              className="grid text-[10px] font-semibold uppercase tracking-wider px-3 py-2 rounded-md"
              style={{
                gridTemplateColumns: '1fr 80px 140px 72px 72px 80px',
                background: '#0D1117',
                color: '#484F58',
              }}
            >
              <span>Protocol</span>
              <span>Status</span>
              <span>Max Allocation</span>
              <span className="text-right">Volume</span>
              <span className="text-right">TVL</span>
              <span className="text-right">Actions</span>
            </div>

            {([
              { name: 'Merchant Moe', vol: '$24.5M', tvl: '$145.2M' },
              { name: 'Agni Finance', vol: '$18.2M', tvl: '$89.4M' },
              { name: 'Fluxion',      vol: '$12.1M', tvl: '$45.8M' },
            ] as { name: keyof typeof allocs; vol: string; tvl: string }[]).map(p => {
              const pct   = allocs[p.name]
              const c     = PROTO_COLORS[p.name]
              return (
                <div
                  key={p.name}
                  className="grid items-center px-3 py-2.5 rounded-md"
                  style={{
                    gridTemplateColumns: '1fr 80px 140px 72px 72px 80px',
                    borderBottom: '1px solid #21262D',
                  }}
                >
                  {/* Protocol name */}
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: c.bg, border: `1px solid ${c.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: c.color, fontWeight: 700, fontSize: 9 }}>
                        {p.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#F0F6FC' }}>{p.name}</span>
                  </div>

                  {/* Status */}
                  <span
                    className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded w-fit"
                    style={{ background: '#0D2818', color: '#22C55E' }}
                  >
                    ACTIVE ✓
                  </span>

                  {/* Allocation slider inline */}
                  <div className="flex items-center gap-2 px-2">
                    <div className="relative flex-1 h-1.5 rounded-full" style={{ background: '#21262D' }}>
                      <div
                        className="absolute h-1.5 rounded-full"
                        style={{ width: `${pct}%`, background: '#0066FF' }}
                      />
                      <input
                        name={`alloc-${p.name}`}
                        type="range" min={0} max={100} value={pct}
                        onChange={e => mark(() => setAllocs(prev => ({ ...prev, [p.name]: Number(e.target.value) })))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <span className="text-sm font-bold w-8 text-right shrink-0" style={{ color: '#F0F6FC' }}>
                      {pct}%
                    </span>
                  </div>

                  <span className="text-xs text-right" style={{ color: '#8B949E' }}>{p.vol}</span>
                  <span className="text-xs text-right" style={{ color: '#8B949E' }}>{p.tvl}</span>

                  <div className="flex justify-end">
                    <button
                      className="text-[11px] px-2 py-0.5 rounded transition-colors"
                      style={{ border: '1px solid #30363D', color: '#8B949E' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#0066FF'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#30363D'}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              )
            })}

            </div>{/* /minWidth */}
            </div>{/* /overflow-x-auto */}

            {/* Allocation total */}
            <div
              className="flex items-center gap-1.5 text-xs font-semibold px-3"
              style={{ color: allocOk ? '#22C55E' : '#EF4444' }}
            >
              {allocOk
                ? <CheckCircle2 className="h-3.5 w-3.5" />
                : <AlertTriangle className="h-3.5 w-3.5" />
              }
              Total: {allocTotal}%
              {allocOk
                ? ' ✓'
                : ' — adjust before applying'
              }
            </div>
          </div>

          {/* Section 3: Cooldown Periods */}
          <div
            className="rounded-lg p-5 space-y-4"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <h4 className="text-sm font-semibold" style={{ color: '#F0F6FC' }}>Cooldown Periods</h4>

            {([
              { label: 'After stop-loss triggered',                key: 'stopLoss' as const },
              { label: 'After drawdown limit hit',                 key: 'drawdown' as const },
              { label: 'After trade failure',                      key: 'failure'  as const },
              { label: 'Between repeat trades (same asset)',       key: 'repeat'   as const },
            ]).map(row => (
              <div key={row.key} className="flex flex-wrap items-center justify-between gap-2 py-1">
                <span className="text-sm" style={{ color: '#8B949E' }}>{row.label}</span>
                <select
                  value={cooldowns[row.key]}
                  onChange={e => mark(() => setCooldowns(prev => ({ ...prev, [row.key]: e.target.value })))}
                  className="rounded-md px-3 py-1.5 text-sm focus:outline-none cursor-pointer"
                  style={{
                    background: '#0D1117',
                    border: '1px solid #30363D',
                    color: '#8B949E',
                    minWidth: 120,
                  }}
                >
                  {COOLDOWN_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Risk Summary (40%) ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Portfolio Risk Score */}
          <div
            className="rounded-lg p-5 space-y-4"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8B949E' }}>
              Portfolio Risk Score
            </p>

            <div className="text-center space-y-3">
              <p className="text-5xl font-black" style={{ color: riskColor }}>{riskScore}%</p>

              {/* Health bar */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#21262D' }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(riskScore * 2, 100)}%`, background: riskColor }}
                />
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" style={{ color: riskColor }} />
                <span className="text-sm font-bold" style={{ color: riskColor }}>{riskLabel}</span>
              </div>
              <p className="text-xs" style={{ color: '#8B949E' }}>Within safe parameters</p>
            </div>
          </div>

          {/* Individual metrics */}
          <div
            className="rounded-lg p-5 space-y-1"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <h4 className="text-sm font-semibold mb-3" style={{ color: '#F0F6FC' }}>Current Exposure</h4>

            {METRICS.map(m => (
              <div
                key={m.label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: '1px solid #21262D' }}
              >
                <span className="text-xs" style={{ color: '#8B949E' }}>{m.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium" style={{ color: '#F0F6FC' }}>{m.value}</span>
                  {m.warn
                    ? (
                      <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#F5C542' }}>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Near limit
                      </div>
                    )
                    : (
                      <div className="flex items-center gap-1 text-[10px]" style={{ color: '#22C55E' }}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Within limit
                      </div>
                    )
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Quick presets */}
          <div
            className="rounded-lg p-4 space-y-3"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8B949E' }}>
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRESETS) as PresetKey[]).map(k => (
                <button
                  key={k}
                  onClick={() => applyPreset(k)}
                  className="flex-1 min-w-[80px] text-xs py-2 rounded-md font-medium transition-all"
                  style={{
                    border: `1px solid ${activePreset === k ? '#0066FF' : '#30363D'}`,
                    background: activePreset === k ? 'rgba(0,102,255,0.12)' : 'transparent',
                    color: activePreset === k ? '#58A6FF' : '#8B949E',
                  }}
                >
                  {activePreset === k && '✓ '}{k}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Changes confirmation (inline in right col on smaller screens) */}
          {changed && (
            <div
              className="rounded-lg p-4 text-xs"
              style={{
                background: 'rgba(0,102,255,0.08)',
                border: '1px solid rgba(0,102,255,0.3)',
                color: '#58A6FF',
              }}
            >
              <p className="font-semibold mb-1">Unsaved changes</p>
              <p style={{ color: '#8B949E' }}>
                Click &quot;Apply Changes&quot; to save. 3 agents will be affected.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────────────────── */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => !applying && setConfirm(false)}
        >
          <div
            className="rounded-xl p-6 space-y-4 w-[calc(100vw-2rem)] max-w-[440px]"
            style={{
              background: '#161B22',
              border: '1px solid #21262D',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold" style={{ color: '#F0F6FC' }}>Apply Risk Settings?</h3>
              <button onClick={() => setConfirm(false)} style={{ color: '#8B949E' }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm" style={{ color: '#8B949E' }}>
              These changes will apply to all active agents immediately. Agents currently outside new limits will pause automatically.
            </p>

            <div
              className="rounded-md px-4 py-3 text-sm space-y-1"
              style={{ background: '#0D1117', border: '1px solid #21262D' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: '#8B949E' }}>Affected agents</span>
                <span className="font-semibold" style={{ color: '#F5C542' }}>3 of 9 active agents</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#8B949E' }}>On-chain effect</span>
                <span className="font-semibold" style={{ color: '#F0F6FC' }}>New policy hash generated</span>
              </div>
            </div>

            <p className="text-xs" style={{ color: '#484F58' }}>
              Settings change generates a new on-chain policy hash recorded on Mantle Network.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: '#0066FF' }}
              >
                {applying && (
                  <span
                    className="h-4 w-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                  />
                )}
                Apply Changes
              </button>
              <button
                onClick={() => setConfirm(false)}
                disabled={applying}
                className="px-5 py-2.5 rounded-md text-sm transition-colors"
                style={{ border: '1px solid #30363D', color: '#8B949E' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
