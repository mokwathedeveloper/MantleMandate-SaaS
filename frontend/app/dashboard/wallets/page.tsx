'use client'

import { useMemo, useState } from 'react'
import {
  Plus, ExternalLink, KeyRound, Wallet, Copy, ShieldCheck, Coins,
  X, CheckCircle2, Loader2, AlertTriangle,
} from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'
import { cn } from '@/lib/utils'

import { PageHeader } from '@/components/ui/PageHeader'
import { MetricCard } from '@/components/ui/MetricCard'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterButton } from '@/components/ui/FilterButton'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'

import { MOCK_WALLETS, WALLET_KPIS, type MockWallet, type WalletKind } from '@/mocks/wallets'
import { formatCurrency } from '@/lib/utils'

const KIND_FILTERS: Array<{ key: 'all' | WalletKind; label: string }> = [
  { key: 'all',           label: 'All' },
  { key: 'EOA',           label: 'EOA' },
  { key: 'Multisig',      label: 'Multisig' },
  { key: 'Smart Account', label: 'Smart Account' },
]

// ── Connect Wallet Modal ──────────────────────────────────────────────────────

const WALLET_OPTIONS = [
  {
    id: 'metamask' as const,
    name: 'MetaMask',
    description: 'Browser extension wallet',
    icon: '🦊',
  },
  {
    id: 'coinbase' as const,
    name: 'Coinbase Wallet',
    description: 'Coinbase mobile or extension',
    icon: '🔵',
  },
  {
    id: 'walletconnect' as const,
    name: 'WalletConnect',
    description: 'Scan with any mobile wallet',
    icon: '🔗',
  },
]

