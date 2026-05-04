# Screen 20 — Support Page
## MantleMandate

---

## PURPOSE
Help users resolve issues quickly and feel supported. The personalized greeting from v1 is strong — keep it. Add system status and improve FAQ topics.

---

## WHAT CHANGED FROM V1
- Brand: "MANTLEMANDATE-SAAS" → "MantleMandate" in sidebar
- Added "System Status" indicator prominently
- FAQ topics made product-specific (not generic)
- Added "Submit a ticket" form (in addition to the ticket list)

---

## LAYOUT

Standard app layout (sidebar + main content)

**Main content:** Two columns (70% / 30%)

---

## PAGE HEADER

**Personalized greeting (KEEP from v1 — this is excellent):**

```
Hi John, how can we help?
```
H2, Inter Bold 32px, `#F0F6FC`

**Sub-text:**
```
Search our docs, browse FAQs, or reach our team directly.
```
Body 14px, `#8B949E`

**Search bar (below heading):**
```
[🔍 Search for help...                              ]
```
- Height: 48px, full width of content area
- Background: `#0D1117`, border: 2px `#21262D`, border-radius 8px
- Placeholder: Inter Regular 15px, `#484F58`
- Focus: border `#0066FF`
- On type: auto-suggest results from FAQ and docs

---

## SYSTEM STATUS BANNER (NEW)

Below search bar, full width:

**When all systems operational:**
```
● All systems operational    Last checked: 2 min ago    [Status Page ↗]
```
- Background: `#0D2818`, border: 1px `#22C55E` at 40%, border-radius 6px, padding 10px 16px
- Dot: `#22C55E`, 8px
- Text: Inter Regular 13px, `#22C55E`
- "Status Page ↗": External link, `#58A6FF`

**When incident active:**
```
⚠ Partial outage — Agni Finance integration degraded    [View Incident →]
```
- Background: `#2A2000`, border: `#F5C542`
- Text: `#F5C542`

---

## CONTACT METHODS (4 cards, 2x2 grid)

### Card 1: Email Support
- Icon: `Mail` (Lucide, 32px, `#0066FF`)
- Title: "Email Support"
- Body: "Response within 4 hours for Strategist & Institution plans."
- CTA: "Send Email →" — text link, `#58A6FF`

### Card 2: Live Chat
- Icon: `MessageCircle` (Lucide, 32px, `#0066FF`)
- Title: "Live Chat"
- Body: "Available Monday–Friday, 9am–6pm UTC. Instant responses."
- CTA: "Start Chat →" — Primary button, small
- Status badge: "● Online" or "○ Offline" — 8px dot, Label Caps 10px

### Card 3: Documentation
- Icon: `BookOpen` (Lucide, 32px, `#0066FF`)
- Title: "Documentation"
- Body: "Full guides, API reference, and mandate writing tutorials."
- CTA: "Browse Docs ↗" — text link

### Card 4: Community
- Icon: `Users` (Lucide, 32px, `#0066FF`)
- Title: "Community Forum"
- Body: "Connect with other MantleMandate users. Share strategies."
- CTA: "Join Forum ↗" — text link

All 4 cards: Standard card style, equal height

---

## MAIN CONTENT — LEFT COLUMN (70%)

### Your Support Tickets

**Heading:** "Your Support Tickets" — H4, `#F0F6FC`
**Right:** "Submit New Ticket" — Ghost button

**Ticket table:**

| Column | Content |
|--------|---------|
| ID | #MM-1234 — JetBrains Mono 12px |
| Subject | "Agent paused unexpectedly" — text link |
| Status | OPEN / CLOSED / PENDING badge |
| Priority | HIGH / MEDIUM / LOW |
| Updated | "2 hours ago" |

Max rows: 5, then "View all tickets →"

**OPEN badge:** `#F5C542` text, `#2A2000` bg
**CLOSED badge:** `#22C55E` text, `#0D2818` bg
**PENDING badge:** `#58A6FF` text, `#0D1526` bg

**Submit New Ticket form** (expandable, shown when "Submit New Ticket" clicked):

```
Subject:   [                              ]
Category:  [ Select category... ▾ ]
           Options: Agent Issue / Mandate Issue / Billing / API / General
Priority:  ○ Low  ● Medium  ○ High
Message:   [                              ]
           [                              ]
           (textarea, 160px min height)

Attachment: [📎 Attach file] (optional)

[ Submit Ticket ]    [ Cancel ]
```

---

### Popular Topics (product-specific — not generic)

**Heading:** "Popular Topics" — H4, `#F0F6FC`

**Article list (clickable):**

1. "How do I deploy my first AI agent?" → Beginner guide
2. "What is a policy hash and why does it matter?" → Explains on-chain hashing
3. "How does the plain-English mandate parser work?" → Core feature explanation
4. "My agent paused unexpectedly — what do I do?" → Troubleshooting
5. "How to read the on-chain audit trail?" → Feature guide
6. "Setting risk limits: drawdown, stop-loss, position sizing" → Risk management
7. "How to connect multiple wallets to one account?" → Wallet management
8. "Exporting reports for tax purposes" → CSV/PDF export

Each item: Inter Regular 14px, `#58A6FF`, hover underline, arrow icon right side

---

## RIGHT COLUMN (30%)

### Quick Links

**Heading:** "Resources" — H4, `#F0F6FC`

Links (vertical list):
- API Documentation ↗
- Smart Contract Source ↗ (GitHub)
- Changelog
- Status Page ↗
- Privacy Policy
- Terms of Service

---

### Support Hours

**Heading:** "Contact Hours" — H4, `#F0F6FC`

```
📧 Email Support
Mon–Fri, 9am–6pm UTC
Response within 4 hours (Strategist/Institution)
Response within 24 hours (Operator)

💬 Live Chat
Mon–Fri, 9am–6pm UTC
Currently: ● Online

⏱ Emergency Support
Institution plan only — 24/7 SLA
```

All text: Body 13px, `#8B949E`
"Currently: ● Online" — `#22C55E`

---

### Plan Badge

Shows user's current plan and relevant support tier:

```
┌──────────────────────┐
│  STRATEGIST PLAN     │
│  Priority Support    │
│  4-hour response     │
│  [Upgrade for 24/7 →]│
└──────────────────────┘
```

"Upgrade for 24/7 →": Text link, `#58A6FF` — only shown for non-Institution plans
