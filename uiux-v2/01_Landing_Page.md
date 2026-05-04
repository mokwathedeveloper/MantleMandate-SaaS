# Screen 01 — Landing Page (Homepage)
## MantleMandate Marketing Site

---

## PURPOSE
First impression for all visitors. Must communicate the product value in under 5 seconds, drive sign-ups, and build trust with both crypto-native and institutional users.

---

## WHAT CHANGED FROM V1
- Hero headline: "Welcome to MantleMandate-SaaS" → "Your AI. Your Rules. On-Chain."
- Navigation labels updated (Product→Platform, Solutions→How It Works, Resources→Docs, About Us→Team)
- CTAs updated ("Sign Up"→"Start Free →", "Log In"→"Sign In")
- Feature card descriptions rewritten (specific, not generic)
- Trust badges rewritten (specific, not generic)
- Security section headline: "Enterprise-Grade Security You Can Trust" → "Your Funds Stay Yours"
- Pricing section headline: "Simple, Transparent Pricing" → "One Platform. Three Scales."
- Pricing plan names: Basic/Pro/Enterprise → Operator/Strategist/Institution

---

## LAYOUT

Single-page marketing site. Sections from top to bottom:
1. Navigation Bar
2. Hero Section
3. Trust Bar
4. Feature Section (4 features)
5. How It Works (3 steps)
6. Multi-Protocol Section
7. Pricing Section
8. Security Section
9. About / Team Section
10. CTA Banner
11. Footer

Page background: `#0D1117`
Max content width: 1280px, centered

---

## SECTION 1: NAVIGATION BAR

**Height:** 64px
**Background:** `#0D1117` with 1px bottom border `#21262D`
**Position:** Sticky (stays at top on scroll), adds blur backdrop on scroll

**Left side:**
- MantleMandate logo wordmark
- Font: Inter Bold 18px, `#F0F6FC`
- Monogram "MM" in a 32x32px `#0066FF` rounded square (border-radius 6px), white text

**Center navigation links:**
```
Platform    How It Works    Docs    Pricing    Team
```
- Font: Inter Medium 14px, `#8B949E`
- Hover: `#F0F6FC`
- Active/current: `#F0F6FC` with `#0066FF` underline dot

**Right side:**
```
[ Sign In ]    [ Start Free → ]
```
- "Sign In": Ghost button (no fill, border `#21262D`, text `#F0F6FC`)
- "Start Free →": Primary button (`#0066FF` fill, white text)
- Both: 36px height, Inter SemiBold 14px

**Mobile (375px-768px):**
- Hamburger menu icon (right side)
- Logo only (no text links)
- Full-screen drawer on open

---

## SECTION 2: HERO SECTION

**Height:** 100vh minimum, padding top 80px bottom 80px
**Layout:** Two columns — left (text) 55%, right (illustration) 45%
**Vertical alignment:** Center both columns

**Left column — Text:**

Pre-headline label:
```
⬡ Built on Mantle Network
```
- Font: Label Caps, `#0066FF`
- Background: `#0066FF` at 10% opacity, 4px 8px padding, border-radius 4px
- Icon: Mantle Network hexagon logo (16px)

Main headline (H1 / Display):
```
Your AI.
Your Rules.
On-Chain.
```
- Font: Inter Black 64px, `#F0F6FC`, line-height 1.1
- "On-Chain." — text color gradient: left `#0066FF`, right `#00C2FF` (CSS gradient on text)
- Line break after each phrase for rhythm

Sub-headline:
```
Write your trading strategy in plain English.
MantleMandate deploys an AI agent to execute it —
transparent, verifiable, and unstoppable on Mantle Network.
```
- Font: Inter Regular 18px, `#8B949E`, line-height 1.6
- Max-width: 480px

CTA row (horizontal, gap 12px):
```
[ Start Free — No Wallet Required ]    [ ▷ Watch 2-Min Demo ]
```
- Primary: `#0066FF` fill, white text, Inter SemiBold 16px, height 52px, padding 0 28px
- Secondary: `#161B22` fill, border `#21262D`, `#F0F6FC` text, same size

Social proof line (below CTAs):
```
★★★★★  Trusted by traders on Mantle Network
```
- Font: Inter Regular 13px, `#8B949E`

**Right column — Illustration:**

Isometric flat illustration (3-panel flow, left to right):
1. Panel: Text document with mandate text visible
2. Arrow →
3. Panel: AI brain/neural icon in a circle
4. Arrow →
5. Panel: Chain link / blockchain block

Colors: Match brand blues (`#0066FF`, `#00C2FF`) with `#22C55E` for the execution step
Background: Subtle dark circular gradient behind illustration, `#0066FF` at 5% opacity

---

## SECTION 3: TRUST BAR

**Height:** 72px
**Background:** `#161B22`
**Border:** 1px top and bottom `#21262D`
**Layout:** 3 items, equally spaced, horizontal dividers between

```
🔒 SOC2-ready, multisig-protected    |    ⚡ Live P&L, updated every block    |    🔗 Every trade hashed on Mantle
```

- Icon: 18px, `#0066FF`
- Text: Inter Medium 13px, `#8B949E`

---

## SECTION 4: FEATURE SECTION

**Heading:**
```
Everything you need to trade with confidence
```
- H2, centered, `#F0F6FC`

**Sub-heading:**
```
MantleMandate combines AI intelligence with on-chain verifiability —
so you stay in control without staying at the screen.
```
- Body Large, centered, `#8B949E`, max-width 600px

**Layout:** 2x2 grid of feature cards (desktop), 1 column (mobile)
**Card size:** Equal height, gap 24px

