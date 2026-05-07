'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye, EyeOff, AlertCircle, Shield, Zap, Building2,
  Mail, Lock, ArrowRight, Loader2,
} from 'lucide-react'
import { useLogin } from '@/hooks/useAuth'
import {
  AuthShell, BrandLogo, MantleBadge, OrDivider, OAuthButtons,
} from '@/components/layout/AuthShell'
import { cn } from '@/lib/utils'

const schema = z.object({
  email:      z.string().email('Enter a valid email'),
  password:   z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

/* ─── Trust item ───────────────────────────────────────────────────── */

function TrustItem({
  Icon, title, body,
}: { Icon: typeof Shield; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
        <Icon className="h-[18px] w-[18px] text-primary" strokeWidth={2} />
      </div>
      <div className="pt-0.5">
        <p className="text-[14px] font-semibold text-text-primary">{title}</p>
        <p className="text-[13px] text-text-secondary mt-0.5">{body}</p>
      </div>
    </div>
  )
}

/* ─── Left panel ───────────────────────────────────────────────────── */

function LoginLeftPanel() {
  return (
    <>
      <BrandLogo />

      <div className="space-y-9">
        <div className="space-y-4 max-w-[420px]">
          <h1 className="text-[40px] font-bold text-text-primary leading-[1.1] tracking-[-0.01em]">
            Your mandates are<br />
            still <span className="text-primary">running.</span>
          </h1>
          <p className="text-[15px] text-text-secondary leading-[1.6]">
            Sign in to check your AI agent performance,
            review your on-chain audit trail, and
            manage your active mandates.
          </p>
        </div>

        <div className="space-y-5">
          <TrustItem Icon={Shield}    title="Non-Custodial"        body="We never hold your funds" />
          <TrustItem Icon={Zap}       title="Real-Time Execution"  body="Live P&L updated every block" />
          <TrustItem Icon={Building2} title="Built for Institutions" body="Compliance-ready, multisig-protected" />
        </div>
      </div>

      <MantleBadge />
    </>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [demoError, setDemoError] = useState(false)
  const searchParams = useSearchParams()
  const { mutate: login, isPending, error } = useLogin()

  // ?demo_error=1 (or =true) renders the error banner — handy for design QA / screenshots
  useEffect(() => {
    const v = searchParams?.get('demo_error')
    if (v === '1' || v === 'true') setDemoError(true)
  }, [searchParams])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  })

  const onSubmit = ({ email, password }: FormData) => {
    // Demo trigger: any email containing "fail" simulates an auth error
    if (email.includes('fail')) {
      setDemoError(true)
      return
    }
    setDemoError(false)
    login({ email, password })
  }

  const apiError = (() => {
    if (demoError) return 'Incorrect email or password. Please try again.'
    if (!error) return null
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message
      ?? 'Incorrect email or password. Please try again.'
  })()

  return (
    <AuthShell leftPanel={<LoginLeftPanel />}>
      <div className="mb-7">
        <h2 className="text-[28px] font-semibold text-text-primary leading-tight tracking-[-0.01em]">
          Welcome back
        </h2>
        <p className="text-[14px] text-text-secondary mt-1">
          Sign in to your MantleMandate account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] font-medium text-text-secondary">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled pointer-events-none" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
              className={cn(
                'w-full h-12 rounded-md border bg-page pl-10 pr-3 text-[14px] text-text-primary placeholder:text-text-disabled transition-colors focus:outline-none',
                errors.email
                  ? 'border-error focus:border-error'
                  : 'border-border focus:border-primary',
              )}
            />
          </div>
          {errors.email && (
            <p className="text-[12px] text-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] font-medium text-text-secondary">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password')}
              className={cn(
                'w-full h-12 rounded-md border bg-page pl-10 pr-10 text-[14px] text-text-primary placeholder:text-text-disabled transition-colors focus:outline-none',
                errors.password
                  ? 'border-error focus:border-error'
                  : 'border-border focus:border-primary',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px] text-error">{errors.password.message}</p>
          )}
        </div>

        {/* Options row */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-border bg-page accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            />
            <span className="text-[13px] text-text-secondary">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[13px] font-medium text-text-link hover:text-text-link-hover transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'w-full h-12 rounded-md bg-primary text-white text-[15px] font-semibold transition-colors',
            'hover:bg-primary-hover disabled:bg-border disabled:text-text-disabled disabled:cursor-not-allowed',
            'inline-flex items-center justify-center gap-2',
          )}
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
        </button>

        {/* Error banner */}
        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-md border border-error px-3.5 py-3"
            style={{ background: '#2D0F0F' }}
          >
            <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
            <p className="text-[13px] text-error leading-relaxed">{apiError}</p>
          </div>
        )}
      </form>

      <OrDivider label="or continue with" />
      <OAuthButtons />

      <p className="mt-6 text-center text-[13px] text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-text-link hover:text-text-link-hover font-medium inline-flex items-center gap-0.5 transition-colors"
        >
          Start for free <ArrowRight className="h-3.5 w-3.5 inline-block" />
        </Link>
      </p>
    </AuthShell>
  )
}
