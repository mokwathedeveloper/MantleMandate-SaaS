# Screen 07 — AI Agent Deployment & Monitoring
## MantleMandate

---

## PURPOSE
Users see all their deployed AI agents, their live status, and key performance metrics at a glance. They can deploy new agents, pause/stop existing ones, and drill into details.

---

## WHAT CHANGED FROM V1
- Brand: "ALPHACAP" → "MantleMandate" in sidebar
- Agent names: generic "Alpha Nova I/II" → user-defined names from mandate creation
- Added filter bar: All | Active | Paused | Failed
- Added "Mandate" label on each card showing which mandate the agent runs
- Clicking a card now clearly leads to a detail view (implied in mockup, now specified)
- "Deploy New Agent" flow now specified (was a button with no backing design)

---

## LAYOUT

**Standard app layout** (sidebar + main content)
**Main content:** Full width

---

## PAGE HEADER

**Left:**
- "AI Agents" — H2, `#F0F6FC`
- Sub-text: "12 agents deployed · 9 active · 2 paused · 1 failed" — Body 14px, `#8B949E`

**Right:**
```
[ ⚡ Deploy New Agent ]
```
- Primary button, Inter SemiBold 14px

---

## KPI STRIP (below header)

Four small stat cards in a horizontal row:

| Stat | Value | Color |
|------|-------|-------|
| Total Agents | 12 | `#F0F6FC` |
| Active | 9 | `#22C55E` |
| Paused | 2 | `#F5C542` |
| Failed | 1 | `#EF4444` |

Each card: `#161B22` background, border `#21262D`, padding 12px 20px, compact

---

## FILTER BAR

```
[ All (12) ]  [ Active (9) ]  [ Paused (2) ]  [ Failed (1) ]
```
Horizontal tab-style filter:
- Active tab: `#0066FF` text, `#0066FF` underline
- Inactive: `#8B949E`

Plus right side:
```
Search agents...   [🔍]    Sort: P&L ▾
```
- Search: 240px input
- Sort: dropdown (P&L, ROI, Volume, Name, Date deployed)

---

## AGENT CARD GRID

**Layout:** 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
**Card size:** Equal height, gap 16px

### Agent Card Anatomy

**Card:** `#161B22` background, border 1px `#21262D`, border-radius 8px, padding 20px
**Hover:** border `#0066FF` at 50% opacity, cursor pointer (navigate to detail view)

**Card top row:**
- Left: Agent name — H4, Inter SemiBold 16px, `#F0F6FC`
- Right: Status badge (ACTIVE / PAUSED / FAILED / STOPPED)

**Mandate tag (below name):**
- "Running: [Mandate Name]" — Label Caps 10px, `#8B949E`
- Example: "Running: Conservative ETH Buyer"

**Metrics row (4 items, 25% each):**

| Label | Example | Color rule |
|-------|---------|------------|
| P&L | +$12,450 | Green if positive, red if negative |
| ROI | +8.24% | Green/red |
| Volume | $2.4M | `#F0F6FC` |
| Drawdown | -2.1% | Green if <5%, yellow if 5-15%, red if >15% |

Label: Label Caps 10px, `#8B949E`
Value: Inter SemiBold 15px

**Sparkline chart (below metrics):**
- 60px height, full card width
- 30-day performance line
- Line: `#0066FF` or `#22C55E` (if positive overall)
- Fill: Gradient from line color at 20% to transparent

**Card bottom row:**
- Left: "Deployed: April 12, 2026" — Body Small 12px, `#484F58`
- Right: Action buttons (icon-only, 28x28px each):
  - Play/Pause toggle: `PauseCircle` or `PlayCircle`
  - Stop: `StopCircle`
  - Settings: `Settings`
  - View detail: `ExternalLink`

**Active status dot:**
- 8px circle left of agent name
- Active: `#22C55E` with pulse animation
- Paused: `#F5C542`, no pulse
- Failed: `#EF4444`, no pulse
- Stopped: `#484F58`

---

## EXAMPLE AGENT CARDS

**Agent: "Conservative ETH Buyer"**
- Status: ACTIVE (green dot)
- Mandate: Conservative ETH Buyer
- P&L: +$12,450 (green)
- ROI: +8.24% (green)
- Volume: $2.4M
- Drawdown: -2.1% (green)

**Agent: "BTC Momentum Strategy"**
- Status: PAUSED (yellow dot)
- Mandate: BTC Momentum
- P&L: +$3,200 (green)
- ROI: +2.1% (green)
- Paused reason: "Low gas — manually paused"
- Drawdown: -0.5% (green)

**Agent: "Yield Farming USDC"**
- Status: FAILED (red dot)
- Mandate: Stable Yield v2
- Last error: "Insufficient liquidity on Agni Finance"
- Red tint on card border

---

## DEPLOY NEW AGENT FLOW

Triggered by "Deploy New Agent" button.

**Option A (fastest):**
Modal dialog — "Deploy Agent from Existing Mandate"
- Dropdown: Select a mandate
- Select: Execution wallet
- Set: Capital cap (USD)
- Button: "Deploy →"

**Option B:**
Navigate to Mandate Editor → create new mandate → deploy at end of wizard

Modal has both options visible:
```
┌──────────────────────────────────┐
│  Deploy New Agent                │
│                                  │
│  From existing mandate:          │
│  [Select mandate... ▾]           │
│                                  │
│  Capital cap: [$5,000 USD]       │
│  Wallet: [0x1a2b...9f3c ▾]       │
│                                  │
│  [ Deploy Agent ]                │
│  or                              │
│  [ Create a New Mandate First ]  │
└──────────────────────────────────┘
```

---

## AGENT DETAIL VIEW

Accessible by clicking any agent card (or ExternalLink icon).

**Page heading:** "[Agent Name]" with status badge

**Tabs:**
```
Overview    Trade History    Mandate    Audit Trail    Settings
```

**Overview tab:**
- Performance chart (full width, 200px height, line chart)
- Metrics: Lifetime P&L, Lifetime ROI, Total Trades, Win Rate, Avg Trade Size
- Mandate compliance log: list of rule checks run before each trade

**Trade History tab:**
- Table of all trades this agent executed
- Columns: Time, Asset, Direction (Buy/Sell), Amount, Price, P&L, Status, Mandate Rule, Block link

**Mandate tab:**
- Shows the plain-English mandate text
- Shows parsed policy
- Shows On-Chain Policy Hash with Mantle Explorer link

**Audit Trail tab:**
- Same as main Audit Viewer but filtered to this agent only

---

## EMPTY STATE (No Agents)

When user has no agents deployed:

```
Bot icon (48px, `#0066FF`)

"No agents deployed yet"
Body 14px, `#8B949E`

"Create a mandate and deploy your first AI agent
to start trading on Mantle Network."

[ ⚡ Deploy My First Agent ]   Primary button
[ or browse example mandates ]   Text link
```
