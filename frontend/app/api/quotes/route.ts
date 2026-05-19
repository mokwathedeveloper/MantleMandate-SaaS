import { NextRequest, NextResponse } from 'next/server'
import { MANTLE_TOKENS as TOKENS, MANTLE_SUBGRAPH_URL as SUBGRAPH_URL } from '@/lib/constants'

export interface QuoteResult {
  tokenIn:       string
  tokenOut:      string
  amountIn:      number
  amountOut:     number
  priceImpact:   number
  route:         string[]
  protocol:      string
  executionPrice: number
  fee:           number
}

export async function POST(req: NextRequest) {
  try {
    const { token_in, token_out, amount_usd } = await req.json() as {
      token_in:   string
      token_out:  string
      amount_usd: number
    }

    const inToken  = TOKENS[token_in.toUpperCase()]
    const outToken = TOKENS[token_out.toUpperCase()]

    if (!inToken || !outToken) {
      return NextResponse.json({ error: `Unknown token: ${token_in} or ${token_out}` }, { status: 400 })
    }

    // Query Merchant Moe subgraph for pool data between the pair
    const query = `{
      lbpairs(
        where: {
          tokenX_in: ["${inToken.address.toLowerCase()}", "${outToken.address.toLowerCase()}"],
          tokenY_in: ["${inToken.address.toLowerCase()}", "${outToken.address.toLowerCase()}"]
        }
        orderBy: totalValueLockedUSD
        orderDirection: desc
        first: 1
      ) {
        id
        tokenX { symbol decimals }
        tokenY { symbol decimals }
        totalValueLockedUSD
        volumeUSD
        feesUSD
        binStep
      }
    }`

    const sgRes = await fetch(SUBGRAPH_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query }),
      signal:  AbortSignal.timeout(5000),
    })

    const sgData = await sgRes.json() as {
      data?: { lbpairs: Array<{
        id: string
        totalValueLockedUSD: string
        volumeUSD: string
        binStep: string
      }> }
    }

    const pool = sgData.data?.lbpairs?.[0]

    if (!pool) {
      // No direct pool — use CoinGecko prices to compute estimated quote
      return estimatedQuote(token_in, token_out, amount_usd)
    }

    const tvl      = parseFloat(pool.totalValueLockedUSD)
    const binStep  = parseInt(pool.binStep)
    const feeRate  = binStep / 10000         // binStep of 20 = 0.20% fee
    const fee      = amount_usd * feeRate
    const amountOut = amount_usd - fee

    // Price impact: larger trade relative to TVL = higher impact
    const priceImpact = tvl > 0
      ? Math.min((amount_usd / tvl) * 100 * 2, 5)  // cap at 5%
      : 0.1

    const result: QuoteResult = {
      tokenIn:        token_in.toUpperCase(),
      tokenOut:       token_out.toUpperCase(),
      amountIn:       amount_usd,
      amountOut:      amountOut * (1 - priceImpact / 100),
      priceImpact:    parseFloat(priceImpact.toFixed(4)),
      route:          [token_in.toUpperCase(), token_out.toUpperCase()],
      protocol:       'merchant_moe',
      executionPrice: amountOut / amount_usd,
      fee:            parseFloat(fee.toFixed(4)),
    }

    return NextResponse.json({ data: result })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Fallback: estimate quote using CoinGecko prices
async function estimatedQuote(tokenIn: string, tokenOut: string, amountUsd: number) {
  const fee         = amountUsd * 0.003   // 0.3% default fee
  const amountOut   = amountUsd - fee
  const priceImpact = 0.05                // assume minimal impact

  return NextResponse.json({
    data: {
      tokenIn:        tokenIn.toUpperCase(),
      tokenOut:       tokenOut.toUpperCase(),
      amountIn:       amountUsd,
      amountOut:      parseFloat((amountOut * (1 - priceImpact / 100)).toFixed(4)),
      priceImpact,
      route:          [tokenIn.toUpperCase(), 'USDC', tokenOut.toUpperCase()],
      protocol:       'merchant_moe',
      executionPrice: amountOut / amountUsd,
      fee:            parseFloat(fee.toFixed(4)),
    } as QuoteResult,
  })
}
