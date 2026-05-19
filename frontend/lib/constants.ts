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

export const MANTLE_EXPLORER         = 'https://explorer.mantle.xyz'
export const MANTLE_TESTNET_EXPLORER = process.env.NEXT_PUBLIC_MANTLE_TESTNET_EXPLORER || 'https://explorer.sepolia.mantle.xyz'

// Merchant Moe subgraph — overridable for staging/custom deployments
export const MANTLE_SUBGRAPH_URL = process.env.MANTLE_SUBGRAPH_URL
  || 'https://api.studio.thegraph.com/query/44992/merchant-moe-lb-mantle/version/latest'

// Mantle mainnet token addresses (chain 5000)
export const MANTLE_TOKENS: Record<string, { address: string; decimals: number }> = {
  MNT:  { address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8', decimals: 18 },
  WMNT: { address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8', decimals: 18 },
  USDC: { address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9', decimals: 6  },
  USDT: { address: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE', decimals: 6  },
  WETH: { address: '0xdEAddEaDdeadDEadDEADDEaddEADDEAddead1111', decimals: 18 },
  WBTC: { address: '0x59889b7021243dB5B1e065385F918316cD90D46', decimals: 8  },
}
