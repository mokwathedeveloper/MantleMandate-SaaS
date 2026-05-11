'use client'

import { useState, useRef } from 'react'
import {
  Mail, MessageCircle, BookOpen, Users,
  Search, ExternalLink, ChevronRight, Paperclip, X,
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { ChatWidget } from '@/components/ui/ChatWidget'
import { EmailWidget } from '@/components/ui/EmailWidget'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Ticket {
  id: string
  subject: string
  status: 'OPEN' | 'CLOSED' | 'PENDING'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  updated: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MOCK_TICKETS: Ticket[] = [
  { id: 'MM-1234', subject: 'Agent paused unexpectedly',              status: 'OPEN',    priority: 'HIGH',   updated: '2 hours ago' },
  { id: 'MM-1201', subject: 'Export CSV format issue',                status: 'PENDING', priority: 'MEDIUM', updated: '1 day ago' },
  { id: 'MM-1198', subject: 'Wallet connection failed',               status: 'CLOSED',  priority: 'LOW',    updated: '3 days ago' },
  { id: 'MM-1187', subject: 'Risk engine not triggering stop-loss',   status: 'OPEN',    priority: 'HIGH',   updated: '4 days ago' },
  { id: 'MM-1174', subject: 'API rate limit exceeded — no alert',     status: 'CLOSED',  priority: 'MEDIUM', updated: '1 week ago' },
]

const FAQ_ITEMS = [
  'How do I deploy my first AI agent?',
  'What is a policy hash and why does it matter?',
  'How does the plain-English mandate parser work?',
  'My agent paused unexpectedly — what do I do?',
  'How to read the on-chain audit trail?',
  'Setting risk limits: drawdown, stop-loss, position sizing',
  'How to connect multiple wallets to one account?',
  'Exporting reports for tax purposes',
]

const RESOURCES: { label: string; ext: boolean }[] = [
  { label: 'API Documentation',              ext: true  },
  { label: 'Smart Contract Source (GitHub)', ext: true  },
  { label: 'Changelog',                      ext: false },
  { label: 'Status Page',                    ext: true  },
  { label: 'Privacy Policy',                 ext: false },
  { label: 'Terms of Service',               ext: false },
]

const PLAN_LABELS: Record<string, string> = {
  operator:    'OPERATOR PLAN',
  strategist:  'STRATEGIST PLAN',
  institution: 'INSTITUTION PLAN',
}
const PLAN_SUPPORT: Record<string, { tier: string; response: string }> = {
  operator:    { tier: 'Standard Support',  response: '24-hour response' },
  strategist:  { tier: 'Priority Support',  response: '4-hour response' },
  institution: { tier: 'Enterprise Support', response: '24/7 SLA' },
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Ticket['status'] }) {
  const styles: Record<Ticket['status'], { bg: string; color: string }> = {
    OPEN:    { bg: '#2A2000', color: '#F5C542' },
    CLOSED:  { bg: '#0D2818', color: '#22C55E' },
    PENDING: { bg: '#0D1526', color: '#58A6FF' },
  }
  const { bg, color } = styles[status]
  return (
    <span
      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded w-fit"
      style={{ background: bg, color }}
    >
      {status}
    </span>
  )
}

function PriorityLabel({ priority }: { priority: Ticket['priority'] }) {
  const colors: Record<Ticket['priority'], string> = {
    HIGH:   'text-error',
    MEDIUM: 'text-warning',
    LOW:    'text-text-secondary',
  }
  return <span className={cn('text-xs font-medium', colors[priority])}>{priority}</span>
}

function TicketForm({ onClose }: { onClose: () => void }) {
  const [subject,    setSubject]    = useState('')
  const [category,   setCategory]   = useState('Agent Issue')
  const [priority,   setPriority]   = useState('Medium')
  const [message,    setMessage]    = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachment(e.target.files?.[0] ?? null)
  }

  return (
    <div className="border border-border rounded-md p-4 space-y-3 bg-surface">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">Submit New Ticket</p>
        <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Subject */}
      <div className="space-y-1">
        <label className="text-xs text-text-secondary">Subject</label>
        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
          placeholder="Brief description of your issue"
        />
      </div>

      {/* Category + Priority */}
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

      {/* Message */}
      <div className="space-y-1">
        <label className="text-xs text-text-secondary">Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
          style={{ minHeight: '160px' }}
          placeholder="Describe your issue in detail..."
        />
      </div>

      {/* Attachment */}
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
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-text-disabled hover:text-error"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-md transition-colors">
          Submit Ticket
        </button>
        <button
          onClick={onClose}
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

  const [showForm,   setShowForm]   = useState(false)
  const [searchVal,  setSearchVal]  = useState('')
  // Simulate incident: flip to true to see incident banner
  const [incident] = useState(false)

  const planLabel   = PLAN_LABELS[plan]   ?? 'OPERATOR PLAN'
  const planSupport = PLAN_SUPPORT[plan]  ?? PLAN_SUPPORT.operator

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

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-disabled pointer-events-none" />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Search for help..."
            className="w-full h-12 border-2 border-border rounded-lg pl-12 pr-4 text-[15px] text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary transition-colors"
            style={{ background: '#0D1117' }}
          />
        </div>
      </div>

      {/* ── System Status Banner ── */}
      {incident ? (
        <div
          className="flex items-center gap-3 rounded-[6px] px-4 py-2.5 flex-wrap"
          style={{ background: '#2A2000', border: '1px solid #F5C542', color: '#F5C542' }}
        >
          <span className="text-sm">⚠</span>
          <span className="text-[13px] font-medium flex-1">
            Partial outage — Agni Finance integration degraded
          </span>
          <a href="#" className="text-[13px] font-medium underline-offset-2 hover:underline shrink-0">
            View Incident →
          </a>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 rounded-[6px] px-4 py-2.5 flex-wrap"
          style={{ background: '#0D2818', border: '1px solid rgba(34,197,94,0.4)' }}
        >
          <span
            className="h-2 w-2 rounded-full shrink-0 animate-pulse"
            style={{ background: '#22C55E' }}
          />
          <span className="text-[13px] font-medium flex-1" style={{ color: '#22C55E' }}>
            All systems operational
          </span>
          <span className="text-[13px] text-text-secondary">Last checked: 2 min ago</span>
          <a
            href="#"
            className="text-[13px] flex items-center gap-1 hover:underline underline-offset-2 shrink-0"
            style={{ color: '#58A6FF' }}
          >
            Status Page <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* ── Contact Cards (4-up 2×2) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Email Support */}
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

        {/* Live Chat */}
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
              Available Monday–Friday, 9am–6pm UTC. Instant responses.
            </p>
          </div>
          <ChatWidget />
        </div>

        {/* Documentation */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
          <BookOpen className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">Documentation</p>
            <p className="text-xs text-text-secondary mt-1">
              Full guides, API reference, and mandate writing tutorials.
            </p>
          </div>
          <a href="#" style={{ color: '#58A6FF' }} className="text-sm hover:underline underline-offset-2 w-fit flex items-center gap-1">
            Browse Docs <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Community */}
        <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
          <Users className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">Community Forum</p>
            <p className="text-xs text-text-secondary mt-1">
              Connect with other MantleMandate users. Share strategies.
            </p>
          </div>
          <a href="#" style={{ color: '#58A6FF' }} className="text-sm hover:underline underline-offset-2 w-fit flex items-center gap-1">
            Join Forum <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ── Main two-column split (70 / 30) ── */}
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

            {/* Submit form (expandable) */}
            {showForm && <TicketForm onClose={() => setShowForm(false)} />}

            {/* Table */}
            <div className="overflow-hidden border border-border rounded-md">
              <div
                className="grid px-4 py-2.5 bg-page"
                style={{ gridTemplateColumns: '13% 36% 14% 12% auto' }}
              >
                {['ID', 'SUBJECT', 'STATUS', 'PRIORITY', 'UPDATED'].map(h => (
                  <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                    {h}
                  </span>
                ))}
              </div>
              {MOCK_TICKETS.map((t, i) => (
                <div
                  key={t.id}
                  className={cn('grid px-4 items-center hover:bg-surface transition-colors', i % 2 === 0 ? 'bg-card' : 'bg-page')}
                  style={{ gridTemplateColumns: '13% 36% 14% 12% auto', minHeight: '44px' }}
                >
                  <span className="font-mono text-xs text-text-secondary">#{t.id}</span>
                  <button className="text-sm text-left truncate pr-2" style={{ color: '#58A6FF' }}>
                    {t.subject}
                  </button>
                  <StatusBadge status={t.status} />
                  <PriorityLabel priority={t.priority} />
                  <span className="text-xs text-text-secondary">{t.updated}</span>
                </div>
              ))}
            </div>

            {/* View all */}
            <div className="flex justify-end">
              <button className="text-xs flex items-center gap-1" style={{ color: '#58A6FF' }}>
                View all tickets <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Popular Topics */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Popular Topics</h4>
            <div className="space-y-0.5">
              {FAQ_ITEMS.map((q, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-between py-2.5 border-b border-border last:border-0 text-sm transition-colors group text-left"
                  style={{ color: '#58A6FF' }}
                >
                  <span className="group-hover:underline underline-offset-2">{q}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — 30% */}
        <div className="lg:col-span-3 space-y-4">

          {/* Resources */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-1">
            <h4 className="text-sm font-semibold text-text-primary mb-3">Resources</h4>
            {RESOURCES.map(({ label, ext }) => (
              <a
                key={label}
                href="#"
                className="flex items-center gap-1 text-sm py-1 transition-colors hover:underline underline-offset-2"
                style={{ color: '#58A6FF' }}
              >
                {label}
                {ext && <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />}
              </a>
            ))}
          </div>

          {/* Contact Hours */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">Contact Hours</h4>

            {/* Email */}
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-text-primary">📧 Email Support</p>
              <p className="text-xs text-text-secondary">Mon–Fri, 9am–6pm UTC</p>
              <p className="text-xs text-text-secondary">Response within 4 hours (Strategist/Institution)</p>
              <p className="text-xs text-text-secondary">Response within 24 hours (Operator)</p>
            </div>

            {/* Live Chat */}
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-text-primary">💬 Live Chat</p>
              <p className="text-xs text-text-secondary">Mon–Fri, 9am–6pm UTC</p>
              <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: '#22C55E' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block animate-pulse" />
                Currently: Online
              </p>
            </div>

            {/* Emergency */}
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
                className="mt-2 block text-xs hover:underline underline-offset-2"
                style={{ color: '#58A6FF' }}
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
