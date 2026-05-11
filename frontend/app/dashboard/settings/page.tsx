'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Eye, EyeOff, Plus, Trash2,
  Copy, Check, X, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Section =
  | 'general' | 'password'
  | 'notifications' | 'display' | 'language'
  | '2fa' | 'sessions' | 'apikeys'
  | 'billing' | 'usage'
  | 'danger'

interface ApiKey { id: string; name: string; created: string; lastUsed: string; permissions: string }

const INITIAL_KEYS: ApiKey[] = [
  { id: '1', name: 'Bybit Integration',  created: 'Apr 1, 2026',  lastUsed: '2 min ago', permissions: 'Read only' },
  { id: '2', name: 'Custom Dashboard',   created: 'Mar 15, 2026', lastUsed: '1 day ago', permissions: 'Read only' },
]

const EMAIL_TOGGLE_LABELS = [
  'Trade executions', 'Trade failures', 'Drawdown alerts', 'Mandate breach alerts',
  'Daily performance summary', 'Weekly summary', 'System updates', 'Marketing emails',
]
const EMAIL_TOGGLE_DEFAULTS = [true, true, true, true, false, false, true, false]

// ─── Primitives ─────────────────────────────────────────────────────────────

function Toggle({ on, locked, onChange }: { on: boolean; locked?: boolean; onChange?: (v: boolean) => void }) {
  const [state, setState] = useState(on)
  const toggle = () => {
    if (locked) return
    const next = !state
    setState(next)
    onChange?.(next)
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={state}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors shrink-0',
        state ? 'bg-primary' : 'bg-surface border border-border',
        locked && 'cursor-not-allowed opacity-70',
      )}
    >
      <span className={cn(
        'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
        state ? 'translate-x-4' : 'translate-x-0.5',
      )} />
    </button>
  )
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-[6px] px-4 py-3 text-sm font-medium"
      style={{ background: '#0D2818', border: '1px solid #22C55E', color: '#22C55E' }}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {msg}
    </div>
  )
}

function SaveActions({ label = 'Save Changes', onSave, onCancel }: { label?: string; onSave: () => void; onCancel?: () => void }) {
  return (
    <div className="flex gap-2 pt-4 border-t border-border mt-2">
      <button
        onClick={onSave}
        className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-md transition-colors"
      >
        {label}
      </button>
      <button
        onClick={onCancel}
        className="border border-border text-text-secondary text-sm px-4 py-2 rounded-md hover:text-text-primary transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}

function CopyOnceButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Copy Key'}
    </button>
  )
}

// ─── Nav data ────────────────────────────────────────────────────────────────

type NavItem = { key: Section; label: string; href?: string }