### Feature Card 1 — AI-Driven Trading
- Icon: `Bot` (Lucide), 32px, `#0066FF`
- Title: "Write It. Deploy It. Done."
- Body: "Write your mandate in plain English. The AI agent reads it, interprets it, and executes — no coding, no configuration, no PhD required."
- Link: "See how it works →" (`#58A6FF`)

### Feature Card 2 — Risk Management
- Icon: `Gauge` (Lucide), 32px, `#0066FF`
- Title: "Rules the AI Cannot Break"
- Body: "Set hard caps: max drawdown, stop-loss, position limits. Your mandate is law. The AI executes within your boundaries — always."
- Link: "View risk controls →" (`#58A6FF`)

### Feature Card 3 — Transparent Reporting
- Icon: `Shield` (Lucide), 32px, `#0066FF`
- Title: "Every Decision On-Chain"
- Body: "Every trade decision is hashed on Mantle Network. Share a public audit link with anyone. No trust required — verify it yourself."
- Link: "Explore the audit viewer →" (`#58A6FF`)

### Feature Card 4 — Multi-Protocol
- Icon: `Network` (Lucide), 32px, `#0066FF`
- Title: "Best Price, Automatically"
- Body: "Executes across Merchant Moe, Agni Finance, and Fluxion — routes to best price automatically. You never need to choose."
- Link: "See all protocols →" (`#58A6FF`)

---

## SECTION 5: HOW IT WORKS

**Background:** `#161B22`
**Heading:** "Up and Running in 3 Steps" (H2, centered)

**Layout:** 3 steps, horizontal (desktop), vertical (mobile)
**Connector:** Dashed arrow between steps

### Step 1
- Step number: Large "01" in `#0066FF` at 10% opacity (background decoration)
- Icon: `FileText`, 40px, `#0066FF`
- Title: "Write Your Mandate"
- Body: "Describe your trading strategy in plain English. No syntax. No special formatting. Just tell the AI what you want it to do."
- Example chip: *"Buy ETH when RSI < 30. Never exceed 5% per trade."*

### Step 2
- Icon: `Bot`, 40px, `#0066FF`
- Title: "Deploy Your Agent"
- Body: "MantleMandate compiles your mandate into an enforceable policy, generates an on-chain hash, and deploys your AI agent."

### Step 3
- Icon: `TrendingUp`, 40px, `#22C55E`
- Title: "Watch It Execute"
- Body: "Your agent trades autonomously within your rules. Every action is recorded on Mantle Network — visible to you (and anyone you share it with)."

---

## SECTION 6: MULTI-PROTOCOL BANNER

**Heading:** "Executes Across the Mantle Ecosystem"
**Sub-text:** "MantleMandate routes trades to the best available liquidity — automatically."

**Layout:** Horizontal scrolling row of protocol logos/names

Protocols displayed (with logo icons):
```
Merchant Moe    Agni Finance    Fluxion    + more protocols
```

Each item:
- Protocol logo (40x40px)
- Protocol name: Inter Medium 14px, `#8B949E`
- Gap: 48px between items

---

## SECTION 7: PRICING SECTION

**See:** `14_Pricing_Page.md` for full spec

**Section heading:** "One Platform. Three Scales." (H2, centered)
**Sub-heading:** "Start free for 14 days. No credit card. No wallet required." (`#8B949E`)

Plans displayed horizontally:
- Operator ($29/month) — most compact
- Strategist ($99/month) — highlighted with `#0066FF` border, "Most Popular" badge
- Institution ($299/month)

**Annual toggle:** Monthly / Annual (save 20%) toggle switch above plans

---

## SECTION 8: SECURITY SECTION

**See:** `15_Security_Page.md` for full spec

**Section heading:** "Your Funds Stay Yours" (H2)
**Sub-heading:** "MantleMandate never holds custody. Your wallets, your keys, your rules — we only execute what you authorize."

---

## SECTION 9: ABOUT / TEAM SECTION

**See:** `16_About_Us.md` for full spec

**Headline:** "Built by Traders. Built for the Future." (H2)

---

## SECTION 10: BOTTOM CTA BANNER

**Background:** `#0066FF`
**Height:** 200px

**Heading:**
```
Ready to automate your strategy?
```
- H2, white, centered

**Sub-text:**
```
Start your 14-day free trial. No wallet required. Cancel any time.
```
- Body Large, white at 80% opacity

**CTA Button:**
```
[ Start Free — No Wallet Required ]
```
- Background: `#FFFFFF`, text: `#0066FF`, Inter Bold 16px
- Height: 52px, border-radius 8px

---

## SECTION 11: FOOTER

**Background:** `#0D1117`
**Top border:** 1px solid `#21262D`

**Layout:** 4 columns

| Column 1 | Column 2 | Column 3 | Column 4 |
|----------|----------|----------|----------|
| MantleMandate logo + tagline | Platform (links) | Resources (links) | Company (links) |
| "Your AI. Your Rules. On-Chain." | Dashboard | Docs | Team |
| Built on Mantle Network | Mandate Editor | API Reference | Blog |
| | Agent Monitoring | Status | Careers |
| | Audit Viewer | Changelog | Contact |

**Bottom bar:** Copyright + Privacy Policy + Terms of Service + "Built on Mantle Network" badge

---

## RESPONSIVE BEHAVIOR

**Mobile (375px):**
- Hero: Single column, illustration hidden, headline 40px
- Features: 1 column stack
- Pricing: Horizontal scroll between cards (snap scroll)
- Footer: 2 columns, then 1 column for links
