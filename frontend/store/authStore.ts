import { create } from 'zustand'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  setUser: (user) => set({ user }),
  setAccessToken: (token) => {
    if (token) localStorage.setItem('access_token', token)
    else localStorage.removeItem('access_token')
    set({ accessToken: token })
  },
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, accessToken: null })
  },
}))
