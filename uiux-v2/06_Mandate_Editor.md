# Screen 06 — Plain-English Mandate Editor
## MantleMandate — The Hero Feature

---

## PURPOSE
This is the core product differentiator. Users write trading strategies in plain English and MantleMandate compiles them into enforceable on-chain policies. The design must make the plain-English textarea the star of the screen — not bury it in a wall of form fields.

---

## WHAT CHANGED FROM V1
- Plain-English textarea made 3x taller and visually prominent (the HERO of the form)
- "Investment Directive" + "Investment Guidelines" merged into ONE field: "Your Trading Mandate"
- Added 3-step wizard mode for new users (full form still available in "Advanced Mode")
- Placeholder text rewritten with concrete, helpful examples
- "Policy Hash" label clarified to "On-Chain Policy Hash" with copy + explorer link
- Mandate naming uses user's own words, not generic codenames

---

## TWO MODES

### Mode A: Wizard (shown for first-time users and "New Mandate" button)
3-step flow: Describe → Risk → Review/Deploy

### Mode B: Full Form (for experienced users, accessible via "Advanced Mode" toggle)

This spec covers both. Default is Wizard mode for new mandates.

---

## LAYOUT (WIZARD MODE)

**Full page, with sidebar navigation visible (user is logged in)**
**Main content area:** max-width 1100px, centered

**Top bar:**
- Heading: "New Mandate" — H2, `#F0F6FC`
- Right side: "Advanced Mode" toggle switch — `#8B949E` label, Inter Regular 13px
- Below heading: Wizard progress bar (same component as Onboarding, 3 steps)

---

## WIZARD STEP 1: YOUR STRATEGY

**Step heading:**
```
Describe your trading strategy
```
- H3, Inter SemiBold 20px, `#F0F6FC`

**Step sub-text:**
```
Write exactly what you want the AI to do. Plain English.
No code, no formulas — just your strategy in your words.
```
- Body 14px, `#8B949E`

**Example strategy chips (click to auto-fill — 4 options):**
```
[ Buy the dip — ETH ]  [ DCA into BTC weekly ]  [ Yield farming — stable ]  [ Momentum trading ]
```
- Pill chips, hover: border `#0066FF`

**MANDATE TEXTAREA — THE HERO ELEMENT:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Describe your strategy here...                                  │
│                                                                  │
│  e.g. "Buy ETH on Mantle when the RSI drops below 30.           │
│  Never risk more than 5% of my portfolio on a single trade.     │
│  Take profit when I'm up 15%. Don't trade on weekends."         │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
│                                          characters: 0 / 2,000  │
└─────────────────────────────────────────────────────────────────┘
```

**Textarea specs:**
- Height: 280px minimum (NOT resizable by user — the full height is always shown)
- Background: `#0D1117`
- Border: 2px solid `#21262D` default, `#0066FF` focused
- Border-radius: 10px
- Padding: 20px
- Font: Inter Regular 16px, `#F0F6FC`, line-height 1.7
- Placeholder font: Inter Regular 16px, italic, `#484F58`
- Focus: subtle `#0066FF` glow (box-shadow: 0 0 0 3px rgba(0,102,255,0.15))
- Character counter: Inter Regular 12px, `#8B949E`, bottom-right of textarea

**Live Parse Panel (appears beside textarea after 50+ chars typed):**
Slides in from the right (on desktop) or appears below (on mobile)

Panel title: "AI is reading your strategy..."
Loading: shows animated dots for 1-2 seconds

Then shows detected elements:
```
✓ Asset:      ETH
✓ Trigger:    RSI < 30
✓ Risk:       ≤ 5% per trade
✓ Take profit: +15%
✓ Schedule:   Mon–Fri only
? Venue:      Auto-routing (not specified)
```
- ✓ = parsed with confidence (green)
- ? = inferred/default (yellow)
- ✗ = conflict or unclear (red, with explanation)

**Additional context fields (below textarea, compact):**

Strategy Name:
- Label: "Strategy name"
- Input: Height 40px, placeholder "e.g. Conservative ETH Dip Buyer"
- Note: "This becomes your mandate and agent name"

Base Currency:
- Select dropdown, options: USDC / USDT / ETH / MNT
- Default: USDC

Start Date:
- Date picker input, default: today

---

## WIZARD STEP 2: RISK LIMITS

**Step heading:** "Set Your Risk Limits"
**Step sub-text:** "These are absolute limits. Your AI agent can never exceed them. You can update these at any time."

(Same slider components as Onboarding Step 3 — see `04_Onboarding_Flow.md`)

Additional fields for full mandate:
- Stop Loss %: Slider 0–50%, default 10%
- Max Open Positions: Slider 1–20, default 5
- Cooldown Period: Select (None / 1hr / 4hr / 24hr / 1 week)

---

## WIZARD STEP 3: REVIEW & DEPLOY

**Left side (65%):**

**Mandate Summary Card:**
```
┌───────────────────────────────────────────┐
│  MANDATE SUMMARY                          │
│  ─────────────────────────────────────────│
│  Name          Conservative ETH Buyer     │
│  Base Currency USDC                       │
│  Start Date    2026-05-04                 │
│  Mandate       [user text, scrollable]    │
│  ─────────────────────────────────────────│
│  MAX DRAWDOWN     15%                     │
│  MAX POSITION     5%                      │
│  STOP LOSS        10%                     │
│  MAX POSITIONS    5                       │
│  COOLDOWN         4 hours                 │
│  ─────────────────────────────────────────│
│  On-Chain Policy Hash                     │
│  Will be generated on deploy              │
│  (computed from mandate content)          │
└───────────────────────────────────────────┘
```

**Right side (35%):**

**Reporting checkboxes:**
```
☑ Daily performance report
☑ Real-time trade notifications
☐ Weekly summary email
☐ On-chain audit notifications
```

**Execution preferences:**
```
Venue routing:    [Auto — best price] ▾
Capital cap:      [ $10,000        ] USD
Wallet:           0x1a2b...9f3c ✓
```

**Deploy button:**
```
[ ⚡ Deploy Mandate & Launch Agent ]
```
- Primary button, full width of right column, height 52px, Inter Bold 16px

**Save as Draft (below deploy):**
```
or  [ Save as Draft ]
```
- Ghost button, full width

---

## FULL FORM (ADVANCED MODE)

When user toggles "Advanced Mode":
All wizard steps collapse into a single-page form with sections:

**Section 1 — Mandate Details** (collapsed header, expandable)
Fields: Mandate Name, Client/Fund, Base Currency, Start Date, Mandate ID (auto), Strategy Type

**Section 2 — Your Trading Mandate** (always expanded — hero section)
ONE textarea field: "Trading Mandate (Plain English)"
This combines the old "Investment Directive" + "Investment Guidelines" into one field

**Section 3 — Risk Parameters** (collapsed by default)
Fields: Max Drawdown, Max Position, Stop Loss, Max Positions, Cooldown

**Section 4 — Execution Settings** (collapsed by default)
Fields: Capital Cap, Venue Routing, Execution Wallet

**Section 5 — Reporting** (collapsed by default)
Checkboxes for report types

**Right panel (fixed, 320px):**
Always-visible Mandate Summary (live preview, updates as user types)

---

## EXISTING MANDATE (Edit Mode)

When editing an existing mandate:
- Banner at top: "Editing: Conservative ETH Buyer — Deployed 2026-04-01"
- Caution notice: "Changes will generate a new policy hash. Your agent will briefly pause during update."
- "Cancel" button prominent
- Save button: "[ Update Mandate ]" instead of "Deploy"
