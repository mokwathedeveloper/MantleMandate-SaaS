# Design System — MantleMandate
## The foundation for every screen

---

## 1. BRAND IDENTITY

**Product Name:** MantleMandate
**Tagline:** "Your AI. Your Rules. On-Chain."
**Monogram:** MM
**Tone of voice:** Direct, technical, trustworthy. No hype. No fluff.

---

## 2. COLOR TOKENS

### Core Palette

| Token Name | Hex Value | RGB | Usage |
|------------|-----------|-----|-------|
| `primary` | `#0066FF` | 0, 102, 255 | Primary buttons, active links, focus rings |
| `primary-hover` | `#0052CC` | 0, 82, 204 | Button hover state |
| `accent` | `#00C2FF` | 0, 194, 255 | Highlights, sparklines, glow effects |
| `success` | `#22C55E` | 34, 197, 94 | Positive P&L, success badges, trade executed |
| `success-bg` | `#0D2818` | 13, 40, 24 | Success alert background |
| `error` | `#EF4444` | 239, 68, 68 | Errors, Danger Zone, declined trades |
| `error-bg` | `#2D0F0F` | 45, 15, 15 | Error alert background |
| `warning` | `#F5C542` | 245, 197, 66 | Warnings, paused agents, low gas |
| `warning-bg` | `#2A2000` | 42, 32, 0 | Warning alert background |
| `orange` | `#F97316` | 249, 115, 22 | Paused status only — NOT for errors |

### Background Palette

| Token Name | Hex Value | Usage |
|------------|-----------|-------|
| `bg-page` | `#0D1117` | Main app background, sidebar |
| `bg-card` | `#161B22` | Cards, panels, modals |
| `bg-card-hover` | `#1C2128` | Card hover state |
| `bg-input` | `#0D1117` | Form input background |
| `bg-input-focus` | `#161B22` | Focused input background |
| `border` | `#21262D` | Card borders, table dividers |
| `border-focus` | `#0066FF` | Input focus border |

### Text Palette

| Token Name | Hex Value | Usage |
|------------|-----------|-------|
| `text-primary` | `#F0F6FC` | Main body text, headings |
| `text-secondary` | `#8B949E` | Labels, captions, descriptions |
| `text-disabled` | `#484F58` | Disabled states, placeholder text |
| `text-inverse` | `#0D1117` | Text on light/colored backgrounds |
| `text-link` | `#58A6FF` | Inline links |
| `text-link-hover` | `#79B8FF` | Link hover state |

### Semantic Usage Rules

- Red (`#EF4444`) = Errors, danger actions, failed trades, negative P&L ONLY
- Green (`#22C55E`) = Success, positive values, active status ONLY
- Yellow (`#F5C542`) = Warnings, paused state ONLY
- Orange (`#F97316`) = Paused agent status ONLY — do not use for errors
- Never use red and orange together — only one "caution" color per screen context

---

## 3. TYPOGRAPHY

### Font Families

- **Primary:** Inter (all UI text — headings, body, labels, buttons)
  - Google Fonts: `Inter`, weights 400/500/600/700/900
- **Monospace:** JetBrains Mono (blockchain data ONLY)
  - Google Fonts: `JetBrains Mono`, weights 400/500

### Type Scale

| Role | Font | Weight | Size | Line Height | Letter Spacing |
|------|------|--------|------|-------------|----------------|
| Display | Inter | 900 (Black) | 64px | 72px | -2px |
| H1 | Inter | 700 (Bold) | 40px | 48px | -1px |
| H2 | Inter | 600 (SemiBold) | 28px | 36px | -0.5px |
| H3 | Inter | 600 (SemiBold) | 20px | 28px | 0 |
| H4 | Inter | 600 (SemiBold) | 16px | 24px | 0 |
| Body Large | Inter | 400 (Regular) | 16px | 24px | 0 |
| Body | Inter | 400 (Regular) | 14px | 20px | 0 |
| Body Small | Inter | 400 (Regular) | 12px | 16px | 0 |
| Label | Inter | 500 (Medium) | 12px | 16px | +0.5px |
| Label Caps | Inter | 600 (SemiBold) | 11px | 16px | +1px (UPPERCASE) |
| Code / Hash | JetBrains Mono | 400 | 13px | 20px | 0 |
| Code Small | JetBrains Mono | 400 | 11px | 16px | 0 |

### Typography Rules

