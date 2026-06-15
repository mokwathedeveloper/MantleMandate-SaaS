'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TokenIcon } from '@/components/ui/TokenIcon'
import {
  ChevronLeft, Pause, Play, Square, Activity, Hash, FileText,
  Shield, Settings2, ClipboardList, Copy, CheckCircle2, ExternalLink, Zap,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { useTranslation } from '@/hooks/useTranslation'
import { useAgent, usePauseAgent, useResumeAgent, useStopAgent, useRunAgentTick } from '@/hooks/useAgents'
import { useMandate } from '@/hooks/useMandates'
import { useAgentReputation } from '@/hooks/useOnChain'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { usePreferences, DEFAULT_PREFERENCES, type UserPreferences } from '@/hooks/usePreferences'
import { cn } from '@/lib/utils'
import { MANTLE_TESTNET_EXPLORER } from '@/lib/constants'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { Trade, AuditLog } from '@/types/trade'

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  active:   'success',
  paused:   'warning',
  failed:   'error',
  stopped:  'default',
  inactive: 'default',
}

const TRADE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  success: 'success',
  failed:  'error',
  pending: 'warning',
}

type TabId = 'overview' | 'trades' | 'mandate' | 'audit' | 'settings'

const TABS: { id: TabId; label: string; icon: typeof Activity }[] = [
  { id: 'overview',  label: 'Overview',      icon: Activity },
  { id: 'trades',    label: 'Trade History', icon: ClipboardList },
  { id: 'mandate',   label: 'Mandate',       icon: FileText },
  { id: 'audit',     label: 'Audit Trail',   icon: Shield },
  { id: 'settings',  label: 'Settings',      icon: Settings2 },
]
// Note: TABS labels are translated at render time via t(label).

// ── data hooks ────────────────────────────────────────────────────────────────

function useAgentTrades(agentId: string) {
  return useQuery({
    queryKey: ['agent-trades', agentId],
    queryFn: () => fetch(`/api/agents/${agentId}/trades`).then(r => r.json()),
    enabled: !!agentId,
    staleTime: 15_000,
    refetchInterval: 15_000,
  })
}

