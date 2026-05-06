import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string
  error?:    string
  hint?:     string
  left?:     ReactNode
  right?:    ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, left, right, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {left && (
            <span className="absolute left-3 text-text-secondary pointer-events-none">{left}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-lg border bg-surface px-3 text-sm text-text-primary placeholder:text-text-secondary',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              error
                ? 'border-error focus:ring-error'
                : 'border-border hover:border-text-secondary',
              left  && 'pl-9',
              right && 'pr-9',
              className,
            )}
            {...props}
          />
          {right && (
            <span className="absolute right-3 text-text-secondary">{right}</span>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-text-secondary">{hint}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
export type { InputProps }
