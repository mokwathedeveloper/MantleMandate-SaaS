import { HTMLAttributes, ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertSeverity = 'info' | 'success' | 'warning' | 'error'

interface AlertBannerProps extends HTMLAttributes<HTMLDivElement> {
  severity?:  AlertSeverity
  title?:     string
  children?:  ReactNode
  onDismiss?: () => void
}

const styles: Record<AlertSeverity, { wrapper: string; icon: string; Icon: typeof Info }> = {
  info:    { wrapper: 'bg-primary/10 border-primary/30 text-primary',   icon: 'text-primary',  Icon: Info },
  success: { wrapper: 'bg-success/10 border-success/30 text-success',   icon: 'text-success',  Icon: CheckCircle2 },
  warning: { wrapper: 'bg-warning/10 border-warning/30 text-warning',   icon: 'text-warning',  Icon: TriangleAlert },
  error:   { wrapper: 'bg-error/10   border-error/30   text-error',     icon: 'text-error',    Icon: AlertCircle },
}

function AlertBanner({ severity = 'info', title, children, onDismiss, className, ...props }: AlertBannerProps) {
  const { wrapper, Icon } = styles[severity]

  return (
    <div
      role="alert"
      className={cn('flex gap-3 rounded-lg border p-3.5 text-sm', wrapper, className)}
      {...props}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div className="opacity-90">{children}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export { AlertBanner }
export type { AlertBannerProps, AlertSeverity }
