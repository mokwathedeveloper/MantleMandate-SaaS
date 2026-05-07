// Mock on-chain audit events

export type AuditEventType =
  | 'mandate_created'
  | 'mandate_updated'
  | 'agent_deployed'
  | 'agent_paused'
  | 'trade_executed'
  | 'trade_failed'
  | 'wallet_connected'
  | 'policy_violation'
  | 'permission_changed'

export type AuditOutcome = 'success' | 'failed' | 'review'

export interface MockAuditEvent {
  id:        string
  type:      AuditEventType
  actor:     string
  subject:   string
  outcome:   AuditOutcome
  txHash:    string | null
  block:     number | null
  gasUsed?:  number
  policyHash:string | null
  timestamp: string
  details:   string
}

export const MOCK_AUDIT_EVENTS: MockAuditEvent[] = [
  {
    id:         'au_001',
    type:       'trade_executed',
    actor:      'Agent: ETH Conservative Buyer',
    subject:    'ETH/USDC 4,200 USDC',
    outcome:    'success',
    txHash:     '0x3f8a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    block:      8_412_330,
    gasUsed:    142_580,
    policyHash: '0x8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c',
    timestamp:  '2 min ago',
    details:    'RSI signal triggered, entry within risk band',
  },
  {
    id:         'au_002',
    type:       'mandate_created',
    actor:      'Amara Okafor',
    subject:    'New mandate: ETH Conservative Buyer',
    outcome:    'success',
    txHash:     '0x9b2A7Cf6e1F2d3c4b5a69788776a5b4c3d2e1f0a',
    block:      8_412_310,
    gasUsed:    218_410,
    policyHash: '0x8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c',
    timestamp:  '14 min ago',
    details:    'Policy hash committed on-chain',
  },
  {
    id:         'au_003',
    type:       'agent_paused',
    actor:      'Noah Kim',
    subject:    'Agent: Arb Scanner Alpha',
    outcome:    'success',
    txHash:     '0x12fA8e9D2c4b7E2dC4b5a69788776a5b4c3d2e1f',
    block:      8_412_205,
    gasUsed:     63_120,
    policyHash: null,
    timestamp:  '32 min ago',
    details:    'Manual pause requested by mandate owner',
  },
  {
    id:         'au_004',
    type:       'policy_violation',
    actor:      'Risk Engine',
    subject:    'Agent: BTC Momentum Rider',
    outcome:    'review',
    txHash:     null,
    block:      null,
    policyHash: '0xf0e1d2c3b4a5968778695a4b3c2d1e0f',
    timestamp:  '1 h ago',
    details:    'Position size exceeds 12% of mandate cap — held for review',
  },
  {
    id:         'au_005',
    type:       'trade_failed',
    actor:      'Agent: BTC Momentum Rider',
    subject:    'WBTC/USDC 2,100 USDC',
    outcome:    'failed',
    txHash:     '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
    block:      8_412_001,
    gasUsed:     32_140,
    policyHash: '0xf0e1d2c3b4a5968778695a4b3c2d1e0f',
    timestamp:  '2 h ago',
    details:    'Slippage tolerance exceeded, transaction reverted',
  },
  {
    id:         'au_006',
    type:       'wallet_connected',
    actor:      'Treasury Operator',
    subject:    'Multisig 0x4A8c…c8F2',
    outcome:    'success',
    txHash:     '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    block:      8_411_880,
    gasUsed:    105_770,
    policyHash: null,
    timestamp:  '4 h ago',
    details:    '5/3 multisig connected for treasury operations',
  },
  {
    id:         'au_007',
    type:       'permission_changed',
    actor:      'Priya Shah',
    subject:    'Wallet: Strategy — DCA',
    outcome:    'success',
    txHash:     '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    block:      8_411_502,
    gasUsed:     54_220,
    policyHash: null,
    timestamp:  '6 h ago',
    details:    'Spend limit raised to 25,000 USDC / day',
  },
]
