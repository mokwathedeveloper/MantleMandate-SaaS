# Full-Stack Implementation Roadmap — MantleMandate

> **Stack: Flask (Python) · Next.js 14 TypeScript · PostgreSQL · Redis · Mantle Network**
> Authoritative reference: `MASTER_Architecture_and_Stack.md`

---

## Phase 1 — Project Setup

### 1.1 Repository Structure

```
MantleMandate-SaaS/
├── backend/          # Flask (Python) application
├── frontend/         # Next.js 14 TypeScript application
├── blockchain/       # Hardhat + Solidity smart contracts
└── docs/             # Documentation
```

### 1.2 Backend Setup (Flask / Python)

```bash
# Create Python virtual environment
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install all dependencies
pip install flask flask-jwt-extended flask-bcrypt flask-sqlalchemy \
  flask-migrate flask-cors flask-socketio flask-limiter marshmallow \
  celery redis python-dotenv web3 psycopg2-binary gunicorn gevent \
  gevent-websocket pytest pytest-flask pytest-cov

pip freeze > requirements.txt
```

Key backend files to create first:
- `backend/app/__init__.py` — `create_app()` factory
- `backend/app/extensions.py` — db, jwt, bcrypt, socketio, migrate, cors, limiter
- `backend/app/config.py` — DevelopmentConfig, ProductionConfig, TestingConfig
- `backend/.env` — DATABASE_URL, JWT_SECRET_KEY, REDIS_URL, MANTLE_RPC_URL

### 1.3 Frontend Setup (Next.js 14 TypeScript)

```bash
# Create Next.js 14 app with TypeScript and Tailwind CSS
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Install additional dependencies
npm install axios zustand @tanstack/react-query react-hook-form zod \
  wagmi viem ethers socket.io-client recharts lucide-react
```

Key frontend files to create first:
- `frontend/app/layout.tsx` — root layout with providers
- `frontend/lib/api.ts` — Axios instance with JWT interceptor
- `frontend/store/authStore.ts` — Zustand auth store
- `frontend/.env.local` — NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL

### 1.4 Smart Contracts Setup (Hardhat)

```bash
cd blockchain
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npx hardhat init   # Select "TypeScript project"
```

---

## Phase 2 — Backend Implementation

### 2.1 Application Factory + Blueprints

Create `backend/app/__init__.py`:
```python
from flask import Flask
from app.extensions import db, jwt, bcrypt, migrate, cors, socketio, limiter

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    socketio.init_app(app)
    limiter.init_app(app)

    from app.auth.routes import auth_bp
    from app.mandates.routes import mandates_bp
    from app.agents.routes import agents_bp
    from app.trades.routes import trades_bp
    from app.alerts.routes import alerts_bp
    from app.reports.routes import reports_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(mandates_bp)
    app.register_blueprint(agents_bp)
    app.register_blueprint(trades_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(reports_bp)

    return app
```

### 2.2 Database Models (SQLAlchemy)

Define all models in `backend/app/models/`:
- `user.py` — User model (UUID pk, email, password_hash, plan, wallets relationship)
- `mandate.py` — Mandate model (UUID pk, user_id FK, mandate_text, policy_hash, on_chain_tx, status)
- `agent.py` — Agent model (UUID pk, mandate_id FK, name, status, celery_task_id)
- `trade.py` — Trade model (UUID pk, agent_id FK, asset, side, amount, price, on_chain_tx)
- `alert.py` — Alert model (UUID pk, user_id FK, type, severity, message, is_read)
- `report.py` — Report model (UUID pk, user_id FK, name, date_range, file_url)

After defining all models, initialize the database:
```bash
cd backend
flask db init
flask db migrate -m "initial schema"
flask db upgrade
```

### 2.3 Authentication Endpoints

Implement in `backend/app/auth/routes.py`:

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/signup` | Register new user → returns access_token + refresh_token |
| POST | `/api/auth/login` | Login → returns access_token + refresh_token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| POST | `/api/auth/refresh` | Refresh access token using refresh token |
| GET | `/api/auth/me` | Get authenticated user profile |

Password: `bcrypt.generate_password_hash(password)` — never MD5 or SHA.
JWT: `create_access_token(identity=str(user.id))` — never raw `jwt.encode()`.

### 2.4 Core API Endpoints

Implement all routes using the `@jwt_required()` decorator:

```
Mandates:   GET/POST /api/mandates
            GET/PUT/DELETE /api/mandates/<id>
            POST /api/mandates/<id>/parse
            GET  /api/mandates/<id>/hash

