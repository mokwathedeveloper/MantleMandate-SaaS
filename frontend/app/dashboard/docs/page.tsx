'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, X, ArrowLeft, Clock, ChevronRight,
  BookOpen, Zap, Code2, FileCode2, Shield, Puzzle,
  ExternalLink, Copy, CheckCircle2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Article {
  id:       string
  title:    string
  readTime: string
  category: string
  content:  React.ReactNode
}

interface Category {
  id:          string
  label:       string
  description: string
  Icon:        React.ElementType
  articles:    Article[]
}

// ─── Shared prose helpers ─────────────────────────────────────────────────────

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-text-primary mt-6 mb-2 first:mt-0">{children}</h2>
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[13px] font-semibold text-text-primary mt-4 mb-1.5">{children}</h3>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-text-secondary leading-relaxed mb-3">{children}</p>
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1 mb-3 pl-4 list-disc list-outside marker:text-primary">{children}</ul>
}
function LI({ children }: { children: React.ReactNode }) {
  return <li className="text-sm text-text-secondary leading-relaxed">{children}</li>
}
function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[12px] bg-surface border border-border rounded px-1.5 py-0.5 text-text-link">{children}</code>
}
function Pre({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group mb-3">
      <pre className="bg-page border border-border rounded-lg p-4 font-mono text-[12px] text-text-secondary leading-relaxed overflow-x-auto whitespace-pre">
        {children}
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(children).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5 text-text-secondary hover:text-text-primary" />}
      </button>
    </div>
  )
}
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-[3px] border-primary bg-primary/5 rounded-r-md px-4 py-3 mb-3">
      <p className="text-sm text-text-secondary leading-relaxed">{children}</p>
    </div>
  )
}
function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-[3px] border-warning bg-warning/5 rounded-r-md px-4 py-3 mb-3">
      <p className="text-sm text-text-secondary leading-relaxed">{children}</p>
    </div>
  )
}

// ─── Article content ──────────────────────────────────────────────────────────

