'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface RangeSliderProps {
  label: string
  description: string
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  colorFn?: (v: number) => string
}

function RangeSlider({ label, description, min, max, value, onChange, format, colorFn }: RangeSliderProps) {
  const display = format ? format(value) : String(value)
  const color   = colorFn ? colorFn(value) : 'text-text-primary'
  const pct     = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        </div>
        <span className={cn('text-xl font-bold shrink-0', color)}>{display}</span>
      </div>
      <div className="relative h-2 bg-border rounded-full">
        <div
          className={cn('absolute h-2 rounded-full', color === 'text-success' ? 'bg-success' : color === 'text-warning' ? 'bg-warning' : 'bg-error')}
          style={{ width: `${pct}%` }}
        />
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow border border-border" style={{ left: `calc(${pct}% - 8px)`, pointerEvents: 'none' }} />
      </div>
    </div>
  )
}

const PRESETS = {
  Conservative: { maxDrawdown: 10, maxNotional: 5000,  maxPositions: 5,  stopLoss: 3,  drawdownLimit: 5 },
  Balanced:     { maxDrawdown: 15, maxNotional: 10000, maxPositions: 10, stopLoss: 5,  drawdownLimit: 10 },
  Aggressive:   { maxDrawdown: 30, maxNotional: 50000, maxPositions: 25, stopLoss: 10, drawdownLimit: 20 },
}