const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  { group: 'Account', items: [
    { key: 'general',  label: 'General' },
    { key: 'general',  label: 'Profile', href: '/dashboard/profile' },   // external link
    { key: 'password', label: 'Password' },
  ]},
  { group: 'Preferences', items: [
    { key: 'notifications', label: 'Notifications' },
    { key: 'display',       label: 'Display' },
    { key: 'language',      label: 'Language' },
  ]},
  { group: 'Security', items: [
    { key: '2fa',      label: 'Two-Factor Auth' },
    { key: 'sessions', label: 'Active Sessions' },
    { key: 'apikeys',  label: 'API Keys' },
  ]},
  { group: 'Billing', items: [
    { key: 'billing', label: 'Plan & Billing', href: '/dashboard/billing' },
    { key: 'usage',   label: 'Usage' },
  ]},
  { group: 'Danger Zone', items: [
    { key: 'danger', label: 'Danger Zone' },
  ]},
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('general')
  const [toast, setToast] = useState<string | null>(null)
  const save = (msg = 'Settings saved') => setToast(msg)

  // ── General state ──
  const [username]  = useState('john_michael')
  const [timezone]  = useState('UTC+2 (Eastern European Time)')
  const [lang, setLang] = useState('English')

  // ── Password state ──
  const [showCur, setShowCur]       = useState(false)
  const [showNew, setShowNew]       = useState(false)
  const [showConf, setShowConf]     = useState(false)

  // ── Notifications state ──
  const [emailToggles, setEmailToggles] = useState(EMAIL_TOGGLE_DEFAULTS)
  const [telegramUrl, setTelegramUrl]   = useState('')
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'connected' | 'failed'>('idle')

  const testTelegram = () => {
    setTelegramStatus(telegramUrl.startsWith('https://') ? 'connected' : 'failed')
  }

  // ── Display state ──
  const [theme, setTheme]           = useState<'dark' | 'light' | 'system'>('dark')
  const [layout, setLayout]         = useState<'expanded' | 'compact'>('expanded')
  const [timeRange, setTimeRange]   = useState('1 Month')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [numFormat, setNumFormat]   = useState('1,234.56')
  const [currency, setCurrency]     = useState('USD ($)')

  // ── 2FA state ──
  const [show2faModal, setShow2faModal] = useState(false)

  // ── API Key state ──
  const [keys, setKeys]               = useState<ApiKey[]>(INITIAL_KEYS)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [newKeyName, setNewKeyName]     = useState('')
  const [newKeyPerm, setNewKeyPerm]     = useState('Read only')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)

  const generateKey = () => {
    if (!newKeyName.trim()) return
    const key = `mm_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    setGeneratedKey(key)
    setKeys(prev => [...prev, {
      id: String(Date.now()),
      name: newKeyName,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Never',
      permissions: newKeyPerm,
    }])
  }

  const closeKeyModal = () => {
    setShowKeyModal(false)
    setNewKeyName('')
    setNewKeyPerm('Read only')
    setGeneratedKey(null)
  }

  // ── Danger state ──
  const [deleteAllInput,     setDeleteAllInput]     = useState('')
  const [deleteAccountInput, setDeleteAccountInput] = useState('')

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <nav className="text-xs text-text-disabled">Home &rsaquo; Settings</nav>
      <h2 className="text-2xl font-bold text-text-primary">Settings</h2>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Sub-nav ── */}
        <aside className="w-full lg:w-[200px] shrink-0 space-y-4">
          {NAV_GROUPS.map(g => (
            <div key={g.group}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-disabled mb-1 px-2">
                {g.group}
              </p>
              {g.items.map((item, idx) => {
                if (item.href) {
                  return (
                    <Link
                      key={`${item.key}-${idx}`}
                      href={item.href}
                      className="flex items-center gap-1 w-full text-left text-[13px] font-medium px-2 py-1.5 rounded transition-colors text-text-secondary hover:text-text-primary"
                    >
                      {item.label}
                      <ExternalLink className="h-3 w-3 opacity-40 shrink-0" />
                    </Link>
                  )
                }
                const active = section === item.key
                return (
                  <button
                    key={`${item.key}-${idx}`}
                    onClick={() => setSection(item.key)}
                    className={cn(
                      'w-full text-left text-[13px] font-medium px-2 py-1.5 rounded transition-colors border-l-2',
                      active
                        ? 'text-primary border-primary bg-primary/5 pl-[6px]'
                        : 'text-text-secondary hover:text-text-primary border-transparent',
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </aside>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ──────────── General ──────────── */}
          {section === 'general' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">Account Information</h4>
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-40 shrink-0">Email</span>
                  <span className="text-sm text-text-primary flex-1">john@example.com</span>
                  <span className="text-xs text-success font-medium shrink-0">Verified ✓</span>
                  <button className="text-xs border border-border rounded px-2 py-1 h-7 text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0">
                    Change Email
                  </button>
                </div>
                {/* Username */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-40 shrink-0">Username</span>
                  <span className="text-sm text-text-primary flex-1">{username}</span>
                  <button className="text-xs border border-border rounded px-2 py-1 h-7 text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0">
                    Change
                  </button>
                </div>
                {/* Time Zone */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-40 shrink-0">Time Zone</span>
                  <span className="text-sm text-text-primary flex-1">{timezone}</span>
                  <button className="text-xs border border-border rounded px-2 py-1 h-7 text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0">
                    Change
                  </button>
                </div>
                {/* Language */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-40 shrink-0">Language</span>
                  <span className="text-sm text-text-primary flex-1">{lang}</span>
                  <button
                    onClick={() => setSection('language')}
                    className="text-xs border border-border rounded px-2 py-1 h-7 text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>
              <SaveActions onSave={() => save()} onCancel={() => setToast('Changes discarded')} />
            </div>
          )}

          {/* ──────────── Password ──────────── */}
          {section === 'password' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">Change Password</h4>
              {[
                { label: 'Current password',     show: showCur,  toggle: () => setShowCur(v => !v) },
                { label: 'New password',          show: showNew,  toggle: () => setShowNew(v => !v) },
                { label: 'Confirm new password',  show: showConf, toggle: () => setShowConf(v => !v) },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <label className="text-xs text-text-secondary">{f.label}</label>
                  <div className="relative">
                    <input
                      type={f.show ? 'text' : 'password'}
                      className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={f.toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {f.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <SaveActions label="Update Password" onSave={() => save('Password updated')} onCancel={() => setToast('Changes discarded')} />
            </div>
          )}

          {/* ──────────── Notifications ──────────── */}
          {section === 'notifications' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Notification Preferences</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Control how MantleMandate notifies you about your agents and trades.
                </p>
              </div>

              {/* Email toggles */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
                  Email Notifications
                </p>
                {EMAIL_TOGGLE_LABELS.map((lbl, i) => (
                  <div key={lbl} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{lbl}</span>
                    <Toggle
                      on={emailToggles[i]}
                      onChange={v => setEmailToggles(prev => prev.map((p, j) => j === i ? v : p))}
                    />
                  </div>
                ))}
              </div>

              {/* In-app */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
                  In-App Notifications
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">All system alerts</span>
                  <Toggle on locked />
                </div>
                <p className="text-xs text-text-disabled italic">
                  In-app alerts cannot be disabled for system-critical events (errors, mandate breaches).
                </p>
              </div>

              {/* Telegram */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
                  Telegram Webhook
                </p>
                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    value={telegramUrl}
                    onChange={e => { setTelegramUrl(e.target.value); setTelegramStatus('idle') }}
                    placeholder="https://hooks.telegram..."
                    className="flex-1 min-w-[180px] bg-input border border-border rounded-md px-3 py-2 font-mono text-xs text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={testTelegram}
                    className="px-3 py-2 border border-border rounded-md text-xs text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0"
                  >
                    Test Connection
                  </button>
                  <button
                    onClick={() => save('Telegram webhook saved')}
                    className="px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs rounded-md transition-colors shrink-0"
                  >
                    Save
                  </button>
                </div>
                {telegramStatus === 'connected' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <Check className="h-3.5 w-3.5" /> Connected ✓
                  </span>
                )}
                {telegramStatus === 'failed' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-error">
                    <X className="h-3.5 w-3.5" /> Connection failed
                  </span>
                )}
              </div>

              <SaveActions onSave={() => save()} onCancel={() => setToast('Changes discarded')} />
            </div>
          )}

          {/* ──────────── Display ──────────── */}
          {section === 'display' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-5">
              <h4 className="text-sm font-semibold text-text-primary">Display Preferences</h4>

              {/* Theme — radio buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-text-secondary w-40 shrink-0">Default theme</span>
                <div className="flex items-center gap-4 flex-wrap">
                  {([['dark', 'Dark Mode'], ['light', 'Light Mode'], ['system', 'System']] as const).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value={val}
                        checked={theme === val}
                        onChange={() => setTheme(val)}
                        className="accent-primary"
                      />
                      <span className="text-sm text-text-secondary">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Layout — radio buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-text-secondary w-40 shrink-0">Dashboard layout</span>
                <div className="flex items-center gap-4">
                  {(['expanded', 'compact'] as const).map(val => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="layout"
                        value={val}
                        checked={layout === val}
                        onChange={() => setLayout(val)}
                        className="accent-primary"
                      />
                      <span className="text-sm text-text-secondary capitalize">{val}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dropdowns */}
              {[
                { label: 'Default time range', value: timeRange,   set: setTimeRange,   options: ['1 Week', '1 Month', '3 Months', '1 Year'] },
                { label: 'Date format',        value: dateFormat,  set: setDateFormat,  options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
                { label: 'Number format',      value: numFormat,   set: setNumFormat,   options: ['1,234.56', '1.234,56', '1 234.56'] },
                { label: 'Currency display',   value: currency,    set: setCurrency,    options: ['USD ($)', 'EUR (€)', 'GBP (£)', 'MNT'] },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-40 shrink-0">{r.label}</span>
                  <select
                    value={r.value}
                    onChange={e => r.set(e.target.value)}
                    className="bg-input border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {r.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <SaveActions onSave={() => save()} onCancel={() => setToast('Changes discarded')} />
            </div>
          )}

          {/* ──────────── Language ──────────── */}
          {section === 'language' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">Language</h4>
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary w-40 shrink-0">Interface language</span>
                <select
                  value={lang}
                  onChange={e => setLang(e.target.value)}
                  className="bg-input border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
                >
                  {['English', 'French', 'Spanish', 'German', 'Chinese (Simplified)', 'Japanese'].map(l => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <SaveActions onSave={() => save()} onCancel={() => setToast('Changes discarded')} />
            </div>
          )}

          {/* ──────────── Two-Factor Auth ──────────── */}
          {section === '2fa' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">Two-Factor Authentication</h4>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded font-semibold uppercase border"
                  style={{ background: '#0D2818', color: '#22C55E', borderColor: 'rgba(34,197,94,0.3)' }}
                >
                  ENABLED ✓
                </span>
                <button
                  onClick={() => setShow2faModal(true)}
                  className="text-xs border border-error text-error rounded px-2 py-1 hover:bg-error/10 transition-colors"
                >
                  Disable 2FA
                </button>
                <button className="text-xs border border-border text-text-secondary rounded px-2 py-1 hover:border-primary hover:text-text-primary transition-colors">
                  Change Method
                </button>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <span className="text-text-secondary w-16 shrink-0">Method:</span>
                  <span className="text-text-primary">SMS to +1 (555) 000-0000</span>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-text-secondary w-16 shrink-0">Backup:</span>
                  <span className="text-text-primary">Recovery codes generated</span>
                  <button className="text-xs text-text-link hover:text-text-link-hover">[View Codes]</button>
                </div>
              </div>
            </div>
          )}

          {/* ──────────── Active Sessions ──────────── */}
          {section === 'sessions' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-text-primary">Active Sessions (2)</h4>
                <button className="text-xs text-error hover:underline">Revoke All Other Sessions</button>
              </div>
              {[
                { browser: 'Chrome on macOS',    location: 'San Francisco', when: 'Active now',  current: true },
                { browser: 'Firefox on Windows', location: 'New York',      when: '2 hours ago', current: false },
              ].map(s => (
                <div key={s.browser} className="flex items-center justify-between border border-border rounded-md p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-text-primary">{s.browser}</p>
                      {s.current && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{s.location} · {s.when}</p>
                  </div>
                  {!s.current && (
                    <button className="text-xs border border-border rounded px-2 py-1 text-error hover:bg-error/10 transition-colors">
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ──────────── API Keys ──────────── */}
          {section === 'apikeys' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">API Keys</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    API keys allow external applications to interact with MantleMandate.
                  </p>
                </div>
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Generate New API Key
                </button>
              </div>

              <div className="overflow-x-auto border border-border rounded-md">
              <div style={{ minWidth: 540 }}>
                <div
                  className="grid px-4 py-2.5 bg-page"
                  style={{ gridTemplateColumns: '25% 18% 18% 20% auto' }}
                >
                  {['NAME', 'CREATED', 'LAST USED', 'PERMISSIONS', 'ACTIONS'].map(h => (
                    <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{h}</span>
                  ))}
                </div>
                {keys.map((k, i) => (
                  <div
                    key={k.id}
                    className={cn('grid px-4 items-center', i % 2 === 0 ? 'bg-card' : 'bg-page')}
                    style={{ gridTemplateColumns: '25% 18% 18% 20% auto', minHeight: '44px' }}
                  >
                    <span className="text-sm text-text-primary font-medium">{k.name}</span>
                    <span className="text-xs text-text-secondary">{k.created}</span>
                    <span className="text-xs text-text-secondary">{k.lastUsed}</span>
                    <span className="text-xs text-text-secondary">{k.permissions}</span>
                    <button
                      onClick={() => setKeys(prev => prev.filter(x => x.id !== k.id))}
                      className="flex items-center gap-1 text-xs text-error hover:underline"
                    >
                      <Trash2 className="h-3 w-3" /> Revoke
                    </button>
                  </div>
                ))}
                {keys.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-text-secondary">
                    No API keys yet.
                  </div>
                )}
              </div>{/* /minWidth */}
              </div>{/* /overflow-x-auto */}
            </div>
          )}

          {/* ──────────── Plan & Billing (redirect) ──────────── */}
          {section === 'billing' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h4 className="text-sm font-semibold text-text-primary">Plan & Billing</h4>
              <p className="text-sm text-text-secondary">
                Manage your subscription plan and payment methods on the Billing page.
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1.5 text-sm text-text-link hover:text-text-link-hover"
              >
                Go to Billing page <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* ──────────── Usage ──────────── */}
          {section === 'usage' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">Usage</h4>
              <div className="space-y-4">
                {[
                  { label: 'Active Agents',           used: 2,     total: 5 },
                  { label: 'Mandates',                used: 3,     total: 10 },
                  { label: 'API Calls (this month)',  used: 12400, total: 50000 },
                  { label: 'Trades Executed',         used: 84,    total: 500 },
                ].map(item => {
                  const pct = Math.round((item.used / item.total) * 100)
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="text-text-primary font-medium">
                          {item.used.toLocaleString()} / {item.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all', pct > 80 ? 'bg-warning' : 'bg-primary')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1.5 text-sm text-text-link hover:text-text-link-hover mt-2"
              >
                Manage plan <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* ──────────── Danger Zone ──────────── */}
          {section === 'danger' && (
            <div className="border border-error/30 bg-card rounded-lg p-5 space-y-5">
              <h4 className="text-sm font-semibold text-error">Danger Zone</h4>

              {/* Pause All Agents */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">Pause All Agents</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Immediately pause all active AI agents. Mandates are preserved.
                  </p>
                </div>
                <button className="shrink-0 border border-orange-500 text-orange-400 rounded-md px-3 py-1.5 text-sm hover:bg-orange-500/10 transition-colors">
                  Pause All Agents
                </button>
              </div>

              {/* Delete All Mandates */}
              <div className="space-y-3 pb-5 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Delete All Mandates</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Permanently delete all mandates and their associated agents. This cannot be undone.
                    </p>
                  </div>
                  <button
                    disabled={deleteAllInput !== 'DELETE ALL'}
                    className={cn(
                      'shrink-0 border border-error text-error rounded-md px-3 py-1.5 text-sm transition-colors',
                      deleteAllInput === 'DELETE ALL'
                        ? 'hover:bg-error/10 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    Delete All Mandates
                  </button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-text-disabled">
                    Type <code className="text-error font-mono text-xs">DELETE ALL</code> to confirm
                  </p>
                  <input
                    value={deleteAllInput}
                    onChange={e => setDeleteAllInput(e.target.value)}
                    placeholder="DELETE ALL"
                    className="bg-input border border-border rounded-md px-3 py-2 text-sm font-mono text-text-primary w-64 focus:outline-none focus:border-error"
                  />
                </div>
              </div>

              {/* Delete Account */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Delete Account</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Permanently delete your account, mandates, agents, and all data.
                    </p>
                  </div>
                  <button
                    disabled={deleteAccountInput !== 'DELETE'}
                    className={cn(
                      'shrink-0 border border-error text-error rounded-md px-3 py-1.5 text-sm transition-colors',
                      deleteAccountInput === 'DELETE'
                        ? 'hover:bg-error/10 cursor-pointer'
                        : 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    Delete Account
                  </button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-text-disabled">
                    Type <code className="text-error font-mono text-xs">DELETE</code> to confirm
                  </p>
                  <input
                    value={deleteAccountInput}
                    onChange={e => setDeleteAccountInput(e.target.value)}
                    placeholder="DELETE"
                    className="bg-input border border-border rounded-md px-3 py-2 text-sm font-mono text-text-primary w-64 focus:outline-none focus:border-error"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Disable 2FA Modal ── */}
      {show2faModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-[400px] p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-text-primary">Disable Two-Factor Authentication</h3>
              <button
                onClick={() => setShow2faModal(false)}
                className="text-text-secondary hover:text-text-primary shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-text-secondary">
              Disabling 2FA will make your account less secure. Enter your current password to confirm.
            </p>
            <div className="space-y-1">
              <label className="text-xs text-text-secondary">Current password</label>
              <input
                type="password"
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-error"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShow2faModal(false); save('Two-factor authentication disabled') }}
                className="flex-1 bg-error hover:bg-error/80 text-white text-sm py-2.5 rounded-md transition-colors"
              >
                Disable 2FA
              </button>
              <button
                onClick={() => setShow2faModal(false)}
                className="px-4 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Generate API Key Modal ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-[420px] p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-text-primary">
                {generatedKey ? 'API Key Generated' : 'Generate New API Key'}
              </h3>
              <button onClick={closeKeyModal} className="text-text-secondary hover:text-text-primary shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            {generatedKey ? (
              <>
                <p className="text-sm text-text-secondary">
                  Copy your API key now. It will{' '}
                  <span className="text-warning font-semibold">not be shown again.</span>
                </p>
                <div className="bg-page border border-border rounded-md p-3 font-mono text-xs text-text-primary break-all select-all">
                  {generatedKey}
                </div>
                <div className="flex gap-2">
                  <CopyOnceButton text={generatedKey} />
                  <button
                    onClick={closeKeyModal}
                    className="flex-1 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-colors py-1.5"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">Key name</label>
                  <input
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                    placeholder="e.g. Trading Bot Integration"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary">Permissions</label>
                  <div className="space-y-1.5">
                    {['Read only', 'Read + Write'].map(p => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="keyperm"
                          value={p}
                          checked={newKeyPerm === p}
                          onChange={() => setNewKeyPerm(p)}
                          className="accent-primary"
                        />
                        <span className="text-sm text-text-secondary">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={generateKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2.5 rounded-md transition-colors"
                  >
                    Generate
                  </button>
                  <button
                    onClick={closeKeyModal}
                    className="px-4 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
