'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Hash, Copy, CheckCircle2, ExternalLink, Sparkles, TriangleAlert,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Skeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { useMandate, useUpdateMandate, useParsePreview } from '@/hooks/useMandates'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { BadgeVariant } from '@/components/ui/Badge'

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  draft:    'default',
  active:   'success',
  paused:   'warning',
  archived: 'default',
}

// ── RiskSlider ────────────────────────────────────────────────────────────────

function RiskSlider({
  label, hint, min, max, step = 1, value, onChange, suffix = '%',
}: {
  label: string; hint: string; min: number; max: number
  step?: number; value: number; onChange: (v: number) => void; suffix?: string
}) {
  const pct   = ((value - min) / (max - min)) * 100
  const color = pct < 33 ? 'text-success' : pct < 66 ? 'text-warning' : 'text-error'

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

// ── ParsePanel ────────────────────────────────────────────────────────────────

function ParsePanel({
  result, loading, error,
}: {
  result: Record<string, unknown> | null
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2.5 py-6 justify-center">
        <Spinner size="sm" />
        <span className="text-sm text-text-secondary">Parsing with Claude AI...</span>
      </div>
    )
  }

  if (error) {
    return <AlertBanner severity="warning" className="text-xs">{error}</AlertBanner>
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
        <Sparkles className="h-7 w-7 text-text-secondary opacity-40" />
        <p className="text-sm text-text-secondary">Edit mandate text to see updated policy</p>
      </div>
    )
  }

  const rows = Object.entries(result).filter(([, v]) => v !== null && v !== undefined)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-success font-medium mb-3">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Policy parsed by Claude AI
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MandateEditPage({ params }: { params: { id: string } }) {
  const { id }   = params
  const router   = useRouter()

  const { data: mandate, isLoading } = useMandate(id)
  const { mutate: update, isPending: saving, error: updateError } = useUpdateMandate(id)
  const { parse, result: liveResult, loading: parseLoading, error: parseError } = useParsePreview()

  const [name,          setName]          = useState('')
  const [mandateText,   setMandateText]   = useState('')
  const [baseCurrency,  setBaseCurrency]  = useState<'USDC' | 'USDT' | 'ETH' | 'MNT'>('USDC')
  const [maxDrawdown,   setMaxDrawdown]   = useState(15)
  const [maxPosition,   setMaxPosition]   = useState(20)
  const [stopLoss,      setStopLoss]      = useState(5)
  const [maxPositions,  setMaxPositions]  = useState(5)
  const [cooldownHours, setCooldownHours] = useState(1)
  const [capitalCap,    setCapitalCap]    = useState('')

  const [parseResult,   setParseResult]  = useState<Record<string, unknown> | null>(null)
  const [policyHash,    setPolicyHash]   = useState<string | null>(null)
  const [copied,        setCopied]       = useState(false)
  const [initialized,   setInitialized]  = useState(false)

  // Populate form from loaded mandate (once)
  useEffect(() => {
    if (mandate && !initialized) {
      setName(mandate.name)
      setMandateText(mandate.mandateText)
      setBaseCurrency(mandate.baseCurrency as 'USDC' | 'USDT' | 'ETH' | 'MNT')
      setMaxDrawdown(mandate.riskParams.maxDrawdown)
      setMaxPosition(mandate.riskParams.maxPosition)
      setStopLoss(mandate.riskParams.stopLoss)
      setMaxPositions(mandate.riskParams.maxPositions)
      setCooldownHours(mandate.riskParams.cooldownHours)
      if (mandate.capitalCap) setCapitalCap(String(mandate.capitalCap))
      setPolicyHash(mandate.policyHash)
      setInitialized(true)
    }
  }, [mandate, initialized])

  // Live parse as user edits mandate text
  useEffect(() => {
    if (initialized) parse(mandateText)
  }, [mandateText, parse, initialized])

  useEffect(() => {
    if (liveResult) {
      setParseResult(liveResult.parsed_policy as Record<string, unknown>)
      setPolicyHash(liveResult.policy_hash)
    }
  }, [liveResult])

  const copyHash = useCallback(() => {
    if (!policyHash) return
    navigator.clipboard.writeText(policyHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [policyHash])

  const handleUpdate = () => {
    update(
      {
        name,
        mandate_text: mandateText,
        base_currency: baseCurrency,
        capital_cap: capitalCap ? Number(capitalCap) : undefined,
        risk_params: { maxDrawdown, maxPosition, stopLoss, maxPositions, cooldownHours },
      },
      { onSuccess: () => router.push(`/dashboard/mandates/${id}`) },
    )
  }

  const apiError = updateError
    ? ((updateError as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Update failed')
    : null

  // ── loading ──
  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-5 w-full max-w-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-5 mt-6">
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-64" />
            <Skeleton className="h-72" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!mandate) {
    return (
      <div className="p-6">
        <AlertBanner severity="error" title="Mandate not found">
          This mandate does not exist or you don&apos;t have access to it.
        </AlertBanner>
      </div>
    )
  }

  const deployedLabel = mandate.createdAt ? formatDate(mandate.createdAt) : null

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-text-secondary hover:text-text-primary transition-colors p-1 -ml-1"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-text-primary truncate">
              Editing: {mandate.name}
              {deployedLabel && (
                <span className="text-text-secondary font-normal ml-2 text-base">
                  — Deployed {deployedLabel}
                </span>
              )}
            </h1>
            <Badge variant={STATUS_VARIANT[mandate.status]}>{mandate.status}</Badge>
          </div>
          <p className="text-sm text-text-secondary mt-0.5">Mandate ID: {mandate.id}</p>
        </div>
      </div>

      {/* Caution notice */}
      <AlertBanner severity="warning">
        <span className="font-semibold">Policy hash will regenerate.</span>{' '}
        Changes will generate a new on-chain policy hash. Any agent running this mandate will briefly pause during the update.
      </AlertBanner>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-5">

        {/* ── Left: form ───────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Mandate details */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Mandate Details</h3>
            <div className="space-y-4">
              <Input
                label="Mandate name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Conservative ETH Dip Buyer"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Base currency</label>
                <div className="flex gap-2">
                  {(['USDC', 'USDT', 'ETH', 'MNT'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBaseCurrency(c)}
                      className={cn(
                        'flex-1 h-9 rounded-lg border text-sm font-medium transition-colors',
                        baseCurrency === c
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-text-secondary hover:border-text-secondary',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Capital cap (USD)"
                type="number"
                value={capitalCap}
                onChange={(e) => setCapitalCap(e.target.value)}
                placeholder="Leave blank for no limit"
              />
            </div>
          </Card>

          {/* Hero textarea */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Your Trading Mandate
              <span className="ml-2 text-xs font-normal text-primary">— The Hero Field</span>
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Edit your strategy in plain English. The AI will re-parse it in real time.
            </p>
            <Textarea
              value={mandateText}
              onChange={(e) => setMandateText(e.target.value)}
              placeholder={`e.g. "Buy ETH on Mantle when the RSI drops below 30.\nNever risk more than 5% of my portfolio on a single trade.\nTake profit when I'm up 15%. Don't trade on weekends."`}
              rows={12}
              counter
              maxLength={2000}
              className="min-h-[280px] text-base leading-relaxed focus:ring-primary/20 focus:ring-[3px]"
            />
          </Card>

          {/* Risk params */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-text-primary mb-5">Risk Parameters</h3>
            <div className="space-y-6">
              <RiskSlider
                label="Max Drawdown"
                hint="Stop trading if portfolio drops by this much"
                min={0} max={50}
                value={maxDrawdown} onChange={setMaxDrawdown}
              />
              <RiskSlider
                label="Max Position Size"
                hint="Maximum % of capital in a single position"
                min={0} max={100}
                value={maxPosition} onChange={setMaxPosition}
              />
              <RiskSlider
                label="Stop Loss"
                hint="Exit position if it loses this much"
                min={0} max={50}
                value={stopLoss} onChange={setStopLoss}
              />
              <RiskSlider
                label="Max Concurrent Positions"
                hint="Maximum open positions at any time"
                min={1} max={20} suffix=""
                value={maxPositions} onChange={setMaxPositions}
              />
              <RiskSlider
                label="Cooldown Period"
                hint="Hours to wait after a stop-loss trigger"
                min={0} max={72} suffix="h"
                value={cooldownHours} onChange={setCooldownHours}
              />
            </div>
          </Card>
        </div>

        {/* ── Right: live parse + policy hash ──────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-6 self-start">

          {/* Live AI Preview */}
          <Card padding="md">
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

          {/* On-Chain Policy Hash */}
          <Card padding="md">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-3">
              <Hash className="h-3.5 w-3.5" />
              <span className="font-medium">On-Chain Policy Hash</span>
            </div>
            {policyHash ? (
              <div className="space-y-3">
                <p className="font-mono-data text-[11px] text-text-primary break-all bg-surface rounded-md p-2.5">
                  {policyHash}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyHash}
                    className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {copied
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      : <Copy className="h-3.5 w-3.5" />
                    }
                    {copied ? 'Copied!' : 'Copy hash'}
                  </button>
                  {mandate.onChainTx && (
                    <a
                      href={`https://explorer.mantle.xyz/tx/${mandate.onChainTx}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Explorer
                    </a>
                  )}
                </div>
                {mandateText !== mandate.mandateText && (
                  <p className="text-[10px] text-warning flex items-center gap-1">
                    <TriangleAlert className="h-3 w-3" />
                    Hash will change after saving
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">
                Will be generated on save
                <br />
                <span className="text-[10px] opacity-70">(computed from mandate content)</span>
              </p>
            )}
          </Card>

          {/* Risk summary */}
          <Card padding="sm" className="text-xs">
            <p className="font-semibold text-text-secondary uppercase tracking-wider text-[10px] mb-2">Risk Summary</p>
            <div className="space-y-1.5">
              {[
                ['Max Drawdown',  `${maxDrawdown}%`],
                ['Max Position',  `${maxPosition}%`],
                ['Stop Loss',     `${stopLoss}%`],
                ['Max Positions', String(maxPositions)],
                ['Cooldown',      `${cooldownHours}h`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-text-secondary">{k}</span>
                  <span className="text-text-primary font-medium">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Error */}
      {apiError && (
        <AlertBanner severity="error" title="Update failed">{apiError}</AlertBanner>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between pt-5 border-t border-border">
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          <p className="text-xs text-text-secondary hidden sm:block">
            Saving will regenerate the policy hash
          </p>
          {mandate.status === 'draft' && (
            <Button
              variant="secondary"
              onClick={() => update({ status: 'active' })}
              loading={saving}
            >
              Activate
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleUpdate}
            loading={saving}
            disabled={!mandateText.trim() || !name.trim()}
          >
            Update Mandate
          </Button>
        </div>
      </div>
    </div>
  )
}
