# Screen 17 — Payment Methods & Billing
## MantleMandate

---

## PURPOSE
Users manage their subscription payment methods, view billing history, and change plans. For a DeFi product, crypto payment must be a first-class option.

---

## WHAT CHANGED FROM V1
- Added crypto payment section: USDC, USDT, MNT (Mantle native token) — critical for a Mantle Network product
- Crypto payment shows wallet address input + network selector + QR code option
- Brand: "MANTLEMANDATE-SAAS" → "MantleMandate" in page header

---

## LAYOUT

Standard app layout (sidebar + main content)

**Main content:** Two columns
- Left (payment management): 60%
- Right (billing history + plan): 40%

---

## LEFT COLUMN

### Current Payment Method

**Heading:** "Payment Methods" — H3, `#F0F6FC`
**Sub-text:** "Manage how you pay for MantleMandate."

**Active method card:**

```
┌───────────────────────────────────────────────────────┐
│   [Visa logo]  Visa ending in 4242                    │
│                Expires 08/27  ·  John Michael          │
│                                          [Edit] [Remove]│
│   ✓ Default payment method                            │
└───────────────────────────────────────────────────────┘
```

- Background: `#161B22`, border: 1px `#21262D`, border-radius 8px, padding 20px
- Card brand logo: 32px wide
- Name: Inter SemiBold 14px, `#F0F6FC`
- Details: Inter Regular 13px, `#8B949E`
- "Default" badge: `#22C55E` text, Label Caps 10px
- [Edit] [Remove]: Ghost buttons, small (28px height)

---

### Add New Payment Method

**Heading:** "Add New Payment Method" — H4, `#F0F6FC`

**Method type tabs:**
```
[ 💳 Card ]  [ 🏦 Bank Account ]  [ 💲 Crypto ]
```
- Tab style: same as filter tabs

---

#### Card Tab

Fields:
- Card Number: Input with card brand logo auto-detection right side
  - Placeholder: "1234 5678 9012 3456"
  - Mask: groups of 4 with spaces
- Row: Expiry Date (MM/YY) + CVV (🔒 icon)
- Cardholder Name
- Billing Address (collapsible)

Save button:
```
[ Save Card ]
```
Primary button, 40px height

Security note below:
"🔒 Secured with TLS 1.3 encryption. We never store your full card number."
Inter Regular 12px, `#8B949E`

---

#### Crypto Tab (NEW — not in v1)

**This is a new section that did not exist in the original design.**

**Heading in tab:** "Pay with Crypto"
**Sub-text:** "Pay your subscription using crypto on Mantle Network or Ethereum."

**Token selector:**
```
Token:  [ ○ USDC ]  [ ○ USDT ]  [ ● MNT ]
```
- Radio button pills
- MNT: "(Mantle native token)" — Label Caps 10px below

**Network selector (dropdown):**
```
Network: [ Mantle Network ▾ ]
```
Options: Mantle Network (recommended) / Ethereum Mainnet

**When a token + network is selected, show:**

Payment address card:
```
┌──────────────────────────────────────────────────────┐
│  Send payment to this address:                       │
│                                                      │
│  0x7f3d...a92b1e4c                     [📋 Copy]    │
│                                                      │
│  [QR Code — 128x128px]                               │
│                                                      │
│  Amount due: 99 USDC / month                        │
│  Network: Mantle Network                             │
│                                                      │
│  ⚠ Send only USDC on Mantle Network to this address │
│    Sending other tokens may result in permanent loss │
└──────────────────────────────────────────────────────┘
```

- Address: JetBrains Mono 13px, `#F0F6FC`
- Warning: `#F5C542` icon + text, Inter Regular 12px
- QR code: standard black-on-white, 128x128px

**After sending:**
```
[ I've Sent the Payment — Verify Transaction ]
```
Ghost button → prompts for TX hash input to verify

---

### PayPal Section (existing, keep)
- PayPal Connect button
- Same as v1

---

## RIGHT COLUMN

### Current Plan

```
┌────────────────────────────────┐
│  STRATEGIST PLAN               │
│  $99 / month                   │
│  Renews: June 4, 2026          │
│  Trial: 10 days remaining      │
│                                │
│  [Upgrade Plan]  [Cancel]      │
└────────────────────────────────┘
```

- Plan name: Label Caps, `#0066FF`
- Price: H3, `#F0F6FC`
- Renews: Body 14px, `#8B949E`
- Trial remaining: `#22C55E` (if in trial), `#8B949E` otherwise
- "Upgrade Plan": Primary small button
- "Cancel": Ghost small button (NOT red — only use red for destructive actions requiring confirmation)

---

### Billing History

**Heading:** "Billing History" — H4, `#F0F6FC`
**Right:** "Download all ↓" link

**Table:**

| Column | Content |
|--------|---------|
| Date | Apr 5, 2026 |
| Description | Strategist Plan — Monthly |
| Amount | $99.00 |
| Method | Visa ···4242 |
| Status | PAID badge (`#22C55E`) |
| Receipt | "Download ↓" link |

Row height: 44px
Max rows: 6 (then "Load more")

---

### Auto-Renewal Setting

```
Auto-renewal:  [● ON / OFF toggle]
"Your subscription renews automatically. Turn off to cancel at period end."
```

Toggle: ON = `#0066FF`, OFF = `#21262D`
Text: Inter Regular 13px, `#8B949E`
