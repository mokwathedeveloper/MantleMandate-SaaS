import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/openrouter'

const SYSTEM = `You are a helpful support agent for MantleMandate — an AI-powered DeFi mandate execution platform built on Mantle Network.

You help users with:
- Creating and managing AI trading mandates (plain-English strategy → on-chain policy)
- Deploying and monitoring AI agents that execute trades automatically
- Understanding risk parameters (drawdown, stop-loss, position sizing)
- Connecting wallets and protocols (Merchant Moe, Agni Finance, Fluxion)
- Reading on-chain audit trails and policy hashes
- Billing and plan questions (Operator $29/mo, Strategist $99/mo, Institution $299/mo)
- Troubleshooting common issues (agent paused, wallet connection, API errors)

Keep responses concise and practical. If the user has a technical issue, ask for relevant details (agent ID, error message, mandate name).
Always be friendly, professional, and solution-focused.
Never make up specific transaction hashes or contract addresses.`

const MAX_MESSAGES    = 20
const MAX_MSG_LENGTH  = 500

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { messages?: unknown }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    if (body.messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: `Conversation too long (max ${MAX_MESSAGES} messages)` }, { status: 400 })
    }

    // Validate and sanitise each message
    const messages: { role: 'user' | 'assistant'; content: string }[] = []
    for (const m of body.messages) {
      if (typeof m !== 'object' || m === null) continue
      const msg = m as Record<string, unknown>
      if (msg.role !== 'user' && msg.role !== 'assistant') continue
      if (typeof msg.content !== 'string') continue
      messages.push({
        role:    msg.role as 'user' | 'assistant',
        content: msg.content.slice(0, MAX_MSG_LENGTH),
      })
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 })
    }

    const reply = await chat(
      [{ role: 'system', content: SYSTEM }, ...messages],
      { temperature: 0.7 }
    )

    return NextResponse.json({ reply })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
