import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getTradeDecision } from '@/lib/agentDecision'

export async function POST(req: NextRequest) {
  // Auth guard — consumes OpenRouter credits; must be authenticated
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as {
      policy?:            unknown
      portfolio_value?:  number
      current_drawdown?: number
    }

    if (!body.policy || typeof body.policy !== 'object' || Array.isArray(body.policy)) {
      return NextResponse.json({ error: 'Invalid policy object' }, { status: 400 })
    }

    const policy           = body.policy as Record<string, unknown>
    const portfolio_value  = typeof body.portfolio_value  === 'number' ? body.portfolio_value  : 0
    const current_drawdown = typeof body.current_drawdown === 'number' ? body.current_drawdown : 0

    const result = await getTradeDecision(policy, portfolio_value, current_drawdown)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ data: result.data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