const ARTICLES: Record<string, React.ReactNode> = {

  /* ── Getting Started ─────────────────────────────────────────── */

  'write-first-mandate': (
    <>
      <P>A mandate is a plain-English description of your trading strategy. You write it in natural language; Claude compiles it into a verifiable, on-chain policy. No coding required.</P>
      <H2>Step 1 — Navigate to New Mandate</H2>
      <P>Go to <strong>Dashboard → Mandates → New Mandate</strong>. You&apos;ll see a large text area and a live parsing panel on the right.</P>
      <H2>Step 2 — Write your strategy</H2>
      <P>Describe your rules in plain English. Be specific about entry conditions, exit conditions, and risk limits. Example:</P>
      <Pre>{`Buy ETH when the 1-hour RSI drops below 30 AND price is above the 200-day
moving average. Sell when RSI exceeds 70 or the position loses 4% from entry.
Never risk more than 2% of the portfolio on a single trade.
Do not trade between midnight and 6am UTC.`}</Pre>
      <H2>Step 3 — Review the parsed policy</H2>
      <P>Click <strong>Parse Mandate</strong>. Claude extracts your rules into a structured JSON policy. Review it carefully — every field represents an enforceable rule:</P>
      <Pre>{`{
  "pairs": ["ETHUSDT"],
  "entry": { "rsi_1h": { "lt": 30 }, "ma_200d": "above" },
  "exit":  { "rsi_1h": { "gt": 70 }, "stop_loss_pct": 4 },
  "sizing": { "max_risk_pct": 2 },
  "schedule": { "blackout_utc": ["00:00", "06:00"] }
}`}</Pre>
      <H2>Step 4 — Deploy to Mantle</H2>
      <P>Click <strong>Deploy Mandate</strong>. This hashes the JSON policy using keccak256 and stores the hash on <Code>MandatePolicy.sol</Code> on Mantle. You&apos;ll receive a policy hash and a Mantle Explorer link.</P>
      <Note>Your private key never leaves your wallet. The deploy transaction only stores the hash — not your personal strategy details.</Note>
      <H2>What happens next</H2>
      <P>Your mandate is now live. Assign it to an agent in <strong>Dashboard → Agents → Deploy New Agent</strong> and the agent will execute trades that conform to your policy, with every decision logged on-chain.</P>
    </>
  ),

  'deploy-first-agent': (
    <>
      <P>An agent is an automated process that monitors markets in real-time and executes trades when your mandate&apos;s conditions are met. Each agent is bound to exactly one mandate on-chain.</P>
      <H2>Prerequisites</H2>
      <UL>
        <LI>A deployed mandate (see <em>Write your first mandate</em>)</LI>
        <LI>A connected wallet (MetaMask or WalletConnect)</LI>
        <LI>Bybit API keys added in <strong>Settings → API Keys</strong> (Read + Trade permissions)</LI>
      </UL>
      <H2>Step 1 — Open the deploy wizard</H2>
      <P>Go to <strong>Dashboard → Agents → Deploy New Agent</strong>. The 4-step wizard opens.</P>
      <H2>Step 2 — Select your mandate</H2>
      <P>Choose the mandate this agent will follow. The policy hash is displayed — verify it matches what you see on the Mandates page.</P>
      <H2>Step 3 — Set execution parameters</H2>
      <UL>
        <LI><strong>Capital allocation</strong> — the USD amount the agent is allowed to deploy (e.g. $5,000)</LI>
        <LI><strong>Max position size</strong> — largest single trade as % of allocation (e.g. 2% = max $100 per trade on a $5,000 allocation)</LI>
        <LI><strong>Allowed pairs</strong> — which assets the agent may trade (ETHUSDT, BTCUSDT, MANTUSDT)</LI>
        <LI><strong>Execution mode</strong> — Live (real orders) or Paper (simulated, no real trades)</LI>
      </UL>
      <Warning>Start in Paper mode until you&apos;ve verified the agent behaves as expected. You can switch to Live at any time from the agent detail page.</Warning>
      <H2>Step 4 — Deploy on-chain</H2>
      <P>Click <strong>Deploy Agent</strong>. Your wallet signs a transaction calling <Code>AgentExecutor.sol</Code>, registering the agent with its policy hash. Gas on Mantle is typically less than $0.01.</P>
      <H2>Monitoring your agent</H2>
      <P>Once deployed, the agent appears in <strong>Dashboard → Agents</strong> with status <Code>RUNNING</Code>. Click into the agent to see real-time logs, position history, and the on-chain audit trail.</P>
    </>
  ),

  'connect-wallet': (
    <>
      <P>Your wallet is your identity on Mantle. MantleMandate uses it to sign mandate deployments and authenticate on-chain agent registrations. Your private key never leaves your device.</P>
      <H2>Supported wallets</H2>
      <UL>
        <LI><strong>MetaMask</strong> — recommended for desktop</LI>
        <LI><strong>WalletConnect</strong> — Rainbow, Trust Wallet, Coinbase Wallet, Ledger Live, and 300+ others</LI>
        <LI><strong>Injected provider</strong> — any EIP-1193 compatible browser extension</LI>
      </UL>
      <H2>How to connect</H2>
      <P>Click <strong>Connect Wallet</strong> in the top navigation bar. Select your provider. Approve the connection in your wallet app. You&apos;ll be asked to sign a message (no gas fee) to prove ownership.</P>
      <H2>Switch to Mantle Network</H2>
      <P>If your wallet is on Ethereum or another chain, MantleMandate will prompt you to switch. Click <strong>Switch Network</strong> and approve in your wallet.</P>
      <Pre>{`Network name: Mantle Mainnet
Chain ID:     5000
Currency:     MNT
RPC URL:      https://rpc.mantle.xyz
Explorer:     https://explorer.mantle.xyz

Network name: Mantle Sepolia (testnet)
Chain ID:     5003
Currency:     MNT
RPC URL:      https://rpc.sepolia.mantle.xyz
Explorer:     https://explorer.sepolia.mantle.xyz`}</Pre>
      <H2>Disconnect or switch wallet</H2>
      <P>Go to <strong>Dashboard → Wallets</strong>. Click <strong>Disconnect</strong> next to the active wallet. You can then connect a different address. Note: disconnecting from the app does not revoke on-chain permissions — your deployed mandates remain active.</P>
      <Note>MantleMandate is fully non-custodial. We never store, request, or have access to your private keys.</Note>
    </>
  ),

  'risk-parameters': (
    <>
      <P>Risk parameters are the safety guardrails that limit your agent&apos;s maximum exposure. They are enforced by <Code>RiskGuard.sol</Code> on Mantle — the agent cannot bypass them regardless of market conditions or mandate instructions.</P>
      <H2>Max Drawdown %</H2>
      <P>A circuit breaker that automatically pauses your agent when the portfolio drops this percentage from its peak value (high-water mark). The agent sends you an alert and halts all new orders.</P>
      <Pre>{`Example: Max Drawdown = 15%
Portfolio peak:   $10,000
Pause threshold:  $8,500
If portfolio drops to $8,499 → agent pauses immediately`}</Pre>
      <H2>Max Notional per Trade</H2>
      <P>The maximum USD value of a single order. Prevents the agent from concentrating too much capital in one trade.</P>
      <Pre>{`Example: Max Notional = 5% of allocation
Allocation:      $10,000
Max order size:  $500
Any order > $500 is rejected by RiskGuard`}</Pre>
      <H2>Stop-Loss %</H2>
      <P>When an open position moves against you by this percentage, the agent automatically closes it. Calculated from your average entry price.</P>
      <Pre>{`Example: Stop-Loss = 3%
ETH entry price:  $3,000.00
Stop-loss price:  $2,910.00
Position closes if ETH trades at or below $2,910`}</Pre>
      <H2>Recommended starting values</H2>
      <UL>
        <LI>Max Drawdown: <strong>10–15%</strong> for conservative, 20% for aggressive</LI>
        <LI>Max Notional: <strong>2–3%</strong> of allocation per trade</LI>
        <LI>Stop-Loss: <strong>2–4%</strong> for spot, 1–2% for high-frequency</LI>
      </UL>
      <Warning>Never set Max Drawdown above 25% for fully automated strategies. Start conservative and loosen limits only after observing the agent in paper mode.</Warning>
    </>
  ),

  /* ── Core Concepts ───────────────────────────────────────────── */

  'what-is-mandate': (
    <>
      <P>A mandate is the core governance primitive of MantleMandate. It is a plain-English description of your trading strategy that Claude compiles into a structured, cryptographically verifiable policy stored on the Mantle blockchain.</P>
      <H2>Why mandates?</H2>
      <P>Traditional algorithmic trading requires you to write code. Mandates let you describe your strategy in plain English — Claude handles the translation. You define the rules; the AI and the blockchain enforce them.</P>
      <H2>The mandate lifecycle</H2>
      <UL>
        <LI><strong>Write</strong> — You describe your strategy in plain English</LI>
        <LI><strong>Parse</strong> — Claude extracts structured rules into JSON</LI>
        <LI><strong>Hash</strong> — The JSON policy is hashed with keccak256</LI>
        <LI><strong>Register</strong> — The hash is stored on <Code>MandatePolicy.sol</Code> on Mantle</LI>
        <LI><strong>Execute</strong> — Every agent decision is validated against the hash</LI>
        <LI><strong>Audit</strong> — All executions are logged on-chain, immutably</LI>
      </UL>
      <H2>What a mandate can specify</H2>
      <UL>
        <LI>Asset pairs (ETHUSDT, BTCUSDT, MANTUSDT, and more)</LI>
        <LI>Entry triggers: RSI thresholds, moving average crossovers, price levels, volume conditions</LI>
        <LI>Exit triggers: take-profit %, trailing stop, time-based expiry</LI>
        <LI>Position sizing: fixed USD, % of portfolio, Kelly criterion (beta)</LI>
        <LI>Time constraints: allowed trading hours, blackout periods, max hold duration</LI>
        <LI>Risk limits: stop-loss %, max drawdown, max notional per trade</LI>
      </UL>
      <H2>What a mandate cannot do</H2>
      <UL>
        <LI>Override <Code>RiskGuard.sol</Code>&apos;s hard limits — they are enforced on-chain</LI>
        <LI>Access funds outside the agent&apos;s allocated capital</LI>
        <LI>Trade pairs or protocols not whitelisted in your policy</LI>
      </UL>
      <Note>Each mandate has a unique policy hash. If you edit your strategy, a new hash is generated and a new registration is required — preserving the full audit history of your original mandate.</Note>
    </>
  ),

  'agent-lifecycle': (
    <>
      <P>An agent moves through a defined set of states from deployment to termination. Understanding the lifecycle helps you manage agents effectively and interpret the status indicators in the dashboard.</P>
      <H2>States</H2>
      <UL>
        <LI><strong>DEPLOYING</strong> — On-chain registration transaction is pending</LI>
        <LI><strong>RUNNING</strong> — Agent is active, monitoring markets, and executing trades</LI>
        <LI><strong>PAUSED</strong> — Temporarily halted (manual pause or circuit breaker triggered). Resumes when you click Resume or the condition clears.</LI>
        <LI><strong>STOPPED</strong> — Permanently halted. Requires manual review before reactivation. Triggered by critical errors or mandate revocation.</LI>
        <LI><strong>COMPLETED</strong> — Agent ran its full intended duration and exited cleanly</LI>
      </UL>
      <H2>The execution loop</H2>
      <P>Every <strong>30 seconds</strong>, a RUNNING agent:</P>
      <UL>
        <LI>Fetches the latest market data from Bybit (price, volume, indicators)</LI>
        <LI>Reads current on-chain state (block number, gas price) from the Mantle RPC</LI>
        <LI>Calls the AI decision engine with the market snapshot and mandate policy</LI>
        <LI>If the AI recommends a trade, calls <Code>RiskGuard.sol</Code> to validate the order</LI>
        <LI>If validation passes, submits the order to Bybit and emits an <Code>OrderExecuted</Code> event on Mantle</LI>
      </UL>
      <H2>Circuit breakers</H2>
      <P>The agent pauses automatically when:</P>
      <UL>
        <LI>Portfolio drawdown exceeds the Max Drawdown % parameter</LI>
        <LI>A single order would exceed the Max Notional per Trade limit</LI>
        <LI>Three consecutive API errors occur (Bybit rate limit or network issue)</LI>
        <LI>The mandate policy hash cannot be verified on-chain</LI>
      </UL>
      <H2>Resuming a paused agent</H2>
      <P>Go to <strong>Dashboard → Agents</strong>, click the agent, then click <strong>Resume</strong>. Resolve the underlying issue first — resuming without fixing the root cause will trigger the same pause again.</P>
    </>
  ),

  'onchain-execution': (
    <>
      <P>MantleMandate uses Mantle Network as its settlement and audit layer. Every mandate deployment, agent registration, and trade execution is recorded on-chain — creating a tamper-proof compliance trail.</P>
      <H2>Why Mantle?</H2>
      <P>Mantle is an EVM-compatible Layer 2 built on Ethereum with near-instant finality and gas costs under $0.01. This makes it practical to record individual trades on-chain — something that would be prohibitively expensive on Ethereum mainnet.</P>
      <H2>The three contracts</H2>
      <UL>
        <LI><Code>MandatePolicy.sol</Code> — stores and verifies policy hashes. Called when you deploy a mandate.</LI>
        <LI><Code>AgentExecutor.sol</Code> — registers agents and emits <Code>OrderExecuted</Code> events. Called by the execution engine after every successful trade.</LI>
        <LI><Code>RiskGuard.sol</Code> — validates each proposed order against configured risk limits. Called before every trade.</LI>
      </UL>
      <H2>Transaction flow for a single trade</H2>
      <Pre>{`1. Agent execution loop fires (every 30s)
2. AI engine evaluates mandate conditions → BUY ETHUSDT $500
3. POST /order to Bybit API → orderId: 12345678
4. AgentExecutor.executeOrder(policyHash, "ETHUSDT", 500, "BUY")
   → emits OrderExecuted(policyHash, pair, amount, side, orderId, ts)
5. Event visible on Mantle Explorer immediately`}</Pre>
      <H2>Verifying a trade on Mantle Explorer</H2>
      <P>Every <Code>OrderExecuted</Code> event in the Audit tab has a TX hash. Clicking it opens the transaction on Mantle Explorer where you can inspect the full event log, including the policy hash that authorised the trade.</P>
      <Note>The on-chain record cannot be modified or deleted. Even if you revoke a mandate, past executions remain permanently visible — providing a complete, trustless audit trail.</Note>
    </>
  ),

  'risk-engine-deep-dive': (
    <>
      <P>The risk engine is a two-layer system: an off-chain pre-check powered by the AI decision engine, and an on-chain hard stop enforced by <Code>RiskGuard.sol</Code>. Both must pass before a trade executes.</P>
      <H2>Layer 1 — AI pre-check (off-chain)</H2>
      <P>Before proposing any order, the AI engine checks the mandate&apos;s own risk rules:</P>
      <UL>
        <LI>Is the proposed order within the mandate&apos;s position sizing rules?</LI>
        <LI>Is the current portfolio below the drawdown limit?</LI>
        <LI>Is this trade within the mandate&apos;s allowed trading hours?</LI>
        <LI>Does the order respect the mandate&apos;s stop-loss configuration?</LI>
      </UL>
      <P>If any check fails, the AI logs the rejection and skips the cycle. No blockchain transaction is created.</P>
      <H2>Layer 2 — RiskGuard.sol (on-chain)</H2>
      <P>Even if the AI approves the trade, <Code>RiskGuard.sol</Code> performs its own independent validation using the risk parameters you set in <strong>Dashboard → Risk</strong>:</P>
      <Pre>{`function validateOrder(
  address agent,
  bytes32 policyHash,
  uint256 notionalUSD,
  uint256 currentDrawdownBps
) external view returns (bool valid, string memory reason)`}</Pre>
      <P>This function reverts if:</P>
      <UL>
        <LI><Code>notionalUSD</Code> exceeds the Max Notional per Trade limit</LI>
        <LI><Code>currentDrawdownBps</Code> exceeds the Max Drawdown basis points</LI>
        <LI>The agent is not registered under the given <Code>policyHash</Code></LI>
      </UL>
      <H2>Why two layers?</H2>
      <P>The off-chain AI check is fast and catches most rejections without spending gas. The on-chain check is the unforgeable backstop — it cannot be bypassed even if the AI engine is compromised or produces incorrect output.</P>
      <Warning>The on-chain limits are independent of your mandate&apos;s rules. Even if your mandate says &quot;risk 10% per trade,&quot; RiskGuard will reject the order if you&apos;ve configured a 2% Max Notional limit in the Risk dashboard.</Warning>
    </>
  ),

  /* ── API Reference ───────────────────────────────────────────── */

  'auth-jwt': (
    <>
      <P>All MantleMandate API endpoints require a valid JWT issued by Supabase Auth. The JWT is automatically attached to requests when you&apos;re signed in via the dashboard. For direct API access, obtain a token using the auth endpoint below.</P>
      <H2>Obtain a token</H2>
      <Pre>{`POST https://your-project.supabase.co/auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "your-password"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "..."
}`}</Pre>
      <H2>Use the token</H2>
      <P>Pass the access token in the <Code>Authorization</Code> header on every API request:</P>
      <Pre>{`GET /api/mandates
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</Pre>
      <H2>Token expiry & refresh</H2>
      <P>Access tokens expire after <strong>1 hour</strong>. Use the refresh token to obtain a new access token without re-entering credentials:</P>
      <Pre>{`POST https://your-project.supabase.co/auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{ "refresh_token": "your-refresh-token" }`}</Pre>
      <H2>Error responses</H2>
      <UL>
        <LI><Code>401 Unauthorized</Code> — missing or invalid token</LI>
        <LI><Code>403 Forbidden</Code> — token is valid but lacks permission for this resource</LI>
      </UL>
    </>
  ),

  'mandates-endpoints': (
    <>
      <P>The Mandates API lets you list, create, and inspect mandates programmatically.</P>
      <H2>List mandates</H2>
      <Pre>{`GET /api/mandates
Authorization: Bearer <token>

Response 200:
{
  "mandates": [
    {
      "id": "m_01j...",
      "name": "ETH Conservative Buyer",
      "status": "active",
      "policyHash": "0xabc123...",
      "createdAt": "2026-05-01T10:00:00Z",
      "agentCount": 2
    }
  ]
}`}</Pre>
      <H2>Parse a mandate (preview only)</H2>
      <Pre>{`POST /api/mandates/parse
Authorization: Bearer <token>
Content-Type: application/json

{ "text": "Buy ETH when RSI < 30, stop-loss at 3%" }

Response 200:
{
  "policy": {
    "pairs": ["ETHUSDT"],
    "entry": { "rsi_1h": { "lt": 30 } },
    "exit":  { "stop_loss_pct": 3 }
  },
  "policyHash": "0xdef456..."
}`}</Pre>
      <H2>Deploy a mandate</H2>
      <Pre>{`POST /api/mandates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "ETH Conservative Buyer",
  "text": "Buy ETH when RSI < 30, stop-loss at 3%",
  "policyHash": "0xdef456..."
}

Response 201:
{
  "id": "m_01j...",
  "policyHash": "0xdef456...",
  "txHash": "0x789abc...",
  "explorerUrl": "https://explorer.sepolia.mantle.xyz/tx/0x789abc..."
}`}</Pre>
      <H2>Get a mandate</H2>
      <Pre>{`GET /api/mandates/:id
Authorization: Bearer <token>

Response 200: { mandate object }`}</Pre>
    </>
  ),

  'agents-deploy': (
    <>
      <P>The Agents API manages agent deployment, status queries, and lifecycle control.</P>
      <H2>List agents</H2>
      <Pre>{`GET /api/agents
Authorization: Bearer <token>

Response 200:
{
  "agents": [
    {
      "id": "agent-01j...",
      "mandateId": "m_01j...",
      "status": "RUNNING",
      "allocation": 5000,
      "pnl": 234.50,
      "createdAt": "2026-05-10T08:00:00Z"
    }
  ]
}`}</Pre>
      <H2>Deploy an agent</H2>
      <Pre>{`POST /api/agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "mandateId": "m_01j...",
  "allocation": 5000,
  "maxPositionPct": 2,
  "pairs": ["ETHUSDT"],
  "mode": "paper"
}

Response 201:
{
  "id": "agent-01j...",
  "status": "DEPLOYING",
  "txHash": "0xabc123..."
}`}</Pre>
      <H2>Pause / Resume an agent</H2>
      <Pre>{`PATCH /api/agents/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "action": "pause" }   // or "resume" | "stop"

Response 200:
{ "id": "agent-01j...", "status": "PAUSED" }`}</Pre>
      <H2>Agent decision log</H2>
      <Pre>{`GET /api/agents/:id/logs?limit=50
Authorization: Bearer <token>

Response 200:
{
  "logs": [
    {
      "ts": "2026-05-23T14:22:01Z",
      "decision": "BUY",
      "pair": "ETHUSDT",
      "reason": "RSI(1h)=28.4 < 30 threshold",
      "orderId": "1234567890"
    }
  ]
}`}</Pre>
    </>
  ),

  'websocket-stream': (
    <>
      <P>The WebSocket event stream delivers real-time updates for agent events, trade executions, and risk alerts without polling.</P>
      <H2>Connect</H2>
      <Pre>{`const ws = new WebSocket(
  'wss://your-project.supabase.co/realtime/v1/websocket?apikey=<anon-key>'
)

ws.onopen = () => {
  ws.send(JSON.stringify({
    event: 'phx_join',
    topic: 'realtime:agents',
    payload: { user_token: '<jwt>' },
    ref: 1,
  }))
}`}</Pre>
      <H2>Event types</H2>
      <UL>
        <LI><Code>ORDER_EXECUTED</Code> — a trade was placed and logged on-chain</LI>
        <LI><Code>AGENT_PAUSED</Code> — circuit breaker triggered or manual pause</LI>
        <LI><Code>AGENT_RESUMED</Code> — agent restarted</LI>
        <LI><Code>DRAWDOWN_ALERT</Code> — portfolio drawdown exceeded warning threshold (80% of limit)</LI>
        <LI><Code>MANDATE_BREACH</Code> — an action would violate the mandate policy (blocked)</LI>
      </UL>
      <H2>Sample event payload</H2>
      <Pre>{`{
  "event": "ORDER_EXECUTED",
  "payload": {
    "agentId": "agent-01j...",
    "pair":    "ETHUSDT",
    "side":    "BUY",
    "amount":  250.00,
    "price":   3241.50,
    "pnl":     null,
    "txHash":  "0xabc123...",
    "ts":      "2026-05-23T14:22:01Z"
  }
}`}</Pre>
      <Note>The WebSocket stream is powered by Supabase Realtime. All events are also persisted to the <Code>trades</Code> and <Code>agent_logs</Code> tables, queryable via the REST API.</Note>
    </>
  ),

  /* ── Smart Contracts ─────────────────────────────────────────── */

  'mandate-policy-contract': (
    <>
      <P><Code>MandatePolicy.sol</Code> is the immutable on-chain registry of mandate policy hashes. It provides a trustless proof that your agent&apos;s decisions are governed by your stated strategy.</P>
      <H2>Contract address</H2>
      <Pre>{`Mantle Sepolia (testnet): 0x4a9f...3b2c
Mantle Mainnet:           coming soon`}</Pre>
      <H2>Key functions</H2>
      <H3>registerPolicy</H3>
      <Pre>{`function registerPolicy(
  bytes32 policyHash,
  address agent
) external returns (uint256 policyId)

// Emits: PolicyRegistered(policyHash, agent, block.timestamp)`}</Pre>
      <P>Called when you deploy a mandate. Stores the keccak256 hash of your JSON policy alongside the authorised agent address.</P>
      <H3>verifyPolicy</H3>
      <Pre>{`function verifyPolicy(
  bytes32 policyHash,
  address agent
) external view returns (bool valid)`}</Pre>
      <P>Called by <Code>AgentExecutor</Code> before every trade. Returns <Code>true</Code> if the agent is registered under the given hash. If <Code>false</Code>, the trade is rejected.</P>
      <H3>revokePolicy</H3>
      <Pre>{`function revokePolicy(bytes32 policyHash) external
// Emits: PolicyRevoked(policyHash, block.timestamp)`}</Pre>
      <P>Permanently revokes a mandate. Stops the registered agent immediately. Past executions remain on-chain.</P>
      <H2>Events</H2>
      <Pre>{`event PolicyRegistered(
  bytes32 indexed policyHash,
  address indexed agent,
  uint256 timestamp
)
event PolicyRevoked(
  bytes32 indexed policyHash,
  uint256 timestamp
)`}</Pre>
    </>
  ),

  'agent-executor-contract': (
    <>
      <P><Code>AgentExecutor.sol</Code> is the execution gateway. It validates that an order is permitted by its mandate policy, calls <Code>RiskGuard</Code> for risk checks, and emits the on-chain audit event after a successful trade.</P>
      <H2>Contract address</H2>
      <Pre>{`Mantle Sepolia (testnet): 0x7c3d...9e1f
Mantle Mainnet:           coming soon`}</Pre>
      <H2>Key functions</H2>
      <H3>executeOrder</H3>
      <Pre>{`function executeOrder(
  bytes32 policyHash,
  string  calldata pair,
  uint256 notionalUSD,
  string  calldata side,
  string  calldata externalOrderId
) external returns (bool success)

// Emits: OrderExecuted(...) on success`}</Pre>
      <P>Called by the off-chain execution engine after an order is placed on Bybit. The function verifies the policy hash, calls RiskGuard, and emits the audit event.</P>
      <H2>The OrderExecuted event</H2>
      <Pre>{`event OrderExecuted(
  bytes32 indexed policyHash,
  address indexed agent,
  string          pair,
  uint256         notionalUSD,
  string          side,
  string          externalOrderId,
  uint256         blockNumber,
  uint256         timestamp
)`}</Pre>
      <P>This event is the canonical on-chain record of every trade. It appears in the Audit tab and can be independently verified on Mantle Explorer.</P>
      <H2>Failure modes</H2>
      <UL>
        <LI><Code>PolicyNotFound</Code> — policyHash is not registered in MandatePolicy</LI>
        <LI><Code>AgentNotAuthorized</Code> — caller is not the registered agent for this hash</LI>
        <LI><Code>RiskCheckFailed</Code> — RiskGuard rejected the order (returns reason string)</LI>
      </UL>
    </>
  ),

  'risk-guard-contract': (
    <>
      <P><Code>RiskGuard.sol</Code> is the on-chain enforcement layer for risk parameters. It is the final, unforgeable check before any trade is logged. No agent can bypass it.</P>
      <H2>Contract address</H2>
      <Pre>{`Mantle Sepolia (testnet): 0x2b8e...4d7a
Mantle Mainnet:           coming soon`}</Pre>
      <H2>Key functions</H2>
      <H3>setLimits</H3>
      <Pre>{`function setLimits(
  address agent,
  uint256 maxDrawdownBps,    // basis points, e.g. 1500 = 15%
  uint256 maxNotionalUSD,    // e.g. 500_00 = $500.00 (2 decimals)
  uint256 stopLossBps        // e.g. 300 = 3%
) external onlyOwner`}</Pre>
      <P>Called when you save new risk parameters in <strong>Dashboard → Risk</strong>. Only the account owner (you) can set limits for your agents.</P>
      <H3>validateOrder</H3>
      <Pre>{`function validateOrder(
  address agent,
  bytes32 policyHash,
  uint256 notionalUSD,
  uint256 currentDrawdownBps
) external view returns (bool valid, string memory reason)`}</Pre>
      <P>Returns <Code>false</Code> with a human-readable reason if any limit is breached. <Code>AgentExecutor</Code> calls this before emitting <Code>OrderExecuted</Code>.</P>
      <H2>Basis points reference</H2>
      <Pre>{`1 bps  = 0.01%
100 bps = 1%
1500 bps = 15%
10000 bps = 100%`}</Pre>
    </>
  ),

  'contract-addresses': (
    <>
      <P>All MantleMandate contracts are deployed on Mantle Sepolia (testnet). Mainnet deployment is in progress and contract addresses will be published here upon launch.</P>
      <H2>Mantle Sepolia</H2>
      <Pre>{`MandatePolicy:  0x4a9f3b2c...
AgentExecutor:  0x7c3d9e1f...
RiskGuard:      0x2b8e4d7a...
Chain ID:       5003
Explorer:       https://explorer.sepolia.mantle.xyz`}</Pre>
      <H2>Verify contracts</H2>
      <P>All contracts are verified on Mantle Explorer. You can read the ABI, call read-only functions, and inspect transaction history directly from the explorer without any additional tools.</P>
      <H2>Download ABIs</H2>
      <P>ABIs are available in the <Code>blockchain/typechain-types/</Code> directory of the open-source repository. They are automatically generated from the Solidity source using Hardhat + TypeChain.</P>
      <H2>Interact with contracts directly</H2>
      <Pre>{`import { createPublicClient, http } from 'viem'
import { mantleSepoliaTestnet } from 'viem/chains'
import { MANDATE_POLICY_ABI } from './abis'

const client = createPublicClient({
  chain: mantleSepoliaTestnet,
  transport: http('https://rpc.sepolia.mantle.xyz'),
})

const isValid = await client.readContract({
  address: '0x4a9f3b2c...',
  abi: MANDATE_POLICY_ABI,
  functionName: 'verifyPolicy',
  args: [policyHash, agentAddress],
})`}</Pre>
    </>
  ),

  /* ── Mandate Syntax ──────────────────────────────────────────── */

  'indicators-triggers': (
    <>
      <P>Claude understands a wide range of technical indicators and market conditions. Use these terms in your mandate and they will be correctly extracted into the policy JSON.</P>
      <H2>Price-based triggers</H2>
      <UL>
        <LI><Code>price above $X</Code> / <Code>price below $X</Code> — absolute price level</LI>
        <LI><Code>price above 200-day MA</Code> — relative to moving average</LI>
        <LI><Code>price within X% of 52-week high</Code> — proximity condition</LI>
        <LI><Code>price breaks out above resistance at $X</Code> — breakout trigger</LI>
      </UL>
      <H2>Momentum indicators</H2>
      <UL>
        <LI><Code>RSI(14) below 30</Code> / <Code>RSI above 70</Code> — Relative Strength Index (1h default, specify timeframe)</LI>
        <LI><Code>MACD crosses above signal line</Code> — MACD crossover</LI>
        <LI><Code>MACD histogram turns positive</Code></LI>
        <LI><Code>stochastic RSI below 20</Code></LI>
      </UL>
      <H2>Volume triggers</H2>
      <UL>
        <LI><Code>volume 2x 20-day average</Code> — volume spike</LI>
        <LI><Code>OBV trending upward for 3 days</Code> — On-Balance Volume</LI>
      </UL>
      <H2>Time-based rules</H2>
      <UL>
        <LI><Code>only trade between 9am and 5pm UTC</Code></LI>
        <LI><Code>close all positions by Friday 6pm UTC</Code></LI>
        <LI><Code>maximum hold time 48 hours</Code></LI>
        <LI><Code>no trading on weekends</Code></LI>
      </UL>
      <H2>Compound conditions</H2>
      <P>Combine triggers with AND / OR. Claude correctly handles complex logic:</P>
      <Pre>{`"Buy ETH when RSI(1h) < 30 AND price is above the 50-day MA
AND volume is at least 1.5x the 10-day average.
Do NOT buy if the 4h RSI is also below 25 (extreme oversold, wait)."`}</Pre>
    </>
  ),

  'risk-rule-syntax': (
    <>
      <P>Risk rules define the boundaries of your agent&apos;s exposure. Claude recognises the following patterns — use whichever phrasing feels natural.</P>
      <H2>Position sizing</H2>
      <Pre>{`"Never risk more than 2% of the portfolio per trade"
→ { "max_risk_pct": 2 }

"Maximum position size $500"
→ { "max_notional_usd": 500 }

"Allocate 1% of portfolio per signal"
→ { "position_size_pct": 1 }`}</Pre>
      <H2>Stop-loss</H2>
      <Pre>{`"Stop-loss at 3% from entry"
→ { "stop_loss_pct": 3 }

"Close position if it drops $150 from peak"
→ { "trailing_stop_usd": 150 }

"Trailing stop at 2%"
→ { "trailing_stop_pct": 2 }`}</Pre>
      <H2>Take-profit</H2>
      <Pre>{`"Take profit at 8% gain"
→ { "take_profit_pct": 8 }

"Scale out: sell 50% at 5% gain, remainder at 10%"
→ { "scale_out": [{ "pct": 50, "at_gain": 5 }, { "pct": 50, "at_gain": 10 }] }`}</Pre>
      <H2>Drawdown circuit breakers</H2>
      <Pre>{`"Pause if daily loss exceeds 5%"
→ { "daily_drawdown_limit_pct": 5 }

"Stop all trading if portfolio drops 15% from peak"
→ { "max_drawdown_pct": 15 }`}</Pre>
      <Note>Risk rules in your mandate text and risk parameters in Dashboard → Risk are independent. The stricter of the two always applies. When in doubt, set conservative limits in both places.</Note>
    </>
  ),

  'example-mandates': (
    <>
      <P>Copy any of these mandates directly into the New Mandate text area. Adjust thresholds to suit your risk tolerance.</P>
      <H2>RSI Mean Reversion (Conservative)</H2>
      <Pre>{`Buy ETHUSDT when the 1-hour RSI drops below 28 and the daily RSI is above 40
(confirming an uptrend). Sell when 1-hour RSI recovers to 60 or the position
gains 6%. Stop-loss at 3% below entry. Never risk more than 1.5% of the
portfolio per trade. Do not open new positions if the portfolio is down more
than 8% from its monthly peak.`}</Pre>
      <H2>Trend Following (Moderate)</H2>
      <Pre>{`Buy BTCUSDT when price closes above the 50-day moving average AND the MACD
histogram turns positive on the daily chart. Hold until price drops below
the 20-day moving average or the MACD histogram turns negative. Trailing
stop at 5%. Maximum position size 3% of portfolio.`}</Pre>
      <H2>Multi-Asset Rotation (Aggressive)</H2>
      <Pre>{`Monitor ETHUSDT, BTCUSDT, and MANTUSDT. Each Monday, buy the asset with the
strongest 14-day RSI momentum (but RSI must still be below 65 — avoid
overbought). Sell the weakest performer if it has lost more than 4% this week.
Stop-loss at 5% per position. Never hold more than 2 assets simultaneously.
Maximum portfolio allocation 80% (keep 20% in cash).`}</Pre>
      <H2>DeFi Yield Entry</H2>
      <Pre>{`Buy MANTUSDT when price is within 5% of its 30-day low AND 24-hour volume
is above its 7-day average. Hold for a maximum of 7 days. Take profit at
10% gain. Stop-loss at 4% loss. Maximum position 2% of portfolio. Do not
trade between midnight Saturday and midnight Sunday UTC.`}</Pre>
    </>
  ),

  'common-mistakes': (
    <>
      <P>These are the most frequent issues users encounter when writing mandates, and how to avoid them.</P>
      <H2>1. Conflicting rules</H2>
      <P>Writing rules that contradict each other causes the AI to skip cycles or behave unpredictably.</P>
      <Pre>{`❌ "Buy when RSI < 30. Never buy in a downtrend.
     (The parser cannot define 'downtrend' without more context)"

✅ "Buy when RSI(1h) < 30 AND price is above the 200-day moving average."`}</Pre>
      <H2>2. Missing exit conditions</H2>
      <P>Every entry rule needs a corresponding exit rule. Without one, the agent holds the position indefinitely.</P>
      <Pre>{`❌ "Buy ETH when RSI drops below 30."
✅ "Buy ETH when RSI drops below 30. Sell when RSI exceeds 65
    or position gains 8%, whichever comes first. Stop-loss at 4%."`}</Pre>
      <H2>3. Too many conditions</H2>
      <P>More than 4–5 compound AND conditions rarely all trigger simultaneously. Your agent will never trade.</P>
      <Pre>{`❌ "Buy when RSI < 25 AND MACD positive AND volume 3x AND price above 200MA
     AND stochastic < 20 AND candle is green AND it's Tuesday"

✅ "Buy when RSI(1h) < 30 AND price above 200-day MA"`}</Pre>
      <H2>4. No risk limits</H2>
      <P>Without position sizing rules, the agent will use default limits (2% max notional). Always be explicit.</P>
      <H2>5. Forgetting the RiskGuard override</H2>
      <P>Your mandate&apos;s risk rules and the Dashboard → Risk parameters are <em>independent</em>. If your mandate says &quot;risk 5% per trade&quot; but RiskGuard is set to 2%, the 2% limit wins. Check both places.</P>
    </>
  ),

  /* ── Integrations ────────────────────────────────────────────── */

  'webhook-setup': (
    <>
      <P>Webhooks let you receive real-time push notifications to your own server when MantleMandate events occur — no polling required.</P>
      <H2>Supported events</H2>
      <UL>
        <LI><Code>order.executed</Code> — a trade was placed</LI>
        <LI><Code>agent.paused</Code> — circuit breaker triggered or manual pause</LI>
        <LI><Code>agent.resumed</Code> — agent restarted</LI>
        <LI><Code>drawdown.alert</Code> — portfolio drawdown warning (80% of limit)</LI>
        <LI><Code>mandate.breached</Code> — an action was blocked by policy</LI>
      </UL>
      <H2>Register a webhook</H2>
      <P>Go to <strong>Dashboard → Settings → Webhooks → Add Endpoint</strong>. Provide your HTTPS URL and select the events you want to receive.</P>
      <H2>Payload format</H2>
      <Pre>{`POST https://your-server.com/webhook
Content-Type: application/json
X-MantleMandate-Signature: sha256=<hmac>
X-MantleMandate-Event: order.executed

{
  "event":   "order.executed",
  "agentId": "agent-01j...",
  "data": {
    "pair":    "ETHUSDT",
    "side":    "BUY",
    "amount":  250.00,
    "price":   3241.50,
    "txHash":  "0xabc123...",
    "ts":      "2026-05-23T14:22:01Z"
  }
}`}</Pre>
      <H2>Verify the signature</H2>
      <Pre>{`const crypto = require('crypto')

function verifyWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}`}</Pre>
    </>
  ),

  'slack-telegram': (
    <>
      <P>Receive instant alerts in Slack or Telegram when your agents execute trades, hit risk limits, or pause.</P>
      <H2>Slack setup</H2>
      <P>Go to <strong>Dashboard → Settings → Notifications → Slack</strong>. Paste your Incoming Webhook URL (create one at api.slack.com/apps). Select which events to forward.</P>
      <P>Sample Slack message format:</P>
      <Pre>{`[MantleMandate] 🟢 Trade Executed
Agent: ETH Conservative Buyer
Pair:  ETHUSDT | Side: BUY
Amount: $250.00 @ $3,241.50
P&L: +$12.30 (open)
Tx: https://explorer.sepolia.mantle.xyz/tx/0xabc...`}</Pre>
      <H2>Telegram setup</H2>
      <P>Go to <strong>Dashboard → Settings → Notifications → Telegram</strong>. Enter your Telegram Bot token and chat ID. To get these:</P>
      <UL>
        <LI>Message <Code>@BotFather</Code> on Telegram → <Code>/newbot</Code> → copy the token</LI>
        <LI>Message <Code>@userinfobot</Code> → copy your chat ID</LI>
        <LI>Paste both into the settings panel and click <strong>Test Connection</strong></LI>
      </UL>
      <H2>Alert severity levels</H2>
      <UL>
        <LI>🟢 <Code>INFO</Code> — trade executed, agent deployed</LI>
        <LI>🟡 <Code>WARN</Code> — drawdown at 80% of limit, rate limit approaching</LI>
        <LI>🔴 <Code>ERROR</Code> — agent paused, mandate breached, trade failed</LI>
      </UL>
    </>
  ),

  'walletconnect': (
    <>
      <P>WalletConnect enables connection from any compatible mobile or desktop wallet, including Rainbow, Trust Wallet, Coinbase Wallet, Ledger Live, and 300+ others.</P>
      <H2>How it works</H2>
      <P>WalletConnect creates an encrypted relay session between MantleMandate and your wallet app. All signing happens inside your wallet — your private key never leaves the device.</P>
      <H2>Connect via QR code (mobile)</H2>
      <UL>
        <LI>Click <strong>Connect Wallet</strong> → select <strong>WalletConnect</strong></LI>
        <LI>A QR code appears in the modal</LI>
        <LI>Open your wallet app and scan the QR code</LI>
        <LI>Approve the connection request in your wallet</LI>
      </UL>
      <H2>Connect via deep link (mobile browser)</H2>
      <P>If you&apos;re visiting MantleMandate from your phone, tap <strong>WalletConnect</strong> and choose your installed wallet from the list. The wallet opens automatically and prompts you to approve.</P>
      <H2>Supported chains</H2>
      <UL>
        <LI>Mantle Mainnet (chainId 5000) — production</LI>
        <LI>Mantle Sepolia (chainId 5003) — testnet</LI>
      </UL>
      <P>Your wallet must be on the Mantle network. The app will prompt you to switch if you&apos;re on a different chain.</P>
      <H2>Disconnect</H2>
      <P>Go to <strong>Dashboard → Wallets → Disconnect</strong>. This ends the WalletConnect session. On your wallet app, also go to WalletConnect sessions and remove the MantleMandate entry to fully terminate the session.</P>
    </>
  ),

  'bybit-adapter': (
    <>
      <P>MantleMandate uses the Bybit V5 REST API for market data and order execution. The adapter handles authentication, rate limiting, and error recovery automatically.</P>
      <H2>Configure your Bybit API keys</H2>
      <P>Go to <strong>Dashboard → Settings → API Keys → Add Bybit Key</strong>. You&apos;ll need:</P>
      <UL>
        <LI><strong>API Key</strong> — your Bybit API key ID</LI>
        <LI><strong>API Secret</strong> — your Bybit API secret (stored encrypted, never shown again)</LI>
      </UL>
      <Warning>Create a dedicated API key for MantleMandate with only Spot Trade and Read permissions. Never use your master key. Enable IP allowlisting if Bybit supports it for your account.</Warning>
      <H2>What the adapter fetches</H2>
      <UL>
        <LI><Code>GET /v5/market/tickers</Code> — real-time price, volume, 24h change</LI>
        <LI><Code>GET /v5/market/kline</Code> — OHLCV candles (1m, 5m, 1h, 1d)</LI>
        <LI><Code>GET /v5/account/wallet-balance</Code> — account balance for P&L calculation</LI>
        <LI><Code>POST /v5/order/create</Code> — place a market or limit order</LI>
      </UL>
      <H2>Rate limits</H2>
      <UL>
        <LI>Market data: 1,200 requests/minute (shared across all agents)</LI>
        <LI>Order placement: 10 requests/second per API key</LI>
      </UL>
      <P>The adapter automatically throttles when approaching limits and logs a <Code>WARN</Code> in the Ingestion Log when utilisation exceeds 80%.</P>
      <H2>Supported pairs</H2>
      <P>All USDT spot pairs available on Bybit are supported. MantleMandate recommends starting with high-liquidity pairs: <Code>ETHUSDT</Code>, <Code>BTCUSDT</Code>, <Code>MANTUSDT</Code>, <Code>SOLUSDT</Code>.</P>
    </>
  ),
}

// ─── Category definitions ─────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    description: 'Up and running in 5 minutes',
    Icon: Zap,
    articles: [
      { id: 'write-first-mandate',  title: 'Write your first mandate',       readTime: '3 min read', category: 'Getting Started', content: ARTICLES['write-first-mandate']  },
      { id: 'deploy-first-agent',   title: 'Deploy your first AI agent',     readTime: '5 min read', category: 'Getting Started', content: ARTICLES['deploy-first-agent']   },
      { id: 'connect-wallet',       title: 'Connect your wallet',            readTime: '2 min read', category: 'Getting Started', content: ARTICLES['connect-wallet']        },
      { id: 'risk-parameters',      title: 'Understanding risk parameters',  readTime: '4 min read', category: 'Getting Started', content: ARTICLES['risk-parameters']       },
    ],
  },
  {
    id: 'core-concepts',
    label: 'Core Concepts',
    description: 'How MantleMandate works under the hood',
    Icon: BookOpen,
    articles: [
      { id: 'what-is-mandate',       title: 'What is a Mandate?',           readTime: '5 min read', category: 'Core Concepts', content: ARTICLES['what-is-mandate']        },
      { id: 'agent-lifecycle',       title: 'AI Agent Lifecycle',           readTime: '6 min read', category: 'Core Concepts', content: ARTICLES['agent-lifecycle']        },
      { id: 'onchain-execution',     title: 'On-Chain Execution Model',     readTime: '7 min read', category: 'Core Concepts', content: ARTICLES['onchain-execution']      },
      { id: 'risk-engine-deep-dive', title: 'Risk Engine Deep Dive',        readTime: '8 min read', category: 'Core Concepts', content: ARTICLES['risk-engine-deep-dive']  },
    ],
  },
  {
    id: 'api-reference',
    label: 'API Reference',
    description: 'Full REST & WebSocket API docs',
    Icon: Code2,
    articles: [
      { id: 'auth-jwt',          title: 'Authentication & JWT tokens',    readTime: '3 min read', category: 'API Reference', content: ARTICLES['auth-jwt']          },
      { id: 'mandates-endpoints', title: 'Mandates endpoints',            readTime: '5 min read', category: 'API Reference', content: ARTICLES['mandates-endpoints']  },
      { id: 'agents-deploy',     title: 'Agents & deploy lifecycle',      readTime: '6 min read', category: 'API Reference', content: ARTICLES['agents-deploy']      },
      { id: 'websocket-stream',  title: 'WebSocket event stream',         readTime: '4 min read', category: 'API Reference', content: ARTICLES['websocket-stream']   },
    ],
  },
  {
    id: 'smart-contracts',
    label: 'Smart Contracts',
    description: 'Deployed on Mantle Testnet',
    Icon: FileCode2,
    articles: [
      { id: 'mandate-policy-contract', title: 'MandatePolicy — store & verify',  readTime: '6 min read', category: 'Smart Contracts', content: ARTICLES['mandate-policy-contract']  },
      { id: 'agent-executor-contract', title: 'AgentExecutor — execute trades',  readTime: '7 min read', category: 'Smart Contracts', content: ARTICLES['agent-executor-contract']  },
      { id: 'risk-guard-contract',     title: 'RiskGuard — enforce limits',      readTime: '5 min read', category: 'Smart Contracts', content: ARTICLES['risk-guard-contract']      },
      { id: 'contract-addresses',      title: 'Contract addresses & ABIs',        readTime: '2 min read', category: 'Smart Contracts', content: ARTICLES['contract-addresses']       },
    ],
  },
  {
    id: 'mandate-syntax',
    label: 'Mandate Syntax',
    description: 'Writing rules the AI understands',
    Icon: Shield,
    articles: [
      { id: 'indicators-triggers', title: 'Supported indicators & triggers',   readTime: '5 min read', category: 'Mandate Syntax', content: ARTICLES['indicators-triggers']  },
      { id: 'risk-rule-syntax',    title: 'Risk rule syntax reference',        readTime: '4 min read', category: 'Mandate Syntax', content: ARTICLES['risk-rule-syntax']     },
      { id: 'example-mandates',    title: 'Example mandates library',          readTime: '3 min read', category: 'Mandate Syntax', content: ARTICLES['example-mandates']     },
      { id: 'common-mistakes',     title: 'Common mistakes & gotchas',         readTime: '4 min read', category: 'Mandate Syntax', content: ARTICLES['common-mistakes']      },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'Connect your tools and workflows',
    Icon: Puzzle,
    articles: [
      { id: 'webhook-setup',    title: 'Webhook events setup',          readTime: '4 min read', category: 'Integrations', content: ARTICLES['webhook-setup']    },
      { id: 'slack-telegram',   title: 'Slack & Telegram alerts',       readTime: '3 min read', category: 'Integrations', content: ARTICLES['slack-telegram']   },
      { id: 'walletconnect',    title: 'WalletConnect integration',     readTime: '5 min read', category: 'Integrations', content: ARTICLES['walletconnect']    },
      { id: 'bybit-adapter',    title: 'Bybit market data adapter',     readTime: '6 min read', category: 'Integrations', content: ARTICLES['bybit-adapter']    },
    ],
  },
]

