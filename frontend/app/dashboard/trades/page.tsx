'use client'

import { useState } from 'react'
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTrades } from '@/hooks/useTrades'
import { formatCurrency, truncateAddress } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/components/ui/Badge'

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  success: 'success',
  failed:  'error',
  pending: 'warning',
}

const PROTOCOL_LABELS: Record<string, string> = {
  merchant_moe: 'Merchant Moe',
  agni:         'Agni Finance',
  fluxion:      'Fluxion',
}

type Filter = { status?: string; direction?: string }

function FilterButton({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
        active
          ? 'bg-primary text-white'
          : 'bg-surface text-text-secondary border border-border hover:border-text-secondary',
      )}
    >
      {label}
    </button>
  )
}

export default function TradesPage() {
  const [page,   setPage]   = useState(1)
  const [filter, setFilter] = useState<Filter>({})

  const { data, isLoading } = useTrades({
    page,
    per_page: 25,
    status:   filter.status,
  })

  const trades      = data?.data ?? []
  const totalPages  = data?.total_pages ?? 1
  const totalTrades = data?.total ?? 0

  const toggleStatus = (s: string) =>
    setFilter((f) => ({ ...f, status: f.status === s ? undefined : s }))
  const toggleDir = (d: string) =>
    setFilter((f) => ({ ...f, direction: f.direction === d ? undefined : d }))

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Trades</h1>
        <p className="text-sm text-text-secondary mt-0.5">{totalTrades} total trades</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterButton label="All"     active={!filter.status}              onClick={() => setFilter({})} />
        <FilterButton label="Success" active={filter.status === 'success'} onClick={() => toggleStatus('success')} />
        <FilterButton label="Failed"  active={filter.status === 'failed'}  onClick={() => toggleStatus('failed')} />
        <FilterButton label="Pending" active={filter.status === 'pending'} onClick={() => toggleStatus('pending')} />
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <FilterButton label="Buys"  active={filter.direction === 'buy'}  onClick={() => toggleDir('buy')} />
        <FilterButton label="Sells" active={filter.direction === 'sell'} onClick={() => toggleDir('sell')} />
      </div>

      <Card padding="none">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <Activity className="h-12 w-12 text-text-secondary opacity-40" />
            <p className="text-base font-semibold text-text-primary">No trades found</p>
            <p className="text-sm text-text-secondary">
              {Object.keys(filter).length > 0 ? 'Try clearing the filters' : 'Deploy an agent to start trading'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-text-secondary bg-surface/50">
                  <th className="px-4 py-3 text-left font-medium">Pair</th>
                  <th className="px-4 py-3 text-left font-medium">Direction</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">P&L</th>
                  <th className="px-4 py-3 text-left font-medium">Protocol</th>
                  <th className="px-4 py-3 text-left font-medium">TX Hash</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">{t.assetPair}</td>
                    <td className={cn('px-4 py-3 font-semibold uppercase',
                      t.direction === 'buy' ? 'text-success' : 'text-error'
                    )}>
                      {t.direction}
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary tabular-nums">
                      {formatCurrency(t.amountUsd)}
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary tabular-nums">
                      ${t.price.toFixed(4)}
                    </td>
                    <td className={cn('px-4 py-3 text-right font-semibold tabular-nums',
                      t.pnl == null ? 'text-text-secondary' :
                      t.pnl >= 0   ? 'text-success' : 'text-error'
                    )}>
                      {t.pnl != null ? formatCurrency(t.pnl) : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {PROTOCOL_LABELS[t.protocol] ?? t.protocol}
                    </td>
                    <td className="px-4 py-3">
                      {t.txHash ? (
                        <span className="font-mono-data text-text-secondary">
                          {truncateAddress(t.txHash, 5)}
                        </span>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary" size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <Button
                variant="secondary" size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
