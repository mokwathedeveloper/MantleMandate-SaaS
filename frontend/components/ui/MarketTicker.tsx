'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { usePrices } from '@/hooks/usePrices'
import { cn } from '@/lib/utils'

export function MarketTicker() {
  const { data: prices, isLoading } = usePrices()

  if (isLoading || !prices?.length) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {['MNT', 'ETH', 'WBTC', 'USDC'].map(s => (
          <div key={s} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 shrink-0">
            <span className="text-[12px] font-bold text-text-secondary">{s}</span>
            <span className="h-3 w-16 rounded bg-border animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
      {prices.map(token => {
        const up = token.change24hPct >= 0
        return (
          <div
            key={token.symbol}
            className="flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-1.5 shrink-0"
          >
            <span className="text-[12px] font-bold text-text-primary">{token.symbol}</span>
            <span className="text-[13px] font-mono text-text-primary">
              ${token.price < 1
                ? token.price.toFixed(4)
                : token.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
            <span className={cn(
              'flex items-center gap-0.5 text-[11px] font-semibold',
              up ? 'text-success' : 'text-error',
            )}>
              {up
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              {Math.abs(token.change24hPct).toFixed(2)}%
            </span>
          </div>
        )
      })}
      <span className="text-[10px] text-text-disabled self-center shrink-0 pl-1">
        via CoinGecko · live
      </span>
    </div>
  )
}
