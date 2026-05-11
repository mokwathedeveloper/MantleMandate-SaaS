'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useAlertStore } from '@/store/alertStore'
import { useLogout } from '@/hooks/useAuth'

const PLAN_COLOR: Record<string, string> = {
  operator:    'bg-blue-500/15 text-blue-400',
  strategist:  'bg-purple-500/15 text-purple-400',
  institution: 'bg-amber-500/15 text-amber-400',
}

const PLAN_LABEL: Record<string, string> = {
  operator:    'Operator',
  strategist:  'Strategist',
  institution: 'Institution',
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function breadcrumb(pathname: string): string {
  const parts = pathname.replace('/dashboard', '').split('/').filter(Boolean)
  if (!parts.length) return 'Dashboard'
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' / ')
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname  = usePathname()
  const user      = useAuthStore((s) => s.user)
  const { unreadCount, markAllRead, alerts } = useAlertStore()
  const logout    = useLogout()

  const [dropOpen,  setDropOpen]  = useState(false)
  const [bellOpen,  setBellOpen]  = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const plan = user?.plan ?? 'operator'

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 sm:px-6 border-b border-white/5 bg-page/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        {/* Breadcrumb */}
        <span className="text-sm text-muted-foreground font-medium tracking-wide truncate">
          {breadcrumb(pathname)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => { setBellOpen((v) => !v); if (!bellOpen) markAllRead() }}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-card shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <Link
                  href="/dashboard/alerts"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setBellOpen(false)}
                >
                  View all
                </Link>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {alerts.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications</p>
                ) : (
                  alerts.slice(0, 6).map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        'px-4 py-3 text-sm',
                        !a.isRead && 'bg-white/[0.03]',
                      )}
                    >
                      <p className="font-medium text-foreground/90 line-clamp-1">{a.title}</p>
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-purple-600/60 text-xs font-bold text-white shrink-0 select-none">
              {user ? initials(user.name || user.email) : '?'}
            </div>

            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span className="text-sm font-medium text-foreground/90 max-w-[120px] truncate">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', PLAN_COLOR[plan])}>
                {PLAN_LABEL[plan]}
              </span>
            </div>

            <ChevronDown
              className={cn('h-4 w-4 text-muted-foreground transition-transform', dropOpen && 'rotate-180')}
            />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-card shadow-2xl overflow-hidden z-50">
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-semibold text-foreground/90 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {user?.email}
                </p>
                {user?.ensName && (
                  <p className="text-xs text-primary mt-0.5 truncate">{user.ensName}</p>
                )}
              </div>

              {/* Links */}
              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-white/5 hover:text-foreground transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-white/5 hover:text-foreground transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </div>

              <div className="border-t border-white/5 py-1">
                <button
                  onClick={() => { setDropOpen(false); logout() }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
