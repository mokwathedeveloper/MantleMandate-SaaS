'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  ChevronLeft, Pause, Play, Square, Activity, Hash, FileText,
  Shield, Settings2, ClipboardList, Copy, CheckCircle2, ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { useAgent, usePauseAgent, useResumeAgent, useStopAgent } from '@/hooks/useAgents'
import { useMandate } from '@/hooks/useMandates'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { Trade, AuditLog } from '@/types/trade'
import type { Agent } from '@/types/agent'

// ── mock fallback data ────────────────────────────────────────────────────────

const MOCK_AGENT: Agent = {
  id: 'agent-demo',
  mandateId: 'mandate-demo',
  mandateName: 'ETH Conservative Strategy',
  name: 'ETH Conservative Buyer',
  status: 'active' as const,
  capitalCap: 50000,
  totalPnl: 3847.22,
  totalRoi: 7.69,
  totalVolume: 284500,
  drawdownCurrent: 2.3,
  deployedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  lastTradeAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
}

const MOCK_TRADES: Trade[] = [
  {
    id: 'trade-1',
    agentId: 'agent-demo',
    mandateId: 'mandate-demo',
    mandateName: 'ETH Conservative Strategy',
    assetPair: 'ETH/USDT',
    direction: 'buy',
    amountUsd: 4200,
    price: 2184.5,
    pnl: 312.8,
    protocol: 'merchant_moe',
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc1',
    blockNumber: 14823910,
    status: 'success',
    mandateRuleApplied: 'Max 10% position size',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trade-2',
    agentId: 'agent-demo',
    mandateId: 'mandate-demo',
    mandateName: 'ETH Conservative Strategy',
    assetPair: 'MNT/USDT',
    direction: 'buy',
    amountUsd: 2800,
    price: 0.682,
    pnl: 187.4,
    protocol: 'agni',
    txHash: '0xdef456abc789def456abc789def456abc789def456abc789def456abc789def4',
    blockNumber: 14823750,
    status: 'success',
    mandateRuleApplied: 'Diversify across assets',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trade-3',
    agentId: 'agent-demo',
    mandateId: 'mandate-demo',
    mandateName: 'ETH Conservative Strategy',
    assetPair: 'ETH/USDT',
    direction: 'sell',
    amountUsd: 3500,
    price: 2240.1,
    pnl: 428.6,
    protocol: 'merchant_moe',
    txHash: '0x789abc123def789abc123def789abc123def789abc123def789abc123def7891',
    blockNumber: 14823590,
    status: 'success',
    mandateRuleApplied: 'Take profit at +5%',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trade-4',
    agentId: 'agent-demo',
    mandateId: 'mandate-demo',
    mandateName: 'ETH Conservative Strategy',
    assetPair: 'USDC/USDT',
    direction: 'buy',
    amountUsd: 5000,
    price: 1.0,
    pnl: -12.4,
    protocol: 'fluxion',
    txHash: null,
    blockNumber: null,
    status: 'failed',
    mandateRuleApplied: 'Stable coin hedge',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trade-5',
    agentId: 'agent-demo',
    mandateId: 'mandate-demo',
    mandateName: 'ETH Conservative Strategy',
    assetPair: 'ETH/USDT',
    direction: 'buy',
    amountUsd: 6100,
    price: 2118.9,
    pnl: 544.2,
    protocol: 'merchant_moe',
    txHash: '0x321cba987fed321cba987fed321cba987fed321cba987fed321cba987fed3214',
    blockNumber: 14823100,
    status: 'success',
    mandateRuleApplied: 'Dip buy at -3%',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trade-6',
    agentId: 'agent-demo',
    mandateId: 'mandate-demo',
    mandateName: 'ETH Conservative Strategy',
    assetPair: 'MNT/USDT',
    direction: 'sell',
    amountUsd: 1900,
    price: 0.71,
    pnl: 94.1,
    protocol: 'agni',
    txHash: '0x654fed321abc654fed321abc654fed321abc654fed321abc654fed321abc6545',
    blockNumber: 14822870,
    status: 'success',
    mandateRuleApplied: 'Take profit at +4%',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
]

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    agentId: 'agent-demo',
    tradeId: 'trade-1',
    eventType: 'trade_executed',
    decisionHash: '0x8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc1',
    blockNumber: 14823910,
    details: { reason: 'ETH dipped 2.1% below 7-day MA. Mandate allows dip-buy entry.' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-2',
    agentId: 'agent-demo',
    tradeId: null,
    eventType: 'mandate_check',
    decisionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    txHash: null,
    blockNumber: null,
    details: { reason: 'All mandate rules verified. Drawdown at 2.3%, within 10% limit.' },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-3',
    agentId: 'agent-demo',
    tradeId: 'trade-2',
    eventType: 'trade_executed',
    decisionHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
    txHash: '0xdef456abc789def456abc789def456abc789def456abc789def456abc789def4',
    blockNumber: 14823750,
    details: { reason: 'Portfolio diversification threshold triggered MNT allocation.' },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-4',
    agentId: 'agent-demo',
    tradeId: 'trade-3',
    eventType: 'trade_executed',
    decisionHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
    txHash: '0x789abc123def789abc123def789abc123def789abc123def789abc123def7891',
    blockNumber: 14823590,
    details: { reason: 'Take-profit rule triggered at +5.2% from entry. Position closed.' },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-5',
    agentId: 'agent-demo',
    tradeId: 'trade-4',
    eventType: 'trade_failed',
    decisionHash: null,
    txHash: null,
    blockNumber: null,
    details: { reason: 'Insufficient liquidity on Fluxion. Retrying on next cycle.' },
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-6',
    agentId: 'agent-demo',
    tradeId: null,
    eventType: 'agent_deployed',
    decisionHash: '0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
    txHash: null,
    blockNumber: null,
    details: { reason: 'Agent initialized and mandate policy hash verified on-chain.' },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

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
  agent, trades, pnlPoints,
}: {
  agent: ReturnType<typeof useAgent>['data']
  trades: Trade[]
  pnlPoints: { time: string; pnl: number }[]
}) {
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
          { label: 'Lifetime P&L',   value: formatCurrency(agent.totalPnl),     color: agent.totalPnl >= 0 ? 'text-success' : 'text-error' },
          { label: 'Lifetime ROI',   value: formatPercent(agent.totalRoi),       color: agent.totalRoi >= 0 ? 'text-success' : 'text-error' },
          { label: 'Total Trades',   value: String(trades.length),               color: 'text-text-primary' },
          { label: 'Win Rate',       value: `${winRate}%`,                       color: winRate >= 50 ? 'text-success' : 'text-warning' },
          { label: 'Avg Trade Size', value: formatCurrency(avgSize),             color: 'text-text-primary' },
        ].map(({ label, value, color }) => (
          <Card key={label} padding="sm">
            <p className="text-xs text-text-secondary">{label}</p>
            <p className={cn('text-xl font-bold mt-1', color)}>{value}</p>
          </Card>
        ))}
      </div>

      {/* P&L chart */}
      {pnlPoints.length > 1 && (
        <Card padding="md">
          <CardHeader>
            <CardTitle>Cumulative P&L</CardTitle>
            <span className={cn('text-sm font-semibold', agent.totalPnl >= 0 ? 'text-success' : 'text-error')}>
              {formatCurrency(agent.totalPnl)}
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
                  formatter={(v) => [formatCurrency(Number(v)), 'P&L']}
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
          <CardTitle>Mandate Compliance</CardTitle>
          <Badge variant="success" dot>Passing</Badge>
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
                <span className="text-sm text-text-primary flex-1">{rule}</span>
                <Badge variant={pass ? 'success' : 'error'}>{pass ? 'Pass' : 'Fail'}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Trade History Tab ─────────────────────────────────────────────────────────

function TradeHistoryTab({ trades, total }: { trades: Trade[]; total: number }) {
  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
        <span className="text-xs text-text-secondary">{total} total trades</span>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-center">
            <Activity className="h-10 w-10 text-text-secondary opacity-40" />
            <p className="text-sm text-text-secondary">No trades executed yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="px-4 py-2.5 text-left font-medium">Time</th>
                  <th className="px-4 py-2.5 text-left font-medium">Asset</th>
                  <th className="px-4 py-2.5 text-left font-medium">Direction</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-4 py-2.5 text-right font-medium">Price</th>
                  <th className="px-4 py-2.5 text-right font-medium">P&L</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Mandate Rule</th>
                  <th className="px-4 py-2.5 text-left font-medium">Block</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-text-primary">{t.assetPair}</td>
                    <td className={cn('px-4 py-2.5 font-semibold uppercase',
                      t.direction === 'buy' ? 'text-success' : 'text-error'
                    )}>
                      {t.direction}
                    </td>
                    <td className="px-4 py-2.5 text-right text-text-primary">{formatCurrency(t.amountUsd)}</td>
                    <td className="px-4 py-2.5 text-right text-text-primary">
                      {t.price > 0 ? `$${t.price.toLocaleString()}` : '—'}
                    </td>
                    <td className={cn('px-4 py-2.5 text-right font-medium',
                      t.pnl == null ? 'text-text-secondary' : t.pnl >= 0 ? 'text-success' : 'text-error'
                    )}>
                      {t.pnl != null ? formatCurrency(t.pnl) : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={TRADE_STATUS_VARIANT[t.status]}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary max-w-[180px] truncate">
                      {t.mandateRuleApplied ?? '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      {t.txHash ? (
                        <a
                          href={`https://explorer.mantle.xyz/tx/${t.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t.blockNumber ? `#${t.blockNumber}` : 'View'}
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

function MandateTab({ mandateId }: { mandateId: string }) {
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
      <AlertBanner severity="warning" title="Mandate not found">
        Could not load the mandate associated with this agent.
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
        <Badge variant={mandate.status === 'active' ? 'success' : 'default'}>{mandate.status}</Badge>
        <Link
          href={`/dashboard/mandates/${mandate.id}`}
          className="ml-auto flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Edit mandate
        </Link>
      </div>

      {/* Plain-English mandate text */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>Plain-English Mandate</CardTitle>
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
            <CardTitle>Parsed Policy</CardTitle>
            <span className="text-xs text-success flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified by Claude AI
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {parsedRows.map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-2 text-sm py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-text-secondary capitalize shrink-0">
                    {key.replace(/_/g, ' ')}
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
            <CardTitle>On-Chain Policy Hash</CardTitle>
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
                    View on Mantle Explorer
                  </a>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                SHA-256 fingerprint of your parsed policy. Posted on Mantle Network.
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-secondary italic">
              Policy hash will be generated when this mandate is deployed on-chain.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Audit Trail Tab ───────────────────────────────────────────────────────────

function AuditTrailTab({ logs, total }: { logs: AuditLog[]; total: number }) {
  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Decision Audit Log</CardTitle>
        <span className="text-xs text-text-secondary">{total} events</span>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-10">No audit events yet</p>
        ) : (
          <div className="space-y-0">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-text-primary capitalize">
                      {log.eventType.replace(/_/g, ' ')}
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
                      href={`https://explorer.mantle.xyz/tx/${log.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-primary transition-colors mt-0.5 w-fit"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      {log.blockNumber ? `Block #${log.blockNumber}` : 'View on Explorer'}
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
  pausing, resuming, stopping,
}: {
  agent: NonNullable<ReturnType<typeof useAgent>['data']>
  onPause: () => void; onResume: () => void; onStop: () => void
  pausing: boolean; resuming: boolean; stopping: boolean
}) {
  return (
    <div className="space-y-5 max-w-xl">
      {/* Status controls */}
      <Card padding="md">
        <CardHeader><CardTitle>Agent Controls</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium text-text-primary">Current Status</p>
                <p className="text-xs text-text-secondary mt-0.5">Agent&apos;s live operating state</p>
              </div>
              <Badge variant={STATUS_VARIANT[agent.status]} dot>{agent.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {agent.status === 'active' && (
                <>
                  <Button variant="secondary" size="sm" loading={pausing} onClick={onPause}>
                    <Pause className="h-3.5 w-3.5" /> Pause Agent
                  </Button>
                  <Button variant="danger" size="sm" loading={stopping} onClick={onStop}>
                    <Square className="h-3.5 w-3.5" /> Stop Agent
                  </Button>
                </>
              )}
              {agent.status === 'paused' && (
                <>
                  <Button variant="primary" size="sm" loading={resuming} onClick={onResume}>
                    <Play className="h-3.5 w-3.5" /> Resume Agent
                  </Button>
                  <Button variant="danger" size="sm" loading={stopping} onClick={onStop}>
                    <Square className="h-3.5 w-3.5" /> Stop Agent
                  </Button>
                </>
              )}
              {(agent.status === 'stopped' || agent.status === 'failed') && (
                <p className="text-sm text-text-secondary">
                  This agent has been stopped. Deploy a new agent from the Agents page to continue trading.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent info */}
      <Card padding="md">
        <CardHeader><CardTitle>Agent Information</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {[
              ['Agent ID',       agent.id],
              ['Mandate',        agent.mandateName],
              ['Capital Cap',    agent.capitalCap > 0 ? formatCurrency(agent.capitalCap) : 'No limit'],
              ['Deployed At',    agent.deployedAt ? formatDate(agent.deployedAt) : '—'],
              ['Last Trade',     agent.lastTradeAt ? formatDate(agent.lastTradeAt) : 'No trades yet'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                <span className="text-text-secondary shrink-0">{k}</span>
                <span className="text-text-primary font-medium text-right break-all">{v}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card padding="md" className="border-error/30">
        <CardHeader>
          <CardTitle className="text-error">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-text-secondary mb-3">
            Stopping an agent is irreversible. All open positions will be closed at market price.
          </p>
          <Button
            variant="danger"
            size="sm"
            loading={stopping}
            onClick={onStop}
            disabled={agent.status === 'stopped' || agent.status === 'failed'}
          >
            <Square className="h-3.5 w-3.5" /> Permanently Stop Agent
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const { data: agent, isLoading } = useAgent(id)
  const { data: tradesData }       = useAgentTrades(id)
  const { data: logsData }         = useAgentLogs(id)

  const { mutate: pause,  isPending: pausing  } = usePauseAgent()
  const { mutate: resume, isPending: resuming } = useResumeAgent()
  const { mutate: stop,   isPending: stopping } = useStopAgent()

  const rawTrades = (tradesData?.data ?? []) as Trade[]
  const rawLogs   = (logsData?.data ?? []) as AuditLog[]

  // Fall back to mock data when backend is offline / agent not seeded
  const isMock   = !isLoading && !agent
  const display  = agent ?? MOCK_AGENT
  const trades   = rawTrades.length > 0 ? rawTrades : (isMock ? MOCK_TRADES : [])
  const logs     = rawLogs.length > 0   ? rawLogs   : (isMock ? MOCK_AUDIT_LOGS : [])

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
              <h1 className="text-xl font-bold text-text-primary">{display.name}</h1>
              <Badge variant={STATUS_VARIANT[display.status]} dot>{display.status}</Badge>
            </div>
            <p className="text-sm text-text-secondary mt-0.5">Running: {display.mandateName}</p>
          </div>
        </div>

        {/* Quick action buttons in header */}
        <div className="flex items-center gap-2 sm:shrink-0 self-start sm:self-auto">
          {display.status === 'active' && !isMock && (
            <>
              <Button variant="secondary" size="sm" loading={pausing} onClick={() => pause(id)}>
                <Pause className="h-3.5 w-3.5" /> Pause
              </Button>
              <Button variant="danger" size="sm" loading={stopping} onClick={() => stop(id)}>
                <Square className="h-3.5 w-3.5" /> Stop
              </Button>
            </>
          )}
          {display.status === 'paused' && !isMock && (
            <>
              <Button variant="primary" size="sm" loading={resuming} onClick={() => resume(id)}>
                <Play className="h-3.5 w-3.5" /> Resume
              </Button>
              <Button variant="danger" size="sm" loading={stopping} onClick={() => stop(id)}>
                <Square className="h-3.5 w-3.5" /> Stop
              </Button>
            </>
          )}
        </div>
      </div>

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
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab agent={display} trades={trades} pnlPoints={pnlPoints} />
      )}

      {activeTab === 'trades' && (
        <TradeHistoryTab trades={trades} total={tradesData?.total ?? trades.length} />
      )}

      {activeTab === 'mandate' && (
        <MandateTab mandateId={display.mandateId} />
      )}

      {activeTab === 'audit' && (
        <AuditTrailTab logs={logs} total={logsData?.total ?? logs.length} />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          agent={display}
          onPause={() => !isMock && pause(id)}
          onResume={() => !isMock && resume(id)}
          onStop={() => !isMock && stop(id)}
          pausing={pausing}
          resuming={resuming}
          stopping={stopping}
        />
      )}
    </div>
  )
}
