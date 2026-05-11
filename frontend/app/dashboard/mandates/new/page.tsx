'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2, ChevronRight, ChevronLeft,
  Sparkles, Hash, Info, Shield, Zap,
  TrendingUp, RefreshCw, Layers, ArrowRightLeft,
  Lock, AlertTriangle, Network,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Spinner } from '@/components/ui/Spinner'
import { useCreateMandate, useParsePreview } from '@/hooks/useMandates'
import { cn } from '@/lib/utils'

// ── Schema ────────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name:          z.string().min(2, 'Name must be at least 2 characters').max(255),
  mandate_text:  z.string().min(10, 'Mandate must be at least 10 characters').max(2000),
  base_currency: z.enum(['USDC', 'USDT', 'ETH', 'MNT']),
})

const step2Schema = z.object({
  capital_cap:    z.number().min(0).nullable(),
  maxDrawdown:    z.number().min(0).max(100),
  maxPosition:    z.number().min(0).max(100),
  stopLoss:       z.number().min(0).max(100),
  maxPositions:   z.number().min(1).max(50),
  cooldownHours:  z.number().min(0).max(168),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

// ── Example strategies ────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    label: 'RSI Reversal',
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    text: 'Buy ETH when RSI drops below 30, sell when it hits 70. Max 20% per position, 2% stop loss.',
  },
  {
    label: 'Yield Farming',
    icon: RefreshCw,
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/20',
    text: 'Yield farm USDC on Agni Finance. Reinvest profits daily. Never hold more than 50% in a single pool.',
  },
  {
    label: 'DCA Strategy',
    icon: Layers,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
    text: 'DCA into MNT weekly. Stop if drawdown exceeds 15% of capital. Maximum 5 concurrent positions.',
  },
  {
    label: 'Arbitrage',
    icon: ArrowRightLeft,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    text: 'Arbitrage stablecoin pairs on Merchant Moe. Never trade more than $10k per transaction.',
  },
]

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Describe',   desc: 'Define your strategy' },
  { label: 'Risk',       desc: 'Set safety parameters' },
  { label: 'Deploy',     desc: 'Review & go live' },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center w-full max-w-md mx-auto">
      {STEPS.map((s, i) => {
        const step   = i + 1
        const done   = step < current
        const active = step === current
        return (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  done   ? 'bg-success text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' :
                  active ? 'bg-primary text-white shadow-[0_0_16px_rgba(99,102,241,0.5)] ring-4 ring-primary/20' :
                           'bg-surface border-2 border-border text-text-secondary',
                )}
              >
                {done ? <CheckCircle2 className="h-4.5 w-4.5" /> : step}
              </div>
              <div className="text-center">
                <p className={cn('text-xs font-semibold', active ? 'text-text-primary' : 'text-text-secondary')}>
                  {s.label}
                </p>
                <p className="text-[10px] text-text-secondary hidden sm:block">{s.desc}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-3 mb-5 rounded-full transition-all duration-500',
                done ? 'bg-success' : 'bg-border',
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── AI Parse Panel ────────────────────────────────────────────────────────────

const FIELD_COLORS: Record<string, string> = {
  asset:        'bg-blue-400/10 text-blue-400 border-blue-400/30',
  trigger:      'bg-purple-400/10 text-purple-400 border-purple-400/30',
  venue:        'bg-green-400/10 text-green-400 border-green-400/30',
  schedule:     'bg-amber-400/10 text-amber-400 border-amber-400/30',
  risk_per_trade: 'bg-red-400/10 text-red-400 border-red-400/30',
  take_profit:  'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
  stop_loss:    'bg-orange-400/10 text-orange-400 border-orange-400/30',
  strategy_type: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/30',
}

function ParsePanel({
  result, loading, error,
}: {
  result: Record<string, unknown> | null
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="relative">
          <Spinner size="sm" />
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        </div>
        <span className="text-sm text-text-secondary">Claude Sonnet is parsing…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        {error}
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">AI Preview</p>
          <p className="text-xs text-text-secondary mt-0.5 max-w-[200px]">
            Type your mandate and Claude will extract a structured policy in real time
          </p>
        </div>
      </div>
    )
  }

  const rows = Object.entries(result).filter(([, v]) => v !== null && v !== undefined && v !== '')

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Policy extracted
        </div>
        <div className="ml-auto text-[10px] font-medium text-text-secondary bg-surface border border-border px-2 py-0.5 rounded-full">
          Claude Sonnet
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {rows.map(([key, value]) => {
          const colorClass = FIELD_COLORS[key] ?? 'bg-surface text-text-secondary border-border'
          return (
            <div
              key={key}
              className={cn('flex flex-col rounded-lg border px-3 py-2 text-xs', colorClass)}
            >
              <span className="font-medium opacity-70 capitalize text-[10px] uppercase tracking-wide">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="font-semibold mt-0.5 break-all">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Risk level helper ─────────────────────────────────────────────────────────

function riskLevel(maxDrawdown: number, stopLoss: number) {
  const score = maxDrawdown + stopLoss * 2
  if (score <= 20) return { label: 'Conservative', color: 'text-success', bar: 'bg-success', width: 'w-1/4' }
  if (score <= 45) return { label: 'Moderate',     color: 'text-warning', bar: 'bg-warning', width: 'w-1/2' }
  if (score <= 75) return { label: 'Aggressive',   color: 'text-orange-400', bar: 'bg-orange-400', width: 'w-3/4' }
  return               { label: 'High Risk',     color: 'text-error',   bar: 'bg-error',   width: 'w-full' }
}

// ── Risk Slider ───────────────────────────────────────────────────────────────

function RiskSlider({
  label, hint, min, max, step = 1, value, onChange, suffix = '%',
}: {
  label: string; hint: string; min: number; max: number
  step?: number; value: number; onChange: (v: number) => void; suffix?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  const trackColor =
    pct < 33 ? '#10B981' :
    pct < 66 ? '#F59E0B' : '#EF4444'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <span
          className="text-sm font-bold tabular-nums px-2.5 py-0.5 rounded-full text-white"
          style={{ backgroundColor: trackColor + '22', color: trackColor }}
        >
          {value}{suffix}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-border">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: trackColor }}
        />
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          name={`risk-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white shadow-md transition-all"
          style={{ left: `calc(${pct}% - 8px)`, backgroundColor: trackColor }}
        />
      </div>
      <p className="text-xs text-text-secondary">{hint}</p>
    </div>
  )
}

// ── Policy Hash Card ──────────────────────────────────────────────────────────

function PolicyHashCard({ hash }: { hash: string | null }) {
  if (!hash) return null
  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Hash className="h-3.5 w-3.5" />
          </div>
          On-Chain Policy Hash
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-text-secondary bg-surface border border-border px-2 py-0.5 rounded-full">
          <Network className="h-3 w-3" />
          Mantle Sepolia
        </div>
      </div>
      <p className="font-mono text-[11px] text-text-primary break-all leading-relaxed bg-surface/50 rounded-lg p-2.5 border border-border/50">
        {hash}
      </p>
      <p className="text-xs text-text-secondary flex items-center gap-1.5">
        <Lock className="h-3 w-3" />
        SHA-256 fingerprint — immutably posted to Mantle Network at deployment
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewMandatePage() {
  const router = useRouter()
  const [step, setStep]               = useState(1)
  const [step1Data, setStep1Data]     = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data]     = useState<Step2Data | null>(null)
  const [parseResult, setParseResult] = useState<Record<string, unknown> | null>(null)
  const [policyHash, setPolicyHash]   = useState<string | null>(null)

  const { parse, result: liveResult, loading: parseLoading, error: parseError } = useParsePreview()
  const { mutate: createMandate, isPending: creating, error: createError } = useCreateMandate()

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { base_currency: 'USDC', name: '', mandate_text: '' },
  })

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      capital_cap:   null,
      maxDrawdown:   15,
      maxPosition:   20,
      stopLoss:       5,
      maxPositions:   5,
      cooldownHours:  1,
    },
  })

  const mandateText = form1.watch('mandate_text')

  useEffect(() => { parse(mandateText) }, [mandateText, parse])

  useEffect(() => {
    if (liveResult) {
      setParseResult(liveResult.parsed_policy as Record<string, unknown>)
      setPolicyHash(liveResult.policy_hash)
    }
  }, [liveResult])

  const onStep1Submit = (data: Step1Data) => { setStep1Data(data); setStep(2) }
  const onStep2Submit = (data: Step2Data) => { setStep2Data(data); setStep(3) }

  const onDeploy = () => {
    if (!step1Data || !step2Data) return
    const { maxDrawdown, maxPosition, stopLoss, maxPositions, cooldownHours, capital_cap } = step2Data
    createMandate(
      {
        name:          step1Data.name,
        mandate_text:  step1Data.mandate_text,
        base_currency: step1Data.base_currency,
        capital_cap:   capital_cap ?? undefined,
        risk_params:   { maxDrawdown, maxPosition, stopLoss, maxPositions, cooldownHours },
        status:        'active',
      },
      { onSuccess: (m) => router.push(`/dashboard/mandates/${m.id}`) },
    )
  }

  const createApiError = createError
    ? ((createError as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to create mandate')
    : null

  const watchedDrawdown  = form2.watch('maxDrawdown')
  const watchedStopLoss  = form2.watch('stopLoss')
  const risk             = riskLevel(watchedDrawdown, watchedStopLoss)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">New Mandate</h1>
        <p className="text-sm text-text-secondary">
          Describe your strategy in plain English — Claude AI turns it into an enforceable on-chain policy
        </p>
      </div>

      {/* ── Step progress ── */}
      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <StepIndicator current={step} />
      </div>

      {/* ══════════════════════════════════════════════════════
          Step 1 — Describe
      ══════════════════════════════════════════════════════ */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Left col: inputs */}
            <div className="lg:col-span-3 space-y-4">

              {/* Mandate name */}
              <Card padding="md">
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Mandate name"
                      placeholder="e.g. ETH Conservative RSI Strategy"
                      error={form1.formState.errors.name?.message}
                      {...form1.register('name')}
                    />
                  </div>

                  {/* Mandate text */}
                  <Controller
                    name="mandate_text"
                    control={form1.control}
                    render={({ field }) => (
                      <Textarea
                        label="Strategy description"
                        placeholder="Write your trading strategy in plain English. Include assets, entry / exit triggers, risk limits, and DeFi protocols you want to use on Mantle Network…"
                        rows={7}
                        counter
                        maxLength={2000}
                        error={form1.formState.errors.mandate_text?.message}
                        {...field}
                      />
                    )}
                  />

                  {/* Example strategy chips */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Quick-start examples
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {EXAMPLES.map((ex) => {
                        const Icon = ex.icon
                        return (
                          <button
                            key={ex.label}
                            type="button"
                            onClick={() => form1.setValue('mandate_text', ex.text, { shouldValidate: true })}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all hover:scale-[1.01] active:scale-[0.99]',
                              ex.bg,
                            )}
                          >
                            <Icon className={cn('h-4 w-4 shrink-0', ex.color)} />
                            <span className={cn('text-xs font-semibold', ex.color)}>{ex.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Base currency */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Base currency</label>
                    <div className="flex gap-2">
                      {(['USDC', 'USDT', 'ETH', 'MNT'] as const).map((c) => {
                        const active = form1.watch('base_currency') === c
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => form1.setValue('base_currency', c)}
                            className={cn(
                              'flex-1 h-10 rounded-lg border text-sm font-semibold transition-all duration-150',
                              active
                                ? 'border-primary bg-primary text-white shadow-sm shadow-primary/30'
                                : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary',
                            )}
                          >
                            {c}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right col: live AI preview */}
            <div className="lg:col-span-2">
              <div className="sticky top-6 rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-surface/50">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">Live AI Preview</h3>
                  {parseLoading && <Spinner size="sm" className="ml-auto" />}
                </div>
                <div className="p-4">
                  <ParsePanel result={parseResult} loading={parseLoading} error={parseError} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Continue to Risk Settings
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════
          Step 2 — Risk Parameters
      ══════════════════════════════════════════════════════ */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-5">

          {/* Risk level indicator banner */}
          <div className="rounded-xl border border-border bg-surface/50 p-4 flex items-center gap-4">
            <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0',
              risk.label === 'Conservative' ? 'bg-success/10' :
              risk.label === 'Moderate'     ? 'bg-warning/10' :
              risk.label === 'Aggressive'   ? 'bg-orange-400/10' : 'bg-error/10'
            )}>
              <Shield className={cn('h-5 w-5', risk.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-text-primary">Risk Profile</span>
                <span className={cn('text-sm font-bold', risk.color)}>{risk.label}</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-300', risk.bar, risk.width)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Sliders */}
            <Card padding="lg" className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-text-primary">Risk Parameters</h3>
              </div>
              <div className="space-y-7">
                <Controller name="maxDrawdown" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Max Drawdown" hint="Halt trading if portfolio drops by this percentage" min={0} max={50} value={field.value} onChange={field.onChange} />
                )} />
                <Controller name="maxPosition" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Max Position Size" hint="Maximum portfolio allocation per single position" min={0} max={100} value={field.value} onChange={field.onChange} />
                )} />
                <Controller name="stopLoss" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Stop Loss" hint="Automatically exit if a position loses this much" min={0} max={50} value={field.value} onChange={field.onChange} />
                )} />
                <Controller name="maxPositions" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Max Concurrent Positions" hint="How many trades can be open simultaneously" min={1} max={20} value={field.value} onChange={field.onChange} suffix="" />
                )} />
                <Controller name="cooldownHours" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Cooldown Period" hint="Pause duration after a stop-loss is triggered" min={0} max={72} value={field.value} onChange={field.onChange} suffix="h" />
                )} />
              </div>
            </Card>

            {/* Capital + info */}
            <div className="space-y-4">
              <Card padding="md">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">Capital Limit</h3>
                </div>
                <Controller
                  name="capital_cap"
                  control={form2.control}
                  render={({ field }) => (
                    <Input
                      label="Max capital (USD)"
                      type="number"
                      placeholder="No limit"
                      error={form2.formState.errors.capital_cap?.message}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  )}
                />
                <p className="text-xs text-text-secondary mt-2">
                  Leave blank to allow unlimited capital allocation.
                </p>
              </Card>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  On-Chain Enforcement
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  These parameters are cryptographically encoded into your policy hash and enforced by the
                  <span className="text-text-primary font-medium"> RiskGuard</span> smart contract on Mantle Network.
                  The AI agent <strong className="text-error">cannot</strong> exceed these limits.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(1)} type="button">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" size="lg">
              Review &amp; Deploy
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════════════════════
          Step 3 — Review & Deploy
      ══════════════════════════════════════════════════════ */}
      {step === 3 && step1Data && step2Data && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Mandate summary */}
            <Card padding="md" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">Mandate Summary</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs text-text-secondary uppercase tracking-wide font-medium">Name</span>
                  <span className="text-sm text-text-primary font-semibold">{step1Data.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-xs text-text-secondary uppercase tracking-wide font-medium">Currency</span>
                  <Badge variant="primary">{step1Data.base_currency}</Badge>
                </div>
                {step2Data.capital_cap && (
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-xs text-text-secondary uppercase tracking-wide font-medium">Capital cap</span>
                    <span className="text-sm text-text-primary font-semibold">
                      ${step2Data.capital_cap.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="pt-1">
                  <p className="text-xs text-text-secondary uppercase tracking-wide font-medium mb-2">Strategy</p>
                  <p className="text-xs text-text-primary leading-relaxed bg-surface rounded-lg p-3 border border-border/50">
                    {step1Data.mandate_text}
                  </p>
                </div>
              </div>
            </Card>

            {/* Risk + hash */}
            <div className="space-y-4">
              <Card padding="md">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">Risk Parameters</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ['Max Drawdown',         `${step2Data.maxDrawdown}%`],
                    ['Max Position Size',    `${step2Data.maxPosition}%`],
                    ['Stop Loss',            `${step2Data.stopLoss}%`],
                    ['Max Open Positions',   `${step2Data.maxPositions}`],
                    ['Cooldown After Loss',  `${step2Data.cooldownHours}h`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                      <span className="text-xs text-text-secondary">{k}</span>
                      <span className="text-xs font-bold text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <PolicyHashCard hash={policyHash} />

              {!policyHash && (
                <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/5 p-4">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-warning">Policy hash missing</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Go back to Step 1 and enter your mandate text so Claude can generate the policy hash.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {createApiError && (
            <AlertBanner severity="error" title="Creation failed">
              {createApiError}
            </AlertBanner>
          )}

          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(2)} type="button">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button size="lg" onClick={onDeploy} loading={creating}>
              <CheckCircle2 className="h-4 w-4" />
              Save Mandate
            </Button>
          </div>

          <div className="flex items-start gap-2 text-xs text-text-secondary bg-surface/50 rounded-lg p-3 border border-border/50">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              This saves your mandate. To deploy a live trading agent, open the mandate and click{' '}
              <strong className="text-text-primary">Deploy Agent</strong> after connecting your Mantle wallet.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
