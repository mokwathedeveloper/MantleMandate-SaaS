'use client'

import { useMutation } from '@tanstack/react-query'
import type { QuoteResult } from '@/app/api/quotes/route'

export type { QuoteResult }

export function useQuote() {
  return useMutation({
    mutationFn: async (params: { token_in: string; token_out: string; amount_usd: number }) => {
      const res = await fetch('/api/quotes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(params),
      })
      const json = await res.json() as { data?: QuoteResult; error?: string }
      if (!res.ok || json.error) throw new Error(json.error ?? 'Quote failed')
      return json.data!
    },
  })
}
