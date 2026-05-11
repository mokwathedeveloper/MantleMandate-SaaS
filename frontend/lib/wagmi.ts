import { createConfig, http } from 'wagmi'
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const mantleMainnet = defineChain({
  id: 5000,
  name: 'Mantle',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://explorer.mantle.xyz' },
  },
})

export const mantleTestnet = defineChain({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Testnet Explorer', url: 'https://explorer.sepolia.mantle.xyz' },
  },
  testnet: true,
})

// Singleton — created once, avoids WalletConnect duplicate-init warnings
let _config: ReturnType<typeof createConfig> | null = null

export function getWagmiConfig() {
  if (_config) return _config
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''
  const connectors = [
    injected(),
    coinbaseWallet({ appName: 'MantleMandate' }),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ]
  _config = createConfig({
    chains:     [mantleTestnet, mantleMainnet],
    connectors,
    ssr:        true,
    transports: {
      [mantleMainnet.id]: http(),
      [mantleTestnet.id]: http(),
    },
  })
  return _config
}
