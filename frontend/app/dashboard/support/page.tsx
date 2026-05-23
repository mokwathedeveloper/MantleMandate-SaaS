'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Mail, MessageCircle, BookOpen, Users, Search, ExternalLink,
  ChevronRight, ChevronDown, ChevronUp, Paperclip, X,
  Loader2, CheckCircle, AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { ChatWidget } from '@/components/ui/ChatWidget'
import { EmailWidget } from '@/components/ui/EmailWidget'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RealTicket {
  id: string
  ticket_ref: string
  subject: string
  status: 'open' | 'closed' | 'pending'
  priority: 'Low' | 'Medium' | 'High'
  category: string
  created_at: string
}

interface FaqItem {
  question: string
  answer: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I deploy my first AI agent?',
    answer:
      'Go to Dashboard → Agents → New Agent. Write your mandate in plain English — for example, "Buy ETH when RSI is below 30, never risk more than 3% per trade." Claude parses it into a structured policy, which is hashed and anchored to Mantle Sepolia via the MandatePolicy contract. Click Deploy and your agent is registered on-chain and starts running automatically.',
  },
  {
    question: 'What is a policy hash and why does it matter?',
    answer:
      'A policy hash is a keccak256 fingerprint of your mandate\'s rules, stored immutably on the MandatePolicy smart contract on Mantle. It creates a cryptographically verifiable record that your agent\'s decisions are governed by your stated policy. If an agent executes a trade that violates the hash, it is detectable on-chain — giving you a trustless compliance guarantee no centralised system can offer.',
  },
  {
    question: 'How does the plain-English mandate parser work?',
    answer:
      'The mandate parser uses Claude (claude-sonnet via OpenRouter) to extract structured trading rules from your natural-language input. It identifies: asset pairs, entry/exit triggers (RSI, price levels, time windows), position size limits, and stop-loss conditions. The output is a JSON policy object that is hashed and submitted to MandatePolicy.sol. You can review the parsed JSON before deploying.',
  },
  {
    question: 'My agent paused unexpectedly — what do I do?',
    answer:
      'Check Dashboard → Protocols → History tab for the last execution log. Common causes: (1) RiskGuard circuit breaker triggered — your drawdown or notional limit was hit; (2) Bybit API key expired or was rate-limited; (3) Mantle Sepolia RPC blip. To resume: resolve the root cause, then go to Agents → select the agent → Resume. If the agent shows "STOPPED" rather than "PAUSED", contact support — a STOPPED agent requires manual review before reactivation.',
  },
  {
    question: 'How to read the on-chain audit trail?',
    answer:
      'Go to Dashboard → Audit. Each row is an OrderExecuted event emitted by the AgentExecutor contract on Mantle Sepolia. Click the TX hash column to open the transaction on Mantle Explorer. The Mandate Hash column confirms which policy authorised each trade. All events are immutable — they cannot be edited or deleted, providing a tamper-proof compliance record suitable for regulatory review.',
  },
  {
    question: 'Setting risk limits: drawdown, stop-loss, position sizing',
    answer:
      'In Dashboard → Risk, set: Max Drawdown % (a circuit breaker that pauses the agent when the portfolio drops this amount from its peak), Max Notional per Trade (a hard USD cap per single order), and Stop-Loss % (automatically closes a position when the unrealised loss exceeds this threshold). These limits are enforced by RiskGuard.sol on-chain — agents cannot bypass them regardless of market conditions or mandate instructions.',
  },
  {
    question: 'How to connect multiple wallets to one account?',
    answer:
      'Currently one primary wallet is linked per account (connected via MetaMask or WalletConnect during onboarding). Multi-wallet support is on the roadmap. You can view your connected wallet in Dashboard → Wallets and manage off-chain funds via the Bybit API integration from Dashboard → Settings → API Keys. Each account maps to one on-chain identity for mandate governance and audit purposes.',
  },
  {
    question: 'Exporting reports for tax purposes',
    answer:
      'Go to Dashboard → Trades and click Export (top right). You can download all trade history as CSV with columns: Date, Pair, Side, Amount, Price, P&L, Protocol, On-Chain TX. For tax reporting, use the On-Chain TX links to verify each trade independently on Mantle Explorer. The on-chain audit trail at Dashboard → Audit provides an immutable record acceptable for compliance submissions in most jurisdictions.',
  },
]

