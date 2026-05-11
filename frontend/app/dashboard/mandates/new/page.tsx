'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2, ChevronRight, ChevronLeft,
  Sparkles, Hash, Info,
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

// ── Schema ───────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name:         z.string().min(2, 'Name must be at least 2 characters').max(255),
  mandate_text: z.string().min(10, 'Mandate must be at least 10 characters').max(2000),
  base_currency: z.enum(['USDC', 'USDT', 'ETH', 'MNT']),
})

const step2Schema = z.object({
  capital_cap:     z.number().min(0).nullable(),
  maxDrawdown:     z.number().min(0).max(100),
  maxPosition:     z.number().min(0).max(100),
  stopLoss:        z.number().min(0).max(100),
  maxPositions:    z.number().min(1).max(50),
  cooldownHours:   z.number().min(0).max(168),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

// ── Example chips ─────────────────────────────────────────────────────────────

const EXAMPLES = [
  'Buy ETH when RSI drops below 30, sell when it hits 70. Max 20% per position, 2% stop loss.',
  'Yield farm USDC on Agni Finance. Reinvest profits daily. Never hold more than 50% in a single pool.',
  'DCA into MNT weekly. Stop if drawdown exceeds 15% of capital. Maximum 5 concurrent positions.',
  'Arbitrage stablecoin pairs on Merchant Moe. Never trade more than $10k per transaction.',
]

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Describe', 'Risk', 'Deploy']
  return (
    <div className="flex items-center gap-0">
      {labels.map((label, i) => {
        const step = i + 1
        const done    = step < current
        const active  = step === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                  done   ? 'bg-success text-white' :
                  active ? 'bg-primary text-white' :
                           'bg-surface border border-border text-text-secondary',
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
              <span className={cn('text-sm', active ? 'text-text-primary font-medium' : 'text-text-secondary')}>
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div className={cn('h-px w-12 mx-3', done ? 'bg-success' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Live Parse Panel ──────────────────────────────────────────────────────────

function ParsePanel({
  result, loading, error,
}: {
  result: Record<string, unknown> | null
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2.5 py-8 justify-center">
        <Spinner size="sm" />
        <span className="text-sm text-text-secondary">Parsing with Claude AI...</span>
      </div>
    )
  }

  if (error) {
    return (
      <AlertBanner severity="warning" className="text-xs">
        {error}
      </AlertBanner>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
        <Sparkles className="h-8 w-8 text-text-secondary opacity-40" />
        <p className="text-sm text-text-secondary">Start typing your mandate</p>
        <p className="text-xs text-text-secondary opacity-70">
          AI will parse it into a structured policy in real time
        </p>
      </div>
    )
  }

  const rows = Object.entries(result).filter(([, v]) => v !== null && v !== undefined)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-success font-medium mb-3">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Policy parsed by Claude Sonnet
      </div>
      {rows.map(([key, value]) => (
        <div key={key} className="flex items-start justify-between gap-2 text-xs">
          <span className="text-text-secondary font-medium shrink-0 capitalize">
            {key.replace(/_/g, ' ')}
          </span>
          <span className="text-text-primary text-right break-all">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Risk Slider ───────────────────────────────────────────────────────────────

function RiskSlider({
  label, hint, min, max, step = 1, value, onChange, suffix = '%',
}: {
  label: string; hint: string; min: number; max: number
  step?: number; value: number; onChange: (v: number) => void; suffix?: string
}) {
  const pct = ((value - min) / (max - min)) * 100

  const color =
    pct < 33 ? 'text-success' :
    pct < 66 ? 'text-warning' : 'text-error'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <span className={cn('text-sm font-bold tabular-nums', color)}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <p className="text-xs text-text-secondary">{hint}</p>
    </div>
  )
}

// ── Review Section ────────────────────────────────────────────────────────────

function PolicyHashBadge({ hash }: { hash: string | null }) {
  if (!hash) return null
  return (
    <div className="rounded-lg border border-border bg-surface p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        <Hash className="h-3.5 w-3.5" />
        Policy Hash
      </div>
      <p className="font-mono-data text-text-primary break-all">{hash}</p>
      <p className="text-xs text-text-secondary">
        SHA-256 fingerprint of your parsed policy. Will be posted on Mantle Network.
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewMandatePage() {
  const router = useRouter()
  const [step, setStep]                 = useState(1)
  const [step1Data, setStep1Data]       = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data]       = useState<Step2Data | null>(null)
  const [parseResult, setParseResult]   = useState<Record<string, unknown> | null>(null)
  const [policyHash, setPolicyHash]     = useState<string | null>(null)

  const { parse, result: liveResult, loading: parseLoading, error: parseError } = useParsePreview()
  const { mutate: createMandate, isPending: creating, error: createError } = useCreateMandate()

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { base_currency: 'USDC', name: '', mandate_text: '' },
  })

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      capital_cap: null,
      maxDrawdown:   15,
      maxPosition:   20,
      stopLoss:       5,
      maxPositions:   5,
      cooldownHours:  1,
    },
  })

  const mandateText = form1.watch('mandate_text')

  useEffect(() => {
    parse(mandateText)
  }, [mandateText, parse])

  useEffect(() => {
    if (liveResult) {
      setParseResult(liveResult.parsed_policy as Record<string, unknown>)
      setPolicyHash(liveResult.policy_hash)
    }
  }, [liveResult])

  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data)
    setStep(2)
  }

  const onStep2Submit = (data: Step2Data) => {
    setStep2Data(data)
    setStep(3)
  }

  const onDeploy = () => {
    if (!step1Data || !step2Data) return

    const { maxDrawdown, maxPosition, stopLoss, maxPositions, cooldownHours, capital_cap } = step2Data

    createMandate(
      {
        name:          step1Data.name,
        mandate_text:  step1Data.mandate_text,
        base_currency: step1Data.base_currency,
        capital_cap:   capital_cap ?? undefined,
        risk_params: { maxDrawdown, maxPosition, stopLoss, maxPositions, cooldownHours },
        status:        'active',
      },
      {
        onSuccess: (mandate) => router.push(`/dashboard/mandates/${mandate.id}`),
      },
    )
  }

  const createApiError = createError
    ? ((createError as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to create mandate')
    : null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text-primary">New Mandate</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Define your strategy in plain English — AI handles the rest
        </p>
      </div>

      <div className="mb-6">
        <StepIndicator current={step} total={3} />
      </div>

      {/* Step 1: Describe */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1Submit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: text inputs */}
            <div className="space-y-4">
              <Card padding="md">
                <div className="space-y-4">
                  <Input
                    label="Mandate name"
                    placeholder="e.g. Aggressive ETH DCA"
                    error={form1.formState.errors.name?.message}
                    {...form1.register('name')}
                  />

                  <div className="space-y-2">
                    <Controller
                      name="mandate_text"
                      control={form1.control}
                      render={({ field }) => (
                        <Textarea
                          label="Describe your mandate"
                          placeholder="Write your trading strategy in plain English. Include assets, triggers, risk limits, and protocols you want to use..."
                          rows={10}
                          counter
                          maxLength={2000}
                          error={form1.formState.errors.mandate_text?.message}
                          {...field}
                        />
                      )}
                    />

                    <div className="space-y-1.5">
                      <p className="text-xs text-text-secondary font-medium">Examples</p>
                      <div className="flex flex-wrap gap-1.5">
                        {EXAMPLES.map((ex, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => form1.setValue('mandate_text', ex, { shouldValidate: true })}
                            className="text-xs px-2.5 py-1 rounded-full border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors text-left max-w-xs truncate"
                          >
                            {ex.slice(0, 48)}…
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Currency selector */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Base currency</label>
                    <div className="flex gap-2">
                      {(['USDC', 'USDT', 'ETH', 'MNT'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => form1.setValue('base_currency', c)}
                          className={cn(
                            'flex-1 h-9 rounded-lg border text-sm font-medium transition-colors',
                            form1.watch('base_currency') === c
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-text-secondary hover:border-text-secondary',
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: live parse panel */}
            <Card padding="md" className="h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-text-primary">Live AI Preview</h3>
                {parseLoading && <Spinner size="sm" className="ml-auto" />}
              </div>
              <ParsePanel
                result={parseResult}
                loading={parseLoading}
                error={parseError}
              />
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" size="lg">
              Continue to Risk Settings
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Risk */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2Submit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-text-primary mb-5">Risk Parameters</h3>
              <div className="space-y-6">
                <Controller name="maxDrawdown" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Max Drawdown" hint="Stop trading if portfolio drops by this much" min={0} max={50} value={field.value} onChange={field.onChange} />
                )} />
                <Controller name="maxPosition" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Max Position Size" hint="Maximum % of capital in a single position" min={0} max={100} value={field.value} onChange={field.onChange} />
                )} />
                <Controller name="stopLoss" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Stop Loss" hint="Exit position if it loses this much" min={0} max={50} value={field.value} onChange={field.onChange} />
                )} />
                <Controller name="maxPositions" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Max Concurrent Positions" hint="Maximum open positions at any time" min={1} max={20} value={field.value} onChange={field.onChange} suffix="" />
                )} />
                <Controller name="cooldownHours" control={form2.control} render={({ field }) => (
                  <RiskSlider label="Cooldown Period" hint="Hours to wait after a stop-loss trigger" min={0} max={72} value={field.value} onChange={field.onChange} suffix="h" />
                )} />
              </div>
            </Card>

            <div className="space-y-4">
              <Card padding="md">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Capital Limit</h3>
                <Controller
                  name="capital_cap"
                  control={form2.control}
                  render={({ field }) => (
                    <Input
                      label="Maximum capital (USD)"
                      type="number"
                      placeholder="Leave blank for no limit"
                      error={form2.formState.errors.capital_cap?.message}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  )}
                />
              </Card>

              <AlertBanner severity="info" title="Conservative defaults applied">
                These risk parameters are encoded alongside your mandate text into the on-chain
                policy hash. The AI agent cannot exceed these limits.
              </AlertBanner>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
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

      {/* Step 3: Review + Deploy */}
      {step === 3 && step1Data && step2Data && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Mandate summary */}
            <Card padding="md">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Mandate Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Name</span>
                  <span className="text-text-primary font-medium">{step1Data.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Currency</span>
                  <Badge variant="primary">{step1Data.base_currency}</Badge>
                </div>
                {step2Data.capital_cap && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Capital cap</span>
                    <span className="text-text-primary">${step2Data.capital_cap.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-text-secondary mb-1.5">Mandate text</p>
                  <p className="text-xs text-text-primary leading-relaxed bg-surface rounded-lg p-3">
                    {step1Data.mandate_text}
                  </p>
                </div>
              </div>
            </Card>

            {/* Risk + Policy */}
            <div className="space-y-3">
              <Card padding="md">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Risk Parameters</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Max Drawdown',   `${step2Data.maxDrawdown}%`],
                    ['Max Position',   `${step2Data.maxPosition}%`],
                    ['Stop Loss',      `${step2Data.stopLoss}%`],
                    ['Max Positions',  String(step2Data.maxPositions)],
                    ['Cooldown',       `${step2Data.cooldownHours}h`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-text-secondary">{k}</span>
                      <span className="text-text-primary font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <PolicyHashBadge hash={policyHash} />

              {!policyHash && (
                <AlertBanner severity="warning" title="Policy not yet parsed">
                  Go back to Step 1 and enter your mandate text so the AI can generate a policy hash.
                </AlertBanner>
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

          <div className="flex items-start gap-2 text-xs text-text-secondary">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              This saves your mandate as a draft. To deploy a trading agent against it, open the mandate
              and click &quot;Deploy Agent&quot; after connecting your Mantle wallet.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
