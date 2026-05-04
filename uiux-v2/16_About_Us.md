# Screen 16 — About / Team Section (Landing Page)
## MantleMandate

---

## PURPOSE
Build human connection and credibility. For a hackathon context, authenticity matters more than polished vanity metrics.

---

## WHAT CHANGED FROM V1
- Stats "25,000+ Users" and "$2.4B+ Volume" removed — these are fabricated for a hackathon project and will hurt credibility with judges
- Replaced with honest proof-of-work indicators
- Team section kept — team photos and real names build trust
- Milestone timeline updated with realistic hackathon timeline

---

## SECTION HEADING

```
Built by Traders.
Built for the Future.
```
H2, Inter Bold 40px, `#F0F6FC`, centered
(This headline is strong — keep it from v1)

Sub-heading:
```
MantleMandate was founded to solve a real problem:
institutional-grade AI trading shouldn't require an institutional-sized team.
```
Body Large 16px, `#8B949E`, centered, max-width 640px

---

## HONEST PROOF-OF-WORK STATS BAR

**Replace fabricated traction stats with these:**

| Stat | Value | Label |
|------|-------|-------|
| Built on | Mantle Network | "Turing Test Hackathon 2026" |
| Protocol integrations | 3 | "Merchant Moe, Agni, Fluxion" |
| On-chain | 100% | "Verifiable trades" |
| Open source | Yes | "GitHub →" |

Values: H2, `#F0F6FC`
Labels: Label Caps 11px, `#8B949E`

**IF the project gets real traction/testing data before submission**, replace with actual numbers from the demo deployment. Real data from a test run (even small) is infinitely more credible than large fake numbers.

---

## MISSION STATEMENT

**Background:** `#161B22` card, border-radius 10px, padding 40px
**Icon:** Quotation mark graphic, `#0066FF`, 40px

```
"We believe that anyone with a clear trading thesis
should be able to deploy it — without a dev team,
without a quant PhD, and without giving up their keys."
```

Attribution: "— MantleMandate Founding Team"
Font: Inter Regular 20px, `#8B949E`, italic, line-height 1.6

---

## TEAM SECTION

**Heading:** "The People Behind MantleMandate" — H3, `#F0F6FC`, centered

**Layout:** 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
**Gap:** 24px

### Team Card (each member):

```
┌─────────────────────────┐
│   [Photo / Avatar]      │
│   Name                  │
│   Role                  │
│   [LinkedIn icon]       │
└─────────────────────────┘
```

- Photo: 80px circle, border 2px `#0066FF`
- Name: H4, Inter SemiBold 16px, `#F0F6FC`
- Role: Body 14px, `#8B949E`
- LinkedIn: Lucide `Linkedin` icon 16px, `#58A6FF`, links out

If no real photos: Use initials avatar (colored backgrounds from design system)

---

## MILESTONES TIMELINE

**Heading:** "Milestones That Shaped Our Growth" — H4, `#8B949E`

**Layout:** Horizontal timeline (desktop), vertical (mobile)

Timeline items (use REALISTIC hackathon timeline):

```
Dec 2025          Feb 2026           Apr 2026           May 2026
Project Idea  →  First Prototype  →  Alpha Testing  →  Hackathon Launch
"Identified       "Built the          "Tested on          "Submitted to
the mandate       plain-English       Mantle testnet"     Turing Test
editor concept"   parser"                                 Hackathon"
```

Each milestone:
- Date: Label Caps 11px, `#0066FF`
- Title: Inter SemiBold 14px, `#F0F6FC`
- Description: Inter Regular 12px, `#8B949E`
- Timeline line: 2px `#21262D`, milestone dot: 10px circle `#0066FF`

---

## CTA STRIP (bottom of About section)

```
Join Us in Building the Future of Trading
```
H3, `#F0F6FC`, centered

```
[ Start for Free → ]    [ Read Our Docs ]
```
Primary button + Ghost button
