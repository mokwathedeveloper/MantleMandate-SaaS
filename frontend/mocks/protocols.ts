// Mock protocol integrations

export type ProtocolStatus = 'active' | 'beta' | 'disabled'

export interface MockProtocol {
  id:           string
  name:         string
  category:     string
  network:      string
  tvlUsd:       number
  routedVolume: number
  status:       ProtocolStatus
  feesBps:      number
  agents:       number
  description:  string
  health:       number
}

export const MOCK_PROTOCOLS: MockProtocol[] = [
  {
    id:           'p_moe',
    name:         'Merchant Moe',
    category:     'DEX (CLAMM)',
    network:      'Mantle',
    tvlUsd:       62_800_000,
    routedVolume: 18_410_220,
    status:       'active',
    feesBps:      30,
    agents:       7,
    description:  'Concentrated liquidity DEX, primary spot routing on Mantle.',
    health:       97,
  },
  {
    id:           'p_agni',
    name:         'Agni Finance',
    category:     'DEX (Stable)',
    network:      'Mantle',
    tvlUsd:       41_220_000,
    routedVolume:  9_212_000,
    status:       'active',
    feesBps:       8,
    agents:        4,
    description:  'Stable-pair AMM optimized for low slippage USDC/USDT.',
    health:       95,
  },
  {
    id:           'p_fluxion',
    name:         'Fluxion',
    category:     'Aggregator',
    network:      'Mantle',
    tvlUsd:       12_400_000,
    routedVolume:  3_812_500,
    status:       'active',
    feesBps:      14,
    agents:       3,
    description:  'Routing aggregator for best-execution across Mantle DEXs.',
    health:       91,
  },
  {
    id:           'p_init',
    name:         'INIT Capital',
    category:     'Lending',
    network:      'Mantle',
    tvlUsd:       28_700_000,
    routedVolume:  1_412_300,
    status:       'beta',
    feesBps:       0,
    agents:       1,
    description:  'Modular lending — used for collateral leg of yield strategies.',
    health:       82,
  },
  {
    id:           'p_lendle',
    name:         'Lendle',
    category:     'Lending',
    network:      'Mantle',
    tvlUsd:       54_900_000,
    routedVolume:  2_010_400,
    status:       'active',
    feesBps:       0,
    agents:       2,
    description:  'Money-market protocol on Mantle. Used for stable-yield agents.',
    health:       94,
  },
  {
    id:           'p_pendle',
    name:         'Pendle',
    category:     'Yield Tokenization',
    network:      'Mantle',
    tvlUsd:       19_300_000,
    routedVolume:    615_000,
    status:       'beta',
    feesBps:       5,
    agents:       0,
    description:  'Yield tokenization — research integration.',
    health:       78,
  },
]

export const PROTOCOL_KPIS = {
  active:       { value: 4,                 deltaText: '2 in beta' },
  totalTvl:     { value: 219_320_000,       deltaPct: 5.2,  deltaText: '+5.2% vs prev. period' },
  routedVolume: { value:  35_473_420,       deltaPct: 8.7,  deltaText: '+8.7% vs prev. period' },
  bestExecRate: { value: 96.4,              unit: '%', deltaText: '+0.6% vs prev. period' },
}
