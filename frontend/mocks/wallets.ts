// Mock wallet data

export type WalletStatus = 'connected' | 'pending' | 'revoked'
export type WalletKind   = 'EOA' | 'Multisig' | 'Smart Account'

export interface MockWallet {
  id:          string
  label:       string
  address:     string
  kind:        WalletKind
  network:     string
  balanceUsd:  number
  status:      WalletStatus
  signers:     number
  threshold?:  number
  agents:      number
  lastActive:  string
  createdAt:   string
}

export const MOCK_WALLETS: MockWallet[] = [
  {
    id:         'w_001',
    label:      'Treasury — Primary',
    address:    '0x4A8c7e1B0a92b3D4Eb5F9c0d1e2F3a4B5c8F2',
    kind:       'Multisig',
    network:    'Mantle',
    balanceUsd: 1_842_310.55,
    status:     'connected',
    signers:    5,
    threshold:  3,
    agents:     6,
    lastActive: '2 min ago',
    createdAt:  '2025-08-12',
  },
  {
    id:         'w_002',
    label:      'Strategy — DCA',
    address:    '0x9b2A7Cf6...a1031Ed5',
    kind:       'Smart Account',
    network:    'Mantle',
    balanceUsd:   614_280.00,
    status:     'connected',
    signers:    1,
    agents:     2,
    lastActive: '14 min ago',
    createdAt:  '2025-09-04',
  },
  {
    id:         'w_003',
    label:      'Yield Vault',
    address:    '0x12fA8e9D2c4b7E2',
    kind:       'EOA',
    network:    'Mantle',
    balanceUsd:   312_790.42,
    status:     'connected',
    signers:    1,
    agents:     1,
    lastActive: '1 h ago',
    createdAt:  '2025-10-21',
  },
  {
    id:         'w_004',
    label:      'Test — Mantle Sepolia',
    address:    '0x77AeC9c3cE19',
    kind:       'EOA',
    network:    'Mantle Sepolia',
    balanceUsd:    14_220.18,
    status:     'connected',
    signers:    1,
    agents:     0,
    lastActive: '3 h ago',
    createdAt:  '2026-04-02',
  },
  {
    id:         'w_005',
    label:      'Cold Reserve',
    address:    '0xfA31Ad702d402',
    kind:       'Multisig',
    network:    'Ethereum',
    balanceUsd: 4_120_000.00,
    status:     'connected',
    signers:    7,
    threshold:  5,
    agents:     0,
    lastActive: '2 days ago',
    createdAt:  '2025-07-08',
  },
  {
    id:         'w_006',
    label:      'Pending Hot Wallet',
    address:    '0x6B17cc40fA8b',
    kind:       'EOA',
    network:    'Mantle',
    balanceUsd:         0,
    status:     'pending',
    signers:    1,
    agents:     0,
    lastActive: '—',
    createdAt:  '2026-05-06',
  },
]

export const WALLET_KPIS = {
  totalCustody:     { value: 6_903_601, deltaPct: 4.1, deltaText: '+4.1% vs prev. period' },
  connected:        { value: 5,         deltaText: '1 pending review' },
  multisigCoverage: { value: 78,        unit: '%', deltaText: 'of treasury under multisig' },
  signerKeys:       { value: 17,        deltaText: 'across 6 wallets' },
}
