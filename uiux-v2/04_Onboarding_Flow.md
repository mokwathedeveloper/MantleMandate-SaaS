# Screen 04 — Onboarding Flow (NEW SCREEN)
## MantleMandate — Post Sign-Up Wizard

---

## PURPOSE
This screen did NOT exist in v1. It is the single most important missing screen.

After sign-up, users currently land on an empty dashboard — a dead end with no guidance.
This 4-step wizard is the product's "aha moment." It must show value before the user leaves.

**Goal:** Get the user to deploy their first AI agent in under 5 minutes.

---

## LAYOUT

**Full-page overlay / dedicated route** (not a modal — full page, no sidebar visible)

**Background:** `#0D1117`

**Layout:**
- Top: Progress bar + step indicator
- Center: Step content (large, spacious, focused)
- Bottom: Navigation buttons (Back / Next or Skip)
- Max-width: 640px, horizontally centered

**Do not show:** Sidebar navigation, top nav bar (this is a focused flow — no distractions)

**Top bar (64px height):**
- Left: MantleMandate logo (small, 32px height)
- Right: "Skip setup — go to dashboard" link (`#8B949E`, Inter Regular 13px)

---

## PROGRESS INDICATOR

Horizontal step indicator at top of content area:

```
  ●━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━○
Step 1           Step 2           Step 3           Step 4
Connect          Write            Set Limits        Deploy
```

- Active step: `#0066FF` filled circle (20px), connector line `#0066FF`
- Completed step: `#22C55E` filled circle with checkmark icon
- Upcoming step: `#21262D` filled circle, connector line `#21262D`
- Step label: Label Caps 11px, `#8B949E` (active: `#F0F6FC`)

---

## STEP 1: CONNECT YOUR WALLET

**Step label:** "Step 1 of 4"
**Heading:**
```
Connect your wallet
(or skip for now)
```
- H2, Inter Bold 32px, `#F0F6FC`

**Sub-text:**
```
Connecting a wallet lets MantleMandate execute trades on your behalf.
You can always connect one later from your profile settings.
```
- Body 15px, `#8B949E`, max-width 520px

**Wallet options (vertical list, gap 12px):**

MetaMask button:
- Height: 56px, full width
- Background: `#161B22`, border: 1px solid `#21262D`, border-radius 8px
- Left: MetaMask fox logo (28px)
- Center: "MetaMask" — Inter SemiBold 15px, `#F0F6FC`
- Right: Arrow icon `#8B949E`
- Hover: border `#0066FF`, background `#0066FF` at 5%

WalletConnect button:
- Same style, WalletConnect logo

Coinbase Wallet button:
- Same style, Coinbase logo

**Skip option (below wallet buttons):**
```
Skip for now — I'll connect a wallet later
```
- Inter Regular 13px, `#8B949E`, centered, underline on hover

**Connected state (after clicking wallet):**
- Wallet address shown in a success card:
  ```
  ✓ Connected: 0x1a2b...9f3c
  ```
- Background: `#0D2818`, border: 1px `#22C55E`, border-radius 8px, padding 16px
- "Change wallet" link right-aligned

**Bottom nav:**
- Left: — (no back button on step 1)
- Right: "Next →" Primary button, enabled after wallet connected OR after skip

---

## STEP 2: WRITE YOUR FIRST MANDATE

**Step label:** "Step 2 of 4"
**Heading:**
```
Describe your trading strategy
in plain English
```
- H2, Inter Bold 32px, `#F0F6FC`

**Sub-text:**
```
No code. No formulas. Just tell the AI what you want it to do.
```
- Body 15px, `#8B949E`

**Example chips (above textarea — clickable to auto-fill):**

```
[ Conservative ETH buy ]  [ DCA strategy ]  [ Yield farming ]  [ Custom... ]
```
- Pill chips: `#161B22` background, border `#21262D`, Label Caps 11px, `#8B949E`
- Hover: border `#0066FF`
- Click: Pre-fills textarea with example text

**Textarea (HERO ELEMENT of this step):**
- Height: 280px
- Background: `#0D1117`
- Border: 2px solid `#21262D` (default), 2px solid `#0066FF` (focused)
- Border-radius: 8px
- Padding: 20px
- Font: Inter Regular 15px, `#F0F6FC`, line-height 1.6
- Placeholder (italic, `#484F58`):
  ```
  e.g. "Buy ETH on Mantle when the RSI drops below 30.
  Never risk more than 5% of my portfolio on a single trade.
  Take profit when 15% gain is reached. Avoid trading on weekends."
  ```
- Focus animation: Border glows with `#0066FF` at 30% opacity (subtle box-shadow)
- Character count bottom-right: "0 / 2000" — Inter Regular 12px, `#484F58`

