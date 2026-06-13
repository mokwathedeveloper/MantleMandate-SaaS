import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ZERO_SNAPSHOT = {
  totalValue:  0,
  totalPnl:    0,
  totalRoi:    0,
  dayPnl:      0,
  dayPnlPct:   0,
  maxDrawdown: 0,
  sharpeRatio: null as number | null,
  winRate:     0,
}

function computeSharpeRatio(history: { value: number; pnl: number }[]): number | null {
  if (history.length < 2) return null
  const returns = history
    .filter(h => h.value > 0)
    .map(h => h.pnl / h.value)
  if (returns.length < 2) return null

  const mean     = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length
  const stdDev   = Math.sqrt(variance)
  if (stdDev === 0) return null

  return (mean / stdDev) * Math.sqrt(365)
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json(ZERO_SNAPSHOT)

    const [agents, trades, history] = await Promise.all([
      supabase.from('agents').select('status, capital_cap, total_pnl, total_roi, drawdown_current').eq('user_id', user.id),
      supabase.from('trades').select('pnl, status').eq('user_id', user.id),
      supabase.from('portfolio_history').select('value, pnl').eq('user_id', user.id).order('date', { ascending: true }),
    ])

    const agentRows = (agents.data ?? []) as { status: string; capital_cap?: number | null; total_pnl?: number | null; total_roi?: number | null; drawdown_current?: number | null }[]
    const totalValue   = agentRows.reduce((s, a) => s + (a.capital_cap ?? 0), 0)
    const totalPnl     = agentRows.reduce((s, a) => s + (a.total_pnl   ?? 0), 0)
    const maxDrawdown  = agentRows.reduce((s, a) => Math.max(s, a.drawdown_current ?? 0), 0)
    const allTrades    = (trades.data ?? []) as { status: string; pnl?: number | null }[]
    const wins         = allTrades.filter(t => t.status === 'success' && (t.pnl ?? 0) > 0).length
    const winRate      = allTrades.length > 0 ? (wins / allTrades.length) * 100 : 0
    const totalRoi     = totalValue > 0 ? (totalPnl / totalValue) * 100 : 0
    const dayPnl       = totalPnl
    const dayPnlPct    = totalValue > 0 ? (dayPnl / totalValue) * 100 : 0
    const sharpeRatio  = computeSharpeRatio((history.data ?? []) as { value: number; pnl: number }[])

    return NextResponse.json({
      totalValue, totalPnl, totalRoi, dayPnl, dayPnlPct,
      maxDrawdown, sharpeRatio, winRate,
    })
  } catch {
    return NextResponse.json(ZERO_SNAPSHOT)
  }
}
