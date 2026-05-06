'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Bot, Gauge, Shield, Network, FileText, TrendingUp,
  Lock, Zap, Link2, ChevronRight, Menu, X,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Nav Bar ───────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Platform',     href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Docs',         href: '#docs' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'Team',         href: '#team' },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 h-16 flex items-center border-b border-border transition-all duration-200',
      scrolled ? 'bg-page/90 backdrop-blur-md' : 'bg-page',
    )}>
      <div className="max-w-[1280px] mx-auto px-6 w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="MantleMandate" width={160} height={32} className="h-8 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="h-9 px-4 flex items-center text-sm font-semibold text-text-primary border border-border rounded-md hover:bg-card transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="h-9 px-4 flex items-center text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover transition-colors"
          >
            Start Free →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border shadow-modal md:hidden">
          <div className="flex flex-col p-4 space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link href="/login" className="py-2 text-center text-sm font-semibold text-text-primary border border-border rounded-md hover:bg-surface transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="py-2 text-center text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover transition-colors">
                Start Free →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// ── Hero Section ──────────────────────────────────────────────────────────────

function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center h-full min-h-[360px]">
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,102,255,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* 3-panel flow */}
      <div className="relative flex items-center gap-3 z-10">
        {/* Panel 1: Mandate text */}
        <div className="w-[140px] h-[160px] bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-card">
          <div className="h-2 w-16 bg-text-disabled/40 rounded-full" />
          <div className="h-2 w-20 bg-text-disabled/30 rounded-full" />
          <div className="h-2 w-14 bg-text-disabled/30 rounded-full" />
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full bg-primary/20 rounded-full" />
            <div className="h-1.5 w-3/4 bg-primary/20 rounded-full" />
            <div className="h-1.5 w-5/6 bg-primary/20 rounded-full" />
          </div>
          <div className="mt-auto flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-medium text-primary">Mandate</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-px w-8 border-t-2 border-dashed border-border" />
          <ChevronRight className="h-4 w-4 text-text-secondary -mt-1" />
        </div>

        {/* Panel 2: AI brain */}
        <div className="w-[120px] h-[120px] bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-2 shadow-card">
          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] font-medium text-primary">AI Agent</span>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-1 w-4 bg-primary/30 rounded-full animate-pulse-slow" style={{ animationDelay: `${i * 200}ms` }} />
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-px w-8 border-t-2 border-dashed border-border" />
          <ChevronRight className="h-4 w-4 text-text-secondary -mt-1" />
        </div>

        {/* Panel 3: On-chain execution */}
        <div className="w-[140px] h-[160px] bg-card border border-success/30 rounded-xl p-4 flex flex-col gap-2 shadow-card">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
            <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Executed</span>
          </div>
          <div className="bg-success-bg rounded-md p-2 space-y-1">
            <div className="text-[9px] font-mono text-success">BTC/USDT</div>
            <div className="text-[10px] font-semibold text-success">+$2,450</div>
          </div>
          <div className="mt-auto flex items-center gap-1.5">
            <Link2 className="h-4 w-4 text-text-secondary" />
            <span className="text-[9px] font-mono text-text-secondary">0x4f2a…</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="min-h-screen flex items-center pt-16" style={{ background: 'linear-gradient(180deg, #0D1117 0%, #0D1117 100%)' }}>
      <div className="max-w-[1280px] mx-auto px-6 w-full py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            {/* Pre-headline */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-widest text-primary" style={{ background: 'rgba(0,102,255,0.1)' }}>
              <span className="text-primary text-base leading-none">⬡</span>
              Built on Mantle Network
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-[64px] font-black text-text-primary leading-[1.1] tracking-[-0.02em]">
                Your AI.<br />
                Your Rules.<br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #0066FF, #00C2FF)' }}
                >
                  On-Chain.
                </span>
              </h1>
            </div>

            {/* Sub-headline */}
            <p className="text-lg text-text-secondary leading-[1.6] max-w-[480px]">
              Write your trading strategy in plain English.
              MantleMandate deploys an AI agent to execute it —
              transparent, verifiable, and unstoppable on Mantle Network.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-[52px] px-7 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
              >
                Start Free — No Wallet Required
              </Link>
              <button className="inline-flex items-center justify-center h-[52px] px-7 text-base font-semibold text-text-primary bg-card border border-border rounded-lg hover:bg-surface transition-colors gap-2">
                <span className="text-primary text-lg">▷</span>
                Watch 2-Min Demo
              </button>
            </div>

            {/* Social proof */}
            <p className="text-sm text-text-secondary">
              <span className="text-warning">★★★★★</span> Trusted by traders on Mantle Network
            </p>
          </div>

          {/* Right: Illustration */}
          <div className="hidden lg:block">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Trust Bar ─────────────────────────────────────────────────────────────────

