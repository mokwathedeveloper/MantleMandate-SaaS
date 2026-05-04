# MantleMandate — Documentation Index

> **Start here.** Read docs in the order listed for each role.

---

## For Developers — Read in This Order

### 1. Architecture & Stack
| File | What It Contains |
|------|-----------------|
| [MASTER_Architecture_and_Stack.md](MASTER_Architecture_and_Stack.md) | **Start here.** Single source of truth: full tech stack, folder structure, API endpoints, TypeScript types, DB schema, install commands |
| [Final_Architecture_for_MantleMandate_SaaS.md](Final_Architecture_for_MantleMandate_SaaS.md) | System architecture diagram, 4 layers, data flow (mandate → agent → trade), security table, CI/CD pipeline |
| [Backend_Architecture_for_MantleMandate_SaaS.md](Backend_Architecture_for_MantleMandate_SaaS.md) | Flask blueprint structure, auth endpoints with Python code, SQLAlchemy models, Celery task pattern, SocketIO emitters, pytest setup |

### 2. Implementation Guides
| File | What It Contains |
|------|-----------------|
| [Implementation_Rules_for_MantleMandate_SaaS.md](Implementation_Rules_for_MantleMandate_SaaS.md) | Strict rules: naming conventions, Flask-only backend, pytest-only testing, `flask db migrate` for schema changes, Zustand not Redux |
| [Full_Stack_Implementation_Roadmap.md](Full_Stack_Implementation_Roadmap.md) | Phased build plan (Phase 1–6): setup commands, what to build in what order, submission checklist |
| [Full_Stack_Implementation_Roadmap(2).md](Full_Stack_Implementation_Roadmap(2).md) | Complete folder/file structure — every `.py`, `.tsx`, `.ts`, `.sol` file listed with its purpose |
| [Professional_Implementation_Prompt.md](Professional_Implementation_Prompt.md) | Ready-to-use prompts for AI coding assistants: master prompt, endpoint template, page template, Celery task template |

### 3. User Flows & Features
| File | What It Contains |
|------|-----------------|
| [Complete_User_Journey_for_MantleMandate_SaaS.md](Complete_User_Journey_for_MantleMandate_SaaS.md) | Every user step from landing → signup → onboarding → mandate → agent → alerts → logout, with Flask backend logic per step |
| [MantleMandate_SaaS_Features.md](MantleMandate_SaaS_Features.md) | Quick feature list: dashboard, mandate editor, agents, audit, alerts, reports, risk engine, multi-protocol, API integration, billing |

### 4. UI/UX Specifications
| Location | What It Contains |
|----------|-----------------|
| [../uiux-v2/](../uiux-v2/) | **All 20 screen specs** — exact colors, fonts, component layouts, states, empty states |
| [../uiux-v2/00_Design_System.md](../uiux-v2/00_Design_System.md) | Design tokens: color hex codes, typography scale, spacing system, component specs, icon library |
| [Payment_Methods_Section.md](Payment_Methods_Section.md) | Payment page: crypto tab (USDC/USDT/MNT), card tab, billing history, plan names (Operator/Strategist/Institution) |
| [UX_UI_Professional_Audit_and_Improvements.md](UX_UI_Professional_Audit_and_Improvements.md) | Full audit record: 22 screens reviewed, 5 critical issues found, all improvements documented |

---

## For Hackathon Context

| File | What It Contains |
|------|-----------------|
| [Turing_Test_Hackathon_Requirements.md](Turing_Test_Hackathon_Requirements.md) | Official DoraHacks requirements: tracks, judging criteria, submission deadline (June 15, 2026) |
| [Turing_Test_Hackathon_Strategy.md](Turing_Test_Hackathon_Strategy.md) | Winning strategy: Phase 1 (ClawHack), Phase 2 (AI Awakening), judging criteria breakdown |
| [Updated_Turing_Test_Hackathon_Strategy.md](Updated_Turing_Test_Hackathon_Strategy.md) | Confirmed tech stack with judging criteria alignment — how each stack choice scores points |
| [Turing_Test_Hackathon_Report.md](Turing_Test_Hackathon_Report.md) | Hackathon overview, objectives, key areas of focus, submission requirements |

---

## Quick Reference — Key Decisions

| Decision | Answer |
|---------|--------|
| Backend language | Python (Flask 3.x) — NOT Node.js |
| Backend pattern | Application Factory + Blueprints |
| Frontend framework | Next.js 14 TypeScript, App Router (`app/`) |
| File extensions | `.tsx` components, `.ts` utils/hooks |
| Database | PostgreSQL via SQLAlchemy ORM + Flask-Migrate |
| Auth | Flask-JWT-Extended (Python) |
| Passwords | flask-bcrypt (Python) |
| Background jobs | Celery + Redis |
| Real-time | Flask-SocketIO ↔ socket.io-client |
| Blockchain (backend) | web3.py |
| Blockchain (frontend) | Ethers.js v6 + wagmi |
| Smart contracts | Hardhat + Solidity 0.8.x (NOT Truffle) |
| Backend testing | pytest + pytest-flask (NOT Mocha/Chai) |
| Frontend testing | Jest + React Testing Library |
| Global state | Zustand (NOT Redux) |
| Server state | TanStack Query |
| Deployment (frontend) | Vercel |
| Deployment (backend) | Railway or Render |
| Product name | MantleMandate (no hyphen, no "-SaaS") |
| Plans | Operator ($29) · Strategist ($99) · Institution ($299) |
| Crypto payments | USDC · USDT · MNT (10% MNT discount) |

---

## What Was Removed (and Why)

| Removed File | Reason |
|-------------|--------|
| `Full_Stack_Implementation_Roadmap(1).md` | Exact duplicate of Roadmap.md — had Node.js backend |
| `Full_Stack_Implementation_Roadmap(3).md` | Exact duplicate of Roadmap(2).md — had broken sandbox download link |
| `Professional_Implementation_Prompt(1).md` | Exact duplicate of Professional_Implementation_Prompt.md |
| `Complete_MantleMandate_SaaS_UI_Design.md` | High-level notes superseded by 20 detailed `uiux-v2/` screen specs |
| `MantleMandate_SaaS_Neo_Brutalist_Design.md` | Design principles superseded by `uiux-v2/00_Design_System.md` |
| `Landing_Login_SignUp_Design.md` | Superseded by `uiux-v2/01_Landing_Page.md`, `02_Login_Page.md`, `03_SignUp_Page.md` |
