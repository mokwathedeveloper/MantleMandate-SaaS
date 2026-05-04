# MantleMandate — Master Architecture & Tech Stack
## Turing Test Hackathon 2026 | Authoritative Reference Document
### Stack: Flask (Python) · Next.js 14 (TypeScript) · PostgreSQL · Mantle Network

> **This is the single source of truth.** All other architecture/roadmap docs defer to this file.
> If any other doc contradicts this one, this one is correct.

---

## 1. CONFIRMED TECH STACK

### Frontend
| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Framework | **Next.js** | 14 (App Router) | SSR, file-based routing, API routes, Vercel deploy |
| Language | **TypeScript** | 5.x | Type safety across all components, hooks, API calls |
| Styling | **Tailwind CSS** | 3.x | Utility-first, consistent dark theme system |
| Blockchain | **Ethers.js** | v6 | Wallet connection, Mantle Network RPC, contract calls |
| Wallet | **wagmi + viem** | latest | React hooks for wallet state, WalletConnect, MetaMask |
| State | **Zustand** | latest | Lightweight global state (user session, agent status) |
| Data fetching | **TanStack Query** | v5 | Server state, caching, real-time polling |
| Forms | **React Hook Form + Zod** | latest | Type-safe form validation |
| Charts | **Recharts** | latest | Portfolio performance charts, sparklines |
| WebSocket | **native WebSocket / socket.io-client** | — | Real-time alerts from Flask backend |
| HTTP client | **Axios** | latest | Typed API calls to Flask backend |
| Testing | **Jest + React Testing Library + Cypress** | — | Unit + E2E |

### Backend
| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Framework | **Flask** | 3.x | Lightweight Python REST API; same language as AI models |
| Language | **Python** | 3.11+ | AI/ML ecosystem; Flask native |
| Authentication | **Flask-JWT-Extended** | latest | JWT access + refresh tokens |
| Password hashing | **bcrypt (Python)** | latest | `flask-bcrypt` wrapper |
| ORM | **SQLAlchemy** | 2.x | Python-native ORM for PostgreSQL |
| Migrations | **Flask-Migrate (Alembic)** | latest | Schema versioning, migration scripts |
| Database driver | **psycopg2-binary** | latest | PostgreSQL adapter for Python |
| CORS | **Flask-CORS** | latest | Allow Next.js frontend to call Flask API |
| WebSocket | **Flask-SocketIO** | latest | Real-time alerts push to frontend |
| Rate limiting | **Flask-Limiter** | latest | Protect API endpoints |
| Validation | **marshmallow** | latest | Request/response schema validation |
| Environment | **python-dotenv** | latest | `.env` file management |
| Testing | **pytest + pytest-flask** | latest | Unit and integration tests |
| Task queue | **Celery + Redis** | latest | Async AI agent execution, background jobs |

### AI Layer (within Flask backend or separate service)
| Technology | Use |
|-----------|-----|
| Python 3.11+ | Core language |
| TensorFlow / PyTorch | Deep learning trading models |
| Scikit-learn | Classical ML for risk scoring |
| pandas + numpy | Data manipulation |
| Bybit Python SDK | Read-only market data feed |
| Flask API endpoints | Expose model predictions to rest of backend |

### Blockchain
| Technology | Use |
|-----------|-----|
| Mantle Network | L2 blockchain for all on-chain execution |
| Solidity 0.8.x | Smart contracts |
| Hardhat | Compile, test, deploy contracts |
| Ethers.js v6 | Frontend ↔ contract interaction |
| web3.py | Python backend ↔ contract interaction |
| OpenZeppelin | Audited contract libraries |

### Database
| Technology | Use |
|-----------|-----|
| PostgreSQL 15 | Primary relational database |
| Redis | Session cache, Celery broker, real-time data |

### Infrastructure
| Technology | Use |
|-----------|-----|
| Vercel | Next.js frontend hosting |
| Railway / Render / AWS EC2 | Flask backend hosting |
| AWS RDS / Supabase | Managed PostgreSQL |
| AWS S3 | Report exports, model artifacts |
| GitHub Actions | CI/CD pipeline |

---

