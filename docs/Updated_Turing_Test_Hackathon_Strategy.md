# MantleMandate — Turing Test Hackathon 2026 Tech Stack

> **This is the confirmed, corrected tech stack for MantleMandate.**
> See `docs/MASTER_Architecture_and_Stack.md` for the complete authoritative reference.

---

## 1. Backend — Flask (Python 3.11+)

**Flask** is the primary backend — NOT Node.js/Express.js.

- **Flask 3.x** with Application Factory + Blueprints for modularity
- **Why Flask over Node.js**: The AI layer (trading models, mandate parsing, risk engine) is pure Python. Using Flask keeps the AI and API code in the same Python process, enabling direct function calls without HTTP round-trips between services.
- **Flask-JWT-Extended**: Access tokens (15 min) + refresh tokens (30 days) for auth
- **flask-bcrypt**: Password hashing (bcrypt, cost factor 12)
- **SQLAlchemy 2.x + Flask-Migrate**: ORM + Alembic migrations — no raw SQL
- **Flask-SocketIO + gevent**: Real-time WebSocket push to frontend
- **Celery + Redis**: Background execution of AI agent trading loops
- **web3.py**: All contract calls from the backend to Mantle Network
- **marshmallow**: Input validation on every POST/PUT endpoint
- **Flask-Limiter**: Rate limiting (5 login attempts/min, 100 API calls/min)
- **pytest + pytest-flask**: Backend testing framework

**Install command:**
```bash
pip install flask flask-jwt-extended flask-bcrypt flask-sqlalchemy \
  flask-migrate flask-cors flask-socketio flask-limiter marshmallow \
  celery redis python-dotenv web3 psycopg2-binary gunicorn gevent \
  gevent-websocket pytest pytest-flask pytest-cov
```

**Deployment:** Railway or Render (Gunicorn + gevent, single worker for SocketIO)
```bash
gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
         -w 1 -b 0.0.0.0:5000 "app:create_app()"
```

---

## 2. Frontend — Next.js 14 TypeScript

- **Next.js 14** with App Router (`app/` directory) — NOT Pages Router
- All files: `.tsx` for components and pages, `.ts` for hooks and utilities
- **Tailwind CSS**: Utility-first styling, dark theme (`#0D1117` bg, `#161B22` cards)
- **wagmi + viem**: Wallet connections (MetaMask, WalletConnect)
- **Ethers.js v6**: Direct contract reads from the browser
- **TanStack Query**: Server state management and caching
- **Zustand**: Global client state (auth, alerts, UI) — NOT Redux
- **React Hook Form + Zod**: Type-safe form validation
- **socket.io-client**: Real-time WebSocket alert subscription
- **Axios**: API communication with JWT interceptor

**Install command:**
```bash
npx create-next-app@latest frontend --typescript --tailwind --app
npm install axios zustand @tanstack/react-query react-hook-form zod \
  wagmi viem ethers socket.io-client recharts lucide-react
```

**Deployment:** Vercel (automatic via GitHub integration)

---

## 3. Blockchain — Mantle Network (Hardhat + Solidity 0.8.x)

- **Hardhat** for compiling, testing, deploying — NOT Truffle
- **Solidity 0.8.x** smart contracts:
  - `MandatePolicy.sol` — registers policy hashes on-chain
  - `AgentExecutor.sol` — records trade execution on-chain
  - `RiskGuard.sol` — enforces hard risk limits on-chain
- **web3.py** for backend → contract calls
- **Ethers.js v6 + wagmi** for frontend → contract reads/writes
- Deploy to Mantle Sepolia testnet first, then mainnet

**Install command:**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

**Mantle RPC endpoints:**
- Testnet: `https://rpc.sepolia.mantle.xyz` (Chain ID: 5003)
- Mainnet: `https://rpc.mantle.xyz` (Chain ID: 5000)

**DeFi protocol integrations (read-only for price/liquidity data):**
- Merchant Moe
- Agni Finance
- Fluxion

---

## 4. AI Layer (inside Flask backend)

- Python 3.11+ — TensorFlow / PyTorch / Scikit-learn
- **Not a separate service** — AI modules live in `backend/ai/` and are called as Python functions
- `mandate_parser.py` — NLP parsing of plain-English mandates → structured policy dict
- `trading_model.py` — trading signal generation from Bybit market data
- `risk_engine.py` — pre-trade risk validation (drawdown, position size, cooldown)
- `bybit_feed.py` — read-only Bybit market data ingestion
- Heavy inference jobs dispatched as **Celery tasks** (non-blocking)

---

## 5. Database and Storage

| Component | Technology | Hosting |
|-----------|-----------|---------|
| Primary database | PostgreSQL 15 | Supabase or AWS RDS |
| Cache + task broker | Redis | Upstash |
| Exported files | AWS S3 | CSV/PDF reports |

**Key PostgreSQL tables:** users, wallets, mandates, agents, trades, audit_logs, alerts, reports

---

## 6. Cloud and Hosting

| Component | Platform | Notes |
|-----------|---------|-------|
| Frontend | Vercel | Auto-deploy from GitHub |
| Flask backend | Railway or Render | Gunicorn + gevent |
| Celery workers | Railway or Render | Separate process, same codebase |
| PostgreSQL | Supabase or AWS RDS | Managed PostgreSQL 15 |
| Redis | Upstash | Managed Redis |
| Smart contracts | Mantle Network | Deployed via Hardhat |

> **NOT AWS Lambda.** Flask-SocketIO requires a persistent process (gevent), which is incompatible with serverless Lambda. Use Railway or Render for always-on Flask hosting.

---

## 7. Monitoring and Analytics

- **Prometheus + Grafana**: System metrics, agent performance, trade volume
- **Sentry**: Error tracking (Flask + Next.js)
- **GitHub Actions**: CI/CD pipeline (lint → test → deploy)

---

## 8. Testing

| Layer | Framework | Command |
|-------|----------|---------|
| Backend | **pytest** + pytest-flask | `pytest tests/ -v --cov=app` |
| Frontend | Jest + React Testing Library | `npm test` |
| Smart contracts | Hardhat built-in | `npx hardhat test` |

> Backend testing uses **pytest** — NOT Mocha or Chai. Those are JavaScript-only test frameworks.

---

## Key Judging Criteria Alignment

| Criterion | Weight | MantleMandate Approach |
|-----------|--------|----------------------|
| Technical Depth | 30% | Flask AI layer + Celery + Mantle contracts working end-to-end |
| Innovation | 25% | Plain-English mandate parsing → on-chain policy hash → autonomous AI agent |
| Mantle Ecosystem Contribution | 25% | MandatePolicy.sol + AgentExecutor.sol + 3 DeFi protocol integrations |
| Product Completeness | 20% | All 15 screens implemented, real-time alerts, exportable reports |

---

## Final Recommendations

1. **On-Chain Transparency**: Every trade executed by an AI agent is recorded via `AgentExecutor.sol`. Users can verify any action on Mantle Explorer.
2. **Non-Custodial**: MantleMandate never holds user funds. All trading execution is user-authorized through their connected wallet.
3. **Honest Demo Data**: Use real data from Mantle testnet. Small real numbers are infinitely more credible than large fake numbers.
4. **User-Focused Design**: Follow `uiux-v2/` specifications exactly — clean dark theme, clear metric hierarchy, actionable alerts.
5. **Open Source**: Push to a public GitHub repo with a detailed README including deployed contract addresses and setup instructions.
