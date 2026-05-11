import { NextResponse } from 'next/server'
import { getSpotTickers, BYBIT_SYMBOLS } from '@/lib/bybit'

export interface TokenPrice {
  symbol:       string
  price:        number
  change24h:    number
  change24hPct: number
  volume24h:    number
  lastUpdated:  string
}

// Server-side cache — 30 second TTL
let cache: { data: TokenPrice[]; ts: number } | null = null
const CACHE_TTL = 30_000

// Reverse map: bybit symbol → our symbol (first match wins, ignores proxies)
const REVERSE: Record<string, string> = {}
for (const [sym, bybitSym] of Object.entries(BYBIT_SYMBOLS)) {
  if (!REVERSE[bybitSym]) REVERSE[bybitSym] = sym
}

// Deduplicated list of pairs to fetch (excludes proxy duplicates like WBTC→BTCUSDT)
const UNIQUE_PAIRS = Array.from(new Set(Object.values(BYBIT_SYMBOLS)))

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({ data: cache.data, cached: true })
  }

  try {
    const tickers = await getSpotTickers(UNIQUE_PAIRS)
    const now = new Date().toISOString()

    const data: TokenPrice[] = tickers.map(t => ({
      symbol:       REVERSE[t.symbol] ?? t.symbol.replace('USDT', ''),
      price:        t.lastPrice,
      change24h:    t.lastPrice * (t.change24hPct / 100),
      change24hPct: t.change24hPct,
      volume24h:    t.turnover24h,
      lastUpdated:  now,
    }))

    cache = { data, ts: Date.now() }
    return NextResponse.json({ data })

  } catch (err) {
    if (cache) return NextResponse.json({ data: cache.data, cached: true, stale: true })
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