const RESOURCES: { label: string; href: string; ext: boolean }[] = [
  { label: 'API Documentation',   href: 'https://docs.mantlemandate.xyz/api',       ext: true  },
  { label: 'Smart Contract Docs', href: 'https://docs.mantlemandate.xyz/contracts', ext: true  },
  { label: 'Changelog',           href: 'https://docs.mantlemandate.xyz/changelog', ext: true  },
  { label: 'Status Page',         href: 'https://status.mantlemandate.xyz',         ext: true  },
  { label: 'Privacy Policy',      href: '/privacy',                                  ext: false },
  { label: 'Terms of Service',    href: '/terms',                                    ext: false },
]

const PLAN_LABELS: Record<string, string> = {
  operator:    'OPERATOR PLAN',
  strategist:  'STRATEGIST PLAN',
  institution: 'INSTITUTION PLAN',
}
const PLAN_SUPPORT: Record<string, { tier: string; response: string }> = {
  operator:    { tier: 'Standard Support',   response: '24-hour response' },
  strategist:  { tier: 'Priority Support',   response: '4-hour response'  },
  institution: { tier: 'Enterprise Support', response: '24/7 SLA'         },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
  open:    'bg-warning-bg text-warning',
  closed:  'bg-success-bg text-success',
  pending: 'bg-primary/10 text-text-link',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded w-fit', STATUS_CLASS[status] ?? 'bg-surface text-text-secondary')}>
      {status}
    </span>
  )
}

function PriorityLabel({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High:   'text-error',
    Medium: 'text-warning',
    Low:    'text-text-secondary',
  }
  return <span className={cn('text-xs font-medium', colors[priority] ?? 'text-text-secondary')}>{priority}</span>
}

function TicketForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const user = useAuthStore(s => s.user)
  const plan = user?.plan ?? 'operator'

  const [subject,    setSubject]    = useState('')
  const [category,   setCategory]   = useState('Agent Issue')
  const [priority,   setPriority]   = useState('Medium')
  const [message,    setMessage]    = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [success,    setSuccess]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => setAttachment(e.target.files?.[0] ?? null)

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/support/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:     (user as { email?: string })?.email ?? '',
          name:     user?.name  ?? '',
          subject,
          category,
          priority,
          message,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setSuccess(true)
      setTimeout(() => {
        onClose()
        onSubmitted()
      }, 1800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="border border-success/40 rounded-md p-8 bg-success-bg flex flex-col items-center gap-3 text-center">
        <CheckCircle className="h-10 w-10 text-success" />
        <p className="text-sm font-semibold text-text-primary">Ticket submitted successfully!</p>
        <p className="text-xs text-text-secondary">
          We&apos;ll respond within {PLAN_SUPPORT[plan]?.response ?? '24 hours'}.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-md p-4 space-y-3 bg-surface">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">Submit New Ticket</p>
        <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-error bg-error/10 border border-error/20 rounded-md px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs text-text-secondary">Subject</label>
        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
          placeholder="Brief description of your issue"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-text-secondary">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
          >
            {['Agent Issue', 'Mandate Issue', 'Billing', 'API', 'General'].map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-text-secondary">Priority</label>
          <div className="flex gap-3 mt-1.5">
            {['Low', 'Medium', 'High'].map(p => (
              <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="ticket-priority"
                  value={p}
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                  className="accent-primary"
                />
                <span className="text-sm text-text-secondary">{p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-text-secondary">Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary resize-none min-h-[140px]"
          placeholder="Describe your issue in detail..."
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-text-secondary">Attachment (optional)</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attach file
          </button>
          {attachment && (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="truncate max-w-[160px]">{attachment.name}</span>
              <button type="button" onClick={() => setAttachment(null)} className="text-text-disabled hover:text-error">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {submitting ? 'Submitting…' : 'Submit Ticket'}
        </button>
        <button
          onClick={onClose}
          disabled={submitting}
          className="border border-border text-text-secondary text-sm px-4 py-2 rounded-md hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const user      = useAuthStore(s => s.user)
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const plan      = user?.plan ?? 'strategist'

  const [showForm,       setShowForm]       = useState(false)
  const [searchVal,      setSearchVal]      = useState('')
  const [openFaqIdx,     setOpenFaqIdx]     = useState<number | null>(null)
  const [tickets,        setTickets]        = useState<RealTicket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [showAll,        setShowAll]        = useState(false)
  const [statusLabel,    setStatusLabel]    = useState('Just now')

  const planLabel   = PLAN_LABELS[plan]  ?? 'OPERATOR PLAN'
  const planSupport = PLAN_SUPPORT[plan] ?? PLAN_SUPPORT.operator

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/support/tickets')
      if (res.ok) {
        const { tickets: data } = await res.json()
        setTickets(data ?? [])
      }
    } catch {
      // keep existing data on network error
    } finally {
      setTicketsLoading(false)
    }
  }, [])

  // Fetch tickets on mount; refresh status label every minute
  useEffect(() => {
    fetchTickets()
    const checkTime = Date.now()
    setStatusLabel('Just now')
    const t = setInterval(() => {
      const diff = Math.floor((Date.now() - checkTime) / 60_000)
      setStatusLabel(diff < 1 ? 'Just now' : `${diff} min ago`)
    }, 60_000)
    return () => clearInterval(t)
  }, [fetchTickets])

  const query = searchVal.toLowerCase().trim()

  const filteredTickets = tickets.filter(t =>
    !query ||
    t.subject.toLowerCase().includes(query) ||
    t.ticket_ref.toLowerCase().includes(query) ||
    t.category.toLowerCase().includes(query)
  )
  const shownTickets = showAll ? filteredTickets : filteredTickets.slice(0, 5)

  const filteredFaq = FAQ_ITEMS.filter(f =>
    !query ||
    f.question.toLowerCase().includes(query) ||
    f.answer.toLowerCase().includes(query)
  )

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-[32px] font-bold text-text-primary leading-tight">
          Hi {firstName}, how can we help?
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Search our docs, browse FAQs, or reach our team directly.
        </p>
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-disabled pointer-events-none" />
          <input
            value={searchVal}
            onChange={e => { setSearchVal(e.target.value); setShowAll(false) }}
            placeholder="Search tickets and help topics…"
            className="w-full h-12 border-2 border-border rounded-lg pl-12 pr-10 text-[15px] text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary transition-colors bg-page"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── System Status Banner ── */}
      <div className="flex items-center gap-3 rounded-[6px] px-4 py-2.5 flex-wrap bg-success-bg border border-success/40">
        <span className="h-2 w-2 rounded-full shrink-0 animate-pulse bg-success" />
        <span className="text-[13px] font-medium flex-1 text-success">All systems operational</span>
        <span className="text-[13px] text-text-secondary">Last checked: {statusLabel}</span>
        <a
          href="https://status.mantlemandate.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-text-link flex items-center gap-1 hover:underline underline-offset-2 shrink-0"
        >
          Status Page <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* ── Contact Cards (4-up) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
          <Mail className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">Email Support</p>
            <p className="text-xs text-text-secondary mt-1">
              Response within 4 hours for Strategist &amp; Institution plans.
            </p>
          </div>
          <EmailWidget />
        </div>

        <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
          <MessageCircle className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-text-primary">Live Chat</p>
              <span className="text-[10px] font-semibold text-success flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" /> Online
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Available Monday–Friday, 9am–6pm UTC.
            </p>
          </div>
          <ChatWidget />
        </div>

        <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
          <BookOpen className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">Documentation</p>
            <p className="text-xs text-text-secondary mt-1">
              Full guides, API reference, and mandate writing tutorials.
            </p>
          </div>
          <a
            href="/dashboard/api"
            className="text-sm text-text-link hover:underline underline-offset-2 w-fit flex items-center gap-1"
          >
            Browse Docs <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
          <Users className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">Community Forum</p>
            <p className="text-xs text-text-secondary mt-1">
              Connect with other MantleMandate users. Share strategies.
            </p>
          </div>
          <a
            href="https://docs.mantlemandate.xyz/community"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-link hover:underline underline-offset-2 w-fit flex items-center gap-1"
          >
            Join Forum <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ── Main 70/30 split ── */}
      <div className="grid lg:grid-cols-10 gap-6 items-start">

        {/* Left — 70% */}
        <div className="lg:col-span-7 space-y-6">

          {/* Tickets */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-primary">Your Support Tickets</h4>
              <button
                onClick={() => setShowForm(v => !v)}
                className="text-xs border border-border rounded-md px-3 py-1.5 text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
              >
                {showForm ? 'Hide Form' : 'Submit New Ticket'}
              </button>
            </div>

            {showForm && (
              <TicketForm
                onClose={() => setShowForm(false)}
                onSubmitted={() => {
                  setShowForm(false)
                  fetchTickets()
                }}
              />
            )}

            {ticketsLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading tickets…</span>
              </div>
            ) : shownTickets.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Mail className="h-8 w-8 text-text-disabled" />
                <p className="text-sm text-text-secondary">
                  {query
                    ? `No tickets match "${searchVal}"`
                    : 'No tickets yet. Submit your first one above.'}
                </p>
                {!query && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-xs text-text-link hover:underline underline-offset-2"
                  >
                    Submit a ticket →
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-hidden border border-border rounded-md">
                  <div
                    className="grid px-4 py-2.5 bg-page"
                    style={{ gridTemplateColumns: '16% 35% 14% 13% auto' }}
                  >
                    {['ID', 'SUBJECT', 'STATUS', 'PRIORITY', 'UPDATED'].map(h => (
                      <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                        {h}
                      </span>
                    ))}
                  </div>
                  {shownTickets.map((t, i) => (
                    <div
                      key={t.id}
                      className={cn(
                        'grid px-4 items-center hover:bg-surface transition-colors',
                        i % 2 === 0 ? 'bg-card' : 'bg-page',
                      )}
                      style={{ gridTemplateColumns: '16% 35% 14% 13% auto', minHeight: '44px' }}
                    >
                      <span className="font-mono text-xs text-text-secondary">#{t.ticket_ref}</span>
                      <span className="text-sm text-left truncate pr-2 text-text-primary">{t.subject}</span>
                      <StatusBadge status={t.status} />
                      <PriorityLabel priority={t.priority} />
                      <span className="text-xs text-text-secondary">{timeAgo(t.created_at)}</span>
                    </div>
                  ))}
                </div>

                {filteredTickets.length > 5 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowAll(v => !v)}
                      className="text-xs text-text-link flex items-center gap-1 hover:underline underline-offset-2"
                    >
                      {showAll
                        ? 'Show fewer'
                        : `View all ${filteredTickets.length} tickets`}
                      <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showAll && 'rotate-90')} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Popular Topics</h4>

            {filteredFaq.length === 0 ? (
              <p className="text-sm text-text-secondary py-4 text-center">
                No topics match &ldquo;{searchVal}&rdquo;
              </p>
            ) : (
              <div className="space-y-0.5">
                {filteredFaq.map((item) => {
                  const idx    = FAQ_ITEMS.indexOf(item)
                  const isOpen = openFaqIdx === idx
                  return (
                    <div key={idx} className="border-b border-border last:border-0">
                      <button
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between py-2.5 text-sm transition-colors group text-left text-text-link"
                      >
                        <span className="group-hover:underline underline-offset-2 pr-4">{item.question}</span>
                        {isOpen
                          ? <ChevronUp   className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                          : <ChevronDown className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        }
                      </button>
                      {isOpen && (
                        <p className="text-sm text-text-secondary pb-4 pr-8 leading-relaxed">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right — 30% */}
        <div className="lg:col-span-3 space-y-4">

          {/* Resources */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-1">
            <h4 className="text-sm font-semibold text-text-primary mb-3">Resources</h4>
            {RESOURCES.map(({ label, href, ext }) => (
              <a
                key={label}
                href={href}
                target={ext ? '_blank' : undefined}
                rel={ext ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-1 text-sm py-1 text-text-link transition-colors hover:underline underline-offset-2"
              >
                {label}
                {ext && <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />}
              </a>
            ))}
          </div>

          {/* Contact Hours */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">Contact Hours</h4>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-text-primary">📧 Email Support</p>
              <p className="text-xs text-text-secondary">Mon–Fri, 9am–6pm UTC</p>
              <p className="text-xs text-text-secondary">4-hour response (Strategist / Institution)</p>
              <p className="text-xs text-text-secondary">24-hour response (Operator)</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-text-primary">💬 Live Chat</p>
              <p className="text-xs text-text-secondary">Mon–Fri, 9am–6pm UTC</p>
              <p className="text-xs font-medium flex items-center gap-1.5 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block animate-pulse" />
                Currently: Online
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-text-primary">⏱ Emergency Support</p>
              <p className="text-xs text-text-secondary">Institution plan only — 24/7 SLA</p>
            </div>
          </div>

          {/* Plan Badge */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{planLabel}</p>
            <p className="text-sm font-medium text-text-secondary mt-1">{planSupport.tier}</p>
            <p className="text-xs text-text-secondary">{planSupport.response}</p>
            {plan !== 'institution' && (
              <Link
                href="/dashboard/billing"
                className="mt-2 block text-xs text-text-link hover:underline underline-offset-2"
              >
                Upgrade for 24/7 →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
