'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Hash, Copy, CheckCircle2, ExternalLink,
  Edit2, Bot, Pause, Archive, Shield, Network,
  TrendingUp, RefreshCw, Layers, ArrowRightLeft, Rocket,
  Calendar, DollarSign, Zap, Lock,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Skeleton } from '@/components/ui/Skeleton'
import { useMandate, useUpdateMandate } from '@/hooks/useMandates'
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

const STRATEGY_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  MEAN_REVERSION: { icon: TrendingUp,      color: 'text-blue-400',   bg: 'bg-blue-400/10',   label: 'Mean Reversion' },
  YIELD:          { icon: RefreshCw,        color: 'text-green-400',  bg: 'bg-green-400/10',  label: 'Yield Farming'  },
  DCA:            { icon: Layers,           color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'DCA'            },
  ARBITRAGE:      { icon: ArrowRightLeft,   color: 'text-amber-400',  bg: 'bg-amber-400/10',  label: 'Arbitrage'      },
  MOMENTUM:       { icon: Rocket,           color: 'text-pink-400',   bg: 'bg-pink-400/10',   label: 'Momentum'       },
}

const FIELD_COLORS: Record<string, string> = {
  asset:          'bg-blue-400/10   text-blue-400   border-blue-400/30',
  trigger:        'bg-purple-400/10 text-purple-400 border-purple-400/30',
  venue:          'bg-green-400/10  text-green-400  border-green-400/30',
  schedule:       'bg-amber-400/10  text-amber-400  border-amber-400/30',
  risk_per_trade: 'bg-red-400/10    text-red-400    border-red-400/30',
  take_profit:    'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
  stop_loss:      'bg-orange-400/10 text-orange-400  border-orange-400/30',
  strategy_type:  'bg-indigo-400/10 text-indigo-400  border-indigo-400/30',
}

