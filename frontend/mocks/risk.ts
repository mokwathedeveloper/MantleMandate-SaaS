// Mock risk engine data

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface RiskEvent {
  id:        string
  agent:     string
  rule:      string
  severity:  RiskSeverity
  status:    'open' | 'review' | 'resolved'
  triggered: string
  detail:    string
}

export const MOCK_RISK_EVENTS: RiskEvent[] = [
  { id: 're1', agent: 'BTC Momentum Rider',     rule: 'Position concentration',  severity: 'high',     status: 'review',   triggered: '32 min ago', detail: 'WBTC exposure exceeded 25% of mandate cap.' },
  { id: 're2', agent: 'ETH Conservative Buyer', rule: 'Slippage band',           severity: 'medium',   status: 'resolved', triggered: '2 h ago',    detail: 'Trade executed inside soft slippage band — alert auto-resolved.' },
  { id: 're3', agent: 'Stable Yield Farmer',    rule: 'Pool depth threshold',    severity: 'low',      status: 'resolved', triggered: '6 h ago',    detail: 'Liquidity dipped below threshold for 12 minutes — no action taken.' },
  { id: 're4', agent: 'Arb Scanner Alpha',      rule: 'Signal divergence',       severity: 'medium',   status: 'open',     triggered: '8 h ago',    detail: 'Cross-DEX spread inconsistent with oracle — paused for review.' },
  { id: 're5', agent: 'MNT DCA Strategy',       rule: 'Cooldown override',       severity: 'low',      status: 'resolved', triggered: '12 h ago',   detail: 'Manual override approved by mandate owner.' },
  { id: 're6', agent: 'BTC Momentum Rider',     rule: 'Counterparty exposure',   severity: 'critical', status: 'open',     triggered: '14 h ago',   detail: 'Counterparty single-source > 35% of trade volume.' },
]

export const RISK_KPIS = {
  riskScore:      { value: 23,  scale: 100, level: 'Low',     deltaText: '−4 vs prev. period' },
  openIncidents:  { value:  2,              deltaText: '1 critical, 1 medium' },
  policyChecks:   { value:  4_812,          deltaText: 'last 24h' },
  bestExecRate:   { value: 96.4, unit: '%', deltaText: '+0.6% vs prev. period' },
}
