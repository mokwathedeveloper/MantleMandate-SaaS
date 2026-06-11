// Lightweight retrieval index over the docs articles in
// frontend/app/dashboard/docs/page.tsx. Used by the support chat
// (frontend/app/api/support/chat/route.ts) to ground replies in the
// platform's actual documentation instead of generic model knowledge.

export interface DocEntry {
  id:       string   // matches an article id in dashboard/docs/page.tsx (deep-link target)
  title:    string
  category: string
  keywords: string[]
  summary:  string
}

export const DOCS_KB: DocEntry[] = [
  // ── Getting Started ─────────────────────────────────────────────
  {
    id: 'write-first-mandate',
    title: 'Write your first mandate',
    category: 'Getting Started',
    keywords: ['mandate', 'write mandate', 'create mandate', 'new mandate', 'parse', 'deploy mandate', 'policy hash', 'plain english'],
    summary: 'A mandate is a plain-English description of your trading strategy that Claude compiles into a structured, on-chain policy. Go to Dashboard → Mandates → New Mandate, write your strategy (entry, exit, and risk rules), click Parse Mandate to review the JSON policy Claude extracts, then click Deploy Mandate to hash it (keccak256) and store the hash on MandatePolicy.sol on Mantle. Your private key never leaves your wallet — only the policy hash is stored on-chain.',
  },
  {
    id: 'deploy-first-agent',
    title: 'Deploy your first AI agent',
    category: 'Getting Started',
    keywords: ['agent', 'deploy agent', 'paper mode', 'live mode', 'allocation', 'position size', 'AgentExecutor'],
    summary: 'An agent is an automated process bound to one mandate that monitors markets and executes trades when its conditions are met. Prerequisites: a deployed mandate, a connected wallet, and Bybit API keys (Read + Trade) added in Settings → API Keys. Use the 4-step wizard at Dashboard → Agents → Deploy New Agent to pick your mandate, set capital allocation, max position size, allowed pairs, and execution mode — start in Paper mode before switching to Live. Deploying calls AgentExecutor.sol on Mantle (gas typically under $0.01).',
  },
  {
    id: 'connect-wallet',
    title: 'Connect your wallet',
    category: 'Getting Started',
    keywords: ['wallet', 'connect wallet', 'metamask', 'walletconnect', 'mantle network', 'chain id', 'switch network', 'non-custodial', 'disconnect'],
    summary: 'MantleMandate is fully non-custodial — your private key never leaves your device. Supported wallets: MetaMask, WalletConnect (300+ wallets), and any EIP-1193 injected provider. Click Connect Wallet, approve, and sign a free message to prove ownership. If needed, switch to Mantle Mainnet (chain ID 5000) or Mantle Sepolia testnet (chain ID 5003). Disconnect from Dashboard → Wallets — this does not revoke on-chain permissions for already-deployed mandates.',
  },
  {
    id: 'risk-parameters',
    title: 'Understanding risk parameters',
    category: 'Getting Started',
    keywords: ['risk parameters', 'drawdown', 'max drawdown', 'stop loss', 'max notional', 'riskguard', 'circuit breaker', 'position sizing'],
    summary: 'Risk parameters are safety guardrails enforced on-chain by RiskGuard.sol that the agent cannot bypass. Max Drawdown % pauses the agent once the portfolio falls that much from its peak. Max Notional per Trade caps the USD size of any single order. Stop-Loss % auto-closes a position once it moves against you by that percentage from entry. Recommended starting points: 10–15% max drawdown (conservative), 2–3% max notional per trade, 2–4% stop-loss for spot — never set max drawdown above 25% for fully automated strategies.',
  },

  // ── Core Concepts ────────────────────────────────────────────────
  {
    id: 'what-is-mandate',
    title: 'What is a Mandate?',
    category: 'Core Concepts',
    keywords: ['mandate', 'what is a mandate', 'governance', 'lifecycle', 'mandatepolicy'],
    summary: "A mandate is MantleMandate's core governance primitive — a plain-English trading strategy that Claude compiles into a structured, cryptographically verifiable policy stored on Mantle. Lifecycle: Write → Parse → Hash (keccak256) → Register on MandatePolicy.sol → Execute → Audit. Mandates can specify asset pairs, entry/exit triggers, position sizing, time constraints, and risk limits — but cannot override RiskGuard.sol's on-chain hard limits, access funds outside the agent's allocation, or trade unwhitelisted pairs/protocols.",
  },
  {
    id: 'agent-lifecycle',
    title: 'AI Agent Lifecycle',
    category: 'Core Concepts',
    keywords: ['agent lifecycle', 'agent status', 'running', 'paused', 'stopped', 'circuit breaker', 'execution loop', 'resume agent'],
    summary: 'An agent moves through states: DEPLOYING, RUNNING, PAUSED, STOPPED, COMPLETED. Every 30 seconds a RUNNING agent fetches market data from Bybit, reads on-chain state from Mantle, calls the AI decision engine, validates any proposed order against RiskGuard.sol, and if approved submits the order to Bybit and emits an OrderExecuted event. Circuit breakers auto-pause the agent on a drawdown breach, an oversized order, three consecutive API errors, or an unverifiable policy hash. Resume from Dashboard → Agents after resolving the underlying issue — resuming without fixing it re-triggers the same pause.',
  },
  {
    id: 'onchain-execution',
    title: 'On-Chain Execution Model',
    category: 'Core Concepts',
    keywords: ['on-chain', 'mantle network', 'mandatepolicy', 'agentexecutor', 'riskguard', 'audit trail', 'explorer', 'transaction flow'],
    summary: 'MantleMandate uses Mantle Network — an EVM-compatible Layer 2 with sub-cent gas and near-instant finality — as its settlement and audit layer. Three contracts power execution: MandatePolicy.sol (stores/verifies policy hashes), AgentExecutor.sol (registers agents and emits OrderExecuted events), and RiskGuard.sol (validates each order against risk limits before execution). Every trade flows: AI decision → order placed on Bybit → AgentExecutor.executeOrder() → OrderExecuted event visible on Mantle Explorer. The on-chain record is immutable, even after a mandate is revoked.',
  },
  {
    id: 'risk-engine-deep-dive',
    title: 'Risk Engine Deep Dive',
    category: 'Core Concepts',
    keywords: ['risk engine', 'validateorder', 'riskguard', 'two-layer', 'drawdown limit', 'basis points', 'ai pre-check'],
    summary: "The risk engine is two layers. Layer 1 is an off-chain AI pre-check: before proposing an order, the AI verifies it's within the mandate's position sizing, drawdown limit, trading hours, and stop-loss rules — if any check fails, the cycle is skipped with no blockchain transaction. Layer 2 is RiskGuard.sol's on-chain validateOrder(), an independent check against the limits set in Dashboard → Risk that reverts if notional or drawdown limits are exceeded or the agent isn't registered for the policy hash. The on-chain layer is the unforgeable backstop — it applies even if the mandate text requests a higher risk than RiskGuard allows.",
  },

  // ── API Reference ────────────────────────────────────────────────
  {
    id: 'auth-jwt',
    title: 'Authentication & JWT tokens',
    category: 'API Reference',
    keywords: ['authentication', 'jwt', 'token', 'bearer token', 'supabase auth', 'refresh token', '401', '403', 'login api'],
    summary: 'All MantleMandate API endpoints require a Supabase Auth JWT, attached automatically when signed in via the dashboard. For direct API access, POST credentials to /auth/v1/token?grant_type=password to receive an access_token (expires in 1 hour) and a refresh_token. Pass the access token as `Authorization: Bearer <token>` on every request, and use grant_type=refresh_token to get a new access token without re-entering credentials. 401 means a missing or invalid token; 403 means a valid token without permission for that resource.',
  },
  {
    id: 'mandates-endpoints',
    title: 'Mandates endpoints',
    category: 'API Reference',
    keywords: ['mandates api', 'GET /api/mandates', 'parse endpoint', 'deploy mandate api', 'policyhash', 'rest api'],
    summary: 'The Mandates API: GET /api/mandates lists your mandates with id, name, status, policyHash, and agentCount. POST /api/mandates/parse previews the JSON policy and policyHash Claude would generate from plain-English mandate text without deploying it. POST /api/mandates deploys a mandate on-chain, returning the policyHash, txHash, and an explorerUrl. GET /api/mandates/:id retrieves a single mandate object.',
  },
  {
    id: 'agents-deploy',
    title: 'Agents & deploy lifecycle',
    category: 'API Reference',
    keywords: ['agents api', 'deploy agent api', 'pause agent', 'resume agent', 'agent logs', 'decision log'],
    summary: 'The Agents API: GET /api/agents lists agents with id, mandateId, status, allocation, and pnl. POST /api/agents deploys a new agent (mandateId, allocation, maxPositionPct, pairs, mode: "paper"|"live"), returning status DEPLOYING and a txHash. PATCH /api/agents/:id with {"action": "pause"|"resume"|"stop"} controls the agent lifecycle. GET /api/agents/:id/logs?limit=50 returns the agent\'s recent decision log, including reason strings like "RSI(1h)=28.4 < 30 threshold".',
  },
  {
    id: 'websocket-stream',
    title: 'WebSocket event stream',
    category: 'API Reference',
    keywords: ['websocket', 'realtime', 'event stream', 'order_executed', 'agent_paused', 'drawdown_alert', 'supabase realtime'],
    summary: 'The WebSocket event stream (powered by Supabase Realtime) delivers real-time updates without polling. Event types include ORDER_EXECUTED, AGENT_PAUSED, AGENT_RESUMED, DRAWDOWN_ALERT (at 80% of limit), and MANDATE_BREACH. All events are also persisted to the trades and agent_logs tables and queryable via the REST API.',
  },

  // ── Smart Contracts ──────────────────────────────────────────────
  {
    id: 'mandate-policy-contract',
    title: 'MandatePolicy — store & verify',
    category: 'Smart Contracts',
    keywords: ['mandatepolicy.sol', 'registerpolicy', 'verifypolicy', 'revokepolicy', 'smart contract', 'policy hash'],
    summary: 'MandatePolicy.sol is the immutable on-chain registry of mandate policy hashes, deployed on Mantle Sepolia testnet. registerPolicy(policyHash, agent) is called when you deploy a mandate and emits PolicyRegistered. verifyPolicy(policyHash, agent) is called by AgentExecutor before every trade, returning true only if the agent is registered under that hash. revokePolicy(policyHash) permanently stops the agent (past executions remain on-chain) and emits PolicyRevoked.',
  },
  {
    id: 'agent-executor-contract',
    title: 'AgentExecutor — execute trades',
    category: 'Smart Contracts',
    keywords: ['agentexecutor.sol', 'executeorder', 'orderexecuted', 'smart contract', 'audit event'],
    summary: 'AgentExecutor.sol is the execution gateway on Mantle Sepolia testnet. executeOrder(policyHash, pair, notionalUSD, side, externalOrderId) is called by the off-chain engine after a Bybit order is placed — it verifies the policy hash, calls RiskGuard, and on success emits the OrderExecuted event, the canonical on-chain trade record shown in the Audit tab. Failure modes: PolicyNotFound, AgentNotAuthorized, and RiskCheckFailed (with a reason string).',
  },
  {
    id: 'risk-guard-contract',
    title: 'RiskGuard — enforce limits',
    category: 'Smart Contracts',
    keywords: ['riskguard.sol', 'setlimits', 'validateorder', 'basis points', 'smart contract', 'on-chain risk limits'],
    summary: 'RiskGuard.sol is the on-chain enforcement layer for risk limits, deployed on Mantle Sepolia testnet — the final, unforgeable check no agent can bypass. setLimits(agent, maxDrawdownBps, maxNotionalUSD, stopLossBps) (owner-only) is called when you save risk parameters in Dashboard → Risk. validateOrder(agent, policyHash, notionalUSD, currentDrawdownBps) returns false with a human-readable reason if any limit is breached. Limits use basis points: 100 bps = 1%, 1500 bps = 15%.',
  },
  {
    id: 'contract-addresses',
    title: 'Contract addresses & ABIs',
    category: 'Smart Contracts',
    keywords: ['contract addresses', 'abi', 'mantle sepolia', 'mantle explorer', 'viem', 'typechain', 'mainnet'],
    summary: 'All MantleMandate contracts (MandatePolicy, AgentExecutor, RiskGuard) are deployed on Mantle Sepolia testnet (chain ID 5003) and verified on Mantle Explorer (explorer.sepolia.mantle.xyz), where you can read ABIs and call read-only functions directly. ABIs are also available in blockchain/typechain-types/, auto-generated via Hardhat + TypeChain. Contracts can be queried directly with viem\'s createPublicClient against the Mantle Sepolia RPC.',
  },

  // ── Mandate Syntax ───────────────────────────────────────────────
  {
    id: 'indicators-triggers',
    title: 'Supported indicators & triggers',
    category: 'Mandate Syntax',
    keywords: ['rsi', 'macd', 'moving average', 'volume', 'trading hours', 'indicators', 'triggers', 'technical indicators'],
    summary: 'Claude recognizes a wide range of indicators in mandate text. Price-based: "price above $X", "price above 200-day MA", "price within X% of 52-week high", breakout triggers. Momentum: RSI(14) thresholds, MACD crossovers/histogram, stochastic RSI. Volume: "volume 2x 20-day average", OBV trends. Time-based: trading-hour windows, "close all positions by Friday 6pm UTC", max hold time, weekend exclusions. Combine triggers with AND/OR for compound conditions.',
  },
  {
    id: 'risk-rule-syntax',
    title: 'Risk rule syntax reference',
    category: 'Mandate Syntax',
    keywords: ['risk rule syntax', 'stop loss', 'take profit', 'trailing stop', 'max_risk_pct', 'scale out', 'position sizing'],
    summary: 'Claude maps natural-language risk phrasing to policy fields: "never risk more than 2% per trade" → max_risk_pct; "maximum position size $500" → max_notional_usd; "stop-loss at 3%" → stop_loss_pct; "trailing stop at 2%" → trailing_stop_pct; "take profit at 8% gain" → take_profit_pct; scale-out instructions → a scale_out array; "pause if daily loss exceeds 5%" → daily_drawdown_limit_pct; "stop trading if portfolio drops 15%" → max_drawdown_pct. Mandate risk rules and Dashboard → Risk parameters are independent — the stricter of the two always applies.',
  },
  {
    id: 'example-mandates',
    title: 'Example mandates library',
    category: 'Mandate Syntax',
    keywords: ['example mandates', 'sample strategy', 'rsi mean reversion', 'trend following', 'multi-asset rotation', 'defi yield', 'copy mandate'],
    summary: 'A library of ready-to-use mandate examples you can paste into New Mandate: an RSI Mean Reversion (Conservative) strategy for ETHUSDT (buy on 1h RSI < 28 with daily RSI > 40, sell at RSI 60 or +6%, 3% stop-loss, 1.5% max risk); a Trend Following (Moderate) strategy for BTCUSDT using the 50-day MA and MACD; a Multi-Asset Rotation (Aggressive) strategy rotating weekly between ETHUSDT/BTCUSDT/MANTUSDT by RSI momentum; and a DeFi Yield Entry strategy for MANTUSDT based on 30-day lows and volume.',
  },
  {
    id: 'common-mistakes',
    title: 'Common mistakes & gotchas',
    category: 'Mandate Syntax',
    keywords: ['common mistakes', 'mandate errors', 'troubleshooting mandate', 'agent not trading', 'conflicting rules', 'missing exit'],
    summary: 'Common mandate-writing mistakes: (1) conflicting or vague rules like "never buy in a downtrend" that the parser cannot quantify — be specific (e.g. "price above the 200-day moving average"); (2) missing exit conditions, which leaves the agent holding indefinitely — every entry needs an exit, stop-loss, and take-profit; (3) more than 4–5 compound AND conditions, which rarely all trigger together so the agent never trades; (4) omitting risk limits, which falls back to a default 2% max notional; (5) forgetting that Dashboard → Risk parameters override mandate risk text — the stricter of the two wins.',
  },

  // ── Integrations ─────────────────────────────────────────────────
  {
    id: 'webhook-setup',
    title: 'Webhook events setup',
    category: 'Integrations',
    keywords: ['webhooks', 'webhook setup', 'order.executed', 'hmac signature', 'push notifications'],
    summary: 'Webhooks push real-time event notifications to your own HTTPS server — no polling required. Supported events: order.executed, agent.paused, agent.resumed, drawdown.alert, mandate.breached. Register endpoints at Dashboard → Settings → Webhooks → Add Endpoint. Each payload includes an X-MantleMandate-Signature HMAC-SHA256 header you should verify with crypto.timingSafeEqual using your webhook secret.',
  },
  {
    id: 'slack-telegram',
    title: 'Slack & Telegram alerts',
    category: 'Integrations',
    keywords: ['slack', 'telegram', 'alerts', 'notifications', 'botfather', 'incoming webhook', 'severity levels'],
    summary: 'Get instant trade and risk alerts in Slack or Telegram. Slack: Dashboard → Settings → Notifications → Slack, paste an Incoming Webhook URL from api.slack.com/apps. Telegram: Dashboard → Settings → Notifications → Telegram, get a bot token from @BotFather and your chat ID from @userinfobot, then click Test Connection. Alerts use severity levels: 🟢 INFO (trade executed, agent deployed), 🟡 WARN (drawdown at 80% of limit), 🔴 ERROR (agent paused, mandate breached, trade failed).',
  },
  {
    id: 'walletconnect',
    title: 'WalletConnect integration',
    category: 'Integrations',
    keywords: ['walletconnect', 'qr code', 'mobile wallet', 'rainbow', 'trust wallet', 'coinbase wallet', 'ledger', 'disconnect wallet'],
    summary: 'WalletConnect connects MantleMandate to 300+ mobile and desktop wallets (Rainbow, Trust Wallet, Coinbase Wallet, Ledger Live, etc.) via an encrypted relay session — your private key never leaves your wallet app. On desktop, click Connect Wallet → WalletConnect and scan the QR code; on mobile, choose your installed wallet from the deep-link list. Supports Mantle Mainnet (5000) and Mantle Sepolia (5003) — switch networks if prompted. Disconnect via Dashboard → Wallets, and also remove the session from your wallet app\'s WalletConnect sessions list.',
  },
  {
    id: 'bybit-adapter',
    title: 'Bybit market data adapter',
    category: 'Integrations',
    keywords: ['bybit', 'bybit api', 'api keys', 'rate limits', 'market data', 'order execution', 'spot trading'],
    summary: 'MantleMandate uses the Bybit V5 REST API for market data and order execution, handling auth, rate limiting, and error recovery automatically. Add your Bybit API key/secret at Dashboard → Settings → API Keys → Add Bybit Key — use a dedicated key with only Spot Trade and Read permissions, never your master key. The adapter fetches tickers, OHLCV klines, and wallet balance, and places orders via /v5/order/create. Rate limits: 1,200 requests/min for market data (shared), 10 requests/sec for orders per key. Recommended pairs: ETHUSDT, BTCUSDT, MANTUSDT, SOLUSDT.',
  },
]

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'for', 'with',
  'is', 'are', 'how', 'do', 'does', 'can', 'what', 'when', 'where', 'why',
  'i', 'my', 'your', 'it', 'this', 'that', 'be', 'as', 'at', 'by', 'from',
  'about', 'into', 'will', 'would', 'should', 'you', 'me', 'we',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t))
}

/** Keyword-overlap retrieval over DOCS_KB. No embeddings/vector store —
 *  scores entries by how many query tokens appear in their title, keywords,
 *  or category. A minimum score is required so that a single generic
 *  substring hit (e.g. "policy" inside "MandatePolicy") can't surface an
 *  unrelated doc on its own — only an exact keyword match, or a title hit
 *  combined with another signal, clears the bar. Returns the top `limit`
 *  qualifying entries. */
export function findRelevantDocs(query: string, limit = 2): DocEntry[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const MIN_SCORE = 4

  const scored = DOCS_KB.map(entry => {
    const titleLower = entry.title.toLowerCase()
    const keywordSet = new Set(entry.keywords.map(k => k.toLowerCase()))
    const haystack = `${titleLower} ${entry.category.toLowerCase()} ${entry.keywords.join(' ').toLowerCase()}`

    let score = 0
    for (const token of tokens) {
      if (keywordSet.has(token)) score += 4
      if (titleLower.includes(token)) score += 2
      if (haystack.includes(token)) score += 1
    }
    return { entry, score }
  })

  return scored
    .filter(s => s.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry)
}
