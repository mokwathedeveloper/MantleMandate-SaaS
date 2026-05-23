'use client'

import { useEffect } from 'react'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession } = useAuthStore()

  useEffect(() => {
    // Restore session on page load, then proactively validate/refresh so
    // middleware sees fresh cookies on the next navigation rather than
    // discovering an expired token mid-flight and redirecting to /login.
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        setSession(session)
        setUser(sessionToUser(session.user))
        // Fire-and-forget: validates with Supabase and refreshes the access
        // token if it has expired. The TOKEN_REFRESHED event below picks up
        // the result and updates the store + cookies.
        supabase.auth.getUser().catch(() => {})
      }
    }).catch((err: unknown) => {
      console.error('[SessionProvider] Failed to restore session:', err)
    })

    // Keep store in sync with Supabase auth state changes
    let subscription: { unsubscribe: () => void } | null = null
    try {
      const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (
          event === 'SIGNED_IN'       ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'
        ) {
          if (session) {
            setSession(session)
            setUser(sessionToUser(session.user))
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
        }
      })
      subscription = data.subscription
    } catch (err: unknown) {
      console.error('[SessionProvider] Failed to subscribe to auth state changes:', err)
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
