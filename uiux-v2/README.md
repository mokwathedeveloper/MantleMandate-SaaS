# MantleMandate — UX/UI Design Specifications v2
## Turing Test Hackathon 2026

---

## What This Folder Is

This folder contains **professional design specifications** for every screen in MantleMandate.
Each file describes a screen in enough detail to be built in Figma, Framer, or directly in code.

The original mockups are in `/uiux` — keep those for reference.
This folder (`/uiux-v2`) is the **authoritative design source** going forward.

---

## Folder Structure

| File | Screen | Status |
|------|--------|--------|
| `00_Design_System.md` | Colors, typography, spacing, components | FOUNDATION — read first |
| `01_Landing_Page.md` | Homepage / marketing site | REDESIGNED |
| `02_Login_Page.md` | Sign in screen | IMPROVED |
| `03_SignUp_Page.md` | Registration screen | IMPROVED |
| `04_Onboarding_Flow.md` | Post-signup 4-step wizard | NEW — did not exist |
| `05_Dashboard.md` | Main app dashboard | IMPROVED |
| `06_Mandate_Editor.md` | Plain-English mandate creator | REDESIGNED |
| `07_Agent_Monitoring.md` | AI agent deployment & monitoring | IMPROVED |
| `08_OnChain_Audit_Viewer.md` | Blockchain audit trail | MINOR IMPROVEMENTS |
| `09_Real_Time_Alerts.md` | Live alert system | IMPROVED |
| `10_Reports_Exporting.md` | Reports & CSV export | IMPROVED |
| `11_Risk_Engine.md` | Risk engine & venue planner | IMPROVED |
| `12_Multi_Protocol.md` | DeFi protocol integrations | IMPROVED |
| `13_API_Integration.md` | API & data ingestion dashboard | MINOR IMPROVEMENTS |
| `14_Pricing_Page.md` | Pricing tiers (landing section) | REDESIGNED |
| `15_Security_Page.md` | Security section (landing) | REDESIGNED COPY |
| `16_About_Us.md` | Team & mission (landing section) | COPY UPDATED |
| `17_Payment_Methods.md` | Billing & payment settings | IMPROVED + CRYPTO |
| `18_User_Profile.md` | User profile page | IMPROVED |
| `19_Settings_Page.md` | Account settings | IMPROVED |
| `20_Support_Page.md` | Help & support | IMPROVED |

---

## Brand Rules (Apply to Every Screen)

- **Product name:** `MantleMandate` — no hyphen, no "-SaaS" suffix
- **App interior brand:** `MantleMandate` — replaces "AlphaCap" everywhere
- **Logo monogram:** `MM`
- **Never use the product name as a page headline** — headlines are value propositions
- **Monospace font only for:** wallet addresses, TX hashes, block numbers, policy hashes
- **Everything else:** Inter (sans-serif)

---

## Quick Color Reference

| Token | Hex | Use |
|-------|-----|-----|
| Primary Blue | `#0066FF` | Buttons, links, active nav |
| Accent Blue | `#00C2FF` | Highlights, hover glows |
| Success Green | `#22C55E` | Positive P&L, success alerts |
| Error Red | `#EF4444` | Errors, danger actions |
| Warning Yellow | `#F5C542` | Warnings, paused state |
| Page Background | `#0D1117` | Main dark background |
| Card Background | `#161B22` | Cards, panels |
| Sidebar Background | `#0D1117` | Left navigation |
| Border | `#21262D` | Card borders, dividers |
| Text Primary | `#F0F6FC` | Main text |
| Text Secondary | `#8B949E` | Labels, captions |
| Text Disabled | `#484F58` | Disabled/inactive |
