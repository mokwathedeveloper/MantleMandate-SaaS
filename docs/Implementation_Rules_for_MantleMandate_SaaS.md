# Implementation Rules for MantleMandate

> **Authoritative stack reference: `MASTER_Architecture_and_Stack.md`**
> Backend = Flask (Python) · Frontend = Next.js 14 TypeScript · DB = PostgreSQL · Chain = Mantle Network

---

## General Rules

1. **Full Implementation Only**
   - No partial implementations. Each feature must be fully implemented and tested before moving on.

2. **Code Usability and Modularity**
   - Write reusable, modular code. Components, functions, and modules should be usable across the application without modification.

3. **No Code Duplication**
   - Avoid repetition. Extract shared logic into helper functions, custom hooks (frontend), or utility modules.

4. **Version Control Practices**
   - Commit every change **file by file** using `git add <filename>`.
   - Write clear, descriptive commit messages for each change.
   - After every backend change, run `flask run` or `pytest` to verify no regressions.
   - After every frontend change, run `npm run build` (or `npx tsc --noEmit`) to verify TypeScript compiles.

5. **Strict Naming Conventions**

   | Layer | Convention | Examples |
   |-------|-----------|---------|
   | Python files, functions, variables | `snake_case` | `mandate_id`, `parse_mandate()`, `risk_engine.py` |
   | Python classes | `PascalCase` | `MandateSchema`, `User` |
   | TypeScript variables, functions | `camelCase` | `mandateId`, `fetchMandates()` |
   | TypeScript components | `PascalCase` | `MandateCard`, `AlertBanner` |
   | TypeScript files (components) | `PascalCase.tsx` | `MandateCard.tsx`, `Dashboard.tsx` |
   | TypeScript files (hooks/utils) | `camelCase.ts` | `useAlerts.ts`, `api.ts` |
   | Database column names | `snake_case` | `mandate_id`, `created_at`, `policy_hash` |
   | Environment variables | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `NEXT_PUBLIC_API_URL` |
   | Constants | `UPPER_SNAKE_CASE` | `MAX_RISK_PERCENT`, `MANTLE_RPC_URL` |

6. **Environment Configuration**
   - Use `.env` files for all secrets and configuration (API keys, DB credentials, JWT secrets, RPC URLs).
   - Never hardcode secrets.
   - Frontend environment variables exposed to the browser **must** have the `NEXT_PUBLIC_` prefix.
   - Backend secrets (private keys, DB passwords) must **never** have the `NEXT_PUBLIC_` prefix.

7. **Database Migrations — Flask-Migrate Only**
   - Never write raw `CREATE TABLE` or `ALTER TABLE` SQL by hand.
   - Always define or update SQLAlchemy models first, then generate migrations:
     ```bash
     flask db migrate -m "describe the change"
     flask db upgrade
     ```
   - Never alter the database schema directly. All changes go through Flask-Migrate (Alembic).

---

## Frontend Implementation Rules (Next.js 14 TypeScript)

1. **App Router — NOT Pages Router**
   - All pages live in `frontend/app/` using the Next.js 14 App Router.
   - Route files: `page.tsx`, layout files: `layout.tsx`.
   - Do **not** create a `pages/` directory. Do **not** use `getServerSideProps` or `getStaticProps`.

2. **TypeScript Strictly Required**
   - Every file is `.tsx` (components) or `.ts` (hooks, utilities, types).
   - No `.js` or `.jsx` files in the frontend.
   - Run `npx tsc --noEmit` after every change — zero TypeScript errors before committing.

3. **UI/UX Consistency**
   - Follow the `uiux-v2/` design specifications exactly.
   - All pages must be responsive (mobile + desktop).
   - Use Tailwind CSS exclusively for styling (no inline style objects, no CSS modules unless unavoidable).

4. **Component Reusability**
   - Reusable UI elements go in `frontend/components/ui/`.
   - Feature-specific components go in `frontend/components/<feature>/`.

5. **State Management — Zustand (not Redux, not Context API)**
   - Global client state (auth, alerts, UI): **Zustand** stores in `frontend/store/`.
   - Server state (API data, caching): **TanStack Query** (`useQuery`, `useMutation`).
   - Do **not** use Redux or React Context API for global state.

