'use client'

import { useMemo, useState } from 'react'
import {
  Download, UserPlus, Search, Filter, ChevronDown,
  TrendingUp, Users as UsersIcon, ShieldAlert, Timer,
  ArrowUpRight,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

import { PageHeader } from '@/components/ui/PageHeader'
import { MetricCard } from '@/components/ui/MetricCard'
import { InlineAlert } from '@/components/ui/InlineAlert'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterButton } from '@/components/ui/FilterButton'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { cn } from '@/lib/utils'

import {
  MOCK_USERS, USER_KPIS, USER_ACTIVATION_TREND,
  type MockUser, type UserStatus,
} from '@/mocks/users'

const STATUS_FILTERS: Array<{ key: 'all' | UserStatus; label: string }> = [
  { key: 'all',     label: 'All' },
  { key: 'active',  label: 'Active' },
  { key: 'paused',  label: 'Paused' },
  { key: 'pending', label: 'Pending' },
  { key: 'blocked', label: 'Blocked' },
]

function riskTone(score: number) {
  if (score < 30) return { text: 'text-success', bg: 'bg-success' }
  if (score < 60) return { text: 'text-warning', bg: 'bg-warning' }
  return { text: 'text-error', bg: 'bg-error' }
}

export default function UsersPage() {
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState<'all' | UserStatus>('all')
  const [planFilter, setPlan] = useState<'all' | string>('all')

  const filtered = useMemo(() => {
    return MOCK_USERS.filter((u) => {
      if (status !== 'all' && u.status !== status) return false
      if (planFilter !== 'all' && u.plan !== planFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.walletAddr.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, status, planFilter])

  const columns: DataTableColumn<MockUser>[] = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0',
            u.avatarColor,
          )}>
            {u.initials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{u.name}</p>
            <p className="text-[11px] text-text-secondary truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'wallet',
      header: 'Wallet',
      render: (u) => (
        <span className="font-mono text-[12px] text-text-secondary">{u.walletAddr}</span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (u) => (
        <span className="inline-flex items-center rounded-md border border-border bg-page px-2 py-0.5 text-[11px] font-medium text-text-primary">
          {u.plan}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'agents',
      header: 'Agents',
      align: 'right',
      render: (u) => (
        <span className="text-[13px] font-semibold text-text-primary">{u.agents}</span>
      ),
    },
    {
      key: 'risk',
      header: 'Risk',
      render: (u) => {
        const tone = riskTone(u.riskScore)
        return (
          <div className="flex items-center gap-2 min-w-[88px]">
            <div className="flex-1 h-1.5 rounded-full bg-page overflow-hidden">
              <div className={cn('h-full', tone.bg)} style={{ width: `${u.riskScore}%` }} />
            </div>
            <span className={cn('text-[11px] font-semibold tabular-nums', tone.text)}>
              {u.riskScore}
            </span>
          </div>
        )
      },
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (u) => (
        <span className="text-[12px] text-text-secondary">{u.lastLogin}</span>
      ),
    },
  ]

  return (
    <div className="px-6 pt-8 pb-10 space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="USER MANAGEMENT"
        title="Users"
        subtitle="Manage access, wallet permissions, AI agent ownership, mandate limits, and audit visibility across your organization."
        actions={
          <>
            <PrimaryButton variant="secondary" icon={<Download className="h-4 w-4" />}>
              Export
            </PrimaryButton>
            <PrimaryButton variant="primary" icon={<UserPlus className="h-4 w-4" />}>
              Add User
            </PrimaryButton>
          </>
        }
      />

      {/* Warning banner */}
      <InlineAlert
        tone="warning"
        title="13 users require policy review before their agents can execute new trades."
        action={
          <button className="text-xs font-semibold text-warning hover:underline">
            Review queue →
          </button>
        }
      />

      {/* Search + filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or wallet address…"
          className="flex-1 max-w-2xl"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton icon={<Filter className="h-3.5 w-3.5" />}>
            Filter
          </FilterButton>
          <FilterButton icon={<ChevronDown className="h-3.5 w-3.5" />}>
            Plan: {planFilter === 'all' ? 'All' : planFilter}
          </FilterButton>
          <FilterButton icon={<ChevronDown className="h-3.5 w-3.5" />}>
            Status: {status === 'all' ? 'All' : STATUS_FILTERS.find((s) => s.key === status)?.label}
          </FilterButton>
        </div>
      </div>

      {/* Status pill row (subtle, complementary to dropdown) */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <FilterButton
            key={s.key}
            active={status === s.key}
            onClick={() => setStatus(s.key)}
          >
            {s.label}
          </FilterButton>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Users"
          value={USER_KPIS.totalUsers.value.toLocaleString()}
          delta={USER_KPIS.totalUsers.deltaText}
          deltaTone="positive"
          icon={<UsersIcon className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Agents"
          value={USER_KPIS.activeAgents.value.toLocaleString()}
          delta={USER_KPIS.activeAgents.deltaText}
          deltaTone="positive"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label="Failed Auth"
          value={USER_KPIS.failedAuth.value.toString()}
          delta={USER_KPIS.failedAuth.deltaText}
          deltaTone="positive"
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <MetricCard
          label="Avg Policy Latency"
          value={USER_KPIS.avgPolicyLatency.value.toString()}
          unit="ms"
          delta={USER_KPIS.avgPolicyLatency.deltaText}
          deltaTone="positive"
          icon={<Timer className="h-4 w-4" />}
        />
      </div>

      {/* Activation trend */}
      <SectionCard
        title="User Activation Trend"
        subtitle="New verified users over the last 12 weeks"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
            <ArrowUpRight className="h-3 w-3" />
            +18.6% vs previous period
          </span>
        }
        bodyClassName="px-2 py-2"
      >
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={USER_ACTIVATION_TREND} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="userTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#0066FF" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8B949E', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#8B949E', fontSize: 11 }}
              width={36}
            />
            <Tooltip
              contentStyle={{ background: '#161B22', border: '1px solid #21262D', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#8B949E' }}
              itemStyle={{ color: '#F0F6FC' }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#0066FF"
              strokeWidth={2}
              fill="url(#userTrend)"
              dot={false}
              activeDot={{ r: 4, fill: '#0066FF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Recent users table */}
      <SectionCard
        title="Recent Users"
        subtitle={`${filtered.length} of ${MOCK_USERS.length} users matching filters`}
        action={
          <button className="text-[12px] font-medium text-text-link hover:text-text-link-hover">
            View all →
          </button>
        }
        bodyClassName="px-0 py-0"
        padding="none"
      >
        <div className="border-t border-border">
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(u) => u.id}
            empty={
              <span className="inline-flex items-center gap-2 text-text-secondary">
                <Search className="h-4 w-4" /> No users match your filters
              </span>
            }
          />
        </div>
      </SectionCard>
    </div>
  )
}
