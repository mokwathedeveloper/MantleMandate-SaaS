import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionCardProps extends HTMLAttributes<HTMLDivElement> {
  title?:    ReactNode
  subtitle?: ReactNode
  action?:   ReactNode
  bodyClassName?: string
  children:  ReactNode
  padding?:  'none' | 'sm' | 'md'
}

const bodyPadding = { none: '', sm: 'p-3', md: 'p-5' }

export function SectionCard({
  title, subtitle, action, bodyClassName, children, className, padding = 'md', ...rest
}: SectionCardProps) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-card overflow-hidden', className)}
      {...rest}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(bodyPadding[padding], bodyClassName)}>{children}</div>
    </div>
  )
}
