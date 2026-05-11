'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Bot, Gauge, Shield, Network, FileText, TrendingUp,
  Lock, Zap, Link2, ChevronRight, Menu, X,
  CheckCircle2, Play, Star, ArrowRight, Sparkles,
  KeyRound, Users, Eye, Award, Hexagon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────────
   Reusable bits
   ───────────────────────────────────────────────────────────────── */

function MMLogo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="MantleMandate"
      width={size}
      height={size}
      className="shrink-0 object-contain"
      style={{ width: size, height: size }}
      priority
    />
  )
}

function MantleHex({ className }: { className?: string }) {
  return <Hexagon className={cn('text-primary', className)} strokeWidth={2} />
}

/* ─────────────────────────────────────────────────────────────────
   1. NAVBAR
   ───────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Platform',     href: '#features',     active: true  },
  { label: 'How It Works', href: '#how-it-works', active: false },
  { label: 'Docs',         href: '#docs',         active: false },
  { label: 'Pricing',      href: '#pricing',      active: false },
  { label: 'Team',         href: '#team',         active: false },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 h-16 border-b transition-all duration-200',
      scrolled
        ? 'bg-page/85 backdrop-blur-md border-border'
        : 'bg-page border-transparent',
    )}>
      <div className="max-w-[1280px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center shrink-0">
          <MMLogo size={52} />
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, href, active }) => (
            <a
              key={label}
              href={href}
              className={cn(
                'relative text-[14px] font-medium transition-colors',
                active
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {label}
              {active && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
              )}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="h-9 px-4 inline-flex items-center text-[13px] font-semibold text-text-primary border border-border rounded-md hover:border-text-secondary hover:bg-card transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="h-9 px-4 inline-flex items-center gap-1 text-[13px] font-semibold text-white bg-primary rounded-md hover:bg-primary-hover transition-colors"
          >
            Start Free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden text-text-primary p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-card border-b border-border shadow-modal">
          <div className="p-4 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 px-3 text-[14px] font-medium text-text-secondary hover:text-text-primary hover:bg-page rounded-md"
              >
                {label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border mt-3">
              <Link href="/login" className="h-10 inline-flex items-center justify-center text-sm font-semibold text-text-primary border border-border rounded-md">
                Sign In
              </Link>
              <Link href="/signup" className="h-10 inline-flex items-center justify-center text-sm font-semibold text-white bg-primary rounded-md">
                Start Free →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

/* ─────────────────────────────────────────────────────────────────
   2. HERO
   ───────────────────────────────────────────────────────────────── */

