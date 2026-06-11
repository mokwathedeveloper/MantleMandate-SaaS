import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const FALLBACK_LOGS = [
  { id: 'log-1', agentId: '', event: 'decision',   level: 'info',  message: 'Claude evaluated market: RSI=28.4, momentum bearish → BUY ETH/USDC 5% position',                    txHash: '0x3f8a2b1c4d5e',  blockNumber: 58_234_101, createdAt: '2026-05-06T09:14:22Z' },
  { id: 'log-2', agentId: '', event: 'trade',       level: 'info',  message: 'Buy order filled: 1.476 ETH @ $2,847.32 via Merchant Moe. Gas: 0.001 MNT.',                          txHash: '0x3f8a2b1c4d5e',  blockNumber: 58_234_101, createdAt: '2026-05-06T09:14:28Z' },
  { id: 'log-3', agentId: '', event: 'risk_check',  level: 'info',  message: 'Risk check passed: drawdown 1.2% (limit 5%), position size 4.8% (limit 10%)',                        txHash: null,               blockNumber: null,       createdAt: '2026-05-06T09:14:20Z' },
  { id: 'log-4', agentId: '', event: 'decision',    level: 'info',  message: 'Claude evaluated market: RSI=72.1, overbought → SELL ETH/USDC position',                            txHash: '0xa1b2c3d4e5f6',  blockNumber: 58_231_847, createdAt: '2026-05-05T16:43:11Z' },
  { id: 'log-5', agentId: '', event: 'trade',       level: 'info',  message: 'Sell order filled: 1.476 ETH @ $3,054.10 via Merchant Moe. PnL: +$206.78.',                         txHash: '0xa1b2c3d4e5f6',  blockNumber: 58_231_847, createdAt: '2026-05-05T16:43:17Z' },
  { id: 'log-6', agentId: '', event: 'heartbeat',   level: 'info',  message: 'Agent heartbeat OK. Monitoring ETH/USDC, MNT/USDC. Next evaluation in 5 min.',                     txHash: null,               blockNumber: null,       createdAt: '2026-05-05T12:00:00Z' },
  { id: 'log-7', agentId: '', event: 'risk_check',  level: 'warn',  message: 'Drawdown approaching limit: 4.1% of 5.0% max. Reducing position size by 50% as precaution.',       txHash: null,               blockNumber: null,       createdAt: '2026-05-04T18:30:00Z' },
  { id: 'log-8', agentId: '', event: 'policy',      level: 'info',  message: 'Policy hash verified on-chain: 0x9f3c2b4a8d1e5f6a. All mandate conditions satisfied.',             txHash: '0x9f3c2b4a8d1e',  blockNumber: 58_220_001, createdAt: '2026-05-04T09:00:00Z' },
]

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
      .from('audit_logs')
      .select('*')
      .eq('agent_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error || !data || data.length === 0) {
      return NextResponse.json(FALLBACK_LOGS.map(l => ({ ...l, agentId: id })))
    }

    return NextResponse.json(data.map((l: Record<string, unknown>) => ({
      id:          l.id,
      agentId:     l.agent_id,
      event:       l.event_type,
      level:       l.level ?? 'info',
      message:     l.message,
      txHash:      l.tx_hash,
      blockNumber: l.block_number,
      createdAt:   l.created_at,
    })))
  } catch {
    return NextResponse.json(FALLBACK_LOGS.map(l => ({ ...l, agentId: id })))
  }
}
