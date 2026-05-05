export interface User {
  id: string
  email: string
  name: string
  plan: 'operator' | 'strategist' | 'institution'
  trialEndsAt: string | null
  ensName: string | null
  createdAt: string
}
