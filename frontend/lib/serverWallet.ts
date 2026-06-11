import { createWalletClient, http, type WalletClient } from 'viem'
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts'
import { mantleTestnet } from './wagmi'

// Server-only: the platform's funded service wallet on Mantle Sepolia testnet.
// Used to register "shadow" on-chain agents and record executed trades via
// AgentExecutor.executeOrder. Never import this from client components —
// MANTLE_PRIVATE_KEY must stay server-side (no NEXT_PUBLIC_ prefix).

let _account: PrivateKeyAccount | null = null
let _client: WalletClient | null = null

function getAccount(): PrivateKeyAccount {
  if (_account) return _account
  const key = process.env.MANTLE_PRIVATE_KEY
  if (!key) throw new Error('MANTLE_PRIVATE_KEY is not configured')
  const normalized = (key.startsWith('0x') ? key : `0x${key}`) as `0x${string}`
  _account = privateKeyToAccount(normalized)
  return _account
}

export function getServiceWalletAddress() {
  return getAccount().address
}

export function getServiceWalletClient(): WalletClient {
  if (_client) return _client
  _client = createWalletClient({
    chain: mantleTestnet,
    transport: http('https://rpc.sepolia.mantle.xyz', { retryCount: 1, retryDelay: 1000, timeout: 15_000 }),
    account: getAccount(),
  })
  return _client
}
