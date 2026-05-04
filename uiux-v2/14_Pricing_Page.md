# Screen 14 — Pricing Page (Landing Section)
## MantleMandate

---

## PURPOSE
Convert landing page visitors to paid or trial users. Plans must be clearly differentiated, pricing must be unambiguous, and the trial must be prominent.

---

## WHAT CHANGED FROM V1
- Headline: "Simple, Transparent Pricing" → "One Platform. Three Scales."
- Plan names: Basic/Pro/Enterprise → Operator/Strategist/Institution
- Currency explicitly stated: "/ month, billed in USD"
- CTA text updated
- Added crypto payment mention
- Removed fake Annual Savings without actual %

---

## SECTION HEADING

```
One Platform. Three Scales.
```
- H2, Inter Bold 40px, `#F0F6FC`, centered

Sub-heading:
```
Start free for 14 days. No credit card required. No wallet required to sign up.
```
- Body Large 16px, `#8B949E`, centered

**Billing toggle:**
```
  Monthly     ◉ Annual  (Save 20%)
```
- Toggle switch, centered
- When Annual selected: prices update, show crossed-out monthly price
- "Save 20%" badge in `#22C55E`, pill shape

---

## PRICING CARDS (3 columns, gap 24px)

### Plan 1: Operator
**Position:** Left
**For:** Individual traders and DeFi enthusiasts

Price (monthly): **$29**
Price (annual): **$23** (crossed out $29)
"/month, billed in USD" — Body Small 12px, `#8B949E`

**Tag line:**
"For individual traders exploring autonomous AI strategies."

**CTA button:**
```
[ Start Free Trial ]
```
Ghost button style (border `#21262D`, `#F0F6FC` text)

**Feature list:**
```
✓ Up to 3 AI agents
✓ 5 mandates
✓ Real-time alerts (in-app only)
✓ On-chain audit viewer
✓ CSV export
✓ Community support
✗ Multi-wallet management
✗ Telegram alerts
✗ Priority execution routing
✗ Custom protocol whitelist
```

✓ = `#22C55E` checkmark icon
✗ = `#484F58` x icon (greyed out — not mocking, just not included)

---

### Plan 2: Strategist (HIGHLIGHTED — MOST POPULAR)
**Position:** Center
**For:** Active quant traders and small funds

**Visual treatment:**
- Border: 2px solid `#0066FF` (highlighted)
- "Most Popular" badge at top: `#0066FF` bg, white text, Label Caps, -12px from top

Price (monthly): **$99**
Price (annual): **$79**

**Tag line:**
"For professional traders who need more agents, more protocols, and faster alerts."

**CTA button:**
```
[ Start Free Trial ]
```
Primary button (`#0066FF` fill)

**Feature list:**
```
✓ Up to 20 AI agents
✓ Unlimited mandates
✓ Real-time alerts (in-app + email + Telegram)
✓ On-chain audit viewer + public share links
✓ CSV + PDF export
✓ Priority support
✓ Multi-wallet management
✓ All Mantle protocols
✗ Custom protocol whitelist
✗ Dedicated account manager
✗ Custom SLA
```

---

### Plan 3: Institution
**Position:** Right
**For:** Funds, DAOs, and institutional trading desks

Price (monthly): **$299**
Price (annual): **$239**

**Tag line:**
"For organizations that need scale, compliance, and dedicated support."

**CTA button:**
```
[ Contact Sales ]
```
Ghost button style

**Feature list:**
```
✓ Unlimited AI agents
✓ Unlimited mandates
✓ All alert channels + custom webhooks
✓ On-chain audit viewer + white-label reports
✓ All export formats (CSV, PDF, JSON)
✓ Dedicated account manager
✓ Custom protocol whitelist
✓ Custom SLA agreement
✓ Multi-user team access
✓ Compliance report generation
✓ Priority execution routing
✓ Custom smart contract deployment
```

---

## PLAN COMPARISON TABLE (below cards)

**Heading:** "Compare Plans" — H3, `#F0F6FC`

Full feature-by-feature table:

| Feature | Operator | Strategist | Institution |
|---------|----------|------------|-------------|
| AI Agents | 3 | 20 | Unlimited |
| Mandates | 5 | Unlimited | Unlimited |
| Alerts — In-app | ✓ | ✓ | ✓ |
| Alerts — Email | — | ✓ | ✓ |
| Alerts — Telegram | — | ✓ | ✓ |
| Alerts — Custom Webhook | — | — | ✓ |
| On-Chain Audit Viewer | ✓ | ✓ | ✓ |
| Public Audit Share Links | — | ✓ | ✓ |
| Export CSV | ✓ | ✓ | ✓ |
| Export PDF | — | ✓ | ✓ |
| Export JSON | — | — | ✓ |
| Multi-Wallet | — | ✓ | ✓ |
| Protocol Whitelist | — | — | ✓ |
| Multi-User Team Access | — | — | ✓ |
| Dedicated Account Manager | — | — | ✓ |
| Custom SLA | — | — | ✓ |
| Support | Community | Priority | Dedicated |
| Price (monthly) | $29 | $99 | $299 |

Column headers for plans: centered, bold
✓ : `#22C55E` checkmark icon (18px)
— : `#484F58` dash

---

## PAYMENT OPTIONS

Below comparison table:

```
Payment accepted in:
[💳 Card]  [💲 USDC]  [💲 USDT]  [⬡ MNT]
```

Label Caps 11px, `#8B949E`
"MNT = Mantle Network native token. Crypto payments processed via on-chain subscription contract."

---

## FREE TRIAL BANNER

At the bottom of the pricing section:

```
┌──────────────────────────────────────────────────────────────────┐
│   🎁  Try MantleMandate Free for 14 Days                        │
│                                                                  │
│   Full Strategist access. No credit card. No wallet required.   │
│   Cancel any time before your trial ends.                       │
│                                                                  │
│   [ Start Your Free Trial → ]                                    │
└──────────────────────────────────────────────────────────────────┘
```

- Background: `#161B22`, border: 1px `#0066FF`, border-radius 10px
- Heading: H3, `#F0F6FC`
- Body: Inter Regular 14px, `#8B949E`
- Button: Primary, centered

---

## FAQ (below trial banner)

**Heading:** "Frequently Asked Questions" — H3

**Accordion items (click to expand):**

1. "Do I need a crypto wallet to sign up?"
   → No. You can sign up with just your email. Connect a wallet later when you're ready to deploy agents.

2. "Can I pay with crypto?"
   → Yes. We accept USDC, USDT, and MNT (Mantle Network native token) via on-chain subscription.

3. "What happens after my trial ends?"
   → You'll be prompted to choose a plan. Your mandates and agents pause (not deleted) until you subscribe.

4. "Can I change plans later?"
   → Yes. Upgrade or downgrade any time from your billing settings.

5. "What is a mandate?"
   → A mandate is a trading strategy you write in plain English. MantleMandate compiles it into an enforceable AI policy.
