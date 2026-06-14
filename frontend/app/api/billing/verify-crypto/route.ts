import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { formatEther } from 'viem'
import { publicClient, TREASURY_ADDRESS } from '@/lib/contracts'

export const runtime = 'nodejs'

const PURCHASABLE_PLANS = ['operator', 'strategist'] as const
const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/

export async function POST(req: NextRequest) {
  try {
    if (!TREASURY_ADDRESS) {
      return NextResponse.json({ error: 'Crypto payments are not configured (missing NEXT_PUBLIC_TREASURY_ADDRESS)' }, { status: 500 })
    }

    const { txHash, plan } = await req.json()
    if (typeof txHash !== 'string' || !TX_HASH_RE.test(txHash)) {
      return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 })
    }
    if (!PURCHASABLE_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: existing } = await supabase
      .from('invoices')
      .select('id')
      .eq('tx_hash', txHash)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'This transaction has already been used for an invoice' }, { status: 409 })
    }

    const hash = txHash as `0x${string}`
    const receipt = await publicClient.getTransactionReceipt({ hash }).catch(() => null)
    if (!receipt) {
      return NextResponse.json({ error: 'Transaction not found on Mantle Sepolia. It may still be pending.' }, { status: 404 })
    }
    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'Transaction failed on-chain' }, { status: 400 })
    }

    const tx = await publicClient.getTransaction({ hash })
    if (!tx.to || tx.to.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      return NextResponse.json({ error: 'Transaction was not sent to the treasury address' }, { status: 400 })
    }
    if (tx.value <= 0n) {
      return NextResponse.json({ error: 'Transaction has zero value' }, { status: 400 })
    }

    const amount = Number(formatEther(tx.value))

    const { error: insertError } = await supabase.from('invoices').insert({
      user_id:        user.id,
      plan,
      amount,
      currency:       'MNT',
      payment_method: 'crypto',
      status:         'paid',
      tx_hash:        txHash,
    })
    if (insertError) {
      return NextResponse.json({ error: 'Payment verified but failed to record invoice' }, { status: 500 })
    }

    await supabase.from('profiles').update({ plan }).eq('id', user.id)

    return NextResponse.json({ ok: true, amount, currency: 'MNT', plan })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
