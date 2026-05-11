import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/openrouter'
import { getSpotTicker, BYBIT_SYMBOLS } from '@/lib/bybit'

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

export async function POST(req: NextRequest) {
  try {
    const { policy, portfolio_value = 0, current_drawdown = 0 } = await req.json() as {
      policy:            Record<string, unknown>
      portfolio_value?:  number
      current_drawdown?: number
    }

    const asset = (policy.asset as string | undefined) ?? 'MNT'
    const bybitSymbol = BYBIT_SYMBOLS[asset.toUpperCase()]

    const ticker = bybitSymbol ? await getSpotTicker(bybitSymbol) : null

    const priceDisplay     = ticker ? `$${ticker.lastPrice.toLocaleString()}` : 'unknown'
    const changeDisplay    = ticker ? `${ticker.change24hPct.toFixed(2)}%` : 'unknown'
    const volumeDisplay    = ticker ? `$${ticker.turnover24h.toLocaleString()}` : 'unknown'

    const userMsg = `
Mandate policy:
${JSON.stringify(policy, null, 2)}

Live market data (Bybit spot, just fetched):
- Asset: ${asset}
- Current price: ${priceDisplay}
- 24h price change: ${changeDisplay}
- 24h USD volume: ${volumeDisplay}
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

    return NextResponse.json({
      data: {
        ...decision,
        live_price:    ticker?.lastPrice ?? null,
        price_change:  ticker?.change24hPct ?? null,
        asset,
        source: 'bybit',
      },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
