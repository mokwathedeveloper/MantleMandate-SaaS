# MantleMandate

AI-powered trading mandate platform on Mantle Network. Write trading rules in plain English — MantleMandate compiles them into enforceable on-chain policies, deploys AI agents to execute them, and provides a verifiable audit trail of every decision.

**Turing Test Hackathon 2026 — Trading & Strategy track**

---

## Live Demo

| Resource | Link |
|----------|------|
| Frontend | https://mantle-mandate-saa-s.vercel.app |
| MandatePolicy Contract | [0x690Ab021b40a01E9f3818CdBa149fb5721480871](https://explorer.sepolia.mantle.xyz/address/0x690Ab021b40a01E9f3818CdBa149fb5721480871) |
| AgentExecutor Contract | [0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6](https://explorer.sepolia.mantle.xyz/address/0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6) |
| RiskGuard Contract | [0x8D99D4F922248852Bc678bd4018F9f3E4576E34B](https://explorer.sepolia.mantle.xyz/address/0x8D99D4F922248852Bc678bd4018F9f3E4576E34B) |
| MockSwapPool (mUSD/mWETH AMM) | [0x3440d742bbbAe391b95E40FAF62d7a715582a4ad](https://explorer.sepolia.mantle.xyz/address/0x3440d742bbbAe391b95E40FAF62d7a715582a4ad) |
| Network | Mantle Sepolia Testnet (Chain ID 5003) |

---

## The Problem

DeFi trading requires constant attention, technical expertise, and emotional discipline. Individual traders and small institutions lack tools to enforce strategy rules systematically — they trade on gut, break their own rules, and have no audit trail.

## The Solution

MantleMandate lets you write your investment strategy in plain English. Claude AI parses it into a structured policy, hashes it on-chain (immutable proof), and deploys an AI agent to execute it automatically — every decision recorded on Mantle Network forever.

**One-line pitch:** Write a trading rule in English → AI enforces it on-chain.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  Next.js 14 · TypeScript · Tailwind CSS · wagmi (Mantle chain) │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────────┐
│                      BACKEND API                                │
│  Flask 3.x · Python 3.12 · SQLAlchemy · Celery workers         │
│                                                                  │
│  ┌─────────────────┐   ┌──────────────────┐   ┌─────────────┐  │
│  │  Mandate Parser │   │  Agent Scheduler │   │  Risk Guard │  │
│  │  (Claude AI)    │   │  (Celery Beat)   │   │  Engine     │  │
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

### Core User Flow

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

### Smart Contracts

| Contract | Address (Mantle Sepolia) | Purpose |
|----------|--------------------------|---------|
| `MandatePolicy` | `0x690Ab021b40a01E9f3818CdBa149fb5721480871` | Immutable policy hash registry |
| `AgentExecutor` | `0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6` | Agent lifecycle + trade execution |
| `RiskGuard` | `0x8D99D4F922248852Bc678bd4018F9f3E4576E34B` | On-chain risk parameter enforcement |
| `MockSwapPool` | `0x3440d742bbbAe391b95E40FAF62d7a715582a4ad` | mUSD/mWETH constant-product AMM — agents execute real on-chain swaps here (Merchant Moe / Agni Finance have no Sepolia deployment to swap against) |
| `mUSD` (mock ERC20) | `0x61806e0D29b0aa200dC26e9C1F0380707a3210c9` | Test USD token, 6 decimals |
| `mWETH` (mock ERC20) | `0x535DC64B3eBDf3ce0ed1C03a8dfbEaf3A84e49EF` | Test ETH token, 18 decimals |

All six contracts are verified on Sourcify (full match), synced to Mantle Explorer.

### AI Integration (Claude)

The mandate parser (`/api/mandates/parse`) calls Anthropic Claude with a structured prompt. It extracts:
- `asset` — which token to trade
- `trigger` — entry/exit conditions
- `riskPerTrade` — position size %
- `takeProfit` / `stopLoss` — exit thresholds
- `venue` — which Mantle DEX (Merchant Moe, Agni Finance, Fluxion)
- `schedule` — execution frequency

The output is hashed (SHA-256) and submitted on-chain, creating a cryptographic commitment to the strategy.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · wagmi · viem |
| Backend | Flask 3.x · Python 3.12 · SQLAlchemy · Celery · Flask-SocketIO |
| AI | Anthropic Claude 3.5 (mandate parsing) · Bybit API (market data) |
| Blockchain | Solidity 0.8.24 · Hardhat · Mantle Sepolia Testnet |
| Database | PostgreSQL 15 (Supabase) · Redis 7 |
| Auth | Supabase Auth |

---

## Quick Start

### Prerequisites

- Node.js 20 LTS
- Python 3.12+
- Docker + Docker Compose

### 1. Start infrastructure

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in ANTHROPIC_API_KEY, MANTLE_RPC_URL, etc.
flask db upgrade
python run.py
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL, etc.
npm install
npm run dev
```

Open http://localhost:3000

### 4. Smart contracts (already deployed — for local dev only)

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

### Environment Variables

**Frontend** (`frontend/.env.local`):
```
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

**Backend** (`.env`):
```
ANTHROPIC_API_KEY=
DATABASE_URL=postgresql://...
MANTLE_PRIVATE_KEY=
MANTLE_TESTNET_RPC_URL=https://rpc.sepolia.mantle.xyz
```

---

## Demo Flow (for judges)

1. **Login** at the live demo URL
2. **Create a mandate** — type: `"Buy ETH when RSI drops below 30. Max 20% position. Stop loss at 2%."`
3. **AI parses it** — structured policy appears in seconds
4. **Anchor on-chain** — click "Anchor Policy On-Chain", sign with MetaMask
5. **Deploy agent** — select the mandate, deploy AI agent
6. **Register on Mantle** — agent registered in AgentExecutor contract on-chain
7. **Run Trading Cycle** — agent fetches live Bybit market data, Claude makes a buy/sell/hold decision, and for ETH the agent swaps mUSD↔mWETH on the on-chain MockSwapPool, then records the order via `AgentExecutor.executeOrder()` referencing the swap's tx hash
8. **View audit trail** — live OrderExecuted + Swap events from Mantle Sepolia

---

## Hackathon Tracks

This project is submitted under the **Trading & Strategy** track:

- ✅ AI trading agents with real on-chain execution (mUSD/mWETH swaps via MockSwapPool)
- ✅ Strategy verifiability via on-chain OrderExecuted + Swap events
- ✅ Mandate policy hashes as immutable strategy commitments
- ✅ Deployed on Mantle Sepolia Testnet (Chain ID 5003)

Also eligible for:
- **Best UI/UX Award** — premium dark dashboard, glassmorphic auth, 30+ screens
- **20 Project Deployment Award** — 3 contracts deployed + verified, public frontend, AI callable on-chain

---

## Plans

| Plan | Price | Target |
|------|-------|--------|
| Operator | $29/mo | Individual DeFi traders |
| Strategist | $99/mo | Active quant traders |
| Institution | $299/mo | Funds and DAOs |

---

## Known Limitations (Hackathon MVP)

- Agent execution swaps against a project-deployed mUSD/mWETH MockSwapPool, not Merchant Moe / Agni Finance — those DEXes have no Mantle Sepolia deployment to integrate against on testnet
- Demo uses Mantle Sepolia Testnet (not Mainnet)
- OAuth (Google/Microsoft) is UI-only; email/password auth is fully functional

## Future Improvements

- Mainnet deployment routing real swaps through Merchant Moe + Agni Finance liquidity
- Byreal Agent Skills integration for advanced LP strategies
- Mainnet deployment with multisig agent treasury
- Mobile app for real-time alerts and mandate management