function TrustBar() {
  const items = [
    { Icon: Lock,   text: 'SOC2-ready, multisig-protected' },
    { Icon: Zap,    text: 'Live P&L, updated every block' },
    { Icon: Link2,  text: 'Every trade hashed on Mantle' },
  ]
  return (
    <section className="bg-card border-t border-b border-border h-[72px] flex items-center">
      <div className="max-w-[1280px] mx-auto px-6 w-full">
        <div className="flex items-center justify-center gap-0 divide-x divide-border">
          {items.map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 px-10">
              <Icon className="h-[18px] w-[18px] text-primary shrink-0" />
              <span className="text-[13px] font-medium text-text-secondary">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Feature Section ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: Bot,
    title: 'Write It. Deploy It. Done.',
    body:  'Write your mandate in plain English. The AI agent reads it, interprets it, and executes — no coding, no configuration, no PhD required.',
    link:  'See how it works →',
  },
  {
    Icon: Gauge,
    title: 'Rules the AI Cannot Break',
    body:  'Set hard caps: max drawdown, stop-loss, position limits. Your mandate is law. The AI executes within your boundaries — always.',
    link:  'View risk controls →',
  },
  {
    Icon: Shield,
    title: 'Every Decision On-Chain',
    body:  'Every trade decision is hashed on Mantle Network. Share a public audit link with anyone. No trust required — verify it yourself.',
    link:  'Explore the audit viewer →',
  },
  {
    Icon: Network,
    title: 'Best Price, Automatically',
    body:  'Executes across Merchant Moe, Agni Finance, and Fluxion — routes to best price automatically. You never need to choose.',
    link:  'See all protocols →',
  },
]

function FeatureSection() {
  return (
    <section id="features" className="py-24 bg-page">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-14 space-y-3">
          <h2 className="text-[28px] font-semibold text-text-primary">
            Everything you need to trade with confidence
          </h2>
          <p className="text-base text-text-secondary max-w-[600px] mx-auto leading-relaxed">
            MantleMandate combines AI intelligence with on-chain verifiability —
            so you stay in control without staying at the screen.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map(({ Icon, title, body, link }) => (
            <div key={title} className="bg-card border border-border rounded-lg p-6 space-y-4 hover:border-border/80 hover:bg-surface transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-[20px] font-semibold text-text-primary">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
              <a href="#" className="text-sm font-medium text-text-link hover:text-text-link-hover transition-colors inline-flex items-center gap-1">
                {link}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    num:  '01',
    Icon: FileText,
    iconCls: 'text-primary',
    title: 'Write Your Mandate',
    body:  'Describe your trading strategy in plain English. No syntax. No special formatting. Just tell the AI what you want it to do.',
    chip:  '"Buy ETH when RSI < 30. Never exceed 5% per trade."',
  },
  {
    num:  '02',
    Icon: Bot,
    iconCls: 'text-primary',
    title: 'Deploy Your Agent',
    body:  'MantleMandate compiles your mandate into an enforceable policy, generates an on-chain hash, and deploys your AI agent.',
    chip:  null,
  },
  {
    num:  '03',
    Icon: TrendingUp,
    iconCls: 'text-success',
    title: 'Watch It Execute',
    body:  'Your agent trades autonomously within your rules. Every action is recorded on Mantle Network — visible to you (and anyone you share it with).',
    chip:  null,
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-card border-t border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6">
        <h2 className="text-[28px] font-semibold text-text-primary text-center mb-16">
          Up and Running in 3 Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map(({ num, Icon, iconCls, title, body, chip }, i) => (
            <div key={title} className="relative flex flex-col gap-4">
              {/* Connector arrow (between steps) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-8 flex items-center z-10">
                  <div className="w-full h-px border-t-2 border-dashed border-border mx-auto" />
                  <ChevronRight className="h-4 w-4 text-text-secondary absolute -right-2 top-1/2 -translate-y-1/2" />
                </div>
              )}
              {/* Step number watermark */}
              <div className="text-[72px] font-black leading-none select-none" style={{ color: 'rgba(0,102,255,0.08)' }}>
                {num}
              </div>
              <div className="h-10 w-10 -mt-6">
                <Icon className={cn('h-10 w-10', iconCls)} />
              </div>
              <h3 className="text-[20px] font-semibold text-text-primary">{title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
              {chip && (
                <div className="inline-block bg-primary/10 border border-primary/20 rounded-md px-3 py-1.5 text-xs font-mono text-primary italic">
                  {chip}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Multi-Protocol Banner ─────────────────────────────────────────────────────

const PROTOCOLS = [
  { name: 'Merchant Moe', symbol: 'MOE' },
  { name: 'Agni Finance', symbol: 'AGNI' },
  { name: 'Fluxion',      symbol: 'FLUX' },
]

function ProtocolBanner() {
  return (
    <section className="py-16 bg-page">
      <div className="max-w-[1280px] mx-auto px-6 text-center space-y-4">
        <h2 className="text-[22px] font-semibold text-text-primary">
          Executes Across the Mantle Ecosystem
        </h2>
        <p className="text-sm text-text-secondary">
          MantleMandate routes trades to the best available liquidity — automatically.
        </p>
        <div className="flex items-center justify-center gap-12 mt-8 flex-wrap">
          {PROTOCOLS.map(({ name, symbol }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center">
                <span className="text-[10px] font-bold text-text-secondary">{symbol}</span>
              </div>
              <span className="text-sm font-medium text-text-secondary">{name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-card border border-dashed border-border flex items-center justify-center">
              <span className="text-text-disabled text-lg">+</span>
            </div>
            <span className="text-sm font-medium text-text-disabled">More protocols</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Pricing Section ───────────────────────────────────────────────────────────

const PLANS = [
  {
    name:     'Operator',
    price:    29,
    popular:  false,
    features: ['3 AI agents', '10 mandates', 'Standard risk engine', 'Email alerts', '1 month audit history'],
  },
  {
    name:     'Strategist',
    price:    99,
    popular:  true,
    features: ['15 AI agents', 'Unlimited mandates', 'Advanced risk engine', 'Real-time alerts', '12 month audit history', 'Priority support'],
  },
  {
    name:     'Institution',
    price:    299,
    popular:  false,
    features: ['Unlimited agents', 'Unlimited mandates', 'Custom risk engine', 'All alert channels', 'Unlimited audit history', 'Dedicated support', 'SLA guarantee'],
  },
]

function PricingSection() {
  const [annual, setAnnual] = useState(false)
  return (
    <section id="pricing" className="py-24 bg-card border-t border-border">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-[28px] font-semibold text-text-primary">One Platform. Three Scales.</h2>
          <p className="text-sm text-text-secondary">Start free for 14 days. No credit card. No wallet required.</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className={cn('text-sm', !annual ? 'text-text-primary font-medium' : 'text-text-secondary')}>Monthly</span>
            <button
              onClick={() => setAnnual((v) => !v)}
              className={cn('w-11 h-6 rounded-full transition-colors relative', annual ? 'bg-primary' : 'bg-border')}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform', annual ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
            <span className={cn('text-sm', annual ? 'text-text-primary font-medium' : 'text-text-secondary')}>
              Annual <span className="text-success text-xs font-semibold">(save 20%)</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(({ name, price, popular, features }) => {
            const effectivePrice = annual ? Math.floor(price * 0.8) : price
            return (
              <div
                key={name}
                className={cn(
                  'rounded-lg p-6 flex flex-col gap-4 border',
                  popular
                    ? 'border-primary bg-card relative'
                    : 'border-border bg-page',
                )}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">{name}</p>
                  <p className="text-[40px] font-bold text-text-primary leading-tight mt-1">
                    ${effectivePrice}<span className="text-sm text-text-secondary font-normal">/mo</span>
                  </p>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={cn(
                    'mt-2 flex items-center justify-center h-10 rounded-md text-sm font-semibold transition-colors',
                    popular
                      ? 'bg-primary text-white hover:bg-primary-hover'
                      : 'border border-border text-text-primary hover:bg-surface',
                  )}
                >
                  Get started
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Security Section ──────────────────────────────────────────────────────────

function SecuritySection() {
  const items = [
    { title: 'Non-Custodial',     body: 'We never hold your funds. Your private keys never leave your wallet.' },
    { title: 'On-Chain Audit',    body: 'Every agent decision is hashed and recorded on Mantle Network permanently.' },
    { title: 'Multisig-Ready',    body: 'Supports multi-signature wallet protection for institutional use.' },
    { title: 'Risk Hard Limits',  body: 'Smart contract enforced stop-loss and drawdown limits the AI cannot override.' },
  ]
  return (
    <section id="security" className="py-24 bg-page border-t border-border">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-4">
            <h2 className="text-[28px] font-semibold text-text-primary">Your Funds Stay Yours</h2>
            <p className="text-base text-text-secondary leading-relaxed">
              MantleMandate never holds custody. Your wallets, your keys, your rules —
              we only execute what you authorize.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-text-link hover:text-text-link-hover transition-colors mt-2">
              Start for free <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {items.map(({ title, body }) => (
              <div key={title} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm font-semibold text-text-primary">{title}</p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Team Section ──────────────────────────────────────────────────────────────

const TEAM = [
  { name: 'Alex Chen',       role: 'CEO & Co-founder',      initials: 'AC', bio: 'Former quant at Citadel. 10 years in algorithmic trading.' },
  { name: 'Sarah Kim',       role: 'CTO & Co-founder',      initials: 'SK', bio: 'Ex-Solidity engineer at Uniswap. Builder at heart.' },
  { name: 'Marcus Williams', role: 'Head of AI',             initials: 'MW', bio: 'PhD ML from Stanford. Specializes in RL for trading systems.' },
  { name: 'Priya Sharma',    role: 'Head of Risk',           initials: 'PS', bio: 'Former risk manager at Goldman Sachs DeFi desk.' },
]

function TeamSection() {
  return (
    <section id="team" className="py-24 bg-card border-t border-border">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-[28px] font-semibold text-text-primary">Built by Traders. Built for the Future.</h2>
          <p className="text-sm text-text-secondary">The MantleMandate team brings together expertise in quantitative finance, AI, and blockchain.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map(({ name, role, initials, bio }) => (
            <div key={name} className="bg-page border border-border rounded-lg p-5 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-primary font-bold text-base">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{name}</p>
                <p className="text-xs text-primary mt-0.5">{role}</p>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA Banner ────────────────────────────────────────────────────────────────

function CtaBanner() {
  return (
    <section className="py-0 bg-primary">
      <div className="max-w-[1280px] mx-auto px-6 py-16 flex flex-col items-center text-center gap-4">
        <h2 className="text-[28px] font-semibold text-white">Ready to automate your strategy?</h2>
        <p className="text-base text-white/80">Start your 14-day free trial. No wallet required. Cancel any time.</p>
        <Link
          href="/signup"
          className="mt-2 h-[52px] px-8 inline-flex items-center text-base font-bold text-primary bg-white rounded-lg hover:bg-white/90 transition-colors"
        >
          Start Free — No Wallet Required
        </Link>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-page border-t border-border">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="MantleMandate" width={120} height={28} className="h-7 w-auto object-contain" />
            </div>
            <p className="text-xs text-text-secondary leading-relaxed max-w-[160px]">
              Your AI. Your Rules. On-Chain.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-primary text-sm">⬡</span>
              <span className="text-[11px] text-text-secondary">Built on Mantle Network</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-disabled">Platform</p>
            {['Dashboard', 'Mandate Editor', 'Agent Monitoring', 'Audit Viewer'].map((l) => (
              <Link key={l} href="/login" className="block text-sm text-text-secondary hover:text-text-primary transition-colors">{l}</Link>
            ))}
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-disabled">Resources</p>
            {['Docs', 'API Reference', 'Status', 'Changelog'].map((l) => (
              <a key={l} href="#" className="block text-sm text-text-secondary hover:text-text-primary transition-colors">{l}</a>
            ))}
          </div>

          {/* Col 4: Company */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-disabled">Company</p>
            {['Team', 'Blog', 'Careers', 'Contact'].map((l) => (
              <a key={l} href="#" className="block text-sm text-text-secondary hover:text-text-primary transition-colors">{l}</a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-disabled">© 2026 MantleMandate · Turing Test Hackathon</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Terms of Service</a>
            <div className="flex items-center gap-1">
              <span className="text-primary text-sm">⬡</span>
              <span className="text-xs text-text-secondary">Built on Mantle Network</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-page text-text-primary">
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <FeatureSection />
        <HowItWorksSection />
        <ProtocolBanner />
        <PricingSection />
        <SecuritySection />
        <TeamSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
