import { parseAbi, createPublicClient, http } from 'viem'
import { mantleTestnet } from './wagmi'
import type { Address } from 'viem'

// ── Deployed contract addresses (Mantle Sepolia Testnet) ──────────────────────

export const MANDATE_POLICY_ADDRESS = (
  process.env.NEXT_PUBLIC_MANDATE_POLICY_CONTRACT || '0xee9FBcb6583B32d0ddC615882d0A03DA8714b952'
) as Address

export const AGENT_EXECUTOR_ADDRESS = (
  process.env.NEXT_PUBLIC_AGENT_EXECUTOR_CONTRACT || '0xEa15a627e1EADf5c3D09b641295CFD037BaaA4B7'
) as Address

export const RISK_GUARD_ADDRESS = (
  process.env.NEXT_PUBLIC_RISK_GUARD_CONTRACT || '0x5d7E824D8A374aA2b8ACe225220Ad7246a81e258'
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

// ── Read-only public client (no wallet needed) ────────────────────────────────

export const publicClient = createPublicClient({
  chain:     mantleTestnet,
  transport: http('https://rpc.sepolia.mantle.xyz'),
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