Agents:     GET/POST /api/agents
            GET/PUT/DELETE /api/agents/<id>
            POST /api/agents/<id>/pause
            POST /api/agents/<id>/resume

Trades:     GET /api/trades
            GET /api/agents/<id>/trades

Alerts:     GET /api/alerts
            PUT /api/alerts/<id>/read
            PUT /api/alerts/read-all

Reports:    GET /api/reports
            POST /api/reports
            GET /api/reports/<id>/download
```

### 2.5 AI Layer (inside backend/ai/)

Implement as Python functions called from Flask routes:
- `ai/mandate_parser.py` — NLP parsing of plain-English mandate text → structured policy dict
- `ai/trading_model.py` — trading signal generation from market data
- `ai/risk_engine.py` — pre-trade risk validation against mandate policy
- `ai/bybit_feed.py` — read-only Bybit market data ingestion

### 2.6 Celery Agent Execution Loop

Implement in `backend/app/agents/executor.py`:
```python
@shared_task(bind=True, max_retries=3)
def run_agent_loop(self, agent_id: str):
    # 1. Fetch market data (bybit_feed.py)
    # 2. Get AI trading signal (trading_model.py)
    # 3. Risk check (risk_engine.py)
    # 4. Execute trade on Mantle via web3.py
    # 5. Log trade to PostgreSQL
    # 6. Emit SocketIO alert to user
    # 7. Schedule next iteration or loop
```

### 2.7 Flask-SocketIO Real-Time Events

Implement emit helpers in `backend/app/alerts/emitter.py`:
- `emit_trade_executed(user_id, trade_dict)` → `trade:executed`
- `emit_agent_status(user_id, agent_id, status)` → `agent:status`
- `emit_alert(user_id, alert_dict)` → `alert:new`

### 2.8 Blockchain Integration (web3.py)

Implement in `backend/app/blockchain/`:
- `mantle.py` — Web3 connection to Mantle RPC, contract loading
- `contracts.py` — `register_policy_on_chain()`, `record_trade_on_chain()`
- `hashing.py` — `generate_policy_hash(policy_dict)` → SHA-256 hex string

---

## Phase 3 — Frontend Implementation

### 3.1 App Directory Structure

```
frontend/app/
├── layout.tsx               # Root layout (providers, fonts)
├── page.tsx                 # Landing page
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
└── (app)/
    ├── layout.tsx           # App layout (sidebar, auth guard)
    ├── onboarding/page.tsx
    ├── dashboard/page.tsx
    ├── mandates/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── agents/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── audit/page.tsx
    ├── alerts/page.tsx
    ├── reports/page.tsx
    ├── risk/page.tsx
    ├── protocols/page.tsx
    ├── api-keys/page.tsx
    ├── settings/page.tsx
    └── profile/page.tsx
```

### 3.2 Shared Axios Instance

`frontend/lib/api.ts`:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 3.3 Pages to Implement (in order)

1. **Landing page** (`app/page.tsx`) — Nav, Hero, Features, Protocols, Pricing, Security, About, CTA
2. **Login** (`app/(auth)/login/page.tsx`) — Split-screen per `uiux-v2/02_Login_Page.md`
3. **Sign Up** (`app/(auth)/signup/page.tsx`) — Per `uiux-v2/03_SignUp_Page.md`
4. **Onboarding wizard** (`app/(app)/onboarding/page.tsx`) — Per `uiux-v2/04_Onboarding_Flow.md`
5. **Dashboard** (`app/(app)/dashboard/page.tsx`) — Per `uiux-v2/05_Dashboard.md`
6. **Mandate Editor** (`app/(app)/mandates/page.tsx`) — Per `uiux-v2/06_Mandate_Editor.md`
7. **Agent Monitoring** (`app/(app)/agents/page.tsx`) — Per `uiux-v2/07_Agent_Monitoring.md`
8. **On-Chain Audit** (`app/(app)/audit/page.tsx`) — Per `uiux-v2/08_OnChain_Audit_Viewer.md`
9. **Real-Time Alerts** (`app/(app)/alerts/page.tsx`) — Per `uiux-v2/09_Real_Time_Alerts.md`
10. **Reports** (`app/(app)/reports/page.tsx`) — Per `uiux-v2/10_Reports_Exporting.md`
11. **Risk Engine** (`app/(app)/risk/page.tsx`) — Per `uiux-v2/11_Risk_Engine.md`
12. **Multi-Protocol** (`app/(app)/protocols/page.tsx`) — Per `uiux-v2/12_Multi_Protocol.md`
13. **API Integration** (`app/(app)/api-keys/page.tsx`) — Per `uiux-v2/13_API_Integration.md`
14. **Settings** (`app/(app)/settings/page.tsx`) — Per `uiux-v2/19_Settings_Page.md`
15. **Profile** (`app/(app)/profile/page.tsx`) — Per `uiux-v2/18_User_Profile.md`

### 3.4 Real-Time WebSocket

Implement `frontend/hooks/useAlerts.ts`:
```typescript
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAlertStore } from '@/store/alertStore';

