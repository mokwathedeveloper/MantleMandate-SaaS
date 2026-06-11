import { chat } from '@/lib/openrouter'
import { getSpotTicker, getKlines, BYBIT_SYMBOLS } from '@/lib/bybit'
import { calculateRSI } from '@/lib/indicators'
import { z } from 'zod'

const RSI_PERIOD = 14
const RSI_INTERVAL = '60' // 1h candles

const SYSTEM = `You are an AI trading agent running on MantleMandate on Mantle Network.

You are given a trading mandate policy, a computed technical indicator (RSI), and live market data. Decide whether to execute a trade.

Respond ONLY with valid JSON:
{
  "action": "buy" | "sell" | "hold",
  "confidence": 0-100,
  "reasoning": "one sentence explanation",
  "amount_pct": 0-100,
  "urgency": "low" | "medium" | "high"
}

Rules:
- Weigh the computed RSI value against the mandate's trigger condition (e.g. "RSI < 30") — do not override a clear RSI signal without strong justification in "reasoning"
- Only recommend "buy" or "sell" when confidence >= 65
- amount_pct is % of available capital (max capped by mandate riskPerTrade)
- Be conservative — protecting capital is priority #1
- Consider the mandate constraints strictly`

export const DecisionSchema = z.object({
  action:     z.enum(['buy', 'sell', 'hold']),
  confidence: z.number().min(0).max(100),
  reasoning:  z.string().max(500),
  amount_pct: z.number().min(0).max(100),
  urgency:    z.enum(['low', 'medium', 'high']),
})

export interface TradeDecision extends z.infer<typeof DecisionSchema> {
  live_price:   number | null
  price_change: number | null
  rsi:          number | null
  asset:        string
  source:       'bybit'
}

/**
 * Fetch a live Bybit ticker for the mandate's asset and ask Claude whether to
 * buy/sell/hold given the mandate policy and current portfolio state.
 * Shared by /api/agents/decide and the agent-tick execution pipeline so both
 * make decisions the same way against the same live data.
 */
export async function getTradeDecision(
  policy: Record<string, unknown>,
  portfolioValue: number,
  currentDrawdown: number,
): Promise<{ data: TradeDecision } | { error: string; status: number }> {
  const asset = (typeof policy.asset === 'string' ? policy.asset : 'MNT').slice(0, 10).toUpperCase()
  const bybitSymbol = BYBIT_SYMBOLS[asset]
  const ticker = bybitSymbol ? await getSpotTicker(bybitSymbol) : null
  const klines = bybitSymbol ? await getKlines(bybitSymbol, RSI_INTERVAL, RSI_PERIOD * 2) : []
  const rsi = klines.length ? calculateRSI(klines.map(k => k.close), RSI_PERIOD) : null

  const priceDisplay  = ticker ? `$${ticker.lastPrice.toLocaleString()}`     : 'unknown'
  const changeDisplay = ticker ? `${ticker.change24hPct.toFixed(2)}%`        : 'unknown'
  const volumeDisplay = ticker ? `$${ticker.turnover24h.toLocaleString()}`   : 'unknown'
  const rsiDisplay    = rsi != null ? rsi.toFixed(2) : 'unavailable'

  const userMsg = `
Mandate policy:
${JSON.stringify(policy, null, 2)}

Live market data (Bybit spot, just fetched):
- Asset: ${asset}
- Current price: ${priceDisplay}
- 24h price change: ${changeDisplay}
- 24h USD volume: ${volumeDisplay}
- RSI(${RSI_PERIOD}, 1h candles): ${rsiDisplay}
- Portfolio value: $${portfolioValue.toLocaleString()}
- Current drawdown: ${currentDrawdown}%

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
    console.error('[agentDecision] Claude returned invalid JSON')
    return { error: 'AI returned invalid JSON', status: 502 }
  }

  const result = DecisionSchema.safeParse(parsed)
  if (!result.success) {
    console.error('[agentDecision] AI response failed schema validation:', result.error.flatten())
    return { error: 'AI response did not match expected schema', status: 502 }
  }

  return {
    data: {
      ...result.data,
      live_price:   ticker?.lastPrice    ?? null,
      price_change: ticker?.change24hPct ?? null,
      rsi,
      asset,
      source: 'bybit',
    },
  }
}
