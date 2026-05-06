'use client'

import { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?:    string
  size?:     'sm' | 'md'
}

const track: Record<'sm' | 'md', string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
}
const thumb: Record<'sm' | 'md', string> = {
  sm: 'h-3.5 w-3.5 translate-x-0.5 peer-checked:translate-x-[18px]',
  md: 'h-4.5 w-4.5 translate-x-0.5 peer-checked:translate-x-[22px]',
}

function Toggle({ label, size = 'md', className, id, ...props }: ToggleProps) {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <label htmlFor={toggleId} className={cn('inline-flex items-center gap-2.5 cursor-pointer select-none', className)}>
      <span className="relative">
        <input
          id={toggleId}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            'block rounded-full transition-colors duration-200',
            'bg-border peer-checked:bg-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-page',
            track[size],
          )}
        />
        <span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200',
            thumb[size],
          )}
        />
      </span>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  )
}

export { Toggle }
