# MantleMandate — Project Folder Structure

> **Stack: Flask (Python) · Next.js 14 TypeScript · PostgreSQL · Hardhat**
> See `MASTER_Architecture_and_Stack.md` for the authoritative reference.

---

## Complete Folder Structure

```plaintext
MantleMandate-SaaS/
│
├── backend/                          # Flask (Python) backend
│   ├── app/
│   │   ├── __init__.py               # create_app() Application Factory
│   │   ├── extensions.py             # db, jwt, bcrypt, migrate, cors, socketio, limiter
│   │   ├── config.py                 # DevelopmentConfig, ProductionConfig, TestingConfig
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py             # /api/auth/* endpoints (signup, login, refresh, me)
│   │   │   └── schemas.py            # marshmallow: SignupSchema, LoginSchema
│   │   ├── mandates/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py             # /api/mandates/* endpoints
│   │   │   └── schemas.py            # MandateSchema, ParsedPolicySchema
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py             # /api/agents/* endpoints
│   │   │   ├── schemas.py            # AgentSchema
│   │   │   └── executor.py           # Celery task: run_agent_loop()
│   │   ├── trades/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py             # /api/trades/* endpoints
│   │   │   └── schemas.py            # TradeSchema
│   │   ├── alerts/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py             # /api/alerts/* endpoints
│   │   │   ├── schemas.py            # AlertSchema
│   │   │   └── emitter.py            # emit_alert(), emit_trade_executed(), emit_agent_status()
│   │   ├── reports/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py             # /api/reports/* endpoints
│   │   │   └── schemas.py            # ReportSchema
│   │   ├── blockchain/
│   │   │   ├── __init__.py
│   │   │   ├── mantle.py             # get_mantle_connection() via web3.py
│   │   │   ├── contracts.py          # register_policy_on_chain(), record_trade_on_chain()
│   │   │   └── hashing.py            # generate_policy_hash(policy_dict) → SHA-256 hex
│   │   └── models/
│   │       ├── user.py               # User SQLAlchemy model (UUID pk)
│   │       ├── wallet.py             # Wallet model (linked to User)
│   │       ├── mandate.py            # Mandate model (policy_hash, on_chain_tx, status)
│   │       ├── agent.py              # Agent model (celery_task_id, status)
│   │       ├── trade.py              # Trade model (asset, side, amount, on_chain_tx)
│   │       ├── audit_log.py          # AuditLog model (action, tx_hash, block_number)
│   │       ├── alert.py              # Alert model (type, severity, is_read)
│   │       └── report.py             # Report model (file_url, date_range)
│   ├── ai/
│   │   ├── mandate_parser.py         # parse_mandate(text) → policy dict
│   │   ├── trading_model.py          # generate_signal(market_data) → BUY/SELL/HOLD
│   │   ├── risk_engine.py            # validate_trade(policy, signal) → bool
│   │   └── bybit_feed.py             # fetch_market_data(asset) → OHLCV dict
│   ├── migrations/                   # Flask-Migrate (Alembic) — auto-generated, never edit by hand
│   │   └── versions/
│   ├── tests/
│   │   ├── conftest.py               # pytest fixtures: app, client, db, auth_token
│   │   ├── test_auth.py              # Tests: signup, login, refresh, unauthorized
│   │   ├── test_mandates.py          # Tests: CRUD, parse, hash generation
│   │   ├── test_agents.py            # Tests: deploy, pause, resume
│   │   └── test_trades.py            # Tests: trade log retrieval, filters
│   ├── celery_worker.py              # Celery app init: celery = make_celery(create_app())
│   ├── run.py                        # Development entry point: socketio.run(create_app())
│   ├── requirements.txt              # Python dependencies (pip freeze)
│   └── .env                          # DATABASE_URL, JWT_SECRET_KEY, REDIS_URL, etc.
│
├── frontend/                         # Next.js 14 TypeScript frontend
│   ├── app/                          # App Router (NOT pages/)
│   │   ├── layout.tsx                # Root layout (Providers, fonts, metadata)
│   │   ├── page.tsx                  # Landing page (public)
│   │   ├── (auth)/                   # Auth routes group (no sidebar)
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   └── (app)/                    # Protected app routes (with sidebar)
│   │       ├── layout.tsx            # App layout: sidebar + auth guard
│   │       ├── onboarding/
│   │       │   └── page.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── mandates/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── agents/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── audit/
│   │       │   └── page.tsx
│   │       ├── alerts/
│   │       │   └── page.tsx
│   │       ├── reports/
│   │       │   └── page.tsx
│   │       ├── risk/
│   │       │   └── page.tsx
│   │       ├── protocols/
│   │       │   └── page.tsx
│   │       ├── api-keys/
│   │       │   └── page.tsx
│   │       ├── settings/
│   │       │   └── page.tsx
│   │       └── profile/
│   │           └── page.tsx
│   ├── components/
│   │   ├── ui/                       # Generic reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── AlertBanner.tsx
│   │   │   └── Table.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── Providers.tsx         # TanStack Query, wagmi, Zustand
│   │   ├── mandate/
│   │   │   ├── MandateEditor.tsx
│   │   │   ├── MandateCard.tsx
│   │   │   └── PolicySummary.tsx
│   │   ├── agent/
│   │   │   ├── AgentCard.tsx
│   │   │   └── AgentDeployWizard.tsx
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx
│   │   │   ├── PortfolioChart.tsx
│   │   │   └── RecentTradesTable.tsx
│   │   └── alerts/
│   │       ├── AlertBannerController.tsx
│   │       └── AlertListItem.tsx
│   ├── hooks/
│   │   ├── useAlerts.ts              # WebSocket: socket.io-client connection
│   │   ├── useAuth.ts                # Auth state, login/logout helpers
│   │   └── useAgentStatus.ts         # Real-time agent status updates
│   ├── lib/
│   │   ├── api.ts                    # Axios instance with JWT interceptor
│   │   ├── wagmi.ts                  # wagmi config (Mantle chain, connectors)
│   │   └── queryClient.ts            # TanStack Query client config
│   ├── store/
│   │   ├── authStore.ts              # Zustand: user, tokens, login/logout actions
│   │   └── alertStore.ts             # Zustand: alerts array, addAlert, markRead
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript interfaces: User, Mandate, Agent, Trade
│   ├── public/
│   │   └── logo.png
│   ├── .env.local                    # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── blockchain/                       # Hardhat — Solidity smart contracts
│   ├── contracts/
│   │   ├── MandatePolicy.sol         # registerPolicy(bytes32 policyHash, address owner)
│   │   ├── AgentExecutor.sol         # recordExecution(bytes32 policyHash, TradeData calldata)
│   │   └── RiskGuard.sol             # enforceRiskLimit(bytes32 policyHash, uint256 drawdownBps)
│   ├── scripts/
│   │   └── deploy.ts                 # Hardhat deploy script
│   ├── test/
│   │   ├── MandatePolicy.test.ts
│   │   ├── AgentExecutor.test.ts
│   │   └── RiskGuard.test.ts
│   ├── hardhat.config.ts             # Mantle testnet + mainnet network config
│   ├── .env                          # DEPLOYER_PRIVATE_KEY, MANTLE_RPC_URL
│   └── package.json
│
├── docs/                             # Documentation
│   ├── MASTER_Architecture_and_Stack.md   # Authoritative stack reference
│   ├── Backend_Architecture_for_MantleMandate_SaaS.md
│   ├── Final_Architecture_for_MantleMandate_SaaS.md
│   ├── Implementation_Rules_for_MantleMandate_SaaS.md
│   ├── Full_Stack_Implementation_Roadmap.md
│   └── Complete_User_Journey_for_MantleMandate_SaaS.md
│
├── uiux-v2/                          # Design specifications (all screens)
│   ├── README.md
│   ├── 00_Design_System.md
│   ├── 01_Landing_Page.md
│   └── ... (02 through 20)
│
├── .gitignore
└── README.md
```

