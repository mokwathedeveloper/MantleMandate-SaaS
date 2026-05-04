# Screen 09 — Real-Time Alerts
## MantleMandate

---

## PURPOSE
Users need immediate awareness of critical events: trades executed, agents paused, mandates breached, gas issues. Alerts must be impossible to miss and must suggest the next action.

---

## WHAT CHANGED FROM V1
- Alert banner text made specific: "INSUFFICIENT FUNDS" → includes suggested actions inline
- Alerts panel: added "Mark all read" and "Clear" controls
- Severity system formalized: HIGH (red) / MEDIUM (yellow) / LOW (blue)
- Alert items now show inline action buttons for actionable alerts

---

## LAYOUT

**The alert system has two components:**

### Component A: Alert Banner (on Dashboard and all app pages)
A persistent, dismissible banner at the top of the main content area.

### Component B: Alerts Dedicated Page
Accessible from "Alerts" in sidebar navigation. Full history and management.

---

## COMPONENT A: ALERT BANNER

Appears at the top of the main content area (above KPI cards on dashboard).
Only the MOST SEVERE current alert is shown in the banner.

**Height:** 48px
**Full width of main content area** (not full viewport — sidebar excluded)
**Z-index:** Above main content, below modal

### SUCCESS Banner
```
✓ TRADE EXECUTED: +$2,450 | ETH/USDT | via Merchant Moe — 2 min ago    [View Trade]  [×]
```
- Background: `#0D2818`
- Left border: 4px solid `#22C55E`
- Icon: `CheckCircle` 16px, `#22C55E`
- Text: Inter Medium 14px, `#22C55E`
- "View Trade": Ghost button (small, 28px height, `#22C55E` border)
- [×]: Dismiss icon, `#22C55E`
- Auto-dismiss after 8 seconds (with dismiss progress bar)

### ERROR / HIGH SEVERITY Banner
```
⚠ INSUFFICIENT GAS — Agent "ETH Conservative" paused    [Add Funds]  [Pause Agent]  [×]
```
- Background: `#2D0F0F`
- Left border: 4px solid `#EF4444`
- Icon: `AlertTriangle` 16px, `#EF4444`
- Text: Inter Medium 14px, `#EF4444`
- Two inline action buttons:
  - "Add Funds": Primary small button (red fill)
  - "Pause Agent": Ghost small button (red border)
- Does NOT auto-dismiss — user must act or manually dismiss

### WARNING Banner
```
⚡ LOW GAS WARNING — Agent "BTC Momentum" may pause soon    [Add Gas]  [×]
```
- Background: `#2A2000`
- Left border: 4px solid `#F5C542`
- Icon: `Zap` 16px, `#F5C542`

### MANDATE BREACH Banner
```
🛑 DRAWDOWN LIMIT REACHED — Agent paused at 15.2% drawdown    [Review Risk Settings]  [×]
```
- Background: `#2D0F0F`
- Left border: 4px solid `#EF4444`

---

## COMPONENT B: ALERTS PAGE

**Page heading:** "Alerts" — H2, `#F0F6FC`
**Sub-text:** "Real-time notifications from your agents and mandates."

### Filter Bar

```
[ All ]  [ Unread (3) ]  [ HIGH ]  [ MEDIUM ]  [ LOW ]      [Mark all read]  [Clear all]
```

- Tab filter on left
- Actions on right: "Mark all read" (`#58A6FF`), "Clear all" (`#8B949E`)

Plus:
```
Agent: [ All Agents ▾ ]     Type: [ All Types ▾ ]
```

---

### Alert List

**Each alert item:**

```
┌────────────────────────────────────────────────────────────────────┐
│  ● TRADE EXECUTED                                          HIGH ✓  │
│    +$2,450 | ETH/USDT via Merchant Moe                             │
│    Agent: ETH Conservative Buyer                                    │
│    2026-05-04 09:45:21                          [View Trade]        │
└────────────────────────────────────────────────────────────────────┘
```

**Specs:**
- Card: `#161B22` bg, border `#21262D`, border-radius 6px, padding 16px
- Unread: border-left 3px `#0066FF`, slightly brighter bg `#1C2128`
- Read: no left border, normal bg

**Left side:**
- Severity dot: 10px circle
  - HIGH: `#EF4444`
  - MEDIUM: `#F5C542`
  - LOW: `#58A6FF`

**Content:**
- Alert type (all caps): Inter SemiBold 13px, `#F0F6FC`
- Description: Inter Regular 13px, `#8B949E`
- Agent name: Inter Regular 12px, `#484F58`
- Timestamp: Inter Regular 11px, `#484F58`

**Right side:**
- Severity badge: HIGH/MEDIUM/LOW — Label Caps, colored
- Read/unread indicator: ✓ (read) or filled dot (unread)
- Inline action button (for actionable alerts):
  - "View Trade", "Add Funds", "Pause Agent", "Review Settings" — Ghost button, small

---

### Alert Type Taxonomy

| Type | Severity | Auto-resolve? | Action button |
|------|----------|---------------|---------------|
| TRADE EXECUTED | LOW | Yes | View Trade |
| MANDATE UPDATED | LOW | Yes | View Mandate |
| AGENT DEPLOYED | LOW | Yes | View Agent |
| LOW GAS WARNING | MEDIUM | Yes (when gas added) | Add Gas |
| DRAWDOWN WARNING (approaching limit) | MEDIUM | Yes | Review Risk |
| MANDATE BREACH | HIGH | No | Review Agent |
| DRAWDOWN LIMIT HIT (agent paused) | HIGH | No | Review Risk |
| INSUFFICIENT GAS (agent paused) | HIGH | No | Add Funds |
| TRADE FAILED | HIGH | No | View Details |
| AGENT ERROR | HIGH | No | View Agent |
| APPROVAL NEEDED | HIGH | No | Approve |

---

### Notification Settings Panel

**Below the alert list, collapsible section:**

"Notification Preferences"

```
EMAIL NOTIFICATIONS
☑ Trade executions
☑ Agent errors
☑ Drawdown alerts
☐ Daily summary

IN-APP NOTIFICATIONS
☑ All alerts (always on — cannot disable)

TELEGRAM WEBHOOK (optional)
[ Enter Telegram webhook URL ]
[ Test Connection ]
```

---

## EMPTY STATE

When no alerts:

```
Bell icon (48px, `#484F58`)

"You're all caught up"
Body 14px, `#8B949E`

"No alerts right now. Your agents are running smoothly."
```
