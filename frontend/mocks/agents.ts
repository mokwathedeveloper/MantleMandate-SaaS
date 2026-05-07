// Mock AI agents

export type AgentStatus = 'active' | 'paused' | 'stopped' | 'error'

export interface MockAgent {
  id:           string
  name:         string
  strategy:     string
  status:       AgentStatus
  protocol:     string
  pnl24h:       number
  pnlPct:       number
  trades24h:    number
  capitalUsd:   number
  riskScore:    number
  lastTradeAt:  string
  createdAt:    string
  policyHash:   string
  sparkline:    number[]
}

export const MOCK_AGENTS: MockAgent[] = [
  {
    id:          'agent_eth_001',
    name:        'ETH Conservative Buyer',
    strategy:    'Mean Reversion',
    status:      'active',
    protocol:    'Merchant Moe',
    pnl24h:      318.45,
    pnlPct:      2.57,
    trades24h:   8,
    capitalUsd:  50_000,
    riskScore:   18,
    lastTradeAt: '2 min ago',
    createdAt:   '2026-04-01',
    policyHash:  '0x8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c',
    sparkline:   [10, 12, 11, 14, 13, 16, 18, 17, 20, 22, 21, 24, 26, 28, 27, 30],
  },
  {
    id:          'agent_yield_002',
    name:        'Stable Yield Farmer',
    strategy:    'Yield',
    status:      'active',
    protocol:    'Agni Finance',
    pnl24h:       42.30,
    pnlPct:       0.23,
    trades24h:    1,
    capitalUsd:  30_000,
    riskScore:    8,
    lastTradeAt: '1 hr ago',
    createdAt:   '2026-03-15',
    policyHash:  '0x2b4c8d1a3e5f7b9c0d2e4f6a8b0c2e4f',
    sparkline:   [10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16],
  },
  {
    id:          'agent_mnt_003',
    name:        'MNT DCA Strategy',
    strategy:    'DCA',
    status:      'active',
    protocol:    'Fluxion',
    pnl24h:       95.60,
    pnlPct:       2.99,
    trades24h:    1,
    capitalUsd:  10_000,
    riskScore:   15,
    lastTradeAt: '6 hr ago',
    createdAt:   '2026-03-01',
    policyHash:  '0x6d8f2b4c1a3e5f7b9c0d2e4f6a8b0c2e',
    sparkline:   [10, 11, 13, 12, 14, 15, 17, 18, 17, 19, 21, 20, 22, 24, 25, 27],
  },
  {
    id:          'agent_arb_004',
    name:        'Arb Scanner Alpha',
    strategy:    'Arbitrage',
    status:      'paused',
    protocol:    'Multi-DEX',
    pnl24h:        0,
    pnlPct:        0,
    trades24h:     0,
    capitalUsd:  20_000,
    riskScore:   42,
    lastTradeAt: '3 days ago',
    createdAt:   '2026-04-10',
    policyHash:  '0x0000000000000000000000000000000000',
    sparkline:   [10, 12, 14, 13, 15, 14, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14],
  },
  {
    id:          'agent_btc_005',
    name:        'BTC Momentum Rider',
    strategy:    'Momentum',
    status:      'active',
    protocol:    'Merchant Moe',
    pnl24h:      218.40,
    pnlPct:      1.12,
    trades24h:   3,
    capitalUsd:  25_000,
    riskScore:   34,
    lastTradeAt: '12 min ago',
    createdAt:   '2026-02-18',
    policyHash:  '0xf0e1d2c3b4a5968778695a4b3c2d1e0f',
    sparkline:   [10, 11, 13, 14, 13, 15, 16, 18, 19, 21, 22, 24, 23, 26, 28, 30],
  },
  {
    id:          'agent_archive_006',
    name:        'Q1 Yield Archive',
    strategy:    'Yield',
    status:      'stopped',
    protocol:    'Agni Finance',
    pnl24h:        0,
    pnlPct:        0,
    trades24h:     0,
    capitalUsd:  50_000,
    riskScore:    5,
    lastTradeAt: '14 days ago',
    createdAt:   '2026-01-02',
    policyHash:  '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    sparkline:   [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 20, 20, 20, 20, 20],
  },
]
