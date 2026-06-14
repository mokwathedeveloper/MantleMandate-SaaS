'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

export class ForbiddenError extends Error {}

export interface AdminUser {
  id:         string
  name:       string
  email:      string
  walletAddr: string | null
  plan:       string
  role:       string
  status:     'active' | 'pending'
  agents:     number
  riskScore:  number
  lastLogin:  string | null
  joinedAt:   string
}

export interface AdminUsersKpis {
  totalUsers:   number
  activeAgents: number
  totalAgents:  number
  adminCount:   number
}

export interface AdminUsersResponse {
  users:       AdminUser[]
  kpis:        AdminUsersKpis
  signupTrend: { week: string; users: number }[]
}

export function useAdminUsers() {
  const { user } = useAuthStore()

  return useQuery<AdminUsersResponse>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      if (res.status === 403) throw new ForbiddenError('Admin access required')
      if (!res.ok) throw new Error('Failed to load admin users')
      return res.json() as Promise<AdminUsersResponse>
    },
    enabled: !!user,
    retry: false,
    staleTime: 30_000,
  })
}
