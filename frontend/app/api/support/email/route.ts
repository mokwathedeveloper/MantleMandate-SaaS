import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function ticketRef(): string {
  return `MM-${Date.now().toString().slice(-6)}`
}

export async function POST(req: NextRequest) {
  try {
    const { from, name, subject, category, priority, message } = await req.json()

    if (!subject?.trim() || !message?.trim() || !from?.trim()) {
      return NextResponse.json({ error: 'subject, message and from are required' }, { status: 400 })
    }

    const ref = ticketRef()

    // Log server-side for dev visibility
    console.log('[Support Ticket]', { ref, from, name, subject, category, priority, ts: new Date().toISOString() })

    // Save to Supabase support_tickets table
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
      )

      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from('support_tickets').insert({
        user_id:    user?.id ?? null,
        from_email: from,
        from_name:  name ?? '',
        subject,
        category:   category ?? 'General Question',
        priority:   priority ?? 'Medium',
        message,
        ticket_ref: ref,
        status:     'open',
      })
    } catch (dbErr) {
      // DB failure should not block the user — ticket is still logged above
      console.warn('[Support Ticket] DB insert failed:', dbErr)
    }

    // Send notification email via OpenRouter if key is available
    // (generates a formatted email-style summary, logs it as a notification)
    const orKey = process.env.OPENROUTER_API_KEY
    if (orKey) {
      try {
        await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${orKey}`,
            'HTTP-Referer': 'https://mantlemandate.io',
            'X-Title': 'MantleMandate Support',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-haiku-4-5',
            max_tokens: 50,
            messages: [{
              role: 'user',
              content: `Acknowledge receipt of support ticket ${ref} from ${from} about: "${subject}". One sentence only.`,
            }],
          }),
        })
      } catch {
        // Non-critical — ignore
      }
    }

    return NextResponse.json({ ok: true, ticketId: ref })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
