import { createHmac } from 'crypto'

const BASE = 'https://api.bybit.com'
const API_KEY    = process.env.BYBIT_API_KEY    || ''
const API_SECRET = process.env.BYBIT_API_SECRET || ''
const RECV_WINDOW = '5000'

// Maps internal symbols → Bybit spot pairs
export const BYBIT_SYMBOLS: Record<string, string> = {
  BTC:  'BTCUSDT',
  ETH:  'ETHUSDT',
  MNT:  'MNTUSDT',
  SOL:  'SOLUSDT',
  USDC: 'USDCUSDT',
  WBTC: 'BTCUSDT',  // proxy
  WETH: 'ETHUSDT',  // proxy
}

export interface BybitTicker {
  symbol:       string
  lastPrice:    number
  change24hPct: number
  volume24h:    number  // base currency
  turnover24h:  number  // USD volume
}

export interface BybitKline {
  openTime: number
  open:     number
  high:     number
  low:      number
  close:    number
  volume:   number
}

export interface BybitBalance {
  coin:             string
  walletBalance:    number
  availableBalance: number
  unrealisedPnl:    number
  equity:           number
}

function buildAuthHeaders(queryString: string) {
  const ts = Date.now().toString()
  const payload = `${ts}${API_KEY}${RECV_WINDOW}${queryString}`
  const sig = createHmac('sha256', API_SECRET).update(payload).digest('hex')
  return {
    'X-BAPI-API-KEY':      API_KEY,
    'X-BAPI-TIMESTAMP':    ts,
    'X-BAPI-SIGN':         sig,
    'X-BAPI-RECV-WINDOW':  RECV_WINDOW,
  }
}

export async function getSpotTicker(bybitSymbol: string): Promise<BybitTicker | null> {
  try {
    const res = await fetch(
      `${BASE}/v5/market/tickers?category=spot&symbol=${bybitSymbol}`,
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return null
    const json = await res.json()
    const item = json?.result?.list?.[0]
    if (!item) return null
    return {
      symbol:       item.symbol,
      lastPrice:    parseFloat(item.lastPrice),
      change24hPct: parseFloat(item.price24hPcnt) * 100,
      volume24h:    parseFloat(item.volume24h),
      turnover24h:  parseFloat(item.turnover24h),
    }
  } catch {
    return null
  }
}

export async function getSpotTickers(bybitSymbols: string[]): Promise<BybitTicker[]> {
  const settled = await Promise.allSettled(bybitSymbols.map(getSpotTicker))
  return settled
    .filter((r): r is PromiseFulfilledResult<BybitTicker> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)
}

export async function getKlines(
  bybitSymbol: string,
  interval: '1' | '5' | '15' | '60' | 'D' | 'W' = 'D',
  limit = 30,
): Promise<BybitKline[]> {
  try {
    const res = await fetch(
      `${BASE}/v5/market/kline?category=spot&symbol=${bybitSymbol}&interval=${interval}&limit=${limit}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    const list: string[][] = json?.result?.list ?? []
    return list.reverse().map(k => ({
      openTime: parseInt(k[0]),
      open:     parseFloat(k[1]),
      high:     parseFloat(k[2]),
      low:      parseFloat(k[3]),
      close:    parseFloat(k[4]),
      volume:   parseFloat(k[5]),
    }))
  } catch {
    return []
  }
}

export async function getWalletBalance(): Promise<BybitBalance[]> {
  if (!API_KEY || !API_SECRET) return []
  const qs = 'accountType=UNIFIED'
  try {
    const res = await fetch(`${BASE}/v5/account/wallet-balance?${qs}`, {
      headers: buildAuthHeaders(qs),
    })
    if (!res.ok) return []
    const json = await res.json()
    const coins: Record<string, string>[] = json?.result?.list?.[0]?.coin ?? []
    return coins
      .filter(c => parseFloat(c.walletBalance) > 0)
      .map(c => ({
        coin:             c.coin,
        walletBalance:    parseFloat(c.walletBalance),
        availableBalance: parseFloat(c.availableToWithdraw ?? '0'),
        unrealisedPnl:    parseFloat(c.unrealisedPnl ?? '0'),
        equity:           parseFloat(c.equity ?? '0'),
      }))
  } catch {
    return []
  }
}
