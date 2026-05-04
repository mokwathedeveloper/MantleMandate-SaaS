# Screen 12 — Multi-Protocol Integration
## MantleMandate

---

## PURPOSE
Users see and manage all connected DeFi protocols, monitor their status, and add new integrations. This screen demonstrates MantleMandate's ecosystem breadth on Mantle Network.

---

## WHAT CHANGED FROM V1
- Protocol cards now show actual brand logos (not just text labels)
- INACTIVE protocols show tooltip explaining why
- Added summary footer: "Active across N protocols | $X total volume"
- "Add New Protocol" button flow specified

---

## LAYOUT

Standard app layout (sidebar + main content)

---

## PAGE HEADER

"Multi-Protocol Integration" — H2, `#F0F6FC`
Sub-text: "Monitor and manage your DeFi protocol connections across Mantle Network." — Body 14px, `#8B949E`

**Right side:**
```
[ + Add New Protocol ]    [ 🔍 Search protocols... ]    [ All Protocols ▾ ]
```

---

## SUMMARY KPI ROW (4 cards)

| Card | Value | Label |
|------|-------|-------|
| Active Protocols | 12 | "Connected" |
| Active Monitoring | 8 | "Live tracking" |
| Total Trade Volume | $24,589,435.21 | "All time" |
| Find New Protocol | + | "Browse marketplace" |

---

## FILTER TABS

```
[ All (12) ]  [ Active (9) ]  [ Inactive (3) ]  [ Mantle Native ]  [ Other ]
```

---

## PROTOCOL CARD GRID

**Layout:** 4 columns (desktop), 3 columns (tablet), 2 columns (mobile)
**Card gap:** 16px

### Protocol Card Anatomy

**Card:** `#161B22` bg, border 1px `#21262D`, border-radius 8px, padding 20px
**Hover:** border `#0066FF` at 50%

**Card top row:**
- Protocol logo: 40x40px (actual brand icon/logo) — NOT placeholder text
- Protocol name: H4, Inter SemiBold 16px, `#F0F6FC`
- Status badge: ACTIVE / INACTIVE / MONITORING

**Metrics (2x2 grid inside card):**
| Metric | Value |
|--------|-------|
| Volume | $5.2M |
| TVL | $145.2M |
| Allocation | 40% |
| Trades | 1,248 |

Label: Label Caps 10px, `#8B949E`
Value: Inter SemiBold 14px, `#F0F6FC`

**Card bottom:**
- Left: "Last sync: 2 min ago" — Body Small 12px, `#484F58`
- Right: Action buttons:
  - [Monitor]: `Eye` icon — Ghost small
  - [Configure]: `Settings` icon — Ghost small
  - [Connect/Disconnect] toggle

---

### Specific Protocol Cards

**Merchant Moe** (ACTIVE, Primary)
- Logo: Merchant Moe brand icon (blue/purple)
- Volume: $5.2M | TVL: $145.2M | Allocation: 40% | Trades: 892
- Monitoring: ACTIVE ✓
- Badge: "Primary Execution" — `#0066FF` Label Caps

**Agni Finance** (ACTIVE)
- Logo: Agni Finance icon
- Volume: $3.8M | TVL: $89.4M | Allocation: 35%
- Monitoring: ACTIVE ✓

**Fluxion** (ACTIVE)
- Logo: Fluxion icon
- Volume: $2.1M | TVL: $45.8M | Allocation: 25%

**Uniswap** (INACTIVE)
- Logo: Uniswap unicorn icon (dimmed, 60% opacity)
- Status: INACTIVE
- Reason tooltip on hover: "Paused — low Mantle Network liquidity below threshold"
- Button: [Enable] instead of [Configure]

**Aave** (INACTIVE)
- Same treatment

**Yearn Finance** (MONITORING)
- Logo: Yearn icon
- Status: MONITORING (yellow badge)
- Note: "Monitoring only — execution not enabled"

Other protocols shown in grid: Balancer, MakerDAO, Curve, Compound, GMX, etc.

---

## "ADD NEW PROTOCOL" FLOW

Triggered by "+ Add New Protocol" button.

**Modal — Browse Protocol Marketplace:**

```
┌──────────────────────────────────────────────────────────────┐
│  Add New Protocol                                            │
│                                                              │
│  [ 🔍 Search protocols...                        ]          │
│                                                              │
│  Mantle Native                                               │
│  [Merchant Moe]  [Agni Finance]  [Fluxion]  [...]           │
│                                                              │
│  Other DeFi Protocols                                        │
│  [Uniswap] [Aave] [Compound] [Balancer] [Curve] [...]       │
│                                                              │
│  CEX Data Sources (Read-only)                                │
│  [Bybit] [Binance] [OKX]                                     │
│                                                              │
│  Note: CEX data sources are read-only signal feeds.         │
│  All execution happens on Mantle Network protocols.         │
└──────────────────────────────────────────────────────────────┘
```

Clicking a protocol → shows detail panel:
- Protocol description
- Current TVL on Mantle
- Required permissions
- [Connect Protocol] button

---

## PROTOCOL DETAIL (expandable panel or separate page)

When clicking [Configure] on an active protocol:

**Tabs:** Overview | Execution Settings | History | Logs

**Overview tab:**
- Protocol info (description, website ↗, contract address)
- Contract address: JetBrains Mono 13px, `#F0F6FC`, with copy icon and Explorer link
- Current status, last sync time
- Cumulative volume routed through this protocol

**Execution Settings tab:**
- Max allocation slider (synced with Risk Engine)
- Min/Max trade size for this protocol specifically
- Price slippage tolerance
- Gas limit setting

---

## SUMMARY FOOTER

Pinned to bottom of main content area (above pagination if any):

```
Monitoring 12 active protocols  ·  $24.5M total volume routed  ·  Last sync: 2 minutes ago  ·  [Sync All]
```

Inter Regular 12px, `#8B949E`
"[Sync All]": Ghost button, small, `#58A6FF` text
