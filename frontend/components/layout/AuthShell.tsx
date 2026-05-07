import { ReactNode } from 'react'
import Image from 'next/image'
import { Hexagon } from 'lucide-react'

interface AuthShellProps {
  leftPanel: ReactNode
  children:  ReactNode
}

export function AuthShell({ leftPanel, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-page">
      {/* ── Left panel — 45% (desktop only) ─────────────────────────────── */}
      <aside
        className="relative hidden lg:flex lg:w-[45%] flex-col justify-between bg-page border-r border-border px-12 xl:px-16 py-14 overflow-hidden"
      >
        {/* Atmospheric blue glow — diffuse, behind everything */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-[520px] w-[760px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, rgba(0,102,255,0.22) 0%, rgba(0,102,255,0.08) 35%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[280px]"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(0,102,255,0.04) 60%, rgba(0,102,255,0.10) 100%)',
          }}
        />

        {/* Wireframe blueprint floor + cubes */}
        <BlueprintBg />

        <div className="relative z-10 flex flex-col h-full justify-between gap-10">
          {leftPanel}
        </div>
      </aside>

      {/* ── Right form panel — 55% ──────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center bg-card px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo (hidden on lg+) */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <Image src="/logo.png" alt="MantleMandate" width={36} height={36} className="h-9 w-9 object-contain shrink-0" />
            <span className="text-[18px] font-bold tracking-tight text-text-primary">MantleMandate</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

/* ─── Blueprint background (wireframe cubes + perspective grid) ───── */

function WireframeCube({
  x, y, size, opacity = 0.7, fill = 0.04, stroke = '#3B82F6', glow = false,
}: {
  x: number; y: number; size: number;
  opacity?: number; fill?: number; stroke?: string; glow?: boolean
}) {
  // Isometric projection — 30° angles
  const w = size           // half-width on the iso axis
  const h = size * 0.55    // vertical compression
  const d = size           // depth

  // 8 vertices of an isometric cube around (x,y) anchored at the bottom-front
  // top quad
  const tA = [x - w, y - d - h]    // top-left
  const tB = [x,     y - d - 2 * h] // top-back
  const tC = [x + w, y - d - h]    // top-right
  const tD = [x,     y - d]        // top-front
  // bottom quad
  const bA = [x - w, y - h]
  const bC = [x + w, y - h]
  const bD = [x,     y]

  const sw = 1.1
  const path = `M${tA} L${tB} L${tC} L${tD} Z`

  return (
    <g style={{ opacity, filter: glow ? 'drop-shadow(0 0 8px rgba(0,194,255,0.55))' : undefined }}>
      {/* Top face */}
      <polygon
        points={`${tA.join(',')} ${tB.join(',')} ${tC.join(',')} ${tD.join(',')}`}
        fill={`rgba(0,194,255,${fill * 1.4})`}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* Left face */}
      <polygon
        points={`${tA.join(',')} ${tD.join(',')} ${bD.join(',')} ${bA.join(',')}`}
        fill={`rgba(0,102,255,${fill})`}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* Right face */}
      <polygon
        points={`${tD.join(',')} ${tC.join(',')} ${bC.join(',')} ${bD.join(',')}`}
        fill={`rgba(0,59,153,${fill * 1.6})`}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* Subtle hidden edges for depth (very thin) */}
      <path d={path} fill="none" stroke={stroke} strokeWidth={sw * 0.6} opacity={0.4} />
    </g>
  )
}

function BlueprintBg() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 720 420"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-[60%]"
    >
      <defs>
        {/* Grid line gradient — fades to nothing toward the top */}
        <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3B82F6" stopOpacity="0"   />
          <stop offset="35%"  stopColor="#3B82F6" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.45"/>
        </linearGradient>
        {/* Vanishing-point radial behind cubes */}
        <radialGradient id="halo" cx="50%" cy="85%" r="55%">
          <stop offset="0%"   stopColor="#0066FF" stopOpacity="0.45" />
          <stop offset="50%"  stopColor="#0066FF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0066FF" stopOpacity="0"    />
        </radialGradient>
        <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>

      {/* Vanishing-point halo */}
      <ellipse cx="360" cy="380" rx="320" ry="120" fill="url(#halo)" />

      {/* Perspective floor — horizontal lines (parallel) */}
      <g stroke="url(#gridFade)" strokeWidth="1" filter="url(#softBlur)">
        {Array.from({ length: 14 }).map((_, i) => {
          const t = i / 13
          const y = 240 + t * 180
          const opacity = 0.15 + t * 0.55
          return (
            <line
              key={`h${i}`}
              x1="0" x2="720"
              y1={y} y2={y}
              stroke="#3B82F6"
              strokeOpacity={opacity}
              strokeWidth={t < 0.5 ? 0.6 : 0.9}
            />
          )
        })}
        {/* Vanishing-point converging lines */}
        {Array.from({ length: 22 }).map((_, i) => {
          const t = (i - 10) / 11
          const startX = 360 + t * 740
          return (
            <line
              key={`v${i}`}
              x1={startX} y1="420"
              x2="360"    y2="240"
              stroke="#3B82F6"
              strokeOpacity={0.18 + Math.abs(t) * 0.05}
              strokeWidth={0.7}
            />
          )
        })}
      </g>

      {/* Wireframe cubes — sized & spaced like the reference */}
      <WireframeCube x={130} y={335} size={26} opacity={0.55} fill={0.05}  />
      <WireframeCube x={245} y={355} size={36} opacity={0.85} fill={0.10} glow />
      <WireframeCube x={245} y={295} size={20} opacity={0.55} fill={0.06}  />
      <WireframeCube x={415} y={345} size={30} opacity={0.7}  fill={0.07}  />
      <WireframeCube x={555} y={330} size={22} opacity={0.55} fill={0.05}  />
      <WireframeCube x={605} y={355} size={16} opacity={0.45} fill={0.04}  />

      {/* Floating accent dots */}
      <g fill="#00C2FF">
        <circle cx="120" cy="245" r="1.4" opacity="0.55" />
        <circle cx="350" cy="230" r="1.6" opacity="0.7"  />
        <circle cx="540" cy="240" r="1.2" opacity="0.5"  />
        <circle cx="640" cy="280" r="1"   opacity="0.55" />
      </g>
    </svg>
  )
}

/* ─── Brand logo (preserves /logo.png) ─────────────────────────────── */

export function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt="MantleMandate"
        width={36}
        height={36}
        className="h-9 w-9 object-contain shrink-0"
        priority
      />
      <span className="text-[19px] font-bold tracking-tight text-text-primary">
        MantleMandate
      </span>
    </div>
  )
}

/* ─── Mantle Network badge ─────────────────────────────────────────── */

export function MantleBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5"
      style={{ boxShadow: '0 0 24px -8px rgba(0,102,255,0.6)' }}
    >
      <Hexagon className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
        Deployed on Mantle Network
      </span>
    </div>
  )
}

/* ─── Or-divider ───────────────────────────────────────────────────── */

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[12px] text-text-disabled shrink-0">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

/* ─── OAuth buttons ────────────────────────────────────────────────── */

export function OAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className="flex items-center justify-center gap-2 h-11 rounded-md border border-border bg-page text-text-primary text-[13px] font-semibold hover:border-text-secondary hover:bg-card transition-colors"
        onClick={() => alert('Google OAuth — coming soon')}
      >
        <GoogleIcon />
        Google
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 h-11 rounded-md border border-border bg-page text-text-primary text-[13px] font-semibold hover:border-text-secondary hover:bg-card transition-colors"
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
