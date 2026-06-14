'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ExternalLink, Copy, CheckCircle2, RefreshCw, X, ArrowLeftRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useSwapPoolStats } from '@/hooks/useOnChain'
import { SWAP_POOL_ADDRESS } from '@/lib/contracts'

// ── Constants ───────────────────────────────────────────────────────────────

const EXPLORER_ADDRESS_URL = `https://explorer.sepolia.mantle.xyz/address/${SWAP_POOL_ADDRESS}`
const EXPLORER_TX_BASE = 'https://explorer.sepolia.mantle.xyz/tx/'
const SWAP_PROTOCOL_ID = 'mantle-testnet-amm'

// ── Data ────────────────────────────────────────────────────────────────────

interface TradeRow {
  asset_pair: string
  direction: 'buy' | 'sell'
  amount_usd: number | null
  pnl: number | null
  protocol: string
  status: string
  tx_hash: string | null
  created_at: string
}

function useUserTrades() {
  const { user } = useAuthStore()
  return useQuery<TradeRow[]>({
    queryKey: ['protocols', 'trades'],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('trades')
        .select('asset_pair, direction, amount_usd, pnl, protocol, status, tx_hash, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error || !data) return []
      return data as TradeRow[]
    },
    enabled: !!user,
    staleTime: 30_000,
  })
}

function timeAgo(timestampMs: number): string {
  if (!timestampMs) return 'never'
  const diffMs = Date.now() - timestampMs
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

// ── Trade History Panel ────────────────────────────────────────────────────

function TradeHistoryPanel({ trades, onClose }: { trades: TradeRow[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex bg-black/60" onClick={onClose}>
      <div
        className="ml-auto h-full flex flex-col overflow-hidden w-full max-w-[480px] bg-card border-l border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">MockSwapPool — Trade History</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Close panel">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {trades.length === 0 ? (
            <p className="text-center py-12 text-sm text-text-disabled">
              No trades have been routed through MockSwapPool yet.
            </p>
          ) : (
            trades.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 text-xs border-b border-border last:border-b-0">
                <div>
                  <p className="text-text-primary font-medium">
                    {t.asset_pair} {t.direction === 'buy' ? 'Buy' : 'Sell'}
                  </p>
                  <p className="text-text-disabled mt-0.5">
                    {new Date(t.created_at).toLocaleString()} · {t.status}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn('font-semibold', (t.pnl ?? 0) >= 0 ? 'text-success' : 'text-error')}>
                    {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : '—'}
                  </p>
                  {t.tx_hash ? (
                    <a
                      href={`${EXPLORER_TX_BASE}${t.tx_hash}`}
                      target="_blank" rel="noreferrer"
                      className="text-text-link hover:opacity-70 transition-opacity inline-flex items-center gap-1 mt-0.5"
                    >
                      tx <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-text-disabled mt-0.5">no tx</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProtocolsPage() {
  const [showHistory, setShowHistory] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: poolStats, isLoading: poolLoading, isError: poolError, dataUpdatedAt, refetch, isFetching } = useSwapPoolStats()
  const { data: trades } = useUserTrades()

  const allTrades = useMemo(() => trades ?? [], [trades])
  const protocolTrades = useMemo(
    () => allTrades.filter(t => t.protocol === SWAP_PROTOCOL_ID),
    [allTrades]
  )

  const volumeThisProtocol = protocolTrades
    .filter(t => t.status === 'success')
    .reduce((s, t) => s + (t.amount_usd ?? 0), 0)

  const volumeAll = allTrades
    .filter(t => t.status === 'success')
    .reduce((s, t) => s + (t.amount_usd ?? 0), 0)

  const allocationPct = volumeAll > 0 ? Math.round((volumeThisProtocol / volumeAll) * 100) : 0

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {showHistory && <TradeHistoryPanel trades={protocolTrades} onClose={() => setShowHistory(false)} />}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Protocol Integration</h2>
          <p className="text-sm mt-0.5 text-text-secondary">
            MantleMandate agents execute swaps on Mantle Sepolia Testnet through a single on-chain venue.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm bg-card border border-border text-text-secondary hover:border-primary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          Refresh Reserves
        </button>
      </div>

      {/* ── MockSwapPool card ──────────────────────────────────────────────────── */}
      <div className="rounded-lg p-5 bg-card border border-border space-y-4 max-w-2xl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex items-center justify-center shrink-0 rounded-full"
              style={{ width: 44, height: 44, background: '#0D1A3A', border: '1px solid #5B8DF640' }}
            >
              <ArrowLeftRight className="h-5 w-5" style={{ color: '#5B8DF6' }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">MockSwapPool</p>
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                Primary Execution Venue
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 bg-success-bg text-success border border-success/20">
            ACTIVE
          </span>
        </div>

        <p className="text-xs leading-relaxed text-text-secondary">
          Minimal constant-product AMM (x·y=k, 0.3% fee) deployed by this project on Mantle Sepolia.
          Used by AI trading agents to execute real on-chain mUSD ⇄ mWETH swaps when Merchant Moe and
          Agni Finance have no testnet liquidity.
        </p>

        {/* Metrics 2x2 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Pool Reserves</p>
            <p className="text-sm font-semibold mt-0.5 text-text-primary">
              {poolError
                ? '—'
                : poolLoading
                  ? 'Loading…'
                  : `${poolStats?.reserveUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} mUSD / ${poolStats?.reserveWeth.toLocaleString(undefined, { maximumFractionDigits: 4 })} mWETH`}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Last Refreshed</p>
            <p className="text-sm font-semibold mt-0.5 text-text-primary">
              {poolError ? 'RPC unreachable' : timeAgo(dataUpdatedAt)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Your Volume Routed</p>
            <p className="text-sm font-semibold mt-0.5 text-text-primary">
              ${volumeThisProtocol.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Your Allocation</p>
            <p className="text-sm font-semibold mt-0.5 text-text-primary">
              {volumeAll > 0 ? `${allocationPct}%` : '—'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-text-disabled shrink-0">Contract:</span>
            <span className="text-xs font-mono truncate text-text-primary">{SWAP_POOL_ADDRESS}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(SWAP_POOL_ADDRESS)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="text-text-secondary hover:text-text-primary transition-colors shrink-0"
              aria-label="Copy address"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <a
              href={EXPLORER_ADDRESS_URL}
              target="_blank" rel="noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors shrink-0"
              aria-label="View on explorer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="px-2.5 py-1 text-xs rounded font-medium border border-border text-text-secondary hover:border-primary hover:text-text-primary transition-colors shrink-0"
          >
            Trade History ({protocolTrades.length})
          </button>
        </div>
      </div>

      {/* ── Summary footer ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 text-xs border-t border-border text-text-secondary">
        <span>
          1 protocol connected
          {!poolError && poolStats && ` · Pool reserves: ${poolStats.reserveUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} mUSD / ${poolStats.reserveWeth.toLocaleString(undefined, { maximumFractionDigits: 4 })} mWETH`}
          {' · '}Last refreshed: {poolError ? 'unavailable' : timeAgo(dataUpdatedAt)}
        </span>
        <a
          href={EXPLORER_ADDRESS_URL}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-text-link hover:opacity-70 transition-opacity"
        >
          View pool on explorer
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
