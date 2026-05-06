'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Download, Copy, CheckCircle2, ChevronDown, ExternalLink, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

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

// ── types ─────────────────────────────────────────────────────────────────────

type PaymentTab  = 'card' | 'bank' | 'crypto'
type CryptoToken = 'USDC' | 'USDT' | 'MNT'
type CryptoNetwork = 'mantle' | 'ethereum'

// ── mock data ─────────────────────────────────────────────────────────────────

const BILLING_HISTORY = [
  { date: 'Apr 5, 2026',  desc: 'Strategist Plan — Monthly', amount: '$99.00', method: 'Visa ···4242', status: 'PAID' },
  { date: 'Mar 5, 2026',  desc: 'Strategist Plan — Monthly', amount: '$99.00', method: 'Visa ···4242', status: 'PAID' },
  { date: 'Feb 5, 2026',  desc: 'Strategist Plan — Monthly', amount: '$99.00', method: 'Visa ···4242', status: 'PAID' },
  { date: 'Jan 5, 2026',  desc: 'Strategist Plan — Monthly', amount: '$99.00', method: 'Visa ···4242', status: 'PAID' },
  { date: 'Dec 5, 2025',  desc: 'Strategist Plan — Monthly', amount: '$99.00', method: 'Visa ···4242', status: 'PAID' },
  { date: 'Nov 5, 2025',  desc: 'Strategist Plan — Monthly', amount: '$99.00', method: 'Visa ···4242', status: 'PAID' },
  { date: 'Oct 5, 2025',  desc: 'Strategist Plan — Monthly', amount: '$99.00', method: 'Visa ···4242', status: 'PAID' },
]

const CRYPTO_PAYMENT_ADDRESS = '0x7f3d9a2b1c4e5f6d7e8a9b0c1d2e3f4a5b6c7d8e'

const PLAN_CONFIG: Record<string, { label: string; price: string; color: string }> = {
  operator:    { label: 'Operator Plan',    price: '$29',  color: 'text-text-secondary' },
  strategist:  { label: 'Strategist Plan',  price: '$99',  color: 'text-primary' },
  institution: { label: 'Institution Plan', price: '$299', color: 'text-warning' },
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors shrink-0',
        on ? 'bg-primary' : 'bg-surface border border-border'
      )}
    >
      <span className={cn(
        'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
        on ? 'translate-x-4' : 'translate-x-0.5'
      )} />
    </button>
  )
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

// ── CardTab ───────────────────────────────────────────────────────────────────

function CardTab() {
  const [cardNumber,  setCardNumber]  = useState('')
  const [expiry,      setExpiry]      = useState('')
  const [cvv,         setCvv]         = useState('')
  const [holderName,  setHolderName]  = useState('')
  const [showAddress, setShowAddress] = useState(false)

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-secondary">Card Number</label>
        <div className="relative">
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCard(e.target.value))}
            placeholder="1234 5678 9012 3456"
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-disabled pr-10"
          />
          {/* Card brand hint */}
          {cardNumber.startsWith('4') && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400">VISA</span>
          )}
          {cardNumber.startsWith('5') && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-400">MC</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">Expiry Date</label>
          <input
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-disabled"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
            CVV <span className="text-text-disabled">🔒</span>
          </label>
          <input
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            type="password"
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-disabled"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-secondary">Cardholder Name</label>
        <input
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          placeholder="John Michael"
          className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-disabled"
        />
      </div>

      {/* Billing address — collapsible */}
      <button
        onClick={() => setShowAddress((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showAddress && 'rotate-180')} />
        Billing Address (optional)
      </button>

      {showAddress && (
        <div className="space-y-2 pl-2 border-l border-border">
          {['Address line 1', 'City', 'Postcode', 'Country'].map((ph) => (
            <input
              key={ph}
              placeholder={ph}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-disabled"
            />
          ))}
        </div>
      )}

      <button className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-2.5 rounded-md transition-colors">
        Save Card
      </button>
      <p className="text-xs text-text-secondary flex items-center gap-1.5">
        <span>🔒</span>
        Secured with TLS 1.3 encryption. We never store your full card number.
      </p>
    </div>
  )
}

// ── CryptoTab ─────────────────────────────────────────────────────────────────

