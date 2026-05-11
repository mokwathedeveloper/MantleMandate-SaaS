export const MANTLE_CHAIN_ID = Number(process.env.NEXT_PUBLIC_MANTLE_CHAIN_ID || 5000)
export const MANTLE_TESTNET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_MANTLE_TESTNET_CHAIN_ID || 5003)
export const MANTLE_RPC_URL = process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.mantle.xyz'

export const CONTRACTS = {
  MANDATE_POLICY: process.env.NEXT_PUBLIC_MANDATE_POLICY_CONTRACT || '0xee9FBcb6583B32d0ddC615882d0A03DA8714b952',
  AGENT_EXECUTOR: process.env.NEXT_PUBLIC_AGENT_EXECUTOR_CONTRACT || '0xEa15a627e1EADf5c3D09b641295CFD037BaaA4B7',
  RISK_GUARD:     process.env.NEXT_PUBLIC_RISK_GUARD_CONTRACT     || '0x5d7E824D8A374aA2b8ACe225220Ad7246a81e258',
}

export const PLANS = {
  operator: { name: 'Operator', price: 29 },
  strategist: { name: 'Strategist', price: 99 },
  institution: { name: 'Institution', price: 299 },
} as const

export const MANTLE_EXPLORER = 'https://explorer.mantle.xyz'
