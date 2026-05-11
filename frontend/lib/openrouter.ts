const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const MODEL = 'anthropic/claude-sonnet-4-5'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chat(messages: Message[], opts?: { temperature?: number }): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mantlemandate.app',
      'X-Title': 'MantleMandate',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts?.temperature ?? 0.2,
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0].message.content
}