**Live preview panel (appears after user starts typing, slides in from right):**
- Width: 320px, positioned right of textarea (or below on mobile)
- Title: "MantleMandate is reading your strategy..." with typing animation
- Shows parsed intent:
  - Asset: ETH
  - Trigger: RSI < 30
  - Risk per trade: ≤ 5%
  - Take profit: 15%
  - Schedule: Weekdays only
- Each parsed item animates in as detected

**Bottom nav:**
- Left: "← Back" (ghost button)
- Right: "Next →" (Primary, enabled when textarea has 20+ characters)

---

## STEP 3: SET YOUR RISK LIMITS

**Step label:** "Step 3 of 4"
**Heading:**
```
Set your safety limits
```
- H2, Inter Bold 32px, `#F0F6FC`

**Sub-text:**
```
These are hard limits. Your AI agent cannot exceed them — ever.
You can change these at any time from the Risk Engine settings.
```
- Body 15px, `#8B949E`

**Two primary sliders:**

**Max Drawdown (%)**
- Label: "Maximum Drawdown" — Inter SemiBold 14px, `#F0F6FC`
- Sub-label: "If portfolio value drops by this %, all agents pause automatically." — Inter Regular 13px, `#8B949E`
- Slider: 0% → 50%, default: 15%
- Current value: Large display "15%" right-aligned, `#F0F6FC`, H3
- Track: `#21262D`, filled portion: `#0066FF`
- Thumb: 20px circle, `#0066FF`, white border
- Below slider: three zone labels:
  ```
  Conservative (5-10%)    Balanced (10-20%)    Aggressive (20%+)
  ```
  Label Caps 10px, colored appropriately (green / yellow / red)

**Max Position Size (%)**
- Label: "Max Position Size"
- Sub-label: "Maximum % of portfolio in any single trade."
- Slider: 1% → 50%, default: 10%
- Same styling as above

**Quick preset buttons:**
```
[ Conservative ]  [ Balanced ]  [ Aggressive ]  [ Custom ]
```
- Clicking sets both sliders to preset values:
  - Conservative: Drawdown 10%, Position 5%
  - Balanced: Drawdown 20%, Position 10%
  - Aggressive: Drawdown 35%, Position 25%

**Selected preset shows active state:** `#0066FF` background, white text

**Bottom nav:**
- Left: "← Back"
- Right: "Next →" Primary

---

## STEP 4: REVIEW & DEPLOY

**Step label:** "Step 4 of 4"
**Heading:**
```
You're ready to deploy
```
- H2, Inter Bold 32px, `#F0F6FC`

**Summary card:**

Background: `#161B22`, border: 1px solid `#21262D`, border-radius 12px, padding 24px

```
Your First Agent
─────────────────────────────────────────

Strategy        [User's mandate text, truncated to 80 chars]
Asset           ETH (detected from mandate)
Wallet          0x1a2b...9f3c  [or "Not connected"]
Max Drawdown    15%
Max Position    10%
Execution       Merchant Moe, Agni Finance (best price routing)
On-Chain Hash   Will be generated on deploy
─────────────────────────────────────────
Status          Ready to deploy ✓
```

Each row: left label `#8B949E`, right value `#F0F6FC`, Inter Regular 14px
Hash row: JetBrains Mono 13px

**Mandate text shown in full (scrollable if long):**
- Background: `#0D1117`, border-radius 6px, padding 16px
- Font: Inter Regular 14px, `#F0F6FC`, line-height 1.6

**Deploy button:**
```
[ ⚡ Deploy My First Agent ]
```
- Full width, Primary button, height 52px
- Font: Inter Bold 16px
- Loading state: "Deploying... generating on-chain hash" with spinner
- "This may take 10-20 seconds"

**After successful deploy (replaces button area):**
- Large success state:
  ```
  ✓ Agent Deployed Successfully!
  On-Chain Hash: 0xabcd...1234   [Copy] [View on Mantle Explorer ↗]
  ```
  - Background: `#0D2818`, border: 1px `#22C55E`, border-radius 8px
  - Hash: JetBrains Mono 13px, `#22C55E`

- Continue button:
  ```
  [ View My Dashboard → ]
  ```
  - Primary button, full width

**Bottom (below deploy button):**
```
← Back    |    Skip — Deploy later from dashboard
```
- "Skip" is `#8B949E`, Inter Regular 13px

---

## FLOW SUMMARY

```
Sign Up → [04 Onboarding] → Step 1: Wallet → Step 2: Mandate → Step 3: Limits → Step 4: Deploy → Dashboard
```

Skip available at any step → goes directly to Dashboard (with empty state guidance)
