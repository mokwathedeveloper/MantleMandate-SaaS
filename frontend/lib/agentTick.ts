import type { SupabaseClient } from '@supabase/supabase-js'
import { keccak256, toHex, parseEventLogs } from 'viem'
import {
  publicClient,
  MANDATE_POLICY_ADDRESS,
  AGENT_EXECUTOR_ADDRESS,
  MOCK_USD_ADDRESS,
  MOCK_WETH_ADDRESS,
  SWAP_POOL_ADDRESS,
  MANDATE_POLICY_ABI,
  AGENT_EXECUTOR_ABI,
  SWAP_POOL_ABI,
  assetToBytes32,
} from '@/lib/contracts'
import { getServiceWalletClient, getServiceWalletAddress } from '@/lib/serverWallet'
import { getTradeDecision, type TradeDecision } from '@/lib/agentDecision'

interface AgentRow {
  id:                string
  user_id:           string
  mandate_id:        string
  capital_cap:       number | null
  total_pnl:         number
  total_roi:         number
  total_volume:      number
  drawdown_current:  number
  onchain_agent_id:  number | null
  mandate: {
    policy_hash:    string | null
    parsed_policy:  Record<string, unknown> | null
  } | null
}

export interface TickResult {
  decision:       TradeDecision
  executed:       boolean
  txHash?:        `0x${string}`
  swapTxHash?:    `0x${string}`
  onchainAgentId?: string
  pnl?:           number
  reason?:        string
}

const MOCK_USD_DECIMALS  = 6
const MOCK_WETH_DECIMALS = 18
const SWAPPABLE_ASSETS = new Set(['ETH', 'WETH'])
const SWAP_SLIPPAGE_BPS = 100n // 1% tolerance

/**
 * Execute a real on-chain swap against the project's mUSD/mWETH MockSwapPool
 * on Mantle Sepolia (Merchant Moe / Agni Finance have no testnet deployment).
 * Returns the swap's tx hash on success, or null if the asset isn't swappable
 * or the swap fails — in which case the tick falls back to a record-only
 * executeOrder call.
 */
async function trySwap(
  wallet: ReturnType<typeof getServiceWalletClient>,
  account: ReturnType<typeof getServiceWalletAddress>,
  decision: TradeDecision,
  isBuy: boolean,
  amountUsd: number,
): Promise<`0x${string}` | null> {
  if (!SWAPPABLE_ASSETS.has(decision.asset) || decision.live_price == null) return null

  try {
    const tokenIn = isBuy ? MOCK_USD_ADDRESS : MOCK_WETH_ADDRESS
    const amountIn = isBuy
      ? BigInt(Math.round(amountUsd * 10 ** MOCK_USD_DECIMALS))
      : BigInt(Math.round((amountUsd / decision.live_price) * 10 ** MOCK_WETH_DECIMALS))
    if (amountIn <= 0n) return null

    const expectedOut = await publicClient.readContract({
      address: SWAP_POOL_ADDRESS,
      abi: SWAP_POOL_ABI,
      functionName: 'getAmountOut',
      args: [tokenIn, amountIn],
    })
    const minAmountOut = (expectedOut * (10000n - SWAP_SLIPPAGE_BPS)) / 10000n

    const swapHash = await wallet.writeContract({
      address: SWAP_POOL_ADDRESS,
      abi: SWAP_POOL_ABI,
      functionName: 'swap',
      args: [tokenIn, amountIn, minAmountOut],
      account,
      chain: wallet.chain,
    })
    const swapReceipt = await publicClient.waitForTransactionReceipt({ hash: swapHash })
    return swapReceipt.transactionHash
  } catch {
    // Best-effort: pool may lack liquidity for this size — fall back to a
    // record-only executeOrder call with a tick-derived txRef.
    return null
  }
}

/**
 * Ensure the platform's service wallet has its own "shadow" on-chain agent
 * registered for this Supabase agent row, so it can call executeOrder()
 * autonomously (AgentExecutor.executeOrder is onlyAgentOwner — the user's own
 * wallet is the owner of any agent THEY register, so the service wallet
 * registers a separate, derived-policy-hash agent it owns instead).
 * Idempotent: returns the existing onchain_agent_id if already registered.
 */