---

## File Extension Rules

| Directory | Extension | Reason |
|-----------|-----------|--------|
| `backend/**` | `.py` | Python — Flask, SQLAlchemy, Celery |
| `frontend/app/**` | `.tsx` for pages/layouts, `.ts` for config | Next.js App Router TypeScript |
| `frontend/components/**` | `.tsx` | React components |
| `frontend/hooks/**` | `.ts` | Custom hooks (no JSX) |
| `frontend/lib/**` | `.ts` | Utilities, API client |
| `frontend/store/**` | `.ts` | Zustand stores |
| `frontend/types/**` | `.ts` | TypeScript types |
| `blockchain/contracts/**` | `.sol` | Solidity |
| `blockchain/test/**` | `.test.ts` | Hardhat tests |

---

## Key Architecture Notes

**Backend is Flask (Python) — NOT Node.js:**
- `backend/app/__init__.py` → `create_app()` factory
- `backend/app/extensions.py` → one import source for db, jwt, bcrypt, socketio
- `backend/migrations/` → generated by `flask db migrate`, never edited manually

**Frontend uses App Router — NOT Pages Router:**
- All routes are in `frontend/app/` — no `frontend/pages/` directory
- Layouts: `layout.tsx` — wraps child routes
- Pages: `page.tsx` — the rendered route component

**AI is inside the Flask backend — NOT a separate service:**
- `backend/ai/` modules are imported by Flask route handlers and Celery tasks
- No separate Django server, no separate Flask-for-AI server

**Blockchain uses Hardhat — NOT Truffle:**
- No `truffle-config.js` — only `hardhat.config.ts`
- Contract tests: `blockchain/test/*.test.ts`
