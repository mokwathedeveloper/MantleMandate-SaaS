import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'primary' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?:     boolean
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface text-text-secondary border border-border',
  success: 'bg-success/15 text-success border border-success/30',
  error:   'bg-error/15 text-error border border-error/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  primary: 'bg-primary/15 text-primary border border-primary/30',
  outline: 'bg-transparent text-text-secondary border border-border',
}

function Badge({ variant = 'default', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-success': variant === 'success',
            'bg-error':   variant === 'error',
            'bg-warning': variant === 'warning',
            'bg-primary': variant === 'primary',
            'bg-text-secondary': variant === 'default' || variant === 'outline',
          })}
        />
      )}
      {children}
    </span>
  )
}

export { Badge }
export type { BadgeProps, BadgeVariant }