const ALL_ARTICLES = CATEGORIES.flatMap(c => c.articles)

const QUICK_TABS = [
  { id: 'quickstart',  label: 'Quickstart',      articleId: 'write-first-mandate'       },
  { id: 'api',         label: 'API Reference',   articleId: 'auth-jwt'                  },
  { id: 'contracts',   label: 'Contract ABIs',   articleId: 'contract-addresses'        },
  { id: 'examples',    label: 'Example Mandates', articleId: 'example-mandates'         },
]

// ─── Article view ─────────────────────────────────────────────────────────────

function ArticleView({ article, onBack }: { article: Article; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to docs
      </button>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{article.category}</span>
        <span className="text-text-disabled">·</span>
        <span className="flex items-center gap-1 text-[11px] text-text-disabled">
          <Clock className="h-3 w-3" />{article.readTime}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-6">{article.title}</h1>

      <div className="bg-card border border-border rounded-lg p-6">
        {article.content}
      </div>

      {/* Related articles */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">More in {article.category}</p>
        <div className="space-y-1">
          {ALL_ARTICLES
            .filter(a => a.category === article.category && a.id !== article.id)
            .map(a => (
              <button
                key={a.id}
                onClick={() => {/* handled by parent */}}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-text-link hover:bg-card transition-colors text-left group"
              >
                <span className="group-hover:underline underline-offset-2">{a.title}</span>
                <div className="flex items-center gap-2 text-text-disabled shrink-0">
                  <span className="text-[11px]">{a.readTime}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState<Article | null>(null)

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return ALL_ARTICLES.filter(a =>
      a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    )
  }, [query])

  const showSearch  = query.trim().length > 0
  const showArticle = !!selected && !showSearch

  const openArticle = (article: Article) => {
    setQuery('')
    setSelected(article)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => setSelected(null)

  return (
    <div className="p-4 sm:p-6 pb-12 space-y-8 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl font-bold text-text-primary">Everything You Need to Build</h1>
        <p className="text-sm text-text-secondary">
          Guides, API references, smart contract docs, and integration tutorials — all in one place.
        </p>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled pointer-events-none" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null) }}
          placeholder="Search documentation…"
          className="w-full h-11 bg-card border border-border rounded-lg pl-11 pr-10 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary transition-colors"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Quick tabs ── */}
      {!showSearch && !showArticle && (
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => openArticle(ALL_ARTICLES.find(a => a.id === tab.articleId)!)}
              className="px-4 py-1.5 rounded-full border border-border text-sm text-text-secondary hover:border-primary hover:text-text-primary transition-colors"
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Search results ── */}
      {showSearch && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          {searchResults.length === 0 ? (
            <div className="text-center py-10 text-sm text-text-secondary">
              No articles match &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map(a => (
                <button
                  key={a.id}
                  onClick={() => openArticle(a)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors text-left group"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary group-hover:text-text-link">{a.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{a.category}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-text-disabled">
                    <span className="text-xs">{a.readTime}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Article view ── */}
      {showArticle && (
        <ArticleView
          article={selected}
          onBack={goBack}
        />
      )}

      {/* ── Category grid ── */}
      {!showSearch && !showArticle && (
        <>
          {CATEGORIES.map(cat => (
            <section key={cat.id} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <cat.Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">{cat.label}</h2>
                  <p className="text-xs text-text-secondary">{cat.description}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                {cat.articles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => openArticle(article)}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-card border border-border hover:border-primary transition-colors text-left group"
                  >
                    <span className="text-sm text-text-primary group-hover:text-text-link leading-snug pr-3">
                      {article.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 text-text-disabled">
                      <Clock className="h-3 w-3" />
                      <span className="text-[11px] whitespace-nowrap">{article.readTime}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => openArticle(cat.articles[0])}
                className="flex items-center gap-1 text-xs text-text-link hover:underline underline-offset-2"
              >
                View all {cat.label} docs <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </section>
          ))}

          {/* ── Footer CTA ── */}
          <div className="mt-8 border border-border rounded-xl p-6 text-center bg-card space-y-3">
            <p className="text-sm font-semibold text-text-primary">Can&apos;t find what you&apos;re looking for?</p>
            <p className="text-xs text-text-secondary">Our team typically responds in under 2 hours.</p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <Link
                href="/dashboard/support"
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Ask Support
              </Link>
              <a
                href="https://docs.mantlemandate.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-sm text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
              >
                View External Docs <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
