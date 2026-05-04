# Complete User Journey — MantleMandate

> **Stack: Flask (Python) backend · Next.js 14 TypeScript frontend · PostgreSQL · Mantle Network**

---

## 1. User Registration

### Step 1: Visit the Landing Page (`app/page.tsx`)

- User arrives at the **MantleMandate** homepage.
- Hero section: "Your AI. Your Rules. On-Chain."
- CTA buttons: "Start for Free →" (sign up) and "Sign In" (login).
- Trust bar, feature highlights, protocol integrations, pricing, security, and about sections below.

### Step 2: Sign-Up Process (`app/(auth)/signup/page.tsx`)

- User clicks "Start for Free →".
- Form fields: **Full name**, **Email**, **Password** (with strength meter), **Confirm password**.
- Checkbox: "I agree to the Terms and Conditions."
- Submit button: "Create Account".

**What happens on the backend (Flask):**
```
POST /api/auth/signup
→ marshmallow SignupSchema validates name, email, password
→ Check if email already registered (User.query.filter_by(email=...).first())
→ bcrypt.generate_password_hash(password)  ← Python flask-bcrypt, NOT Node.js
→ INSERT new User into PostgreSQL via SQLAlchemy
→ create_access_token(identity=str(user.id))
→ create_refresh_token(identity=str(user.id))
→ Return: { access_token, refresh_token, user: {...} }
```

Frontend stores `access_token` in `localStorage` and `refresh_token` in httpOnly cookie (via Flask).

### Step 3: Onboarding Wizard (`app/(app)/onboarding/page.tsx`)

First-time users are redirected to the 4-step onboarding flow (not the dashboard):

- **Step 1:** Connect Wallet — wagmi `useConnect()`, supports MetaMask + WalletConnect
- **Step 2:** Write Your First Mandate — plain-English textarea with 3 example templates
- **Step 3:** Set Risk Limits — max drawdown slider, risk-per-trade slider, stop-loss toggle
- **Step 4:** Deploy Agent — confirmation screen, "Launch Agent" CTA

After completing onboarding → redirect to Dashboard.

---

## 2. User Login

### Step 4: Sign-In Process (`app/(auth)/login/page.tsx`)

- Form: **Email**, **Password**, "Remember me" checkbox, "Forgot password?" link.
- Submit button: "Sign In".

**What happens on the backend (Flask):**
```
POST /api/auth/login
→ marshmallow LoginSchema validates email, password
→ User.query.filter_by(email=data['email']).first()
→ bcrypt.check_password_hash(user.password_hash, data['password'])
→ create_access_token() + create_refresh_token()
→ Return: { access_token, refresh_token, user: {...} }
```

Returning users → redirect to Dashboard.

---

## 3. Dashboard (`app/(app)/dashboard/page.tsx`)

### Step 5: Dashboard Overview

**KPI cards (real-time):**
- Total Portfolio Value
- Today's P&L (+ percentage)
- Active Agents count
- Win Rate (last 30 days)

**Portfolio chart:** 30-day equity curve (Recharts `LineChart`)

**Recent Trades table:** Last 10 trades — asset, side (BUY/SELL), amount, P&L, mandate name, on-chain TX link.

**Active Agents strip:** Status cards for each deployed agent — green (active), yellow (paused), red (error).

**Real-time Alert Banner:** Shown above KPI cards when HIGH severity alert is active. Delivered via Flask-SocketIO → `useAlerts` hook → Zustand `alertStore`.

**Data fetched via TanStack Query:**
```typescript
useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/api/dashboard') })
```

---

## 4. Mandate Creation

### Step 6: Create Mandate (`app/(app)/mandates/page.tsx`)

User clicks "Create Mandate" → Mandate Editor opens.

**Wizard Mode (default for new users):**
- Step 1: What do you want to trade? (asset selection)
- Step 2: When should it trade? (trigger condition in plain English)
- Step 3: Risk limits (pre-filled from profile defaults)
- Step 4: Confirm & Create

