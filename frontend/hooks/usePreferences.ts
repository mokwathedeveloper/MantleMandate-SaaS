import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export interface UserPreferences {
  theme:        'dark' | 'light' | 'system'
  layout:       'expanded' | 'compact'
  timeRange:    string
  dateFormat:   string
  numberFormat: string
  currency:     string
  language:     string
  emailToggles: boolean[]
  telegramUrl:  string
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme:        'dark',
  layout:       'expanded',
  timeRange:    '1 Month',
  dateFormat:   'MM/DD/YYYY',
  numberFormat: '1,234.56',
  currency:     'USD ($)',
  language:     'English',
  emailToggles: [],
  telegramUrl:  '',
}

export function usePreferences() {
  const { user } = useAuthStore()
  return useQuery<UserPreferences>({
    queryKey: ['preferences', user?.id],
    queryFn: async () => {
      if (!user) return DEFAULT_PREFERENCES
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single()
      if (error || !data?.preferences) return DEFAULT_PREFERENCES
      return { ...DEFAULT_PREFERENCES, ...(data.preferences as Partial<UserPreferences>) }
    },
    retry: false,
    enabled: !!user,
  })
}

export function useUpdatePreferences() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<UserPreferences>) => {
      if (!user) throw new Error('Not authenticated')
      const current = qc.getQueryData<UserPreferences>(['preferences', user.id]) ?? DEFAULT_PREFERENCES
      const next = { ...current, ...patch }
      const { error } = await supabase
        .from('profiles')
        .update({ preferences: next })
        .eq('id', user.id)
      if (error) throw error
      return next
    },
    onSuccess: (next) => {
      qc.setQueryData(['preferences', user?.id], next)
    },
  })
}
