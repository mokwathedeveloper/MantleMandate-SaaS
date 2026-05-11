'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, Rocket, FileText, CheckCircle2, Loader2, ExternalLink, Network, Bot } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useMandates } from '@/hooks/useMandates'
import { useDeployAgent } from '@/hooks/useAgents'
import { useRegisterAgent } from '@/hooks/useOnChain'
import { useAccount } from 'wagmi'
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

  // ── On-chain registration (Step 2) ────────────────────────────────────────
  const { isConnected } = useAccount()
  const {
    registerAgent,
    txHash:     regTxHash,
    isPending:  registering,
    confirming: confirmingReg,
    confirmed:  regConfirmed,
    writeError: regError,
    reset:      resetReg,
  } = useRegisterAgent()

  const [deployedAgent, setDeployedAgent] = useState<{ id: string; name: string; mandate_id: string } | null>(null)
  const [regDone, setRegDone] = useState(false)
  const regTriggered = useRef(false)

  useEffect(() => {
    if (regConfirmed && !regTriggered.current) {
      regTriggered.current = true
      setRegDone(true)
    }
  }, [regConfirmed])

  const handleRegisterOnChain = useCallback(async () => {
    const mandate = mandates.find(m => m.id === deployedAgent?.mandate_id)
    if (!mandate?.policyHash) return
    regTriggered.current = false
    try { await registerAgent(mandate.policyHash) } catch { /* writeError captures it */ }
  }, [deployedAgent, mandates, registerAgent])

  const onSubmit = (formData: FormData) =>
    deploy(
      { name: formData.name, mandateId: formData.mandateId, capitalCap: formData.capitalCap ?? undefined },
      {
        onSuccess: (result) => {
          const r = result as { id: string; mandate_id: string }
          setDeployedAgent({ id: r.id, name: formData.name, mandate_id: formData.mandateId })
        },
      }
    )

  const apiError = error instanceof Error ? error.message : null

  // ── Step 2: on-chain registration ──────────────────────────────────────────
  if (deployedAgent) {
    const regMandate = mandates.find(m => m.id === deployedAgent.mandate_id)
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Agent Deployed!</h1>
            <p className="text-sm text-text-secondary mt-0.5">{deployedAgent.name} is running</p>
          </div>
        </div>

        <Card padding="md">
          <div className="rounded-lg bg-surface border border-border p-3 mb-4 space-y-1">
            <p className="text-xs text-text-secondary">Agent ID</p>
            <p className="font-mono text-xs text-text-primary break-all">{deployedAgent.id}</p>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-text-primary mb-1">Register on Mantle Network</h4>
            <p className="text-xs text-text-secondary mb-4">
              Anchor this agent on-chain to create an immutable record and enable
              trustless execution against your mandate policy.
            </p>

            {regDone ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-success font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Agent registered on Mantle Sepolia
                </div>
                {regTxHash && (
                  <a
                    href={`https://explorer.sepolia.mantle.xyz/tx/${regTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80 transition-opacity"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View registration TX on explorer
                  </a>
                )}
              </div>
            ) : registering ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sign in your wallet…
              </div>
            ) : confirmingReg ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming on Mantle…
                {regTxHash && (
                  <a
                    href={`https://explorer.sepolia.mantle.xyz/tx/${regTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:opacity-80"
                  >
                    TX ↗
                  </a>
                )}
              </div>
            ) : !isConnected ? (
              <p className="text-sm text-text-secondary italic">
                Connect your wallet to register this agent on-chain.
              </p>
            ) : !regMandate?.policyHash ? (
              <AlertBanner severity="warning">
                The mandate has no policy hash — parse the mandate first to enable on-chain registration.
              </AlertBanner>
            ) : (
              <button
                onClick={handleRegisterOnChain}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
              >
                <Network className="h-4 w-4" />
                Register on Mantle
              </button>
            )}

            {regError && (
              <p className="text-xs text-error mt-3 truncate" title={regError.message}>
                {regError.message.slice(0, 100)}
                <button onClick={resetReg} className="ml-2 underline">retry</button>
              </p>
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push('/dashboard/mandates')}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
          >
            View Mandates
          </button>
          <button
            onClick={() => router.push('/dashboard/agents')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
          >
            <Bot className="h-4 w-4" />
            View My Agents
          </button>
        </div>
      </div>
    )
  }

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
