# Screen 10 — Reports & Exporting
## MantleMandate

---

## PURPOSE
Users review performance across their mandates and agents, and export data for compliance, tax, or personal analysis.

---

## WHAT CHANGED FROM V1
- Report names: "Trading Performance Report" → auto-named by mandate + date range
- Table columns reduced from 7 to 5 visible (show/hide for others)
- Added chart/table view toggle
- "Export Report" button remains prominent

---

## LAYOUT

Standard app layout. Main content full width.

---

## PAGE HEADER

**Left:**
- "Reports & Exporting" — H2, `#F0F6FC`
- Sub-text: "Performance summaries, trade logs, and compliance exports." — Body 14px, `#8B949E`

**Right:**
```
[ ↓ Export Report ]
```
Primary button. Opens export options modal.

---

## SUMMARY STAT CARDS (top row, 5 cards — same style as Dashboard KPIs)

| Card | Value | Label |
|------|-------|-------|
| Total Reports | 1,248 | "Generated" |
| Total P&L | $24,580,439.21 | "All time" |
| Total P&L % | 72.45% | `#22C55E` |
| Max Drawdown | -$3,245.20 | `#EF4444` |
| Sharpe Ratio | 20 | "Risk-adjusted" |

---

## VIEW TOGGLE AND FILTERS

**Left side — View toggle:**
```
[ ≡ Table ]  [ 📊 Charts ]
```
- Active mode: `#0066FF` text, underline
- Inactive: `#8B949E`

**Right side — Filters:**
```
Date: [ 2026-04-01 ▾ ] to [ 2026-04-30 ▾ ]    Agent: [ All Agents ▾ ]    Mandate: [ All Mandates ▾ ]
```

---

## TABLE VIEW (default)

**Table columns (default visible — 5 of 7):**

| Column | Width | Content |
|--------|-------|---------|
| REPORT NAME | 24% | Mandate name + date range, e.g. "ETH Conservative · Apr 2026" |
| TYPE | 10% | Badge: PERFORMANCE / RISK / AGENT / PORTFOLIO |
| DATE RANGE | 16% | "Apr 1 – Apr 30, 2026" |
| TOTAL P&L | 12% | Color: green/red |
| ROI | 10% | Color: green/red |
| ACTIONS | 14% | "View" + "Export" buttons |

**Hidden columns (toggle with "Show More Columns"):**
- Generated On
- Drawdown
- Sharpe Ratio

**"Show More Columns" button:**
- Below table header, right side: "Show more columns +" — Inter Regular 12px, `#58A6FF`

**Row specs:**
- Height: 52px
- Hover: `#1C2128`
- Report name is a clickable link → opens report detail view

**Report type badges:**
- PERFORMANCE: `#0066FF` bg at 15%, `#58A6FF` text
- RISK: `#F5C542` bg at 15%, `#F5C542` text
- AGENT: `#22C55E` bg at 15%, `#22C55E` text
- PORTFOLIO: `#8B949E` bg at 15%, `#8B949E` text

---

## CHART VIEW (when Charts tab selected)

**Layout:** 2x2 grid of chart cards

### Chart 1: Portfolio P&L Over Time
- Line chart, full-width card
- Line: `#0066FF` with gradient fill
- Time selector: 1W / 1M / 3M / 1Y

### Chart 2: P&L by Agent (Bar chart)
- Horizontal bar chart
- Each bar: Agent name on left, P&L value on right
- Bars: Green for positive, red for negative

### Chart 3: Trade Volume by Protocol
- Donut/pie chart
- Segments: Merchant Moe, Agni Finance, Fluxion (brand colors)
- Legend below

### Chart 4: Win Rate by Mandate
- Horizontal stacked bar
- Win (green) vs Loss (red) split per mandate

All charts:
- Dark background (`#161B22`)
- Grid lines: `#21262D`
- Tooltip on hover: standard tooltip card style

---

## EXPORT MODAL

Triggered by "↓ Export Report" button.

```
┌──────────────────────────────────────────┐
│  Export Report                           │
│                                          │
│  Report type:                            │
│  ○ Performance Summary                   │
│  ○ Full Trade Log                        │
│  ○ Agent Activity Report                 │
│  ○ On-Chain Audit Export                 │
│                                          │
│  Date range:                             │
│  [2026-04-01] to [2026-04-30]            │
│                                          │
│  Agent: [ All Agents ▾ ]                 │
│  Mandate: [ All Mandates ▾ ]             │
│                                          │
│  Format:                                 │
│  ● CSV     ○ PDF     ○ JSON              │
│                                          │
│  [ ↓ Generate & Download ]               │
│  [ Cancel ]                              │
└──────────────────────────────────────────┘
```

- Modal: 480px wide, `#161B22` bg, border `#21262D`, border-radius 10px
- After clicking Generate: loading state (spinner), then auto-download
- Success toast: "Report downloaded: ETH-Conservative-Apr2026.csv" (3 sec)

---

## EMPTY STATE

When user has no reports generated yet:

```
BarChart2 icon (48px, `#484F58`)

"No reports yet"
Body 14px, `#8B949E`

"Reports are generated automatically each week once
your agents start executing trades."

[ Deploy Your First Agent ]   Primary button
```
