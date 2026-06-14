export type WalletStatus = 'connected' | 'pending' | 'revoked'
export type WalletKind   = 'EOA' | 'Multisig' | 'Smart Account'

export interface WalletInfo {
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
