'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Bell, Activity, UserPlus, ShieldCheck, KeyRound,
  Zap, Globe, Gauge, X, Send, Loader2, Copy, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAlertStore } from '@/store/alertStore'
import { RECENT_ACTIVITY, USER_LOCATIONS } from '@/mocks/users'
import { DASHBOARD_RISK_SUMMARY } from '@/mocks/dashboard'

// ─────────────────────────────────────────────────────────────────
// Reusable rail components
// ─────────────────────────────────────────────────────────────────

function RailSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="px-4 py-3 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">
          {title}
        </h4>
        {action}
      </div>
      {children}
    </section>
  )
}

function PolicyEngineCard() {
  return (
    <div className="px-4 pt-4">
      <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 flex items-center gap-2.5">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-success">Policy Engine Online</p>
          <p className="text-[11px] text-text-secondary leading-tight mt-0.5">
            All checks passing · 4,812 events / 24h
          </p>
        </div>
        <CheckCircle2 className="h-4 w-4 text-success" />
      </div>
    </div>
  )
}

function RecentActivityList() {
  return (
    <div className="space-y-2.5">
      {RECENT_ACTIVITY.slice(0, 4).map((a) => (
        <div key={a.id} className="flex items-start gap-2.5">
          <Activity className="h-3.5 w-3.5 text-text-disabled shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-text-primary leading-snug">
              <span className="font-semibold">{a.actor}</span>{' '}
              <span className="text-text-secondary">{a.action}</span>
            </p>
            <p className="text-[10px] text-text-disabled mt-0.5">{a.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Modal shell
// ─────────────────────────────────────────────────────────────────

function ActionModal({
  title, icon: Icon, onClose, children,
}: {
  title: string
  icon: React.ElementType
  onClose: () => void
  children: ReactNode
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed z-50 w-[360px] rounded-xl overflow-hidden shadow-2xl"
        style={{
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#161B22', border: '1px solid #21262D',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: '#1C2128', borderBottom: '1px solid #21262D' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-[13px] font-semibold text-text-primary">{title}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────
// Invite User modal
// ─────────────────────────────────────────────────────────────────

const ROLES = ['Viewer', 'Operator', 'Strategist', 'Admin']

function InviteUserModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole]   = useState('Operator')
  const [loading, setLoading] = useState(false)
  const [done, setDone]   = useState(false)

  const handleSend = async () => {
    if (!email.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setDone(true)
  }

  return (
    <ActionModal title="Invite User" icon={UserPlus} onClose={onClose}>
      <div className="p-4 space-y-3">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Invitation sent!</p>
              <p className="text-xs text-text-secondary mt-1">
                An invite email was sent to <span className="text-text-primary font-medium">{email}</span> with the <span className="font-medium">{role}</span> role.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-1 px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Email address <span className="text-error">*</span></label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                type="email"
                className="w-full rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary transition-colors"
                style={{ background: '#0D1117', border: '1px solid #30363D' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full appearance-none rounded-md px-3 pr-8 py-2 text-sm text-text-primary focus:outline-none cursor-pointer"
                  style={{ background: '#0D1117', border: '1px solid #30363D' }}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSend}
                disabled={!email.trim() || loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-primary hover:bg-primary-hover disabled:bg-border disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</> : <><Send className="h-3.5 w-3.5" /> Send Invite</>}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </ActionModal>
  )
}

// ─────────────────────────────────────────────────────────────────
// Run Audit modal
// ─────────────────────────────────────────────────────────────────

const AUDIT_STEPS = [
  'Scanning mandate policy hashes…',
  'Verifying agent execution logs…',
  'Checking wallet permissions…',
  'Validating on-chain transactions…',
  'Generating audit report…',
]

function RunAuditModal({ onClose }: { onClose: () => void }) {
  const [running, setRunning]   = useState(false)
  const [step, setStep]         = useState(-1)
  const [done, setDone]         = useState(false)
  const [issues, setIssues]     = useState(0)

  const handleRun = async () => {
    setRunning(true)
    for (let i = 0; i < AUDIT_STEPS.length; i++) {
      setStep(i)
      await new Promise(r => setTimeout(r, 700 + Math.random() * 400))
    }
    setIssues(Math.floor(Math.random() * 3))
    setDone(true)
    setRunning(false)
  }

  return (
    <ActionModal title="Run Audit" icon={ShieldCheck} onClose={onClose}>
      <div className="p-4 space-y-3">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className={cn('h-12 w-12 rounded-full flex items-center justify-center', issues === 0 ? 'bg-success/15' : 'bg-warning/15')}>
              <ShieldCheck className={cn('h-6 w-6', issues === 0 ? 'text-success' : 'text-warning')} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Audit complete</p>
              <p className="text-xs text-text-secondary mt-1">
                {issues === 0
                  ? 'No issues found. All mandates and agents are compliant.'
                  : `${issues} issue${issues > 1 ? 's' : ''} flagged — review recommended.`}
              </p>
            </div>
            <div className="w-full space-y-1.5 text-left">
              {AUDIT_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                  {s.replace('…', '')}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1 w-full">
              <Link
                href="/dashboard/audit"
                onClick={onClose}
                className="flex-1 text-center py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
              >
                View Report →
              </Link>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : running ? (
          <div className="py-4 space-y-2">
            <p className="text-xs text-text-secondary text-center mb-3">Running security audit…</p>
            {AUDIT_STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {i < step ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                ) : i === step ? (
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                )}
                <span className={i <= step ? 'text-text-primary' : 'text-text-disabled'}>{s}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs text-text-secondary">
              This will run a full compliance audit across all mandates, agents, and on-chain transactions. Estimated time: ~5 seconds.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleRun}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Start Audit
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </ActionModal>
  )
}

// ─────────────────────────────────────────────────────────────────
// Generate Token modal
// ─────────────────────────────────────────────────────────────────

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return 'mm_' + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function GenerateTokenModal({ onClose }: { onClose: () => void }) {
  const [token, setToken]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setToken(generateToken())
    setLoading(false)
  }

  const handleCopy = () => {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ActionModal title="Generate API Token" icon={KeyRound} onClose={onClose}>
      <div className="p-4 space-y-3">
        {token ? (
          <>
            <div className="rounded-md p-3 space-y-2" style={{ background: '#0D1117', border: '1px solid #30363D' }}>
              <p className="text-[10px] font-semibold text-success uppercase tracking-wider">Token generated</p>
              <p className="font-mono text-[11px] text-text-primary break-all leading-relaxed">{token}</p>
            </div>
            <p className="text-[11px] text-warning">
              Copy this token now — it will not be shown again.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied!' : 'Copy Token'}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-text-secondary">
              Generate a new API token for programmatic access to MantleMandate. Tokens have read + write access by default.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-primary hover:bg-primary-hover disabled:bg-border disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</> : <><KeyRound className="h-3.5 w-3.5" /> Generate Token</>}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </ActionModal>
  )
}

// ─────────────────────────────────────────────────────────────────
// Generate Trade modal
// ─────────────────────────────────────────────────────────────────

const TRADE_PAIRS    = ['ETH/USDC', 'BTC/USDC', 'MNT/USDC', 'SOL/USDC', 'USDC/USDT']
const TRADE_PROTOCOLS = ['Merchant Moe', 'Agni Finance', 'Fluxion']

function GenerateTradeModal({ onClose }: { onClose: () => void }) {
  const [pair, setPair]         = useState(TRADE_PAIRS[0])
  const [direction, setDir]     = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount]     = useState('')
  const [protocol, setProtocol] = useState(TRADE_PROTOCOLS[0])
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [txHash, setTxHash]     = useState('')

  const handleSubmit = async () => {
    if (!amount.trim() || isNaN(Number(amount))) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    const chars = '0123456789abcdef'
    setTxHash('0x' + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
    setDone(true)
    setLoading(false)
  }

  return (
    <ActionModal title="Generate Trade" icon={Zap} onClose={onClose}>
      <div className="p-4 space-y-3">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Trade submitted</p>
              <p className="text-xs text-text-secondary mt-1">
                {direction === 'buy' ? 'Buy' : 'Sell'} ${Number(amount).toLocaleString()} of {pair.split('/')[0]} via {protocol}
              </p>
            </div>
            <div className="w-full rounded-md p-2.5 text-left" style={{ background: '#0D1117', border: '1px solid #30363D' }}>
              <p className="text-[10px] text-text-secondary mb-1">Tx Hash</p>
              <p className="font-mono text-[10px] text-text-primary break-all">{txHash}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Link
                href="/dashboard/trades"
                onClick={onClose}
                className="flex-1 text-center py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
              >
                View Trades →
              </Link>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Direction toggle */}
            <div className="flex gap-2">
              {(['buy', 'sell'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDir(d)}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-xs font-semibold border transition-colors',
                    direction === d
                      ? d === 'buy' ? 'border-success bg-success/10 text-success' : 'border-error bg-error/10 text-error'
                      : 'border-border text-text-secondary hover:text-text-primary',
                  )}
                >
                  {d === 'buy' ? '↑ Buy' : '↓ Sell'}
                </button>
              ))}
            </div>

            {/* Pair */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Asset Pair</label>
              <div className="relative">
                <select
                  value={pair}
                  onChange={e => setPair(e.target.value)}
                  className="w-full appearance-none rounded-md px-3 pr-8 py-2 text-sm text-text-primary focus:outline-none cursor-pointer"
                  style={{ background: '#0D1117', border: '1px solid #30363D' }}
                >
                  {TRADE_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Amount (USD) <span className="text-error">*</span></label>
              <input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="500"
                type="number"
                min="1"
                className="w-full rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none transition-colors"
                style={{ background: '#0D1117', border: '1px solid #30363D' }}
              />
            </div>

            {/* Protocol */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Protocol</label>
              <div className="relative">
                <select
                  value={protocol}
                  onChange={e => setProtocol(e.target.value)}
                  className="w-full appearance-none rounded-md px-3 pr-8 py-2 text-sm text-text-primary focus:outline-none cursor-pointer"
                  style={{ background: '#0D1117', border: '1px solid #30363D' }}
                >
                  {TRADE_PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSubmit}
                disabled={!amount.trim() || isNaN(Number(amount)) || loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-primary hover:bg-primary-hover disabled:bg-border disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting…</> : <><Zap className="h-3.5 w-3.5" /> Execute Trade</>}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </ActionModal>
  )
}

// ─────────────────────────────────────────────────────────────────
// Quick action grid
// ─────────────────────────────────────────────────────────────────

type ModalKey = 'invite' | 'audit' | 'token' | 'trade'

const QUICK_ACTIONS: Array<{ label: string; Icon: React.ElementType; modal: ModalKey }> = [
  { label: 'Invite User',    Icon: UserPlus,    modal: 'invite' },
  { label: 'Run Audit',      Icon: ShieldCheck, modal: 'audit'  },
  { label: 'Generate Token', Icon: KeyRound,    modal: 'token'  },
  { label: 'Generate Trade', Icon: Zap,         modal: 'trade'  },
]

function QuickActionGrid({ onAction }: { onAction: (m: ModalKey) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {QUICK_ACTIONS.map(({ label, Icon, modal }) => (
        <button
          key={label}
          onClick={() => onAction(modal)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-page hover:border-primary/40 hover:bg-primary/5 px-2.5 py-2 transition-colors text-left"
        >
          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-[11px] font-medium text-text-primary truncate">{label}</span>
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// User locations
// ─────────────────────────────────────────────────────────────────

function UserLocationsList() {
  const total = Math.max(...USER_LOCATIONS.map((l) => l.users))
  return (
    <div className="space-y-2.5">
      {USER_LOCATIONS.slice(0, 4).map((loc) => (
        <div key={loc.region}>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-text-primary font-medium flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-text-disabled" />
              {loc.region}
            </span>
            <span className="text-text-secondary">{loc.pct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-page overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${(loc.users / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function RiskSummaryCard() {
  const { score, scale, level } = DASHBOARD_RISK_SUMMARY
  const tone =
    score < 30 ? 'text-success'
    : score < 60 ? 'text-warning'
    : 'text-error'
  const dotTone =
    score < 30 ? 'bg-success'
    : score < 60 ? 'bg-warning'
    : 'bg-error'

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold leading-none', tone)}>{score}</span>
        <span className="text-text-secondary text-xs">/ {scale}</span>
        <span className={cn(
          'ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]',
          score < 30 && 'bg-success/15 text-success',
          score >= 30 && score < 60 && 'bg-warning/15 text-warning',
          score >= 60 && 'bg-error/15 text-error',
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', dotTone)} />
          {level}
        </span>
      </div>
      <Link
        href="/dashboard/risk"
        className="block w-full text-center text-[11px] font-medium text-primary hover:text-primary-hover py-1.5 rounded-md border border-primary/30 hover:bg-primary/5 transition-colors"
      >
        View report →
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Main RightRail
// ─────────────────────────────────────────────────────────────────

export function RightRail() {
  const { unreadCount } = useAlertStore()
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null)

  return (
    <>
      <aside className="hidden xl:flex h-full w-[280px] flex-col border-l border-border bg-card shrink-0 overflow-y-auto scrollbar-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <h4 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-text-secondary" />
            Real-Time Ops
          </h4>
          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold text-error bg-error/15 px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        <PolicyEngineCard />

        <RailSection title="Recent Activity" action={
          <Link href="/dashboard/audit" className="text-[10px] text-text-link hover:text-text-link-hover">
            View all
          </Link>
        }>
          <RecentActivityList />
        </RailSection>

        <RailSection title="Quick Actions">
          <QuickActionGrid onAction={setActiveModal} />
        </RailSection>

        <RailSection title="User Locations">
          <UserLocationsList />
        </RailSection>

        <RailSection title="Risk Summary" action={
          <Gauge className="h-3 w-3 text-text-disabled" />
        }>
          <RiskSummaryCard />
        </RailSection>
      </aside>

      {/* Modals */}
      {activeModal === 'invite' && <InviteUserModal    onClose={() => setActiveModal(null)} />}
      {activeModal === 'audit'  && <RunAuditModal      onClose={() => setActiveModal(null)} />}
      {activeModal === 'token'  && <GenerateTokenModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'trade'  && <GenerateTradeModal onClose={() => setActiveModal(null)} />}
    </>
  )
}
