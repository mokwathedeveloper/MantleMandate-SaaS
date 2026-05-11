import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const FALLBACK = [
  { id: 'pos-1', asset: 'ETH',  protocol: 'merchant_moe', direction: 'long',  size: 12_400, entryPrice: 2847.32, currentPrice: 3041.50, pnl: 318.45,  pnlPct: 2.57,  status: 'open' },
  { id: 'pos-2', asset: 'USDC', protocol: 'agni',         direction: 'long',  size: 18_500, entryPrice: 1.0001,  currentPrice: 1.0003,  pnl: 42.30,   pnlPct: 0.23,  status: 'open' },
  { id: 'pos-3', asset: 'MNT',  protocol: 'fluxion',      direction: 'long',  size: 3_200,  entryPrice: 0.8234,  currentPrice: 0.8480,  pnl: 95.60,   pnlPct: 2.99,  status: 'open' },
  { id: 'pos-4', asset: 'WBTC', protocol: 'merchant_moe', direction: 'long',  size: 8_100,  entryPrice: 62_430,  currentPrice: 63_180,  pnl: 97.40,   pnlPct: 1.20,  status: 'open' },
  { id: 'pos-5', asset: 'ETH',  protocol: 'fluxion',      direction: 'short', size: 5_200,  entryPrice: 3089.00, currentPrice: 3041.50, pnl: 79.80,   pnlPct: 1.54,  status: 'open' },
  { id: 'pos-6', asset: 'USDT', protocol: 'agni',         direction: 'long',  size: 9_000,  entryPrice: 1.0000,  currentPrice: 0.9998,  pnl: -18.00,  pnlPct: -0.20, status: 'closed' },
  { id: 'pos-7', asset: 'ETH',  protocol: 'merchant_moe', direction: 'long',  size: 4_500,  entryPrice: 2690.14, currentPrice: 3041.50, pnl: 585.20,  pnlPct: 13.06, status: 'closed' },
]

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json(FALLBACK)

    const { data, error } = await supabase
      .from('trades')
      .select('id, asset_pair, protocol, direction, amount_usd, price, pnl, status, created_at')
      .eq('user_id', user.id)
      .in('status', ['open', 'pending'])
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) return NextResponse.json(FALLBACK)

    return NextResponse.json(data.map((t: Record<string, unknown>) => ({
      id:           t.id,
      asset:        (t.asset_pair as string)?.split('/')[0] ?? 'ETH',
      protocol:     t.protocol,
      direction:    t.direction,
      size:         t.amount_usd,
      entryPrice:   t.price,
      currentPrice: t.price,
      pnl:          t.pnl ?? 0,
      pnlPct:       t.amount_usd && (t.price as number) > 0
        ? ((t.pnl as number ?? 0) / (t.amount_usd as number)) * 100
        : 0,
      status: t.status === 'pending' ? 'open' : t.status,
    })))
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
