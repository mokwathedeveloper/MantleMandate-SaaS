<div align="center">

<img src="logo/MantleMandatelogo.png" alt="MantleMandate" width="120" />

# ⚡ MantleMandate

### Write Trading Rules in Plain English. AI Enforces Them On-Chain.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-mantle--mandate--saa--s.vercel.app-65B46B?style=for-the-badge)](https://mantle-mandate-saa-s.vercel.app)
[![Network](https://img.shields.io/badge/Network-Mantle_Sepolia_Testnet-1A1A1A?style=for-the-badge&logo=ethereum&logoColor=white)](https://explorer.sepolia.mantle.xyz)
[![Track](https://img.shields.io/badge/Track-Trading_%26_Strategy-6366f1?style=for-the-badge)](docs/Turing_Test_Hackathon_Requirements.md)
[![Contracts](https://img.shields.io/badge/Contracts-Verified_on_Sourcify-10b981?style=for-the-badge)](https://explorer.sepolia.mantle.xyz/address/0x690Ab021b40a01E9f3818CdBa149fb5721480871)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)

> **Turing Test Hackathon 2026 — Trading & Strategy Track**

*Write a trading rule in English → Claude AI compiles it into a structured policy → the policy hash is committed on-chain → an AI agent executes it, with every decision — including holds — traceable to a live RSI reading, a Bybit price snapshot, and an on-chain `OrderExecuted` / `Swap` event.*

</div>

---

## 🌐 Live Demo & Contracts

| Resource | Link |
|----------|------|
| 🖥️ Frontend | [mantle-mandate-saa-s.vercel.app](https://mantle-mandate-saa-s.vercel.app) |
| 📜 MandatePolicy | [`0x690Ab021b40a01E9f3818CdBa149fb5721480871`](https://explorer.sepolia.mantle.xyz/address/0x690Ab021b40a01E9f3818CdBa149fb5721480871) |
| 🤖 AgentExecutor | [`0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6`](https://explorer.sepolia.mantle.xyz/address/0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6) |
| 🛡️ RiskGuard | [`0x8D99D4F922248852Bc678bd4018F9f3E4576E34B`](https://explorer.sepolia.mantle.xyz/address/0x8D99D4F922248852Bc678bd4018F9f3E4576E34B) |
| 🔄 MockSwapPool (mUSD/mWETH AMM) | [`0x3440d742bbbAe391b95E40FAF62d7a715582a4ad`](https://explorer.sepolia.mantle.xyz/address/0x3440d742bbbAe391b95E40FAF62d7a715582a4ad) |
| ⛓️ Network | Mantle Sepolia Testnet · Chain ID `5003` |

---

## ❓ The Problem

DeFi trading requires constant attention, technical expertise, and emotional discipline. Individual traders and small institutions lack tools to enforce strategy rules systematically — they trade on gut, break their own rules, and have no audit trail.

## 💡 The Solution

MantleMandate lets you write your investment strategy in plain English. Claude AI parses it into a structured policy, hashes it on-chain (immutable proof), and deploys an AI agent to execute it automatically — every decision recorded on Mantle Network forever.

**One-line pitch:** Write a trading rule in English → AI enforces it on-chain.

### 🌱 Why This Matters (Blockchain-for-Good)

Algorithmic, rule-based execution has historically been available only to funds and institutions with engineering teams. MantleMandate compiles a plain-English mandate into the same kind of policy-as-code institutions use — RSI-based entries, position-size caps, stop-loss/take-profit, cooldowns — and **commits it on-chain before any trade runs**, so the rules can't be silently changed after the fact.

This is deliberately not a "maximize PnL" leaderboard. The product is graded on **whether the agent followed its own committed rules**, with every decision (including holds) traceable to a live RSI reading, a Bybit price snapshot, and an on-chain `OrderExecuted`/`Swap` event. That's the same transparency a retail user would otherwise have no way to get from a black-box trading bot — reducing the information gap between retail and institutional execution, not chasing the highest return.

The platform's own subscription fee ($29–$299/mo, see [Plans](#-plans)) is flat and disclosed upfront — it does not scale with trade volume or PnL, so there's no incentive for the platform to encourage more or larger trades than a mandate calls for.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  Next.js 14 · TypeScript · Tailwind CSS · wagmi (Mantle chain) │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────────┐
│        LIVE BACKEND: NEXT.JS API ROUTES (frontend/app/api)     │
│  Supabase Auth · Supabase Postgres · server wallet (viem)      │
│                                                                  │
│  ┌─────────────────┐   ┌──────────────────┐   ┌─────────────┐  │
│  │  Mandate Parser │   │  Agent Tick      │   │  Support    │  │
│  │  (Claude AI)    │   │  (RSI + Claude)  │   │  Chat (RAG) │  │
│  └────────┬────────┘   └────────┬─────────┘   └──────┬──────┘  │
└───────────┼────────────────────┼────────────────────┼──────────┘
            │                    │                     │
┌───────────▼────────────────────▼─────────────────────▼──────────┐
│                    MANTLE NETWORK (Chain ID 5003)                │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐   │
│  │  MandatePolicy  │  │  AgentExecutor   │  │   RiskGuard   │   │
│  │  (Policy hash   │  │  (register +     │  │  (exposure    │   │
│  │   registry)     │  │   execute orders)│  │   limits)     │   │
│  └─────────────────┘  └──────────────────┘  └───────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 🔄 Core User Flow

```
1. Write mandate in plain English
       ↓
2. Claude AI parses it → structured policy (JSON)
       ↓
3. Policy hash submitted to MandatePolicy contract (on-chain proof)
       ↓
4. Deploy AI agent → registered in AgentExecutor contract
       ↓
5. Agent evaluates Mantle DeFi market conditions every 5 minutes
       ↓
6. Executes trades via AgentExecutor.executeOrder() — immutable record
       ↓
7. Full audit trail readable from on-chain OrderExecuted events
```

### 🧠 AI Decision Pipeline

Each trading cycle (`runAgentTick` in `frontend/lib/agentTick.ts`) is a deterministic pipeline, not a single opaque LLM call:

```
1. Fetch live Bybit ticker (price, 24h change, volume) for the mandate's asset
2. Fetch recent Bybit klines and compute RSI(14, 1h) — frontend/lib/indicators.ts
3. Send mandate policy + computed RSI + live market data to Claude
       ↓ Claude returns { action, confidence, reasoning, amount_pct, urgency }
4. Hard gate: hold or confidence < 65 → no trade, decision still recorded
5. Hard gate: live price/RSI unavailable → no trade (fail closed, not open)
6. For ETH/WETH: real on-chain swap on MockSwapPool, sized by mandate's riskPerTrade
7. AgentExecutor.executeOrder() — immutable on-chain record, referencing the swap tx
```

The computed RSI value, Claude's confidence score, and its one-sentence reasoning are all
shown in the dashboard for every cycle — including cycles where the agent decided **not**
to trade — so a user can audit whether the agent is actually following the mandate's
trigger condition, not just trust that it is.

### ⛓️ Smart Contracts

| Contract | Address (Mantle Sepolia) | Purpose |
|----------|--------------------------|---------|
| 📜 `MandatePolicy` | `0x690Ab021b40a01E9f3818CdBa149fb5721480871` | Immutable policy hash registry |
| 🤖 `AgentExecutor` | `0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6` | Agent lifecycle + trade execution |
| 🛡️ `RiskGuard` | `0x8D99D4F922248852Bc678bd4018F9f3E4576E34B` | On-chain risk parameter enforcement |
| 🔄 `MockSwapPool` | `0x3440d742bbbAe391b95E40FAF62d7a715582a4ad` | mUSD/mWETH constant-product AMM — agents execute real on-chain swaps here (Merchant Moe / Agni Finance have no Sepolia deployment to swap against) |
| 💵 `mUSD` (mock ERC20) | `0x61806e0D29b0aa200dC26e9C1F0380707a3210c9` | Test USD token, 6 decimals |
| Ξ `mWETH` (mock ERC20) | `0x535DC64B3eBDf3ce0ed1C03a8dfbEaf3A84e49EF` | Test ETH token, 18 decimals |

All six contracts are verified on Sourcify (full match), synced to Mantle Explorer.

### 🤖 AI Integration (Claude)

The mandate parser (`/api/mandates/parse`) calls Anthropic Claude with a structured prompt. It extracts:
- `asset` — which token to trade
- `trigger` — entry/exit conditions
- `riskPerTrade` — position size %
- `takeProfit` / `stopLoss` — exit thresholds
- `venue` — which Mantle DEX (Merchant Moe, Agni Finance, Fluxion)
- `schedule` — execution frequency

The output is hashed (SHA-256) and submitted on-chain, creating a cryptographic commitment to the strategy.

### 🛡️ Strategy Design & Risk Management

- **The mandate's bound wins, not the model's.** The AI recommends a position size (`amount_pct`), but `runAgentTick` clamps it to the mandate's own `riskPerTrade` ceiling before any execution — a confident "buy 80%" from Claude cannot exceed what the user's mandate allows, regardless of the AI's recommendation (`agentTick.ts`).
- **Fail closed on bad data.** If Bybit data is unavailable or the RSI can't be computed, the agent records "no trade" rather than guessing — an LLM is never asked to trade on data it doesn't have (`agentTick.ts`, "Live market data unavailable" path).
- **Confidence floor.** Claude's own confidence score must clear 65/100 before any trade is considered, and every "hold" or sub-threshold decision is still recorded and visible — so a user can see the agent *choosing not to act* as evidence it isn't over-trading.
- **On-chain kill switch.** `AgentExecutor.sol` models each agent as `Inactive → Active ⇄ Paused → Stopped`, enforced in the contract itself: `executeOrder()` reverts with `"AgentExecutor: agent not active"` for any agent that isn't `Active`. A user can pause an agent on-chain at any time.
- **`RiskGuard.sol`** (deployed and verified at the address above) implements full on-chain enforcement of drawdown limits, max concurrent positions, per-trade cooldowns, and position-size bounds via `checkOrder()`. It is not yet called from the live tick path — today those bounds are enforced in `agentTick.ts` itself (drawdown is read from Supabase and fed to the AI as context; position sizing is hard-capped as above). Wiring `checkOrder()` into `runAgentTick` so these bounds are enforced on-chain, not just in application code, is the top item under [Future Improvements](#-future-improvements).
- **Known limitation:** market-data inputs (Bybit price/volume/RSI) are read but not cross-validated against a second source. A manipulated or stale feed could still produce a misleading — though position-size-bounded — recommendation.

---

## 🔀 Backend Implementations: Live vs. Reference

This repo contains **two backend implementations**, built during architecture exploration:

| | **Live (used by the deployed demo)** | **Reference (`backend/`)** |
|---|---|---|
| Stack | Next.js 14 Route Handlers (`frontend/app/api/*`) | Flask 3.x · Python 3.12 · Celery |
| Auth | Supabase Auth | Flask-JWT-Extended |
| Database | Supabase Postgres | Separate Postgres (own schema + Alembic migrations) |
| Contract addresses | `.env.example` — matches the deployed contracts above | `render.yaml` — different deployment |
| Status | ✅ Live — every dashboard action calls these routes | Complete, with its own `pytest` suite · ❌ not called by the live demo |

The Flask backend reflects the project's original planned architecture (see [`docs/Final_Architecture_for_MantleMandate_SaaS.md`](docs/Final_Architecture_for_MantleMandate_SaaS.md)). The team later consolidated the live product onto Next.js API routes + Supabase — fewer moving parts to deploy and demo within the hackathon timeline. The Flask implementation remains in [`backend/`](backend/) as a complete, independently-built alternative (and a candidate base for a future Python agent-execution service using Celery for scheduled ticks), but it uses its own database/auth/contract configuration and **is not part of the live request path**.

---

## 🛠️ Tech Stack

### ⛓️ Blockchain & Smart Contracts
![Solidity](https://img.shields.io/badge/Solidity_0.8.x-363636?style=flat-square&logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-FFF100?style=flat-square&logo=hardhat&logoColor=black)
![Mantle](https://img.shields.io/badge/Mantle_Sepolia-65B46B?style=flat-square)
![Sourcify](https://img.shields.io/badge/Verified-Sourcify-10b981?style=flat-square)

- 6 contracts deployed + verified on Mantle Sepolia (Chain ID `5003`)
- `MandatePolicy` — immutable on-chain policy hash registry
- `AgentExecutor` — agent lifecycle (`Inactive → Active ⇄ Paused → Stopped`) + `executeOrder()`
- `RiskGuard` — drawdown, position-size, cooldown and max-position checks via `checkOrder()`
- `MockSwapPool` + `mUSD`/`mWETH` — constant-product AMM for real on-chain swap execution

### 🌐 Frontend
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![wagmi](https://img.shields.io/badge/wagmi_v3-000000?style=flat-square)
![viem](https://img.shields.io/badge/viem_v2-000000?style=flat-square)
![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![Zod](https://img.shields.io/badge/Zod_v4-3E67B1?style=flat-square&logo=zod&logoColor=white)

- 22+ dashboard pages: agents, mandates, portfolio, trades, on-chain audit, risk engine, docs, support
- `ChatWidget` — Claude-powered support chat grounded in the docs hub (lite-RAG)
- MetaMask / wagmi wallet integration for on-chain mandate anchoring

### 🔧 Backend (Live)

The live demo's backend is entirely Next.js Route Handlers — no separate server to deploy or run:

- `frontend/app/api/mandates/parse` — Claude-powered mandate parsing
- `frontend/app/api/agents/[id]/tick` — on-chain trading-cycle execution (`runAgentTick`)
- `frontend/app/api/agents/decide` — AI decision pipeline (RSI + Bybit + Claude)
- `frontend/app/api/support/chat` — docs-grounded support chat (lite-RAG)
- Supabase Auth (session cookies) + Supabase Postgres for all relational data
- Server-side wallet (`frontend/lib/serverWallet.ts`, viem) signs on-chain transactions on the agent's behalf

### 🔧 Backend (Reference Implementation)
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask_3-000000?style=flat-square&logo=flask)
![Celery](https://img.shields.io/badge/Celery-37814A?style=flat-square&logo=celery&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square)
![Flask--SocketIO](https://img.shields.io/badge/Flask--SocketIO-000000?style=flat-square&logo=socket.io&logoColor=white)

A separately-built Flask 3.x backend in [`backend/`](backend/) — JWT auth, rate limiting (Flask-Limiter), CORS, SQLAlchemy + Alembic migrations, Celery + Celery Beat for scheduled agent ticks, and its own `pytest` suite. **Not used by the live demo** — see [Backend Implementations: Live vs. Reference](#-backend-implementations-live-vs-reference) above.

### 🗄️ Database & Auth
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=flat-square&logo=redis&logoColor=white)

- Supabase Postgres for relational data (mandates, agents, trades, users)
- Supabase Auth for email/password sessions
- Redis as the Celery broker/result backend (reference Flask backend only)

### 🤖 AI & Market Data
![Claude](https://img.shields.io/badge/Claude_Sonnet_4.5-D97757?style=flat-square)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white)
![MCP](https://img.shields.io/badge/MCP_Server-000000?style=flat-square)
![Bybit](https://img.shields.io/badge/Bybit_API-F7A600?style=flat-square)

- Anthropic Claude Sonnet 4.5 (via OpenRouter, wrapped with LangChain's `ChatOpenAI`) — mandate parsing + per-cycle trade decisions + support chat
- Bybit public spot API — live ticker + klines for RSI computation
- MCP (Model Context Protocol) server — exposes platform docs, contract addresses, and mandate schema to MCP clients (see [MCP Server](#-mcp-server) below)

---

## 🔌 MCP Server

MantleMandate exposes a read-only [Model Context Protocol](https://modelcontextprotocol.io) server at **`/api/mcp`**, so any MCP client (Claude Desktop, etc.) can query platform information directly — useful for an AI assistant helping a user draft a mandate or look up contract addresses.

- **Endpoint**: `POST /api/mcp` (JSON-RPC 2.0 over Streamable HTTP, stateless — no session required)
- **Implementation**: `frontend/app/api/mcp/route.ts`, built with `@modelcontextprotocol/sdk`'s `WebStandardStreamableHTTPServerTransport`
- **Auth**: none — only public, non-sensitive data is exposed

### Available tools

| Tool | Description |
|---|---|
| `search_docs` | Search the 28-article docs hub for content relevant to a query (e.g. "how do I write a mandate with RSI conditions") |
| `get_contract_addresses` | Returns deployed contract addresses + chain info for Mantle Sepolia (`MandatePolicy`, `AgentExecutor`, `RiskGuard`, `MockSwapPool`, mUSD/mWETH) |
| `get_mandate_policy_schema` | Returns the structured field schema (`asset`, `trigger`, `riskPerTrade`, `stopLoss`, etc.) used to parse plain-English mandates |

### Connecting from Claude Desktop

```json
{
  "mcpServers": {
    "mantlemandate": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mantle-mandate-saa-s.vercel.app/api/mcp"]
    }
  }
}
```

---

## 📁 Project Structure

```
MantleMandate-SaaS/
│
├── 🌐 frontend/                    # Next.js 14 · TypeScript · Tailwind
│   ├── app/
│   │   ├── (auth)/                 # Login / signup
│   │   ├── api/
│   │   │   ├── agents/[id]/tick/   # On-chain trading-cycle execution
│   │   │   ├── agents/decide/      # AI decision pipeline (RSI + Bybit + Claude)
│   │   │   ├── mandates/parse/     # Claude-powered mandate parsing
│   │   │   ├── mcp/                # MCP server — docs/contracts/schema tools (see MCP Server)
│   │   │   └── support/chat/       # Docs-grounded support chat (lite-RAG)
│   │   └── dashboard/              # 22+ pages: agents, mandates, portfolio, risk, docs...
│   ├── lib/
│   │   ├── agentDecision.ts        # getTradeDecision() — RSI + live data → Claude
│   │   ├── agentTick.ts            # runAgentTick() — gate, swap, executeOrder
│   │   ├── indicators.ts           # calculateRSI() — Wilder's RSI(14)
│   │   ├── bybit.ts                # Bybit spot ticker + klines client
│   │   ├── contracts.ts            # ABIs + deployed addresses
│   │   ├── openrouter.ts           # LangChain ChatOpenAI wrapper for OpenRouter/Claude
│   │   ├── docsKnowledgeBase.ts    # Docs retrieval index — powers RAG chat + MCP search_docs
│   │   └── serverWallet.ts         # Service wallet (shadow agent execution)
│   └── hooks/                      # useAgents, useMandates, etc. (TanStack Query)
│
├── 🔧 backend/                     # Flask 3.x · Python 3.12 · Celery — REFERENCE IMPL, not used by live demo
│   ├── app/                        # Routes, models, services
│   ├── ai/                         # Mandate parsing (Claude)
│   ├── migrations/                 # Flask-Migrate / Alembic
│   └── tests/                      # pytest suite
│
├── ⛓️ blockchain/                  # Solidity 0.8.x · Hardhat
│   ├── contracts/
│   │   ├── MandatePolicy.sol       # Policy hash registry
│   │   ├── AgentExecutor.sol       # Agent lifecycle + executeOrder
│   │   ├── RiskGuard.sol           # On-chain risk parameter checks
│   │   ├── MockSwapPool.sol        # mUSD/mWETH constant-product AMM
│   │   └── MockERC20.sol           # mUSD / mWETH test tokens
│   └── scripts/                    # deploy.ts / verify.ts
│
├── 🗄️ supabase/
│   └── migrations/                 # SQL schema migrations
│
└── 📚 docs/                        # Architecture, audits, hackathon strategy docs
```

---

## 🚀 Quick Start

The live demo runs on the frontend alone (Next.js + Supabase + Mantle Sepolia) — **no backend server required.**

### Prerequisites

- Node.js 20 LTS
- Python 3.12+ (only for the optional Flask reference backend)
- Docker + Docker Compose (only for the optional Flask reference backend)

### 1️⃣ Frontend (live demo)

```bash
cd frontend
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL, etc.
npm install
npm run dev
```

Open http://localhost:3000

### 2️⃣ Smart contracts (already deployed — for local dev only)

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
# Deploy to Mantle testnet:
npx hardhat run scripts/deploy.ts --network mantle_testnet
# Verify on explorer:
npx hardhat run scripts/verify.ts --network mantle_testnet
```

### 🧪 Optional: Flask reference backend

Not called by the frontend or the live demo — see [Backend Implementations: Live vs. Reference](#-backend-implementations-live-vs-reference). Run it only to explore the standalone Flask implementation.

```bash
docker compose up -d   # Postgres + Redis for the Flask backend

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in ANTHROPIC_API_KEY, MANTLE_RPC_URL, etc.
flask db upgrade
python run.py
```

### 🔑 Environment Variables

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_MANDATE_POLICY_CONTRACT=0x690Ab021b40a01E9f3818CdBa149fb5721480871
NEXT_PUBLIC_AGENT_EXECUTOR_CONTRACT=0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6
NEXT_PUBLIC_RISK_GUARD_CONTRACT=0x8D99D4F922248852Bc678bd4018F9f3E4576E34B
NEXT_PUBLIC_MOCK_USD_CONTRACT=0x61806e0D29b0aa200dC26e9C1F0380707a3210c9
NEXT_PUBLIC_MOCK_WETH_CONTRACT=0x535DC64B3eBDf3ce0ed1C03a8dfbEaf3A84e49EF
NEXT_PUBLIC_SWAP_POOL_CONTRACT=0x3440d742bbbAe391b95E40FAF62d7a715582a4ad
```

**Backend** (`.env`, Flask reference implementation only):
```env
ANTHROPIC_API_KEY=
DATABASE_URL=postgresql://...
MANTLE_PRIVATE_KEY=
MANTLE_TESTNET_RPC_URL=https://rpc.sepolia.mantle.xyz
```

---

## 🎬 Demo Flow (for Judges)

1. **Login** at the live demo URL
2. **Create a mandate** — type: `"Buy ETH when RSI drops below 30. Max 20% position. Stop loss at 2%."`
3. **AI parses it** — structured policy appears in seconds
4. **Anchor on-chain** — click "Anchor Policy On-Chain", sign with MetaMask
5. **Deploy agent** — select the mandate, deploy AI agent
6. **Register on Mantle** — agent registered in AgentExecutor contract on-chain
7. **Run Trading Cycle** — agent fetches live Bybit market data + RSI(14), Claude makes a buy/sell/hold decision, and for ETH the agent swaps mUSD↔mWETH on the on-chain MockSwapPool, then records the order via `AgentExecutor.executeOrder()` referencing the swap's tx hash
8. **View audit trail** — live OrderExecuted + Swap events from Mantle Sepolia

---

## 🏆 Hackathon Tracks

This project is submitted under the **Trading & Strategy** track:

- ✅ AI trading agents with real on-chain execution (mUSD/mWETH swaps via MockSwapPool)
- ✅ Strategy verifiability via on-chain OrderExecuted + Swap events
- ✅ Mandate policy hashes as immutable strategy commitments
- ✅ Deployed on Mantle Sepolia Testnet (Chain ID 5003)

Also eligible for:
- **Best UI/UX Award** — premium dark dashboard, glassmorphic auth, 30+ screens
- **20 Project Deployment Award** — 6 contracts deployed + verified, public frontend, AI callable on-chain

---

## 💳 Plans

| Plan | Price | Target |
|------|-------|--------|
| 🧑‍💻 Operator | $29/mo | Individual DeFi traders |
| 📈 Strategist | $99/mo | Active quant traders |
| 🏛️ Institution | $299/mo | Funds and DAOs |

---

## ⚠️ Known Limitations (Hackathon MVP)

- Agent execution swaps against a project-deployed mUSD/mWETH MockSwapPool, not Merchant Moe / Agni Finance — those DEXes have no Mantle Sepolia deployment to integrate against on testnet
- Demo uses Mantle Sepolia Testnet (not Mainnet)
- OAuth (Google/Microsoft) is UI-only; email/password auth is fully functional
- The `backend/` Flask implementation is a separate, independently-built reference architecture — not called by the live demo (see [Backend Implementations: Live vs. Reference](#-backend-implementations-live-vs-reference))

## 🗺️ Future Improvements

- Wire `RiskGuard.checkOrder()` into `runAgentTick` so drawdown, cooldown, max-position, and position-size bounds are enforced on-chain per trade, not only in application code
- Cross-validate Bybit market data against a second price source before acting on it
- Mainnet deployment routing real swaps through Merchant Moe + Agni Finance liquidity
- Byreal Agent Skills integration for advanced LP strategies
- Mainnet deployment with multisig agent treasury
- Mobile app for real-time alerts and mandate management

---

<div align="center">

Built for the Turing Test Hackathon 2026

`#TuringTestHackathon` · `#MantleNetwork` · `#AITrading`

**[🌐 Live Demo](https://mantle-mandate-saa-s.vercel.app)** · **[📜 Contracts](https://explorer.sepolia.mantle.xyz/address/0x690Ab021b40a01E9f3818CdBa149fb5721480871)** · **[📚 Docs](frontend/app/dashboard/docs)**

⚖️ MIT License

</div>
