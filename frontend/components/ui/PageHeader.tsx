import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title:    string
  subtitle?: string
  breadcrumb?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between', className)}>
      <div className="min-w-0">
        {breadcrumb && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-disabled mb-1.5">
            {breadcrumb}
          </p>
        )}
        <h1 className="text-2xl font-bold text-text-primary leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-1 max-w-3xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
}