6. **Forms — React Hook Form + Zod**
   - All user input forms use **React Hook Form** with **Zod** validation schemas.
   - Never use uncontrolled inputs without validation.

7. **API Communication — Axios**
   - All backend API calls go through the shared `frontend/lib/api.ts` Axios instance.
   - The Axios interceptor attaches the JWT `Authorization: Bearer <token>` header to every request.
   - Never use raw `fetch()` for authenticated requests.

8. **Wallet Integration — wagmi + viem**
   - Wallet connections (MetaMask, WalletConnect) use **wagmi** hooks.
   - Direct on-chain reads from the browser use **Ethers.js v6**.
   - Do **not** use Web3.js on the frontend.

9. **Real-Time — socket.io-client**
   - Subscribe to WebSocket alerts using the `useAlerts` custom hook (`frontend/hooks/useAlerts.ts`).
   - Socket connects to Flask-SocketIO server using the JWT token for authentication.

---

## Backend Implementation Rules (Flask Python)

1. **Flask Application Factory + Blueprints**
   - The app is created via `create_app()` in `backend/app/__init__.py`.
   - Each domain is a Blueprint: `auth_bp`, `mandates_bp`, `agents_bp`, `trades_bp`, `alerts_bp`, `reports_bp`.
   - Never put route handlers in `run.py` or `celery_worker.py`.

2. **Authentication — Flask-JWT-Extended**
   - Use `@jwt_required()` decorator on all protected routes.
   - Access tokens expire in 15 minutes; refresh tokens expire in 30 days.
   - Refresh tokens stored in httpOnly cookies; access tokens stored in `localStorage` on the client.
   - Never use JavaScript `jsonwebtoken` — this is a Python project.

3. **Password Hashing — flask-bcrypt**
   - Hash passwords with `bcrypt.generate_password_hash(password).decode('utf-8')`.
   - Verify with `bcrypt.check_password_hash(hash, password)`.
   - Never use md5, sha1, or plain sha256 for password storage.

4. **Database — SQLAlchemy 2.x ORM**
   - All database access goes through SQLAlchemy models — never raw SQL string concatenation.
   - UUID primary keys: `db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)`.
   - Define relationships explicitly in models.

5. **Input Validation — marshmallow**
   - Every POST/PUT route validates the request body with a marshmallow Schema before touching the database.
   - Return `422 Unprocessable Entity` with the validation error messages on schema failure.

6. **Consistent Response Format**
   ```python
   # Success
   return jsonify({'data': result, 'message': 'Action completed'}), 200

   # Error
   return jsonify({'error': 'Not found', 'message': 'Mandate does not exist'}), 404
   ```

7. **Background Jobs — Celery + Redis**
   - Long-running tasks (AI agent execution loops, report generation) run as Celery tasks via `@shared_task`.
   - The Celery broker is Redis (configured via `CELERY_BROKER_URL` in `.env`).
   - Never run blocking agent loops inside Flask route handlers.

8. **Rate Limiting — Flask-Limiter**
   - Apply rate limits on auth routes: 5 login attempts per minute.
   - Apply general limits: 100 API requests per minute per user.

9. **Real-Time — Flask-SocketIO**
   - Emit events to specific users via `socketio.emit('event', data, room=f'user_{user_id}')`.
   - Use gevent or eventlet as the async worker (required for WebSocket support).

10. **Blockchain — web3.py**
    - All contract calls from the backend use `web3.py`.
    - Private keys are loaded from `.env` only — never stored in the database.
    - Do **not** use Web3.js, ethers.js, or any Node.js library in the backend.

---

## Blockchain and Smart Contract Rules

1. **Smart Contracts — Solidity 0.8.x + Hardhat**
   - Write contracts in `blockchain/contracts/*.sol`.
   - Compile and test exclusively with **Hardhat** — not Truffle.
   - Test files: `blockchain/test/*.test.js` (Hardhat uses JavaScript/TypeScript for test scripts).