function ConnectWalletModal({ onClose }: { onClose: () => void }) {
  const { connect, isConnecting, isConnected, address, chainId, truncatedAddress, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const hasEthereum = typeof window !== 'undefined' &&
    !!(window as Window & { ethereum?: unknown }).ethereum

  const handleConnect = async (id: typeof WALLET_OPTIONS[number]['id']) => {
    setError(null)
    try {
      await connect(id)
    } catch {
      setError('Connection rejected or wallet not available.')
    }
  }

  const handleCopy = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed z-50 w-[calc(100vw-2rem)] max-w-[400px] rounded-xl overflow-hidden shadow-2xl"
        style={{
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#161B22', border: '1px solid #21262D',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: '#1C2128', borderBottom: '1px solid #21262D' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-[13px] font-semibold text-text-primary">
              {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {isConnected ? (
            /* ── Connected state ── */
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="h-14 w-14 rounded-full bg-success/15 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Connected</p>
                  <p className="text-xs text-text-secondary mt-1">Mantle Network · Chain ID {chainId ?? 5000}</p>
                </div>
              </div>

              {/* Address */}
              <div
                className="flex items-center justify-between gap-2 rounded-md px-3 py-2.5"
                style={{ background: '#0D1117', border: '1px solid #30363D' }}
              >
                <span className="font-mono text-[12px] text-text-primary">{truncatedAddress}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-primary hover:text-primary-hover transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => { disconnect(); onClose() }}
                  className="px-4 py-2 rounded-md border border-error/40 text-xs text-error hover:bg-error/10 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            /* ── Wallet picker ── */
            <div className="space-y-3">
              {!hasEthereum && (
                <div
                  className="flex items-start gap-2 rounded-md p-3"
                  style={{ background: 'rgba(245,199,66,0.08)', border: '1px solid rgba(245,199,66,0.3)' }}
                >
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-[11px] text-warning leading-relaxed">
                    No wallet extension detected. Install MetaMask or Coinbase Wallet to connect.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-xs text-error px-1">{error}</p>
              )}

              <p className="text-xs text-text-secondary px-1">Choose your wallet provider:</p>

              <div className="space-y-2">
                {WALLET_OPTIONS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleConnect(w.id)}
                    disabled={isConnecting}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors text-left',
                      'border-border hover:border-primary/50 hover:bg-primary/5',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    )}
                  >
                    <span className="text-2xl leading-none">{w.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary">{w.name}</p>
                      <p className="text-[11px] text-text-secondary">{w.description}</p>
                    </div>
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                    ) : (
                      <span className="text-[11px] text-primary font-medium shrink-0">Connect →</span>
                    )}
                  </button>
                ))}
              </div>

              <p className="text-center text-[10px] text-text-disabled pt-1">
                Connects to Mantle Network (Chain ID: 5000)
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WalletsPage() {
  const [search, setSearch] = useState('')
  const [kind, setKind]     = useState<'all' | WalletKind>('all')
  const [showConnect, setShowConnect] = useState(false)

  const filtered = useMemo(() => {
    return MOCK_WALLETS.filter((w) => {
      if (kind !== 'all' && w.kind !== kind) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          w.label.toLowerCase().includes(q) ||
          w.address.toLowerCase().includes(q) ||
          w.network.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, kind])

  const columns: DataTableColumn<MockWallet>[] = [
    {
      key: 'wallet',
      header: 'Wallet',
      render: (w) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Wallet className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{w.label}</p>
            <p className="text-[11px] text-text-secondary">{w.network}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (w) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-text-secondary">
          {w.address}
          <Copy className="h-3 w-3 cursor-pointer hover:text-text-primary" />
          <ExternalLink className="h-3 w-3 cursor-pointer hover:text-text-primary" />
        </span>
      ),
    },
    {
      key: 'kind',
      header: 'Type',
      render: (w) => (
        <span className="inline-flex items-center rounded-md border border-border bg-page px-2 py-0.5 text-[11px] font-medium text-text-primary">
          {w.kind}
        </span>
      ),
    },
    {
      key: 'signers',
      header: 'Signers',
      render: (w) => (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-text-primary">
          <KeyRound className="h-3.5 w-3.5 text-text-disabled" />
          {w.threshold ? `${w.threshold} / ${w.signers}` : `${w.signers}`}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      render: (w) => (
        <span className="font-semibold text-[13px] text-text-primary tabular-nums">
          {formatCurrency(w.balanceUsd)}
        </span>
      ),
    },
    {
      key: 'agents',
      header: 'Agents',
      align: 'right',
      render: (w) => (
        <span className="text-[13px] text-text-primary">{w.agents}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (w) => <StatusBadge status={w.status === 'connected' ? 'connected' : w.status === 'pending' ? 'pending' : 'inactive'} />,
    },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (w) => <span className="text-[12px] text-text-secondary">{w.lastActive}</span>,
    },
  ]

  return (
    <>
    <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-8 sm:pb-10 space-y-6">
      <PageHeader
        breadcrumb="USER MANAGEMENT"
        title="Wallets"
        subtitle="Treasury wallets, multisigs, and signer keys connected to MantleMandate. Each wallet inherits its mandate's policy."
        actions={
          <>
            <PrimaryButton variant="secondary" icon={<ShieldCheck className="h-4 w-4" />}>
              Audit Permissions
            </PrimaryButton>
            <PrimaryButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowConnect(true)}>
              Connect Wallet
            </PrimaryButton>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Custody"
          value={formatCurrency(WALLET_KPIS.totalCustody.value)}
          delta={WALLET_KPIS.totalCustody.deltaText}
          deltaTone="positive"
          icon={<Coins className="h-4 w-4" />}
        />
        <MetricCard
          label="Connected"
          value={WALLET_KPIS.connected.value.toString()}
          delta={WALLET_KPIS.connected.deltaText}
          deltaTone="neutral"
          icon={<Wallet className="h-4 w-4" />}
        />
        <MetricCard
          label="Multisig Coverage"
          value={WALLET_KPIS.multisigCoverage.value.toString()}
          unit="%"
          delta={WALLET_KPIS.multisigCoverage.deltaText}
          deltaTone="neutral"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <MetricCard
          label="Signer Keys"
          value={WALLET_KPIS.signerKeys.value.toString()}
          delta={WALLET_KPIS.signerKeys.deltaText}
          deltaTone="neutral"
          icon={<KeyRound className="h-4 w-4" />}
        />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by label, address, or network…"
          className="flex-1 max-w-2xl"
        />
        <div className="flex flex-wrap items-center gap-2">
          {KIND_FILTERS.map((k) => (
            <FilterButton key={k.key} active={kind === k.key} onClick={() => setKind(k.key)}>
              {k.label}
            </FilterButton>
          ))}
        </div>
      </div>

      <SectionCard
        title="Connected Wallets"
        subtitle={`${filtered.length} of ${MOCK_WALLETS.length} wallets`}
        padding="none"
      >
        <div className="border-t border-border">
          <DataTable columns={columns} rows={filtered} rowKey={(w) => w.id} />
        </div>
      </SectionCard>
    </div>

    {showConnect && <ConnectWalletModal onClose={() => setShowConnect(false)} />}
    </>
  )
}
