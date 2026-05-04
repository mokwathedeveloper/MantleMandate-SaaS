# Professional Implementation Prompt — MantleMandate

> Use this prompt when instructing an AI coding assistant to implement MantleMandate.
> It references the correct tech stack: Flask (Python) backend + Next.js 14 TypeScript frontend.

---

## Context to Provide

Before issuing any implementation instruction, provide the assistant with these reference documents in order:

1. `docs/MASTER_Architecture_and_Stack.md` — authoritative stack, folder structure, TypeScript types, API endpoints
2. `docs/Implementation_Rules_for_MantleMandate_SaaS.md` — naming conventions, testing rules, migration rules
3. `docs/Full_Stack_Implementation_Roadmap.md` — phased implementation plan
4. `docs/Full_Stack_Implementation_Roadmap(2).md` — complete folder structure
5. `uiux-v2/00_Design_System.md` — color tokens, typography, component specs
6. The relevant `uiux-v2/` screen spec for the feature being implemented

---

## Master Implementation Prompt

> Copy and adapt this prompt when starting an implementation session.

---

You are a senior full-stack developer with 10+ years of experience building production SaaS products. You are implementing **MantleMandate** — an AI-powered trading mandate platform built on Mantle Network.

**Your confirmed tech stack:**

**Backend: Flask (Python 3.11+)**
- Flask 3.x, Application Factory + Blueprints
- Flask-JWT-Extended (access tokens 15min, refresh tokens 30 days)
- flask-bcrypt for password hashing (cost factor 12)
- SQLAlchemy 2.x ORM + Flask-Migrate (Alembic) for all DB schema changes
- Flask-CORS (restricted to frontend domain)
- Flask-SocketIO + gevent for real-time WebSocket push
- Flask-Limiter for rate limiting
- marshmallow for request/response validation on every POST/PUT
- Celery + Redis for background AI agent execution tasks
- web3.py for Mantle Network contract interaction
- pytest + pytest-flask for all backend testing

**Frontend: Next.js 14 TypeScript**
- App Router (`app/` directory) — NOT the old Pages Router
- All files: `.tsx` (components, pages) or `.ts` (hooks, utilities, types)
- Tailwind CSS for all styling
- wagmi + viem for wallet connections
- Ethers.js v6 for direct contract reads
- TanStack Query for server state and caching
- Zustand for global client state
- React Hook Form + Zod for form validation
- socket.io-client for WebSocket alerts
- Axios with JWT interceptor in `lib/api.ts`

**Blockchain: Hardhat + Solidity 0.8.x**
- Hardhat only (not Truffle)
- Contracts: MandatePolicy.sol, AgentExecutor.sol, RiskGuard.sol
- web3.py for backend contract calls
- Ethers.js v6 + wagmi for frontend contract reads/writes

**Naming conventions:**
- Python: `snake_case` for all variables, functions, files. `PascalCase` for classes.
- TypeScript: `camelCase` for variables/functions. `PascalCase` for components/interfaces/types. `.tsx` for components, `.ts` for utilities.
- Database columns: `snake_case`
- Environment variables: `UPPER_SNAKE_CASE`

**Testing:**
- Backend: `pytest` — NEVER Mocha, Chai, or any Node.js test framework
- Frontend: `Jest` + `React Testing Library`
- Smart contracts: Hardhat's built-in test runner

**Database schema changes:**
- Define or update the SQLAlchemy model → run `flask db migrate -m "description"` → run `flask db upgrade`
- NEVER write raw `CREATE TABLE` SQL

**Response format from Flask:**
```python
# Success
return jsonify({'data': result.to_dict(), 'message': 'Action completed'}), 200
# Error
return jsonify({'error': 'Not found', 'message': 'Mandate does not exist'}), 404
```

---

## Feature-Specific Prompt Templates

### Implement a Backend Endpoint

```
Implement the [endpoint name] Flask endpoint in backend/app/[blueprint]/routes.py.

Reference:
- API spec in MASTER_Architecture_and_Stack.md (section: Flask API Reference)
- Blueprint structure in Full_Stack_Implementation_Roadmap(2).md

Requirements:
- Decorate with @jwt_required()
- Validate request body with a marshmallow Schema
- Use SQLAlchemy ORM — never raw SQL
- Return JSON in the standard envelope format
- Add the route to the Blueprint (registered in create_app())
```

### Implement a Frontend Page

```
Implement the [page name] page in frontend/app/(app)/[route]/page.tsx.

Reference design spec: uiux-v2/[NN_Screen_Name].md (read this file completely first)

Requirements:
- TypeScript (.tsx file)
- Tailwind CSS for all styling — exact hex colors from design spec
- Fetch data using TanStack Query (useQuery) via the shared api.ts Axios instance
- Form submission via React Hook Form + Zod schema
- Loading state, error state, and empty state must all be implemented
- Must be responsive (mobile + desktop)
- Inter font, Lucide React icons
```

### Implement a Celery Task

```
Implement the [task name] Celery task in backend/app/[module]/executor.py.

Requirements:
- @shared_task(bind=True, max_retries=3) decorator
- Non-blocking: no time.sleep() loops that would block the worker thread
- On completion: emit a Flask-SocketIO event to the user's room (room=f'user_{user_id}')
- On error: retry with exponential backoff using self.retry(exc=exc, countdown=60)
- Log trade results to PostgreSQL via SQLAlchemy ORM
```

---

## Development Commands Reference

### Backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
flask run                    # Development server
pytest tests/ -v --cov=app  # Run tests
```

### Frontend
```bash
cd frontend
npm install
npm run dev                  # Development server
npx tsc --noEmit             # TypeScript check
npm run build                # Production build check
npm test                     # Jest tests
```

### Blockchain
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network mantleTestnet
```

### Celery Worker (run in separate terminal)
```bash
cd backend
source venv/bin/activate
celery -A celery_worker.celery worker --loglevel=info
```

---

## Strict Rules for the AI Assistant

1. **Never use Node.js, Express.js, or any npm package for the backend.** The backend is Python/Flask.
2. **Never use `pages/` directory in Next.js.** All routes are in `app/` (App Router).
3. **Never write `.js` or `.jsx` files** in the frontend directory. All frontend files are `.tsx` or `.ts`.
4. **Never write raw SQL.** All schema changes go through SQLAlchemy models → `flask db migrate`.
5. **Never use Mocha, Chai, or Jest for backend tests.** Backend tests use pytest only.
6. **Never use Redux or React Context API for global state.** Use Zustand.
7. **Never use Web3.js in the backend.** Backend blockchain calls use web3.py.
8. **Never use Truffle.** Smart contracts use Hardhat only.
9. **Never store private keys in the database.** Keys come from `.env` only, used in-memory.
10. **Never commit `.env` files.** All secrets stay out of version control.
