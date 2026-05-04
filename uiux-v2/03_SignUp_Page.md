# Screen 03 — Sign-Up Page (Registration)
## MantleMandate

---

## PURPOSE
Convert a first-time visitor into a registered user. Minimize friction. Build trust. Set expectations for what comes next (onboarding flow).

---

## WHAT CHANGED FROM V1
- Headline: "Create Your Account" → "Start in 60 Seconds"
- Sub-text updated to clarify no wallet required
- Button label: "Create Account" → "Create My Account"
- Feature bullets on left rewritten with specific copy
- Added "What happens next" hint below the form
- Brand fixed: "MANTLEMANDATE-SAAS" → "MantleMandate"

---

## LAYOUT

Same split-screen layout as Login page:
- Left panel: 45% — feature highlights (different from login left panel)
- Right panel: 55% — registration form

---

## LEFT PANEL

**Background:** `#0D1117`
**Padding:** 80px 64px

**Top:** MantleMandate wordmark

**Heading:**
```
Trade smarter.
Not harder.
```
- H1, Inter Black 44px, `#F0F6FC`
- "smarter." — gradient text (`#0066FF` → `#00C2FF`)

**Sub-text:**
```
Join MantleMandate and deploy your first AI trading
agent in minutes — no coding, no wallet required to start.
```
- Body 15px, `#8B949E`, line-height 1.6

**Feature list (4 items, gap 20px):**

Item 1:
- Icon: `Shield` (20px, `#0066FF`)
- Text: "Enterprise-grade security — multisig wallet protection"

Item 2:
- Icon: `TrendingUp` (20px, `#22C55E`)
- Text: "AI agents that follow YOUR rules — not ours"

Item 3:
- Icon: `Network` (20px, `#0066FF`)
- Text: "Executes across Mantle DeFi protocols automatically"

Item 4:
- Icon: `Eye` (20px, `#0066FF`)
- Text: "Full on-chain audit trail — share publicly or keep private"

**Format:** Icon + text on same line, Inter Regular 14px, `#8B949E`

**Bottom:** Mantle Network badge (same as login page)

---

## RIGHT PANEL

**Background:** `#161B22`
**Padding:** 64px

**Heading:**
```
Start in 60 Seconds
```
- H2, Inter Bold 28px, `#F0F6FC`

**Sub-heading:**
```
No wallet required. No credit card to sign up. Cancel any time.
```
- Body 14px, `#8B949E`

---

**Form fields (gap 16px):**

**Full Name**
- Label: "Full name"
- Input: Placeholder "John Smith"
- Type: text

**Email Address**
- Label: "Email address"
- Input: Placeholder "you@example.com"
- Type: email

**Password**
- Label: "Create password"
- Input: Password with show/hide toggle
- Strength indicator below (4 segments: weak / fair / good / strong)
  - Weak: 1 red segment
  - Fair: 2 orange segments
  - Good: 3 yellow segments
  - Strong: 4 green segments
- Hint text: "Min 8 characters, 1 uppercase, 1 number"
- Font: Inter Regular 12px, `#8B949E`

**Confirm Password**
- Label: "Confirm password"
- Input: Password field
- Inline validation: Green checkmark icon when passwords match

**Company (Optional)**
- Label: "Company name (optional)"
- Input: Placeholder "Your firm or DAO"

**Terms checkbox:**
```
☐  I agree to the Terms of Service and Privacy Policy
```
- Checkbox: 16x16px, border `#21262D`, checked: `#0066FF` fill
- Text: Inter Regular 13px, `#8B949E`
- "Terms of Service" and "Privacy Policy" are `#58A6FF` links

---

**Create Account button:**
```
[ Create My Account ]
```
- Full width, Primary button
- Height: 44px, Inter SemiBold 15px
- Disabled state when: required fields empty or terms unchecked

**Error handling:**
- Required fields show red border + "This field is required" below in Inter Regular 12px, `#EF4444`
- Email format error: "Please enter a valid email address"
- Password mismatch: "Passwords do not match"

---

**Divider:**
```
─────────────  or sign up with  ─────────────
```

**OAuth buttons:** Google + Microsoft (same style as login page)

---

**Footer link:**
```
Already have an account?  Sign in →
```
- Inter Regular 13px, `#8B949E`
- "Sign in →" — `#58A6FF`

---

**"What happens next" hint (below footer link):**

```
After signing up →  Connect wallet (optional)  →  Write your first mandate  →  Deploy your agent
```
- Small horizontal flow, Label Caps 11px, `#484F58`
- Arrows: `#484F58`
- This sets expectation for the onboarding flow they'll see immediately after

---

## FORM VALIDATION RULES

| Field | Rule | Error Message |
|-------|------|---------------|
| Full name | Required, min 2 chars | "Please enter your full name" |
| Email | Required, valid format | "Please enter a valid email address" |
| Password | Required, min 8 chars, 1 uppercase, 1 number | "Password doesn't meet requirements" |
| Confirm password | Must match password | "Passwords do not match" |
| Terms | Must be checked | "You must agree to the terms to continue" |

All errors shown inline below the relevant field, not as a top-level banner (except network errors).

---

## AFTER SUCCESSFUL REGISTRATION

Do NOT redirect directly to Dashboard.
→ Redirect to: `04_Onboarding_Flow.md` (4-step wizard)

This is the product's first impression. Don't waste it with an empty dashboard.

---

## RESPONSIVE (Mobile)

- Left panel hidden
- MantleMandate logo shown at top of form
- Company field hidden by default (collapse with "Add company" link)
- OAuth buttons stack vertically
