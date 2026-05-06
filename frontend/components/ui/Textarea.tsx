import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:   string
  error?:   string
  hint?:    string
  counter?: boolean
  maxLength?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, counter, maxLength, className, id, value, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="flex flex-col gap-1.5">
        {(label || (counter && maxLength)) && (
          <div className="flex items-center justify-between">
            {label && (
              <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
                {label}
              </label>
            )}
            {counter && maxLength && (
              <span className={cn('text-xs tabular-nums', charCount > maxLength * 0.9 ? 'text-warning' : 'text-text-secondary')}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary',
            'resize-none transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            error
              ? 'border-error focus:ring-error'
              : 'border-border hover:border-text-secondary',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-text-secondary">{hint}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
export type { TextareaProps }
