import { NextRequest, NextResponse } from 'next/server'
import { getKlines, BYBIT_SYMBOLS } from '@/lib/bybit'

const VALID_INTERVALS = new Set(['1', '5', '15', '60', 'D', 'W'] as const)
type KlineInterval = '1' | '5' | '15' | '60' | 'D' | 'W'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol      = searchParams.get('symbol')?.toUpperCase() ?? 'BTC'
  const rawInterval = searchParams.get('interval') ?? 'D'
  const interval: KlineInterval = VALID_INTERVALS.has(rawInterval as KlineInterval)
    ? (rawInterval as KlineInterval)
    : 'D'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 200)

  const bybitSymbol = BYBIT_SYMBOLS[symbol] ?? `${symbol}USDT`

  try {
    const klines = await getKlines(bybitSymbol, interval, limit)
    return NextResponse.json({ data: klines, symbol, bybitSymbol })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