**Advanced Mode (toggle):**
- Large textarea (280px height) with placeholder showing example mandate text
- AI parses the text live as the user types (debounced 500ms)
- Parsed policy preview shown below textarea: asset, trigger, risk_per_trade, take_profit, schedule

**What happens on the backend (Flask):**
```
POST /api/mandates
→ @jwt_required()
→ marshmallow MandateSchema validates mandate_text
→ ai/mandate_parser.py: parse_mandate(mandate_text) → policy dict
→ ai/risk_engine.py: validate_policy(policy, user.risk_settings) → pass/fail
→ blockchain/hashing.py: generate_policy_hash(policy) → SHA-256 hex string
→ INSERT Mandate into PostgreSQL (status='pending_chain')
→ blockchain/contracts.py: register_policy_on_chain(policy_hash, wallet_address)
  (web3.py signs and sends TX to MandatePolicy.sol on Mantle Network)
→ UPDATE mandate.on_chain_tx = tx_hash, status='active'
→ Return: { data: mandate, message: 'Mandate created' }
```

Frontend displays: Mandate Summary card with on-chain policy hash + Mantle Explorer link.

---

## 5. AI Agent Deployment

### Step 7: Deploy Agent (`app/(app)/agents/page.tsx`)

User clicks "Deploy Agent" on a mandate card.

**Deploy Agent modal:**
- Agent Name (user-defined, e.g., "ETH Conservative Buyer")
- Mandate selection (pre-selected if coming from mandate card)
- Execution frequency (every block / every 5 min / hourly)
- Capital allocation (USDC amount)
- "Launch Agent" CTA button

**What happens on the backend (Flask):**
```
POST /api/agents
→ @jwt_required()
→ marshmallow AgentSchema validates mandate_id, name, capital_allocation
→ INSERT Agent into PostgreSQL (status='starting')
→ Celery: run_agent_loop.delay(agent_id)
  ↳ Celery worker picks up task (runs indefinitely while agent.status == 'active')
  ↳ Loop: fetch_market_data() → generate_signal() → validate_trade() → execute trade
  ↳ web3.py: AgentExecutor.sol.recordExecution(policyHash, tradeData)
  ↳ INSERT Trade into PostgreSQL
  ↳ emit_alert(user_id, alert_dict)  ← Flask-SocketIO
→ UPDATE agent.status = 'active', agent.celery_task_id = task.id
→ Return: { data: agent, message: 'Agent deployed' }
```

Frontend receives real-time trade alerts via WebSocket (`socket.on('trade:executed', ...)`).

---

## 6. AI Agent Monitoring (`app/(app)/agents/page.tsx`)

### Step 8: Monitor Agent Performance

**Agent cards display:**
- Agent name + status badge (Active / Paused / Error)
- P&L today / total P&L
- Number of trades executed
- Current drawdown vs. mandate limit
- "Pause" / "Resume" / "Stop" action buttons

**Agent detail page (`app/(app)/agents/[id]/page.tsx`):**
- Trade history table with on-chain TX links
- Performance chart (equity curve for this agent)
- Mandate policy summary
- Risk parameters display

**Pause Agent:**
```
POST /api/agents/<id>/pause
→ UPDATE agent.status = 'paused'
→ Celery task checks status at next iteration → returns early (stops loop)
→ emit_agent_status(user_id, agent_id, 'paused')
```

---

## 7. On-Chain Audit (`app/(app)/audit/page.tsx`)

### Step 9: View On-Chain Audit Trail

**Table columns:** Action, Agent, Mandate, Asset, Amount, P&L, TX Hash, Block, Timestamp

**Features:**
- Filter by agent, mandate, date range
- TX hash links to Mantle Explorer
- "Export CSV" button → `GET /api/reports?format=csv&...`
- "Share Public Link" → generates read-only audit URL for compliance

