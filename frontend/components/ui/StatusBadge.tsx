import { cn } from '@/lib/utils'

type StatusKind =
  | 'active'
  | 'paused'
  | 'pending'
  | 'failed'
  | 'inactive'
  | 'success'
  | 'review'
  | 'connected'
  | 'beta'

interface StatusBadgeProps {
  status:   StatusKind
  label?:   string
  withDot?: boolean
  className?: string
}

const styles: Record<StatusKind, { bg: string; text: string; dot: string }> = {
  active:    { bg: 'bg-success/15',  text: 'text-success',  dot: 'bg-success'  },
  success:   { bg: 'bg-success/15',  text: 'text-success',  dot: 'bg-success'  },
  connected: { bg: 'bg-success/15',  text: 'text-success',  dot: 'bg-success'  },
  paused:    { bg: 'bg-warning/15',  text: 'text-warning',  dot: 'bg-warning'  },
  pending:   { bg: 'bg-warning/15',  text: 'text-warning',  dot: 'bg-warning'  },
  review:    { bg: 'bg-warning/15',  text: 'text-warning',  dot: 'bg-warning'  },
  beta:      { bg: 'bg-primary/15',  text: 'text-primary',  dot: 'bg-primary'  },
  failed:    { bg: 'bg-error/15',    text: 'text-error',    dot: 'bg-error'    },
  inactive:  { bg: 'bg-surface',     text: 'text-text-secondary', dot: 'bg-text-disabled' },
}

const LABELS: Record<StatusKind, string> = {
  active:    'Active',
  success:   'Success',
  connected: 'Connected',
  paused:    'Paused',
  pending:   'Pending',
  review:    'Review',
  beta:      'Beta',
  failed:    'Failed',
  inactive:  'Inactive',
}

export function StatusBadge({ status, label, withDot = true, className }: StatusBadgeProps) {
  const s = styles[status]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
      s.bg, s.text, className,
    )}>
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />}
      {label ?? LABELS[status]}
    </span>
  )
}
