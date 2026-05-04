# Screen 05 — Dashboard (Main App)
## MantleMandate

---

## PURPOSE
The command center. Users check this first every session. Must show portfolio health, agent status, and recent activity at a glance — in under 3 seconds of reading.

---

## WHAT CHANGED FROM V1
- Brand: "ALPHACAP | CAPITAL PARTNER" → "MantleMandate" wordmark in sidebar
- Sidebar label: "ON-CHAIN AUDIT" → "Audit Trail"
- Alert banner text: "TRADE SUCCESSFUL" → specific: "TRADE EXECUTED: +$2,450 | BTC/USDT | Merchant Moe"
- Drawdown color: standardized — any negative drawdown = red (not orange/yellow)
- Recent Trades table: added "Mandate" column
- Agent status dot: added pulse animation for ACTIVE state

---

## LAYOUT

**Three-panel layout:**
- Left: Sidebar navigation (240px fixed)
- Main content: Flexible width (fills remaining space)
- Right panel: Real-Time Alerts (320px fixed, visible when alerts exist)

**Top of main content:** Alert banner (if any active alert)
**Then:** KPI cards row
**Then:** Two-column content (chart left, recent trades right)

---

## SIDEBAR

**Width:** 240px
**Background:** `#0D1117`
**Right border:** 1px solid `#21262D`

**Logo area (64px height):**
- MantleMandate wordmark (logo mark + text)
- Separator below

**Navigation items (40px height each, 8px vertical gap):**

```
MAIN
  LayoutDashboard  Dashboard          ← current page (active state)
  FileText         Mandates
  TrendingUp       Portfolio
  Zap              Trades
  Shield           Audit Trail        ← renamed from "On-Chain Audit"

AGENTS
  Bot              AI Agents
  Gauge            Risk Engine
  Network          Protocols
  Code2            API

ACCOUNT
  Bell             Alerts
  BarChart2        Reports
  Settings         Settings
  HelpCircle       Support
```

- Section labels: Label Caps 10px, `#484F58`, 32px top padding
- Icon: 16px, `#8B949E` (inactive), `#F0F6FC` (active)
- Text: Inter Medium 13px, `#8B949E` (inactive), `#F0F6FC` (active)
- Active item: `#161B22` background, 3px left border `#0066FF`

**Bottom of sidebar (pinned):**
- User avatar (32px circle, initials if no photo)
- Name: Inter SemiBold 13px, `#F0F6FC`
- Plan badge: "STRATEGIST" — Label Caps, `#0066FF` on `#0066FF` at 15% bg
- Gap, then:
- "Log Out" — Inter Regular 12px, `#484F58` (muted — should not draw attention)

---

## ALERT BANNER (conditional — shown when active alert)

**Displayed above KPI cards, full width of main content**
**Height:** 48px

**Success example:**
```
✓ TRADE EXECUTED: +$2,450 | BTC/USDT | via Merchant Moe  [View Trade]  [×]
```
- Background: `#0D2818`, left border 4px `#22C55E`
- Icon: CheckCircle 16px, `#22C55E`
- Text: Inter Medium 14px, `#22C55E`
- "View Trade": Ghost button (small), `#22C55E` border, 28px height

**Error example:**
```
⚠ INSUFFICIENT GAS — Agent Alpha-ETH-01 paused  [Add Funds]  [Pause Agent]  [×]
```
- Background: `#2D0F0F`, left border 4px `#EF4444`
- Two action buttons: filled red + ghost red
- Text: Inter Medium 14px, `#EF4444`

Only ONE banner visible at a time. If multiple alerts, show most severe. Others visible in Alerts panel.

---

## KPI CARDS ROW

**Layout:** 5 cards, equal width, 16px gap, full width of main content
**Card style:** Standard card (`#161B22`, border `#21262D`, border-radius 8px, padding 20px 24px)

### Card 1 — Portfolio Value
- Label (top): "Portfolio Value" — Label Caps 11px, `#8B949E`
- Value: "$128,450.75" — H2, Inter Bold 28px, `#F0F6FC`
- Delta: "+$2,450 (1.94%) today" — Body Small 12px, `#22C55E`
- Delta icon: TrendingUp 14px, `#22C55E`
- Note: Previously "TOTAL PORTFOLIO NAV" — simplified for readability

### Card 2 — Portfolio P&L
- Label: "Total P&L"
- Value: "+$24,589,435.21" (if positive: `#22C55E`, if negative: `#EF4444`)
- Delta: "+6.8% all time"

