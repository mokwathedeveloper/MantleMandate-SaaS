import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const FALLBACK_TRADES = [
  { id: 'tr-m1', agentId: '', mandateId: '', mandateName: 'ETH Conservative Buyer', assetPair: 'ETH/USDC', direction: 'buy',  amountUsd: 4200,  price: 2847.32, pnl: 318.45,  protocol: 'merchant_moe', txHash: '0x3f8a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a', blockNumber: 58_234_101, status: 'success', mandateRuleApplied: 'RSI < 30 trigger', createdAt: '2026-05-06T09:14:22Z' },
  { id: 'tr-m2', agentId: '', mandateId: '', mandateName: 'ETH Conservative Buyer', assetPair: 'ETH/USDC', direction: 'sell', amountUsd: 4518,  price: 3054.10, pnl: 206.78,  protocol: 'merchant_moe', txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', blockNumber: 58_231_847, status: 'success', mandateRuleApplied: 'RSI > 70 exit',   createdAt: '2026-05-05T16:43:11Z' },
  { id: 'tr-m3', agentId: '', mandateId: '', mandateName: 'ETH Conservative Buyer', assetPair: 'MNT/USDC', direction: 'buy',  amountUsd: 1200,  price: 0.8234,  pnl: -12.50,  protocol: 'fluxion',      txHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1', blockNumber: 58_229_034, status: 'success', mandateRuleApplied: 'Diversification',  createdAt: '2026-05-05T08:00:00Z' },
  { id: 'tr-m4', agentId: '', mandateId: '', mandateName: 'ETH Conservative Buyer', assetPair: 'WBTC/USDC',direction: 'buy',  amountUsd: 2100,  price: 62_430,  pnl: null,    protocol: 'merchant_moe', txHash: null,                                                                    blockNumber: null,       status: 'pending', mandateRuleApplied: 'Momentum breakout', createdAt: '2026-05-06T10:02:44Z' },
]

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json(FALLBACK_TRADES.map(t => ({ ...t, agentId: id })))

    const { data, error } = await supabase
      .from('trades')
      .select('*, mandate:mandates(name)')
      .eq('agent_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error || !data || data.length === 0) {
      return NextResponse.json(FALLBACK_TRADES.map(t => ({ ...t, agentId: id })))
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
      createdAt:          t.created_at,
    })))
  } catch {
    return NextResponse.json(FALLBACK_TRADES.map(t => ({ ...t, agentId: id })))
  }
}
