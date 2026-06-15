'use client'

import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bot, Pause, Play, Square, Settings, ExternalLink,
  Search, ChevronDown, Zap, X,
} from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import {
  useAgents, usePauseAgent, useResumeAgent, useStopAgent, useDeployAgent,
} from '@/hooks/useAgents'
import { useMandates } from '@/hooks/useMandates'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { usePreferences, DEFAULT_PREFERENCES, type UserPreferences } from '@/hooks/usePreferences'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { Agent } from '@/types/agent'

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  active:   'success',
  paused:   'warning',
  failed:   'error',
  stopped:  'default',
  inactive: 'default',
}

const STATUS_DOT: Record<string, string> = {
  active:   'bg-success animate-pulse',
  paused:   'bg-warning',
  failed:   'bg-error',
  stopped:  'bg-text-disabled',
  inactive: 'bg-text-disabled',
}

const STATUS_LABEL: Record<string, string> = {
  active:   'active',
  paused:   'paused',
  failed:   'failed',
  stopped:  'stopped',
  inactive: 'inactive',
}

const SORT_OPTIONS = ['P&L', 'ROI', 'Volume', 'Name', 'Date deployed'] as const
type SortOption = typeof SORT_OPTIONS[number]

type TabFilter = 'All' | 'Active' | 'Paused' | 'Failed'

// ── sparkline generator ───────────────────────────────────────────────────────

function generateSparkline(agent: Agent, points = 30) {
  let seed = agent.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  let val = 0
  return Array.from({ length: points }, (_, i) => {
    val += (rand() - 0.47) * (Math.abs(agent.totalPnl) / points || 100)
    return { i, v: Math.round(val) }
  })
}

// ── AgentCard ─────────────────────────────────────────────────────────────────

