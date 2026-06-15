'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useRiskSummary } from '@/hooks/useRiskSummary'
import { useMandates } from '@/hooks/useMandates'
import { useAgents } from '@/hooks/useAgents'
import { useTranslation } from '@/hooks/useTranslation'

// ── Preset definitions ────────────────────────────────────────────────────────

const PRESETS = {
  Conservative: { maxDrawdown: 10, maxNotional: 5000,  maxPositions: 5,  stopLoss: 3,  drawdownLimit: 5,  maxDailyLoss: '250' },
  Balanced:     { maxDrawdown: 15, maxNotional: 10000, maxPositions: 10, stopLoss: 5,  drawdownLimit: 10, maxDailyLoss: '500' },
  Aggressive:   { maxDrawdown: 30, maxNotional: 50000, maxPositions: 25, stopLoss: 10, drawdownLimit: 20, maxDailyLoss: '2000' },
} as const

type PresetKey = keyof typeof PRESETS

const COOLDOWN_OPTIONS = ['None', '30 min', '1 hour', '4 hours', '12 hours', '24 hours', '1 week']

type Cooldowns = { stopLoss: string; drawdown: string; failure: string; repeat: string }

const DEFAULT_COOLDOWNS: Cooldowns = { stopLoss: '4 hours', drawdown: '24 hours', failure: '1 hour', repeat: 'None' }

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
  label, description, min, max, value, onChange, format, colorFn, t,
}: {
  label: string
  description: string
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  colorFn?: (v: number) => string
  t: (s: string) => string
}) {
  const pct     = ((value - min) / (max - min)) * 100
  const color   = colorFn ? colorFn(value) : sliderColor(value, label)
  const display = format ? format(value) : String(value)

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{t(label)}</p>
          <p className="text-xs mt-0.5 text-text-secondary">{t(description)}</p>
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
          aria-label={t(label)}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  )
}

// ── Protocol colors — rotate through a small palette for real protocol names ──

const PROTO_PALETTE = [
  { color: '#5B8DF6', bg: '#0D1A3A' },
  { color: '#22C55E', bg: '#0A2A14' },
  { color: '#F5C542', bg: '#2A2200' },
  { color: '#A78BFA', bg: '#1A0A3A' },
]

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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-success-bg border border-success text-success shadow-modal animate-in slide-in-from-bottom-4"
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {message}
    </div>
  )
}

// ── Real trade-derived data ──────────────────────────────────────────────────

interface TradeRow {
  protocol:   string
  amount_usd: number | null
  pnl:        number | null
  status:     string
  created_at: string
}

function useRiskTrades() {
  const { user } = useAuthStore()
  return useQuery<TradeRow[]>({
    queryKey: ['risk', 'trades'],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('trades')
        .select('protocol, amount_usd, pnl, status, created_at')
        .eq('user_id', user.id)
      if (error || !data) return []
      return data as TradeRow[]
    },
    enabled: !!user,
    staleTime: 60_000,
  })
}

interface PositionRow {
  size:     number
  protocol: string
  status:   'open' | 'closed'
}