1. Monospace (JetBrains Mono) is used ONLY for: wallet addresses, TX hashes, block numbers, policy hashes, API keys, JSON output
2. Navigation, headings, buttons, labels, body copy = Inter always
3. Never use ALL CAPS for body text or descriptions — only for Label Caps (navigation items, status badges)
4. Never use more than 3 font sizes on a single card

---

## 4. SPACING SYSTEM

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon gap, tight inline spacing |
| `space-2` | 8px | Input label to input, badge padding |
| `space-3` | 12px | Compact row padding |
| `space-4` | 16px | Standard gap between cards, section padding |
| `space-5` | 20px | Card internal padding (compact) |
| `space-6` | 24px | Card internal padding (standard) |
| `space-8` | 32px | Section gap (within page) |
| `space-10` | 40px | Section gap (between major sections) |
| `space-12` | 48px | Hero section vertical padding |
| `space-16` | 64px | Landing page section spacing |

### Layout Grid

- **App (interior):** 12-column grid, 16px gutters, max-width 1440px
- **Landing page:** 12-column grid, 24px gutters, max-width 1280px
- **Sidebar width:** 240px (desktop), 64px (collapsed), 0 (mobile drawer)
- **Top navigation height:** 64px
- **Page content padding:** 24px left/right, 32px top

### Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | 375px | Single column, stacked, sidebar = drawer |
| Tablet | 768px | 2-column, sidebar = icon-only (64px) |
| Desktop | 1280px | Full sidebar (240px), multi-column |
| Wide | 1440px | Max-width content, expanded sidebar |

---

## 5. COMPONENT LIBRARY

### Buttons

**Primary Button**
- Background: `#0066FF`
- Text: `#FFFFFF`, Inter SemiBold 14px
- Height: 40px, padding: 0 20px
- Border radius: 6px
- Hover: `#0052CC` background
- Focus: 2px `#0066FF` ring, 2px offset
- Disabled: `#21262D` background, `#484F58` text

**Secondary Button (Ghost)**
- Background: transparent
- Border: 1px solid `#21262D`
- Text: `#F0F6FC`, Inter SemiBold 14px
- Hover: `#161B22` background, border `#8B949E`

**Danger Button**
- Background: `#EF4444`
- Text: `#FFFFFF`, Inter SemiBold 14px
- Hover: `#DC2626`

**Icon Button**
- Size: 32x32px, border radius 6px
- Background: transparent
- Hover: `#161B22` background
- Icon size: 16px

**CTA Large (Landing)**
- Height: 52px, padding: 0 32px
- Font size: 16px, SemiBold
- Border radius: 8px

### Form Inputs

**Text Input**
- Height: 40px
- Background: `#0D1117`
- Border: 1px solid `#21262D`
- Border radius: 6px
- Text: `#F0F6FC`, Inter Regular 14px
- Placeholder: `#484F58`
- Padding: 0 12px
- Focus: border `#0066FF`, no box shadow
- Error state: border `#EF4444`

**Textarea (for mandate input)**
- Min-height: 160px (standard), 280px (featured/hero variant)
- Same styling as text input
- Resize: vertical only
- Placeholder: italicised, `#484F58`

**Select / Dropdown**
- Same dimensions as text input
- Chevron icon right-aligned, `#8B949E`

**Toggle Switch**
- Width: 44px, height: 24px
- Off: `#21262D` track, `#8B949E` thumb
- On: `#0066FF` track, `#FFFFFF` thumb
- Transition: 150ms ease

### Cards

**Standard Card**
- Background: `#161B22`
- Border: 1px solid `#21262D`
- Border radius: 8px
- Padding: 24px
- No box shadow (flat, neo-brutalist approach)

**KPI Metric Card**
- Background: `#161B22`
- Border: 1px solid `#21262D`
- Border radius: 8px
- Padding: 20px 24px
- Label: Label Caps style, `#8B949E`
- Value: H2 or H3, `#F0F6FC`
- Delta: Body Small, green or red

**Agent Card**
- Same as Standard Card
- Contains: agent name (H4), status badge, metrics row, sparkline chart
- Hover: `bg-card-hover` background, border `#30363D`

### Status Badges

**Active**
- Background: `#0D2818`, text: `#22C55E`, font: Label Caps
- Dot: 6px circle, `#22C55E`, with pulse animation

**Paused**
- Background: `#2A2000`, text: `#F5C542`, font: Label Caps

**Failed / Error**
- Background: `#2D0F0F`, text: `#EF4444`, font: Label Caps

**Inactive**
- Background: `#161B22`, text: `#8B949E`, border: 1px solid `#21262D`

