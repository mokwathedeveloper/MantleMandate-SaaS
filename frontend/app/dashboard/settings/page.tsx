'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useAgents } from '@/hooks/useAgents'
import { useMandates } from '@/hooks/useMandates'
import { useTrades } from '@/hooks/useTrades'
import { usePreferences, useUpdatePreferences, DEFAULT_PREFERENCES } from '@/hooks/usePreferences'
import { useTranslation } from '@/hooks/useTranslation'
import { UI_LOCALES } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
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

const INITIAL_KEYS: ApiKey[] = []

const EMAIL_TOGGLE_LABELS = [
  'Trade executions', 'Trade failures', 'Drawdown alerts', 'Mandate breach alerts',
  'Daily performance summary', 'Weekly summary', 'System updates', 'Marketing emails',
]
const EMAIL_TOGGLE_DEFAULTS = [true, true, true, true, false, false, true, false]

// Plan-tier usage limits — mirrors the tiers shown on the Billing page
// (operator / strategist / institution).
const PLAN_LIMITS: Record<string, { agents: number; mandates: number; trades: number }> = {
  operator:    { agents: 3,  mandates: 5,   trades: 250 },
  strategist:  { agents: 10, mandates: 25,  trades: 2500 },
  institution: { agents: 50, mandates: 100, trades: 25000 },
}

function parseUserAgent(ua: string): string {
  let browser = 'Unknown browser'
  if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('Chrome/')) browser = 'Chrome'
  else if (ua.includes('Firefox/')) browser = 'Firefox'
  else if (ua.includes('Safari/')) browser = 'Safari'

  let os = 'Unknown OS'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'

  return `${browser} on ${os}`
}

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
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-[6px] px-4 py-3 text-sm font-medium bg-success-bg border border-success text-success">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {msg}
    </div>
  )
}

function SaveActions({ label, onSave, onCancel, t }: { label?: string; onSave: () => void; onCancel?: () => void; t: (s: string) => string }) {
  return (
    <div className="flex gap-2 pt-4 border-t border-border mt-2">
      <button
        onClick={onSave}
        className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-md transition-colors"
      >
        {label ?? t('Save Changes')}
      </button>
      <button
        onClick={onCancel}
        className="border border-border text-text-secondary text-sm px-4 py-2 rounded-md hover:text-text-primary transition-colors"
      >
        {t('Cancel')}
      </button>
    </div>
  )
}

