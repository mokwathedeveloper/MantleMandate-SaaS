'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle2, Shield, TrendingUp, Network, Eye as EyeIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSignup } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { AuthShell, BrandLogo, MantleBadge, OrDivider, OAuthButtons } from '@/components/layout/AuthShell'

const schema = z
  .object({
    name:            z.string().min(2, 'Please enter your full name'),
    email:           z.string().email('Please enter a valid email address'),
    password:        z.string()
      .min(8, "Password doesn't meet requirements")
      .regex(/[A-Z]/, "Password doesn't meet requirements")
      .regex(/[0-9]/, "Password doesn't meet requirements"),
    confirmPassword: z.string(),
    company:         z.string().optional(),
    terms:           z.boolean().refine((v) => v, 'You must agree to the terms to continue'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type FormData = z.infer<typeof schema>

// ── Password Strength ─────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const criteria = [
    { label: '8+ characters',     met: password.length >= 8 },
    { label: 'Uppercase letter',  met: /[A-Z]/.test(password) },
    { label: 'Number',            met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = criteria.filter((c) => c.met).length

  // 1=red, 2=orange, 3=yellow, 4=green
  const barColor = (i: number) => {
    if (i > score) return 'bg-border'
    if (score === 1) return 'bg-error'
    if (score === 2) return 'bg-orange'
    if (score === 3) return 'bg-warning'
    return 'bg-success'
  }

  if (!password) return null

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', barColor(i))} />
        ))}
        {score > 0 && (
          <span className={cn('text-xs ml-2 shrink-0',
            score === 4 ? 'text-success' : score === 3 ? 'text-warning' : score === 2 ? 'text-orange' : 'text-error',
          )}>
            {['', 'Weak', 'Fair', 'Good', 'Strong'][score]}
          </span>
        )}
      </div>
      <p className="text-xs text-text-secondary">
        Min 8 characters, 1 uppercase, 1 number
      </p>
    </div>
  )
}

// ── Left panel ────────────────────────────────────────────────────────────────

function SignupLeftPanel() {
  return (
    <>
      <BrandLogo />

      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-[44px] font-black text-text-primary leading-[1.1]">
            Trade{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #0066FF, #00C2FF)' }}
            >
              smarter.
            </span>
            <br />
            Not harder.
          </h1>
          <p className="text-[15px] text-text-secondary leading-[1.6] max-w-sm">
            Join MantleMandate and deploy your first AI trading
            agent in minutes — no coding, no wallet required to start.
          </p>
        </div>

        <div className="space-y-5">
          {[
            { Icon: Shield,     color: 'text-primary',  text: 'Enterprise-grade security — multisig wallet protection' },
            { Icon: TrendingUp, color: 'text-success',  text: 'AI agents that follow YOUR rules — not ours' },
            { Icon: Network,    color: 'text-primary',  text: 'Executes across Mantle DeFi protocols automatically' },
            { Icon: EyeIcon,    color: 'text-primary',  text: 'Full on-chain audit trail — share publicly or keep private' },
          ].map(({ Icon, color, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon className={cn('h-5 w-5 shrink-0', color)} />
              <p className="text-sm text-text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <MantleBadge />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function SignupPageInner() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: signup, isPending, error } = useSignup()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
  })

  const password      = watch('password') ?? ''
  const confirmPwd    = watch('confirmPassword') ?? ''
  const termsValue    = watch('terms')
  const passwordsMatch = password.length > 0 && confirmPwd.length > 0 && password === confirmPwd

  const onSubmit = ({ name, email, password, company }: FormData) =>
    signup({ name, email, password, company })

  const apiError = error
    ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Signup failed. Please try again.')
    : null

  return (
    <AuthShell leftPanel={<SignupLeftPanel />}>
      <h2 className="text-[28px] font-bold text-text-primary leading-tight mb-1">
        Start in 60 Seconds
      </h2>
      <p className="text-sm text-text-secondary mb-7">
        No wallet required. No credit card to sign up. Cancel any time.
      </p>

      {apiError && (
        <div className="flex items-start gap-2.5 rounded-md border border-error bg-error-bg p-3 mb-5">
          <p className="text-[13px] text-error leading-relaxed">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          type="text"
          placeholder="John Smith"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Create password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            right={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register('password')}
          />
          <PasswordStrength password={password} />
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          right={
            passwordsMatch
              ? <CheckCircle2 className="h-4 w-4 text-success" />
              : undefined
          }
          {...register('confirmPassword')}
        />

        <Input
          label="Company name (optional)"
          type="text"
          placeholder="Your firm or DAO"
          autoComplete="organization"
          {...register('company')}
        />

        {/* Terms */}
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border border-border bg-input checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors cursor-pointer shrink-0"
              {...register('terms')}
              checked={termsValue}
            />
            <span className="text-[13px] text-text-secondary leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" className="text-text-link hover:text-text-link-hover transition-colors">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-text-link hover:text-text-link-hover transition-colors">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs text-error pl-6">{errors.terms.message}</p>
          )}
        </div>

        <Button type="submit" fullWidth loading={isPending} className="h-11 text-[15px]">
          Create My Account
        </Button>
      </form>

      <OrDivider label="or sign up with" />
      <OAuthButtons />

      <p className="mt-5 text-center text-[13px] text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-text-link hover:text-text-link-hover font-medium transition-colors">
          Sign in →
        </Link>
      </p>

      {/* What happens next */}
      <div className="mt-6 flex items-center justify-center gap-1.5 flex-wrap text-center">
        {[
          'After signing up',
          'Connect wallet (optional)',
          'Write your first mandate',
          'Deploy your agent',
        ].map((step, i, arr) => (
          <span key={step} className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-disabled">
              {step}
            </span>
            {i < arr.length - 1 && (
              <span className="text-text-disabled text-[11px]">→</span>
            )}
          </span>
        ))}
      </div>
    </AuthShell>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  )
}