## 2. SYSTEM ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                     │
│                    Next.js 14 (TypeScript)                               │
│              Vercel CDN · App Router · Tailwind CSS                      │
│         wagmi/viem (wallet) · Ethers.js · TanStack Query                 │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │ HTTPS REST + WebSocket
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      FLASK BACKEND (Python)                              │
│                                                                          │
│  Auth        Mandates      Agents       Reports      API/WebSocket       │
│  Blueprint   Blueprint     Blueprint    Blueprint    Blueprint           │
│                                                                          │
│  Flask-JWT   SQLAlchemy    Celery       Flask-       Flask-SocketIO      │
│  Extended    + Alembic     Workers      Migrate                          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     AI Service Layer                             │    │
│  │  mandate_parser.py · trading_model.py · risk_engine.py          │    │
│  │  anomaly_detection.py · bybit_feed.py                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  web3.py ──────────────────────────────────────────────────────────────►│
└──────────────────┬───────────────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐   ┌──────────────────────────────────────┐
│  PostgreSQL   │   │         Mantle Network (L2)           │
│  (Primary DB) │   │  Smart Contracts (Solidity)           │
│               │   │  MandatePolicy.sol                    │
│  + Redis      │   │  AgentExecutor.sol                    │
│  (Cache/Queue)│   │  RiskGuard.sol                        │
└───────────────┘   └──────────────────────────────────────┘
```

---

## 3. CORRECT FOLDER STRUCTURE

```
MantleMandate/
│
├── frontend/                           # Next.js 14 App Router (TypeScript)
│   ├── app/                            # App Router — every folder = route
│   │   ├── layout.tsx                  # Root layout (fonts, providers, sidebar)
│   │   ├── page.tsx                    # Landing page (/)
│   │   ├── (auth)/                     # Route group — no URL segment
│   │   │   ├── login/page.tsx          # /login
│   │   │   └── signup/page.tsx         # /signup
│   │   ├── onboarding/page.tsx         # /onboarding (4-step wizard)
│   │   ├── dashboard/                  #
│   │   │   ├── layout.tsx              # Dashboard layout (sidebar, top nav)
│   │   │   ├── page.tsx                # /dashboard (main dashboard)
│   │   │   ├── mandates/
│   │   │   │   ├── page.tsx            # /dashboard/mandates (list)
│   │   │   │   ├── new/page.tsx        # /dashboard/mandates/new
│   │   │   │   └── [id]/page.tsx       # /dashboard/mandates/:id (edit)
│   │   │   ├── agents/
│   │   │   │   ├── page.tsx            # /dashboard/agents (monitoring)
│   │   │   │   └── [id]/page.tsx       # /dashboard/agents/:id (detail)
│   │   │   ├── audit/page.tsx          # /dashboard/audit (on-chain audit)
│   │   │   ├── alerts/page.tsx         # /dashboard/alerts
│   │   │   ├── reports/page.tsx        # /dashboard/reports
│   │   │   ├── risk/page.tsx           # /dashboard/risk (risk engine)
│   │   │   ├── protocols/page.tsx      # /dashboard/protocols
│   │   │   ├── api-integration/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   └── support/page.tsx
│   │   └── api/                        # Next.js API routes (thin proxy only)
│   │       └── health/route.ts         # Health check
│   │
│   ├── components/                     # Reusable components
│   │   ├── ui/                         # Base UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Toggle.tsx
│   │   │   └── AlertBanner.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── PortfolioChart.tsx
│   │   │   ├── RecentTradesTable.tsx
│   │   │   └── AlertsPanel.tsx
│   │   ├── mandates/
│   │   │   ├── MandateTextarea.tsx     # The hero plain-English input
│   │   │   ├── MandateSummary.tsx      # Live preview panel
│   │   │   ├── MandateWizard.tsx       # 3-step wizard wrapper
│   │   │   └── RiskSliders.tsx
│   │   ├── agents/
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AgentStatusBadge.tsx
│   │   │   └── AgentSparkline.tsx
│   │   └── blockchain/
│   │       ├── WalletConnect.tsx
│   │       ├── TxHashDisplay.tsx       # Truncated hash with copy + explorer link
│   │       └── OnChainBadge.tsx
│   │
│   ├── lib/                            # Utilities and helpers
│   │   ├── api.ts                      # Axios instance + typed API calls
│   │   ├── auth.ts                     # JWT token management (httpOnly cookies)
│   │   ├── blockchain.ts               # Ethers.js / wagmi helpers
│   │   ├── constants.ts                # API base URL, chain IDs, contract addresses
│   │   └── utils.ts                    # formatCurrency, truncateAddress, etc.
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── useAuth.ts                  # Authentication state
│   │   ├── useMandates.ts              # TanStack Query — mandates CRUD
│   │   ├── useAgents.ts                # TanStack Query — agents
│   │   ├── useAlerts.ts                # WebSocket real-time alerts
│   │   ├── usePortfolio.ts             # Portfolio metrics polling
│   │   └── useWallet.ts                # wagmi wallet state
│   │
│   ├── store/                          # Zustand global state
│   │   ├── authStore.ts                # User session
│   │   ├── alertStore.ts               # Real-time alert queue
│   │   └── uiStore.ts                  # Sidebar collapsed, theme, etc.
│   │
│   ├── types/                          # TypeScript type definitions
│   │   ├── api.ts                      # API response types
│   │   ├── mandate.ts                  # Mandate interfaces
│   │   ├── agent.ts                    # Agent interfaces
│   │   ├── trade.ts                    # Trade/transaction interfaces
│   │   └── user.ts                     # User interfaces
│   │
│   ├── public/                         # Static assets
│   ├── .env.local                      # Frontend env vars (NEXT_PUBLIC_ prefix)
│   ├── next.config.ts                  # Next.js config (TypeScript)
│   ├── tailwind.config.ts              # Tailwind config (TypeScript)
│   ├── tsconfig.json                   # TypeScript config
│   └── package.json
│
├── backend/                            # Flask (Python) REST API
│   ├── app/
│   │   ├── __init__.py                 # Flask app factory
│   │   ├── extensions.py               # db, jwt, migrate, cors, socketio, limiter
│   │   ├── config.py                   # Config classes (Dev, Prod, Test)
│   │   │
│   │   ├── auth/                       # Auth blueprint
│   │   │   ├── __init__.py
│   │   │   ├── routes.py               # POST /api/auth/signup, login, logout, refresh
│   │   │   ├── schemas.py              # marshmallow schemas (request validation)
│   │   │   └── utils.py                # Password hashing helpers
│   │   │
│   │   ├── mandates/                   # Mandates blueprint
│   │   │   ├── __init__.py
│   │   │   ├── routes.py               # CRUD /api/mandates
│   │   │   ├── models.py               # SQLAlchemy Mandate model
│   │   │   ├── schemas.py              # marshmallow schemas
│   │   │   └── parser.py               # Plain-English → structured policy parser
│   │   │
│   │   ├── agents/                     # Agents blueprint
│   │   │   ├── __init__.py
│   │   │   ├── routes.py               # /api/agents CRUD + deploy/pause/stop
│   │   │   ├── models.py               # SQLAlchemy Agent model
│   │   │   ├── schemas.py
│   │   │   └── executor.py             # Celery task: agent execution loop
│   │   │
│   │   ├── trades/                     # Trades/audit blueprint
│   │   │   ├── __init__.py
│   │   │   ├── routes.py               # GET /api/trades, /api/audit
│   │   │   ├── models.py               # Trade, AuditLog models
│   │   │   └── schemas.py
│   │   │
│   │   ├── reports/                    # Reports blueprint
│   │   │   ├── __init__.py
│   │   │   ├── routes.py               # GET /api/reports, POST /api/reports/export
│   │   │   └── generator.py            # CSV/PDF generation
│   │   │
│   │   ├── alerts/                     # Alerts blueprint + SocketIO events
│   │   │   ├── __init__.py
│   │   │   ├── routes.py               # GET /api/alerts
│   │   │   ├── models.py               # Alert model
│   │   │   └── emitter.py              # SocketIO emit helpers
│   │   │
│   │   ├── blockchain/                 # Blockchain interaction
│   │   │   ├── __init__.py
│   │   │   ├── mantle.py               # web3.py connection to Mantle Network
│   │   │   ├── contracts.py            # Contract ABI loading + function calls
│   │   │   └── hashing.py              # Policy hash generation (mandate → hash)
│   │   │
│   │   └── models/                     # Shared SQLAlchemy base models
│   │       ├── user.py                 # User model
│   │       └── base.py                 # Base model with timestamps
│   │
│   ├── ai/                             # AI service layer
│   │   ├── mandate_parser.py           # NLP parsing of plain-English mandates
│   │   ├── trading_model.py            # ML trading strategy execution
│   │   ├── risk_engine.py              # Risk scoring and threshold checks
│   │   ├── anomaly_detection.py        # Market anomaly detection
│   │   └── bybit_feed.py               # Bybit API read-only market data
│   │
│   ├── migrations/                     # Flask-Migrate (Alembic) migration files
│   │   └── versions/
│   │
│   ├── tests/                          # pytest test suite
│   │   ├── conftest.py                 # pytest fixtures (test app, test db, auth token)
│   │   ├── test_auth.py                # Auth endpoint tests
│   │   ├── test_mandates.py            # Mandate CRUD tests
│   │   ├── test_agents.py              # Agent deployment tests
│   │   ├── test_trades.py              # Trade/audit tests
│   │   └── test_blockchain.py          # Blockchain interaction tests
│   │
│   ├── celery_worker.py                # Celery worker entry point
│   ├── run.py                          # Flask dev server entry point
│   ├── requirements.txt                # Python dependencies
│   ├── .env                            # Backend env vars (never commit)
│   └── .env.example                    # Template for .env
│
├── blockchain/                         # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── MandatePolicy.sol           # Policy hash registration + verification
│   │   ├── AgentExecutor.sol           # Agent trade execution + logging
│   │   └── RiskGuard.sol               # On-chain risk limit enforcement
│   ├── scripts/
│   │   └── deploy.ts                   # Hardhat deployment script (TypeScript)
│   ├── test/
│   │   ├── MandatePolicy.test.ts
│   │   ├── AgentExecutor.test.ts
│   │   └── RiskGuard.test.ts
│   ├── hardhat.config.ts               # Hardhat config (Mantle Network)
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── frontend.yml                # Next.js CI (lint, typecheck, test, build)
│       ├── backend.yml                 # Flask CI (pytest, flake8)
│       └── contracts.yml               # Hardhat CI (compile, test)
│
├── docker-compose.yml                  # Local dev: postgres + redis + flask + celery
├── .gitignore
└── README.md
```

---

## 4. FLASK API ENDPOINT REFERENCE

### Authentication — `/api/auth`
| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT access + refresh tokens |
| POST | `/api/auth/logout` | Yes | Invalidate refresh token |
| POST | `/api/auth/refresh` | Refresh token | Get new access token |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Mandates — `/api/mandates`
| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| GET | `/api/mandates` | Yes | List all user mandates |
| POST | `/api/mandates` | Yes | Create new mandate |
| GET | `/api/mandates/<id>` | Yes | Get single mandate |
| PUT | `/api/mandates/<id>` | Yes | Update mandate |
| DELETE | `/api/mandates/<id>` | Yes | Delete mandate |
| POST | `/api/mandates/<id>/parse` | Yes | Parse plain-English → policy |
| GET | `/api/mandates/<id>/hash` | Yes | Get on-chain policy hash |

### Agents — `/api/agents`
| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| GET | `/api/agents` | Yes | List all user agents |
| POST | `/api/agents` | Yes | Create + deploy agent |
| GET | `/api/agents/<id>` | Yes | Get agent detail |
| PUT | `/api/agents/<id>/pause` | Yes | Pause agent |
| PUT | `/api/agents/<id>/resume` | Yes | Resume agent |
| DELETE | `/api/agents/<id>` | Yes | Stop + delete agent |
| GET | `/api/agents/<id>/trades` | Yes | Get agent trade history |
| GET | `/api/agents/<id>/performance` | Yes | Get agent performance metrics |

### Trades & Audit — `/api/trades`, `/api/audit`
| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| GET | `/api/trades` | Yes | List all trades (paginated) |
| GET | `/api/trades/<id>` | Yes | Get single trade |
| GET | `/api/audit` | Yes | Full audit trail |
| GET | `/api/audit/public/<token>` | No | Public audit trail (share link) |

### Reports — `/api/reports`
| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| GET | `/api/reports` | Yes | List reports |
| POST | `/api/reports/generate` | Yes | Generate report |
| GET | `/api/reports/<id>/export` | Yes | Download CSV/PDF |

### Alerts — `/api/alerts`
| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| GET | `/api/alerts` | Yes | List alerts (paginated) |
| PUT | `/api/alerts/<id>/read` | Yes | Mark alert as read |
| PUT | `/api/alerts/read-all` | Yes | Mark all as read |
| DELETE | `/api/alerts/<id>` | Yes | Delete alert |

### Protocols — `/api/protocols`
| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| GET | `/api/protocols` | Yes | List all protocols + status |
| PUT | `/api/protocols/<id>/toggle` | Yes | Enable/disable protocol |
| GET | `/api/protocols/<id>/stats` | Yes | Protocol stats (volume, TVL) |

### Portfolio & Risk — `/api/portfolio`, `/api/risk`
| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| GET | `/api/portfolio/summary` | Yes | NAV, P&L, drawdown summary |
| GET | `/api/portfolio/performance` | Yes | Time-series performance data |
| GET | `/api/risk/settings` | Yes | Current risk settings |
| PUT | `/api/risk/settings` | Yes | Update risk settings |

### User / Billing — `/api/users`, `/api/billing`
| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| PUT | `/api/users/profile` | Yes | Update profile |
| PUT | `/api/users/password` | Yes | Change password |
| GET | `/api/users/wallets` | Yes | List connected wallets |
| POST | `/api/users/wallets` | Yes | Connect wallet |
| DELETE | `/api/users/wallets/<id>` | Yes | Remove wallet |
| GET | `/api/billing/plan` | Yes | Current subscription plan |
| GET | `/api/billing/history` | Yes | Billing history |

### WebSocket Events (Flask-SocketIO)
| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client → Server | Authenticate + join user room |
| `alert:new` | Server → Client | New alert pushed to user |
| `agent:status` | Server → Client | Agent status change |
| `trade:executed` | Server → Client | Trade execution update |
| `portfolio:update` | Server → Client | Portfolio metrics update |

---

## 5. DATABASE SCHEMA (PostgreSQL + SQLAlchemy)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'operator',          -- operator | strategist | institution
    trial_ends_at TIMESTAMP,
    ens_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallets (connected per user)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(42) NOT NULL,                  -- EVM address (checksummed)
    network VARCHAR(50) DEFAULT 'mantle',
    is_primary BOOLEAN DEFAULT FALSE,
    connected_at TIMESTAMP DEFAULT NOW()
);

-- Mandates
CREATE TABLE mandates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mandate_text TEXT NOT NULL,                    -- Plain-English input
    parsed_policy JSONB,                           -- Structured policy (AI-parsed)
    policy_hash VARCHAR(66),                       -- On-chain hash (0x + 64 hex)
    base_currency VARCHAR(10) DEFAULT 'USDC',
    strategy_type VARCHAR(50),
    risk_params JSONB,                             -- max_drawdown, stop_loss, etc.
    capital_cap NUMERIC(20, 2),
    status VARCHAR(20) DEFAULT 'draft',            -- draft | active | paused | archived
    on_chain_tx VARCHAR(66),                       -- TX hash of policy registration
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agents
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mandate_id UUID REFERENCES mandates(id),
    name VARCHAR(255) NOT NULL,                    -- User-defined agent name
    wallet_id UUID REFERENCES wallets(id),
    status VARCHAR(20) DEFAULT 'inactive',         -- active | paused | failed | stopped
    capital_cap NUMERIC(20, 2),
    deployed_at TIMESTAMP,
    last_trade_at TIMESTAMP,
    total_pnl NUMERIC(20, 6) DEFAULT 0,
    total_roi NUMERIC(10, 6) DEFAULT 0,
    total_volume NUMERIC(20, 2) DEFAULT 0,
    drawdown_current NUMERIC(10, 6) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trades
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    user_id UUID REFERENCES users(id),
    mandate_id UUID REFERENCES mandates(id),
    asset_pair VARCHAR(20) NOT NULL,               -- e.g. ETH/USDC
    direction VARCHAR(4) NOT NULL,                 -- buy | sell
    amount_usd NUMERIC(20, 6) NOT NULL,
    price NUMERIC(20, 6) NOT NULL,
    pnl NUMERIC(20, 6),
    protocol VARCHAR(50),                          -- merchant_moe | agni | fluxion
    tx_hash VARCHAR(66),                           -- Mantle Network TX hash
    block_number BIGINT,
    status VARCHAR(20) DEFAULT 'pending',          -- pending | success | failed
    mandate_rule_applied TEXT,                     -- Which rule triggered this trade
    gas_used BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES agents(id),
    trade_id UUID REFERENCES trades(id),
    event_type VARCHAR(50) NOT NULL,               -- trade | mandate_update | agent_deploy
    decision_hash VARCHAR(66),                     -- Hash of AI decision
    tx_hash VARCHAR(66),
    block_number BIGINT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    alert_type VARCHAR(50) NOT NULL,               -- trade_executed | mandate_breach | etc.
    severity VARCHAR(10) DEFAULT 'low',            -- high | medium | low
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,              -- performance | risk | agent | portfolio
    date_from DATE,
    date_to DATE,
    parameters JSONB,
    file_url VARCHAR(500),                         -- S3 URL for generated file
    generated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. TYPESCRIPT TYPE DEFINITIONS (Frontend)

```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'operator' | 'strategist' | 'institution';
  trialEndsAt: string | null;
  ensName: string | null;
  createdAt: string;
}

