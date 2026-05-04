# Screen 11 — Risk Engine & Venue Planner
## MantleMandate

---

## PURPOSE
Users configure risk thresholds and control which DeFi venues agents can use. These settings act as guardrails the AI cannot override.

---

## LAYOUT

Standard app layout (sidebar + main content)
Two columns: left (risk controls 60%) + right (risk summary 40%)

---

## PAGE HEADER

"Risk Engine" — H2, `#F0F6FC`
Sub-text: "Hard limits your AI agents can never exceed. Applied to all mandates unless overridden." — Body 14px, `#8B949E`

Two CTA buttons (top right):
```
[ Load Template ▾ ]    [ Apply Changes ]
```
- Load Template: Ghost button with dropdown (Conservative / Balanced / Aggressive / Custom)
- Apply Changes: Primary button — DISABLED until changes made, then turns active

---

## LEFT COLUMN — RISK CONTROLS

### Section 1: Risk Thresholds

**Heading:** "Global Risk Thresholds" — H4, `#F0F6FC`
**Sub-text:** "These apply across all agents unless a mandate specifies tighter limits." — Body 13px, `#8B949E`

**Sliders (each with: label + description + slider + current value):**

**Max Drawdown (%)**
- Description: "If total portfolio drops by this %, all agents pause automatically."
- Slider: 0–50%, default 15%
- Value display: "15.00%" — Inter Bold 20px, right of slider, color-coded (green <10, yellow 10-20, red >20)
- Track: `#21262D`, filled: color-coded same as value

**Max Notional Per Trade ($)**
- Description: "Maximum USD value of a single trade position."
- Slider: $100 – $1,000,000, logarithmic scale, default $10,000
- Value: "$10,000"

**Max Positions Open**
- Description: "Maximum number of concurrent open positions across all agents."
- Slider: 1–50, default 10
- Value: "10"

**Stop Loss (%)**
- Description: "Auto-close a position if it falls this % below entry price."
- Slider: 0–50%, default 5%
- Value: "5.00%"

**Drawdown Limit (%)**
- Description: "Per-agent drawdown limit before that agent pauses."
- Slider: 0–30%, default 10%
- Value: "10.00%"

**Max Daily Loss ($)**
- Description: "If total realized + unrealized loss exceeds this today, all agents pause until midnight UTC."
- Input field (not slider — dollar amount is more precise): "$500"

---

### Section 2: Venue Selection & Allocation

**Heading:** "Venue Selection & Allocation" — H4, `#F0F6FC`
**Sub-text:** "Select which protocols agents may use and set allocation limits." — Body 13px, `#8B949E`

**Venue table:**

| Protocol | Status | Max Allocation | Volume | TVL | Actions |
|----------|--------|---------------|--------|-----|---------|
| Merchant Moe | ACTIVE ✓ | 40% | $24.5M | $145.2M | [Configure] |
| Agni Finance | ACTIVE ✓ | 35% | $18.2M | $89.4M | [Configure] |
| Fluxion | ACTIVE ✓ | 25% | $12.1M | $45.8M | [Configure] |

**Allocation total note:** "Total: 100% ✓" in green if balanced, red if over/under
- Sliders shown inline for each protocol's allocation %
- If total > 100%: red warning "Total allocation exceeds 100% — adjust before applying"

**Status toggle per protocol:**
- ACTIVE: Green badge with toggle to disable
- INACTIVE: Grey badge with toggle to enable

---

### Section 3: Cooldown Periods

**Heading:** "Cooldown Periods" — H4, `#F0F6FC`

```
After stop-loss triggered:    [ 4 hours ▾ ]
After drawdown limit hit:     [ 24 hours ▾ ]
After trade failure:          [ 1 hour ▾ ]
Between repeat trades (same asset): [ None ▾ ]
```

Dropdown options: None / 30 min / 1 hour / 4 hours / 12 hours / 24 hours / 1 week

---

## RIGHT COLUMN — RISK SUMMARY

**Heading:** "Risk Summary" — H4, `#F0F6FC`

**Portfolio Risk Score card:**
```
┌──────────────────────────────┐
│  PORTFOLIO RISK SCORE        │
│                              │
│        4.13%                 │
│    [Health bar: green]       │
│                              │
│  LOW RISK ✓                  │
│  "Within safe parameters"   │
└──────────────────────────────┘
```

Risk score color:
- 0–10%: `#22C55E` (Low Risk)
- 10–20%: `#F5C542` (Medium Risk)
- 20%+: `#EF4444` (High Risk)

Health bar: Full-width progress bar (same color coding)

**Individual metrics:**

| Metric | Value | Status |
|--------|-------|--------|
| Current Drawdown | -2.45% | ✓ Within limit |
| Largest Open Position | $8,450 | ✓ Within limit |
| Open Positions | 7 / 10 | ✓ Within limit |
| Venue Concentration (Merchant Moe) | 42% | ⚠ Near limit |
| Daily Loss | -$180 / $500 | ✓ Within limit |

Each row: label `#8B949E` + value `#F0F6FC` + status icon

**Quick presets:**
```
[ ✓ Conservative ]  [ Balanced ]  [ Aggressive ]
```
Conservative is active (highlighted). Clicking others updates all sliders.

---

## APPLY CHANGES CONFIRMATION

When user clicks "Apply Changes":
- Modal confirmation:
```
Apply Risk Settings?

These changes will apply to all active agents immediately.
Agents currently outside new limits will pause automatically.

Affected: 3 of 9 active agents
Settings change generates a new on-chain policy hash.

[ Apply Changes ]    [ Cancel ]
```
- `Apply Changes`: Primary button
- After apply: Success toast "Risk settings applied — on-chain hash updated"
