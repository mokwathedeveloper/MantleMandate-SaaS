'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FilterButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?:   boolean
  icon?:     ReactNode
  children:  ReactNode
}

export function FilterButton({ active = false, icon, children, className, ...rest }: FilterButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 h-9 rounded-md border px-3 text-[13px] font-medium transition-colors',
        active
          ? 'bg-primary/10 border-primary/40 text-primary'
          : 'bg-card border-border text-text-secondary hover:bg-surface hover:text-text-primary',
        className,
      )}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
