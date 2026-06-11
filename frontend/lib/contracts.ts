import { parseAbi, createPublicClient, http } from 'viem'
import { mantleTestnet } from './wagmi'
import type { Address } from 'viem'

// ── Deployed contract addresses (Mantle Sepolia Testnet) ──────────────────────

export const MANDATE_POLICY_ADDRESS = (
  process.env.NEXT_PUBLIC_MANDATE_POLICY_CONTRACT || '0x690Ab021b40a01E9f3818CdBa149fb5721480871'
) as Address

export const AGENT_EXECUTOR_ADDRESS = (
  process.env.NEXT_PUBLIC_AGENT_EXECUTOR_CONTRACT || '0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6'
) as Address

export const RISK_GUARD_ADDRESS = (
  process.env.NEXT_PUBLIC_RISK_GUARD_CONTRACT || '0x8D99D4F922248852Bc678bd4018F9f3E4576E34B'
) as Address

// ── Testnet AMM (Mantle Sepolia) ───────────────────────────────────────────────
// Merchant Moe / Agni Finance have no Sepolia deployment, so the agent swaps
// against this project-deployed mUSD/mWETH pool to execute real on-chain trades.

export const MOCK_USD_ADDRESS = (
  process.env.NEXT_PUBLIC_MOCK_USD_CONTRACT || '0x61806e0D29b0aa200dC26e9C1F0380707a3210c9'
) as Address

export const MOCK_WETH_ADDRESS = (
  process.env.NEXT_PUBLIC_MOCK_WETH_CONTRACT || '0x535DC64B3eBDf3ce0ed1C03a8dfbEaf3A84e49EF'
) as Address

export const SWAP_POOL_ADDRESS = (
  process.env.NEXT_PUBLIC_SWAP_POOL_CONTRACT || '0x3440d742bbbAe391b95E40FAF62d7a715582a4ad'
) as Address

// ── ABIs ──────────────────────────────────────────────────────────────────────

export const MANDATE_POLICY_ABI = parseAbi([
  'function submitPolicy(bytes32 policyHash) external',
  'function revokePolicy(bytes32 policyHash) external',
  'function verifyPolicy(address owner, bytes32 policyHash) external view returns (bool)',
  'function getPolicyCount(address owner) external view returns (uint256)',
  'event PolicySubmitted(address indexed owner, bytes32 indexed policyHash, uint256 indexed policyIndex, uint64 timestamp)',
  'event PolicyRevoked(address indexed owner, bytes32 indexed policyHash)',
])

export const AGENT_EXECUTOR_ABI = parseAbi([
  'function registerAgent(bytes32 policyHash, address mandatePolicyContract) external returns (uint256 agentId)',
  'function activateAgent(uint256 agentId) external',
  'function pauseAgent(uint256 agentId) external',
  'function resumeAgent(uint256 agentId) external',
  'function stopAgent(uint256 agentId) external',
  'function executeOrder(uint256 agentId, bytes32 asset, uint256 amount, bool isBuy, bytes32 txRef) external',
  'function getOwnerAgents(address owner) external view returns (uint256[])',
  'event AgentRegistered(address indexed owner, uint256 indexed agentId, bytes32 policyHash)',
  'event AgentStatusChanged(uint256 indexed agentId, uint8 status)',
  'event OrderExecuted(uint256 indexed agentId, bytes32 indexed asset, uint256 amount, bool isBuy, uint256 execIndex)',
])

export const ERC20_ABI = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function decimals() external view returns (uint8)',
])

export const SWAP_POOL_ABI = parseAbi([
  'function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut) external returns (uint256 amountOut)',
  'function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut)',
  'function getReserves() external view returns (uint256 reserveA, uint256 reserveB)',
  'function tokenA() external view returns (address)',
  'function tokenB() external view returns (address)',
  'event Swap(address indexed trader, address indexed tokenIn, uint256 amountIn, address indexed tokenOut, uint256 amountOut)',
])

// ── Read-only public client (no wallet needed) ────────────────────────────────

export const publicClient = createPublicClient({
  chain:     mantleTestnet,
  transport: http('https://rpc.sepolia.mantle.xyz', {
    retryCount:       1,      // stop the infinite retry loop on 400 errors
    retryDelay:       1000,
    timeout:          10_000,
  }),
})

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a policy hash string from the backend ("0x" + 64 hex chars) to a
 * bytes32-compatible value. Pads to 66 chars (0x + 64) if shorter.
 */
export function toPolicyHash(hash: string): `0x${string}` {
  const clean = hash.startsWith('0x') ? hash : `0x${hash}`
  return clean.padEnd(66, '0') as `0x${string}`
}

/**
 * Encode an asset symbol as bytes32 — matches keccak256("ETH") on-chain.
 * For display purposes we store the symbol itself right-padded.
 */
export function assetToBytes32(symbol: string): `0x${string}` {
  const hex = Buffer.from(symbol, 'utf8').toString('hex')
  return ('0x' + hex.padEnd(64, '0')) as `0x${string}`
}

/** Decode a right-padded bytes32 back to an asset symbol string. */
export function bytes32ToAsset(hex: string): string {
  try {
    const clean = hex.replace(/^0x/, '').replace(/0+$/, '')
    return Buffer.from(clean, 'hex').toString('utf8').replace(/\0/g, '').trim() || hex.slice(0, 10)
  } catch {
    return hex.slice(0, 10)
  }
}
