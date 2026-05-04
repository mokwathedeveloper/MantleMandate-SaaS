# Final Architecture — MantleMandate
## Flask · Next.js 14 TypeScript · PostgreSQL · Mantle Network

> For the full reference with code examples, folder structure, DB schema, TypeScript types,
> environment variables, and install commands — see `MASTER_Architecture_and_Stack.md`.

---

## System Architecture Overview

MantleMandate is built as a **modular, layered system**:

```
Browser (Next.js 14 TypeScript)
        ↕ HTTPS REST + WebSocket
Flask REST API (Python)
        ↕ SQLAlchemy ORM
PostgreSQL + Redis
        ↕ web3.py
Mantle Network L2 (Solidity Smart Contracts)
```

### The Four Layers

**1. Frontend — Next.js 14 (TypeScript)**
- App Router (`app/` directory) — NOT the old Pages Router
- All files: `.tsx` for components, `.ts` for utilities/hooks
- Tailwind CSS for styling (dark theme, design tokens from Design System)
- wagmi + viem for wallet connections (MetaMask, WalletConnect)
- Ethers.js v6 for direct contract reads from the browser
- TanStack Query for server state + caching
- Zustand for global client state (auth, alerts, UI)
- React Hook Form + Zod for type-safe form validation
- socket.io-client for real-time WebSocket alerts

**2. Backend — Flask (Python)**
- Flask 3.x with Application Factory + Blueprints
- Flask-JWT-Extended for access + refresh token auth
- flask-bcrypt for password hashing
- SQLAlchemy 2.x ORM with Flask-Migrate (Alembic) for migrations
- Flask-CORS for cross-origin requests from Next.js
- Flask-SocketIO for real-time WebSocket push to frontend
- Flask-Limiter for rate limiting
- marshmallow for request/response validation schemas
- Celery + Redis for background agent execution tasks
- web3.py for Mantle Network contract interaction from Python

**3. AI Layer (inside Flask backend)**
- Python 3.11+: TensorFlow / PyTorch / Scikit-learn
- `ai/mandate_parser.py` — NLP parsing of plain-English mandates
- `ai/trading_model.py` — trading signal generation
- `ai/risk_engine.py` — pre-trade risk validation
- `ai/bybit_feed.py` — read-only Bybit market data ingestion
- Exposed as internal Python functions called by Flask route handlers
- Heavy inference jobs dispatched as Celery tasks (async, non-blocking)

**4. Blockchain — Mantle Network**
- Solidity 0.8.x smart contracts compiled and deployed with Hardhat
- `MandatePolicy.sol` — registers policy hashes on-chain
- `AgentExecutor.sol` — records trade execution on-chain
- `RiskGuard.sol` — enforces hard risk limits on-chain
- Python backend uses `web3.py` to call contracts
- Frontend uses `ethers.js v6` + `wagmi` for wallet-side signing

---

## Data Flow — Creating and Deploying a Mandate

```
1. User writes plain-English mandate in frontend textarea (Next.js)
2. POST /api/mandates → Flask receives mandate_text
3. Flask calls ai/mandate_parser.py → returns parsed_policy dict
4. Flask calls ai/risk_engine.py → validates policy against user's risk settings
5. Flask calls blockchain/hashing.py → generates policy_hash (SHA-256)
6. Flask stores Mandate record in PostgreSQL (SQLAlchemy)
7. Flask calls blockchain/contracts.py → registers policy_hash on Mantle Network (web3.py TX)
8. TX hash stored in mandate.on_chain_tx field
9. Response returned to frontend: mandate object + policy_hash + tx_hash
10. Frontend displays Mandate Summary with on-chain hash + Mantle Explorer link
11. User clicks "Deploy Agent" → POST /api/agents
12. Flask creates Agent record in PostgreSQL
13. Flask dispatches Celery task: run_agent_loop(agent_id)
14. Celery worker starts agent execution loop (runs indefinitely while agent is active)
15. Agent loop: fetch market data → AI signal → risk check → execute trade → log → emit SocketIO alert
16. Frontend receives real-time trade alerts via WebSocket (socket.io-client)
```

---

## API Communication Pattern

**Frontend → Backend:**
```typescript
// frontend/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

**Backend response format (Flask → JSON):**
```python
# Consistent response envelope
return jsonify({
    'data': mandate.to_dict(),
    'message': 'Mandate created successfully'
}), 201

# Error format
return jsonify({
    'error': 'Not found',
    'message': f'Mandate {mandate_id} does not exist'
}), 404
```

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Auth | JWT (Flask-JWT-Extended): 15-min access tokens + 30-day refresh tokens |
| Passwords | bcrypt via flask-bcrypt (cost factor 12) |
| Transport | TLS/HTTPS (Nginx reverse proxy in production) |
| CORS | Flask-CORS: restricted to `NEXT_PUBLIC_API_URL` only |
| Rate limiting | Flask-Limiter: 5 failed logins/min, 100 API calls/min |
| SQL injection | SQLAlchemy ORM — never raw string concatenation in queries |
| Secrets | python-dotenv `.env` — never hardcoded, never committed |
| Private keys | In-memory only from `.env` — never stored in database |
| Input validation | marshmallow schemas on every POST/PUT endpoint |

---

## Deployment Architecture

```
Production environment:

Vercel (CDN)
  └── Next.js 14 frontend (automatic deploy from GitHub main)

Railway / Render
  ├── Flask app (Gunicorn + gevent, 1 worker for SocketIO)
  └── Celery worker (same codebase, different startup command)

Supabase / AWS RDS
  └── PostgreSQL 15

Upstash
  └── Redis (Celery broker + task results)

AWS S3
  └── Exported reports (CSV/PDF)
```

**Gunicorn command for production:**
```bash
gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
         -w 1 -b 0.0.0.0:5000 "app:create_app()"
```

**Celery worker command:**
```bash
celery -A celery_worker.celery worker --loglevel=info
```

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/backend.yml
- Checkout code
- Set up Python 3.11
- Install dependencies (pip install -r requirements.txt)
- Run flake8 linter
- Run pytest with coverage (pytest tests/ --cov=app)
- Deploy to Railway/Render (if main branch, tests pass)

# .github/workflows/frontend.yml
- Checkout code
- Install Node 20 + npm install
- Run TypeScript check (npx tsc --noEmit)
- Run ESLint
- Run Jest tests
- Run next build (check for build errors)
- Deploy to Vercel (automatic via Vercel GitHub integration)

# .github/workflows/contracts.yml
- Install Node + Hardhat
- npx hardhat compile
- npx hardhat test
- Deploy to Mantle Testnet (if main branch)
```
