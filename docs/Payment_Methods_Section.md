# Payment Methods Section — MantleMandate

> Design reference: `uiux-v2/17_Payment_Methods.md`
> Full pricing page spec: `uiux-v2/14_Pricing_Page.md`

---

## Purpose

Allow users to manage their subscription payment method and view billing history. As a crypto-native platform built on Mantle Network, MantleMandate supports both traditional card payments and direct crypto payments (USDC, USDT, MNT).

---

## Subscription Plans

| Plan | Price | Target User |
|------|-------|-------------|
| **Operator** | $29/month | Individual traders, getting started |
| **Strategist** | $99/month | Active traders, multiple mandates |
| **Institution** | $299/month | Teams, firms, compliance requirements |

> **Old plan names (Basic / Pro / Enterprise) are no longer used.** All references must use Operator / Strategist / Institution.

---

## Layout

**Page heading:** "Payment & Billing" — H2, `#F0F6FC`
**Sub-heading:** "Manage your subscription and payment methods."

**Two tabs:**
```
[ Payment Methods ]  [ Billing History ]
```

---

## Tab 1: Payment Methods

### Current Plan Card

```
┌──────────────────────────────────────────────────┐
│  Strategist Plan                  $99/month       │
│  Next billing: June 4, 2026                       │
│  Status: Active                                   │
│                          [Upgrade]  [Change Plan] │
└──────────────────────────────────────────────────┘
```

- Card background: `#161B22`, border: `#21262D`
- Plan name: Inter SemiBold 16px, `#F0F6FC`
- Price: Inter Bold 20px, `#0066FF`
- Next billing: Inter Regular 13px, `#8B949E`
- Status badge: "Active" — green `#22C55E`

---

### Payment Method — Two Tabs

```
[ Card / Bank ]  [ Crypto ]
```

#### Card/Bank Sub-Tab

**Current card display:**
```
┌──────────────────────────────────────────────────┐
│  💳 Visa ending in 4242            [Edit] [Remove] │
│  Expires 08/2027                                  │
│  Billing address: 123 Main St...                  │
└──────────────────────────────────────────────────┘
```

**Add New Card form:**
- Card Number input (masked, format: 1234 5678 9012 3456)
- Expiry Date (MM/YY)
- CVV (3-4 digits, show/hide toggle)
- Cardholder Name
- Billing Address
- "Save Card" button (Primary, full width)

**Error states:**
- Invalid card number → red border + "Invalid card number" message
- Declined → red notification banner: "Card declined. Please check your details or try a different card."

#### Crypto Sub-Tab

MantleMandate accepts direct crypto payments for subscriptions. This is the preferred method for users who want to pay with their connected wallet.

**Supported tokens:**

| Token | Network | Notes |
|-------|---------|-------|
| **USDC** | Mantle Network | Preferred — zero gas friction |
| **USDT** | Mantle Network | Accepted |
| **MNT** | Mantle Network | Native Mantle token, discount applies |

**MNT Discount:** Paying with MNT grants 10% off the monthly price.

**Crypto Payment UI:**

```
┌──────────────────────────────────────────────────┐
│  Pay with Crypto                                  │
│                                                   │
│  Select token:  [ USDC ]  [ USDT ]  [ MNT ]      │
│                                                   │
│  Amount due:  99.00 USDC                          │
│  (MNT equivalent: ~99 MNT · 10% discount applied) │
│                                                   │
│  Send to address:                                 │
│  0x742d35Cc6634C0532925a3b...  [Copy]             │
│                                                   │
│  ┌─────────────────┐                              │
│  │   [QR Code]     │                              │
│  └─────────────────┘                              │
│                                                   │
│  Or connect wallet to pay directly:               │
│  [ Pay with Wallet → ]   (wagmi useContractWrite) │
│                                                   │
│  After sending: [ I've sent the payment ]         │
└──────────────────────────────────────────────────┘
```

**Specs:**
- Token selector: pill buttons, selected = `#0066FF` fill, unselected = `#21262D` border
- Address display: JetBrains Mono 13px, `#8B949E`, truncated with copy button
- QR code: 120×120px, `#F0F6FC` on `#0D1117`
- "Pay with Wallet" button: Primary button — triggers wagmi `useContractWrite` to the subscription contract

---

## Tab 2: Billing History

**Table columns:**

| Date | Plan | Amount | Method | Status |
|------|------|--------|--------|--------|
| 2026-05-04 | Strategist | $99.00 | USDC | Paid |
| 2026-04-04 | Strategist | $99.00 | Visa ···4242 | Paid |
| 2026-03-04 | Operator | $29.00 | Visa ···4242 | Paid |

**Table specs:**
- Header row: Inter SemiBold 12px, `#8B949E`, uppercase
- Body rows: Inter Regular 13px, `#F0F6FC`
- Paid badge: `#22C55E` — "Paid"
- Failed badge: `#EF4444` — "Failed"
- Pending badge: `#F5C542` — "Pending"
- "Download Receipt" link per row: `#58A6FF`, 12px

**Empty state:**
```
Receipt icon (48px, #484F58)
"No billing history yet"
"Your first invoice will appear here after your trial ends."
```

---

## Interaction Details

### Change Plan Modal

Triggered by "Change Plan" button:

```
┌────────────────────────────────────────┐
│  Change Your Plan                   ×  │
│                                        │
│  [ Operator   $29/mo  ]                │
│  [●Strategist $99/mo  ] ← current     │
│  [ Institution $299/mo ]               │
│                                        │
│  Downgrade note: Changes take effect   │
│  at the end of your current period.    │
│                                        │
│  [Cancel]        [Confirm Change]      │
└────────────────────────────────────────┘
```

### Save Payment Confirmation Modal

After adding or editing a payment method:

```
┌───────────────────────────────┐
│  ✓ Payment method saved       │
│  Your Visa ending in 4242     │
│  has been saved successfully. │
│                               │
│  [ Done ]                     │
└───────────────────────────────┘
```

Background: `#0D2818`, border: `#22C55E`, icon: CheckCircle `#22C55E`

---

## Backend Implementation Notes

- Subscription state stored in `users.plan` column and `users.trial_ends_at`
- Card payments: integrate Stripe via the Flask backend (Stripe webhook updates user plan)
- Crypto payments: smart contract or manual verification; Flask webhook updates user plan on confirmed TX
- Billing history: `invoices` table — `user_id`, `amount`, `currency`, `method`, `status`, `created_at`
- All payment data handled server-side — no card numbers stored in MantleMandate's database (Stripe handles PCI compliance)
