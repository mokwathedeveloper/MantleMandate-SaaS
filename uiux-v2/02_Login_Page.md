# Screen 02 — Login Page (Sign In)
## MantleMandate

---

## PURPOSE
Returning users authenticate quickly and securely. Must feel fast, trustworthy, and connected to the app they're about to enter.

---

## WHAT CHANGED FROM V1
- Headline: "Welcome Back / Log In" → "Welcome back" with context sub-line
- Button label: "Log In" → "Sign In" (consistent with nav and Web3 convention)
- Brand in top-left: "MANTLEMANDATE-SAAS" → "MantleMandate" wordmark
- Added live portfolio status hint below form
- Trust icons rewritten with specific copy

---

## LAYOUT

**Split-screen layout (desktop):**
- Left panel: 45% width — brand/trust content
- Right panel: 55% width — login form
- No top navigation bar on this page (standalone auth page)

**Mobile:** Single column, form only (left panel hidden)

---

## LEFT PANEL

**Background:** `#0D1117`
**Vertical padding:** 80px

**Top:**
- MantleMandate logo (wordmark + monogram)
- Font: Inter Bold 20px, `#F0F6FC`

**Center content:**

Heading:
```
Your mandates are
still running.
```
- Font: Inter Bold 40px, `#F0F6FC`, line-height 1.1

Sub-text:
```
Sign in to check your AI agent performance,
review your on-chain audit trail, and
manage your active mandates.
```
- Font: Inter Regular 15px, `#8B949E`, line-height 1.6

**Three trust items (vertical list, gap 20px):**

Item 1:
- Icon: `Shield` (Lucide, 20px, `#0066FF`)
- Title: "Non-Custodial" — Inter SemiBold 14px, `#F0F6FC`
- Body: "We never hold your funds" — Inter Regular 13px, `#8B949E`

Item 2:
- Icon: `Zap` (Lucide, 20px, `#0066FF`)
- Title: "Real-Time Execution" — Inter SemiBold 14px, `#F0F6FC`
- Body: "Live P&L updated every block" — Inter Regular 13px, `#8B949E`

Item 3:
- Icon: `Building2` (Lucide, 20px, `#0066FF`)
- Title: "Built for Institutions" — Inter SemiBold 14px, `#F0F6FC`
- Body: "Compliance-ready, multisig-protected" — Inter Regular 13px, `#8B949E`

**Bottom:** Mantle Network badge
```
⬡ Deployed on Mantle Network
```
- Label Caps, `#0066FF`

---

## RIGHT PANEL

**Background:** `#161B22`
**Padding:** 80px 64px
**Max-width of form content:** 400px, horizontally centered in panel

**Top of form area:**

Heading:
```
Welcome back
```
- H2 (Inter SemiBold 28px), `#F0F6FC`

Sub-heading:
```
Sign in to your MantleMandate account
```
- Body 14px, `#8B949E`

---

**Form fields (gap 16px between fields):**

**Email Address**
- Label: "Email address" — Inter Medium 13px, `#8B949E`
- Input: Standard text input, placeholder "you@example.com"
- Type: email

**Password**
- Label: "Password" — Inter Medium 13px, `#8B949E`
- Input: Password input with show/hide toggle (Eye icon right side)
- Placeholder: "Enter your password"

**Options row** (between password and button):
- Left: Checkbox "Remember me" — Inter Regular 13px, `#8B949E`
- Right: Link "Forgot password?" — `#58A6FF`, Inter Medium 13px

---

**Sign In button:**
```
[ Sign In ]
```
- Full width, Primary button style
- Height: 44px, Inter SemiBold 15px
- Loading state: Spinner icon replaces text, disabled

**Error state (shown below button when credentials fail):**
- Background: `#2D0F0F`, border: 1px solid `#EF4444`, border-radius 6px, padding 12px
- Icon: `AlertCircle` (Lucide, 16px, `#EF4444`) left-aligned
- Text: "Incorrect email or password. Please try again." — Inter Regular 13px, `#EF4444`

---

**Divider:**
```
─────────────  or continue with  ─────────────
```
- Inter Regular 12px, `#484F58`
- Lines: 1px `#21262D`

**OAuth buttons (horizontal, gap 12px):**

Google:
- Width: 50%, height: 40px
- Background: `#161B22`, border: 1px solid `#21262D`
- Google "G" logo (16px SVG) + "Google" — Inter Medium 14px, `#F0F6FC`

Microsoft:
- Same style, Microsoft logo

---

**Footer link:**
```
Don't have an account?  Start for free →
```
- Inter Regular 13px, `#8B949E`
- "Start for free →" — `#58A6FF`, Inter Medium 13px

---

## STATES

**Default:** As described above
**Loading (after submit):** Sign In button shows spinner, inputs disabled
**Error:** Error banner shown, inputs retain their values
**Success:** Brief success flash, then redirect to Dashboard or Onboarding (if first login)

---

## RESPONSIVE (Mobile)

- Left panel completely hidden
- Right panel fills full screen
- Add MantleMandate logo at top of form (since left panel is gone)
- Form padding: 24px horizontal
