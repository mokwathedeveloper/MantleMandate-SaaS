import type { SupabaseClient } from '@supabase/supabase-js'
import { keccak256, toHex, parseEventLogs } from 'viem'
import {
  publicClient,
  MANDATE_POLICY_ADDRESS,
  AGENT_EXECUTOR_ADDRESS,
  AGENT_REPUTATION_REGISTRY_ADDRESS,
  MOCK_USD_ADDRESS,
  MOCK_WETH_ADDRESS,
  SWAP_POOL_ADDRESS,
  MANDATE_POLICY_ABI,
  AGENT_EXECUTOR_ABI,
  AGENT_REPUTATION_REGISTRY_ABI,
  SWAP_POOL_ABI,
  assetToBytes32,
} from '@/lib/contracts'
import { getServiceWalletClient, getServiceAccount } from '@/lib/serverWallet'
import { getTradeDecision, type TradeDecision } from '@/lib/agentDecision'
import { computeReasoningDigest, pinReasoning, type ReasoningPayload } from '@/lib/ipfs'

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
  reasoningCid?:     string
  reasoningPinned?:  boolean
  commitmentTxHash?: `0x${string}`
  resolutionTxHash?: `0x${string}`
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
  account: ReturnType<typeof getServiceAccount>,
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
 * Commit a hash of the agent's reasoning to AgentReputationRegistry *before*
 * the trade executes. Returns null (no-op) if the registry isn't configured
 * or the commitment tx fails — a failed/missing commitment never blocks
 * trade execution, it just means this trade has no on-chain reputation entry.
 */
async function commitReasoning(
  wallet: ReturnType<typeof getServiceWalletClient>,
  account: ReturnType<typeof getServiceAccount>,
  onchainAgentId: bigint,
  digest: `0x${string}`,
): Promise<{ txHash: `0x${string}`; commitIndex: bigint } | null> {
  if (!AGENT_REPUTATION_REGISTRY_ADDRESS) return null

  try {
    const txHash = await wallet.writeContract({
      address: AGENT_REPUTATION_REGISTRY_ADDRESS,
      abi: AGENT_REPUTATION_REGISTRY_ABI,
      functionName: 'commitDecision',
      args: [onchainAgentId, digest],
      account,
      chain: wallet.chain,
    })
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
    const [event] = parseEventLogs({
      abi: AGENT_REPUTATION_REGISTRY_ABI,
      eventName: 'DecisionCommitted',
      logs: receipt.logs,
    })
    if (!event) return null
    return { txHash: receipt.transactionHash, commitIndex: event.args.commitIndex }
  } catch {
    return null
  }
}

/**
 * Resolve a prior reasoning commitment with the trade's real outcome.
 * Best-effort, mirrors commitReasoning's failure handling.
 */
async function resolveReasoningCommitment(
  wallet: ReturnType<typeof getServiceWalletClient>,
  account: ReturnType<typeof getServiceAccount>,
  onchainAgentId: bigint,
  commitIndex: bigint,
  executed: boolean,
): Promise<`0x${string}` | null> {
  if (!AGENT_REPUTATION_REGISTRY_ADDRESS) return null

  try {
    const txHash = await wallet.writeContract({
      address: AGENT_REPUTATION_REGISTRY_ADDRESS,
      abi: AGENT_REPUTATION_REGISTRY_ABI,
      functionName: 'resolveCommitment',
      args: [onchainAgentId, commitIndex, executed],
      account,
      chain: wallet.chain,
    })
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
    return receipt.transactionHash
  } catch {
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
  const account = getServiceAccount()

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
      onchain_owner: account.address,
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
  // Hard cap position size at the mandate's riskPerTrade, regardless of what
  // the AI recommended — the mandate's bound wins, not the model's.
  const riskPerTrade = typeof parsedPolicy.riskPerTrade === 'number'
    ? Math.min(Math.max(parsedPolicy.riskPerTrade, 0), 100)
    : 100
  const sizePct = Math.min(decision.amount_pct, riskPerTrade)
  const amountUsd = Math.min(capital, capital * (sizePct / 100))
  const isBuy = decision.action === 'buy'

  const wallet = getServiceWalletClient()
  const account = getServiceAccount()

  // Content-address the AI's reasoning for this decision (CIDv1, sha2-256,
  // raw codec) and, if AgentReputationRegistry is configured, commit that
  // digest on-chain *before* execution — a tamper-evident record of what the
  // agent intended to do and why.
  const reasoningPayload: ReasoningPayload = {
    agentId:        agent.id,
    onchainAgentId: onchainAgentId.toString(),
    asset:          decision.asset,
    action:         decision.action,
    confidence:     decision.confidence,
    reasoning:      decision.reasoning,
    amountPct:      decision.amount_pct,
    urgency:        decision.urgency,
    livePrice:      decision.live_price,
    priceChange:    decision.price_change,
    rsi:            decision.rsi,
    timestamp:      new Date().toISOString(),
  }
  const reasoningDigest = computeReasoningDigest(reasoningPayload)
  const { cid: reasoningCid, pinned: reasoningPinned } = await pinReasoning(reasoningPayload)
  const commitment = await commitReasoning(wallet, account, onchainAgentId, reasoningDigest)

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
    const resolutionTxHash = commitment
      ? await resolveReasoningCommitment(wallet, account, onchainAgentId, commitment.commitIndex, false)
      : null
    return {
      decision,
      executed: false,
      reason: `On-chain execution failed: ${message}`,
      reasoningCid,
      reasoningPinned,
      commitmentTxHash: commitment?.txHash,
      resolutionTxHash: resolutionTxHash ?? undefined,
    }
  }

  const resolutionTxHash = commitment
    ? await resolveReasoningCommitment(wallet, account, onchainAgentId, commitment.commitIndex, true)
    : null

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
    reasoning_cid: reasoningCid,
    reasoning_pinned: reasoningPinned,
    commitment_tx_hash: commitment?.txHash ?? null,
    commitment_index: commitment ? Number(commitment.commitIndex) : null,
    resolution_tx_hash: resolutionTxHash,
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
    reasoningCid,
    reasoningPinned,
    commitmentTxHash: commitment?.txHash,
    resolutionTxHash: resolutionTxHash ?? undefined,
  }
}