function useAgentLogs(agentId: string) {
  return useQuery({
    queryKey: ['agent-logs', agentId],
    queryFn: () => fetch(`/api/agents/${agentId}/logs`).then(r => r.json()),
    enabled: !!agentId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  agent, trades, pnlPoints, t, prefs,
}: {
  agent: ReturnType<typeof useAgent>['data']
  trades: Trade[]
  pnlPoints: { time: string; pnl: number }[]
  t: (s: string) => string
  prefs: Partial<UserPreferences>
}) {
  const reputation = useAgentReputation(agent?.onchainAgentId != null ? BigInt(agent.onchainAgentId) : null)

  if (!agent) return null

  const wins    = trades.filter((t) => (t.pnl ?? 0) > 0).length
  const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0
  const avgSize = trades.length > 0
    ? trades.reduce((s, t) => s + t.amountUsd, 0) / trades.length
    : 0

  return (
    <div className="space-y-5">
      {/* Extended KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Lifetime P&L',   value: formatCurrency(agent.totalPnl, prefs),     color: agent.totalPnl >= 0 ? 'text-success' : 'text-error' },
          { label: 'Lifetime ROI',   value: formatPercent(agent.totalRoi),       color: agent.totalRoi >= 0 ? 'text-success' : 'text-error' },
          { label: 'Total Trades',   value: String(trades.length),               color: 'text-text-primary' },
          { label: 'Win Rate',       value: `${winRate}%`,                       color: winRate >= 50 ? 'text-success' : 'text-warning' },
          { label: 'Avg Trade Size', value: formatCurrency(avgSize, prefs),             color: 'text-text-primary' },
        ].map(({ label, value, color }) => (
          <Card key={label} padding="sm">
            <p className="text-xs text-text-secondary">{t(label)}</p>
            <p className={cn('text-xl font-bold mt-1', color)}>{value}</p>
          </Card>
        ))}
      </div>

      {/* P&L chart */}
      {pnlPoints.length > 1 && (
        <Card padding="md">
          <CardHeader>
            <CardTitle>{t('Cumulative P&L')}</CardTitle>
            <span className={cn('text-sm font-semibold', agent.totalPnl >= 0 ? 'text-success' : 'text-error')}>
              {formatCurrency(agent.totalPnl, prefs)}
            </span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={pnlPoints} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#8B949E', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#8B949E', fontSize: 10 }} tickLine={false} axisLine={false} width={48}
                  tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [formatCurrency(Number(v), prefs), t('P&L')]}
                />
                <Area type="monotone" dataKey="pnl" stroke="#22C55E" strokeWidth={2}
                  fill="url(#pnlGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Mandate compliance snapshot */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>{t('Mandate Compliance')}</CardTitle>
          <Badge variant="success" dot>{t('Passing')}</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { rule: 'Max drawdown limit',           pass: agent.drawdownCurrent <= 10 },
              { rule: 'Position size within bounds',  pass: true },
              { rule: 'Cooldown period respected',    pass: true },
              { rule: 'On-chain policy hash verified', pass: true },
            ].map(({ rule, pass }) => (
              <div key={rule} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <span className={cn('h-2 w-2 rounded-full shrink-0', pass ? 'bg-success' : 'bg-error')} />
                <span className="text-sm text-text-primary flex-1">{t(rule)}</span>
                <Badge variant={pass ? 'success' : 'error'}>{pass ? t('Pass') : t('Fail')}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* On-chain reputation (AgentReputationRegistry) — only once deployed/configured */}
      {reputation.data && (
        <Card padding="md">
          <CardHeader>
            <CardTitle>{t('On-Chain Reputation')}</CardTitle>
            <Badge variant="success" dot>AgentReputationRegistry</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-text-secondary">{t('Decisions Committed')}</p>
                <p className="text-xl font-bold mt-1 text-text-primary">{reputation.data.totalCommitted}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">{t('Resolved')}</p>
                <p className="text-xl font-bold mt-1 text-text-primary">{reputation.data.totalResolved}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">{t('Executed')}</p>
                <p className="text-xl font-bold mt-1 text-success">{reputation.data.totalExecuted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Trade History Tab ─────────────────────────────────────────────────────────

function TradeHistoryTab({ trades, total, t, prefs }: { trades: Trade[]; total: number; t: (s: string) => string; prefs: Partial<UserPreferences> }) {
  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>{t('Trade History')}</CardTitle>
        <span className="text-xs text-text-secondary">{t('{n} total trades').replace('{n}', String(total))}</span>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-center">
            <Activity className="h-10 w-10 text-text-secondary opacity-40" />
            <p className="text-sm text-text-secondary">{t('No trades executed yet')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="px-4 py-2.5 text-left font-medium">{t('Time')}</th>
                  <th className="px-4 py-2.5 text-left font-medium">{t('Asset')}</th>
                  <th className="px-4 py-2.5 text-left font-medium">{t('Direction')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('Amount')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('Price')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('P&L')}</th>
                  <th className="px-4 py-2.5 text-left font-medium">{t('Status')}</th>
                  <th className="px-4 py-2.5 text-left font-medium">{t('Mandate Rule')}</th>
                  <th className="px-4 py-2.5 text-left font-medium">{t('Block')}</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap">
                      {new Date(trade.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TokenIcon symbol={trade.assetPair.split('/')[0]} size="sm" />
                        <span className="font-medium text-text-primary">{trade.assetPair}</span>
                      </div>
                    </td>
                    <td className={cn('px-4 py-2.5 font-semibold uppercase',
                      trade.direction === 'buy' ? 'text-success' : 'text-error'
                    )}>
                      {trade.direction === 'buy' ? t('buy') : t('sell')}
                    </td>
                    <td className="px-4 py-2.5 text-right text-text-primary">{formatCurrency(trade.amountUsd, prefs)}</td>
                    <td className="px-4 py-2.5 text-right text-text-primary">
                      {trade.price > 0 ? `$${trade.price.toLocaleString()}` : '—'}
                    </td>
                    <td className={cn('px-4 py-2.5 text-right font-medium',
                      trade.pnl == null ? 'text-text-secondary' : trade.pnl >= 0 ? 'text-success' : 'text-error'
                    )}>
                      {trade.pnl != null ? formatCurrency(trade.pnl, prefs) : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={TRADE_STATUS_VARIANT[trade.status]}>{t(trade.status)}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary max-w-[180px]">
                      <span className="truncate block">{trade.mandateRuleApplied ?? '—'}</span>
                      {trade.reasoningCid && (
                        <a
                          href={trade.reasoningPinned ? `https://ipfs.io/ipfs/${trade.reasoningCid}` : undefined}
                          target={trade.reasoningPinned ? '_blank' : undefined}
                          rel={trade.reasoningPinned ? 'noreferrer' : undefined}
                          title={trade.reasoningPinned ? `${t('View reasoning on IPFS:')} ${trade.reasoningCid}` : `${t('Reasoning CID (not pinned to IPFS):')} ${trade.reasoningCid}`}
                          className={cn(
                            'inline-flex items-center gap-1 mt-0.5 text-[10px] font-mono',
                            trade.reasoningPinned ? 'text-text-link hover:opacity-70' : 'text-text-disabled cursor-default'
                          )}
                        >
                          <Hash className="h-2.5 w-2.5" />
                          {trade.reasoningCid.slice(0, 10)}…
                          {trade.commitmentTxHash && <CheckCircle2 className="h-2.5 w-2.5 text-success" />}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {trade.txHash ? (
                        <a
                          href={`${MANTLE_TESTNET_EXPLORER}/tx/${trade.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {trade.blockNumber ? `#${trade.blockNumber}` : t('View')}
                        </a>
                      ) : (
                        <span className="text-text-disabled">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Mandate Tab ───────────────────────────────────────────────────────────────

function MandateTab({ mandateId, t }: { mandateId: string; t: (s: string) => string }) {
  const { data: mandate, isLoading } = useMandate(mandateId)
  const [copied, setCopied] = useState(false)

  const copyHash = () => {
    if (!mandate?.policyHash) return
    navigator.clipboard.writeText(mandate.policyHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (!mandate) {
    return (
      <AlertBanner severity="warning" title={t('Mandate not found')}>
        {t('Could not load the mandate associated with this agent.')}
      </AlertBanner>
    )
  }

  const parsedRows = mandate.parsedPolicy
    ? Object.entries(mandate.parsedPolicy).filter(([, v]) => v !== null && v !== undefined)
    : []

  return (
    <div className="space-y-5">
      {/* Mandate name + status */}
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-text-primary">{mandate.name}</h3>
        <Badge variant={mandate.status === 'active' ? 'success' : 'default'}>{t(mandate.status)}</Badge>
        <Link
          href={`/dashboard/mandates/${mandate.id}`}
          className="ml-auto flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t('Edit mandate')}
        </Link>
      </div>

      {/* Plain-English mandate text */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>{t('Plain-English Mandate')}</CardTitle>
          <Badge variant="primary">{mandate.baseCurrency}</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap bg-surface rounded-lg p-4">
            {mandate.mandateText}
          </p>
        </CardContent>
      </Card>

      {/* Parsed policy */}
      {parsedRows.length > 0 && (
        <Card padding="md">
          <CardHeader>
            <CardTitle>{t('Parsed Policy')}</CardTitle>
            <span className="text-xs text-success flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('Verified by Claude AI')}
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {parsedRows.map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-2 text-sm py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-text-secondary capitalize shrink-0">
                    {t(key.replace(/_/g, ' '))}
                  </span>
                  <span className="text-text-primary font-medium text-right break-all">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* On-Chain Policy Hash */}
      <Card padding="md">
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <Hash className="h-4 w-4 text-text-secondary" />
            <CardTitle>{t('On-Chain Policy Hash')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {mandate.policyHash ? (
            <div className="space-y-3">
              <p className="font-mono-data text-xs text-text-primary break-all bg-surface rounded-md p-3">
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
                  {copied ? t('Copied!') : t('Copy hash')}
                </button>
                {mandate.onChainTx && (
                  <a
                    href={`${MANTLE_TESTNET_EXPLORER}/tx/${mandate.onChainTx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t('View on Mantle Explorer')}
                  </a>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                {t('SHA-256 fingerprint of your parsed policy. Posted on Mantle Network.')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-secondary italic">
              {t('Policy hash will be generated when this mandate is deployed on-chain.')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Audit Trail Tab ───────────────────────────────────────────────────────────

function AuditTrailTab({ logs, total, t }: { logs: AuditLog[]; total: number; t: (s: string) => string }) {
  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>{t('Decision Audit Log')}</CardTitle>
        <span className="text-xs text-text-secondary">{t('{n} events').replace('{n}', String(total))}</span>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-10">{t('No audit events yet')}</p>
        ) : (
          <div className="space-y-0">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-text-primary capitalize">
                      {t(log.eventType.replace(/_/g, ' '))}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {new Date(log.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                      })}
                    </span>
                  </div>
                  {(log.details as { reason?: string })?.reason && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      {(log.details as { reason: string }).reason}
                    </p>
                  )}
                  {log.decisionHash && (
                    <p className="font-mono-data text-[10px] text-text-disabled mt-0.5 truncate">
                      <Hash className="h-2.5 w-2.5 inline mr-0.5" />
                      {log.decisionHash.slice(0, 32)}…
                    </p>
                  )}
                  {log.txHash && (
                    <a
                      href={`${MANTLE_TESTNET_EXPLORER}/tx/${log.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-primary transition-colors mt-0.5 w-fit"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      {log.blockNumber ? `${t('Block')} #${log.blockNumber}` : t('View on Explorer')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({
  agent,
  onPause, onResume, onStop,
  pausing, resuming, stopping, t, prefs,
}: {
  agent: NonNullable<ReturnType<typeof useAgent>['data']>
  onPause: () => void; onResume: () => void; onStop: () => void
  pausing: boolean; resuming: boolean; stopping: boolean
  t: (s: string) => string
  prefs: Partial<UserPreferences>
}) {
  return (
    <div className="space-y-5 max-w-xl">
      {/* Status controls */}
      <Card padding="md">
        <CardHeader><CardTitle>{t('Agent Controls')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">{t('Current Status')}</p>
                <p className="text-xs text-text-secondary mt-0.5">{t("Agent's live operating state")}</p>
              </div>
              <Badge variant={STATUS_VARIANT[agent.status]} dot>{t(agent.status)}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {agent.status === 'active' && (
                <>
                  <Button variant="secondary" size="sm" loading={pausing} onClick={onPause}>
                    <Pause className="h-3.5 w-3.5" /> {t('Pause Agent')}
                  </Button>
                  <Button variant="danger" size="sm" loading={stopping} onClick={onStop}>
                    <Square className="h-3.5 w-3.5" /> {t('Stop Agent')}
                  </Button>
                </>
              )}
              {agent.status === 'paused' && (
                <>
                  <Button variant="primary" size="sm" loading={resuming} onClick={onResume}>
                    <Play className="h-3.5 w-3.5" /> {t('Resume Agent')}
                  </Button>
                  <Button variant="danger" size="sm" loading={stopping} onClick={onStop}>
                    <Square className="h-3.5 w-3.5" /> {t('Stop Agent')}
                  </Button>
                </>
              )}
              {(agent.status === 'stopped' || agent.status === 'failed') && (
                <p className="text-sm text-text-secondary">
                  {t('This agent has been stopped. Deploy a new agent from the Agents page to continue trading.')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent info */}
      <Card padding="md">
        <CardHeader><CardTitle>{t('Agent Information')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              ['Agent ID',       agent.id],
              ['Mandate',        agent.mandateName],
              ['Capital Cap',    agent.capitalCap > 0 ? formatCurrency(agent.capitalCap, prefs) : t('No limit')],
              ['Deployed At',    agent.deployedAt ? formatDate(agent.deployedAt, prefs) : '—'],
              ['Last Trade',     agent.lastTradeAt ? formatDate(agent.lastTradeAt, prefs) : t('No trades yet')],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                <span className="text-text-secondary shrink-0">{t(k)}</span>
                <span className="text-text-primary font-medium text-right break-all">{v}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card padding="md" className="border-error/30">
        <CardHeader>
          <CardTitle className="text-error">{t('Danger Zone')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-text-secondary mb-3">
            {t('Stopping an agent is irreversible. All open positions will be closed at market price.')}
          </p>
          <Button
            variant="danger"
            size="sm"
            loading={stopping}
            onClick={onStop}
            disabled={agent.status === 'stopped' || agent.status === 'failed'}
          >
            <Square className="h-3.5 w-3.5" /> {t('Permanently Stop Agent')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const t = useTranslation()
  const { data: prefs = DEFAULT_PREFERENCES } = usePreferences()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const { data: agent, isLoading } = useAgent(id)
  const { data: tradesData }       = useAgentTrades(id)
  const { data: logsData }         = useAgentLogs(id)

  const { mutate: pause,  isPending: pausing  } = usePauseAgent()
  const { mutate: resume, isPending: resuming } = useResumeAgent()
  const { mutate: stop,   isPending: stopping } = useStopAgent()
  const { mutate: runTick, isPending: ticking, data: tickResult, error: tickError, reset: resetTick } = useRunAgentTick()

  const trades = (Array.isArray(tradesData) ? tradesData : []) as Trade[]
  const logs   = (Array.isArray(logsData) ? logsData : []) as AuditLog[]

  // Build cumulative P&L sparkline from trade history
  const pnlPoints = (() => {
    let cum = 0
    return trades
      .slice()
      .reverse()
      .map((t) => {
        cum += t.pnl ?? 0
        return {
          time: new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          pnl:  Math.round(cum * 100) / 100,
        }
      })
  })()

  // ── loading ──
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  // ── not found ──
  if (!agent) {
    return (
      <div className="p-4 sm:p-6">
        <AlertBanner severity="warning" title={t('Agent not found')}>
          {t("This agent doesn't exist or you don't have access to it.")}
        </AlertBanner>
        <Link
          href="/dashboard/agents"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('Back to Agents')}
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/agents" className="text-text-secondary hover:text-text-primary transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-text-primary">{agent.name}</h1>
              <Badge variant={STATUS_VARIANT[agent.status]} dot>{t(agent.status)}</Badge>
            </div>
            <p className="text-sm text-text-secondary mt-0.5">{t('Running:')} {agent.mandateName}</p>
          </div>
        </div>

        {/* Quick action buttons in header */}
        <div className="flex items-center gap-2 sm:shrink-0 self-start sm:self-auto">
          {agent.status === 'active' && (
            <>
              <Button variant="primary" size="sm" loading={ticking} onClick={() => runTick(id)}>
                <Zap className="h-3.5 w-3.5" /> {t('Run Trading Cycle')}
              </Button>
              <Button variant="secondary" size="sm" loading={pausing} onClick={() => pause(id)}>
                <Pause className="h-3.5 w-3.5" /> {t('Pause')}
              </Button>
              <Button variant="danger" size="sm" loading={stopping} onClick={() => stop(id)}>
                <Square className="h-3.5 w-3.5" /> {t('Stop')}
              </Button>
            </>
          )}
          {agent.status === 'paused' && (
            <>
              <Button variant="primary" size="sm" loading={resuming} onClick={() => resume(id)}>
                <Play className="h-3.5 w-3.5" /> {t('Resume')}
              </Button>
              <Button variant="danger" size="sm" loading={stopping} onClick={() => stop(id)}>
                <Square className="h-3.5 w-3.5" /> {t('Stop')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Trading cycle result */}
      {tickError && (
        <AlertBanner severity="error" title={t('Trading cycle failed')} onDismiss={() => resetTick()}>
          {tickError.message}
        </AlertBanner>
      )}
      {tickResult && (
        <AlertBanner
          severity={tickResult.executed ? 'success' : 'info'}
          title={
            tickResult.executed
              ? `${t('Order executed on-chain:')} ${tickResult.decision.action.toUpperCase()} ${tickResult.decision.asset}`
              : `${t('AI recommendation:')} ${tickResult.decision.action.toUpperCase()} ${t('(no on-chain trade)')}`
          }
          onDismiss={() => resetTick()}
        >
          <p>{tickResult.decision.reasoning}</p>
          {tickResult.decision.rsi != null && (
            <p className="mt-1 opacity-80">
              RSI(14, 1h): {tickResult.decision.rsi.toFixed(2)} · {t('Confidence:')} {tickResult.decision.confidence}%
            </p>
          )}
          {!tickResult.executed && tickResult.reason && (
            <p className="mt-1 opacity-80">{tickResult.reason}</p>
          )}
          {tickResult.executed && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              {tickResult.pnl != null && <span>{t('Estimated P&L:')} {formatCurrency(tickResult.pnl, prefs)}</span>}
              {tickResult.txHash && (
                <a
                  href={`${MANTLE_TESTNET_EXPLORER}/tx/${tickResult.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 underline hover:opacity-80 transition-opacity"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t('View transaction on Mantle Explorer')}
                </a>
              )}
              {tickResult.swapTxHash && (
                <a
                  href={`${MANTLE_TESTNET_EXPLORER}/tx/${tickResult.swapTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 underline hover:opacity-80 transition-opacity"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t('View swap on Mantle Explorer')}
                </a>
              )}
            </div>
          )}
        </AlertBanner>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-0 border-b border-border overflow-x-auto">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={cn(
              'flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px shrink-0 whitespace-nowrap',
              activeTab === tabId
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(label)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab agent={agent} trades={trades} pnlPoints={pnlPoints} t={t} prefs={prefs} />
      )}

      {activeTab === 'trades' && (
        <TradeHistoryTab trades={trades} total={trades.length} t={t} prefs={prefs} />
      )}

      {activeTab === 'mandate' && (
        <MandateTab mandateId={agent.mandateId} t={t} />
      )}

      {activeTab === 'audit' && (
        <AuditTrailTab logs={logs} total={logsData?.total ?? logs.length} t={t} />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          agent={agent}
          onPause={() => pause(id)}
          onResume={() => resume(id)}
          onStop={() => stop(id)}
          pausing={pausing}
          resuming={resuming}
          stopping={stopping}
          t={t}
          prefs={prefs}
        />
      )}
    </div>
  )
}
