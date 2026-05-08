import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/openrouter'

const SYSTEM = `You are an AI trading agent running on MantleMandate on Mantle Network.

You are given a trading mandate policy and live market data. Decide whether to execute a trade.

Respond ONLY with valid JSON:
{
  "action": "buy" | "sell" | "hold",
  "confidence": 0-100,
  "reasoning": "one sentence explanation",
  "amount_pct": 0-100,
  "urgency": "low" | "medium" | "high"
}

Rules:
- Only recommend "buy" or "sell" when confidence >= 65
- amount_pct is % of available capital (max capped by mandate riskPerTrade)
- Be conservative — protecting capital is priority #1
- Consider the mandate constraints strictly`

interface CoinGeckoPrice {
  usd:                      number
  usd_24h_change:           number
  usd_24h_vol:              number
  usd_market_cap:           number
}

const COINGECKO_IDS: Record<string, string> = {
  MNT:  'mantle',
  ETH:  'ethereum',
  USDC: 'usd-coin',
  USDT: 'tether',
  WBTC: 'wrapped-bitcoin',
  WETH: 'weth',
}

async function fetchLivePrice(symbol: string): Promise<CoinGeckoPrice | null> {
  const id = COINGECKO_IDS[symbol.toUpperCase()]
  if (!id) return null

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return null
    const data = await res.json() as Record<string, CoinGeckoPrice>
    return data[id] ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { policy, portfolio_value = 0, current_drawdown = 0 } = await req.json() as {
      policy:            Record<string, unknown>
      portfolio_value?:  number
      current_drawdown?: number
    }

    const asset = (policy.asset as string | undefined) ?? 'MNT'

    // Fetch real live price from CoinGecko
    const livePrice = await fetchLivePrice(asset)

    const priceDisplay    = livePrice ? `$${livePrice.usd.toLocaleString()}` : 'unknown'
    const changeDisplay   = livePrice ? `${livePrice.usd_24h_change?.toFixed(2) ?? 0}%` : 'unknown'
    const volumeDisplay   = livePrice ? `$${(livePrice.usd_24h_vol ?? 0).toLocaleString()}` : 'unknown'
    const marketCapDisplay = livePrice ? `$${(livePrice.usd_market_cap ?? 0).toLocaleString()}` : 'unknown'

    const userMsg = `
Mandate policy:
${JSON.stringify(policy, null, 2)}

Live market data (from CoinGecko, just fetched):
- Asset: ${asset}
- Current price: ${priceDisplay}
- 24h price change: ${changeDisplay}
- 24h trading volume: ${volumeDisplay}
- Market cap: ${marketCapDisplay}
- Portfolio value: $${portfolio_value.toLocaleString()}
- Current drawdown: ${current_drawdown}%

Based on the live data above, should I execute a trade right now?`

    const raw = await chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: userMsg },
    ], { temperature: 0.1 })

    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

    let decision: Record<string, unknown>
    try {
      decision = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 502 })
    }

    // Attach the live price data used for the decision
    return NextResponse.json({
      data: {
        ...decision,
        live_price:    livePrice?.usd ?? null,
        price_change:  livePrice?.usd_24h_change ?? null,
        asset,
      },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
