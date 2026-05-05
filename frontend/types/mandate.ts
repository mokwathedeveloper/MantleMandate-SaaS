export interface RiskParams {
  maxDrawdown: number
  maxPosition: number
  stopLoss: number
  maxPositions: number
  cooldownHours: number
}

export interface ParsedPolicy {
  asset: string
  trigger: string
  riskPerTrade: number
  takeProfit: number | null
  schedule: string
  venue: string | null
}

export interface Mandate {
  id: string
  name: string
  mandateText: string
  parsedPolicy: ParsedPolicy | null
  policyHash: string | null
  baseCurrency: string
  strategyType: string | null
  riskParams: RiskParams
  capitalCap: number | null
  status: 'draft' | 'active' | 'paused' | 'archived'
  onChainTx: string | null
  createdAt: string
  updatedAt: string
}
