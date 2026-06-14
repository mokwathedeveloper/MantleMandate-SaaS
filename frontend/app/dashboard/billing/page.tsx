'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import type { Address } from 'viem'
import {
  Download, Copy, CheckCircle2, ExternalLink, TriangleAlert, Loader2, CreditCard, ArrowRight, Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { TokenIcon } from '@/components/ui/TokenIcon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TREASURY_ADDRESS } from '@/lib/contracts'
import { usePayTreasury } from '@/hooks/useOnChain'
import { useInvoices, type Invoice } from '@/hooks/useInvoices'

// Load QR code only client-side — qrcode.react uses browser APIs that fail during SSR
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((m) => m.QRCodeSVG),
  {
    ssr: false,
    loading: () => (
      <div className="h-[128px] w-[128px] bg-surface rounded animate-pulse flex items-center justify-center">
        <span className="text-[10px] text-text-disabled">Loading...</span>
      </div>
    ),
  }
)

const EXPLORER_TX_BASE = 'https://explorer.sepolia.mantle.xyz/tx/'

type PaymentTab    = 'card' | 'crypto'
type PurchasePlan  = 'operator' | 'strategist'

const PLAN_CONFIG: Record<string, { label: string; price: string; color: string }> = {
  operator:    { label: 'Operator Plan',    price: '$29',  color: 'text-text-secondary' },
  strategist:  { label: 'Strategist Plan',  price: '$99',  color: 'text-primary' },
  institution: { label: 'Institution Plan', price: '$299', color: 'text-warning' },
}

const PURCHASE_OPTIONS: { id: PurchasePlan; label: string; price: string }[] = [
  { id: 'operator',   label: 'Operator',   price: PLAN_CONFIG.operator.price },
  { id: 'strategist', label: 'Strategist', price: PLAN_CONFIG.strategist.price },
]

// Symbolic testnet amounts — verify-crypto accepts any positive MNT value as
// proof of payment since there's no MNT/USD price oracle on Mantle Sepolia.
const PLAN_MNT_PRICE: Record<PurchasePlan, string> = {
  operator:   '0.01',
  strategist: '0.03',
}

type CryptoStatus = 'idle' | 'paying' | 'confirming' | 'verifying' | 'success' | 'error'

