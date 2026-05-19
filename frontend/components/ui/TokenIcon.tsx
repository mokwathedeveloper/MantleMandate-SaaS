// Brand colours from each project's official design guidelines
const TOKEN_META: Record<string, { bg: string; fg: string; label: string }> = {
  MNT:  { bg: '#0066FF', fg: '#FFFFFF', label: 'M' },
  WMNT: { bg: '#0044CC', fg: '#FFFFFF', label: 'M' },
  ETH:  { bg: '#627EEA', fg: '#FFFFFF', label: 'Ξ' },
  WETH: { bg: '#8A9FF7', fg: '#FFFFFF', label: 'Ξ' },
  WBTC: { bg: '#F7931A', fg: '#FFFFFF', label: '₿' },
  BTC:  { bg: '#F7931A', fg: '#FFFFFF', label: '₿' },
  USDC: { bg: '#2775CA', fg: '#FFFFFF', label: '$' },
  USDT: { bg: '#26A17B', fg: '#FFFFFF', label: '$' },
  DAI:  { bg: '#F5AC37', fg: '#1A1A1A', label: '$' },
  BNB:  { bg: '#F3BA2F', fg: '#1A1A1A', label: 'B' },
  SOL:  { bg: '#9945FF', fg: '#FFFFFF', label: 'S' },
  MATIC:{ bg: '#8247E5', fg: '#FFFFFF', label: 'M' },
}

interface TokenIconProps {
  symbol: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE: Record<NonNullable<TokenIconProps['size']>, string> = {
  sm: 'h-4 w-4 text-[9px]',
  md: 'h-5 w-5 text-[10px]',
  lg: 'h-6 w-6 text-[11px]',
}

export function TokenIcon({ symbol, size = 'md' }: TokenIconProps) {
  const base = symbol.toUpperCase()
  const meta = TOKEN_META[base] ?? { bg: '#8B949E', fg: '#FFFFFF', label: base.slice(0, 1) }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold shrink-0 select-none ${SIZE[size]}`}
      style={{ background: meta.bg, color: meta.fg }}
      aria-hidden="true"
    >
      {meta.label}
    </span>
  )
}
