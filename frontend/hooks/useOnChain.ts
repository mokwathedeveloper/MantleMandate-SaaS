'use client'

/**
 * useOnChain — hooks for interacting with the MantleMandate smart contracts
 * on Mantle Sepolia Testnet.
 *
 * Flow:
 *  1. useSubmitPolicy   → MandatePolicy.submitPolicy(hash)
 *  2. useRegisterAgent  → AgentExecutor.registerAgent(hash, policyContract)
 *  3. useActivateAgent  → AgentExecutor.activateAgent(agentId)
 *  4. useExecuteOrder   → AgentExecutor.executeOrder(...)
 *  5. useOnChainEvents  → read OrderExecuted + AgentRegistered events
 */

import { useState, useCallback } from 'react'
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
  useChainId,
  useSwitchChain,
} from 'wagmi'
import {
  MANDATE_POLICY_ADDRESS,
  AGENT_EXECUTOR_ADDRESS,
  MANDATE_POLICY_ABI,
  AGENT_EXECUTOR_ABI,
  publicClient,
  toPolicyHash,
  assetToBytes32,
  bytes32ToAsset,
} from '@/lib/contracts'
import { mantleTestnet } from '@/lib/wagmi'

export const REQUIRED_CHAIN_ID = mantleTestnet.id   // 5003

// ── Utility: ensure wallet is on the right network ────────────────────────────

export function useNetworkGuard() {
  const chainId         = useChainId()
  const { switchChain, isPending: switching } = useSwitchChain()
  const isCorrectChain  = chainId === REQUIRED_CHAIN_ID

  const ensureChain = useCallback(async () => {
    if (!isCorrectChain) await switchChain({ chainId: REQUIRED_CHAIN_ID })
  }, [isCorrectChain, switchChain])

  return { isCorrectChain, ensureChain, switching }
}

// ── Step 1: Submit policy hash to MandatePolicy contract ──────────────────────

export function useSubmitPolicy() {
  const { address } = useAccount()
  const { ensureChain } = useNetworkGuard()

  const {
    writeContractAsync,
    data:     txHash,
    isPending,
    error:    writeError,
    reset,
  } = useWriteContract()

  const {
    data:       receipt,
    isLoading:  confirming,
    isSuccess:  confirmed,
  } = useWaitForTransactionReceipt({ hash: txHash })

  // Check if this policy is already on-chain
  const { data: alreadyOnChain, refetch: recheckPolicy } = useReadContract({
    address:      MANDATE_POLICY_ADDRESS,
    abi:          MANDATE_POLICY_ABI,
    functionName: 'verifyPolicy',
    args:         address && txHash ? [address, toPolicyHash('0x')] : undefined,
    query:        { enabled: false },   // called manually
  })

  const submitPolicy = useCallback(async (rawPolicyHash: string): Promise<`0x${string}`> => {
    await ensureChain()
    const hash = toPolicyHash(rawPolicyHash)
    return writeContractAsync({
      address:      MANDATE_POLICY_ADDRESS,
      abi:          MANDATE_POLICY_ABI,
      functionName: 'submitPolicy',
      args:         [hash],
    })
  }, [ensureChain, writeContractAsync])

  return {
    submitPolicy,
    txHash,
    receipt,
    isPending,
    confirming,
    confirmed,
    writeError,
    alreadyOnChain,
    recheckPolicy,
    reset,
  }
}

// ── Step 2: Register agent in AgentExecutor ───────────────────────────────────

export function useRegisterAgent() {
  const { ensureChain } = useNetworkGuard()
  const [onChainAgentId, setOnChainAgentId] = useState<bigint | null>(null)

  const {
    writeContractAsync,
    data:     txHash,
    isPending,
    error:    writeError,
    reset,
  } = useWriteContract()

  const {
    data:      receipt,
    isLoading: confirming,
    isSuccess: confirmed,
  } = useWaitForTransactionReceipt({ hash: txHash })

  const registerAgent = useCallback(async (rawPolicyHash: string): Promise<`0x${string}`> => {
    await ensureChain()
    const hash = toPolicyHash(rawPolicyHash)
    const tx = await writeContractAsync({
      address:      AGENT_EXECUTOR_ADDRESS,
      abi:          AGENT_EXECUTOR_ABI,
      functionName: 'registerAgent',
      args:         [hash, MANDATE_POLICY_ADDRESS],
    })
    return tx
  }, [ensureChain, writeContractAsync])

  // Parse agentId from receipt logs once confirmed
  const parseAgentId = useCallback((txReceipt: typeof receipt) => {
    if (!txReceipt) return
    for (const log of txReceipt.logs) {
      try {
        // AgentRegistered event topic[2] = agentId (uint256 indexed)
        if (log.topics[0] === '0xd7f15a27938af0f2b8fe34a5a07a4d0a7d9a7d64c7c87d0b45f1e5e2b9a8c1d') {
          const agentId = BigInt(log.topics[2] ?? '0x0')
          setOnChainAgentId(agentId)
          return agentId
        }
      } catch { /* skip */ }
    }
  }, [])

  return {
    registerAgent,
    txHash,
    receipt,
    isPending,
    confirming,
    confirmed,
    writeError,
    onChainAgentId,
    parseAgentId,
    reset,
  }
}

