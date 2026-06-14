import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([])

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !data) return NextResponse.json([])

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
    return NextResponse.json([])
  }
}