export async function ensureShadowAgent(
  supabase: SupabaseClient,
  agent: AgentRow,
): Promise<bigint> {
  if (agent.onchain_agent_id != null) return BigInt(agent.onchain_agent_id)

  const mandatePolicyHash = agent.mandate?.policy_hash
  if (!mandatePolicyHash) throw new Error('Mandate has no policy hash — deploy the mandate on-chain first')

  const wallet = getServiceWalletClient()
  const account = getServiceWalletAddress()

  // Derive a distinct policy hash owned by the service wallet, traceable back
  // to the user's mandate policy hash + this agent's id.
  const shadowHash = keccak256(toHex(`${mandatePolicyHash}:shadow:${agent.id}`))

  try {
    const submitTx = await wallet.writeContract({
      address: MANDATE_POLICY_ADDRESS,
      abi: MANDATE_POLICY_ABI,
      functionName: 'submitPolicy',
      args: [shadowHash],
      account,
      chain: wallet.chain,
    })
    await publicClient.waitForTransactionReceipt({ hash: submitTx })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (!message.includes('already registered')) throw err
    // Already submitted by the service wallet on a prior, partially-failed tick — continue.
  }

  const registerTx = await wallet.writeContract({
    address: AGENT_EXECUTOR_ADDRESS,
    abi: AGENT_EXECUTOR_ABI,
    functionName: 'registerAgent',
    args: [shadowHash, MANDATE_POLICY_ADDRESS],
    account,
    chain: wallet.chain,
  })
  const registerReceipt = await publicClient.waitForTransactionReceipt({ hash: registerTx })

  const [registeredEvent] = parseEventLogs({
    abi: AGENT_EXECUTOR_ABI,
    eventName: 'AgentRegistered',
    logs: registerReceipt.logs,
  })
  if (!registeredEvent) throw new Error('AgentRegistered event not found in registration receipt')
  const onchainAgentId = registeredEvent.args.agentId

  const activateTx = await wallet.writeContract({
    address: AGENT_EXECUTOR_ADDRESS,
    abi: AGENT_EXECUTOR_ABI,
    functionName: 'activateAgent',
    args: [onchainAgentId],
    account,
    chain: wallet.chain,
  })
  await publicClient.waitForTransactionReceipt({ hash: activateTx })

  await supabase
    .from('agents')
    .update({
      onchain_agent_id: Number(onchainAgentId),
      onchain_policy_hash: shadowHash,
      onchain_owner: account,
    })
    .eq('id', agent.id)

  return onchainAgentId
}

const CONFIDENCE_THRESHOLD = 65

/**
 * Run one trading-decision cycle for an agent: fetch live market data, ask
 * Claude whether to trade, and if it recommends a confident buy/sell, record
 * the executed order on Mantle Sepolia via AgentExecutor.executeOrder and
 * persist the trade + updated agent metrics to Supabase.
 */
export async function runAgentTick(supabase: SupabaseClient, agent: AgentRow): Promise<TickResult> {
  const parsedPolicy = agent.mandate?.parsed_policy ?? {}
  const portfolioValue = agent.capital_cap || 1000

  const result = await getTradeDecision(parsedPolicy, portfolioValue, agent.drawdown_current)
  if ('error' in result) throw new Error(result.error)
  const decision = result.data

  if (decision.action === 'hold' || decision.confidence < CONFIDENCE_THRESHOLD) {
    return { decision, executed: false, reason: `AI recommended ${decision.action} (confidence ${decision.confidence}%) — no trade recorded` }
  }

  if (decision.live_price == null || decision.price_change == null) {
    return { decision, executed: false, reason: 'Live market data unavailable — skipping on-chain execution' }
  }

  const onchainAgentId = await ensureShadowAgent(supabase, agent)

  const capital = agent.capital_cap || 1000
  const amountUsd = Math.min(capital, capital * (decision.amount_pct / 100))
  const isBuy = decision.action === 'buy'

  const wallet = getServiceWalletClient()
  const account = getServiceWalletAddress()

  // For ETH/WETH, perform a real on-chain swap against the mUSD/mWETH pool
  // first, then anchor the audit record (executeOrder) to that swap's tx hash.
  const swapTxHash = await trySwap(wallet, account, decision, isBuy, amountUsd)
  const txRef = swapTxHash ?? keccak256(toHex(`tick:${agent.id}:${Date.now()}`))

  let receipt: Awaited<ReturnType<typeof publicClient.waitForTransactionReceipt>>
  try {
    const txHash = await wallet.writeContract({
      address: AGENT_EXECUTOR_ADDRESS,
      abi: AGENT_EXECUTOR_ABI,
      functionName: 'executeOrder',
      args: [onchainAgentId, assetToBytes32(decision.asset), BigInt(Math.round(amountUsd * 100)), isBuy, txRef],
      account,
      chain: wallet.chain,
    })
    receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { decision, executed: false, reason: `On-chain execution failed: ${message}` }
  }

  // Mark-to-market PnL estimate from the live 24h price change — even when a
  // real swap fills, the AMM's quoted price differs from the CEX mark price,
  // so this remains an honest, data-driven estimate rather than the swap's
  // realized fill price.
  const pnl = Math.round(amountUsd * (decision.price_change / 100) * (isBuy ? 1 : -1) * 100) / 100

  await supabase.from('trades').insert({
    user_id: agent.user_id,
    agent_id: agent.id,
    mandate_id: agent.mandate_id,
    asset_pair: `${decision.asset}/USDT`,
    direction: decision.action,
    amount_usd: amountUsd,
    price: decision.live_price,
    pnl,
    protocol: swapTxHash ? 'mantle-testnet-amm' : 'onchain-audit',
    tx_hash: receipt.transactionHash,
    block_number: Number(receipt.blockNumber),
    status: 'success',
    mandate_rule_applied: decision.reasoning,
  })

  const newTotalPnl = agent.total_pnl + pnl
  const newTotalVolume = agent.total_volume + amountUsd
  await supabase
    .from('agents')
    .update({
      total_pnl: newTotalPnl,
      total_volume: newTotalVolume,
      total_roi: capital > 0 ? Math.round((newTotalPnl / capital) * 10000) / 100 : 0,
      last_trade_at: new Date().toISOString(),
    })
    .eq('id', agent.id)

  return {
    decision,
    executed: true,
    txHash: receipt.transactionHash,
    swapTxHash: swapTxHash ?? undefined,
    onchainAgentId: onchainAgentId.toString(),
    pnl,
  }
}