function usePositions() {
  return useQuery<PositionRow[]>({
    queryKey: ['portfolio', 'positions'],
    queryFn: () => fetch('/api/portfolio/positions').then(r => r.json()),
    staleTime: 30_000,
  })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RiskPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const t = useTranslation()

  const [maxDrawdown,   setMaxDrawdown]   = useState(15)
  const [maxNotional,   setMaxNotional]   = useState(10000)
  const [maxPositions,  setMaxPositions]  = useState(10)
  const [stopLoss,      setStopLoss]      = useState(5)
  const [drawdownLimit, setDrawdownLimit] = useState(10)
  const [maxDailyLoss,  setMaxDailyLoss]  = useState('500')

  const [activePreset,  setActivePreset]  = useState<PresetKey>('Balanced')
  const [changed,       setChanged]       = useState(false)
  const [confirm,       setConfirm]       = useState(false)
  const [toastMsg,      setToastMsg]      = useState<string | null>(null)
  const [showTemplate,  setShowTemplate]  = useState(false)

  const [allocs, setAllocs] = useState<Record<string, number>>({})
  const [cooldowns, setCooldowns] = useState<Cooldowns>(DEFAULT_COOLDOWNS)

  const templateRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const allocsInitialized = useRef(false)

  const { data: riskSummary }  = useRiskSummary()
  const { data: agents }       = useAgents()
  const { data: mandatesResp } = useMandates({ status: 'active' })
  const { data: tradeRows }    = useRiskTrades()
  const { data: positions }    = usePositions()

  const activeMandates = useMemo(() => mandatesResp?.data ?? [], [mandatesResp])
  const activeAgents   = (agents ?? []).filter(a => a.status === 'active')
  const openPositions  = (positions ?? []).filter(p => p.status === 'open')

  // ── real protocol allocation, derived from trade volume ─────────────────────
  const protocolAllocation = useMemo(() => {
    const rows = tradeRows ?? []
    const totals: Record<string, number> = {}
    rows.forEach(t => { totals[t.protocol] = (totals[t.protocol] ?? 0) + (t.amount_usd ?? 0) })
    const grand = Object.values(totals).reduce((s, v) => s + v, 0)
    return Object.entries(totals)
      .map(([name, volume]) => ({ name, volume, pct: grand > 0 ? Math.round((volume / grand) * 100) : 0 }))
      .sort((a, b) => b.volume - a.volume)
  }, [tradeRows])

  // ── real realized P&L for today (UTC) ───────────────────────────────────────
  const dailyPnl = useMemo(() => {
    const rows = tradeRows ?? []
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    return rows
      .filter(t => t.status === 'success' && new Date(t.created_at) >= todayStart)
      .reduce((s, t) => s + (t.pnl ?? 0), 0)
  }, [tradeRows])

  const avgDrawdown = activeAgents.length > 0
    ? activeAgents.reduce((s, a) => s + a.drawdownCurrent, 0) / activeAgents.length
    : 0

  const largestPosition = openPositions.length > 0
    ? Math.max(...openPositions.map(p => p.size))
    : 0

  // ── populate sliders from the active mandate's risk_params (once) ───────────
  useEffect(() => {
    if (initialized.current || activeMandates.length === 0) return
    const rp = activeMandates[0].riskParams as unknown as Record<string, unknown>
    const num = (key: string, fallback: number) => typeof rp[key] === 'number' ? rp[key] as number : fallback
    setMaxDrawdown(num('maxDrawdown', PRESETS.Balanced.maxDrawdown))
    setMaxNotional(num('maxNotional', PRESETS.Balanced.maxNotional))
    setMaxPositions(num('maxPositions', PRESETS.Balanced.maxPositions))
    setStopLoss(num('stopLoss', PRESETS.Balanced.stopLoss))
    setDrawdownLimit(num('drawdownLimit', PRESETS.Balanced.drawdownLimit))
    const dailyLoss = rp.maxDailyLoss
    setMaxDailyLoss(typeof dailyLoss === 'number' ? String(dailyLoss) : PRESETS.Balanced.maxDailyLoss)
    if (rp.cooldowns && typeof rp.cooldowns === 'object') {
      setCooldowns({ ...DEFAULT_COOLDOWNS, ...(rp.cooldowns as Partial<Cooldowns>) })
    }
    initialized.current = true
  }, [activeMandates])

  // ── populate venue allocations once real protocols are known ────────────────
  useEffect(() => {
    if (allocsInitialized.current || protocolAllocation.length === 0) return
    const rp = activeMandates[0]?.riskParams as unknown as Record<string, unknown> | undefined
    const saved = rp?.venueAllocations as Record<string, number> | undefined
    if (saved && Object.keys(saved).length > 0) {
      setAllocs(saved)
    } else {
      const init: Record<string, number> = {}
      protocolAllocation.forEach(p => { init[p.name] = p.pct })
      setAllocs(init)
    }
    allocsInitialized.current = true
  }, [protocolAllocation, activeMandates])

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
  const allocOk    = protocolAllocation.length === 0 || allocTotal === 100

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

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const updates = activeMandates.map(m => {
        const rp = (m.riskParams as unknown as Record<string, unknown>) ?? {}
        return supabase
          .from('mandates')
          .update({
            risk_params: {
              ...rp,
              maxDrawdown,
              maxNotional,
              maxPositions,
              stopLoss,
              drawdownLimit,
              maxDailyLoss: Number(maxDailyLoss) || 0,
              cooldowns,
              venueAllocations: allocs,
            },
          })
          .eq('id', m.id)
      })
      const results = await Promise.all(updates)
      const failed = results.find(r => r.error)
      if (failed?.error) throw failed.error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mandates'] })
      setConfirm(false)
      setChanged(false)
      setToastMsg(
        activeMandates.length > 0
          ? t(activeMandates.length === 1 ? 'Risk settings applied to {n} active mandate' : 'Risk settings applied to {n} active mandates')
              .replace('{n}', String(activeMandates.length))
          : t('Risk settings saved — no active mandates to apply to yet')
      )
    },
  })

  const handleApply = () => applyMutation.mutate()

  const mark = (fn: () => void) => { fn(); setChanged(true) }

  // ── real portfolio risk score ────────────────────────────────────────────────
  const score   = riskSummary?.score ?? 0
  const hasRisk = riskSummary?.hasData ?? false
  const level   = riskSummary?.level ?? 'Low Risk'
  const riskColor    = level === 'Low Risk' ? 'text-success' : level === 'Medium Risk' ? 'text-warning' : 'text-error'
  const riskBarColor = level === 'Low Risk' ? 'bg-success'   : level === 'Medium Risk' ? 'bg-warning'   : 'bg-error'
  const riskMessage = !hasRisk
    ? 'No active agents to monitor'
    : level === 'Low Risk' ? 'Within safe parameters'
    : level === 'Medium Risk' ? 'Approaching risk limits'
    : 'Exceeds safe risk limits'

  // ── real current exposure metrics ────────────────────────────────────────────
  const METRICS = useMemo(() => {
    const m: { label: string; value: string; warn: boolean }[] = [
      {
        label: 'Current Drawdown',
        value: activeAgents.length > 0 ? `-${avgDrawdown.toFixed(2)}%` : '—',
        warn: avgDrawdown > drawdownLimit,
      },
      {
        label: 'Largest Open Position',
        value: `$${largestPosition.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
        warn: largestPosition > maxNotional,
      },
      {
        label: 'Open Positions',
        value: `${openPositions.length} / ${maxPositions}`,
        warn: openPositions.length > maxPositions,
      },
    ]

    if (protocolAllocation.length > 0) {
      const top = protocolAllocation[0]
      m.push({
        label: `${t('Venue Concentration')} (${top.name})`,
        value: `${top.pct}%`,
        warn: top.pct > 50,
      })
    }

    const dailyLossLimit = Number(maxDailyLoss) || 0
    m.push({
      label: 'Daily Loss',
      value: `${dailyPnl >= 0 ? '+' : '-'}$${Math.abs(dailyPnl).toLocaleString('en-US', { maximumFractionDigits: 2 })} / $${dailyLossLimit.toLocaleString()}`,
      warn: dailyPnl < -dailyLossLimit,
    })

    return m
  }, [activeAgents.length, avgDrawdown, drawdownLimit, largestPosition, maxNotional, openPositions.length, maxPositions, protocolAllocation, dailyPnl, maxDailyLoss, t])

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{t('Risk Engine')}</h2>
          <p className="text-sm mt-0.5 text-text-secondary">
            {t('Hard limits your AI agents can never exceed. Applied to all mandates unless overridden.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          {/* Load Template dropdown */}
          <div className="relative" ref={templateRef}>
            <button
              onClick={() => setShowTemplate(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm border border-border text-text-secondary hover:text-text-primary hover:border-text-disabled transition-colors"
            >
              {t('Load Template')}
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
                    {activePreset === k && '✓ '}{t(k)}
                  </button>
                ))}
                <div className="border-t border-border">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-text-disabled cursor-not-allowed">
                    {t('Custom')}
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
            {t('Apply Changes')}
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
              <h4 className="text-sm font-semibold text-text-primary">{t('Global Risk Thresholds')}</h4>
              <p className="text-xs mt-0.5 text-text-secondary">
                {t('These apply across all agents unless a mandate specifies tighter limits.')}
              </p>
            </div>

            <RangeSlider
              label="Max Drawdown (%)"
              description="If total portfolio drops by this %, all agents pause automatically."
              min={0} max={50} value={maxDrawdown}
              format={v => `${v.toFixed(2)}%`}
              colorFn={v => v < 10 ? '#22C55E' : v <= 20 ? '#F5C542' : '#EF4444'}
              onChange={v => mark(() => setMaxDrawdown(v))}
              t={t}
            />

            <RangeSlider
              label="Max Notional Per Trade ($)"
              description="Maximum USD value of a single trade position."
              min={100} max={100000} value={maxNotional}
              format={v => `$${v.toLocaleString()}`}
              colorFn={() => '#0066FF'}
              onChange={v => mark(() => setMaxNotional(v))}
              t={t}
            />

            <RangeSlider
              label="Max Positions Open"
              description="Maximum number of concurrent open positions across all agents."
              min={1} max={50} value={maxPositions}
              colorFn={() => '#0066FF'}
              onChange={v => mark(() => setMaxPositions(v))}
              t={t}
            />

            <RangeSlider
              label="Stop Loss (%)"
              description="Auto-close a position if it falls this % below entry price."
              min={0} max={50} value={stopLoss}
              format={v => `${v.toFixed(2)}%`}
              colorFn={() => '#F5C542'}
              onChange={v => mark(() => setStopLoss(v))}
              t={t}
            />

            <RangeSlider
              label="Per-Agent Drawdown Limit (%)"
              description="Per-agent drawdown limit before that agent pauses."
              min={0} max={30} value={drawdownLimit}
              format={v => `${v.toFixed(2)}%`}
              colorFn={v => v < 10 ? '#22C55E' : v <= 20 ? '#F5C542' : '#EF4444'}
              onChange={v => mark(() => setDrawdownLimit(v))}
              t={t}
            />

            {/* Max Daily Loss — plain input */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-text-primary">{t('Max Daily Loss ($)')}</p>
              <p className="text-xs text-text-secondary">
                {t('If total realized + unrealized loss exceeds this today, all agents pause until midnight UTC.')}
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
              <h4 className="text-sm font-semibold text-text-primary">{t('Venue Selection & Allocation')}</h4>
              <p className="text-xs mt-0.5 text-text-secondary">
                {t("Allocation limits based on real trade volume across protocols you've used.")}
              </p>
            </div>

            {protocolAllocation.length === 0 ? (
              <p className="text-xs text-text-secondary">
                {t('No trade activity yet — allocation limits will appear once your agents start trading.')}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div style={{ minWidth: 480 }}>

                    {/* Table header */}
                    <div className="grid text-[10px] font-semibold uppercase tracking-wider px-3 py-2 rounded-md bg-page text-text-disabled"
                      style={{ gridTemplateColumns: '1fr 80px 140px 90px 80px' }}>
                      <span>{t('Protocol')}</span>
                      <span>{t('Status')}</span>
                      <span>{t('Max Allocation')}</span>
                      <span className="text-right">{t('Volume')}</span>
                      <span className="text-right">{t('Actions')}</span>
                    </div>

                    {protocolAllocation.map((p, i) => {
                      const pct = allocs[p.name] ?? 0
                      const c   = PROTO_PALETTE[i % PROTO_PALETTE.length]
                      return (
                        <div
                          key={p.name}
                          className="grid items-center px-3 py-2.5 border-b border-border"
                          style={{ gridTemplateColumns: '1fr 80px 140px 90px 80px' }}
                        >
                          {/* Protocol name + icon */}
                          <div className="flex items-center gap-2">
                            {/* Palette colors — must be inline */}
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
                            {t('ACTIVE')} ✓
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
                                aria-label={`${p.name} ${t('allocation')}`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={pct}
                                onChange={e => mark(() => setAllocs(prev => ({ ...prev, [p.name]: Number(e.target.value) })))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                            <span className="text-sm font-bold text-text-primary w-8 text-right shrink-0">{pct}%</span>
                          </div>

                          <span className="text-xs text-right text-text-secondary">
                            ${p.volume.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </span>

                          <div className="flex justify-end">
                            <Link
                              href="/dashboard/protocols"
                              className="text-[11px] px-2 py-0.5 rounded border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors inline-block"
                            >
                              {t('Configure')}
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
                  {t('Total:')} {allocTotal}%
                  {allocOk ? ' ✓' : ` — ${t('adjust before applying')}`}
                </div>
              </>
            )}
          </div>

          {/* Section 3: Cooldown Periods */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">{t('Cooldown Periods')}</h4>

            {([
              { label: 'After stop-loss triggered',               key: 'stopLoss' as const },
              { label: 'After drawdown limit hit',                key: 'drawdown' as const },
              { label: 'After trade failure',                     key: 'failure'  as const },
              { label: 'Between repeat trades (same asset)',      key: 'repeat'   as const },
            ]).map(row => (
              <div key={row.key} className="flex flex-wrap items-center justify-between gap-2 py-1">
                <span className="text-sm text-text-secondary">{t(row.label)}</span>
                <select
                  value={cooldowns[row.key]}
                  onChange={e => mark(() => setCooldowns(prev => ({ ...prev, [row.key]: e.target.value })))}
                  aria-label={t(row.label)}
                  className="rounded-md px-3 py-1.5 text-sm text-text-secondary bg-page border border-border focus:outline-none focus:border-primary cursor-pointer min-w-28 transition-colors"
                >
                  {COOLDOWN_OPTIONS.map(o => <option key={o} value={o}>{t(o)}</option>)}
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
              {t('Portfolio Risk Score')}
            </p>

            <div className="text-center space-y-3">
              <p className={cn('text-5xl font-black', riskColor)}>{hasRisk ? `${score}%` : '—'}</p>

              {/* Health bar — dynamic width must be inline */}
              <div className="h-2 rounded-full overflow-hidden bg-border">
                <div
                  className={cn('h-2 rounded-full transition-all', riskBarColor)}
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
              </div>

              <div className={cn('flex items-center justify-center gap-1.5', riskColor)}>
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-bold">{hasRisk ? t(level).toUpperCase() : t('NO DATA')}</span>
              </div>
              <p className="text-xs text-text-secondary">{t(riskMessage)}</p>
            </div>
          </div>

          {/* Current Exposure */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h4 className="text-sm font-semibold text-text-primary mb-4">{t('Current Exposure')}</h4>

            <div className="flex flex-col">
              {METRICS.map((m, i) => (
                <div
                  key={m.label}
                  className={cn(
                    'flex items-center justify-between py-2.5',
                    i < METRICS.length - 1 && 'border-b border-border',
                  )}
                >
                  <span className="text-xs text-text-secondary">{t(m.label)}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-text-primary">{m.value}</span>
                    {m.warn ? (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {t('Near limit')}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('Within limit')}
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
              {t('Quick Presets')}
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
                  {activePreset === k && '✓ '}{t(k)}
                </button>
              ))}
            </div>
          </div>

          {/* Unsaved changes notice */}
          {changed && (
            <div className="rounded-lg p-4 text-xs bg-primary/5 border border-primary/25 text-text-link">
              <p className="font-semibold mb-1">{t('Unsaved changes')}</p>
              <p className="text-text-secondary">
                {t('Click "Apply Changes" to save.')}{' '}
                {activeAgents.length > 0
                  ? t(activeAgents.length === 1 ? '{n} active agent will be affected.' : '{n} active agents will be affected.')
                      .replace('{n}', String(activeAgents.length))
                  : t('No active agents are currently running.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────────────────── */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => !applyMutation.isPending && setConfirm(false)}
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
                {t('Apply Risk Settings?')}
              </h3>
              <button
                onClick={() => setConfirm(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label={t('Cancel')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-text-secondary">
              {t('These changes update the risk parameters stored on your active mandates and apply to their agents immediately.')}
            </p>

            <div className="rounded-md px-4 py-3 text-sm space-y-1 bg-page border border-border">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{t('Active mandates')}</span>
                <span className="font-semibold text-text-primary">{activeMandates.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{t('Active agents')}</span>
                <span className="font-semibold text-warning">{activeAgents.length}</span>
              </div>
            </div>

            {applyMutation.isError && (
              <p className="text-xs text-error">{t('Failed to apply changes. Please try again.')}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-60"
              >
                {applyMutation.isPending && (
                  <span className="h-4 w-4 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                )}
                {t('Apply Changes')}
              </button>
              <button
                onClick={() => setConfirm(false)}
                disabled={applyMutation.isPending}
                className="px-5 py-2.5 rounded-md text-sm border border-border text-text-secondary hover:text-text-primary hover:border-text-disabled transition-colors disabled:opacity-60"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
