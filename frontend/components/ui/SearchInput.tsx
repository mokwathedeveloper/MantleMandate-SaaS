'use client'

import { ChangeEvent } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value:        string
  onChange:     (v: string) => void
  placeholder?: string
  className?:   string
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-border bg-page pl-9 pr-3 text-sm text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none transition-colors"
      />
    </div>
  )
}
