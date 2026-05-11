'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Loader2, CheckCircle2, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthShell, BrandLogo, MantleBadge } from '@/components/layout/AuthShell'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})
type FormData = z.infer<typeof schema>

function LeftPanel() {
  return (
    <>
      <div className="space-y-6">
        <BrandLogo />
        <div>
          <h1 className="text-[32px] font-bold text-text-primary leading-tight tracking-[-0.02em]">
            Forgot your password?
          </h1>
          <p className="text-[15px] text-text-secondary leading-[1.6] mt-3">
            No worries — enter your email and we&apos;ll send you a secure
            link to reset your password and get back to trading.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-4">
          <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-[13px] text-text-secondary leading-relaxed">
            Reset links expire after 1 hour and can only be used once.
          </p>
        </div>
      </div>
      <MantleBadge />
    </>
  )
}

function ForgotPasswordInner() {
  const [sent, setSent]   = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setSent(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <AuthShell leftPanel={<LeftPanel />}>
      <div className="mb-7">
        <h2 className="text-[28px] font-semibold text-text-primary leading-tight tracking-[-0.01em]">
          Reset password
        </h2>
        <p className="text-[14px] text-text-secondary mt-1">
          We&apos;ll email you a secure link
        </p>
      </div>

      {sent ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Check your inbox</p>
            <p className="text-[13px] text-text-secondary mt-1">
              Sent a reset link to{' '}
              <span className="text-text-primary font-medium">{getValues('email')}</span>
            </p>
          </div>
          <p className="text-[12px] text-text-secondary">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              onClick={() => setSent(false)}
              className="text-text-link hover:text-text-link-hover underline"
            >
              try again
            </button>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-400">
              {error}
            </div>
          )}

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
                autoFocus
                placeholder="you@example.com"
                className={cn(
                  'w-full pl-10 pr-3.5 py-2.5 rounded-lg border bg-surface text-[14px] text-text-primary placeholder:text-text-disabled',
                  'focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors',
                  errors.email ? 'border-red-500/60' : 'border-border',
                )}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-[12px] text-red-400">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 py-2.5 text-[14px] font-semibold text-white transition-colors"
          >
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              : 'Send reset link'}
          </button>

          <div className="text-center pt-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordInner />
    </Suspense>
  )
}
