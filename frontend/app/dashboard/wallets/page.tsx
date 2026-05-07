'use client'

import { useMemo, useState } from 'react'
import {
  Plus, ExternalLink, KeyRound, Wallet, Copy, ShieldCheck, Coins,
} from 'lucide-react'

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

export default function WalletsPage() {
  const [search, setSearch] = useState('')
  const [kind, setKind]     = useState<'all' | WalletKind>('all')

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
    <div className="px-6 pt-8 pb-10 space-y-6">
      <PageHeader
        breadcrumb="USER MANAGEMENT"
        title="Wallets"
        subtitle="Treasury wallets, multisigs, and signer keys connected to MantleMandate. Each wallet inherits its mandate's policy."
        actions={
          <>
            <PrimaryButton variant="secondary" icon={<ShieldCheck className="h-4 w-4" />}>
              Audit Permissions
            </PrimaryButton>
            <PrimaryButton variant="primary" icon={<Plus className="h-4 w-4" />}>
              Connect Wallet
            </PrimaryButton>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
  )
}
