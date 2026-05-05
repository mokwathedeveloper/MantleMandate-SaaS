export interface Trade {
  id: string
  agentId: string
  mandateId: string
  mandateName: string
  assetPair: string
  direction: 'buy' | 'sell'
  amountUsd: number
  price: number
  pnl: number | null
  protocol: 'merchant_moe' | 'agni' | 'fluxion'
  txHash: string | null
  blockNumber: number | null
  status: 'pending' | 'success' | 'failed'
  mandateRuleApplied: string | null
  createdAt: string
}

export interface AuditLog {
  id: string
  agentId: string
  tradeId: string | null
  eventType: string
  decisionHash: string | null
  txHash: string | null
  blockNumber: number | null
  details: Record<string, unknown>
  createdAt: string
}
