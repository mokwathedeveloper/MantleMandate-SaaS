# Screen 15 — Security Section (Landing Page)
## MantleMandate

---

## PURPOSE
Build trust with potential users — especially institutions — by demonstrating that MantleMandate takes security seriously. Must communicate non-custodial architecture as the primary trust signal.

---

## WHAT CHANGED FROM V1
- Headline: "ENTERPRISE-GRADE SECURITY YOU CAN TRUST" → "Your Funds Stay Yours"
- Sub-headline: rewritten around non-custodial architecture (genuine differentiator)
- Feature labels: rewritten from vague to specific
- Illustration: direction to replace generic shield with concept illustration

---

## SECTION LAYOUT

**Background:** `#161B22` (slightly lighter than page bg — to create visual section break)
**Padding:** 100px top and bottom

**Two-column layout (desktop):**
- Left (text + features): 55%
- Right (illustration): 45%

---

## LEFT COLUMN — TEXT

**Section label:**
```
SECURITY & COMPLIANCE
```
Label Caps 11px, `#0066FF`

**Headline:**
```
Your Funds Stay Yours
```
H2, Inter Bold 40px, `#F0F6FC`

**Sub-headline:**
```
MantleMandate never holds custody of your assets.
You keep your private keys. We only execute what you
explicitly authorize — within the limits you set.
```
Body Large 16px, `#8B949E`, line-height 1.6, max-width 480px

**CTA buttons:**
```
[ View Security Docs ]    [ See Our Audit Reports ]
```
- First: Ghost button
- Second: Text link with external icon

---

## SECURITY FEATURE LIST (4 items)

### Feature 1: Non-Custodial Architecture
- Icon: `Wallet` (Lucide, 24px, `#0066FF`)
- Title: "Non-Custodial Architecture" — H4, `#F0F6FC`
- Body: "MantleMandate never holds your private keys or your assets. Your wallet is yours. We request only the permissions needed to execute your mandate." — Body 14px, `#8B949E`

### Feature 2: End-to-End Encryption
- Icon: `Lock` (Lucide, 24px, `#0066FF`)
- Title: "End-to-End Encryption"
- Body: "All data transmitted between you and MantleMandate is encrypted using TLS 1.3. Mandate content and API keys are encrypted at rest using AES-256."

### Feature 3: On-Chain Policy Hashing
- Icon: `Shield` (Lucide, 24px, `#0066FF`)
- Title: "Tamper-Proof Mandate Policies"
- Body: "Every mandate is compiled into a policy hash recorded on Mantle Network. If the policy is ever changed without your authorization, the hash won't match — and the agent stops."

### Feature 4: Role-Based Access Control
- Icon: `Users` (Lucide, 24px, `#0066FF`)
- Title: "Multisig & Access Control"
- Body: "Institution plan supports multisig wallet authorization and role-based access for teams — so no single user can deploy or change agents without approval."

**Layout of feature list:**
Each feature: icon (left, 24px) + content (right)
Gap between features: 24px
Horizontal divider between features 2 and 3 (optional: keeps it scannable)

---

## SECURITY STATS BAR

Horizontal strip of 4 statistics (below feature list, separated by divider):

```
0         |  100%        |  AES-256   |  Mantle
Incidents |  Non-Custodial| Encryption | Verified
```

| Stat | Value | Label |
|------|-------|-------|
| Security incidents | 0 | "To date" |
| Non-custodial | 100% | "Of all deployments" |
| Encryption standard | AES-256 | "Data at rest" |
| Audited by | Mantle Network | "Smart contracts" |

Values: H3, `#F0F6FC`
Labels: Label Caps 11px, `#8B949E`
Separators: 1px `#21262D` vertical lines

---

## RIGHT COLUMN — ILLUSTRATION

**Style:** Flat isometric, 2.5D (NOT a generic 3D shield)

**Concept:** A split illustration showing:
- Left side: User's wallet (phone/hardware wallet) with a lock icon
- Center: MantleMandate logo / "MM" monogram
- Right side: Mantle Network blockchain blocks
- Arrow from wallet → MantleMandate → Blockchain
- Label above arrow: "Authorize only" (dotted line, not solid — indicating permission, not transfer)
- Label: "Your funds never leave your wallet" below the wallet

**Colors:** `#0066FF` and `#00C2FF` for the MantleMandate elements, `#22C55E` for the "authorized" checkmark

---

## COMPLIANCE CERTIFICATIONS STRIP

Below the main two-column section:

**Heading:** "Built for Compliance" — H4, `#F0F6FC`, centered

**Logos/badges in a horizontal row:**
```
[SOC2 Ready]  [Mantle Network]  [Multisig Supported]  [Non-Custodial]  [Smart Contract Audited]
```

Each badge:
- `#161B22` background, border `#21262D`, border-radius 6px, padding 12px 20px
- Icon (20px) + text label below
- Font: Label Caps 10px, `#8B949E`

---

## BOTTOM CTA (within Security section)

```
[ Take Control of Your Security → ]
```
- Ghost button, centered
- Navigates to: Documentation → Security section OR Sign Up

Note: Original CTA "TAKE CONTROL OF YOUR SECURITY" is kept — it's actually effective here. Just render it as a normal CTA button, not a banner headline.
