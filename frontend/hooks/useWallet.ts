'use client'

import { useState, useCallback } from 'react'

export interface WalletState {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  walletType: 'metamask' | 'walletconnect' | 'coinbase' | null
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address:      null,
    chainId:      null,
    isConnected:  false,
    isConnecting: false,
    walletType:   null,
  })

  const connect = useCallback(async (walletType: WalletState['walletType']) => {
    setState(s => ({ ...s, isConnecting: true }))
    try {
      if (typeof window === 'undefined') return
      const ethereum = (window as Window & { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum
      if (!ethereum) throw new Error('No wallet detected')
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      setState({
        address:      accounts[0] ?? null,
        chainId:      5000,
        isConnected:  true,
        isConnecting: false,
        walletType,
      })
    } catch {
      setState(s => ({ ...s, isConnecting: false }))
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({ address: null, chainId: null, isConnected: false, isConnecting: false, walletType: null })
  }, [])

  const truncatedAddress = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : null

  return { ...state, connect, disconnect, truncatedAddress }
}