// types/mandate.ts
export interface Mandate {
  id: string;
  name: string;
  mandateText: string;
  parsedPolicy: ParsedPolicy | null;
  policyHash: string | null;
  baseCurrency: string;
  strategyType: string | null;
  riskParams: RiskParams;
  capitalCap: number | null;
  status: 'draft' | 'active' | 'paused' | 'archived';
  onChainTx: string | null;
  createdAt: string;
}

export interface RiskParams {
  maxDrawdown: number;     // percentage
  maxPosition: number;     // percentage
  stopLoss: number;        // percentage
  maxPositions: number;    // count
  cooldownHours: number;
}

export interface ParsedPolicy {
  asset: string;
  trigger: string;
  riskPerTrade: number;
  takeProfit: number | null;
  schedule: string;
  venue: string | null;
}

// types/agent.ts
export interface Agent {
  id: string;
  mandateId: string;
  mandateName: string;
  name: string;
  status: 'active' | 'paused' | 'failed' | 'stopped' | 'inactive';
  capitalCap: number;
  totalPnl: number;
  totalRoi: number;
  totalVolume: number;
  drawdownCurrent: number;
  deployedAt: string | null;
  lastTradeAt: string | null;
}

// types/trade.ts
export interface Trade {
  id: string;
  agentId: string;
  mandateId: string;
  mandateName: string;
  assetPair: string;
  direction: 'buy' | 'sell';
  amountUsd: number;
  price: number;
  pnl: number | null;
  protocol: string;
  txHash: string | null;
  blockNumber: number | null;
  status: 'pending' | 'success' | 'failed';
  mandateRuleApplied: string | null;
  createdAt: string;
}

// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
```

---

## 7. FLASK PYTHON PATTERNS (Correct for this project)

### Password hashing (Python — NOT JavaScript)
```python
# backend/app/auth/utils.py
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def hash_password(password: str) -> str:
    return bcrypt.generate_password_hash(password).decode('utf-8')

def check_password(password: str, password_hash: str) -> bool:
    return bcrypt.check_password_hash(password_hash, password)
```

### JWT (Python — NOT JavaScript)
```python
# Uses flask-jwt-extended
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

@auth_bp.route('/login', methods=['POST'])
def login():
    # validate credentials...
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify(access_token=access_token, refresh_token=refresh_token), 200

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    return jsonify(user_id=current_user_id), 200
```

### SQLAlchemy Model (Python — NOT SQL from scratch)
```python
# backend/app/models/user.py
from app.extensions import db
import uuid

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    plan = db.Column(db.String(50), default='operator')
    created_at = db.Column(db.DateTime, default=db.func.now())
    mandates = db.relationship('Mandate', backref='user', lazy=True)
```

### Flask Testing (pytest — NOT Mocha/Chai)
```python
# backend/tests/test_auth.py
import pytest

def test_signup_success(client):
    response = client.post('/api/auth/signup', json={
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'SecurePass123'
    })
    assert response.status_code == 201
    assert 'access_token' in response.json