function payButtonLabel(status: CryptoStatus, plan: PurchasePlan): string {
  if (status === 'paying') return 'Confirm in wallet…'
  if (status === 'confirming') return 'Waiting for confirmation on Mantle Sepolia…'
  return `Pay ${PLAN_MNT_PRICE[plan]} MNT with connected wallet`
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
    >
      {copied
        ? <CheckCircle2 className="h-3.5 w-3.5 text-success" />
        : <Copy className="h-3.5 w-3.5" />
      }
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ── ComingSoonTab ─────────────────────────────────────────────────────────────

function ComingSoonTab({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center border border-dashed border-border rounded-lg">
      <div className="h-12 w-12 rounded-full bg-surface flex items-center justify-center text-text-secondary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary mt-1 max-w-xs">{description}</p>
      </div>
      <span className="inline-flex items-center rounded-full bg-warning/10 text-warning text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
        Coming soon
      </span>
    </div>
  )
}

// ── CryptoTab ─────────────────────────────────────────────────────────────────

function CryptoTab({ onPaid }: { onPaid: (plan: PurchasePlan) => void }) {
  const [plan, setPlan]     = useState<PurchasePlan>('strategist')
  const [txHash, setTxHash] = useState('')
  const [status, setStatus] = useState<CryptoStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const { isConnected } = useAccount()
  const { pay, confirmed, reset: resetPay } = usePayTreasury()

  const verify = useCallback(async (hash: string) => {
    setStatus('verifying')
    setMessage(null)
    try {
      const res = await fetch('/api/billing/verify-crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: hash, plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Verification failed')
        return
      }
      setStatus('success')
      setMessage(`Payment of ${data.amount} ${data.currency} verified. Your plan is now ${plan === 'operator' ? 'Operator' : 'Strategist'}.`)
      onPaid(plan)
    } catch {
      setStatus('error')
      setMessage('Network error — please try again.')
    }
  }, [plan, onPaid])

  const handleVerify = () => verify(txHash)

  const handlePayWithWallet = async () => {
    setStatus('paying')
    setMessage(null)
    resetPay()
    try {
      const hash = await pay(TREASURY_ADDRESS as Address, PLAN_MNT_PRICE[plan])
      setTxHash(hash)
      setStatus('confirming')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Transaction was rejected or failed.')
    }
  }

  // Once the wallet-initiated payment is mined, verify it automatically.
  useEffect(() => {
    if (confirmed && txHash && status === 'confirming') {
      verify(txHash)
    }
  }, [confirmed, txHash, status, verify])

  if (!TREASURY_ADDRESS) {
    return (
      <ComingSoonTab
        icon={<TokenIcon symbol="MNT" size="md" />}
        title="Crypto payments aren't configured yet"
        description="The operator needs to set NEXT_PUBLIC_TREASURY_ADDRESS to a wallet they control before crypto payments can be verified."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-1">Pay with Crypto</p>
        <p className="text-xs text-text-disabled mb-3">
          Send MNT on Mantle Sepolia Testnet to the treasury address below, then verify your transaction
          to upgrade your plan.
        </p>

        {/* Plan selector */}
        <p className="text-xs font-medium text-text-secondary mb-2">Plan</p>
        <div className="flex gap-2">
          {PURCHASE_OPTIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={cn(
                'flex-1 py-2 text-sm rounded-md border transition-colors flex flex-col items-center gap-0.5',
                plan === p.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary hover:border-primary/60'
              )}
            >
              <span className="font-semibold">{p.label}</span>
              <span className="text-[10px] text-text-disabled">{p.price}/mo</span>
            </button>
          ))}
        </div>
      </div>

      {/* Treasury address card */}
      <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
        <p className="text-xs font-medium text-text-secondary">Send MNT to this address:</p>

        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-text-primary flex-1 break-all">
            {TREASURY_ADDRESS}
          </span>
          <CopyButton text={TREASURY_ADDRESS} label="Copy" />
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-lg inline-block">
            <QRCodeSVG
              value={TREASURY_ADDRESS}
              size={128}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 bg-warning/10 border border-warning/30 rounded-md p-3">
          <TriangleAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning leading-relaxed">
            Send only <strong>MNT</strong> on <strong>Mantle Sepolia Testnet</strong> to this address.
            Any positive amount is accepted as proof of payment for this testnet deployment.
          </p>
        </div>
      </div>

      {/* Pay with connected wallet */}
      <div className="space-y-2">
        <button
          onClick={handlePayWithWallet}
          disabled={!isConnected || status === 'paying' || status === 'confirming'}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-md transition-colors"
        >
          {(status === 'paying' || status === 'confirming') && <Loader2 className="h-4 w-4 animate-spin" />}
          <Wallet className="h-4 w-4" />
          {payButtonLabel(status, plan)}
        </button>
        {!isConnected && (
          <p className="text-xs text-text-disabled text-center">
            Connect your wallet (top right) to pay in one click — or send manually below.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] uppercase tracking-wider text-text-disabled">or pay manually</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Verify */}
      <div className="space-y-2 border border-border rounded-md p-4">
        <p className="text-xs font-medium text-text-secondary">Enter your transaction hash to verify:</p>
        <div className="flex gap-2">
          <input
            value={txHash}
            onChange={(e) => { setTxHash(e.target.value); setStatus('idle'); setMessage(null) }}
            placeholder="0x..."
            className="flex-1 bg-input border border-border rounded-md px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus:border-primary placeholder:text-text-disabled"
          />
          <button
            onClick={handleVerify}
            disabled={!txHash || status === 'verifying' || status === 'paying' || status === 'confirming'}
            className="px-3 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
          >
            {status === 'verifying' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Verify
          </button>
        </div>
        {txHash && (
          <a
            href={`${EXPLORER_TX_BASE}${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors w-fit"
          >
            <ExternalLink className="h-3 w-3" />
            View on Mantle Explorer
          </a>
        )}
        {status === 'success' && (
          <p className="text-xs text-success flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {message}
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs text-error">{message}</p>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<PaymentTab>('crypto')
  const addMethodRef = useRef<HTMLDivElement>(null)

  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices()
  const invoices = invoicesData ?? []

  const plan       = user?.plan ?? 'operator'
  const planConfig = PLAN_CONFIG[plan] ?? PLAN_CONFIG.operator

  const handlePaid = (newPlan: PurchasePlan) => {
    if (user) setUser({ ...user, plan: newPlan })
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
  }

  const goToCrypto = () => {
    setTab('crypto')
    addMethodRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const downloadInvoicesCsv = () => {
    const header = ['Date', 'Plan', 'Amount', 'Currency', 'Method', 'Status', 'Tx Hash']
    const rows = invoices.map((inv) => [
      new Date(inv.createdAt).toISOString(),
      inv.plan, String(inv.amount), inv.currency, inv.paymentMethod, inv.status, inv.txHash ?? '',
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Payment Methods &amp; Billing</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Manage subscription payments, crypto billing, and invoices for MantleMandate.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left column 60% ───────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Payment methods status */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Payment Methods</h3>
              <p className="text-xs text-text-secondary mt-0.5">Manage how you pay for MantleMandate.</p>
            </div>
            <div className="border border-border rounded-lg p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <TokenIcon symbol="MNT" size="md" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">On-chain payments (Mantle Sepolia)</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Pay for your subscription with a direct MNT transfer — see the Crypto tab below.
                  Card payments are not yet connected.
                </p>
              </div>
            </div>
          </div>

          {/* Add new payment method */}
          <div ref={addMethodRef} className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">Add New Payment Method</h4>

            {/* Method tabs */}
            <div className="flex gap-0 border-b border-border">
              {([
                ['card',   '💳 Card'],
                ['crypto', '💲 Crypto'],
              ] as [PaymentTab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                    tab === key
                      ? 'text-primary border-primary'
                      : 'text-text-secondary border-transparent hover:text-text-primary'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'card' && (
              <ComingSoonTab
                icon={<CreditCard className="h-5 w-5" />}
                title="Card payments aren't connected yet"
                description="This deployment doesn't have a Stripe account configured. Use the Crypto tab to pay with MNT on Mantle Sepolia."
              />
            )}
            {tab === 'crypto' && <CryptoTab onPaid={handlePaid} />}
          </div>
        </div>

        {/* ── Right column 40% ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Current plan card */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-2">
            <p className={cn('text-[10px] font-bold uppercase tracking-wider', planConfig.color)}>
              {planConfig.label}
            </p>
            <p className="text-3xl font-black text-text-primary">
              {planConfig.price}
              <span className="text-sm font-normal text-text-secondary ml-1">/ month</span>
            </p>
            {user?.trialEndsAt && (
              <p className="text-xs text-success">
                Trial: {Math.max(0, Math.ceil(
                  (new Date(user.trialEndsAt).getTime() - Date.now()) / 86_400_000
                ))} days remaining
              </p>
            )}
            <button
              onClick={goToCrypto}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors mt-2"
            >
              Pay with Crypto <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Billing history */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-primary">Billing History</h4>
              {invoices.length > 0 && (
                <button
                  onClick={downloadInvoicesCsv}
                  className="text-xs text-text-link hover:text-text-link-hover flex items-center gap-1 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Export
                </button>
              )}
            </div>

            {invoicesLoading ? (
              <div className="flex items-center justify-center py-6 text-text-secondary text-xs gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">No invoices yet.</p>
            ) : (
              <div className="space-y-0">
                {invoices.map((inv: Invoice, i: number) => (
                  <div
                    key={inv.id}
                    className={cn(
                      'flex items-center gap-2 py-2.5 min-h-[44px]',
                      i < invoices.length - 1 && 'border-b border-border/60'
                    )}
                  >
                    <span className="text-[11px] text-text-secondary w-[72px] shrink-0">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[11px] text-text-primary flex-1 truncate capitalize">
                      {inv.plan} Plan · {inv.paymentMethod}
                    </span>
                    <span className="text-[11px] font-semibold text-text-primary w-20 text-right shrink-0">
                      {inv.amount} {inv.currency}
                    </span>
                    <StatusBadge
                      status={inv.status === 'paid' ? 'success' : inv.status === 'failed' ? 'failed' : 'pending'}
                      className="shrink-0"
                    />
                    {inv.txHash && (
                      <a
                        href={`${EXPLORER_TX_BASE}${inv.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-text-link hover:text-text-link-hover transition-colors"
                        title="View transaction"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
