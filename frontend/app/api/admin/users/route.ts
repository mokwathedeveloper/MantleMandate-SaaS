import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const TREND_WEEKS = 12

interface ProfileRow {
  id: string
  email: string
  name: string | null
  plan: string
  role: string
  created_at: string
}

interface AgentRow {
  user_id: string
  status: string
  drawdown_current: number | null
  onchain_owner: string | null
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (callerProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Admin API not configured: missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const [{ data: profiles, error: profilesError }, { data: agents }, { data: authUsers }] = await Promise.all([
      admin.from('profiles').select('id, email, name, plan, role, created_at'),
      admin.from('agents').select('user_id, status, drawdown_current, onchain_owner'),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ])

    if (profilesError || !profiles) {
      return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
    }

    const agentRows = (agents ?? []) as AgentRow[]
    const agentsByUser = new Map<string, AgentRow[]>()
    for (const a of agentRows) {
      const list = agentsByUser.get(a.user_id) ?? []
      list.push(a)
      agentsByUser.set(a.user_id, list)
    }

    const lastLoginByUser = new Map<string, string | null>()
    for (const au of authUsers?.users ?? []) {
      lastLoginByUser.set(au.id, au.last_sign_in_at ?? null)
    }

    const users = (profiles as ProfileRow[]).map((p) => {
      const userAgents = agentsByUser.get(p.id) ?? []
      const activeAgents = userAgents.filter((a) => a.status === 'active')
      const riskScore = userAgents.length
        ? Math.round(userAgents.reduce((s, a) => s + (a.drawdown_current ?? 0), 0) / userAgents.length)
        : 0
      const walletAddr = userAgents.find((a) => a.onchain_owner)?.onchain_owner ?? null

      return {
        id:         p.id,
        name:       p.name || p.email,
        email:      p.email,
        walletAddr,
        plan:       p.plan,
        role:       p.role,
        status:     activeAgents.length > 0 ? 'active' as const : 'pending' as const,
        agents:     userAgents.length,
        riskScore,
        lastLogin:  lastLoginByUser.get(p.id) ?? null,
        joinedAt:   p.created_at,
      }
    })

    const totalUsers   = profiles.length
    const totalAgents  = agentRows.length
    const activeAgents = agentRows.filter((a) => a.status === 'active').length
    const adminCount   = (profiles as ProfileRow[]).filter((p) => p.role === 'admin').length

    // Signup-by-week histogram for the last TREND_WEEKS weeks (oldest → newest)
    const now = Date.now()
    const signupTrend = Array.from({ length: TREND_WEEKS }, (_, i) => {
      const weeksAgo  = TREND_WEEKS - 1 - i
      const weekStart = new Date(now - (weeksAgo + 1) * WEEK_MS)
      const weekEnd   = new Date(now - weeksAgo * WEEK_MS)
      const count = (profiles as ProfileRow[]).filter((p) => {
        const t = new Date(p.created_at).getTime()
        if (i === 0) return t < weekEnd.getTime()
        return t >= weekStart.getTime() && t < weekEnd.getTime()
      }).length
      return {
        week:  weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: count,
      }
    })

    return NextResponse.json({
      users,
      kpis: { totalUsers, activeAgents, totalAgents, adminCount },
      signupTrend,
    })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