### Card 3 — Active Agents
- Label: "Active Agents"
- Value: "12" — H2, `#F0F6FC`
- Sub: "of 15 total" — Body Small, `#8B949E`
- Below: Mini horizontal bar showing ratio (active in `#22C55E`, paused in `#F5C542`, stopped in `#484F58`)

### Card 4 — Total Trades
- Label: "Total Trades"
- Value: "2,456,780" — H2, `#F0F6FC`
- Delta: "+152 today" — `#8B949E`

### Card 5 — Max Drawdown
- Label: "Max Drawdown"
- Value: "-1.38%" — H2
- Color rule:
  - 0–5%: `#22C55E` (healthy)
  - 5–15%: `#F5C542` (warning)
  - 15%+: `#EF4444` (critical)
- Background of card: tinted with value color at 5% opacity

---

## MAIN CONTENT AREA (below KPI cards)

**Layout:** Two columns, 60/40 split, 24px gap

### Left column — Portfolio Performance Chart

**Card:** Standard card, full height
**Heading:** "Portfolio Performance" — H4, `#F0F6FC`
**Right of heading:** Time selector tabs: 1D | 1W | 1M | 3M | 1Y | All
  - Active tab: `#0066FF` text, underline
  - Inactive: `#8B949E`

**Chart:**
- Line chart (area chart with gradient fill)
- Line: `#0066FF`, 2px stroke
- Area fill: gradient from `#0066FF` at 20% (top) to transparent (bottom)
- Grid lines: `#21262D`, horizontal only
- Y-axis: `#8B949E`, Body Small 11px
- X-axis: `#8B949E`, Body Small 11px
- Tooltip on hover: Dark tooltip card showing date + value + delta
- Cursor line: 1px dashed `#0066FF` vertical on hover

### Right column — Recent Trades

**Card:** Standard card
**Heading:** "Recent Trades" — H4, `#F0F6FC`
**Right of heading:** "View all →" link, `#58A6FF`

**Table:**

| Column | Width | Content |
|--------|-------|---------|
| Asset | 15% | Token icon + symbol (e.g. ETH) |
| Mandate | 20% | Mandate name (e.g. "ETH Conservative") — NEW COLUMN |
| Amount | 15% | Trade size in USD |
| Price | 12% | Execution price |
| P&L | 12% | Green or red delta |
| Status | 12% | SUCCESS / FAILED badge |
| Time | 14% | "2h ago" relative |

- Table font: Body 14px
- Hash/address: JetBrains Mono 13px
- Row hover: `#1C2128` background
- Max rows shown: 6 (then "View all →")

---

## RIGHT PANEL — REAL-TIME ALERTS

**Width:** 320px
**Background:** `#161B22`
**Left border:** 1px solid `#21262D`
**Padding:** 20px

**Header:**
- "Real-Time Alerts" — H4, `#F0F6FC`
- Right: "Mark all read" link (`#58A6FF`) + "Clear" (`#8B949E`)

**Alert items (vertical list, gap 8px):**

Each alert item:
- Severity dot: 8px circle (red/yellow/blue)
- Title: Inter SemiBold 13px, `#F0F6FC`
- Sub-text: Inter Regular 12px, `#8B949E`
- Timestamp: Inter Regular 11px, `#484F58`
- Right: severity badge (HIGH/MEDIUM/LOW)

Example alerts:
```
● TRADE EXECUTED           HIGH
  BTC/USDT +$2,450 via Merchant Moe
  2 minutes ago

● MANDATE UPDATED          MEDIUM
  "ETH Conservative" policy hash updated
  15 minutes ago

● LOW GAS WARNING          HIGH
  Agent Alpha-ETH-01 may pause soon
  32 minutes ago

● DRAWDOWN LIMIT           MEDIUM
  Portfolio at 8.2% — approaching limit
  1 hour ago
```

**When no alerts:**
Empty state:
```
Bell icon (32px, `#484F58`)
"No alerts right now"
Body 13px, `#484F58`, centered
"Your agents are running smoothly."
```

---

## EMPTY STATE (New User, No Data)

When user has just signed up and has no agents/trades:

**Replace KPI cards with:**
```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│         Bot icon (48px, `#0066FF`)                      │
│                                                          │
│    "Your dashboard is waiting for your first trade"      │
│    "Deploy an AI agent to see live portfolio data here." │
│                                                          │
│         [ ⚡ Create My First Mandate ]                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## RESPONSIVE (Tablet 768px)

- Sidebar collapses to 64px (icon only, tooltips on hover)
- Alerts panel hidden (accessible via Bell icon in sidebar)
- KPI cards: 3 visible, remaining in horizontal scroll
- Chart and Recent Trades: stack vertically
