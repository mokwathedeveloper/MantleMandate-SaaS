// Mock alerts feed

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface MockAlert {
  id:       string
  severity: AlertSeverity
  source:   string
  title:    string
  message:  string
  time:     string
  acknowledged: boolean
}

export const MOCK_ALERTS: MockAlert[] = [
  { id: 'a1',  severity: 'critical', source: 'Risk Engine',   title: 'Counterparty exposure breach',           message: 'BTC Momentum Rider exceeded 35% concentration on Merchant Moe.',         time: '2 min ago',  acknowledged: false },
  { id: 'a2',  severity: 'high',     source: 'Policy',        title: 'Mandate review queue full',              message: '13 mandates awaiting policy review — agents paused until review.',       time: '14 min ago', acknowledged: false },
  { id: 'a3',  severity: 'medium',   source: 'Network',       title: 'Mantle gas spike',                       message: 'Gas fees up 32% in last 10 minutes — non-urgent trades deferred.',       time: '32 min ago', acknowledged: false },
  { id: 'a4',  severity: 'medium',   source: 'Agent',         title: 'Slippage warning',                       message: 'Stable Yield Farmer encountered 0.4% slippage vs target.',                time: '1 h ago',    acknowledged: true  },
  { id: 'a5',  severity: 'info',     source: 'Compliance',    title: 'Audit trail exported',                   message: 'Q2 audit report generated and signed by 3 of 3 reviewers.',               time: '2 h ago',    acknowledged: true  },
  { id: 'a6',  severity: 'low',      source: 'Protocol',      title: 'New protocol routed',                    message: 'Fluxion auto-routed first trade for arb agent — within band.',            time: '3 h ago',    acknowledged: true  },
]

export const ALERT_KPIS = {
  open:         { value: 3,   deltaText: '1 critical, 1 high, 1 medium' },
  acknowledged: { value: 28,  deltaText: 'last 24h' },
  resolutionMtr:{ value: 12,  unit: 'min', deltaText: 'mean time to resolve' },
  policyAlerts: { value: 4,   deltaText: 'last 7 days' },
}
