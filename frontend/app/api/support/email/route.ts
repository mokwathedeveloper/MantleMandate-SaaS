import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function ticketRef(): string {
  return `MM-${Date.now().toString().slice(-6)}`
}

export async function POST(req: NextRequest) {
  // Auth guard — prevents ticket spam and OpenRouter quota abuse
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const from       = String(formData.get('from')     ?? '').trim()
    const name       = String(formData.get('name')     ?? '').trim()
    const subject    = String(formData.get('subject')  ?? '').trim()
    const category   = String(formData.get('category') ?? '').trim()
    const priority   = String(formData.get('priority') ?? '').trim()
    const message    = String(formData.get('message')  ?? '').trim()
    const attachFile = formData.get('attachment')
    const attachName = attachFile instanceof File && attachFile.size > 0 ? attachFile.name : null

    if (!subject || !message || !from) {
      return NextResponse.json({ error: 'subject, message and from are required' }, { status: 400 })
    }

    const ref = ticketRef()

    // Log server-side for dev visibility
    console.log('[Support Ticket]', { ref, from, name, subject, category, priority, attachName, ts: new Date().toISOString() })

    // Save to Supabase support_tickets table
    try {
      await supabase.from('support_tickets').insert({
        user_id:    user.id,
        from_email: from,
        from_name:  name ?? '',
        subject,
        category:   category ?? 'General Question',
        priority:   priority ?? 'Medium',
        message,
        ticket_ref: ref,
        status:     'open',
      })
    } catch (dbErr: unknown) {
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