type PresetKey = keyof typeof PRESETS

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

  const [allocs, setAllocs] = useState({ merchantMoe: 40, agni: 35, fluxion: 25 })
  const allocTotal = allocs.merchantMoe + allocs.agni + allocs.fluxion

  const { mutate: apply, isPending } = useMutation({
    mutationFn: () => api.post('/risk/settings', { maxDrawdown, maxNotional, maxPositions, stopLoss, drawdownLimit, maxDailyLoss }),
    onSuccess: () => { setChanged(false); setConfirm(false) },
  })

  const applyPreset = (key: PresetKey) => {
    const p = PRESETS[key]
    setMaxDrawdown(p.maxDrawdown)
    setMaxNotional(p.maxNotional)
    setMaxPositions(p.maxPositions)
    setStopLoss(p.stopLoss)
    setDrawdownLimit(p.drawdownLimit)
    setActivePreset(key)
    setChanged(true)
  }

  const drawdownColor = maxDrawdown < 10 ? 'text-success' : maxDrawdown <= 20 ? 'text-warning' : 'text-error'
  const riskScore = 4.13

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Risk Engine</h2>
          <p className="text-sm text-text-secondary mt-0.5">Hard limits your AI agents can never exceed. Applied to all mandates unless overridden.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="appearance-none bg-input border border-border rounded-md px-4 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer pr-8">
              <option>Load Template ▾</option>
              {(Object.keys(PRESETS) as PresetKey[]).map(k => (
                <option key={k} onClick={() => applyPreset(k)}>{k}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => changed ? setConfirm(true) : undefined}
            disabled={!changed}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              changed
                ? 'bg-primary hover:bg-primary-hover text-white'
                : 'bg-surface text-text-disabled cursor-not-allowed'
            )}
          >
            Apply Changes
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — controls (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section 1: Thresholds */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Global Risk Thresholds</h4>
              <p className="text-xs text-text-secondary mt-0.5">These apply across all agents unless a mandate specifies tighter limits.</p>
            </div>

            <RangeSlider
              label="Max Drawdown (%)"
              description="If total portfolio drops by this %, all agents pause automatically."
              min={0} max={50} value={maxDrawdown}
              format={v => `${v.toFixed(2)}%`}
              colorFn={v => v < 10 ? 'text-success' : v <= 20 ? 'text-warning' : 'text-error'}
              onChange={v => { setMaxDrawdown(v); setChanged(true) }}
            />

            <RangeSlider
              label="Max Notional Per Trade ($)"
              description="Maximum USD value of a single trade position."
              min={100} max={100000} value={maxNotional}
              format={v => `$${v.toLocaleString()}`}
              colorFn={() => 'text-text-primary'}
              onChange={v => { setMaxNotional(v); setChanged(true) }}
            />

            <RangeSlider
              label="Max Positions Open"
              description="Maximum number of concurrent open positions across all agents."
              min={1} max={50} value={maxPositions}
              colorFn={() => 'text-text-primary'}
              onChange={v => { setMaxPositions(v); setChanged(true) }}
            />

            <RangeSlider
              label="Stop Loss (%)"
              description="Auto-close a position if it falls this % below entry price."
              min={0} max={50} value={stopLoss}
              format={v => `${v.toFixed(2)}%`}
              colorFn={() => 'text-text-primary'}
              onChange={v => { setStopLoss(v); setChanged(true) }}
            />

            <RangeSlider
              label="Per-Agent Drawdown Limit (%)"
              description="Per-agent drawdown limit before that agent pauses."
              min={0} max={30} value={drawdownLimit}
              format={v => `${v.toFixed(2)}%`}
              colorFn={v => v < 10 ? 'text-success' : v <= 20 ? 'text-warning' : 'text-error'}
              onChange={v => { setDrawdownLimit(v); setChanged(true) }}
            />

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-text-primary">Max Daily Loss ($)</p>
              <p className="text-xs text-text-secondary">If total realized + unrealized loss exceeds this today, all agents pause until midnight UTC.</p>
              <input
                type="number"
                value={maxDailyLoss}
                onChange={e => { setMaxDailyLoss(e.target.value); setChanged(true) }}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary w-48 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Section 2: Venues */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Venue Selection &amp; Allocation</h4>
              <p className="text-xs text-text-secondary mt-0.5">Select which protocols agents may use and set allocation limits.</p>
            </div>

            <div className="space-y-3">
              {([
                { name: 'Merchant Moe', key: 'merchantMoe' as const, vol: '$24.5M', tvl: '$145.2M' },
                { name: 'Agni Finance', key: 'agni'        as const, vol: '$18.2M', tvl: '$89.4M' },
                { name: 'Fluxion',      key: 'fluxion'     as const, vol: '$12.1M', tvl: '$45.8M' },
              ]).map(p => (
                <div key={p.name} className="flex items-center gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-text-primary">{p.name}</p>
                      <span className="text-[10px] bg-success-bg text-success px-1.5 py-0.5 rounded font-semibold uppercase">ACTIVE</span>
                    </div>
                    <p className="text-xs text-text-disabled">Vol: {p.vol} · TVL: {p.tvl}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-text-primary w-10 text-right">{allocs[p.key]}%</span>
                    <input
                      type="range" min={0} max={100} value={allocs[p.key]}
                      onChange={e => {
                        setAllocs(prev => ({ ...prev, [p.key]: Number(e.target.value) }))
                        setChanged(true)
                      }}
                      className="w-24 accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={cn('text-xs font-medium', allocTotal === 100 ? 'text-success' : 'text-error')}>
              Total: {allocTotal}% {allocTotal === 100 ? '✓' : '— adjust before applying'}
            </div>
          </div>

          {/* Section 3: Cooldowns */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Cooldown Periods</h4>
            {[
              ['After stop-loss triggered', '4 hours'],
              ['After drawdown limit hit',  '24 hours'],
              ['After trade failure',       '1 hour'],
              ['Between repeat trades (same asset)', 'None'],
            ].map(([label, def]) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="text-sm text-text-secondary">{label}</span>
                <select className="bg-input border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer">
                  {['None', '30 min', '1 hour', '4 hours', '12 hours', '24 hours', '1 week'].map(o => (
                    <option key={o} selected={o === def}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Right — summary (40%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Risk score card */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Portfolio Risk Score</p>
            <div className="text-center space-y-2">
              <p className={cn('text-4xl font-black', drawdownColor)}>{riskScore}%</p>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-2 bg-success rounded-full" style={{ width: `${riskScore * 2}%` }} />
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-success">LOW RISK</span>
              </div>
              <p className="text-xs text-text-secondary">Within safe parameters</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Current Exposure</h4>
            {([
              { label: 'Current Drawdown',              value: '-2.45%',    ok: true },
              { label: 'Largest Open Position',         value: '$8,450',    ok: true },
              { label: 'Open Positions',                value: '7 / 10',    ok: true },
              { label: 'Venue Concentration (Moe)',     value: '42%',       ok: false },
              { label: 'Daily Loss',                    value: '-$180 / $500', ok: true },
            ] as { label: string; value: string; ok: boolean }[]).map(m => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">{m.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text-primary">{m.value}</span>
                  {m.ok
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    : <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Quick presets */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Quick Presets</p>
            <div className="flex gap-2">
              {(Object.keys(PRESETS) as PresetKey[]).map(k => (
                <button
                  key={k}
                  onClick={() => applyPreset(k)}
                  className={cn(
                    'flex-1 text-xs py-2 rounded-md border transition-colors',
                    activePreset === k
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-text-secondary hover:border-primary hover:text-text-primary'
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-[440px] p-6 space-y-4">
            <h3 className="text-base font-semibold text-text-primary">Apply Risk Settings?</h3>
            <p className="text-sm text-text-secondary">
              These changes will apply to all active agents immediately. Agents currently outside new limits will pause automatically.
            </p>
            <p className="text-xs text-text-disabled">Settings change generates a new on-chain policy hash.</p>
            <div className="flex gap-2">
              <button
                onClick={() => apply()}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium py-2.5 rounded-md transition-colors disabled:opacity-60"
              >
                {isPending && <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Apply Changes
              </button>
              <button onClick={() => setConfirm(false)} className="px-4 py-2.5 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