function AgentCard({ agent, t, prefs }: { agent: Agent; t: (s: string) => string; prefs: Partial<UserPreferences> }) {
  const { mutate: pause,  isPending: pausing  } = usePauseAgent()
  const { mutate: resume, isPending: resuming } = useResumeAgent()
  const { mutate: stop,   isPending: stopping } = useStopAgent()

  const sparkData  = useMemo(() => generateSparkline(agent), [agent])
  const lineColor  = agent.totalPnl >= 0 ? '#22C55E' : '#EF4444'
  const drawColor  = agent.drawdownCurrent < 5 ? 'text-success' : agent.drawdownCurrent < 15 ? 'text-warning' : 'text-error'

  return (
    <Card
      padding="md"
      className="flex flex-col gap-4 hover:border-primary/50 transition-colors cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_DOT[agent.status])} />
          <div className="min-w-0">
            <Link
              href={`/dashboard/agents/${agent.id}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-text-primary text-[15px] leading-snug truncate">
                {agent.name}
              </h3>
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mt-0.5 truncate">
              {t('Running:')} {agent.mandateName}
            </p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[agent.status]} dot>
          {t(STATUS_LABEL[agent.status] ?? agent.status)}
        </Badge>
      </div>

      {/* 4-metric grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          {
            label: 'P&L',
            value: formatCurrency(agent.totalPnl, prefs),
            color: agent.totalPnl >= 0 ? 'text-success' : 'text-error',
          },
          {
            label: 'ROI',
            value: formatPercent(agent.totalRoi),
            color: agent.totalRoi >= 0 ? 'text-success' : 'text-error',
          },
          {
            label: 'Volume',
            value: formatCurrency(agent.totalVolume, prefs),
            color: 'text-text-primary',
          },
          {
            label: 'Drawdown',
            value: `${agent.drawdownCurrent.toFixed(1)}%`,
            color: drawColor,
          },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
              {t(label)}
            </p>
            <p className={cn('text-[13px] font-bold mt-0.5 leading-tight', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div className="h-[60px] -mx-1">
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id={`sg-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={lineColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={lineColor}
              strokeWidth={1.5}
              fill={`url(#sg-${agent.id})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-[11px] text-text-disabled">
          {t('Deployed:')} {agent.deployedAt ? formatDate(agent.deployedAt, prefs) : '—'}
        </span>
        <div className="flex items-center gap-1">
          {agent.status === 'active' && (
            <>
              <button
                className="p-1.5 rounded border border-border text-text-secondary hover:text-warning hover:border-warning transition-colors"
                aria-label={t('Pause agent')}
                disabled={pausing}
                onClick={() => pause(agent.id)}
              >
                <Pause className="h-3 w-3" />
              </button>
              <button
                className="p-1.5 rounded border border-border text-text-secondary hover:text-error hover:border-error transition-colors"
                aria-label={t('Stop agent')}
                disabled={stopping}
                onClick={() => stop(agent.id)}
              >
                <Square className="h-3 w-3" />
              </button>
            </>
          )}
          {agent.status === 'paused' && (
            <>
              <button
                className="p-1.5 rounded border border-border text-text-secondary hover:text-success hover:border-success transition-colors"
                aria-label={t('Resume agent')}
                disabled={resuming}
                onClick={() => resume(agent.id)}
              >
                <Play className="h-3 w-3" />
              </button>
              <button
                className="p-1.5 rounded border border-border text-text-secondary hover:text-error hover:border-error transition-colors"
                aria-label={t('Stop agent')}
                disabled={stopping}
                onClick={() => stop(agent.id)}
              >
                <Square className="h-3 w-3" />
              </button>
            </>
          )}
          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="p-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
            aria-label={t('Agent settings')}
          >
            <Settings className="h-3 w-3" />
          </Link>
          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="p-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
            aria-label={t('View agent detail')}
          >
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Card>
  )
}

// ── Deploy Modal ───────────────────────────────────────────────────────────────

function DeployModal({ onClose, t }: { onClose: () => void; t: (s: string) => string }) {
  const router = useRouter()
  const qc     = useQueryClient()
  const { data: mandatesData } = useMandates()
  const mandates = (mandatesData?.data ?? []).filter(
    m => m.status === 'active' || m.status === 'draft',
  )

  const [mandateId, setMandateId] = useState('')
  const [capital,   setCapital]   = useState('5000')
  const [agentName, setAgentName] = useState('')

  const { mutate: deploy, isPending } = useDeployAgent()

  const handleDeploy = () => {
    if (!mandateId) return
    deploy(
      {
        name:      agentName || `Agent for ${mandates.find(m => m.id === mandateId)?.name ?? 'Mandate'}`,
        mandateId,
        capitalCap: Number(capital) || undefined,
      },
      { onSuccess: () => { qc.invalidateQueries({ queryKey: ['agents'] }); onClose() } },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-[calc(100vw-2rem)] max-w-[440px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">{t('Deploy New Agent')}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">{t('From existing mandate:')}</label>
          <div className="relative">
            <select
              value={mandateId}
              onChange={e => setMandateId(e.target.value)}
              className="w-full appearance-none bg-input border border-border rounded-md px-3 pr-8 py-2 text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">{t('Select mandate…')}</option>
              {mandates.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">{t('Agent name (optional)')}</label>
          <input
            value={agentName}
            onChange={e => setAgentName(e.target.value)}
            placeholder={t('Auto-named from mandate')}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-disabled"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">{t('Capital cap ($)')}</label>
          <input
            type="number"
            value={capital}
            onChange={e => setCapital(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">{t('Wallet')}</label>
          <div className="relative">
            <select className="w-full appearance-none bg-input border border-border rounded-md px-3 pr-8 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer">
              <option>0x1a2b…9f3c ({t('Primary')})</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full flex items-center justify-center gap-2"
          loading={isPending}
          disabled={!mandateId || isPending}
          onClick={handleDeploy}
        >
          <Zap className="h-4 w-4" />
          {t('Deploy Agent')}
        </Button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-text-disabled shrink-0">{t('or')}</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <button
          onClick={() => { onClose(); router.push('/dashboard/mandates/new') }}
          className="w-full py-2 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
        >
          {t('Create a New Mandate First')}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const t = useTranslation()
  const { data: prefs = DEFAULT_PREFERENCES } = usePreferences()
  const { data: agents, isLoading } = useAgents()

  const [activeTab, setTab]     = useState<TabFilter>('All')
  const [search,    setSearch]  = useState('')
  const [sort,      setSort]    = useState<SortOption>('P&L')
  const [showDeploy, setDeploy] = useState(false)

  const all    = agents?.length ?? 0
  const active = agents?.filter(a => a.status === 'active').length ?? 0
  const paused = agents?.filter(a => a.status === 'paused').length ?? 0
  const failed = agents?.filter(a => a.status === 'failed' || a.status === 'stopped' || a.status === 'inactive').length ?? 0

  const TABS: { key: TabFilter; label: string; count: number }[] = [
    { key: 'All',    label: 'All',    count: all    },
    { key: 'Active', label: 'Active', count: active },
    { key: 'Paused', label: 'Paused', count: paused },
    { key: 'Failed', label: 'Failed', count: failed },
  ]

  const filtered = useMemo(() => {
    if (!agents) return []
    let list = [...agents]

    if (activeTab === 'Active') list = list.filter(a => a.status === 'active')
    else if (activeTab === 'Paused') list = list.filter(a => a.status === 'paused')
    else if (activeTab === 'Failed') list = list.filter(a => ['failed', 'stopped', 'inactive'].includes(a.status))

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        a => a.name.toLowerCase().includes(q) || a.mandateName.toLowerCase().includes(q),
      )
    }

    switch (sort) {
      case 'P&L':           list.sort((a, b) => b.totalPnl     - a.totalPnl);     break
      case 'ROI':           list.sort((a, b) => b.totalRoi     - a.totalRoi);     break
      case 'Volume':        list.sort((a, b) => b.totalVolume  - a.totalVolume);  break
      case 'Name':          list.sort((a, b) => a.name.localeCompare(b.name));    break
      case 'Date deployed': list.sort((a, b) =>
        (b.deployedAt ?? '').localeCompare(a.deployedAt ?? ''));                   break
    }

    return list
  }, [agents, activeTab, search, sort])

  return (
    <div className="space-y-6">
      {showDeploy && <DeployModal onClose={() => setDeploy(false)} t={t} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{t('AI Agents')}</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {t('{n} agents deployed · {a} active · {p} paused · {f} failed')
              .replace('{n}', String(all))
              .replace('{a}', String(active))
              .replace('{p}', String(paused))
              .replace('{f}', String(failed))}
          </p>
        </div>
        <button
          onClick={() => setDeploy(true)}
          className="flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors shrink-0 self-start"
        >
          <Zap className="h-4 w-4" />
          {t('Deploy New Agent')}
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Agents', value: all,    color: 'text-text-primary' },
          { label: 'Active',       value: active, color: 'text-success'      },
          { label: 'Paused',       value: paused, color: 'text-warning'      },
          { label: 'Failed',       value: failed, color: 'text-error'        },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{t(label)}</p>
            <p className={cn('text-2xl font-black mt-0.5', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors rounded',
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {t(tab.label)} ({tab.count})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('Search agents…')}
              className="w-full sm:w-52 bg-input border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="appearance-none bg-input border border-border rounded-md pl-3 pr-7 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o} value={o}>{t('Sort: {o}').replace('{o}', t(o))}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !agents || agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Bot className="h-14 w-14 text-text-secondary opacity-40" />
          <div>
            <p className="text-lg font-semibold text-text-primary">{t('No agents deployed yet')}</p>
            <p className="text-sm text-text-secondary mt-1 max-w-sm">
              {t('Create a mandate and deploy your first AI agent to start trading automatically on Mantle Network.')}
            </p>
          </div>
          <button
            onClick={() => setDeploy(true)}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            <Zap className="h-4 w-4" />
            {t('Deploy My First Agent')}
          </button>
          <Link href="/dashboard/mandates" className="text-sm text-text-link hover:text-text-link-hover transition-colors">
            {t('or browse example mandates')}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Bot className="h-10 w-10 text-text-secondary opacity-40" />
          <p className="text-sm text-text-secondary">{t('No agents match your filter.')}</p>
          <button onClick={() => { setTab('All'); setSearch('') }} className="text-xs text-text-link hover:text-text-link-hover">
            {t('Clear filters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} t={t} prefs={prefs} />
          ))}
        </div>
      )}
    </div>
  )
}
