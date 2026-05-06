'use client'

import { useState, useMemo } from 'react'
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
  useAgents, usePauseAgent, useResumeAgent, useStopAgent,
} from '@/hooks/useAgents'
import { useMandates } from '@/hooks/useMandates'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
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

const SORT_OPTIONS = ['P&L', 'ROI', 'Volume', 'Name', 'Date deployed'] as const
type SortOption = typeof SORT_OPTIONS[number]

type TabFilter = 'All' | 'Active' | 'Paused' | 'Failed'

// ── sparkline generator ───────────────────────────────────────────────────────

function generateSparkline(agent: Agent, points = 30) {
  // Deterministic seed from agent id so it doesn't change on re-render
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

function AgentCard({ agent }: { agent: Agent }) {
  const { mutate: pause,  isPending: pausing  } = usePauseAgent()
  const { mutate: resume, isPending: resuming } = useResumeAgent()
  const { mutate: stop,   isPending: stopping } = useStopAgent()

  const sparkData  = useMemo(() => generateSparkline(agent), [agent.id])
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
          {/* Status dot */}
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
              Running: {agent.mandateName}
            </p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[agent.status]} dot>
          {agent.status}
        </Badge>
      </div>

      {/* 4-metric grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          {
            label: 'P&L',
            value: formatCurrency(agent.totalPnl),
            color: agent.totalPnl >= 0 ? 'text-success' : 'text-error',
          },
          {
            label: 'ROI',
            value: formatPercent(agent.totalRoi),
            color: agent.totalRoi >= 0 ? 'text-success' : 'text-error',
          },
          {
            label: 'Volume',
            value: formatCurrency(agent.totalVolume),
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
              {label}
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
          Deployed: {agent.deployedAt ? formatDate(agent.deployedAt) : '—'}
        </span>
        <div className="flex items-center gap-1">
          {agent.status === 'active' && (
            <>
              <button
                className="p-1.5 rounded border border-border text-text-secondary hover:text-warning hover:border-warning transition-colors"
                title="Pause"
                disabled={pausing}
                onClick={() => pause(agent.id)}
              >
                <Pause className="h-3 w-3" />
              </button>
              <button
                className="p-1.5 rounded border border-border text-text-secondary hover:text-error hover:border-error transition-colors"
                title="Stop"
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
                title="Resume"
                disabled={resuming}
                onClick={() => resume(agent.id)}
              >
                <Play className="h-3 w-3" />
              </button>
              <button
                className="p-1.5 rounded border border-border text-text-secondary hover:text-error hover:border-error transition-colors"
                title="Stop"
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
            title="Settings"
          >
            <Settings className="h-3 w-3" />
          </Link>
          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="p-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
            title="View detail"
          >
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Card>
  )
}

// ── Deploy Modal ───────────────────────────────────────────────────────────────

function DeployModal({ onClose }: { onClose: () => void }) {
  const router      = useRouter()
  const qc          = useQueryClient()
  const { data: mandatesData } = useMandates()
  const mandates = (mandatesData?.data ?? []).filter(
    m => m.status === 'active' || m.status === 'draft',
  )

  const [mandateId, setMandateId] = useState('')
  const [capital,   setCapital]   = useState('5000')
  const [agentName, setAgentName] = useState('')

  const { mutate: deploy, isPending } = useMutation({
    mutationFn: async () => {
      const agent = await api.post('/agents', {
        name:        agentName || `Agent for ${mandates.find(m => m.id === mandateId)?.name ?? 'Mandate'}`,
        mandate_id:  mandateId,
        capital_cap: Number(capital) || undefined,
      }).then(r => r.data.data)
      await api.post(`/agents/${agent.id}/deploy`)
      return agent
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-[440px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">Deploy New Agent</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">From existing mandate:</label>
          <div className="relative">
            <select
              value={mandateId}
              onChange={e => setMandateId(e.target.value)}
              className="w-full appearance-none bg-input border border-border rounded-md px-3 pr-8 py-2 text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">Select mandate…</option>
              {mandates.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">Agent name (optional)</label>
          <input
            value={agentName}
            onChange={e => setAgentName(e.target.value)}
            placeholder="Auto-named from mandate"
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-disabled"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">Capital cap ($)</label>
          <input
            type="number"
            value={capital}
            onChange={e => setCapital(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-secondary font-medium">Wallet</label>
          <div className="relative">
            <select className="w-full appearance-none bg-input border border-border rounded-md px-3 pr-8 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer">
              <option>0x1a2b…9f3c (Primary)</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full flex items-center justify-center gap-2"
          loading={isPending}
          disabled={!mandateId}
          onClick={() => deploy()}
        >
          <Zap className="h-4 w-4" />
          Deploy Agent
        </Button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-text-disabled shrink-0">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <button
          onClick={() => { onClose(); router.push('/dashboard/mandates/new') }}
          className="w-full py-2 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
        >
          Create a New Mandate First
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents()

  const [activeTab, setTab]     = useState<TabFilter>('All')
  const [search,    setSearch]  = useState('')
  const [sort,      setSort]    = useState<SortOption>('P&L')
  const [showDeploy, setDeploy] = useState(false)

  // Counts
  const all    = agents?.length ?? 0
  const active = agents?.filter(a => a.status === 'active').length  ?? 0
  const paused = agents?.filter(a => a.status === 'paused').length  ?? 0
  const failed = agents?.filter(a => a.status === 'failed').length  ?? 0

  const TABS: { key: TabFilter; label: string; count: number }[] = [
    { key: 'All',    label: 'All',    count: all    },
    { key: 'Active', label: 'Active', count: active },
    { key: 'Paused', label: 'Paused', count: paused },
    { key: 'Failed', label: 'Failed', count: failed },
  ]

  const filtered = useMemo(() => {
    if (!agents) return []
    let list = [...agents]

    // Tab filter
    if (activeTab !== 'All') {
      list = list.filter(a => a.status === activeTab.toLowerCase())
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        a => a.name.toLowerCase().includes(q) || a.mandateName.toLowerCase().includes(q),
      )
    }

    // Sort
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
      {showDeploy && <DeployModal onClose={() => setDeploy(false)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">AI Agents</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {all} agents deployed · {active} active · {paused} paused · {failed} failed
          </p>
        </div>
        <button
          onClick={() => setDeploy(true)}
          className="flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors shrink-0"
        >
          <Zap className="h-4 w-4" />
          Deploy New Agent
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Agents', value: all,    color: 'text-text-primary' },
          { label: 'Active',       value: active, color: 'text-success'      },
          { label: 'Paused',       value: paused, color: 'text-warning'      },
          { label: 'Failed',       value: failed, color: 'text-error'        },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
            <p className={cn('text-2xl font-black mt-0.5', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors rounded',
                activeTab === t.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search agents…"
              className="w-60 bg-input border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary"
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
              {SORT_OPTIONS.map(o => <option key={o} value={o}>Sort: {o}</option>)}
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
            <p className="text-lg font-semibold text-text-primary">No agents deployed yet</p>
            <p className="text-sm text-text-secondary mt-1 max-w-sm">
              Create a mandate and deploy your first AI agent to start trading automatically on Mantle Network.
            </p>
          </div>
          <button
            onClick={() => setDeploy(true)}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            <Zap className="h-4 w-4" />
            Deploy My First Agent
          </button>
          <Link href="/dashboard/mandates" className="text-sm text-text-link hover:text-text-link-hover transition-colors">
            or browse example mandates
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Bot className="h-10 w-10 text-text-secondary opacity-40" />
          <p className="text-sm text-text-secondary">No agents match your filter.</p>
          <button onClick={() => { setTab('All'); setSearch('') }} className="text-xs text-text-link hover:text-text-link-hover">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}
