'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Bot, TrendingUp, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',           label: 'Home',      Icon: LayoutDashboard },
  { href: '/dashboard/mandates',  label: 'Mandates',  Icon: FileText },
  { href: '/dashboard/agents',    label: 'Agents',    Icon: Bot },
  { href: '/dashboard/portfolio', label: 'Portfolio', Icon: TrendingUp },
  { href: '/dashboard/audit',     label: 'Audit',     Icon: Shield },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-page border-t border-border"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors',
                active ? 'text-primary' : 'text-text-disabled hover:text-text-secondary',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('h-5 w-5', active && 'text-primary')} />
              {label}
            </Link>
          )
        })}
      </div>
      {/* Safe area spacer for iOS home indicator */}
      <div className="h-safe-area-inset-bottom bg-page" />
    </nav>
  )
}
