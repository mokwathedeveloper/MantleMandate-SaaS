'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
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

/* ─── Feature list item ─────────────────────────────────────────────── */

function FeatureItem({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
      <span style={{ fontSize: '1.2rem', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>{emoji}</span>
      <div>
        <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#F0F6FC', margin: 0 }}>{title}</p>
        <p style={{ fontSize: '12.5px', color: '#6E7681', margin: '2px 0 0', lineHeight: 1.5 }}>{body}</p>
      </div>
    </li>
  )
}

/* ─── Left panel ────────────────────────────────────────────────────── */

function LoginLeftPanel() {
  return (
    <>
      <BrandLogo />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ maxWidth: 400 }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            color: '#F0F6FC',
            margin: '0 0 1rem',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            Your mandates are<br />
            still <span style={{ color: '#0090D9' }}>running.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#6E7681', lineHeight: 1.7, margin: 0 }}>
            Sign in to check your AI agent performance,
            review your on-chain audit trail, and
            manage your active mandates.
          </p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <FeatureItem emoji="🛡️" title="Non-Custodial"         body="We never hold your funds" />
          <FeatureItem emoji="⚡" title="Real-Time Execution"   body="Live P&L updated every block" />
          <FeatureItem emoji="🏛️" title="Built for Institutions" body="Compliance-ready, multisig-protected" />
        </ul>
      </div>

      <MantleBadge />
    </>
  )
}

/* ─── Shared input style helpers ────────────────────────────────────── */

const inputBase: React.CSSProperties = {
  background: '#070910',
  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.55), inset -2px -2px 6px rgba(255,255,255,0.03)',
}

/* ─── Page ──────────────────────────────────────────────────────────── */

function LoginPageInner() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending, error } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  })

  const onSubmit = ({ email, password }: FormData) => {
    login({ email, password })
  }

  const apiError = error
    ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message
        ?? 'Incorrect email or password. Please try again.')
    : null

  return (
    <AuthShell leftPanel={<LoginLeftPanel />}>
      {/* Heading */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{
          fontSize: '1.6rem', fontWeight: 700,
          color: '#F0F6FC', margin: '0 0 0.25rem',
          letterSpacing: '-0.01em',
        }}>
          Welcome back
        </h2>
        <p style={{ fontSize: '13px', color: '#6E7681', margin: 0 }}>
          Sign in to your MantleMandate account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label htmlFor="email" style={{ fontSize: '12.5px', fontWeight: 500, color: '#8B949E' }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            style={inputBase}
            className={cn(
              'w-full h-12 rounded-xl border pl-4 pr-4 text-sm text-text-primary placeholder:text-text-disabled transition-colors focus:outline-none',
              errors.email ? 'border-error focus:border-error' : 'border-border focus:border-primary',
            )}
          />
          {errors.email && (
            <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label htmlFor="password" style={{ fontSize: '12.5px', fontWeight: 500, color: '#8B949E' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password')}
              style={inputBase}
              className={cn(
                'w-full h-12 rounded-xl border pl-4 pr-11 text-sm text-text-primary placeholder:text-text-disabled transition-colors focus:outline-none',
                errors.password ? 'border-error focus:border-error' : 'border-border focus:border-primary',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#484F58', padding: 0, display: 'flex', alignItems: 'center',
              }}
            >
              {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>{errors.password.message}</p>
          )}
        </div>

        {/* Options row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-border bg-page accent-primary cursor-pointer"
            />
            <span style={{ fontSize: '13px', color: '#8B949E' }}>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            style={{ fontSize: '13px', fontWeight: 500, color: '#0090D9', textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In button */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            width: '100%', height: '48px',
            borderRadius: '12px',
            background: isPending ? '#21262D' : '#0066FF',
            color: isPending ? '#484F58' : '#ffffff',
            fontSize: '15px', fontWeight: 700,
            border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: isPending ? 'none' : '0 0 24px rgba(0,102,255,0.55)',
            transition: 'all 0.2s',
            marginTop: '0.25rem',
          }}
          onMouseEnter={e => {
            if (!isPending) e.currentTarget.style.background = '#0052CC'
          }}
          onMouseLeave={e => {
            if (!isPending) e.currentTarget.style.background = '#0066FF'
          }}
        >
          {isPending ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
        </button>

        {/* Error banner */}
        {apiError && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(239,68,68,0.4)',
            background: 'rgba(45,15,15,0.8)',
          }}>
            <AlertCircle style={{ width: 15, height: 15, color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: '13px', color: '#EF4444', margin: 0, lineHeight: 1.5 }}>{apiError}</p>
          </div>
        )}
      </form>

      <OrDivider label="or continue with" />
      <OAuthButtons />

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '13px', color: '#6E7681' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          style={{ color: '#58A6FF', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
        >
          Start for free <ArrowRight style={{ width: 13, height: 13, display: 'inline' }} />
        </Link>
      </p>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}
