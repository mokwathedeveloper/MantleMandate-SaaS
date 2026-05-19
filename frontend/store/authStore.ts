import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Session } from '@supabase/supabase-js'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  session: Session | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:       null,
      session:    null,
      setUser:    (user)    => set({ user }),
      setSession: (session) => set({ session }),
      logout:     ()        => set({ user: null, session: null }),
    }),
    {
      name:    'mm-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist the user profile — session tokens are managed by
      // Supabase's own storage; we don't need to duplicate them here.
      partialize: (state) => ({ user: state.user }),
    }
  )
)