def test_login_invalid_credentials(client):
    response = client.post('/api/auth/login', json={
        'email': 'wrong@example.com',
        'password': 'wrong'
    })
    assert response.status_code == 401
```

---

## 8. NAMING CONVENTIONS

### Python (Flask backend)
- Files: `snake_case.py` (e.g., `mandate_parser.py`, `auth_routes.py`)
- Functions: `snake_case` (e.g., `get_user_mandates`, `deploy_agent`)
- Classes: `PascalCase` (e.g., `User`, `MandateSchema`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET_KEY`, `MAX_DRAWDOWN`)
- SQLAlchemy models: `PascalCase` class, `snake_case` columns

### TypeScript (Next.js frontend)
- Files: `PascalCase.tsx` for components (e.g., `AgentCard.tsx`, `MandateEditor.tsx`)
- Files: `camelCase.ts` for utilities/hooks (e.g., `useAgents.ts`, `api.ts`)
- Components: `PascalCase` (e.g., `AgentCard`, `MandateTextarea`)
- Hooks: `use` prefix + `PascalCase` (e.g., `useAgents`, `useAuth`)
- Types/Interfaces: `PascalCase` (e.g., `Agent`, `Mandate`, `ApiResponse<T>`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `MANTLE_CHAIN_ID`)
- env vars visible to client: `NEXT_PUBLIC_` prefix (e.g., `NEXT_PUBLIC_API_URL`)
- env vars server-only: no prefix (e.g., `JWT_SECRET` — in backend `.env` only)

