import { ReactNode } from 'react'
import Image from 'next/image'

interface AuthShellProps {
  leftPanel: ReactNode
  children:  ReactNode
}

export function AuthShell({ leftPanel, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-page">
      {/* Left panel — 45% */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-page border-r border-border px-16 py-20">
        {leftPanel}
      </div>

      {/* Right form panel — 55% */}
      <div className="flex flex-1 flex-col items-center justify-center bg-card px-8 py-16 lg:px-16">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center mb-8 lg:hidden">
            <Image src="/logo.png" alt="MantleMandate" width={160} height={160} className="h-40 w-40 object-contain" />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

export function BrandLogo() {
  return (
    <Image src="/logo.png" alt="MantleMandate" width={320} height={320} className="h-80 w-80 object-contain" />
  )
}

export function MantleBadge() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary text-base leading-none">⬡</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
        Deployed on Mantle Network
      </span>
    </div>
  )
}

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-text-disabled shrink-0">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export function OAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className="flex items-center justify-center gap-2 h-10 rounded-md border border-border bg-card text-text-primary text-sm font-medium hover:bg-surface transition-colors"
        onClick={() => alert('Google OAuth — coming soon')}
      >
        <GoogleIcon />
        Google
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 h-10 rounded-md border border-border bg-card text-text-primary text-sm font-medium hover:bg-surface transition-colors"
        onClick={() => alert('Microsoft OAuth — coming soon')}
      >
        <MicrosoftIcon />
        Microsoft
      </button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.251 17.64 11.943 17.64 9.2Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21" fill="none">
      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  )
}
