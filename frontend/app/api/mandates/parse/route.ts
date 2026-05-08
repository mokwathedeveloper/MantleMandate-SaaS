import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/openrouter'
import { createHash } from 'crypto'

const SYSTEM = `You are a DeFi trading mandate parser for MantleMandate, an AI agent platform on Mantle Network.

Parse the user's plain-English trading mandate into a structured JSON policy. Extract:
- asset: the primary token to trade (e.g. "ETH", "MNT", "USDC")
- trigger: the condition that triggers a trade (e.g. "RSI < 30", "price drops 5%", "daily rebalance")
- riskPerTrade: percentage of capital per trade (default 5 if not specified)
- takeProfit: percentage gain to close position (null if not specified)
- stopLoss: percentage loss to close position (default 5 if not specified)
- schedule: how often to run ("continuous", "hourly", "daily", "weekly")
- venue: DEX to use ("merchant_moe", "agni", "fluxion", or null for best available)
- maxDrawdown: maximum portfolio drawdown before halting (default 15)
- maxPositions: max concurrent open positions (default 5)
- summary: one sentence plain-English summary of what this mandate does

Respond ONLY with valid JSON matching this schema exactly. No markdown, no explanation.`

export async function POST(req: NextRequest) {
  try {
    const { mandate_text } = await req.json() as { mandate_text: string }

    if (!mandate_text || mandate_text.trim().length < 5) {
      return NextResponse.json({ error: 'Mandate text too short' }, { status: 400 })
    }

    const raw = await chat([
      { role: 'system', content: SYSTEM },
      { role: 'user',   content: mandate_text },
    ])

    // Strip markdown code fences if Claude wraps output
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

    let parsed_policy: Record<string, unknown>
    try {
      parsed_policy = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 502 })
    }

    // Deterministic hash of the parsed policy for on-chain anchoring
    const policy_hash = '0x' + createHash('sha256')
      .update(JSON.stringify(parsed_policy))
      .digest('hex')

    return NextResponse.json({ data: { parsed_policy, policy_hash } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