---

## 9. ENVIRONMENT VARIABLES

### Frontend — `frontend/.env.local` (NEVER commit)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_MANTLE_RPC_URL=https://rpc.mantle.xyz
NEXT_PUBLIC_MANTLE_CHAIN_ID=5000
NEXT_PUBLIC_MANDATE_POLICY_CONTRACT=0x...
NEXT_PUBLIC_AGENT_EXECUTOR_CONTRACT=0x...
```

### Backend — `backend/.env` (NEVER commit)
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
DATABASE_URL=postgresql://user:password@localhost:5432/mantlemandate
REDIS_URL=redis://localhost:6379/0
BYBIT_API_KEY=your-bybit-read-only-key
BYBIT_API_SECRET=your-bybit-secret
MANTLE_RPC_URL=https://rpc.mantle.xyz
MANTLE_PRIVATE_KEY=0x...              # Agent execution wallet private key
MANDATE_POLICY_CONTRACT=0x...
AGENT_EXECUTOR_CONTRACT=0x...
AWS_S3_BUCKET=mantlemandate-reports
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
CORS_ORIGINS=http://localhost:3000,https://mantlemandate.vercel.app
```

---

## 10. TESTING STRATEGY

### Flask Backend (pytest)
```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v --cov=app --cov-report=html
```

