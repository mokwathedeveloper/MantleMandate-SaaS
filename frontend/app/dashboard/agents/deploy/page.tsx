'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, Rocket, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useMandates } from '@/hooks/useMandates'
import { useDeployAgent } from '@/hooks/useAgents'
import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/components/ui/Badge'

const schema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters').max(255),
  mandateId:  z.string().uuid('Select a mandate'),
  capitalCap: z.number().min(10, 'Minimum $10').nullable(),
})
type FormData = z.infer<typeof schema>

const MANDATE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  draft:    'default',
  active:   'success',
  paused:   'warning',
  archived: 'outline',
}

export default function DeployAgentPage() {
  const router = useRouter()
  const { data: mandatesData, isLoading: mandatesLoading } = useMandates()
  const { mutate: deploy, isPending, error } = useDeployAgent()

  const mandates = (mandatesData?.data ?? []).filter(
    (m) => m.status === 'active' || m.status === 'draft'
  )

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', mandateId: '', capitalCap: null },
  })

  const selectedMandateId = watch('mandateId')
  const selectedMandate   = mandates.find((m) => m.id === selectedMandateId)

  const onSubmit = (data: FormData) =>
    deploy(
      { name: data.name, mandateId: data.mandateId, capitalCap: data.capitalCap ?? undefined },
      { onSuccess: () => router.push('/dashboard/agents') }
    )

  const apiError = error instanceof Error ? error.message : null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/agents" className="text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Deploy Agent</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Select a mandate and configure your agent
          </p>
        </div>
      </div>

      {apiError && <AlertBanner severity="error" className="mb-6">{apiError}</AlertBanner>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Agent Name */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Agent Identity</h3>
          <Input
            label="Agent name"
            placeholder="e.g. ETH Hunter #1"
            error={errors.name?.message}
            {...register('name')}
          />
        </Card>

        {/* Mandate selector */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Select Mandate</h3>

          {mandatesLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Spinner size="sm" />
              <span className="text-sm text-text-secondary">Loading mandates…</span>
            </div>
          ) : mandates.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <FileText className="h-8 w-8 text-text-secondary opacity-40" />
              <p className="text-sm text-text-secondary">No active mandates</p>
              <Link href="/dashboard/mandates/new" className="text-xs text-primary hover:underline">
                Create a mandate first →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {mandates.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setValue('mandateId', m.id, { shouldValidate: true })
                    if (!watch('name')) setValue('name', `${m.name} Agent`)
                  }}
                  className={cn(
                    'w-full text-left rounded-lg border p-3.5 transition-colors',
                    selectedMandateId === m.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-text-secondary',
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-text-primary">{m.name}</span>
                    <Badge variant={MANDATE_STATUS_VARIANT[m.status]}>{m.status}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{m.mandateText}</p>
                  {m.policyHash && (
                    <p className="font-mono text-[10px] text-text-secondary mt-2 truncate">
                      {m.policyHash.slice(0, 22)}…
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
          {errors.mandateId && (
            <p className="text-xs text-error mt-2">{errors.mandateId.message}</p>
          )}
        </Card>

        {/* Capital */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Capital Limit</h3>
          <Input
            label="Maximum capital (USD)"
            type="number"
            placeholder="Leave blank for no limit"
            hint="The agent will never deploy more than this amount"
            error={errors.capitalCap?.message}
            {...register('capitalCap', {
              setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
            })}
          />
        </Card>

        {selectedMandate && !selectedMandate.policyHash && (
          <AlertBanner severity="warning" title="No policy hash">
            This mandate hasn&apos;t been parsed by AI yet. The agent will deploy but cannot
            enforce mandate rules until a policy hash is generated.
          </AlertBanner>
        )}

        <AlertBanner severity="info" title="How deployment works">
          The agent evaluates your mandate against live Mantle DeFi market conditions every
          5 minutes. It can only take actions that satisfy your mandate policy and risk parameters.
        </AlertBanner>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" size="lg" loading={isPending}>
            <Rocket className="h-4 w-4" />
            Deploy Agent
          </Button>
        </div>
      </form>
    </div>
  )
}
