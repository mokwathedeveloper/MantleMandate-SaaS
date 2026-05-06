'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open:      boolean
  onClose:   () => void
  title?:    string
  children:  ReactNode
  size?:     'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else {
      if (el.open) el.close()
    }
  }, [open])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const handler = () => onClose()
    el.addEventListener('close', handler)
    return () => el.removeEventListener('close', handler)
  }, [onClose])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'w-full rounded-2xl border border-border bg-card p-0 shadow-modal',
        'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        '[&:not([open])]:hidden',
        sizes[size],
        className,
      )}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="p-5">{children}</div>
    </dialog>
  )
}

export { Modal }
