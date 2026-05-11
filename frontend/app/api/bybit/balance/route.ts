import { NextResponse } from 'next/server'
import { getWalletBalance } from '@/lib/bybit'

export async function GET() {
  try {
    const balances = await getWalletBalance()
    return NextResponse.json({ data: balances })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
