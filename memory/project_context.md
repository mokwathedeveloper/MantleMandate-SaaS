---
name: MantleMandate Project Context
description: Core project facts — product name, stack, hackathon, what has been built in docs/uiux-v2
type: project
---

**Product name:** MantleMandate (no hyphen, no "-SaaS" suffix)

**Hackathon:** Turing Test Hackathon 2026 — Mantle Network ecosystem, $100k prize pool. Submission deadline June 15, 2026.

**Tech stack (confirmed):**
- Backend: Flask (Python 3.11+) with Application Factory + Blueprints. NOT Node.js/Express.js.
- Frontend: Next.js 14 TypeScript, App Router (`app/` directory). NOT Pages Router. `.tsx`/`.ts` files only.
- Database: PostgreSQL 15 via SQLAlchemy 2.x + Flask-Migrate (Alembic). Never raw SQL.
- Auth: Flask-JWT-Extended (Python). NOT JavaScript jsonwebtoken.
- Passwords: flask-bcrypt (Python). NOT Node.js bcrypt.
- Background jobs: Celery + Redis.
- Real-time: Flask-SocketIO (server) + socket.io-client (frontend).
- Blockchain: Solidity 0.8.x + Hardhat. NOT Truffle. web3.py for backend, Ethers.js v6 + wagmi for frontend.
- Testing backend: pytest + pytest-flask. NEVER Mocha/Chai.
- Testing frontend: Jest + React Testing Library.
- State: Zustand (global) + TanStack Query (server). NOT Redux.
- Deployment: Vercel (frontend), Railway or Render (Flask backend), Supabase/RDS (PostgreSQL), Upstash (Redis).

**DeFi protocols:** Merchant Moe, Agni Finance, Fluxion (all on Mantle Network)

**Pricing tiers:** Operator ($29/mo), Strategist ($99/mo), Institution ($299/mo)

**Crypto payments accepted:** USDC, USDT, MNT (10% discount for MNT)

**What was completed in this session:**
- `docs/MASTER_Architecture_and_Stack.md` — authoritative reference (created earlier session)
- `docs/Backend_Architecture_for_MantleMandate_SaaS.md` — complete Flask rewrite
- `docs/Final_Architecture_for_MantleMandate_SaaS.md` — complete Flask rewrite
- `docs/Implementation_Rules_for_MantleMandate_SaaS.md` — complete rewrite (Flask/pytest/Zustand rules)
- `docs/Full_Stack_Implementation_Roadmap.md` — complete rewrite (Flask setup, Next.js App Router)
- `docs/Full_Stack_Implementation_Roadmap(2).md` — complete rewrite (correct folder structure .tsx/.ts/.py)
- `docs/Full_Stack_Implementation_Roadmap(1).md` — marked superseded
- `docs/Full_Stack_Implementation_Roadmap(3).md` — marked superseded
- `docs/Professional_Implementation_Prompt.md` — complete rewrite (Flask rules, prompt templates)
- `docs/Professional_Implementation_Prompt(1).md` — marked superseded
- `docs/Turing_Test_Hackathon_Report.md` — tech stack section fixed (Flask, pytest)
- `docs/Updated_Turing_Test_Hackathon_Strategy.md` — complete rewrite (Flask stack, no Node.js, no sandbox link)
- `docs/Turing_Test_Hackathon_Strategy.md` — brand name fixed
- `docs/Complete_User_Journey_for_MantleMandate_SaaS.md` — complete rewrite (Flask as primary, full flow)
- `docs/Payment_Methods_Section.md` — complete rewrite (added crypto USDC/USDT/MNT, fixed plan names)
- `uiux-v2/` — 21 screen specs created (00_Design_System through 20_Support_Page)

**Why:** Node.js/Express was the original specified backend in all docs, which was wrong. The correct backend is Flask (Python) because the AI layer (mandate parsing, trading models) is Python-only. All docs were audited and corrected.
