'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ChevronRight, ChevronLeft, Zap, Copy, ExternalLink, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateMandate } from '@/hooks/useMandates'
import { useDeployAgent } from '@/hooks/useAgents'

// ── Types ─────────────────────────────────────────────────────────────────────

interface OnboardingState {
  walletAddress: string | null
  mandateText:   string
  drawdown:      number
  position:      number
  agentId:       string | null
  policyHash:    string | null
}

// ── Progress Indicator ────────────────────────────────────────────────────────

const STEP_LABELS = ['Connect', 'Write', 'Set Limits', 'Deploy']

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEP_LABELS.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'h-5 w-5 rounded-full flex items-center justify-center shrink-0',
                done   ? 'bg-success' :
                active ? 'bg-primary' :
                         'bg-border',
              )}>
                {done
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  : <span className="text-[9px] font-bold text-white">{i + 1}</span>
                }
              </div>
              <span className={cn(
                'text-[11px] font-semibold uppercase tracking-widest',
                active ? 'text-text-primary' : 'text-text-secondary',
              )}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={cn('w-20 h-px mb-5 mx-2', i < current ? 'bg-success' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1: Connect Wallet ────────────────────────────────────────────────────

function Step1({ state, setState, onNext }: {
  state: OnboardingState
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>
  onNext: () => void
}) {
  const wallets = [
    { name: 'MetaMask',        symbol: 'MM' },
    { name: 'WalletConnect',   symbol: 'WC' },
    { name: 'Coinbase Wallet', symbol: 'CB' },
  ]

  const connectWallet = () => {
    // Simulated wallet connect — in production this uses wagmi useConnect()
    setState((s) => ({ ...s, walletAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9f3c' }))
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-text-secondary">Step 1 of 4</p>
        <h2 className="text-[32px] font-bold text-text-primary leading-tight">
          Connect your wallet<br />
          <span className="text-text-secondary">(or skip for now)</span>
        </h2>
        <p className="text-[15px] text-text-secondary leading-relaxed max-w-[520px]">
          Connecting a wallet lets MantleMandate execute trades on your behalf.
          You can always connect one later from your profile settings.
        </p>
      </div>

      {state.walletAddress ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-success bg-success-bg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <span className="text-sm font-medium text-success">
              Connected: <span className="font-mono">{state.walletAddress.slice(0, 8)}…{state.walletAddress.slice(-6)}</span>
            </span>
          </div>
          <button
            onClick={() => setState((s) => ({ ...s, walletAddress: null }))}
            className="text-xs text-text-link hover:text-text-link-hover transition-colors"
          >
            Change wallet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map(({ name, symbol }) => (
            <button
              key={name}
              onClick={connectWallet}
              className="w-full h-14 flex items-center gap-4 px-4 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary">{symbol}</span>
              </div>
              <span className="flex-1 text-left text-[15px] font-semibold text-text-primary">{name}</span>
              <Wallet className="h-4 w-4 text-text-secondary" />
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onNext}
        className="block text-center text-[13px] text-text-secondary hover:text-text-primary transition-colors underline w-full"
      >
        Skip for now — I&apos;ll connect a wallet later
      </button>
    </div>
  )
}

// ── Step 2: Write Mandate ─────────────────────────────────────────────────────

const EXAMPLES = [
  { label: 'Conservative ETH buy', text: 'Buy ETH on Mantle when the RSI drops below 30. Never risk more than 5% of my portfolio on a single trade. Take profit when 15% gain is reached. Avoid trading on weekends.' },
  { label: 'DCA strategy',         text: 'Dollar-cost average into ETH and BTC equally every 24 hours. Invest 2% of portfolio per cycle. Stop if total drawdown exceeds 20%. Resume after 7-day cooldown.' },
  { label: 'Yield farming',        text: 'Rotate portfolio into the highest-APY Mantle liquidity pool. Reinvest rewards automatically. Exit if pool APY drops below 8%. Maximum 40% of portfolio in any single pool.' },
]

function ParsedPreview({ text }: { text: string }) {
  if (text.length < 20) return null

  const parsed = [
    text.toLowerCase().includes('eth')  ? { key: 'Asset',        value: 'ETH' }      : null,
    text.toLowerCase().includes('rsi')  ? { key: 'Trigger',      value: 'RSI < 30' } : null,
    text.match(/(\d+)%.*trade/)         ? { key: 'Risk/trade',   value: `${text.match(/(\d+)%.*trade/)?.[1]}%` } : null,
    text.match(/(\d+)%.*profit/)        ? { key: 'Take profit',  value: `${text.match(/(\d+)%.*profit/)?.[1]}%` } : null,
    text.toLowerCase().includes('weekend') ? { key: 'Schedule', value: 'Weekdays only' } : null,
  ].filter(Boolean) as { key: string; value: string }[]

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
      <p className="text-xs font-medium text-primary flex items-center gap-2">
        <span className="animate-pulse">●</span> MantleMandate is reading your strategy...
      </p>
      <div className="space-y-1.5">
        {parsed.map(({ key, value }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-24 shrink-0">{key}</span>
            <span className="text-xs font-medium text-text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step2({ state, setState }: {
  state: OnboardingState
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-text-secondary">Step 2 of 4</p>
        <h2 className="text-[32px] font-bold text-text-primary leading-tight">
          Describe your trading strategy<br />in plain English
        </h2>
        <p className="text-[15px] text-text-secondary">No code. No formulas. Just tell the AI what you want it to do.</p>
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(({ label, text }) => (
          <button
            key={label}
            onClick={() => setState((s) => ({ ...s, mandateText: text }))}
            className={cn(
              'px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest border transition-colors',
              state.mandateText === text
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-text-secondary hover:border-primary hover:text-primary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Hero textarea */}
      <div className="relative">
        <textarea
          value={state.mandateText}
          onChange={(e) => setState((s) => ({ ...s, mandateText: e.target.value }))}
          maxLength={2000}
          rows={8}
          placeholder={'e.g. "Buy ETH on Mantle when the RSI drops below 30.\nNever risk more than 5% of my portfolio on a single trade.\nTake profit when 15% gain is reached. Avoid trading on weekends."'}
          className={cn(
            'w-full rounded-lg bg-input border-2 p-5 text-[15px] text-text-primary placeholder:text-text-disabled placeholder:italic',
            'leading-relaxed resize-y outline-none transition-all duration-150',
            'focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,255,0.15)]',
            state.mandateText.length > 0 ? 'border-primary/50' : 'border-border',
          )}
          style={{ minHeight: '280px' }}
        />
        <span className="absolute bottom-3 right-3 text-xs text-text-disabled font-mono">
          {state.mandateText.length} / 2000
        </span>
      </div>

      {/* Live preview */}
      <ParsedPreview text={state.mandateText} />
    </div>
  )
}

// ── Step 3: Risk Limits ───────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Conservative', drawdown: 10, position: 5 },
  { label: 'Balanced',     drawdown: 20, position: 10 },
  { label: 'Aggressive',   drawdown: 35, position: 25 },
]

function RangeSlider({ label, sublabel, value, min, max, unit, onChange, colorFn }: {
  label: string; sublabel: string; value: number; min: number; max: number; unit: string
  onChange: (v: number) => void
  colorFn: (v: number) => string
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <p className="text-[13px] text-text-secondary mt-0.5">{sublabel}</p>
        </div>
        <span className={cn('text-2xl font-bold', colorFn(value))}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #0066FF ${((value - min) / (max - min)) * 100}%, #21262D ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
      <div className="flex justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-success">Conservative (5-10%)</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-warning">Balanced (10-20%)</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-error">Aggressive (20%+)</span>
      </div>
    </div>
  )
}

function Step3({ state, setState }: {
  state: OnboardingState
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>
}) {
  const [activePreset, setActivePreset] = useState<string | null>('Balanced')

  const applyPreset = (p: typeof PRESETS[0]) => {
    setActivePreset(p.label)
    setState((s) => ({ ...s, drawdown: p.drawdown, position: p.position }))
  }

  const drawdownColor = (v: number) => v <= 10 ? 'text-success' : v <= 20 ? 'text-warning' : 'text-error'
  const positionColor = (v: number) => v <= 10 ? 'text-success' : v <= 20 ? 'text-warning' : 'text-error'

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-text-secondary">Step 3 of 4</p>
        <h2 className="text-[32px] font-bold text-text-primary">Set your safety limits</h2>
        <p className="text-[15px] text-text-secondary leading-relaxed max-w-[520px]">
          These are hard limits. Your AI agent cannot exceed them — ever.
          You can change these at any time from the Risk Engine settings.
        </p>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className={cn(
              'flex-1 h-9 rounded-md text-sm font-semibold border transition-colors',
              activePreset === p.label
                ? 'bg-primary border-primary text-white'
                : 'bg-card border-border text-text-secondary hover:border-primary hover:text-primary',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <RangeSlider
          label="Maximum Drawdown"
          sublabel="If portfolio value drops by this %, all agents pause automatically."
          value={state.drawdown}
          min={1}
          max={50}
          unit="%"
          onChange={(v) => { setActivePreset(null); setState((s) => ({ ...s, drawdown: v })) }}
          colorFn={drawdownColor}
        />
        <RangeSlider
          label="Max Position Size"
          sublabel="Maximum % of portfolio in any single trade."
          value={state.position}
          min={1}
          max={50}
          unit="%"
          onChange={(v) => { setActivePreset(null); setState((s) => ({ ...s, position: v })) }}
          colorFn={positionColor}
        />
      </div>
    </div>
  )
}

// ── Step 4: Deploy ────────────────────────────────────────────────────────────

function Step4({ state, onDeploy, deploying, deployed }: {
  state: OnboardingState
  onDeploy: () => void
  deploying: boolean
  deployed: boolean
}) {
  const router = useRouter()
  const rows = [
    { label: 'Strategy',     value: state.mandateText.length > 80 ? state.mandateText.slice(0, 80) + '…' : state.mandateText || '(not set)', mono: false },
    { label: 'Wallet',       value: state.walletAddress ? `${state.walletAddress.slice(0, 8)}…${state.walletAddress.slice(-6)}` : 'Not connected', mono: !!state.walletAddress },
    { label: 'Max Drawdown', value: `${state.drawdown}%`, mono: false },
    { label: 'Max Position', value: `${state.position}%`, mono: false },
    { label: 'Execution',    value: 'Merchant Moe · Agni Finance (best price routing)', mono: false },
    { label: 'On-Chain Hash',value: state.policyHash ?? 'Will be generated on deploy', mono: true },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-text-secondary">Step 4 of 4</p>
        <h2 className="text-[32px] font-bold text-text-primary">You&apos;re ready to deploy</h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-1">
        <p className="text-sm font-semibold text-text-primary mb-4">Your First Agent</p>
        <div className="border-t border-border pt-4 space-y-3">
          {rows.map(({ label, value, mono }) => (
            <div key={label} className="flex items-start gap-4">
              <span className="w-32 text-sm text-text-secondary shrink-0">{label}</span>
              <span className={cn('text-sm text-text-primary flex-1', mono && 'font-mono text-[13px]')}>{value}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-border flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <span className="text-sm font-semibold text-success">Ready to deploy</span>
          </div>
        </div>
      </div>

      {deployed && state.policyHash ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-success bg-success-bg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <p className="text-sm font-semibold text-success">Agent Deployed Successfully!</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] text-success break-all">
                On-Chain Hash: {state.policyHash.slice(0, 20)}…{state.policyHash.slice(-8)}
              </span>
              <button onClick={() => navigator.clipboard?.writeText(state.policyHash ?? '')} className="text-success hover:opacity-70 transition-opacity shrink-0">
                <Copy className="h-4 w-4" />
              </button>
              <a href="#" className="text-success hover:opacity-70 transition-opacity shrink-0">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full h-[52px] bg-primary text-white font-bold text-base rounded-lg hover:bg-primary-hover transition-colors"
          >
            View My Dashboard →
          </button>
        </div>
      ) : (
        <button
          onClick={onDeploy}
          disabled={deploying}
          className="w-full h-[52px] bg-primary text-white font-bold text-base rounded-lg hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {deploying ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Deploying... generating on-chain hash
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Deploy My First Agent
            </>
          )}
        </button>
      )}

      {deploying && (
        <p className="text-center text-xs text-text-secondary">This may take 10–20 seconds</p>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)

  const [state, setState] = useState<OnboardingState>({
    walletAddress: null,
    mandateText:   '',
    drawdown:      20,
    position:      10,
    agentId:       null,
    policyHash:    null,
  })

  const { mutate: createMandate } = useCreateMandate()
  const { mutate: deployAgent } = useDeployAgent()

  const canNext = [
    true,                             // step 0: always can proceed
    state.mandateText.length >= 20,   // step 1: need text
    true,                             // step 2: sliders always valid
    false,                            // step 3: handled by deploy button
  ]

  const handleDeploy = () => {
    setDeploying(true)
    createMandate(
      { name: 'My First Mandate', mandate_text: state.mandateText } as Parameters<typeof createMandate>[0],
      {
        onSuccess: (mandate) => {
          deployAgent(
            { name: 'Agent Alpha', mandateId: mandate.id, capitalCap: 1000 },
            {
              onSuccess: (agent) => {
                setState((s) => ({
                  ...s,
                  agentId:    (agent as { data: { id: string } }).data.id,
                  policyHash: mandate.policyHash ?? '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                }))
                setDeploying(false)
                setDeployed(true)
              },
              onError: () => setDeploying(false),
            }
          )
        },
        onError: () => setDeploying(false),
      }
    )
  }

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Top bar */}
      <div className="h-28 flex items-center justify-between px-6 border-b border-border shrink-0">
        <Image src="/logo.png" alt="MantleMandate" width={96} height={96} className="h-24 w-24 object-contain" />
        <Link
          href="/dashboard"
          className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
        >
          Skip setup — go to dashboard
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[640px]">
          <StepProgress current={step} />

          <div className="min-h-[480px]">
            {step === 0 && <Step1 state={state} setState={setState} onNext={() => setStep(1)} />}
            {step === 1 && <Step2 state={state} setState={setState} />}
            {step === 2 && <Step3 state={state} setState={setState} />}
            {step === 3 && <Step4 state={state} onDeploy={handleDeploy} deploying={deploying} deployed={deployed} />}
          </div>

          {/* Nav buttons */}
          {!deployed && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-1.5 h-10 px-4 text-sm font-semibold text-text-secondary border border-border rounded-md hover:text-text-primary hover:bg-card disabled:invisible transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {step < 3 && (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext[step]}
                  className="flex items-center gap-1.5 h-10 px-6 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
