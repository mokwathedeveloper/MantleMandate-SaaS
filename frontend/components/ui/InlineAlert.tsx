'use client'

import { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tone = 'warning' | 'error' | 'success' | 'info'

interface InlineAlertProps {
  tone:  Tone
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

const TONE: Record<Tone, { bg: string; border: string; text: string; Icon: typeof AlertTriangle }> = {
  warning: { bg: 'bg-warning-bg', border: 'border-warning', text: 'text-warning', Icon: AlertTriangle },
  error:   { bg: 'bg-error-bg',   border: 'border-error',   text: 'text-error',   Icon: XCircle       },
  success: { bg: 'bg-success-bg', border: 'border-success', text: 'text-success', Icon: CheckCircle2  },
  info:    { bg: 'bg-primary/10', border: 'border-primary', text: 'text-text-link', Icon: Info        },
}

export function InlineAlert({ tone, title, description, action, className }: InlineAlertProps) {
  const c = TONE[tone]
  // error/warning demand immediate attention — use role="alert" (assertive); info/success use "status" (polite)
  const role = tone === 'error' || tone === 'warning' ? 'alert' : 'status'
  return (
    <div
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-start gap-3 rounded-lg border-l-4 px-4 py-3',
        c.bg, c.border, className,
      )}
    >
      <c.Icon className={cn('h-5 w-5 shrink-0 mt-0.5', c.text)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', c.text)}>{title}</p>
        {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
