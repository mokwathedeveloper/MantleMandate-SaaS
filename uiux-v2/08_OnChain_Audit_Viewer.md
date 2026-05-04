# Screen 08 — On-Chain Audit Viewer (Audit Trail)
## MantleMandate

---

## PURPOSE
Proves the on-chain transparency value prop. Every trade decision is recorded immutably on Mantle Network. Users (and anyone they share a public link with) can verify every action the AI agent took.

---

## WHAT CHANGED FROM V1
- Screen name: "ON-CHAIN AUDIT" → "Audit Trail" (sidebar label) / "On-Chain Audit Viewer" (page title)
- Column "AUDIT TIME" → "Timestamp" (more standard)
- TX Hash truncation improved: show 8 chars + "..." + 4 chars, full hash in tooltip
- Added "Mandate" column — shows which mandate triggered the transaction
- Added "Export CSV" button (was in docs but not in the mockup)
- Added empty state design

---

## LAYOUT

Standard app layout (sidebar + main content)

---

## PAGE HEADER

**Left:**
- "On-Chain Audit Viewer" — H2, `#F0F6FC`
- Sub-text: "Every decision and trade recorded immutably on Mantle Network." — Body 14px, `#8B949E`

**Right:**
```
[ ↓ Export CSV ]    [ View on Mantle Explorer ↗ ]
```
- Export CSV: Ghost button
- Mantle Explorer: Ghost button with external link icon

---

## SUMMARY STAT CARDS (top row, 4 cards)

| Card | Value | Label |
|------|-------|-------|
| Total Transactions | 1,248 | "All time" |
| Total Volume | $24,589,435.21 | "Verified on-chain" |
| Success Rate | 98.74% | `#22C55E` color |
| Last 7 Days | 18 transactions | Sub: "3 pending" |

Card style: Compact KPI cards (same as Dashboard)

---

## FILTER BAR

```
Date range: [ 2026-04-01 ▾ ] to [ 2026-04-30 ▾ ]    Chain: [ All Chains ▾ ]    Status: [ All Status ▾ ]    Agent: [ All Agents ▾ ]    Mandate: [ All Mandates ▾ ]
```

Plus right side:
```
[ 🔍 Search by hash or address... ]
```

Filter chips below bar (when filters active):
```
× Date: Apr 2026    × Status: Success    Clear all
```

---

## AUDIT TABLE

**Header row:** `#0D1117` background, Label Caps 11px, `#8B949E`

**Columns:**

| Column | Width | Content |
|--------|-------|---------|
| TX HASH | 14% | First 8 chars + "..." + last 4 chars, JetBrains Mono 12px. Full hash in tooltip on hover. |
| TIMESTAMP | 12% | ISO date "2026-04-12 09:45:21" — JetBrains Mono 12px, `#8B949E` |
| FROM | 12% | Wallet address truncated, JetBrains Mono 12px |
| TO | 12% | Wallet address or protocol name |
| MANDATE | 14% | Mandate name (text link) |
| AMOUNT | 10% | Dollar value |
| STATUS | 10% | SUCCESS / FAILED / PENDING badge |
| BLOCK | 8% | Block number, JetBrains Mono 12px, `#8B949E` |
| ACTIONS | 8% | "View on Explorer ↗" link |

**Row specs:**
- Height: 52px
- Even rows: `#161B22`
- Odd rows: `#0D1117`
- Hover: `#1C2128`
- Row click: expands inline detail (or navigates to transaction detail page)

**Status badge colors:**
- SUCCESS: `#0D2818` bg, `#22C55E` text
- FAILED: `#2D0F0F` bg, `#EF4444` text
- PENDING: `#2A2000` bg, `#F5C542` text

**Expandable row detail (on row click, slides down):**
```
  ┌──────────────────────────────────────────────────────────────────┐
  │  TRANSACTION DETAIL                                              │
  │                                                                  │
  │  Full TX Hash:    0xabcd1234...ef567890  [Copy]                  │
  │  Mandate:         Conservative ETH Buyer                         │
  │  Agent:           Agent-007                                      │
  │  Decision Hash:   0x9f3c...2b4a  [Copy]                         │
  │  Rule Applied:    RSI < 30 trigger, 5% position limit checked    │
  │  Gas Used:        21,000                                         │
  │  Gas Price:       0.001 Gwei                                     │
  │  Explorer:        [View on Mantle Explorer ↗]                    │
  └──────────────────────────────────────────────────────────────────┘
```

---

## PAGINATION

Below table:
```
Showing 1–20 of 1,248 transactions     [ ← Prev ]  [ 1 ]  [ 2 ]  [ 3 ] ... [ 63 ]  [ Next → ]
```

- Inter Regular 13px, `#8B949E`
- Active page: `#0066FF` bg, white text, 32px circle
- Rows per page selector: "20 per page ▾"

---

## PUBLIC SHARE LINK

**Button in page header:**
```
[ 🔗 Share Public Audit Link ]
```
- Clicking generates and copies a public URL
- Anyone with this link can view the audit trail without logging in
- Tooltip explains: "This link shows your audit trail publicly. Your wallet addresses will be visible."

---

## EMPTY STATE

When user has no transactions:

```
Shield icon (48px, `#484F58`)

"No on-chain activity yet"
Body 14px, `#8B949E`

"Once your AI agent executes its first trade on Mantle Network,
every transaction will appear here with full verification."

[ Deploy Your First Agent → ]   Primary button
```
