# MantleMandate

AI-powered trading mandate platform on Mantle Network. Write trading rules in plain English — MantleMandate compiles them into enforceable on-chain policies, deploys AI agents to execute them, and provides a verifiable audit trail of every decision.

**Turing Test Hackathon 2026 — AI Trading & Strategy track**

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · wagmi · Ethers.js v6 |
| Backend | Flask 3.x · Python 3.12 · SQLAlchemy · Celery · Flask-SocketIO |
| AI | Anthropic Claude (mandate parsing) · Bybit API (market data) |
| Blockchain | Solidity 0.8.x · Hardhat · Mantle Network (Chain ID 5000) |
| Database | PostgreSQL 15 · Redis 7 |

---

## Quick Start

### Prerequisites

- Node.js 20 LTS
- Python 3.12+
- Docker + Docker Compose (for PostgreSQL and Redis)

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
cp .env.example .env   # fill in your API keys
flask db upgrade
python run.py
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # fill in values
npm install
npm run dev
```

### 4. Smart contracts

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
```

---

## Docs

See [`docs/`](docs/README.md) for full architecture, implementation rules, and screen specs.

---

## Plans

| Plan | Price | Target |
|------|-------|--------|
| Operator | $29/mo | Individual DeFi traders |
| Strategist | $99/mo | Active quant traders |
| Institution | $299/mo | Funds and DAOs |

Crypto payments: USDC · USDT · MNT (10% MNT discount)
