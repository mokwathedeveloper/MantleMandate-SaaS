import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('trades')
      .select('*, mandate:mandates(name)')
      .eq('agent_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error || !data) {
      return NextResponse.json([])
    }

    return NextResponse.json(data.map((t: Record<string, unknown>) => ({
      id:                 t.id,
      agentId:            t.agent_id,
      mandateId:          t.mandate_id,
      mandateName:        (t.mandate as Record<string, string> | null)?.name ?? '',
      assetPair:          t.asset_pair,
      direction:          t.direction,
      amountUsd:          t.amount_usd,
      price:              t.price,
      pnl:                t.pnl,
      protocol:           t.protocol,
      txHash:             t.tx_hash,
      blockNumber:        t.block_number,
      status:             t.status,
      mandateRuleApplied: t.mandate_rule_applied,
      reasoningCid:       t.reasoning_cid ?? null,
      reasoningPinned:    Boolean(t.reasoning_pinned),
      commitmentTxHash:   t.commitment_tx_hash ?? null,
      createdAt:          t.created_at,
    })))
  } catch {
    return NextResponse.json([])
  }
}
