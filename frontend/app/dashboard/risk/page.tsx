'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Preset definitions ────────────────────────────────────────────────────────

const PRESETS = {
  Conservative: { maxDrawdown: 10, maxNotional: 5000,  maxPositions: 5,  stopLoss: 3,  drawdownLimit: 5,  maxDailyLoss: '250' },
  Balanced:     { maxDrawdown: 15, maxNotional: 10000, maxPositions: 10, stopLoss: 5,  drawdownLimit: 10, maxDailyLoss: '500' },
  Aggressive:   { maxDrawdown: 30, maxNotional: 50000, maxPositions: 25, stopLoss: 10, drawdownLimit: 20, maxDailyLoss: '2000' },
} as const

type PresetKey = keyof typeof PRESETS

const COOLDOWN_OPTIONS = ['None', '30 min', '1 hour', '4 hours', '12 hours', '24 hours', '1 week']

// ── RangeSlider ───────────────────────────────────────────────────────────────
// Dynamic pct-based track/thumb positioning must remain inline styles.

function sliderColor(v: number, label: string): string {
  if (label.includes('Drawdown') || label.includes('Draw')) {
    if (v < 10)  return '#22C55E'
    if (v <= 20) return '#F5C542'
    return '#EF4444'
  }
  return '#0066FF'
}