function CopyOnceButton({ text, t }: { text: string; t: (s: string) => string }) {
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
      {copied ? t('Copied!') : t('Copy Key')}
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
  const user = useAuthStore(s => s.user)
  const session = useAuthStore(s => s.session)
  const [section, setSection] = useState<Section>('general')
  const [toast, setToast] = useState<string | null>(null)
  const t = useTranslation()
  const save = (msg?: string) => setToast(msg ?? t('Settings saved'))

  // ── Usage data (real) ──
  const { data: agents }   = useAgents()
  const { data: mandates } = useMandates()
  const { data: trades }   = useTrades({ per_page: 1 })

  // ── General state ──
  const [username]  = useState(user?.name ?? '')
  const [timezone, setTimezone] = useState('—')
  const [lang, setLang] = useState('English')

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const offsetMin = -new Date().getTimezoneOffset()
      const sign = offsetMin >= 0 ? '+' : '-'
      const abs = Math.abs(offsetMin)
      const hh = Math.floor(abs / 60)
      const mm = abs % 60
      const offsetStr = mm === 0 ? `${hh}` : `${hh}:${String(mm).padStart(2, '0')}`
      setTimezone(`UTC${sign}${offsetStr} (${tz})`)
    } catch {
      setTimezone('UTC')
    }
  }, [])

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
  const [theme, setTheme]           = useState<'dark' | 'light' | 'system'>(DEFAULT_PREFERENCES.theme)
  const [layout, setLayout]         = useState<'expanded' | 'compact'>(DEFAULT_PREFERENCES.layout)
  const [timeRange, setTimeRange]   = useState(DEFAULT_PREFERENCES.timeRange)
  const [dateFormat, setDateFormat] = useState(DEFAULT_PREFERENCES.dateFormat)
  const [numFormat, setNumFormat]   = useState(DEFAULT_PREFERENCES.numberFormat)
  const [currency, setCurrency]     = useState(DEFAULT_PREFERENCES.currency)

  // ── Preferences (real, persisted to profiles.preferences) ──
  const { data: savedPrefs } = usePreferences()
  const updatePreferences = useUpdatePreferences()
  const prefsLoadedRef = useRef(false)

  useEffect(() => {
    if (!savedPrefs || prefsLoadedRef.current) return
    prefsLoadedRef.current = true
    setTheme(savedPrefs.theme)
    setLayout(savedPrefs.layout)
    setTimeRange(savedPrefs.timeRange)
    setDateFormat(savedPrefs.dateFormat)
    setNumFormat(savedPrefs.numberFormat)
    setCurrency(savedPrefs.currency)
    setLang(savedPrefs.language)
    setTelegramUrl(savedPrefs.telegramUrl)
    if (savedPrefs.emailToggles.length === EMAIL_TOGGLE_LABELS.length) {
      setEmailToggles(savedPrefs.emailToggles)
    }
  }, [savedPrefs])

  const saveDisplayPrefs = () => {
    updatePreferences.mutate({ theme, layout, timeRange, dateFormat, numberFormat: numFormat, currency })
    save(t('Display preferences saved'))
  }

  const saveLanguagePrefs = () => {
    updatePreferences.mutate({ language: lang })
    save(t('Language preference saved'))
  }

  const saveNotificationPrefs = () => {
    updatePreferences.mutate({ emailToggles, telegramUrl })
    save(t('Notification preferences saved'))
  }

  // ── 2FA state (real Supabase MFA) ──
  const [show2faModal, setShow2faModal] = useState(false)
  const [mfaFactor, setMfaFactor] = useState<{ id: string; friendly_name?: string; created_at: string } | null>(null)
  const [mfaLoading, setMfaLoading] = useState(true)
  const [show2faEnrollModal, setShow2faEnrollModal] = useState(false)
  const [enrollData, setEnrollData] = useState<{ id: string; qrCode: string; secret: string } | null>(null)
  const [enrollCode, setEnrollCode] = useState('')
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [enrollSubmitting, setEnrollSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.mfa.listFactors().then((result: Awaited<ReturnType<typeof supabase.auth.mfa.listFactors>>) => {
      const totp = result.data?.totp?.[0]
      setMfaFactor(totp ? { id: totp.id, friendly_name: totp.friendly_name, created_at: totp.created_at } : null)
      setMfaLoading(false)
    })
  }, [])

  const startEnroll2fa = async () => {
    setEnrollError(null)
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error) { setEnrollError(error.message); return }
    setEnrollData({ id: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret })
    setEnrollCode('')
    setShow2faEnrollModal(true)
  }

  const closeEnroll2faModal = () => {
    setShow2faEnrollModal(false)
    setEnrollData(null)
    setEnrollCode('')
    setEnrollError(null)
  }

  const verifyEnroll2fa = async () => {
    if (!enrollData) return
    setEnrollSubmitting(true)
    setEnrollError(null)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollData.id, code: enrollCode })
    setEnrollSubmitting(false)
    if (error) { setEnrollError(error.message); return }
    setMfaFactor({ id: enrollData.id, created_at: new Date().toISOString() })
    closeEnroll2faModal()
    save(t('Two-factor authentication enabled'))
  }

  const disable2fa = async () => {
    if (!mfaFactor) return
    const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactor.id })
    if (error) return
    setMfaFactor(null)
    setShow2faModal(false)
    save(t('Two-factor authentication disabled'))
  }

  // ── Active session state ──
  const [currentSessionLabel, setCurrentSessionLabel] = useState<string | null>(null)
  useEffect(() => {
    setCurrentSessionLabel(parseUserAgent(navigator.userAgent))
  }, [])

  const signOutOtherSessions = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' })
    if (!error) save(t('Signed out of all other sessions'))
  }

  const lastSignIn = session?.user?.last_sign_in_at ?? null

  // ── Usage (real) ──
  const activeAgentsCount = (agents ?? []).filter(a => a.status === 'active').length
  const mandatesCount = mandates?.total ?? 0
  const tradesCount = trades?.total ?? 0
  const planLimits = PLAN_LIMITS[user?.plan ?? 'operator']

  const usageItems = [
    { label: 'Active Agents',   used: activeAgentsCount, total: planLimits.agents },
    { label: 'Mandates',        used: mandatesCount,      total: planLimits.mandates },
    { label: 'Trades Executed', used: tradesCount,        total: planLimits.trades },
  ]

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

      <nav className="text-xs text-text-disabled">{t('Home')} &rsaquo; {t('Settings')}</nav>
      <h2 className="text-2xl font-bold text-text-primary">{t('Settings')}</h2>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Sub-nav ── */}
        <aside className="w-full lg:w-[200px] shrink-0 space-y-4">
          {NAV_GROUPS.map(g => (
            <div key={g.group}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-disabled mb-1 px-2">
                {t(g.group)}
              </p>
              {g.items.map((item, idx) => {
                if (item.href) {
                  return (
                    <Link
                      key={`${item.key}-${idx}`}
                      href={item.href}
                      className="flex items-center gap-1 w-full text-left text-[13px] font-medium px-2 py-1.5 rounded transition-colors text-text-secondary hover:text-text-primary"
                    >
                      {t(item.label)}
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
                    {t(item.label)}
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
              <h4 className="text-sm font-semibold text-text-primary">{t('Account Information')}</h4>
              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-40 shrink-0">{t('Email')}</span>
                  <span className="text-sm text-text-primary flex-1">{user?.email ?? '—'}</span>
                  <span className="text-xs text-success font-medium shrink-0">{t('Verified ✓')}</span>
                  <button className="text-xs border border-border rounded px-2 py-1 h-7 text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0">
                    {t('Change Email')}
                  </button>
                </div>
                {/* Username */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-40 shrink-0">{t('Username')}</span>
                  <span className="text-sm text-text-primary flex-1">{username}</span>
                  <button className="text-xs border border-border rounded px-2 py-1 h-7 text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0">
                    {t('Change')}
                  </button>
                </div>
                {/* Time Zone */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-40 shrink-0">{t('Time Zone')}</span>
                  <span className="text-sm text-text-primary flex-1">{timezone}</span>
                  <button className="text-xs border border-border rounded px-2 py-1 h-7 text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0">
                    {t('Change')}
                  </button>
                </div>
                {/* Language */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary w-40 shrink-0">{t('Language')}</span>
                  <span className="text-sm text-text-primary flex-1">{t(lang)}</span>
                  <button
                    onClick={() => setSection('language')}
                    className="text-xs border border-border rounded px-2 py-1 h-7 text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0"
                  >
                    {t('Change')}
                  </button>
                </div>
              </div>
              <SaveActions t={t} onSave={() => save()} onCancel={() => setToast(t('Changes discarded'))} />
            </div>
          )}

          {/* ──────────── Password ──────────── */}
          {section === 'password' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">{t('Change Password')}</h4>
              {[
                { label: 'Current password',     show: showCur,  toggle: () => setShowCur(v => !v) },
                { label: 'New password',          show: showNew,  toggle: () => setShowNew(v => !v) },
                { label: 'Confirm new password',  show: showConf, toggle: () => setShowConf(v => !v) },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <label className="text-xs text-text-secondary">{t(f.label)}</label>
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
              <SaveActions t={t} label={t('Update Password')} onSave={() => save(t('Password updated'))} onCancel={() => setToast(t('Changes discarded'))} />
            </div>
          )}

          {/* ──────────── Notifications ──────────── */}
          {section === 'notifications' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{t('Notification Preferences')}</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  {t('Control how MantleMandate notifies you about your agents and trades.')}
                </p>
              </div>

              {/* Email toggles */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
                  {t('Email Notifications')}
                </p>
                {EMAIL_TOGGLE_LABELS.map((lbl, i) => (
                  <div key={lbl} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{t(lbl)}</span>
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
                  {t('In-App Notifications')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{t('All system alerts')}</span>
                  <Toggle on locked />
                </div>
                <p className="text-xs text-text-disabled italic">
                  {t('In-app alerts cannot be disabled for system-critical events (errors, mandate breaches).')}
                </p>
              </div>

              {/* Telegram */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
                  {t('Telegram Webhook')}
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
                    {t('Test Connection')}
                  </button>
                  <button
                    onClick={() => save(t('Telegram webhook saved'))}
                    className="px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs rounded-md transition-colors shrink-0"
                  >
                    {t('Save')}
                  </button>
                </div>
                {telegramStatus === 'connected' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <Check className="h-3.5 w-3.5" /> {t('Connected ✓')}
                  </span>
                )}
                {telegramStatus === 'failed' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-error">
                    <X className="h-3.5 w-3.5" /> {t('Connection failed')}
                  </span>
                )}
              </div>

              <SaveActions t={t} onSave={saveNotificationPrefs} onCancel={() => setToast(t('Changes discarded'))} />
            </div>
          )}

          {/* ──────────── Display ──────────── */}
          {section === 'display' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-5">
              <h4 className="text-sm font-semibold text-text-primary">{t('Display Preferences')}</h4>

              {/* Theme — radio buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-text-secondary w-40 shrink-0">{t('Default theme')}</span>
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
                      <span className="text-sm text-text-secondary">{t(label)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Layout — radio buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-text-secondary w-40 shrink-0">{t('Dashboard layout')}</span>
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
                      <span className="text-sm text-text-secondary capitalize">{t(val)}</span>
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
                  <span className="text-sm text-text-secondary w-40 shrink-0">{t(r.label)}</span>
                  <select
                    value={r.value}
                    onChange={e => r.set(e.target.value)}
                    className="bg-input border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {r.options.map(o => <option key={o} value={o}>{t(o)}</option>)}
                  </select>
                </div>
              ))}

              <SaveActions t={t} onSave={saveDisplayPrefs} onCancel={() => setToast(t('Changes discarded'))} />
            </div>
          )}

          {/* ──────────── Language ──────────── */}
          {section === 'language' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">{t('Language')}</h4>
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary w-40 shrink-0">{t('Interface language')}</span>
                <select
                  value={lang}
                  onChange={e => setLang(e.target.value)}
                  className="bg-input border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
                >
                  {['English', 'French', 'Spanish', 'German', 'Chinese (Simplified)', 'Japanese'].map(l => (
                    <option key={l} value={l}>{t(l)}</option>
                  ))}
                </select>
              </div>
              {lang !== 'English' && lang !== 'French' && (
                <p className="text-xs text-text-secondary">
                  {t('More languages are coming soon. Your preference is saved and will be applied automatically once they ship.')}
                </p>
              )}
              <SaveActions t={t} onSave={saveLanguagePrefs} onCancel={() => setToast(t('Changes discarded'))} />
            </div>
          )}

          {/* ──────────── Two-Factor Auth ──────────── */}
          {section === '2fa' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">{t('Two-Factor Authentication')}</h4>
              {mfaLoading ? (
                <p className="text-sm text-text-secondary">{t('Loading…')}</p>
              ) : mfaFactor ? (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase border bg-success-bg text-success border-success/30">
                      {t('ENABLED ✓')}
                    </span>
                    <button
                      onClick={() => setShow2faModal(true)}
                      className="text-xs border border-error text-error rounded px-2 py-1 hover:bg-error/10 transition-colors"
                    >
                      {t('Disable 2FA')}
                    </button>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-text-secondary w-20 shrink-0">{t('Method:')}</span>
                      <span className="text-text-primary">{t('Authenticator app (TOTP)')}{mfaFactor.friendly_name ? ` — ${mfaFactor.friendly_name}` : ''}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-secondary w-20 shrink-0">{t('Enrolled:')}</span>
                      <span className="text-text-primary">
                        {new Date(mfaFactor.created_at).toLocaleDateString(UI_LOCALES[lang] ?? 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase border bg-surface text-text-secondary border-border">
                      {t('NOT ENABLED')}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {t('Add an extra layer of security to your account using a TOTP authenticator app (e.g. Google Authenticator, 1Password).')}
                  </p>
                  {enrollError && <p className="text-sm text-error">{enrollError}</p>}
                  <button
                    onClick={startEnroll2fa}
                    className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-md transition-colors"
                  >
                    {t('Enable 2FA')}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ──────────── Active Sessions ──────────── */}
          {section === 'sessions' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-text-primary">{t('Active Sessions')}</h4>
                <button onClick={signOutOtherSessions} className="text-xs text-error hover:underline">
                  {t('Sign Out Other Sessions')}
                </button>
              </div>
              <div className="flex items-center justify-between border border-border rounded-md p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-primary">{currentSessionLabel ?? t('This device')}</p>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                      {t('Current')}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {lastSignIn
                      ? `${t('Last sign-in:')} ${new Date(lastSignIn).toLocaleString(UI_LOCALES[lang] ?? 'en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}`
                      : t('Active now')}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                {t('"Sign Out Other Sessions" revokes access from all devices except this one.')}
              </p>
            </div>
          )}

          {/* ──────────── API Keys ──────────── */}
          {section === 'apikeys' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">{t('API Keys')}</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {t('API keys allow external applications to interact with MantleMandate.')}
                  </p>
                </div>
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-primary transition-colors shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('Generate New API Key')}
                </button>
              </div>

              <div className="overflow-x-auto border border-border rounded-md">
              <div style={{ minWidth: 540 }}>
                <div
                  className="grid px-4 py-2.5 bg-page"
                  style={{ gridTemplateColumns: '25% 18% 18% 20% auto' }}
                >
                  {['NAME', 'CREATED', 'LAST USED', 'PERMISSIONS', 'ACTIONS'].map(h => (
                    <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{t(h)}</span>
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
                    <span className="text-xs text-text-secondary">{t(k.lastUsed)}</span>
                    <span className="text-xs text-text-secondary">{t(k.permissions)}</span>
                    <button
                      onClick={() => setKeys(prev => prev.filter(x => x.id !== k.id))}
                      className="flex items-center gap-1 text-xs text-error hover:underline"
                    >
                      <Trash2 className="h-3 w-3" /> {t('Revoke')}
                    </button>
                  </div>
                ))}
                {keys.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-text-secondary">
                    {t('No API keys yet.')}
                  </div>
                )}
              </div>{/* /minWidth */}
              </div>{/* /overflow-x-auto */}
            </div>
          )}

          {/* ──────────── Plan & Billing (redirect) ──────────── */}
          {section === 'billing' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h4 className="text-sm font-semibold text-text-primary">{t('Plan & Billing')}</h4>
              <p className="text-sm text-text-secondary">
                {t('Manage your subscription plan and payment methods on the Billing page.')}
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1.5 text-sm text-text-link hover:text-text-link-hover"
              >
                {t('Go to Billing page')} <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* ──────────── Usage ──────────── */}
          {section === 'usage' && (
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h4 className="text-sm font-semibold text-text-primary">{t('Usage')}</h4>
              <div className="space-y-4">
                {usageItems.map(item => {
                  const pct = Math.round((item.used / item.total) * 100)
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{t(item.label)}</span>
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
                {t('Manage plan')} <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* ──────────── Danger Zone ──────────── */}
          {section === 'danger' && (
            <div className="border border-error/30 bg-card rounded-lg p-5 space-y-5">
              <h4 className="text-sm font-semibold text-error">{t('Danger Zone')}</h4>

              {/* Pause All Agents */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('Pause All Agents')}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {t('Immediately pause all active AI agents. Mandates are preserved.')}
                  </p>
                </div>
                <button className="shrink-0 border border-orange-500 text-orange-400 rounded-md px-3 py-1.5 text-sm hover:bg-orange-500/10 transition-colors">
                  {t('Pause All Agents')}
                </button>
              </div>

              {/* Delete All Mandates */}
              <div className="space-y-3 pb-5 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{t('Delete All Mandates')}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {t('Permanently delete all mandates and their associated agents. This cannot be undone.')}
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
                    {t('Delete All Mandates')}
                  </button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-text-disabled">
                    {t('Type')} <code className="text-error font-mono text-xs">DELETE ALL</code> {t('to confirm')}
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
                    <p className="text-sm font-medium text-text-primary">{t('Delete Account')}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {t('Permanently delete your account, mandates, agents, and all data.')}
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
                    {t('Delete Account')}
                  </button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-text-disabled">
                    {t('Type')} <code className="text-error font-mono text-xs">DELETE</code> {t('to confirm')}
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
              <h3 className="text-base font-semibold text-text-primary">{t('Disable Two-Factor Authentication')}</h3>
              <button
                onClick={() => setShow2faModal(false)}
                className="text-text-secondary hover:text-text-primary shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-text-secondary">
              {t('Disabling 2FA will make your account less secure. Are you sure you want to continue?')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={disable2fa}
                className="flex-1 bg-error hover:bg-error/80 text-white text-sm py-2.5 rounded-md transition-colors"
              >
                {t('Disable 2FA')}
              </button>
              <button
                onClick={() => setShow2faModal(false)}
                className="px-4 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('Cancel')}
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
                {generatedKey ? t('API Key Generated') : t('Generate New API Key')}
              </h3>
              <button onClick={closeKeyModal} className="text-text-secondary hover:text-text-primary shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            {generatedKey ? (
              <>
                <p className="text-sm text-text-secondary">
                  {t('Copy your API key now. It will')}{' '}
                  <span className="text-warning font-semibold">{t('not be shown again.')}</span>
                </p>
                <div className="bg-page border border-border rounded-md p-3 font-mono text-xs text-text-primary break-all select-all">
                  {generatedKey}
                </div>
                <div className="flex gap-2">
                  <CopyOnceButton text={generatedKey} t={t} />
                  <button
                    onClick={closeKeyModal}
                    className="flex-1 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-colors py-1.5"
                  >
                    {t('Done')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary">{t('Key name')}</label>
                  <input
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                    placeholder={t('e.g. Trading Bot Integration')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary">{t('Permissions')}</label>
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
                        <span className="text-sm text-text-secondary">{t(p)}</span>
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
                    {t('Generate')}
                  </button>
                  <button
                    onClick={closeKeyModal}
                    className="px-4 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Enable 2FA Modal ── */}
      {show2faEnrollModal && enrollData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-[400px] p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-text-primary">{t('Enable Two-Factor Authentication')}</h3>
              <button onClick={closeEnroll2faModal} className="text-text-secondary hover:text-text-primary shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-text-secondary">
              {t('Scan this QR code with your authenticator app, then enter the 6-digit code it generates.')}
            </p>
            <div className="flex justify-center bg-white rounded-md p-3">
              <img src={enrollData.qrCode} alt="2FA QR code" className="h-40 w-40" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-secondary">{t('Or enter this code manually')}</label>
              <div className="bg-page border border-border rounded-md p-2.5 font-mono text-xs text-text-primary break-all select-all">
                {enrollData.secret}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-secondary">{t('Verification code')}</label>
              <input
                value={enrollCode}
                onChange={e => setEnrollCode(e.target.value)}
                maxLength={6}
                inputMode="numeric"
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary tracking-widest text-center focus:outline-none focus:border-primary"
                placeholder="000000"
              />
            </div>
            {enrollError && <p className="text-sm text-error">{enrollError}</p>}
            <div className="flex gap-2">
              <button
                onClick={verifyEnroll2fa}
                disabled={enrollCode.length !== 6 || enrollSubmitting}
                className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2.5 rounded-md transition-colors"
              >
                {enrollSubmitting ? t('Verifying…') : t('Verify & Enable')}
              </button>
              <button
                onClick={closeEnroll2faModal}
                className="px-4 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