export function useAlerts(token: string) {
  const addAlert = useAlertStore((s) => s.addAlert);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, { auth: { token } });
    socket.on('alert:new', (alert) => addAlert(alert));
    socket.on('trade:executed', (trade) => addAlert({ ...trade, type: 'TRADE_EXECUTED' }));
    socket.on('agent:status', (data) => { /* update agent store */ });
    return () => { socket.disconnect(); };
  }, [token]);
}
```

---

## Phase 4 — Smart Contracts (Hardhat)

### 4.1 Contract Files

```
blockchain/contracts/
├── MandatePolicy.sol    # registerPolicy(bytes32 policyHash, address owner)
├── AgentExecutor.sol    # recordExecution(bytes32 policyHash, TradeData calldata trade)
└── RiskGuard.sol        # enforceRiskLimit(bytes32 policyHash, uint256 drawdownBps)
```

### 4.2 Test and Deploy

```bash
cd blockchain

# Compile
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Mantle testnet
npx hardhat run scripts/deploy.ts --network mantleTestnet

# Deploy to Mantle mainnet (after thorough testing only)
npx hardhat run scripts/deploy.ts --network mantle
```

Configure Mantle networks in `hardhat.config.ts`:
```typescript
networks: {
  mantleTestnet: {
    url: "https://rpc.sepolia.mantle.xyz",
    chainId: 5003,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
  },
  mantle: {
    url: "https://rpc.mantle.xyz",
    chainId: 5000,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
  }
}
```

---

## Phase 5 — Testing

### 5.1 Backend Tests (pytest)

```bash
cd backend
source venv/bin/activate
pytest tests/ -v --cov=app
```

Required test files:
- `tests/conftest.py` — app fixture, db fixture, auth_token fixture
- `tests/test_auth.py` — signup, login, refresh, unauthorized access
- `tests/test_mandates.py` — CRUD, parse, hash generation
- `tests/test_agents.py` — deploy, pause, resume
- `tests/test_trades.py` — trade log retrieval

### 5.2 Frontend Tests (Jest)

```bash
cd frontend
npm test
```

Test critical components:
- `MandateEditor.test.tsx` — form validation, submission
- `AlertBanner.test.tsx` — renders correct severity styles
- `AgentCard.test.tsx` — status display, pause/resume buttons

### 5.3 Smart Contract Tests (Hardhat)

```bash
cd blockchain
npx hardhat test
```

---

## Phase 6 — Deployment

### 6.1 Frontend → Vercel

Connect the GitHub repository to Vercel. Automatic deployment triggers on every push to `main`.

Environment variables to set in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
```

### 6.2 Backend → Railway or Render

Startup command:
```bash
gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
         -w 1 -b 0.0.0.0:5000 "app:create_app()"
```

Celery worker (separate process on same service):
```bash
celery -A celery_worker.celery worker --loglevel=info
```

Environment variables to set:
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET_KEY=...
MANTLE_RPC_URL=https://rpc.mantle.xyz
BYBIT_API_KEY=...
BYBIT_API_SECRET=...
```

### 6.3 Database → Supabase or AWS RDS

Use PostgreSQL 15. After deployment, run:
```bash
flask db upgrade
```

---

## Submission Checklist

- [ ] All 15 frontend pages implemented and responsive
- [ ] All Flask API endpoints implemented and protected with `@jwt_required()`
- [ ] Flask-SocketIO real-time alerts working
- [ ] Celery agent loop running and emitting trade events
- [ ] Smart contracts deployed on Mantle testnet
- [ ] On-chain policy hashes registered for at least one demo mandate
- [ ] pytest suite passing with > 80% backend coverage
- [ ] TypeScript: `npx tsc --noEmit` returns zero errors
- [ ] `npm run build` completes without errors
- [ ] README.md with setup instructions
- [ ] Environment variables documented (never committed to git)
- [ ] Demo video recorded (2–3 minutes)
- [ ] GitHub repository link ready for submission
