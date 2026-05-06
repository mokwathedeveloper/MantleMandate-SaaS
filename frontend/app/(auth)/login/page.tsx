'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, Shield, Zap, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLogin } from '@/hooks/useAuth'
import { AuthShell, BrandLogo, MantleBadge, OrDivider, OAuthButtons } from '@/components/layout/AuthShell'

const schema = z.object({
  email:      z.string().email('Enter a valid email'),
  password:   z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

// ── Left panel ────────────────────────────────────────────────────────────────

function LoginLeftPanel() {
  return (
    <>
      <BrandLogo />

      <div className="space-y-10">
        <div className="space-y-4">
          <h1 className="text-[40px] font-bold text-text-primary leading-[1.1]">
            Your mandates are<br />still running.
          </h1>
          <p className="text-[15px] text-text-secondary leading-[1.6] max-w-sm">
            Sign in to check your AI agent performance,
            review your on-chain audit trail, and
            manage your active mandates.
          </p>
        </div>

        <div className="space-y-5">
          {[
            { Icon: Shield,    title: 'Non-Custodial',        body: 'We never hold your funds' },
            { Icon: Zap,       title: 'Real-Time Execution',  body: 'Live P&L updated every block' },
            { Icon: Building2, title: 'Built for Institutions', body: 'Compliance-ready, multisig-protected' },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{title}</p>
                <p className="text-[13px] text-text-secondary mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MantleBadge />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending, error } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  })

  const onSubmit = ({ email, password }: FormData) => login({ email, password })

  const apiError = error
    ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Incorrect email or password. Please try again.')
    : null

  return (
    <AuthShell leftPanel={<LoginLeftPanel />}>
      <h2 className="text-[28px] font-semibold text-text-primary leading-tight mb-1">
        Welcome back
      </h2>
      <p className="text-sm text-text-secondary mb-7">
        Sign in to your MantleMandate account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          autoComplete="current-password"
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

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-border bg-input checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors cursor-pointer"
              {...register('rememberMe')}
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

        <Button type="submit" fullWidth loading={isPending} className="h-11 text-[15px]">
          Sign In
        </Button>

        {apiError && (
          <div className="flex items-start gap-2.5 rounded-md border border-error bg-error-bg p-3">
            <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
            <p className="text-[13px] text-error leading-relaxed">{apiError}</p>
          </div>
        )}
      </form>

      <OrDivider label="or continue with" />
      <OAuthButtons />

      <p className="mt-6 text-center text-[13px] text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-text-link hover:text-text-link-hover font-medium transition-colors">
          Start for free →
        </Link>
      </p>
    </AuthShell>
  )
}