function HeroFlow() {
  return (
    <>
    <div className="relative w-full h-full flex items-center justify-center py-4">
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,102,255,0.18) 0%, rgba(0,194,255,0.08) 35%, transparent 70%)',
        }}
      />

      <div className="relative z-10 hidden sm:grid grid-cols-[170px_28px_140px_28px_170px] items-center gap-0 max-w-[600px] w-full">
        {/* ── Card 1: Your Mandate ─────────────────── */}
        <div
          className="rounded-xl border border-border bg-card p-3.5 h-[210px] flex flex-col gap-2 relative"
          style={{ boxShadow: '0 0 0 1px rgba(0,102,255,0.08), 0 12px 30px -12px rgba(0,102,255,0.30)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary/80">Your Mandate</span>
            <FileText className="h-3 w-3 text-primary" />
          </div>
          <div className="rounded-md bg-page border border-border px-2 py-2 space-y-1.5 flex-1">
            <p className="text-[10px] text-text-primary leading-snug">
              Buy <span className="text-primary font-semibold">ETH</span> when RSI &lt; 30.
            </p>
            <p className="text-[10px] text-text-primary leading-snug">
              Stop loss at <span className="text-error font-semibold">2%</span>.
            </p>
            <p className="text-[10px] text-text-primary leading-snug">
              Max 5% per trade.
            </p>
            <p className="text-[10px] text-text-primary leading-snug">
              Pause on drawdown &gt;<span className="text-warning font-semibold">10%</span>.
            </p>
          </div>
          <div className="flex items-center gap-1 pt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            <span className="text-[9px] text-text-secondary font-medium">Verified</span>
            <span className="ml-auto font-mono text-[8px] text-text-disabled">0x8f3a…b5c</span>
          </div>
        </div>

        {/* arrow */}
        <ArrowRight className="h-3.5 w-3.5 text-text-disabled mx-auto" />

        {/* ── Card 2: AI Agent ─────────────────────── */}
        <div
          className="rounded-xl border border-primary/30 bg-card p-3 h-[170px] flex flex-col items-center justify-center gap-2 relative"
          style={{ boxShadow: '0 0 30px -8px rgba(0,102,255,0.4)' }}
        >
          {/* radial pulses */}
          <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-xl">
            <div className="h-20 w-20 rounded-full border border-primary/20 animate-pulse-slow" />
            <div className="absolute h-16 w-16 rounded-full border border-primary/30" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div
              className="h-12 w-12 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(0,102,255,0.5)' }}
            >
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <p className="text-[10px] font-semibold text-text-primary mt-1">AI Agent</p>
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1 w-1 rounded-full bg-primary animate-pulse-dot"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            <p className="text-[8px] text-text-secondary uppercase tracking-wider">Reading…</p>
          </div>
        </div>

        {/* arrow */}
        <ArrowRight className="h-3.5 w-3.5 text-text-disabled mx-auto" />

        {/* ── Card 3: On-Chain Execution ────────── */}
        <div
          className="rounded-xl border border-success/40 bg-card p-3.5 h-[210px] flex flex-col gap-2 relative"
          style={{ boxShadow: '0 0 0 1px rgba(34,197,94,0.08), 0 12px 30px -12px rgba(34,197,94,0.30)' }}
        >
          <div className="flex items-center gap-1 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-success">Executing</span>
          </div>

          <div className="rounded-md bg-success-bg border border-success/30 p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-text-secondary">ETH/USDC</span>
              <span className="text-[9px] font-bold text-success">+2.57%</span>
            </div>
            <p className="text-[14px] font-bold text-success">+$2,450</p>
          </div>

          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-text-disabled" />
            <span className="text-[8px] text-text-secondary">Merchant Moe</span>
          </div>

          <div className="mt-auto rounded-md bg-page border border-border p-1.5 flex items-center gap-1.5">
            <Link2 className="h-2.5 w-2.5 text-text-disabled shrink-0" />
            <span className="font-mono text-[8px] text-text-link truncate">0x4f2a…b9e1</span>
          </div>

          {/* Mantle hex badge */}
          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-page border border-success/40 flex items-center justify-center">
            <Hexagon className="h-3 w-3 text-success" />
          </div>
        </div>
      </div>
    </div>

    {/* Mobile fallback — simple 3-card stack */}
    <div className="relative z-10 sm:hidden flex flex-col gap-3 w-full max-w-[320px]">
      {[
        { label: 'Your Mandate', desc: 'Buy ETH when RSI < 30 · Stop loss 2%' },
        { label: 'AI Agent', desc: 'Parsing policy · Ready to deploy' },
        { label: 'On-Chain', desc: 'Executed on Mantle · Immutable audit' },
      ].map(c => (
        <div
          key={c.label}
          className="rounded-xl border border-border bg-card px-4 py-3"
          style={{ boxShadow: '0 0 0 1px rgba(0,102,255,0.08)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80 mb-1">{c.label}</p>
          <p className="text-xs text-text-secondary">{c.desc}</p>
        </div>
      ))}
    </div>
    </>
  )
}

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: '#0D1117',
        backgroundImage:
          'radial-gradient(circle at 20% 30%, rgba(0,102,255,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,194,255,0.04) 0%, transparent 50%)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 pt-28 pb-20 lg:pt-32 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_540px] gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div className="space-y-6 max-w-[560px]">
            <div className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary bg-primary/10 border border-primary/20">
              <MantleHex className="h-3 w-3" />
              Built on Mantle Network
            </div>

            <h1 className="text-[44px] sm:text-[52px] lg:text-[60px] font-black text-text-primary leading-[1.05] tracking-[-0.025em]">
              Your AI.<br />
              Your Rules.<br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #0066FF 0%, #00C2FF 100%)' }}
              >
                On-Chain.
              </span>
            </h1>

            <p className="text-[16px] leading-[1.55] text-text-secondary max-w-[460px]">
              Write your trading strategy in plain English. MantleMandate deploys
              an AI agent to execute it — transparent, verifiable, and unstoppable
              on Mantle Network.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-[48px] px-6 text-[14px] font-semibold text-white bg-primary hover:bg-primary-hover transition-colors rounded-lg"
              >
                Start Free — No Wallet Required
              </Link>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 h-[48px] px-5 text-[14px] font-semibold text-text-primary bg-card border border-border hover:border-text-secondary transition-colors rounded-lg"
              >
                <Play className="h-4 w-4 text-primary fill-primary" />
                Watch 2-Min Demo
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-warning fill-warning" />
                ))}
              </div>
              <p className="text-[13px] text-text-secondary">
                <span className="text-text-primary font-semibold">2,852 ready</span>, trading-safe agents
                <span className="mx-1.5">·</span>
                Trusted by traders on Mantle
              </p>
            </div>
          </div>

          {/* Right — illustration */}
          <div className="hidden lg:block">
            <HeroFlow />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   3. TRUST BAR
   ───────────────────────────────────────────────────────────────── */

