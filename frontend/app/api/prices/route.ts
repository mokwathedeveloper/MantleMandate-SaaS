import { NextResponse } from 'next/server'

// Tokens traded on Mantle Network — CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  MNT:   'mantle',
  ETH:   'ethereum',
  USDC:  'usd-coin',
  USDT:  'tether',
  WBTC:  'wrapped-bitcoin',
  WETH:  'weth',
}

export interface TokenPrice {
  symbol:        string
  price:         number
  change24h:     number
  change24hPct:  number
  volume24h:     number
  marketCap:     number
  lastUpdated:   string
}

// Server-side cache — 30 second TTL (avoids hitting CoinGecko rate limits)
let cache: { data: TokenPrice[]; ts: number } | null = null
const CACHE_TTL = 30_000

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({ data: cache.data, cached: true })
  }

  try {
    const ids = Object.values(COINGECKO_IDS).join(',')
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&sparkline=false&price_change_percentage=24h`

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    })

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`)

    const raw = await res.json() as Array<{
      symbol:                            string
      current_price:                     number
      price_change_24h:                  number
      price_change_percentage_24h:       number
      total_volume:                      number
      market_cap:                        number
      last_updated:                      string
    }>

    // Map back to our symbol names
    const symbolMap = Object.fromEntries(
      Object.entries(COINGECKO_IDS).map(([sym, id]) => [id, sym])
    )

    const data: TokenPrice[] = raw.map(coin => ({
      symbol:       symbolMap[coin.symbol.toLowerCase()] ?? coin.symbol.toUpperCase(),
      price:        coin.current_price,
      change24h:    coin.price_change_24h ?? 0,
      change24hPct: coin.price_change_percentage_24h ?? 0,
      volume24h:    coin.total_volume ?? 0,
      marketCap:    coin.market_cap ?? 0,
      lastUpdated:  coin.last_updated,
    }))

    cache = { data, ts: Date.now() }
    return NextResponse.json({ data })

  } catch (err) {
    // Fallback to cache even if stale rather than failing
    if (cache) return NextResponse.json({ data: cache.data, cached: true, stale: true })

    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
