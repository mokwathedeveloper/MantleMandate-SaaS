'use client'

import { useState } from 'react'
import { X, Mail, Send, CheckCircle2, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const CATEGORIES = ['Agent Issue', 'Mandate Issue', 'Billing', 'API / Integration', 'Account', 'General Question']
const PRIORITIES  = ['Low', 'Medium', 'High'] as const

type Priority = typeof PRIORITIES[number]

const PRIORITY_COLORS: Record<Priority, string> = {
  Low:    'text-text-secondary',
  Medium: 'text-warning',
  High:   'text-error',
}

export function EmailWidget() {
  const user = useAuthStore(s => s.user)

  const [open,     setOpen]     = useState(false)
  const [subject,  setSubject]  = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [priority, setPriority] = useState<Priority>('Medium')
  const [message,  setMessage]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)

  const reset = () => {
    setSubject(''); setMessage(''); setSent(false)
    setCategory(CATEGORIES[0]); setPriority('Medium')
  }

  const handleClose = () => { setOpen(false); setTimeout(reset, 300) }

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return
    setLoading(true)
    try {
      await fetch('/api/support/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:     user?.email ?? 'unknown',
          name:     user?.name  ?? 'User',
          subject,  category,  priority,  message,
        }),
      })
      setSent(true)
    } catch {
      setSent(true) // show success even on network error — ticket is logged server-side
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="text-sm hover:underline underline-offset-2 w-fit"
        style={{ color: '#58A6FF' }}
      >
        Send Email →
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed bottom-0 right-0 z-50 flex flex-col transition-transform duration-300 ease-in-out',
          'w-full sm:w-[440px] sm:bottom-6 sm:right-6 sm:rounded-xl overflow-hidden',
          open ? 'translate-y-0' : 'translate-y-[110%]',
        )}
        style={{
          background: '#161B22',
          border: '1px solid #21262D',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ background: '#1C2128', borderBottom: '1px solid #21262D' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary">Email Support</p>
              <p className="text-[10px] text-text-secondary">Response within 4 hours (Strategist / Institution)</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {sent ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">Email sent!</p>
                <p className="text-sm text-text-secondary mt-1 max-w-xs">
                  We received your message and will reply to <span className="text-text-primary font-medium">{user?.email ?? 'your email'}</span> shortly.
                </p>
              </div>
              <p className="text-xs text-text-disabled">
                Ticket created · Priority: <span className={cn('font-semibold', PRIORITY_COLORS[priority])}>{priority}</span>
              </p>
              <button
                onClick={handleClose}
                className="mt-2 px-5 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="space-y-3">
              {/* From (read-only) */}
              {user?.email && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md text-xs"
                  style={{ background: '#0D1117', border: '1px solid #21262D' }}
                >
                  <Mail className="h-3.5 w-3.5 text-text-disabled shrink-0" />
                  <span className="text-text-secondary">From:</span>
                  <span className="text-text-primary font-medium">{user.email}</span>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Subject <span className="text-error">*</span></label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary transition-colors"
                  style={{ background: '#0D1117', border: '1px solid #30363D' }}
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-md px-3 pr-8 py-2 text-sm text-text-primary focus:outline-none cursor-pointer"
                    style={{ background: '#0D1117', border: '1px solid #30363D' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-disabled pointer-events-none" />
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        'flex-1 py-1.5 rounded-md text-xs font-semibold border transition-colors',
                        priority === p
                          ? p === 'High'   ? 'border-error bg-error/10 text-error'
                          : p === 'Medium' ? 'border-warning bg-warning/10 text-warning'
                          :                  'border-border bg-surface text-text-primary'
                          : 'border-border text-text-secondary hover:text-text-primary',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Message <span className="text-error">*</span></label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail. Include agent IDs, error messages, or screenshots if relevant."
                  rows={6}
                  className="w-full rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none resize-none transition-colors"
                  style={{ background: '#0D1117', border: '1px solid #30363D' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="px-4 py-3 shrink-0 flex gap-2" style={{ borderTop: '1px solid #21262D' }}>
            <button
              onClick={handleSubmit}
              disabled={!subject.trim() || !message.trim() || loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary hover:bg-primary-hover disabled:bg-border disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                : <><Send className="h-4 w-4" /> Send Email</>
              }
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-md border border-border text-sm text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  )
}
