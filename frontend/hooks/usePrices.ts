'use client'

import { useQuery } from '@tanstack/react-query'
import type { TokenPrice } from '@/app/api/prices/route'

export type { TokenPrice }

export function usePrices() {
  return useQuery<TokenPrice[]>({
    queryKey: ['prices'],
    queryFn: async () => {
      const res = await fetch('/api/prices')
      if (!res.ok) throw new Error('Failed to fetch prices')
      const json = await res.json() as { data: TokenPrice[] }
      return json.data
    },
    refetchInterval: 30_000,
    staleTime:       25_000,
  })
}

export function useTokenPrice(symbol: string) {
  const { data, ...rest } = usePrices()
  const token = data?.find(t => t.symbol.toUpperCase() === symbol.toUpperCase()) ?? null
  return { token, ...rest }
}

export function usePriceMap() {
  const { data, ...rest } = usePrices()
  const map = Object.fromEntries((data ?? []).map(t => [t.symbol, t]))
  return { map, ...rest }
}
