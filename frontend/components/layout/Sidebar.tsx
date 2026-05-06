'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, TrendingUp, Zap, Shield,
  Bot, Gauge, Network, Code2,
  Bell, BarChart2, Settings, HelpCircle, CreditCard,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useAlertStore } from '@/store/alertStore'

interface NavItem {
  href:  string
  label: string
  Icon:  typeof Bot
}

const MAIN: NavItem[] = [
  { href: '/dashboard',                label: 'Dashboard',   Icon: LayoutDashboard },
  { href: '/dashboard/mandates',       label: 'Mandates',    Icon: FileText },
  { href: '/dashboard/portfolio',      label: 'Portfolio',   Icon: TrendingUp },
  { href: '/dashboard/trades',         label: 'Trades',      Icon: Zap },
  { href: '/dashboard/audit',          label: 'Audit Trail', Icon: Shield },
]

const AGENTS: NavItem[] = [
  { href: '/dashboard/agents',         label: 'AI Agents',   Icon: Bot },
  { href: '/dashboard/risk',           label: 'Risk Engine', Icon: Gauge },
  { href: '/dashboard/protocols',      label: 'Protocols',   Icon: Network },
  { href: '/dashboard/api',            label: 'API',         Icon: Code2 },
]

const ACCOUNT: NavItem[] = [
  { href: '/dashboard/alerts',         label: 'Alerts',      Icon: Bell },
  { href: '/dashboard/reports',        label: 'Reports',     Icon: BarChart2 },
  { href: '/dashboard/billing',        label: 'Billing',     Icon: CreditCard },
  { href: '/dashboard/settings',       label: 'Settings',    Icon: Settings },
  { href: '/dashboard/support',        label: 'Support',     Icon: HelpCircle },
]

const PLAN_LABELS: Record<string, string> = {
  operator:    'Operator',
  strategist:  'Strategist',
  institution: 'Institution',
}

function NavLink({ href, label, Icon, badge }: NavItem & { badge?: number }) {
  const pathname = usePathname()
  // Active if exact match OR sub-route (but not /dashboard matching /dashboard/*)
  const active = href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-150',
        active
          ? 'bg-card text-text-primary border-l-[3px] border-primary pl-[9px]'
          : 'text-text-secondary hover:text-text-primary hover:bg-card border-l-[3px] border-transparent pl-[9px]',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-text-primary' : 'text-text-secondary')} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto h-4 min-w-4 rounded-full bg-error text-white text-[10px] font-semibold flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}

function NavSection({ title, items, alertCount }: { title: string; items: NavItem[]; alertCount?: number }) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-disabled">
        {title}
      </p>
      {items.map((item) => (
        <NavLink
          key={item.href}
          {...item}
          badge={item.href === '/dashboard/alerts' ? alertCount : undefined}
        />
      ))}
    </div>
  )
}

export function Sidebar() {
  const { user } = useAuthStore()
  const logout   = useLogout()
  const { unreadCount } = useAlertStore()

  return (
    <aside className="flex h-full w-60 flex-col bg-page border-r border-border">
      {/* Logo */}
      <div className="flex h-[120px] items-center justify-center border-b border-border shrink-0">
        <Image src="/logo.png" alt="MantleMandate" width={112} height={112} className="h-28 w-28 object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-hidden">
        <NavSection title="Main"    items={MAIN} />
        <NavSection title="Agents"  items={AGENTS} />
        <NavSection title="Account" items={ACCOUNT} alertCount={unreadCount} />
      </nav>

      {/* User info — pinned bottom */}
      {user && (
        <div className="border-t border-border p-3 flex items-center gap-2.5 shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary text-xs font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{user.name}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80 mt-0.5">
              {PLAN_LABELS[user.plan] ?? user.plan}
            </p>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="shrink-0 text-text-disabled hover:text-error transition-colors p-1 rounded"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  )
}