**Data source:** PostgreSQL `audit_logs` table (populated by Celery task after each on-chain TX).

---

## 8. Real-Time Alerts (`app/(app)/alerts/page.tsx`)

### Step 10: Alert Center

**Alert types and severity:**

| Event | Severity | Auto-resolve? |
|-------|----------|--------------|
| TRADE EXECUTED | LOW | Yes |
| AGENT DEPLOYED | LOW | Yes |
| LOW GAS WARNING | MEDIUM | Yes (when gas added) |
| DRAWDOWN WARNING | MEDIUM | Yes |
| MANDATE BREACH | HIGH | No — user must act |
| INSUFFICIENT GAS (agent paused) | HIGH | No |
| TRADE FAILED | HIGH | No |

**How alerts reach the frontend:**
```
Celery task → emitter.emit_alert(user_id, alert_dict)
→ Flask-SocketIO: socketio.emit('alert:new', alert, room=f'user_{user_id}')
→ socket.io-client in browser fires 'alert:new' event
→ useAlerts hook calls alertStore.addAlert(alert)
→ Zustand store update → AlertBanner re-renders
```

---

## 9. Reports and Exporting (`app/(app)/reports/page.tsx`)

### Step 11: Generate and Export Reports

**Filters:** Date range picker, agent selector, mandate selector

**Display:** Table of trades with P&L, totals row, performance chart

**Export options:**
- CSV → `GET /api/reports/<id>/download?format=csv`
- PDF → `GET /api/reports/<id>/download?format=pdf`
- Report generation (large datasets) runs as a Celery task → Flask-SocketIO notifies when ready

---

## 10. Risk Engine (`app/(app)/risk/page.tsx`)

### Step 12: Manage Risk Parameters

**Controls:**
- Max drawdown slider (0–50%)
- Risk per trade slider (0.1–10%)
- Daily loss limit toggle + amount
- Venue allocation (Merchant Moe / Agni / Fluxion — percentage sliders)
- Cooldown period after loss (0–60 min)

**Save Risk Settings:**
```
PUT /api/users/risk-settings
→ @jwt_required()
→ marshmallow validates all risk params
→ UPDATE user.risk_settings JSONB column
```

---

## 11. Profile and Settings

### Step 13: User Profile (`app/(app)/profile/page.tsx`)

- Update name, email
- Change password (old password required)
- **Connected Wallets section** — list connected wallet addresses, connect new wallet via wagmi
- ENS name display (resolved via Ethers.js v6)
- Subscription plan badge + upgrade CTA

### Step 14: Settings (`app/(app)/settings/page.tsx`)

- Notification preferences (email, in-app, Telegram webhook)
- API key management (generate, revoke)
- Theme preference (dark only for now)

---

## 12. Logout

### Step 15: Sign Out

User clicks "Sign Out" (muted button at bottom of sidebar).

```
POST /api/auth/logout
→ Invalidate refresh token (add to blocklist in Redis or DB)
→ Frontend: localStorage.removeItem('access_token')
→ Zustand authStore.clearUser()
→ Redirect to /login
```

---

## 13. Data Flow Summary

```
Browser (Next.js 14 TypeScript)
     ↕ HTTPS REST (Axios + JWT)
     ↕ WebSocket (socket.io-client ↔ Flask-SocketIO)
Flask REST API (Python)
     ↕ SQLAlchemy ORM
PostgreSQL + Redis
     ↕ Celery tasks (AI agent loops)
     ↕ web3.py
Mantle Network L2 (Solidity smart contracts)
```

**Key data stores:**
- PostgreSQL: users, wallets, mandates, agents, trades, audit_logs, alerts, reports
- Redis: Celery task broker + results, rate limit counters, token blocklist
- Mantle Network: policy hashes (MandatePolicy.sol), trade records (AgentExecutor.sol)