function TrustBar() {
  const items = [
    { Icon: Lock,  text: 'SOC2-ready, multisig-protected' },
    { Icon: Zap,   text: 'Live P&L, updated every block'  },
    { Icon: Link2, text: 'Every trade hashed on Mantle'   },
  ]
  return (
    <section className="bg-card border-y border-border">
      <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-center gap-0 divide-x divide-border">
        {items.map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2 px-6 lg:px-12 first:pl-0 last:pr-0">
            <Icon className="h-[16px] w-[16px] text-primary shrink-0" />
            <span className="text-[13px] font-medium text-text-secondary whitespace-nowrap">{text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   4. FEATURE SECTION
   ───────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    Icon: Bot,
    title: 'Write It. Deploy It. Done.',
    body:  'Write your mandate in plain English. The AI agent reads it, interprets it, and executes — no coding, no configuration, no PhD required.',
    link:  'See how it works',
    href:  '/dashboard/mandates/new',
  },
  {
    Icon: Gauge,
    title: 'Rules the AI Cannot Break',
    body:  'Set hard caps: max drawdown, stop-loss, position limits. Your mandate is law. The AI executes within your boundaries — always.',
    link:  'View risk controls',
    href:  '/dashboard/risk',
  },
  {
    Icon: Shield,
    title: 'Every Decision On-Chain',
    body:  'Every trade decision is hashed on Mantle Network. Share a public audit link with anyone. No trust required — verify it yourself.',
    link:  'Explore the audit viewer',
    href:  '/dashboard/audit',
  },
  {
    Icon: Network,
    title: 'Best Price, Automatically',
    body:  'Executes across Merchant Moe, Agni Finance, and Fluxion — routes to best price automatically. You never need to choose.',
    link:  'See all protocols',
    href:  '/dashboard/protocols',
  },
]

function FeatureSection() {
  return (
    <section id="features" className="py-16 lg:py-20 bg-page">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10 space-y-2 max-w-[640px] mx-auto">
          <h2 className="text-[28px] lg:text-[32px] font-bold text-text-primary tracking-tight">
            Everything you need to trade with confidence
          </h2>
          <p className="text-[15px] text-text-secondary leading-relaxed">
            MantleMandate combines AI intelligence with on-chain verifiability —
            so you stay in control without staying at the screen.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1080px] mx-auto">
          {FEATURES.map(({ Icon, title, body, link, href }) => (
            <div
              key={title}
              className="group rounded-lg border border-border bg-card p-6 transition-all duration-150 hover:border-primary/30 hover:bg-surface"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-[18px] font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-[13.5px] text-text-secondary leading-[1.6] mb-3">{body}</p>
              <Link href={href} className="inline-flex items-center gap-1 text-[13px] font-medium text-text-link group-hover:text-text-link-hover transition-colors">
                {link}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   5. HOW IT WORKS
   ───────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    num:   '01',
    Icon:  FileText,
    title: 'Write Your Mandate',
    body:  'Describe your trading strategy in plain English. No syntax. No special formatting. Just tell the AI what you want it to do.',
    chip:  '"Buy ETH when RSI < 30. Never exceed 5% per trade."',
    accent: 'primary' as const,
  },
  {
    num:   '02',
    Icon:  Bot,
    title: 'Deploy Your Agent',
    body:  'MantleMandate compiles your mandate into an enforceable policy, generates an on-chain hash, and deploys your AI agent.',
    chip:  null,
    accent: 'primary' as const,
  },
  {
    num:   '03',
    Icon:  TrendingUp,
    title: 'Watch It Execute',
    body:  'Your agent trades autonomously within your rules. Every action is recorded on Mantle Network — visible to you (and anyone you share it with).',
    chip:  null,
    accent: 'success' as const,
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 lg:py-20 bg-card border-y border-border">
      <div className="max-w-[1280px] mx-auto px-6">
        <h2 className="text-[28px] lg:text-[32px] font-bold text-text-primary text-center mb-12 tracking-tight">
          Up and Running in 3 Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              {/* dashed connector to next step */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute top-10 -right-5 lg:-right-7 h-px w-10 lg:w-14 items-center pointer-events-none">
                  <div className="flex-1 border-t-2 border-dashed border-border" />
                  <ChevronRight className="h-3.5 w-3.5 text-text-disabled -ml-1" />
                </div>
              )}
              <div className="relative rounded-lg border border-border bg-page p-6 overflow-hidden h-full">
                {/* huge translucent watermark */}
                <span
                  aria-hidden
                  className="absolute -top-4 -right-2 text-[100px] font-black leading-none select-none pointer-events-none"
                  style={{ color: 'rgba(0,102,255,0.06)' }}
                >
                  {step.num}
                </span>
                <div className="relative">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center mb-4',
                      step.accent === 'primary' ? 'bg-primary/15 border border-primary/30' : 'bg-success/15 border border-success/30',
                    )}
                  >
                    <step.Icon className={cn('h-5 w-5', step.accent === 'primary' ? 'text-primary' : 'text-success')} />
                  </div>
                  <h3 className="text-[18px] font-semibold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-[13.5px] text-text-secondary leading-[1.6] mb-3">{step.body}</p>
                  {step.chip && (
                    <div className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-mono text-primary italic">
                      {step.chip}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   6. PROTOCOL STRIP
   ───────────────────────────────────────────────────────────────── */

const PROTOCOLS = [
  { name: 'Merchant Moe', symbol: 'MOE',  color: '#F5C542' },
  { name: 'Agni Finance', symbol: 'AGNI', color: '#22C55E' },
  { name: 'Fluxion',      symbol: 'FLUX', color: '#00C2FF' },
]

function ProtocolStrip() {
  return (
    <section className="py-12 lg:py-14 bg-page border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 text-center">
        <h2 className="text-[22px] lg:text-[24px] font-bold text-text-primary mb-2 tracking-tight">
          Executes Across the Mantle Ecosystem
        </h2>
        <p className="text-[14px] text-text-secondary mb-8">
          MantleMandate routes trades to the best available liquidity — automatically.
        </p>
        <div className="flex items-center justify-center gap-8 lg:gap-14 flex-wrap">
          {PROTOCOLS.map(({ name, symbol, color }) => (
            <div key={name} className="flex items-center gap-2.5">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border"
                style={{ background: `${color}20`, borderColor: `${color}40`, color }}
              >
                {symbol.slice(0, 3)}
              </div>
              <span className="text-[14px] font-semibold text-text-primary">{name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-page border border-dashed border-border flex items-center justify-center text-text-disabled text-base">+</div>
            <span className="text-[14px] font-medium text-text-disabled">+ more protocols</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   7. PRICING
   ───────────────────────────────────────────────────────────────── */

const PLANS = [
  {
    name:     'Operator',
    monthly:  29,
    tagline:  'For solo traders getting started',
    features: ['3 active AI agents', '10 mandates', 'Standard risk engine', 'Email alerts', '1-month audit history'],
    popular:  false,
  },
  {
    name:     'Strategist',
    monthly:  99,
    tagline:  'For active traders running multiple strategies',
    features: ['15 active AI agents', 'Unlimited mandates', 'Advanced risk engine', 'Real-time alerts (Slack, webhook)', '12-month audit history', 'Priority support'],
    popular:  true,
  },
  {
    name:     'Institution',
    monthly:  299,
    tagline:  'For funds, DAOs, and treasury teams',
    features: ['Unlimited agents', 'Unlimited mandates', 'Custom risk engine', 'All alert channels', 'Unlimited audit history', 'Dedicated support', 'SLA guarantee'],
    popular:  false,
  },
]

function PricingSection() {
  const [annual, setAnnual] = useState(false)
  return (
    <section id="pricing" className="py-16 lg:py-20 bg-page">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-[28px] lg:text-[32px] font-bold text-text-primary tracking-tight">
            One Platform. Three Scales.
          </h2>
          <p className="text-[15px] text-text-secondary mt-2">
            Start free for 14 days. No credit card. No wallet required.
          </p>
          <div className="inline-flex items-center gap-3 mt-5 p-1 rounded-md border border-border bg-card">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'h-8 px-4 rounded text-[13px] font-semibold transition-colors',
                !annual ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'h-8 px-4 rounded text-[13px] font-semibold transition-colors inline-flex items-center gap-1.5',
                annual ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              Annual
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', annual ? 'bg-white/20 text-white' : 'bg-success/15 text-success')}>
                −20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[1080px] mx-auto">
          {PLANS.map(({ name, monthly, tagline, features, popular }) => {
            const price = annual ? Math.round(monthly * 0.8) : monthly
            return (
              <div
                key={name}
                className={cn(
                  'relative rounded-lg p-6 flex flex-col gap-4 transition-colors',
                  popular
                    ? 'border-2 border-primary bg-card'
                    : 'border border-border bg-card hover:border-text-secondary',
                )}
              >
                {popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-[0.08em]">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                )}
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-secondary mb-1">{name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[40px] font-bold text-text-primary leading-none">${price}</span>
                    <span className="text-[13px] text-text-secondary">/month</span>
                  </div>
                  <p className="text-[12px] text-text-secondary mt-1.5">{tagline}</p>
                </div>

                <ul className="space-y-2 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={cn(
                    'h-10 inline-flex items-center justify-center rounded-md text-[13px] font-semibold transition-colors',
                    popular
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'border border-border text-text-primary hover:bg-surface',
                  )}
                >
                  {popular ? 'Start Free Trial' : 'Get Started'}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   8. SECURITY
   ───────────────────────────────────────────────────────────────── */

const SECURITY_ITEMS = [
  { Icon: KeyRound, title: 'Non-Custodial',     body: 'We never hold your funds. Your private keys never leave your wallet.' },
  { Icon: Shield,   title: 'On-Chain Security', body: 'Every agent decision is hashed and recorded on Mantle Network permanently.' },
  { Icon: Users,    title: 'Role-Based Access', body: 'Multisig signers, granular permissions, audit log on every change.' },
  { Icon: Award,    title: 'SOC2-Ready',        body: 'Architecture and controls aligned with SOC2 Type II readiness.' },
]

function SecuritySection() {
  return (
    <section id="security" className="py-16 lg:py-20 bg-card border-y border-border">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-10 lg:gap-16 items-start">
          {/* Left text */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary bg-primary/10 border border-primary/20 mb-4">
              <Shield className="h-3 w-3" />
              Security First
            </div>
            <h2 className="text-[28px] lg:text-[32px] font-bold text-text-primary tracking-tight mb-3">
              Your Funds Stay Yours
            </h2>
            <p className="text-[15px] text-text-secondary leading-relaxed mb-6">
              MantleMandate never holds custody. Your wallets, your keys, your rules —
              we only execute what you authorize. Every decision is verifiable on-chain.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-text-link hover:text-text-link-hover transition-colors">
              Read security docs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Right grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SECURITY_ITEMS.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-lg border border-border bg-page p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-[14px] font-semibold text-text-primary">{title}</p>
                </div>
                <p className="text-[12.5px] text-text-secondary leading-[1.55]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   9. DOCS
   ───────────────────────────────────────────────────────────────── */

const DOC_CATEGORIES = [
  {
    icon: Play,
    color: '#0066FF',
    label: 'Getting Started',
    desc: 'Up and running in 5 minutes',
    articles: [
      { title: 'Write your first mandate',      time: '3 min' },
      { title: 'Deploy your first AI agent',    time: '5 min' },
      { title: 'Connect your wallet',           time: '2 min' },
      { title: 'Understanding risk parameters', time: '4 min' },
    ],
  },
  {
    icon: Bot,
    color: '#00C2FF',
    label: 'Core Concepts',
    desc: 'How MantleMandate works under the hood',
    articles: [
      { title: 'What is a Mandate?',         time: '5 min' },
      { title: 'AI Agent Lifecycle',         time: '6 min' },
      { title: 'On-Chain Execution Model',   time: '7 min' },
      { title: 'Risk Engine Deep Dive',      time: '8 min' },
    ],
  },
  {
    icon: FileText,
    color: '#22C55E',
    label: 'API Reference',
    desc: 'Full REST & WebSocket API docs',
    articles: [
      { title: 'Authentication & JWT tokens', time: '3 min' },
      { title: 'Mandates endpoints',          time: '5 min' },
      { title: 'Agents & deploy lifecycle',   time: '6 min' },
      { title: 'WebSocket event stream',      time: '4 min' },
    ],
  },
  {
    icon: Link2,
    color: '#F5C542',
    label: 'Smart Contracts',
    desc: 'Deployed on Mantle Testnet',
    articles: [
      { title: 'MandatePolicy — store & verify',  time: '6 min' },
      { title: 'AgentExecutor — execute trades',  time: '7 min' },
      { title: 'RiskGuard — enforce limits',      time: '5 min' },
      { title: 'Contract addresses & ABIs',       time: '2 min' },
    ],
  },
  {
    icon: Gauge,
    color: '#9333EA',
    label: 'Mandate Syntax',
    desc: 'Writing rules the AI understands',
    articles: [
      { title: 'Supported indicators & triggers', time: '5 min' },
      { title: 'Risk rule syntax reference',      time: '4 min' },
      { title: 'Example mandates library',        time: '3 min' },
      { title: 'Common mistakes & gotchas',       time: '4 min' },
    ],
  },
  {
    icon: Network,
    color: '#F97316',
    label: 'Integrations',
    desc: 'Connect your tools and workflows',
    articles: [
      { title: 'Webhook events setup',        time: '4 min' },
      { title: 'Slack & Telegram alerts',     time: '3 min' },
      { title: 'WalletConnect integration',   time: '5 min' },
      { title: 'Bybit market data adapter',   time: '6 min' },
    ],
  },
]

const QUICK_LINKS = [
  { label: 'Quickstart',        href: '/dashboard/mandates/new', icon: Zap      },
  { label: 'API Reference',     href: '/dashboard/api',          icon: FileText },
  { label: 'Contract ABIs',     href: '/dashboard/audit',        icon: Link2    },
  { label: 'Example Mandates',  href: '/dashboard/mandates',     icon: Bot      },
]

function DocsSection() {
  const [search, setSearch] = useState('')

  const filtered = DOC_CATEGORIES.map(cat => ({
    ...cat,
    articles: cat.articles.filter(a =>
      search === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      cat.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.articles.length > 0)

  return (
    <section id="docs" className="py-16 lg:py-24 bg-page">
      <div className="max-w-[1280px] mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-[680px] mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary bg-primary/10 border border-primary/20">
            <FileText className="h-3 w-3" />
            Documentation
          </div>
          <h2 className="text-[28px] lg:text-[36px] font-bold text-text-primary tracking-tight">
            Everything You Need to Build
          </h2>
          <p className="text-[15px] text-text-secondary leading-relaxed">
            Guides, API references, smart contract docs, and integration tutorials —
            all in one place.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-[520px] mx-auto mb-10">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            name="docs-search"
            type="text"
            placeholder="Search documentation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-[14px] text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick links strip */}
        {search === '' && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-border bg-card text-[12px] font-medium text-text-secondary hover:text-text-primary hover:border-primary/40 hover:bg-surface transition-colors"
              >
                <Icon className="h-3 w-3 text-primary" />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Category grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-secondary text-[14px]">
            No results for &ldquo;{search}&rdquo;
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(({ icon: Icon, color, label, desc, articles }) => (
              <div
                key={label}
                className="group rounded-xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-primary/30 transition-all duration-150"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
              >
                {/* Card header */}
                <div className="flex items-start gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{ background: `${color}18`, borderColor: `${color}35` }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color, width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-text-primary leading-tight">{label}</p>
                    <p className="text-[11.5px] text-text-secondary mt-0.5">{desc}</p>
                  </div>
                </div>

                {/* Articles list */}
                <ul className="space-y-0 flex-1 border-t border-border pt-3">
                  {articles.map(({ title, time }) => (
                    <li key={title}>
                      <Link
                        href="/dashboard/api"
                        className="flex items-center justify-between gap-2 py-2 group/item hover:text-text-primary transition-colors"
                      >
                        <span className="text-[12.5px] text-text-secondary group-hover/item:text-text-primary transition-colors leading-snug flex-1">
                          {title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-text-disabled font-medium whitespace-nowrap">{time} read</span>
                          <ChevronRight className="h-3 w-3 text-text-disabled opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* View all */}
                <Link
                  href="/dashboard/api"
                  className="inline-flex items-center gap-1 text-[12px] font-semibold transition-colors border-t border-border pt-3"
                  style={{ color }}
                >
                  View all {label} docs
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[16px] font-semibold text-text-primary">Can&apos;t find what you&apos;re looking for?</p>
            <p className="text-[13px] text-text-secondary mt-0.5">Our team typically responds in under 2 hours.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/support"
              className="h-9 px-4 inline-flex items-center text-[13px] font-semibold text-text-primary border border-border rounded-md hover:bg-surface transition-colors"
            >
              Ask Support
            </Link>
            <Link
              href="https://github.com/mokwathedeveloper/MantleMandate-SaaS"
              className="h-9 px-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              GitHub
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   10. TEAM
   ───────────────────────────────────────────────────────────────── */

const TEAM = [
  { name: 'Alex Chen',       role: 'CEO & Co-founder', initials: 'AC', accent: 'from-[#0066FF] to-[#00C2FF]' },
  { name: 'Sarah Kim',       role: 'CTO & Co-founder', initials: 'SK', accent: 'from-[#22C55E] to-[#00C2FF]' },
  { name: 'Marcus Williams', role: 'Head of AI',       initials: 'MW', accent: 'from-[#F5C542] to-[#F97316]' },
  { name: 'Priya Sharma',    role: 'Head of Risk',     initials: 'PS', accent: 'from-[#0066FF] to-[#9333EA]' },
]

function TeamSection() {
  return (
    <section id="team" className="py-16 lg:py-20 bg-page">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <h2 className="text-[28px] lg:text-[32px] font-bold text-text-primary tracking-tight">
            Built by Traders. Built for the Future.
          </h2>
          <p className="text-[15px] text-text-secondary mt-2">
            The MantleMandate team brings together quant trading, AI research, and on-chain engineering.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1080px] mx-auto">
          {TEAM.map(({ name, role, initials, accent }) => (
            <div key={name} className="rounded-lg border border-border bg-card p-5 flex flex-col items-center text-center gap-3 hover:border-text-secondary transition-colors">
              <div
                className={cn(
                  'h-16 w-16 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-black text-lg',
                  accent,
                )}
                style={{ boxShadow: '0 8px 24px -8px rgba(0,102,255,0.4)' }}
              >
                {initials}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text-primary">{name}</p>
                <p className="text-[11px] text-primary mt-0.5 font-medium uppercase tracking-wider">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   10. CTA BANNER
   ───────────────────────────────────────────────────────────────── */

function CtaBanner() {
  return (
    <section className="relative overflow-hidden" style={{ background: '#0066FF' }}>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(0,194,255,0.4) 0%, transparent 60%)',
        }}
      />
      <div className="relative max-w-[1280px] mx-auto px-6 py-12 lg:py-14 flex flex-col items-center text-center gap-3">
        <h2 className="text-[28px] lg:text-[32px] font-bold text-white tracking-tight">
          Ready to automate your strategy?
        </h2>
        <p className="text-[15px] text-white/85 max-w-[560px]">
          Start your 14-day free trial. No wallet required. Cancel any time.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-2">
          <Link
            href="/signup"
            className="h-[48px] px-6 inline-flex items-center justify-center text-[14px] font-bold text-primary bg-white rounded-lg hover:bg-white/95 transition-colors"
          >
            Start Free — No Wallet Required
          </Link>
          <Link
            href="/dashboard"
            className="h-[48px] px-5 inline-flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/30 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            Live Demo
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────
   11. FOOTER
   ───────────────────────────────────────────────────────────────── */

function Footer() {
  const cols = [
    {
      title: 'Platform',
      links: [
        { label: 'Dashboard',        href: '/dashboard' },
        { label: 'Mandate Editor',   href: '/dashboard/mandates/new' },
        { label: 'Agent Monitoring', href: '/dashboard/agents' },
        { label: 'Audit Viewer',     href: '/dashboard/audit' },
        { label: 'Risk Engine',      href: '/dashboard/risk' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/dashboard/api' },
        { label: 'API Reference', href: '/dashboard/api' },
        { label: 'Status',        href: '/dashboard' },
        { label: 'Changelog',     href: '/dashboard' },
        { label: 'Security',      href: '/dashboard/audit' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Team',      href: '/#features' },
        { label: 'Blog',      href: '/#features' },
        { label: 'Careers',   href: '/#features' },
        { label: 'Contact',   href: '/#features' },
        { label: 'Press Kit', href: '/#features' },
      ],
    },
  ]
  return (
    <footer className="bg-page border-t border-border">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center">
              <MMLogo size={52} />
            </div>
            <p className="text-[12.5px] text-text-secondary leading-[1.6] max-w-[220px]">
              Your AI. Your Rules. On-Chain.<br />
              Plain-English mandates, deployed as autonomous trading agents on Mantle Network.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary bg-primary/10 border border-primary/20">
              <MantleHex className="h-3 w-3" />
              Built on Mantle
            </div>
          </div>

          {cols.map(({ title, links }) => (
            <div key={title} className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-disabled">{title}</p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-text-disabled">© 2026 MantleMandate · Built for the Turing Test Hackathon</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[12px] text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link href="/dashboard" className="text-[12px] text-text-secondary hover:text-text-primary transition-colors">Terms of Service</Link>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
              <MantleHex className="h-3 w-3" />
              Mantle Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="bg-page text-text-primary">
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <FeatureSection />
        <HowItWorksSection />
        <ProtocolStrip />
        <DocsSection />
        <PricingSection />
        <SecuritySection />
        <TeamSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
