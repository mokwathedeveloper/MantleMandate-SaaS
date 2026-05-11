'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, TrendingUp, Zap, Shield,
  Bot, Gauge, Network, Code2,
  Bell, BarChart2, Settings, HelpCircle, CreditCard,
  Users, Wallet,
  LogOut, X,
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
  { href: '/dashboard',                label: 'Dashboard',      Icon: LayoutDashboard },
  { href: '/dashboard/mandates',       label: 'Mandates',       Icon: FileText },
  { href: '/dashboard/portfolio',      label: 'Portfolio',      Icon: TrendingUp },
  { href: '/dashboard/trades',         label: 'Trades',         Icon: Zap },
  { href: '/dashboard/audit',          label: 'On-Chain Audit', Icon: Shield },
]

const AGENTS: NavItem[] = [
  { href: '/dashboard/agents',         label: 'AI Agents',   Icon: Bot },
  { href: '/dashboard/risk',           label: 'Risk Engine', Icon: Gauge },
  { href: '/dashboard/protocols',      label: 'Protocols',   Icon: Network },
  { href: '/dashboard/api',            label: 'API',         Icon: Code2 },
]

const USER_MGMT: NavItem[] = [
  { href: '/dashboard/users',          label: 'Users',   Icon: Users },
  { href: '/dashboard/wallets',        label: 'Wallets', Icon: Wallet },
]

const ACCOUNT: NavItem[] = [
  { href: '/dashboard/alerts',         label: 'Alerts',   Icon: Bell },
  { href: '/dashboard/reports',        label: 'Reports',  Icon: BarChart2 },
  { href: '/dashboard/billing',        label: 'Billing',  Icon: CreditCard },
  { href: '/dashboard/settings',       label: 'Settings', Icon: Settings },
  { href: '/dashboard/support',        label: 'Support',  Icon: HelpCircle },
]

const PLAN_LABELS: Record<string, string> = {
  operator:    'Operator',
  strategist:  'Strategist',
  institution: 'Institution',
}

function NavLink({ href, label, Icon, badge, onClose }: NavItem & { badge?: number; onClose?: () => void }) {
  const pathname = usePathname()
  const active = href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors duration-150',
        active
          ? 'bg-card text-text-primary border-l-[3px] border-primary pl-[9px]'
          : 'text-text-secondary hover:text-text-primary hover:bg-card border-l-[3px] border-transparent pl-[9px]',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-text-primary' : 'text-text-secondary')} />
      <span className="flex-1 truncate">{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto h-4 min-w-4 rounded-full bg-error text-white text-[10px] font-semibold flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}

function NavSection({ title, items, alertCount, onClose }: { title: string; items: NavItem[]; alertCount?: number; onClose?: () => void }) {
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
          onClose={onClose}
        />
      ))}
    </div>
  )
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user } = useAuthStore()
  const logout   = useLogout()
  const { unreadCount } = useAlertStore()

  return (
    <aside
      className={cn(
        // mobile: fixed overlay drawer, slides in from left
        'fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col bg-page border-r border-border',
        'transform transition-transform duration-300 ease-in-out',
        // desktop: always visible as part of flow
        'lg:relative lg:translate-x-0 lg:w-60 lg:z-auto lg:transition-none',
        // mobile open/close
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* Logo + close button */}
      <div className="flex h-20 items-center justify-between border-b border-border shrink-0 px-4">
        <Image
          src="/logo.png"
          alt="MantleMandate"
          width={72}
          height={72}
          className="h-[72px] w-[72px] object-contain"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,102,255,0.45))' }}
          priority
        />
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden p-2 rounded-md text-text-disabled hover:text-text-primary hover:bg-card transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-hidden">
        <NavSection title="Main"            items={MAIN}      onClose={onClose} />
        <NavSection title="Agents"          items={AGENTS}    onClose={onClose} />
        <NavSection title="User Management" items={USER_MGMT} onClose={onClose} />
        <NavSection title="Account"         items={ACCOUNT}   alertCount={unreadCount} onClose={onClose} />
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
            className="shrink-0 text-text-disabled hover:text-error transition-colors p-1.5 rounded"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tagline */}
      <div className="px-4 py-2.5 text-center shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/60">
          Your AI · Your Rules
        </p>
      </div>
    </aside>
  )
}