### Alert Banners

**Success Banner**
- Full-width, height: 48px
- Background: `#0D2818`
- Left border: 4px solid `#22C55E`
- Icon: CheckCircle, `#22C55E`, 18px
- Text: Inter Medium 14px, `#22C55E`
- Right side: inline action buttons (ghost, small)
- Dismiss: X icon right-aligned

**Error Banner**
- Same structure, colors: `#2D0F0F` bg, `#EF4444` border and text

**Warning Banner**
- Same structure, colors: `#2A2000` bg, `#F5C542` border and text

### Navigation (App Sidebar)

- Width: 240px
- Background: `#0D1117`
- Right border: 1px solid `#21262D`
- Logo area: 64px height, logo + wordmark
- Nav items: 40px height, 12px horizontal padding
- Active item: `#161B22` background, `#0066FF` left border (3px), `#F0F6FC` text
- Inactive item: `#8B949E` text, hover: `#161B22` background
- Section labels: Label Caps, `#484F58`, 32px top padding
- Bottom section: User avatar, plan badge, log out

### Tables

- Header row: `#0D1117` background, Label Caps, `#8B949E`
- Header border: 1px solid `#21262D` bottom
- Data rows: `#161B22` even rows, `#0D1117` odd rows (OR: all same with border separator)
- Row height: 52px
- Row hover: `#1C2128` background
- Cell text: Body 14px, `#F0F6FC`
- Cell secondary: Body 14px, `#8B949E`
- Hash/address cells: JetBrains Mono 13px

---

## 6. ICONOGRAPHY

**Library:** Lucide Icons (https://lucide.dev)
**Style:** Outlined (2px stroke weight)
**Default size:** 16px (inline), 20px (nav), 24px (feature icons)
**Color:** Inherits from parent text color unless status-colored

**Status indicator icons:**
- Active/Success: `CheckCircle` — `#22C55E`
- Error/Failed: `XCircle` — `#EF4444`
- Warning: `AlertTriangle` — `#F5C542`
- Info: `Info` — `#58A6FF`
- Paused: `PauseCircle` — `#F5C542`

**Key product icons:**
- Mandates: `FileText`
- AI Agents: `Bot`
- On-Chain Audit: `Shield`
- Reports: `BarChart2`
- Risk Engine: `Gauge`
- Multi-Protocol: `Network`
- API Integration: `Code2`
- Real-Time Alerts: `Bell`
- Settings: `Settings`
- Dashboard: `LayoutDashboard`
- Wallet: `Wallet`
- Trade/Execute: `Zap`
- Portfolio: `TrendingUp`

---

## 7. ILLUSTRATION STYLE

**Landing page illustrations:**
- Style: Flat isometric, 2.5D
- Color palette: Matches brand colors (blues, with accent cyan)
- Lines: 2px stroke, dark outlines
- No gradients — flat fills only
- Subject matter must be product-specific (not generic tech/cloud imagery)

**Recommended illustration subjects:**
1. Hero: plain text → AI brain → chain link → trade executed (left to right flow)
2. Security: wallet with lock + shield, non-custodial concept
3. Onboarding: person writing → robot → rocket launch

**NOT acceptable:**
- Generic 3D rotating cubes
- Stock "data visualization" blobs
- Floating laptop/phone mockups
- Vague "AI neural network" imagery

---

## 8. MOTION & ANIMATION

Keep minimal — this is a financial tool, not a marketing site.

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transitions | Fade in | 200ms | ease-out |
| Card hover | Background color change | 150ms | ease |
| Button hover | Background color change | 100ms | ease |
| Alert banner enter | Slide down from top | 300ms | ease-out |
| Alert banner exit | Slide up + fade | 200ms | ease-in |
| Active status dot | Pulse scale (1→1.3→1) | 2000ms | ease-in-out, infinite |
| Sparkline on card | Draw line on load | 600ms | ease-out |
| Number counters | Count up on first view | 800ms | ease-out |

No parallax, no 3D transforms, no heavy scroll animations. Performance matters.

---

## 9. ACCESSIBILITY RULES

- All text must meet WCAG 2.1 AA contrast ratio (4.5:1 for body text, 3:1 for large text)
- All interactive elements must have visible focus indicators
- Color must never be the ONLY way to convey state — always pair with text/icon
- All form inputs must have visible labels (no placeholder-only labels)
- Error messages must include the reason and how to fix it
- Minimum touch target size: 44x44px (mobile)