Test categories:
- `test_auth.py` — signup, login, token refresh, logout
- `test_mandates.py` — CRUD, parsing, policy hash generation
- `test_agents.py` — deploy, pause, resume, performance metrics
- `test_trades.py` — trade logging, audit trail, pagination
- `test_blockchain.py` — web3.py mocked contract interactions

### Next.js Frontend (Jest + React Testing Library)
```bash
cd frontend
npm run test          # Jest unit tests
npm run test:e2e      # Cypress end-to-end tests
npm run type-check    # tsc --noEmit (TypeScript check)
npm run lint          # ESLint
```

### Smart Contracts (Hardhat)
```bash
cd blockchain
npx hardhat test
npx hardhat coverage
```

---

## 11. DEPENDENCY INSTALL COMMANDS (Correct)

### Flask Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install flask flask-jwt-extended flask-bcrypt flask-sqlalchemy \
            flask-migrate flask-cors flask-socketio flask-limiter \
            psycopg2-binary marshmallow python-dotenv celery redis \
            web3 pandas numpy scikit-learn
pip freeze > requirements.txt
```

### Next.js Frontend
```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false
npm install axios @tanstack/react-query zustand \
            react-hook-form zod @hookform/resolvers \
            recharts wagmi viem @walletconnect/modal \
            socket.io-client lucide-react clsx tailwind-merge
npm install -D @types/node jest @testing-library/react @testing-library/jest-dom \
               cypress eslint-config-next
```

### Blockchain
```bash
cd blockchain
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox \
                       @openzeppelin/contracts
```
