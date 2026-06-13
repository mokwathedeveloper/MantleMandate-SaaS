import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface TradeRow {
  asset_pair: string
  direction:  'buy' | 'sell'
  amount_usd: number
  price:      number
  pnl:        number | null
  protocol:   string
  created_at: string
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
    if (!user) return NextResponse.json([])

    const { data, error } = await supabase
      .from('trades')
      .select('asset_pair, direction, amount_usd, price, pnl, protocol, created_at')
      .eq('user_id', user.id)
      .eq('status', 'success')
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) return NextResponse.json([])

    const byPair = new Map<string, TradeRow[]>()
    for (const row of data as TradeRow[]) {
      const rows = byPair.get(row.asset_pair) ?? []
      rows.push(row)
      byPair.set(row.asset_pair, rows)
    }

    const positions = Array.from(byPair.entries()).map(([assetPair, rows]) => {
      const netSize = rows.reduce((s, r) => s + (r.direction === 'buy' ? r.amount_usd : -r.amount_usd), 0)
      const totalNotional = rows.reduce((s, r) => s + r.amount_usd, 0)
      const entryPrice = totalNotional > 0
        ? rows.reduce((s, r) => s + r.amount_usd * r.price, 0) / totalNotional
        : 0
      const currentPrice = rows[rows.length - 1].price
      const pnl = rows.reduce((s, r) => s + (r.pnl ?? 0), 0)
      const pnlPct = totalNotional > 0 ? (pnl / totalNotional) * 100 : 0
      const protocol = rows[rows.length - 1].protocol

      return {
        id:           assetPair,
        asset:        assetPair.split('/')[0] ?? assetPair,
        protocol,
        direction:    netSize >= 0 ? 'long' : 'short' as 'long' | 'short',
        size:         Math.abs(netSize),
        entryPrice,
        currentPrice,
        pnl,
        pnlPct,
        status:       Math.abs(netSize) > 0.01 ? 'open' : 'closed' as 'open' | 'closed',
      }
    })

    return NextResponse.json(positions)
  } catch {
    return NextResponse.json([])
  }
}
