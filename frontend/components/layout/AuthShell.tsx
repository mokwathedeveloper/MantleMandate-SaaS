import { ReactNode } from 'react'
import Image from 'next/image'
import { Hexagon } from 'lucide-react'

interface AuthShellProps {
  leftPanel: ReactNode
  children:  ReactNode
}

/* ─── Solid 3D cube field ────────────────────────────────────────────── */

const CUBES = [
  { size: 40, delay: '0s',    opacity: 0.90 },
  { size: 26, delay: '0.45s', opacity: 0.65 },
  { size: 54, delay: '0.85s', opacity: 0.95 },
  { size: 22, delay: '0.2s',  opacity: 0.55 },
  { size: 44, delay: '1.1s',  opacity: 0.80 },
  { size: 30, delay: '0.65s', opacity: 0.70 },
  { size: 20, delay: '1.4s',  opacity: 0.50 },
  { size: 48, delay: '0.35s', opacity: 0.85 },
  { size: 28, delay: '0.95s', opacity: 0.60 },
  { size: 36, delay: '1.25s', opacity: 0.75 },
]

function CubeField() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        bottom: '1.75rem',
        left: '2.5rem',
        right: '2.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.85rem',
        alignItems: 'flex-end',
      }}
    >
      {CUBES.map((c, i) => (
        <div
          key={i}
          className="auth-cube"
          style={{
            width:  c.size,
            height: c.size,
            flexShrink: 0,
            background: 'linear-gradient(145deg, #0090D9 0%, #0060CC 55%, #002E80 100%)',
            borderRadius: 5,
            transform: 'rotateX(30deg) rotateY(42deg)',
            boxShadow: '0 0 18px rgba(0,144,217,0.65), 0 0 40px rgba(0,96,204,0.28), inset 0 1px 0 rgba(255,255,255,0.18)',
            opacity: c.opacity,
            animationDelay: c.delay,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Shell ──────────────────────────────────────────────────────────── */

export function AuthShell({ leftPanel, children }: AuthShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#070910' }}>

      {/* Left info panel — desktop only */}
      <aside
        className="hidden lg:flex lg:w-[48%] flex-col"
        style={{
          position: 'relative',
          padding: '3.5rem',
          background: 'linear-gradient(175deg, #050508 0%, #080910 60%, #060D1A 100%)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Bottom atmospheric glow */}
        <div aria-hidden style={{
          position: 'absolute', bottom: '-80px', left: '50%',
          transform: 'translateX(-50%)',
          width: '700px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,100,255,0.28) 0%, rgba(0,100,255,0.10) 40%, transparent 70%)',
          filter: 'blur(32px)', pointerEvents: 'none',
        }} />
        {/* Top-right accent */}
        <div aria-hidden style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,194,255,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <CubeField />

        <div style={{
          position: 'relative', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          height: '100%', justifyContent: 'space-between', gap: '2rem',
        }}>
          {leftPanel}
        </div>
      </aside>

      {/* Right form panel */}
      <main
        className="flex flex-1 flex-col items-center justify-center"
        style={{ padding: '2.5rem 1.5rem', background: '#070910' }}
      >
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Image src="/logo.png" alt="MantleMandate" width={72} height={72}
            className="h-[72px] w-[72px] object-contain" priority />
        </div>

        {/* Glassmorphic card */}
        <div style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(11, 14, 22, 0.90)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          padding: '2.5rem',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,100,255,0.06)',
        }}>
          {children}
        </div>
      </main>
    </div>
  )
}

/* ─── Brand logo ─────────────────────────────────────────────────────── */

export function BrandLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Image
        src="/logo.png"
        alt="MantleMandate"
        width={44}
        height={44}
        className="h-[44px] w-[44px] object-contain"
        style={{ filter: 'drop-shadow(0 0 10px rgba(0,144,217,0.55))' }}
        priority
      />
      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F0F6FC', letterSpacing: '-0.02em' }}>
        MantleMandate
      </span>
    </div>
  )
}

/* ─── Mantle badge ───────────────────────────────────────────────────── */

export function MantleBadge() {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1.25rem',
        borderRadius: '999px',
        border: '1px solid rgba(0,144,217,0.45)',
        background: 'rgba(0,144,217,0.08)',
        boxShadow: '0 0 24px -6px rgba(0,144,217,0.6)',
        cursor: 'default',
      }}
    >
      <Hexagon style={{ width: 13, height: 13, color: '#0090D9' }} strokeWidth={2.2} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0090D9' }}>
        Deployed on Mantle Network
      </span>
    </button>
  )
}

/* ─── Or-divider ─────────────────────────────────────────────────────── */

export function OrDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
      <span style={{ fontSize: 11, color: '#484F58', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}

/* ─── OAuth buttons ──────────────────────────────────────────────────── */

export function OAuthButtons() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
      {([
        { label: 'Google',    icon: <GoogleIcon /> },
        { label: 'Microsoft', icon: <MicrosoftIcon /> },
      ] as const).map(({ label, icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => alert(`${label} OAuth — coming soon`)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            height: '44px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.09)',
            background: 'rgba(255,255,255,0.04)',
            color: '#C9D1D9', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
          }}
        >
          {icon}
          {label}
        </button>
      ))}
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
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  )
}
