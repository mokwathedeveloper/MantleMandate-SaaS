'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { usePrices } from '@/hooks/usePrices'
import { cn } from '@/lib/utils'

// Brand colours sourced from each project's official design guidelines
const TOKEN_META: Record<string, { bg: string; fg: string; label: string }> = {
  MNT:  { bg: '#0066FF', fg: '#FFFFFF', label: 'M'  },
  ETH:  { bg: '#627EEA', fg: '#FFFFFF', label: 'Ξ'  },
  WBTC: { bg: '#F7931A', fg: '#FFFFFF', label: '₿'  },
  USDC: { bg: '#2775CA', fg: '#FFFFFF', label: '$'  },
  USDT: { bg: '#26A17B', fg: '#FFFFFF', label: '$'  },
  BNB:  { bg: '#F3BA2F', fg: '#1A1A1A', label: 'B'  },
  SOL:  { bg: '#9945FF', fg: '#FFFFFF', label: 'S'  },
  WMNT: { bg: '#0044CC', fg: '#FFFFFF', label: 'M'  },
  WETH: { bg: '#8A9FF7', fg: '#FFFFFF', label: 'Ξ'  },
}

function TokenIcon({ symbol }: { symbol: string }) {
  const meta = TOKEN_META[symbol] ?? { bg: '#8B949E', fg: '#FFFFFF', label: symbol.slice(0, 1) }
  return (
    <span
      className="inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold shrink-0 select-none"
      style={{ background: meta.bg, color: meta.fg }}
      aria-hidden="true"
    >
      {meta.label}
    </span>
  )
}

export function MarketTicker() {
  const { data: prices, isLoading } = usePrices()

  if (isLoading || !prices?.length) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {['MNT', 'ETH', 'WBTC', 'USDC'].map(s => (
          <div key={s} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 shrink-0">
            <TokenIcon symbol={s} />
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
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 shrink-0"
          >
            <TokenIcon symbol={token.symbol} />
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
