export const MANTLE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_MANTLE_CHAIN_ID || 5000)
export const MANTLE_TESTNET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_MANTLE_TESTNET_CHAIN_ID || 5003)
export const MANTLE_RPC_URL = process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.mantle.xyz'

export const CONTRACTS = {
  MANDATE_POLICY: process.env.NEXT_PUBLIC_MANDATE_POLICY_CONTRACT || '',
  AGENT_EXECUTOR: process.env.NEXT_PUBLIC_AGENT_EXECUTOR_CONTRACT || '',
  RISK_GUARD: process.env.NEXT_PUBLIC_RISK_GUARD_CONTRACT || '',
}

export const PLANS = {
  operator: { name: 'Operator', price: 29 },
  strategist: { name: 'Strategist', price: 99 },
  institution: { name: 'Institution', price: 299 },
} as const

export const MANTLE_EXPLORER = 'https://explorer.mantle.xyz'
