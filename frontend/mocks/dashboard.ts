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
