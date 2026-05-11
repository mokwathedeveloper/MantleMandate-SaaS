import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const FALLBACK = [
  { id: '1', name: 'Agent ETH Conservative · Apr 2026',  type: 'PERFORMANCE', dateFrom: '2026-04-01', dateTo: '2026-04-30', totalPnl: 24580439.21, roi: 72.45,  createdAt: '2026-05-01', drawdown: -1240.5,  sharpeRatio: 2.1 },
  { id: '2', name: 'LTC/USD Mandate · Apr 2026',         type: 'AGENT',       dateFrom: '2026-04-01', dateTo: '2026-04-30', totalPnl: -3245.20,    roi: -5.12,  createdAt: '2026-05-01', drawdown: -3245.2,  sharpeRatio: 0.8 },
  { id: '3', name: 'Portfolio Q1 2026',                   type: 'PORTFOLIO',   dateFrom: '2026-01-01', dateTo: '2026-03-31', totalPnl: 8420.50,     roi: 18.34,  createdAt: '2026-04-01', drawdown: -920.0,   sharpeRatio: 1.6 },
  { id: '4', name: 'BTC Risk Analysis · Mar 2026',        type: 'RISK',        dateFrom: '2026-03-01', dateTo: '2026-03-31', totalPnl: 1280.00,     roi: 4.22,   createdAt: '2026-04-01', drawdown: -440.0,   sharpeRatio: 1.2 },
  { id: '5', name: 'Agent ETH Conservative · Mar 2026',   type: 'PERFORMANCE', dateFrom: '2026-03-01', dateTo: '2026-03-31', totalPnl: 6750.30,     roi: 24.10,  createdAt: '2026-04-01', drawdown: -820.0,   sharpeRatio: 1.9 },
  { id: '6', name: 'ETH Momentum Strategy · Feb 2026',    type: 'AGENT',       dateFrom: '2026-02-01', dateTo: '2026-02-28', totalPnl: -1840.00,    roi: -8.90,  createdAt: '2026-03-01', drawdown: -2100.0,  sharpeRatio: 0.6 },
  { id: '7', name: 'Full Portfolio Audit · Q4 2025',      type: 'PORTFOLIO',   dateFrom: '2025-10-01', dateTo: '2025-12-31', totalPnl: 12340.00,    roi: 45.80,  createdAt: '2026-01-02', drawdown: -1500.0,  sharpeRatio: 2.4 },
]

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return NextResponse.json(FALLBACK)
    }

    // map snake_case Supabase columns to camelCase
    const mapped = data.map((r: Record<string, unknown>) => ({
      id:          r.id,
      name:        r.name,
      type:        r.type,
      dateFrom:    r.date_from,
      dateTo:      r.date_to,
      totalPnl:    r.total_pnl,
      roi:         r.roi,
      createdAt:   r.created_at,
      drawdown:    r.drawdown,
      sharpeRatio: r.sharpe_ratio,
    }))

    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
