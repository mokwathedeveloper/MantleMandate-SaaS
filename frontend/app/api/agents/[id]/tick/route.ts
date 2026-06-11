import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { runAgentTick } from '@/lib/agentTick'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent, error } = await supabase
    .from('agents')
    .select('*, mandate:mandates(policy_hash, parsed_policy)')
    .eq('id', id)
    .single()

  if (error || !agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  if (agent.status !== 'active') {
    return NextResponse.json({ error: `Agent is ${agent.status} — must be active to run a trading cycle` }, { status: 409 })
  }

  try {
    const result = await runAgentTick(supabase, agent)
    return NextResponse.json({ data: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[tick] failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
