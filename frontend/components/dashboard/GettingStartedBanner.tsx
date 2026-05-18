'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    id: 'create-mandate',
    title: 'Create your first mandate',
    body: 'Write a trading strategy in plain English — Claude AI parses it into a structured policy.',
    href: '/dashboard/mandates/new',
    cta: 'Create mandate',
  },
  {
    id: 'anchor-onchain',
    title: 'Anchor policy on-chain',
    body: 'Submit a cryptographic hash to Mantle Network — an immutable commitment to your strategy.',
    href: '/dashboard/mandates',
    cta: 'View mandates',
  },
  {
    id: 'deploy-agent',
    title: 'Deploy an AI agent',
    body: 'Bind your mandate to an execution agent — it trades autonomously every 5 minutes.',
    href: '/dashboard/agents',
    cta: 'Deploy agent',
  },
  {
    id: 'view-audit',
    title: 'Review the audit trail',
    body: 'Every trade decision is permanently recorded on Mantle Sepolia — fully verifiable.',
    href: '/dashboard/audit',
    cta: 'View audit',
  },
]

const DISMISSED_KEY = 'mm_onboarding_dismissed'
const DONE_KEY      = 'mm_onboarding_done'

export function GettingStartedBanner() {
  const [mounted,   setMounted]   = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [done,      setDone]      = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
    if (localStorage.getItem(DISMISSED_KEY)) setDismissed(true)
    const saved = JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]') as string[]
    setDone(new Set(saved))
  }, [])

  if (!mounted || dismissed) return null

  const completedCount = done.size
  const allDone        = completedCount === STEPS.length

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  const toggleDone = (id: string) => {
    const next = new Set(done)
    if (next.has(id)) next.delete(id); else next.add(id)
    setDone(next)
    localStorage.setItem(DONE_KEY, JSON.stringify([...next]))
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-text-disabled hover:text-text-primary transition-colors"
        aria-label="Dismiss getting started guide"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="pr-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-bold text-text-primary">Getting Started</span>
          <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            {completedCount}/{STEPS.length} complete
          </span>
          {allDone && (
            <span className="text-[11px] font-semibold text-success px-2 py-0.5 rounded-full bg-success-bg border border-success/20">
              All done!
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary">
          {allDone
            ? 'Your AI trading agents are running. Check the audit trail for live on-chain proof.'
            : 'Complete these steps to launch your first AI trading agent on Mantle Network.'}
        </p>
        <div className="mt-2.5 h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-1 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {STEPS.map((step, i) => {
          const isDone = done.has(step.id)
          return (
            <div
              key={step.id}
              className={cn(
                'rounded-lg border p-3.5 space-y-2 transition-colors',
                isDone
                  ? 'border-success/30 bg-success/5'
                  : 'border-border bg-card hover:border-primary/40',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
                  Step {i + 1}
                </span>
                <button
                  onClick={() => toggleDone(step.id)}
                  aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                  className="shrink-0 transition-colors"
                >
                  {isDone
                    ? <CheckCircle2 className="h-4 w-4 text-success" />
                    : <Circle className="h-4 w-4 text-text-disabled hover:text-primary" />
                  }
                </button>
              </div>

              <p className={cn(
                'text-[13px] font-semibold leading-snug',
                isDone ? 'text-success line-through decoration-success/50' : 'text-text-primary',
              )}>
                {step.title}
              </p>

              <p className="text-[11px] text-text-secondary leading-snug">{step.body}</p>

              <Link
                href={step.href}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                {step.cta}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
