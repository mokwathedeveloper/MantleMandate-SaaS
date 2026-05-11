'use client'

import { useCallback } from 'react'
import { useConnect, useDisconnect, useAccount } from 'wagmi'

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase'

export function useWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, isPending, connectors } = useConnect()
  const { disconnect }                     = useDisconnect()

  const connectWallet = useCallback(
    (walletType: WalletType) => {
      const connector = connectors.find(c => {
        if (walletType === 'metamask')      return c.id === 'injected' || c.id === 'metaMask'
        if (walletType === 'coinbase')      return c.id === 'coinbaseWalletSDK'
        if (walletType === 'walletconnect') return c.id === 'walletConnect'
        return false
      })
      if (!connector) return
      connect({ connector })
    },
    [connect, connectors],
  )

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null

  return {
    address:          address ?? null,
    chainId:          chainId ?? null,
    isConnected,
    isConnecting:     isPending,
    walletType:       null as WalletType | null,
    connect:          connectWallet,
    disconnect,
    truncatedAddress,
  }
}