function CryptoTab() {
  const [token,   setToken]   = useState<CryptoToken>('MNT')
  const [network, setNetwork] = useState<CryptoNetwork>('mantle')
  const [showVerify, setShowVerify] = useState(false)
  const [txHash,     setTxHash]     = useState('')
  const [verified,   setVerified]   = useState<boolean | null>(null)

  const networkLabel = network === 'mantle' ? 'Mantle Network' : 'Ethereum Mainnet'

  const handleVerify = () => {
    // Simulate: any non-empty hash passes
    setVerified(txHash.length > 10)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-1">Pay with Crypto</p>
        <p className="text-xs text-text-disabled mb-3">
          Pay your subscription using crypto on Mantle Network or Ethereum.
        </p>

        {/* Token selector */}
        <p className="text-xs font-medium text-text-secondary mb-2">Token</p>
        <div className="flex gap-2">
          {(['USDC', 'USDT', 'MNT'] as CryptoToken[]).map((t) => (
            <button
              key={t}
              onClick={() => setToken(t)}
              className={cn(
                'flex-1 py-2 text-sm rounded-md border transition-colors text-center',
                token === t
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-secondary hover:border-primary/60'
              )}
            >
              {t}
              {t === 'MNT' && (
                <span className="block text-[9px] text-text-disabled leading-tight">Mantle native</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Network selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-secondary">Network</label>
        <div className="relative">
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as CryptoNetwork)}
            className="w-full appearance-none bg-input border border-border rounded-md px-3 pr-8 py-2 text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="mantle">Mantle Network (recommended)</option>
            <option value="ethereum">Ethereum Mainnet</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
        </div>
      </div>

      {/* Payment address card */}
      <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
        <p className="text-xs font-medium text-text-secondary">Send payment to this address:</p>

        {/* Address + copy */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-text-primary flex-1 break-all">
            {CRYPTO_PAYMENT_ADDRESS}
          </span>
          <CopyButton text={CRYPTO_PAYMENT_ADDRESS} label="Copy" />
        </div>

        {/* QR code — real */}
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-lg inline-block">
            <QRCodeSVG
              value={`${token}:${CRYPTO_PAYMENT_ADDRESS}?amount=99&network=${network}`}
              size={128}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
        </div>

        {/* Amount + network */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-primary">
            Amount due: <span className="text-primary">99 {token} / month</span>
          </p>
          <p className="text-xs text-text-secondary">Network: {networkLabel}</p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 bg-warning/10 border border-warning/30 rounded-md p-3">
          <TriangleAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-warning leading-relaxed">
            Send only <strong>{token}</strong> on {networkLabel} to this address.
            Sending other tokens may result in permanent loss of funds.
          </p>
        </div>
      </div>

      {/* After sending */}
      {!showVerify ? (
        <button
          onClick={() => setShowVerify(true)}
          className="w-full border border-border rounded-md py-2.5 text-sm text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
        >
          {"I've Sent the Payment — Verify Transaction"}
        </button>
      ) : (
        <div className="space-y-2 border border-border rounded-md p-4">
          <p className="text-xs font-medium text-text-secondary">Enter your transaction hash to verify:</p>
          <div className="flex gap-2">
            <input
              value={txHash}
              onChange={(e) => { setTxHash(e.target.value); setVerified(null) }}
              placeholder="0x..."
              className="flex-1 bg-input border border-border rounded-md px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus:border-primary placeholder:text-text-disabled"
            />
            <button
              onClick={handleVerify}
              disabled={!txHash}
              className="px-3 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors"
            >
              Verify
            </button>
          </div>
          {txHash && (
            <a
              href={`https://explorer.mantle.xyz/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors w-fit"
            >
              <ExternalLink className="h-3 w-3" />
              View on Mantle Explorer
            </a>
          )}
          {verified === true && (
            <p className="text-xs text-success flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Payment verified! Your plan will activate shortly.
            </p>
          )}
          {verified === false && (
            <p className="text-xs text-error">Transaction not found. Check the hash and try again.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { user } = useAuthStore()
  const [tab,        setTab]        = useState<PaymentTab>('card')
  const [autoRenew,  setAutoRenew]  = useState(true)
  const [showAll,    setShowAll]    = useState(false)

  const plan       = user?.plan ?? 'strategist'
  const planConfig = PLAN_CONFIG[plan] ?? PLAN_CONFIG.strategist
  const rows       = showAll ? BILLING_HISTORY : BILLING_HISTORY.slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Payment Methods &amp; Billing</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Manage subscription payments, crypto billing, and receipts for MantleMandate.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* ── Left column 60% ───────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Current payment method */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Payment Methods</h3>
              <p className="text-xs text-text-secondary mt-0.5">Manage how you pay for MantleMandate.</p>
            </div>

            {/* Active card */}
            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Visa logo placeholder */}
                  <div className="h-8 w-12 bg-blue-600 rounded flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-[11px] tracking-wider">VISA</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Visa ending in 4242</p>
                    <p className="text-xs text-text-secondary">Expires 08/27 · John Michael</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button className="h-7 px-2.5 text-xs border border-border rounded text-text-secondary hover:border-primary hover:text-text-primary transition-colors">
                    Edit
                  </button>
                  <button className="h-7 px-2.5 text-xs border border-border rounded text-text-secondary hover:border-error hover:text-error transition-colors">
                    Remove
                  </button>
                </div>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-success">
                ✓ Default payment method
              </p>
            </div>
          </div>

          {/* Add new payment method */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">Add New Payment Method</h4>

            {/* Method tabs */}
            <div className="flex gap-0 border-b border-border">
              {([
                ['card',   '💳 Card'],
                ['bank',   '🏦 Bank Account'],
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

            {tab === 'card'   && <CardTab />}
            {tab === 'bank'   && (
              <div className="py-10 text-center">
                <p className="text-sm text-text-secondary">Bank account linking coming soon.</p>
              </div>
            )}
            {tab === 'crypto' && <CryptoTab />}
          </div>

          {/* PayPal section */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">PayPal</h4>
                <p className="text-xs text-text-secondary mt-0.5">Pay with your PayPal account.</p>
              </div>
              <button className="flex items-center gap-2 h-9 px-4 rounded-md border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-text-primary transition-colors bg-input shrink-0">
                <span className="text-[#003087] font-bold text-xs">Pay</span>
                <span className="text-[#009cde] font-bold text-xs">Pal</span>
                Connect PayPal
              </button>
            </div>
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
            <p className="text-xs text-text-secondary">Renews: June 4, 2026</p>
            {user?.trialEndsAt && (
              <p className="text-xs text-success">
                Trial: {Math.max(0, Math.ceil(
                  (new Date(user.trialEndsAt).getTime() - Date.now()) / 86_400_000
                ))} days remaining
              </p>
            )}
            <div className="flex gap-2 pt-3">
              <button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors">
                Upgrade Plan
              </button>
              <button className="border border-border text-text-secondary text-xs px-3 py-1.5 rounded-md hover:text-text-primary hover:border-text-secondary transition-colors">
                Cancel
              </button>
            </div>
          </div>

          {/* Billing history */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-primary">Billing History</h4>
              <button className="text-xs text-text-link hover:text-text-link-hover flex items-center gap-1 transition-colors">
                <Download className="h-3 w-3" />
                Download all
              </button>
            </div>

            <div className="space-y-0">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-2 py-2.5 min-h-[44px]',
                    i < rows.length - 1 && 'border-b border-border/60'
                  )}
                >
                  <span className="text-[11px] text-text-secondary w-[72px] shrink-0">{row.date}</span>
                  <span className="text-[11px] text-text-primary flex-1 truncate">{row.desc}</span>
                  <span className="text-[11px] font-semibold text-text-primary w-14 text-right shrink-0">{row.amount}</span>
                  <span className="text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded shrink-0">
                    {row.status}
                  </span>
                  <button className="shrink-0 text-text-link hover:text-text-link-hover transition-colors" title="Download receipt">
                    <Download className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {BILLING_HISTORY.length > 6 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="w-full text-xs text-text-secondary hover:text-text-primary py-1.5 border-t border-border transition-colors"
              >
                {showAll ? 'Show less' : `Load more (${BILLING_HISTORY.length - 6} more)`}
              </button>
            )}
          </div>

          {/* Auto-renewal */}
          <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Auto-renewal</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Your subscription renews automatically. Turn off to cancel at period end.
              </p>
              {autoRenew && (
                <p className="text-[10px] text-text-disabled mt-1">Next renewal: June 4, 2026</p>
              )}
            </div>
            <Toggle on={autoRenew} onChange={setAutoRenew} />
          </div>
        </div>
      </div>
    </div>
  )
}
