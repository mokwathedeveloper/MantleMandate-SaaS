import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label:     string
  value:     ReactNode
  unit?:     string
  delta?:    string
  deltaTone?: 'positive' | 'negative' | 'neutral'
  icon?:     ReactNode
  spark?:    ReactNode
  className?: string
}

export function MetricCard({
  label, value, unit, delta, deltaTone = 'neutral', icon, spark, className,
}: MetricCardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-border bg-card px-5 py-4 flex flex-col gap-2',
      className,
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">
          {label}
        </span>
        {icon && <span className="text-text-disabled">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[26px] font-bold text-text-primary leading-none tracking-tight">
          {value}
        </span>
        {unit && <span className="text-sm text-text-secondary font-medium">{unit}</span>}
      </div>
      {delta && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          deltaTone === 'positive' && 'text-success',
          deltaTone === 'negative' && 'text-error',
          deltaTone === 'neutral'  && 'text-text-secondary',
        )}>
          {deltaTone === 'positive' && <TrendingUp className="h-3.5 w-3.5" />}
          {deltaTone === 'negative' && <TrendingDown className="h-3.5 w-3.5" />}
          <span>{delta}</span>
        </div>
      )}
      {spark && <div className="mt-1 h-8">{spark}</div>}
    </div>
  )
}