// ── Step 3: Activate a registered agent ──────────────────────────────────────

export function useActivateAgent() {
  const { ensureChain } = useNetworkGuard()

  const {
    writeContractAsync,
    data:     txHash,
    isPending,
    error:    writeError,
    reset,
  } = useWriteContract()

  const {
    data:      receipt,
    isLoading: confirming,
    isSuccess: confirmed,
  } = useWaitForTransactionReceipt({ hash: txHash })

  const activateAgent = useCallback(async (agentId: bigint): Promise<`0x${string}`> => {
    await ensureChain()
    return writeContractAsync({
      address:      AGENT_EXECUTOR_ADDRESS,
      abi:          AGENT_EXECUTOR_ABI,
      functionName: 'activateAgent',
      args:         [agentId],
    })
  }, [ensureChain, writeContractAsync])

  return { activateAgent, txHash, receipt, isPending, confirming, confirmed, writeError, reset }
}

// ── Step 4: Record a trade execution on-chain ─────────────────────────────────

export function useExecuteOrder() {
  const { ensureChain } = useNetworkGuard()

  const {
    writeContractAsync,
    data:     txHash,
    isPending,
    error:    writeError,
    reset,
  } = useWriteContract()

  const {
    data:      receipt,
    isLoading: confirming,
    isSuccess: confirmed,
  } = useWaitForTransactionReceipt({ hash: txHash })

  /**
   * @param agentId       On-chain agent ID (uint256)
   * @param assetSymbol   e.g. "ETH", "MNT"
   * @param amountUsd     Trade amount in USD (will be stored as integer cents)
   * @param isBuy         true = buy, false = sell
   * @param txRef         Optional off-chain reference hash (e.g. DEX tx hash)
   */
  const executeOrder = useCallback(async ({
    agentId,
    assetSymbol,
    amountUsd,
    isBuy,
    txRef = '0x' + '0'.repeat(64),
  }: {
    agentId: bigint
    assetSymbol: string
    amountUsd: number
    isBuy: boolean
    txRef?: string
  }): Promise<`0x${string}`> => {
    await ensureChain()
    const asset  = assetToBytes32(assetSymbol)
    const amount = BigInt(Math.round(amountUsd * 100))  // store as cents
    const ref    = (txRef.startsWith('0x') ? txRef.padEnd(66, '0') : '0x' + txRef.padStart(64, '0')) as `0x${string}`

    return writeContractAsync({
      address:      AGENT_EXECUTOR_ADDRESS,
      abi:          AGENT_EXECUTOR_ABI,
      functionName: 'executeOrder',
      args:         [agentId, asset, amount, isBuy, ref],
    })
  }, [ensureChain, writeContractAsync])

  return { executeOrder, txHash, receipt, isPending, confirming, confirmed, writeError, reset }
}

// ── Step 5: Read on-chain events for the audit table ─────────────────────────

export interface OnChainEvent {
  txHash:      `0x${string}`
  blockNumber: bigint
  timestamp:   number       // unix seconds
  agentId:     bigint
  asset:       string
  amountUsd:   number
  isBuy:       boolean
  execIndex:   bigint
}

export async function fetchOnChainAuditEvents(lookbackBlocks = 50_000): Promise<OnChainEvent[]> {
  try {
    const latestBlock = await publicClient.getBlockNumber()
    const fromBlock   = latestBlock > BigInt(lookbackBlocks)
      ? latestBlock - BigInt(lookbackBlocks)
      : 0n

    const logs = await publicClient.getContractEvents({
      address:   AGENT_EXECUTOR_ADDRESS,
      abi:       AGENT_EXECUTOR_ABI,
      eventName: 'OrderExecuted',
      fromBlock,
      toBlock:   'latest',
    })

    if (logs.length === 0) return []

    // Fetch blocks for timestamps — batch unique block numbers
    const uniqueBlocks = [...new Set(logs.map(l => l.blockNumber!))]
    const blockMap = new Map<bigint, number>()
    await Promise.all(
      uniqueBlocks.map(async (bn) => {
        const block = await publicClient.getBlock({ blockNumber: bn })
        blockMap.set(bn, Number(block.timestamp))
      })
    )

    return logs.map(log => {
      const { agentId, asset, amount, isBuy, execIndex } = log.args as {
        agentId: bigint; asset: `0x${string}`; amount: bigint; isBuy: boolean; execIndex: bigint
      }
      return {
        txHash:      log.transactionHash!,
        blockNumber: log.blockNumber!,
        timestamp:   blockMap.get(log.blockNumber!) ?? 0,
        agentId,
        asset:       bytes32ToAsset(asset),
        amountUsd:   Number(amount) / 100,
        isBuy,
        execIndex,
      }
    }).reverse()   // newest first
  } catch {
    return []
  }
}