2. **Contracts**
   - `MandatePolicy.sol` — registers policy hashes on-chain.
   - `AgentExecutor.sol` — records trade execution on-chain.
   - `RiskGuard.sol` — enforces hard risk limits on-chain.

3. **Backend ↔ Contract Interaction**
   - Python backend calls contracts via `web3.py`.
   - Frontend reads contract state via `ethers.js v6` + `wagmi`.
   - Frontend wallet-signing (user-initiated transactions) uses wagmi's `useContractWrite`.

4. **Deploy to Mantle Testnet First**
   - Always test on Mantle Sepolia testnet before mainnet.
   - Store deployed contract addresses in `.env` (not hardcoded in source).

---

## AI Integration Rules

1. **AI Layer is Part of the Flask Backend**
   - AI modules live in `backend/ai/`: `mandate_parser.py`, `trading_model.py`, `risk_engine.py`, `bybit_feed.py`.
   - They are called as Python functions from Flask route handlers and Celery tasks.
   - The AI layer is **not** a separate microservice — it is part of the Flask application.

2. **Heavy AI Jobs Run in Celery**
   - Model inference that takes > 1 second must run in a Celery task (not in the request-response cycle).
   - Use `@shared_task(bind=True)` and dispatch with `.delay(agent_id)` or `.apply_async()`.

3. **Model Versioning**
   - Maintain version tags for AI models. New model versions should not break existing agent behavior.

---

## QA and Testing Rules

1. **Backend Testing — pytest (NOT Mocha/Chai)**
   - All backend tests use **pytest** and **pytest-flask**.
   - Never use Mocha, Chai, or any Node.js test framework for the backend.
   - Run tests: `cd backend && source venv/bin/activate && pytest tests/ -v --cov=app`

2. **Frontend Testing — Jest + React Testing Library**
   - Component tests use **Jest** and **React Testing Library**.
   - Run: `cd frontend && npm test`

3. **Smart Contract Testing — Hardhat**
   - Contract tests use Hardhat's built-in testing with Mocha/Chai (this is appropriate for Solidity only).
   - Run: `cd blockchain && npx hardhat test`

4. **Test Coverage**
   - Critical paths (auth, mandate creation, agent deployment, risk checks) must have tests.
   - Aim for > 80% coverage on backend core modules.

5. **Continuous Integration — GitHub Actions**
   - `.github/workflows/backend.yml`: lint (flake8) → pytest → deploy if main branch.
   - `.github/workflows/frontend.yml`: TypeScript check → ESLint → Jest → build → Vercel deploy.
   - `.github/workflows/contracts.yml`: Hardhat compile → test → deploy to testnet.

---

## Deployment Rules

| Component | Platform | Command |
|-----------|---------|---------|
| Frontend (Next.js) | Vercel | Automatic via GitHub integration |
| Backend (Flask) | Railway or Render | `gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 -b 0.0.0.0:5000 "app:create_app()"` |
| Celery worker | Railway or Render (separate process) | `celery -A celery_worker.celery worker --loglevel=info` |
| PostgreSQL | Supabase or AWS RDS | Managed PostgreSQL 15 |
| Redis | Upstash | Managed Redis |
| Smart contracts | Mantle Network | Hardhat deploy scripts |

- **Backend deployment**: Railway/Render — NOT Heroku, NOT AWS Lambda.
- **Flask requires a single Gunicorn worker with gevent** for Flask-SocketIO WebSocket support.
- Never deploy Flask behind a multi-worker Gunicorn setup without verifying SocketIO compatibility.

---

## Conclusion

MantleMandate is built with:
- **Flask (Python)** as the primary backend — not Node.js, not Express.js
- **Next.js 14 TypeScript** as the frontend — App Router, `.tsx`/`.ts` files only
- **pytest** for backend testing — not Mocha/Chai
- **Hardhat** for smart contracts — not Truffle
- **Zustand + TanStack Query** for frontend state — not Redux or Context API
- **Flask-Migrate (Alembic)** for all database schema changes — not raw SQL

Following these rules ensures the platform is implemented correctly from the documentation the first time.
