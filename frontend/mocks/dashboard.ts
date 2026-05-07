// Mock data backing the populated dashboard

export const DASHBOARD_KPIS = {
  portfolioValue: { value: 2_847_120, deltaPct: 7.84,  deltaText: '+$208,471 (7.84%) all time' },
  pnl24h:         { value:    14_280, deltaPct: 0.51,  deltaText: '+$14,280 today (+0.51%)' },
  activeAgents:   { value:        12, deltaText: 'of 18 agents running' },
  totalTrades:    { value:     8_412, deltaText: '+152 in last 24h' },
  drawdown:       { value: -2.31,     deltaText: 'within healthy range' },
}

export const DASHBOARD_PNL_30D = [
  { date: '2026-04-08', value: 2_640_000 },
  { date: '2026-04-09', value: 2_651_300 },
  { date: '2026-04-10', value: 2_644_700 },
  { date: '2026-04-11', value: 2_661_900 },
  { date: '2026-04-12', value: 2_668_500 },
  { date: '2026-04-13', value: 2_652_400 },
  { date: '2026-04-14', value: 2_679_800 },
  { date: '2026-04-15', value: 2_701_700 },
  { date: '2026-04-16', value: 2_695_300 },
  { date: '2026-04-17', value: 2_710_200 },
  { date: '2026-04-18', value: 2_726_900 },
  { date: '2026-04-19', value: 2_741_100 },
  { date: '2026-04-20', value: 2_730_500 },
  { date: '2026-04-21', value: 2_751_600 },
  { date: '2026-04-22', value: 2_768_300 },
  { date: '2026-04-23', value: 2_756_900 },
  { date: '2026-04-24', value: 2_775_200 },
  { date: '2026-04-25', value: 2_780_900 },
  { date: '2026-04-26', value: 2_792_400 },
  { date: '2026-04-27', value: 2_786_100 },
  { date: '2026-04-28', value: 2_805_800 },
  { date: '2026-04-29', value: 2_811_700 },
  { date: '2026-04-30', value: 2_818_400 },
  { date: '2026-05-01', value: 2_801_900 },
  { date: '2026-05-02', value: 2_822_500 },
  { date: '2026-05-03', value: 2_829_700 },
  { date: '2026-05-04', value: 2_834_100 },
  { date: '2026-05-05', value: 2_839_800 },
  { date: '2026-05-06', value: 2_843_200 },
  { date: '2026-05-07', value: 2_847_120 },
]

export interface DashboardTrade {
  id:        string
  pair:      string
  side:      'BUY' | 'SELL'
  amountUsd: number
  pnl:       number | null
  protocol:  string
  status:    'success' | 'pending' | 'failed'
  txHash:    string
  time:      string
}

export const DASHBOARD_RECENT_TRADES: DashboardTrade[] = [
  { id: 't1', pair: 'ETH/USDC',  side: 'BUY',  amountUsd:  4_200, pnl:  318.45, protocol: 'Merchant Moe', status: 'success', txHash: '0x3f8a2b1c...8f9a', time: '2 min ago'  },
  { id: 't2', pair: 'ETH/USDC',  side: 'SELL', amountUsd:  4_518, pnl:  206.78, protocol: 'Merchant Moe', status: 'success', txHash: '0xa1b2c3d4...a9b0', time: '5 min ago'  },
  { id: 't3', pair: 'USDC/USDT', side: 'BUY',  amountUsd: 10_000, pnl:   42.30, protocol: 'Agni Finance', status: 'success', txHash: '0xb2c3d4e5...b0c1', time: '12 min ago' },
  { id: 't4', pair: 'MNT/USDC',  side: 'BUY',  amountUsd:    500, pnl:   12.50, protocol: 'Fluxion',      status: 'success', txHash: '0xc3d4e5f6...c1d2', time: '17 min ago' },
  { id: 't5', pair: 'WBTC/USDC', side: 'BUY',  amountUsd:  2_100, pnl:    null, protocol: 'Merchant Moe', status: 'pending', txHash: '0xd4e5f6a7...d2e3', time: '21 min ago' },
  { id: 't6', pair: 'ETH/USDT',  side: 'SELL', amountUsd:  7_200, pnl:  -74.20, protocol: 'Agni Finance', status: 'failed',  txHash: '0xe5f6a7b8...e3f4', time: '34 min ago' },
]

export const DASHBOARD_ALERTS = [
  { id: 'al1', severity: 'warning' as const, title: 'Gas spike detected on Mantle',         message: 'Fees up 32% in last 10 min — agents will defer non-urgent trades.', time: '4 min ago'  },
  { id: 'al2', severity: 'info'    as const, title: 'New protocol: Fusionswap is live',     message: 'Available for routing. Add to allow-list to enable.',              time: '32 min ago' },
  { id: 'al3', severity: 'success' as const, title: 'Audit verification complete',          message: 'All 12 active mandates passed compliance review.',                 time: '2 h ago'    },
]

export const DASHBOARD_QUICK_ACTIONS = [
  { id: 'qa1', label: 'New Mandate',  icon: 'FilePlus2',   href: '/dashboard/mandates/new' },
  { id: 'qa2', label: 'Run Audit',    icon: 'ShieldCheck', href: '/dashboard/audit'        },
  { id: 'qa3', label: 'View Trades',  icon: 'Zap',         href: '/dashboard/trades'       },
  { id: 'qa4', label: 'Risk Report',  icon: 'Gauge',       href: '/dashboard/risk'         },
]

export const DASHBOARD_RISK_SUMMARY = {
  score:       23,
  scale:       100,
  level:       'Low Risk' as const,
  drivers: [
    { label: 'Concentration risk',   value: 'Low'    },
    { label: 'Liquidity depth',      value: 'Healthy'},
    { label: 'Volatility (30d)',     value: 'Normal' },
    { label: 'Counterparty exposure',value: 'Low'    },
  ],
}
