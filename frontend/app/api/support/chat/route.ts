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

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!messages?.length) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
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
