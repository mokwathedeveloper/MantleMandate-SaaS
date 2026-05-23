'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface LoginPayload  { email: string; password: string }
interface SignupPayload { name: string; email: string; password: string; company?: string }

export function useLogin() {
  const { setUser, setSession } = useAuthStore()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = async ({ email, password }: LoginPayload) => {
    setIsPending(true)
    setError(null)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    setIsPending(false)

    if (err) {
      setError(err)
      return
    }

    if (data.session && data.user) {
      setSession(data.session)
      setUser({
        id:          data.user.id,
        email:       data.user.email ?? '',
        name:        data.user.user_metadata?.name ?? data.user.email?.split('@')[0] ?? '',
        plan:        data.user.user_metadata?.plan ?? 'operator',
        trialEndsAt: null,
        ensName:     null,
        createdAt:   data.user.created_at,
      })
      // Push first so navigation starts immediately — Supabase has already written
      // auth cookies, so middleware validates them on the dashboard request.
      // router.refresh() (returns void, cannot be awaited) clears the client RSC
      // cache in the background so subsequent navigations use fresh server state.
      try {
        router.push('/dashboard')
        router.refresh()
      } catch {
        // navigation errors are non-fatal; the push has already started
      }
    }
  }

  return { mutate, isPending, error }
}

export function useSignup() {
  const { setUser, setSession } = useAuthStore()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = async ({ name, email, password }: SignupPayload) => {
    setIsPending(true)
    setError(null)
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    setIsPending(false)

    if (err) {
      setError(err)
      return
    }

    if (data.session && data.user) {
      setSession(data.session)
      setUser({
        id:          data.user.id,
        email:       data.user.email ?? '',
        name,
        plan:        'operator',
        trialEndsAt: null,
        ensName:     null,
        createdAt:   data.user.created_at,
      })
      try {
        router.push('/dashboard')
        router.refresh()
      } catch {
        // navigation errors are non-fatal; the push has already started
      }
    } else {
      // Email confirmation required
      router.push('/login?confirmed=1')
    }
  }

  return { mutate, isPending, error }
}

export function useOAuth() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const signIn = async (provider: 'google' | 'azure') => {
    setIsPending(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: provider === 'azure' ? 'email profile openid' : undefined,
      },
    })
    if (err) {
      setError(err)
      setIsPending(false)
    }
    // On success Supabase redirects the browser — no need to setIsPending(false)
  }

  return { signIn, isPending, error }
}

export function useLogout() {
  const { logout } = useAuthStore()
  const qc = useQueryClient()
  const router = useRouter()

  return async () => {
    await supabase.auth.signOut()
    logout()
    qc.clear()
    router.push('/login')
  }
}

export function useMe() {
  const { user } = useAuthStore()
  return { data: user, isLoading: false }
}
