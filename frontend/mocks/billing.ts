// Mock billing data

export interface MockInvoice {
  id:       string
  number:   string
  date:     string
  amount:   number
  status:   'paid' | 'pending' | 'failed'
  plan:     string
  period:   string
  download: string
}

export const MOCK_INVOICES: MockInvoice[] = [
  { id: 'inv_001', number: 'INV-2026-005', date: '2026-05-01', amount: 499, status: 'paid',    plan: 'Strategist',    period: 'May 2026',   download: '#' },
  { id: 'inv_002', number: 'INV-2026-004', date: '2026-04-01', amount: 499, status: 'paid',    plan: 'Strategist',    period: 'Apr 2026',   download: '#' },
  { id: 'inv_003', number: 'INV-2026-003', date: '2026-03-01', amount: 499, status: 'paid',    plan: 'Strategist',    period: 'Mar 2026',   download: '#' },
  { id: 'inv_004', number: 'INV-2026-002', date: '2026-02-01', amount: 199, status: 'paid',    plan: 'Operator',      period: 'Feb 2026',   download: '#' },
  { id: 'inv_005', number: 'INV-2026-001', date: '2026-01-01', amount: 199, status: 'paid',    plan: 'Operator',      period: 'Jan 2026',   download: '#' },
]

export const BILLING_KPIS = {
  currentPlan:   { value: 'Strategist',     deltaText: 'Renews on Jun 1, 2026' },
  thisMonth:     { value: 499,              deltaText: 'Includes 15 active agents' },
  agentsBilled:  { value: 12,               deltaText: 'of 18 deployed' },
  ytdSpend:      { value: 1_895,            deltaText: '5 invoices YTD' },
}

export const PLANS = [
  {
    id:       'operator',
    name:     'Operator',
    price:    199,
    period:   'mo',
    features: [
      'Up to 5 concurrent agents',
      'Standard risk engine',
      '5 monitored protocols',
      'Email alerts',
    ],
    isCurrent: false,
  },
  {
    id:       'strategist',
    name:     'Strategist',
    price:    499,
    period:   'mo',
    features: [
      'Up to 25 concurrent agents',
      'Advanced risk engine + scenarios',
      'All protocols + private routing',
      'Real-time alerts (Slack, email, webhook)',
      'On-chain audit export',
    ],
    isCurrent: true,
  },
  {
    id:       'institutional',
    name:     'Institutional',
    price:    'Custom',
    period:   '',
    features: [
      'Unlimited agents + multi-tenant',
      'SOC 2 + custom compliance',
      'Dedicated venue routing',
      '24/7 incident response',
      'Custom reporting + SLAs',
    ],
    isCurrent: false,
  },
]
