import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { chat } from '@/lib/openrouter'
import { getSpotTicker, BYBIT_SYMBOLS } from '@/lib/bybit'
import { z } from 'zod'

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

const DecisionSchema = z.object({
  action:     z.enum(['buy', 'sell', 'hold']),
  confidence: z.number().min(0).max(100),
  reasoning:  z.string().max(500),
  amount_pct: z.number().min(0).max(100),
  urgency:    z.enum(['low', 'medium', 'high']),
})

export async function POST(req: NextRequest) {
  // Auth guard — consumes OpenRouter credits; must be authenticated
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as {
      policy?:            unknown
      portfolio_value?:  number
      current_drawdown?: number
    }

    if (!body.policy || typeof body.policy !== 'object' || Array.isArray(body.policy)) {
      return NextResponse.json({ error: 'Invalid policy object' }, { status: 400 })
    }

    const policy           = body.policy as Record<string, unknown>
    const portfolio_value  = typeof body.portfolio_value  === 'number' ? body.portfolio_value  : 0
    const current_drawdown = typeof body.current_drawdown === 'number' ? body.current_drawdown : 0

    const asset = (typeof policy.asset === 'string' ? policy.asset : 'MNT').slice(0, 10).toUpperCase()
    const bybitSymbol = BYBIT_SYMBOLS[asset]
    const ticker = bybitSymbol ? await getSpotTicker(bybitSymbol) : null

    const priceDisplay  = ticker ? `$${ticker.lastPrice.toLocaleString()}`     : 'unknown'
    const changeDisplay = ticker ? `${ticker.change24hPct.toFixed(2)}%`        : 'unknown'
    const volumeDisplay = ticker ? `$${ticker.turnover24h.toLocaleString()}`   : 'unknown'

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

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error('[decide] Claude returned invalid JSON')
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 })
    }

    const result = DecisionSchema.safeParse(parsed)
    if (!result.success) {
      console.error('[decide] AI response failed schema validation:', result.error.flatten())
      return NextResponse.json({ error: 'AI response did not match expected schema' }, { status: 502 })
    }

    return NextResponse.json({
      data: {
        ...result.data,
        live_price:   ticker?.lastPrice   ?? null,
        price_change: ticker?.change24hPct ?? null,
        asset,
        source: 'bybit',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
