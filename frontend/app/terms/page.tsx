import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Terms of Service — MantleMandate' }

const EFFECTIVE_DATE = 'May 19, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Terms of Service</h1>
        <p className="text-sm text-text-secondary mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-invert max-w-none space-y-8 text-[15px] leading-relaxed text-text-secondary">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MantleMandate (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of
              Service. If you do not agree to all terms, you may not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">2. Description of Service</h2>
            <p>
              MantleMandate provides an AI-powered autonomous trading platform built on the Mantle Network.
              The Service allows users to create mandate policies, deploy AI agents, and monitor on-chain
              trading activity. MantleMandate is a software tool — it does not provide financial advice,
              investment management services, or brokerage services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">3. Financial Risk Disclaimer</h2>
            <p>
              Cryptocurrency trading involves substantial risk of loss. AI agents operate according to
              mandate policies you define, but cannot guarantee profits or prevent losses. Past performance
              does not indicate future results. You are solely responsible for all trading decisions and
              any resulting gains or losses. Never trade with funds you cannot afford to lose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">4. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must be at least 18 years old to use the Service.</li>
              <li>You are responsible for maintaining the security of your account credentials and wallet.</li>
              <li>You must comply with all applicable laws in your jurisdiction, including tax obligations.</li>
              <li>You may not use the Service for market manipulation, wash trading, or any illegal activity.</li>
              <li>You are responsible for the mandate policies and risk parameters you configure.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">5. Smart Contract Risks</h2>
            <p>
              The Service interacts with smart contracts deployed on the Mantle Network. Smart contracts
              may contain bugs, vulnerabilities, or behave unexpectedly under certain conditions.
              MantleMandate is not liable for losses arising from smart contract failures, network
              congestion, gas estimation errors, or blockchain reorganisations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, MantleMandate and its contributors shall not be
              liable for any indirect, incidental, special, or consequential damages, including loss of
              funds, loss of profits, or data loss, arising from your use of the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">7. Modifications to Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the Service after changes constitutes
              acceptance of the new Terms. We will notify registered users of material changes by email.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">8. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a
                href="mailto:legal@mantlemandate.io"
                className="text-text-link hover:text-text-link-hover transition-colors"
              >
                legal@mantlemandate.io
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex items-center gap-6 text-sm text-text-disabled">
          <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-text-secondary transition-colors">Home</Link>
        </div>
      </div>
    </div>
  )
}
