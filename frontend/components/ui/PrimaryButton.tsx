'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?:    'sm' | 'md'
  icon?:    ReactNode
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-card border border-border text-text-primary hover:border-text-secondary hover:bg-surface',
  ghost:     'bg-transparent text-text-secondary hover:text-text-primary hover:bg-card',
  danger:    'bg-error text-white hover:bg-error/90',
}

const sizes = {
  sm: 'h-8  px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
}

export function PrimaryButton({
  variant = 'primary', size = 'md', icon, children, className, ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size], variants[variant], className,
      )}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
