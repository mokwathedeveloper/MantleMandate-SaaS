'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'

interface LoginPayload  { email: string; password: string }
interface SignupPayload { name: string; email: string; password: string; company?: string }

interface AuthResponse {
  data: {
    accessToken:  string
    refreshToken: string
    user: { id: string; email: string; name: string; plan: string }
  }
  message: string
}

export function useLogin() {
  const { setAccessToken, setUser } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),
    onSuccess: (res) => {
      setAccessToken(res.data.accessToken)
      localStorage.setItem('refresh_token', res.data.refreshToken)
      setUser(res.data.user as User)
      router.push('/dashboard')
    },
  })
}

export function useSignup() {
  const { setAccessToken, setUser } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: SignupPayload) =>
      api.post<AuthResponse>('/auth/signup', payload).then((r) => r.data),
    onSuccess: (res) => {
      setAccessToken(res.data.accessToken)
      localStorage.setItem('refresh_token', res.data.refreshToken)
      setUser(res.data.user as User)
      router.push('/onboarding')
    },
  })
}

export function useMe() {
  const { accessToken, setUser } = useAuthStore()

  const query = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.data),
    enabled: !!accessToken,
  })

  // Sync user into Zustand whenever the query resolves — replaces deprecated onSuccess
  useEffect(() => {
    if (query.data) setUser(query.data)
  }, [query.data, setUser])

  return query
}

export function useLogout() {
  const { logout } = useAuthStore()
  const qc = useQueryClient()
  const router = useRouter()

  return () => {
    api.post('/auth/logout').catch(() => {})
    logout()
    qc.clear()
    router.push('/login')
  }
}
