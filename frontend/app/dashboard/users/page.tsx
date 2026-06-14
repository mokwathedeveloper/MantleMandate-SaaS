'use client'

import { useMemo, useState } from 'react'
import {
  Download, Search, Users as UsersIcon, Bot, ShieldCheck, ArrowUpRight, ArrowDownRight, Loader2,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

import { PageHeader } from '@/components/ui/PageHeader'
import { MetricCard } from '@/components/ui/MetricCard'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterButton } from '@/components/ui/FilterButton'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { cn, truncateAddress } from '@/lib/utils'
import { useAdminUsers, ForbiddenError, type AdminUser } from '@/hooks/useAdminUsers'

const STATUS_FILTERS: Array<{ key: 'all' | 'active' | 'pending'; label: string }> = [
  { key: 'all',     label: 'All' },
  { key: 'active',  label: 'Active' },
  { key: 'pending', label: 'Pending' },
]

const AVATAR_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600']

function avatarColor(id: string): string {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function initialsOf(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never'
  const diffMs = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

function riskTone(score: number) {
  if (score < 30) return { text: 'text-success', bg: 'bg-success' }
  if (score < 60) return { text: 'text-warning', bg: 'bg-warning' }
  return { text: 'text-error', bg: 'bg-error' }
}

function downloadUsersCsv(users: AdminUser[]) {
  const header = ['Name', 'Email', 'Wallet', 'Plan', 'Role', 'Status', 'Agents', 'Risk Score', 'Last Login', 'Joined']
  const rows = users.map((u) => [
    u.name, u.email, u.walletAddr ?? '', u.plan, u.role, u.status,
    String(u.agents), String(u.riskScore), u.lastLogin ?? '', u.joinedAt,
  ])
  const csv = [header, ...rows]
    .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'pending'>('all')
  const { data, isLoading, error } = useAdminUsers()

  const users = useMemo(() => data?.users ?? [], [data])

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (status !== 'all' && u.status !== status) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.walletAddr ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [users, search, status])

  const trend = data?.signupTrend ?? []
  const lastWeek = trend.length > 0 ? trend[trend.length - 1].users : 0
  const prevWeek = trend.length > 1 ? trend[trend.length - 2].users : 0
  const trendDelta = lastWeek - prevWeek

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0',
            avatarColor(u.id),
          )}>
            {initialsOf(u.name)}
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
        <span className="font-mono text-[12px] text-text-secondary">
          {u.walletAddr ? truncateAddress(u.walletAddr) : 'Not connected'}
        </span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (u) => (
        <span className="inline-flex items-center rounded-md border border-border bg-page px-2 py-0.5 text-[11px] font-medium text-text-primary capitalize">
          {u.plan}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <span className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium capitalize',
          u.role === 'admin' ? 'text-primary bg-primary/10' : 'text-text-secondary bg-page border border-border',
        )}>
          {u.role === 'admin' && <ShieldCheck className="h-3 w-3" />}
          {u.role}
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
              <div className={cn('h-full', tone.bg)} style={{ width: `${Math.min(100, Math.max(0, u.riskScore))}%` }} />
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
        <span className="text-[12px] text-text-secondary">{timeAgo(u.lastLogin)}</span>
      ),
    },
  ]

  if (error instanceof ForbiddenError) {
    return (
      <div className="px-6 pt-8 pb-10 space-y-6">
        <PageHeader breadcrumb="USER MANAGEMENT" title="Users" />
        <AlertBanner severity="warning" title="Admin access required">
          This page is only available to administrators. If you believe this is a mistake, ask an
          existing admin to grant your account the &quot;admin&quot; role.
        </AlertBanner>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 pt-8 pb-10 space-y-6">
        <PageHeader breadcrumb="USER MANAGEMENT" title="Users" />
        <AlertBanner severity="error" title="Failed to load users">
          Something went wrong while loading the admin user list. Please try again later.
        </AlertBanner>
      </div>
    )
  }

  return (
    <div className="px-6 pt-8 pb-10 space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="USER MANAGEMENT"
        title="Users"
        subtitle="Manage access, wallet permissions, AI agent ownership, and risk visibility across your organization."
        actions={
          <PrimaryButton
            variant="secondary"
            icon={<Download className="h-4 w-4" />}
            onClick={() => downloadUsersCsv(filtered)}
            disabled={filtered.length === 0}
          >
            Export
          </PrimaryButton>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-text-secondary gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading users…
        </div>
      ) : (
        <>
          {/* Search + filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, email, or wallet address…"
              className="flex-1 max-w-2xl"
            />
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
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Users"
              value={(data?.kpis.totalUsers ?? 0).toLocaleString()}
              icon={<UsersIcon className="h-4 w-4" />}
            />
            <MetricCard
              label="Active Agents"
              value={(data?.kpis.activeAgents ?? 0).toLocaleString()}
              icon={<Bot className="h-4 w-4" />}
            />
            <MetricCard
              label="Total Agents"
              value={(data?.kpis.totalAgents ?? 0).toLocaleString()}
              icon={<Bot className="h-4 w-4" />}
            />
            <MetricCard
              label="Admins"
              value={(data?.kpis.adminCount ?? 0).toLocaleString()}
              icon={<ShieldCheck className="h-4 w-4" />}
            />
          </div>

          {/* Signup trend */}
          <SectionCard
            title="User Signups"
            subtitle="New accounts created over the last 12 weeks"
            action={
              trendDelta !== 0 ? (
                <span className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-semibold',
                  trendDelta > 0 ? 'text-success' : 'text-error',
                )}>
                  {trendDelta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {trendDelta > 0 ? '+' : ''}{trendDelta} vs previous week
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-text-secondary">No change vs previous week</span>
              )
            }
            bodyClassName="px-2 py-2"
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
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
                  allowDecimals={false}
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

          {/* Users table */}
          <SectionCard
            title="Users"
            subtitle={`${filtered.length} of ${users.length} users matching filters`}
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
        </>
      )}
    </div>
  )
}