function riskLabel(maxDrawdown: number, stopLoss: number) {
  const score = maxDrawdown + stopLoss * 2
  if (score <= 20) return { label: 'Conservative', color: 'text-success', barColor: 'bg-success', width: 25 }
  if (score <= 45) return { label: 'Moderate',     color: 'text-warning', barColor: 'bg-warning', width: 50 }
  if (score <= 75) return { label: 'Aggressive',   color: 'text-orange-400', barColor: 'bg-orange-400', width: 75 }
  return               { label: 'High Risk',     color: 'text-error',   barColor: 'bg-error',   width: 100 }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ViewSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-5">
        <div className="space-y-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-28" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MandateViewPage({ params }: { params: { id: string } }) {
  const { id }   = params
  const router   = useRouter()
  const [copied, setCopied] = useState(false)

  const { data: mandate, isLoading } = useMandate(id)
  const { mutate: update, isPending: updating } = useUpdateMandate(id)

  const copyHash = useCallback(() => {
    if (!mandate?.policyHash) return
    navigator.clipboard.writeText(mandate.policyHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [mandate?.policyHash])

  if (isLoading) return <ViewSkeleton />

  if (!mandate) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <AlertBanner severity="error" title="Mandate not found">
          This mandate does not exist or you don&apos;t have access to it.
        </AlertBanner>
      </div>
    )
  }

  const strategy = mandate.strategyType ? STRATEGY_META[mandate.strategyType] : null
  const risk     = riskLabel(mandate.riskParams.maxDrawdown, mandate.riskParams.stopLoss)

  const parsedRows = mandate.parsedPolicy
    ? Object.entries(mandate.parsedPolicy).filter(([, v]) => v !== null && v !== undefined && v !== '')
    : []

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => router.push('/dashboard/mandates')}
          className="mt-1 p-1 -ml-1 text-text-secondary hover:text-text-primary transition-colors rounded"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-text-primary truncate">{mandate.name}</h1>
            <Badge variant={STATUS_VARIANT[mandate.status]}>{mandate.status}</Badge>
            {strategy && (
              <span className={cn(
                'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full',
                strategy.bg, strategy.color,
              )}>
                <strategy.icon className="h-3 w-3" />
                {strategy.label}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1">
            ID: <span className="font-mono">{mandate.id}</span>
            {' · '}Created {formatDate(mandate.createdAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {mandate.status === 'active' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => update({ status: 'paused' as 'active' })}
              loading={updating}
            >
              <Pause className="h-3.5 w-3.5" />
              Pause
            </Button>
          )}
          {mandate.status === 'paused' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => update({ status: 'active' })}
              loading={updating}
            >
              <Zap className="h-3.5 w-3.5" />
              Activate
            </Button>
          )}
          {mandate.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => update({ status: 'archived' as 'active' })}
              loading={updating}
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
          )}
          <Link href={`/dashboard/mandates/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Link href={`/dashboard/agents/deploy?mandate=${id}`}>
            <Button variant="primary" size="sm">
              <Bot className="h-3.5 w-3.5" />
              Deploy Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: DollarSign,
            label: 'Base Currency',
            value: mandate.baseCurrency,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            icon: Lock,
            label: 'Capital Cap',
            value: mandate.capitalCap ? `$${mandate.capitalCap.toLocaleString()}` : 'Unlimited',
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
          },
          {
            icon: Shield,
            label: 'Risk Profile',
            value: risk.label,
            color: risk.color,
            bg: risk.barColor.replace('bg-', 'bg-').replace('bg-', '') + '/10',
          },
          {
            icon: Calendar,
            label: 'Last Updated',
            value: formatDate(mandate.updatedAt),
            color: 'text-text-secondary',
            bg: 'bg-surface',
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <div className={cn('h-7 w-7 rounded-full flex items-center justify-center mb-2', stat.bg)}>
              <stat.icon className={cn('h-3.5 w-3.5', stat.color)} />
            </div>
            <p className="text-xs text-text-secondary">{stat.label}</p>
            <p className={cn('text-sm font-semibold mt-0.5', stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main two-col layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-5">

        {/* ── Left: strategy + parsed policy ── */}
        <div className="space-y-5">

          {/* Strategy text */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Strategy</h3>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {mandate.mandateText}
            </p>
          </Card>

          {/* Parsed policy badges */}
          {parsedRows.length > 0 && (
            <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  AI-extracted policy
                </div>
                <span className="text-[10px] font-medium text-text-secondary bg-surface border border-border px-2 py-0.5 rounded-full">
                  Claude Sonnet
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedRows.map(([key, value]) => {
                  const colorClass = FIELD_COLORS[key] ?? 'bg-surface text-text-secondary border-border'
                  return (
                    <div key={key} className={cn('flex flex-col rounded-lg border px-3 py-2 text-xs', colorClass)}>
                      <span className="font-medium opacity-70 capitalize text-[10px] uppercase tracking-wide">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-semibold mt-0.5">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: risk + policy hash ── */}
        <div className="space-y-4 lg:sticky lg:top-6 self-start">

          {/* Risk parameters */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <div className={cn('h-6 w-6 rounded-full flex items-center justify-center', risk.barColor.replace('bg-', 'bg-') + '/10')}>
                <Shield className={cn('h-3.5 w-3.5', risk.color)} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Risk Parameters</h3>
              <span className={cn('ml-auto text-xs font-bold', risk.color)}>{risk.label}</span>
            </div>

            {/* Risk bar */}
            <div className="h-1.5 rounded-full bg-border mb-4 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', risk.barColor)}
                style={{ width: `${risk.width}%` }}
              />
            </div>

            <div className="space-y-2.5">
              {[
                ['Max Drawdown',        `${mandate.riskParams.maxDrawdown}%`],
                ['Max Position Size',   `${mandate.riskParams.maxPosition}%`],
                ['Stop Loss',           `${mandate.riskParams.stopLoss}%`],
                ['Max Open Positions',  `${mandate.riskParams.maxPositions}`],
                ['Cooldown After Loss', `${mandate.riskParams.cooldownHours}h`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                  <span className="text-xs text-text-secondary">{k}</span>
                  <span className="text-xs font-bold text-text-primary">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Policy hash */}
          {mandate.policyHash && (
            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Hash className="h-3.5 w-3.5" />
                  </div>
                  Policy Hash
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-text-secondary bg-surface border border-border px-2 py-0.5 rounded-full">
                  <Network className="h-3 w-3" />
                  Mantle Sepolia
                </div>
              </div>

              <p className="font-mono text-[11px] text-text-primary break-all leading-relaxed bg-surface/50 rounded-lg p-2.5 border border-border/50">
                {mandate.policyHash}
              </p>

              <div className="flex items-center gap-3">
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
                    href={`https://explorer.sepolia.mantle.xyz/tx/${mandate.onChainTx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Explorer
                  </a>
                )}
              </div>
            </div>
          )}

          {/* On-chain tx (if no hash yet) */}
          {!mandate.policyHash && (
            <div className="rounded-xl border border-border bg-surface/50 p-4">
              <p className="text-xs text-text-secondary italic">
                No policy hash yet — edit the mandate to generate one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
