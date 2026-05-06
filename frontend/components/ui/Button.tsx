import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant
  size?:     Size
  loading?:  boolean
  fullWidth?: boolean
}

const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40'

const variants: Record<Variant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-hover active:brightness-90',
  secondary: 'bg-surface text-text-primary border border-border hover:bg-card active:brightness-90',
  ghost:     'text-text-secondary hover:text-text-primary hover:bg-surface',
  danger:    'bg-error text-white hover:brightness-90',
  outline:   'border border-primary text-primary hover:bg-primary/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-8  px-3  text-xs',
  md: 'h-10 px-4  text-sm',
  lg: 'h-12 px-6  text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