function RangeSlider({
  label, description, min, max, value, onChange, format, colorFn,
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
  const pct     = ((value - min) / (max - min)) * 100
  const color   = colorFn ? colorFn(value) : sliderColor(value, label)
  const display = format ? format(value) : String(value)

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs mt-0.5 text-text-secondary">{description}</p>
        </div>
        {/* Dynamic color — must be inline */}
        <span className="text-xl font-bold shrink-0" style={{ color }}>
          {display}
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-border">
        {/* Filled track — dynamic width + color */}
        <div
          className="absolute h-2 rounded-full pointer-events-none transition-[width] duration-100"
          style={{ width: `${pct}%`, background: color }}
        />
        {/* Thumb — dynamic position + border color */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 pointer-events-none shadow-md bg-text-primary"
          style={{ left: `calc(${pct}% - 8px)`, borderColor: color }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  )
}

// ── Protocol colors — brand-specific, data-driven ─────────────────────────────

const PROTO_STYLES: Record<string, { color: string; bg: string }> = {
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
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-success-bg border border-success text-success shadow-modal animate-in slide-in-from-bottom-4"
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
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) {
        setShowTemplate(false)
      }
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

  const riskScore = 4.13
  const riskColor = riskScore < 10 ? 'text-success' : riskScore < 20 ? 'text-warning' : 'text-error'
  const riskBarColor = riskScore < 10 ? 'bg-success' : riskScore < 20 ? 'bg-warning' : 'bg-error'
  const riskLabel = riskScore < 10 ? 'LOW RISK' : riskScore < 20 ? 'MEDIUM RISK' : 'HIGH RISK'

  const METRICS = [
    { label: 'Current Drawdown',              value: '-2.45%',        ok: true,  warn: false },
    { label: 'Largest Open Position',         value: '$8,450',        ok: true,  warn: false },
    { label: 'Open Positions',                value: '7 / 10',        ok: true,  warn: false },
    { label: 'Venue Concentration (Moe)',     value: '42%',           ok: false, warn: true  },
    { label: 'Daily Loss',                    value: '-$180 / $500',  ok: true,  warn: false },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {showToast && <Toast onDone={() => setShowToast(false)} />}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Risk Engine</h2>
          <p className="text-sm mt-0.5 text-text-secondary">
            Hard limits your AI agents can never exceed. Applied to all mandates unless overridden.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          {/* Load Template dropdown */}
          <div className="relative" ref={templateRef}>
            <button
              onClick={() => setShowTemplate(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm border border-border text-text-secondary hover:text-text-primary hover:border-text-disabled transition-colors"
            >
              Load Template
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {showTemplate && (
              <div className="absolute right-0 mt-1 rounded-md overflow-hidden z-20 bg-surface border border-border shadow-modal min-w-40">
                {(Object.keys(PRESETS) as PresetKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => applyPreset(k)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm transition-colors',
                      activePreset === k
                        ? 'bg-card text-text-primary'
                        : 'text-text-secondary hover:bg-card hover:text-text-primary',
                    )}
                  >
                    {activePreset === k && '✓ '}{k}
                  </button>
                ))}
                <div className="border-t border-border">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-text-disabled cursor-not-allowed">
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
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              changed
                ? 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
                : 'bg-surface text-text-disabled cursor-not-allowed',
            )}
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
          <div className="bg-card border border-border rounded-lg p-5 space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Global Risk Thresholds</h4>
              <p className="text-xs mt-0.5 text-text-secondary">
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

            {/* Max Daily Loss — plain input */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-text-primary">Max Daily Loss ($)</p>
              <p className="text-xs text-text-secondary">
                If total realized + unrealized loss exceeds this today, all agents pause until midnight UTC.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-text-disabled">$</span>
                <input
                  name="max-daily-loss"
                  type="number"
                  value={maxDailyLoss}
                  onChange={e => mark(() => setMaxDailyLoss(e.target.value))}
                  className="w-40 rounded-md px-3 py-2 text-sm font-bold text-error bg-page border border-border focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Venue Selection & Allocation */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Venue Selection &amp; Allocation</h4>
              <p className="text-xs mt-0.5 text-text-secondary">
                Select which protocols agents may use and set allocation limits.
              </p>
            </div>

            <div className="overflow-x-auto">
              <div style={{ minWidth: 560 }}>

                {/* Table header */}
                <div className="grid text-[10px] font-semibold uppercase tracking-wider px-3 py-2 rounded-md bg-page text-text-disabled"
                  style={{ gridTemplateColumns: '1fr 80px 140px 72px 72px 80px' }}>
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
                  const pct = allocs[p.name]
                  const c   = PROTO_STYLES[p.name]
                  return (
                    <div
                      key={p.name}
                      className="grid items-center px-3 py-2.5 border-b border-border"
                      style={{ gridTemplateColumns: '1fr 80px 140px 72px 72px 80px' }}
                    >
                      {/* Protocol name + icon */}
                      <div className="flex items-center gap-2">
                        {/* Brand-specific colors — must be inline */}
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: c.bg, border: `1px solid ${c.color}40` }}
                        >
                          <span className="text-[9px] font-bold" style={{ color: c.color }}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">{p.name}</span>
                      </div>

                      {/* Status */}
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded w-fit bg-success-bg text-success border border-success/20">
                        ACTIVE ✓
                      </span>

                      {/* Allocation slider — dynamic width must be inline */}
                      <div className="flex items-center gap-2 px-2">
                        <div className="relative flex-1 h-1.5 rounded-full bg-border">
                          <div
                            className="absolute h-1.5 rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                          <input
                            name={`alloc-${p.name}`}
                            type="range" min={0} max={100} value={pct}
                            aria-label={`${p.name} allocation`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={pct}
                            onChange={e => mark(() => setAllocs(prev => ({ ...prev, [p.name]: Number(e.target.value) })))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <span className="text-sm font-bold text-text-primary w-8 text-right shrink-0">{pct}%</span>
                      </div>

                      <span className="text-xs text-right text-text-secondary">{p.vol}</span>
                      <span className="text-xs text-right text-text-secondary">{p.tvl}</span>

                      <div className="flex justify-end">
                        <Link
                          href="/dashboard/protocols"
                          className="text-[11px] px-2 py-0.5 rounded border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors inline-block"
                        >
                          Configure
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Allocation total */}
            <div className={cn(
              'flex items-center gap-1.5 text-xs font-semibold px-3',
              allocOk ? 'text-success' : 'text-error',
            )}>
              {allocOk
                ? <CheckCircle2 className="h-3.5 w-3.5" />
                : <AlertTriangle className="h-3.5 w-3.5" />
              }
              Total: {allocTotal}%
              {allocOk ? ' ✓' : ' — adjust before applying'}
            </div>
          </div>

          {/* Section 3: Cooldown Periods */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">Cooldown Periods</h4>

            {([
              { label: 'After stop-loss triggered',               key: 'stopLoss' as const },
              { label: 'After drawdown limit hit',                key: 'drawdown' as const },
              { label: 'After trade failure',                     key: 'failure'  as const },
              { label: 'Between repeat trades (same asset)',      key: 'repeat'   as const },
            ]).map(row => (
              <div key={row.key} className="flex flex-wrap items-center justify-between gap-2 py-1">
                <span className="text-sm text-text-secondary">{row.label}</span>
                <select
                  value={cooldowns[row.key]}
                  onChange={e => mark(() => setCooldowns(prev => ({ ...prev, [row.key]: e.target.value })))}
                  aria-label={row.label}
                  className="rounded-md px-3 py-1.5 text-sm text-text-secondary bg-page border border-border focus:outline-none focus:border-primary cursor-pointer min-w-28 transition-colors"
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
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Portfolio Risk Score
            </p>

            <div className="text-center space-y-3">
              <p className={cn('text-5xl font-black', riskColor)}>{riskScore}%</p>

              {/* Health bar — dynamic width must be inline */}
              <div className="h-2 rounded-full overflow-hidden bg-border">
                <div
                  className={cn('h-2 rounded-full transition-all', riskBarColor)}
                  style={{ width: `${Math.min(riskScore * 2, 100)}%` }}
                />
              </div>

              <div className={cn('flex items-center justify-center gap-1.5', riskColor)}>
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-bold">{riskLabel}</span>
              </div>
              <p className="text-xs text-text-secondary">Within safe parameters</p>
            </div>
          </div>

          {/* Current Exposure */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h4 className="text-sm font-semibold text-text-primary mb-4">Current Exposure</h4>

            <div className="flex flex-col">
              {METRICS.map((m, i) => (
                <div
                  key={m.label}
                  className={cn(
                    'flex items-center justify-between py-2.5',
                    i < METRICS.length - 1 && 'border-b border-border',
                  )}
                >
                  <span className="text-xs text-text-secondary">{m.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-primary">{m.value}</span>
                    {m.warn ? (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Near limit
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Within limit
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRESETS) as PresetKey[]).map(k => (
                <button
                  key={k}
                  onClick={() => applyPreset(k)}
                  className={cn(
                    'flex-1 min-w-[80px] text-xs py-2 rounded-md font-medium border transition-all',
                    activePreset === k
                      ? 'border-primary bg-primary/10 text-text-link'
                      : 'border-border bg-transparent text-text-secondary hover:border-text-disabled hover:text-text-primary',
                  )}
                >
                  {activePreset === k && '✓ '}{k}
                </button>
              ))}
            </div>
          </div>

          {/* Unsaved changes notice */}
          {changed && (
            <div className="rounded-lg p-4 text-xs bg-primary/5 border border-primary/25 text-text-link">
              <p className="font-semibold mb-1">Unsaved changes</p>
              <p className="text-text-secondary">
                Click &quot;Apply Changes&quot; to save. 3 agents will be affected.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────────────────── */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => !applying && setConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="risk-confirm-title"
        >
          <div
            className="bg-card border border-border rounded-xl p-6 space-y-4 w-[calc(100vw-2rem)] max-w-[440px] shadow-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 id="risk-confirm-title" className="text-base font-semibold text-text-primary">
                Apply Risk Settings?
              </h3>
              <button
                onClick={() => setConfirm(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-text-secondary">
              These changes will apply to all active agents immediately. Agents currently outside
              new limits will pause automatically.
            </p>

            <div className="rounded-md px-4 py-3 text-sm space-y-1 bg-page border border-border">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Affected agents</span>
                <span className="font-semibold text-warning">3 of 9 active agents</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">On-chain effect</span>
                <span className="font-semibold text-text-primary">New policy hash generated</span>
              </div>
            </div>

            <p className="text-xs text-text-disabled">
              Settings change generates a new on-chain policy hash recorded on Mantle Network.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-60"
              >
                {applying && (
                  <span className="h-4 w-4 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                )}
                Apply Changes
              </button>
              <button
                onClick={() => setConfirm(false)}
                disabled={applying}
                className="px-5 py-2.5 rounded-md text-sm border border-border text-text-secondary hover:text-text-primary hover:border-text-disabled transition-colors disabled:opacity-60"
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
