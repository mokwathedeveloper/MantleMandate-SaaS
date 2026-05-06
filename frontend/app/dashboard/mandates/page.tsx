'use client'

import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useMandates } from '@/hooks/useMandates'
import { formatDate } from '@/lib/utils'
import type { BadgeVariant } from '@/components/ui/Badge'

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  draft:    'default',
  active:   'success',
  paused:   'warning',
  archived: 'outline',
}

export default function MandatesPage() {
  const { data, isLoading } = useMandates()
  const mandates = data?.data ?? []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Mandates</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {data?.total ?? 0} mandate{(data?.total ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/mandates/new"
          className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Mandate
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : mandates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <FileText className="h-14 w-14 text-text-secondary opacity-40" />
          <div>
            <p className="text-lg font-semibold text-text-primary">No mandates yet</p>
            <p className="text-sm text-text-secondary mt-1 max-w-sm">
              Write your first investment mandate in plain English and let AI deploy an agent for you
            </p>
          </div>
          <Link
            href="/dashboard/mandates/new"
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create your first mandate
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mandates.map((m) => (
            <Link key={m.id} href={`/dashboard/mandates/${m.id}`}>
              <Card hover padding="md">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-text-primary text-sm leading-snug">{m.name}</h3>
                  <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
                </div>
                <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mb-4">
                  {m.mandateText}
                </p>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{m.baseCurrency}</span>
                  <span>{formatDate(m.createdAt)}</span>
                </div>
                {m.policyHash && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="font-mono-data text-text-secondary truncate">
                      {m.policyHash.slice(0, 18)}…
                    </p>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
