'use client'

import { useEffect } from 'react'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession } = useAuthStore()

  useEffect(() => {
    // Restore session on page load — silently skip if Supabase is unreachable
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        setSession(session)
        setUser(sessionToUser(session.user))
      }
    }).catch(() => { /* Supabase offline / paused — app continues with mock data */ })

    // Keep store in sync with Supabase auth state changes
    let subscription: { unsubscribe: () => void } | null = null
    try {
      const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          setSession(session)
          setUser(sessionToUser(session.user))
        } else {
          setSession(null)
          setUser(null)
        }
      })
      subscription = data.subscription
    } catch {
      // Supabase unavailable — auth state changes will not be tracked
    }

    return () => subscription?.unsubscribe()
  }, [setSession, setUser])

  return <>{children}</>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sessionToUser(u: any): User {
  return {
    id:          u.id,
    email:       u.email ?? '',
    name:        u.user_metadata?.name ?? u.email?.split('@')[0] ?? '',
    plan:        u.user_metadata?.plan ?? 'operator',
    trialEndsAt: null,
    ensName:     null,
    createdAt:   u.created_at,
  }
}
