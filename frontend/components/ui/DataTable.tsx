'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key:      string
  header:   ReactNode
  align?:   'left' | 'right' | 'center'
  width?:   string
  className?: string
  render:   (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns:  DataTableColumn<T>[]
  rows:     T[]
  rowKey:   (row: T) => string
  empty?:   ReactNode
  className?: string
}

export function DataTable<T>({ columns, rows, rowKey, empty, className }: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-page border-b border-border">
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  'px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary',
                  c.align === 'right'  && 'text-right',
                  c.align === 'center' && 'text-center',
                  (!c.align || c.align === 'left') && 'text-left',
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-text-secondary">
                {empty ?? 'No data'}
              </td>
            </tr>
          ) : rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-border/60 last:border-b-0 hover:bg-surface transition-colors"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    'px-4 py-3 text-text-primary',
                    c.align === 'right'  && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.className,
                  )}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
