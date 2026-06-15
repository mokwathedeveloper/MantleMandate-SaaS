# New Video Script (English — ~5 min)

**Suggested title:** "MantleMandate — AI Trading Mandates with On-Chain Reputation & IPFS-Verified Reasoning"

---

## On "ERC-8004 / sub-200ms" — is it relevant?

Don't copy that claim directly. ERC-8004 is a specific (draft) Ethereum standard for "Trustless Agents" identity/reputation. We haven't implemented or conformed to that standard — claiming it would be a false standards-compliance claim a judge could check and call out. The "sub-200ms" latency figure is also something Alpha Hound states but never benchmarks publicly — we shouldn't invent a number we haven't measured either.

But here's the good news: we don't need to borrow it. We already have something more concrete than Alpha Hound's claim:

- **AgentReputationRegistry** (README.md:133-141) — a deployed, verified, 19-test-covered contract that does pre-execution reasoning commitments + on-chain reputation tracking (`commitDecision` → `resolveCommitment` → `getReputation`)
- **Plus the IPFS reasoning trail via Pinata** (shipped today) — every commitment's reasoning is content-addressed and pinned, independently fetchable from any IPFS gateway

That's "permanently log every agent decision on-chain" — done, tested, and live — vs. Alpha Hound's repo-only claim with a placeholder team member. We should lean into that contrast, not borrow their phrasing.

README.md has already been updated to reflect the Pinata integration (architecture section + project structure — `lib/ipfs.ts` now listed).

---

## Chapter 1 — Intro & Login (0:00–0:30)

> "This is MantleMandate — a DeFi treasury platform where you write trading rules in plain English, and AI enforces them on-chain, on Mantle."

**[Show login → dashboard]**

---

## Chapter 2 — Writing a Mandate (0:30–1:15)

> "Here I write a mandate in plain English: 'Buy ETH when RSI drops below 30, sell near 70, with a 2% stop loss and 5% risk per trade.' Claude AI parses this into a structured policy — asset, trigger, risk limits — in seconds."

**[Type mandate → show parsed JSON/policy preview]**

---

## Chapter 3 — On-Chain Anchoring (1:15–2:00)

> "I click 'Anchor Policy On-Chain' and sign with MetaMask. The policy hash is now immutably recorded in our MandatePolicy contract on Mantle Sepolia — anyone can verify this exact strategy was committed to before a single trade happened."

**[Show MetaMask sign → Mantle Explorer tx]**

---

## Chapter 4 — Deploying the Agent & Decision Pipeline (2:00–2:50)

> "Now I deploy an AI agent for this mandate. Every cycle, it pulls live Bybit price data, computes RSI(14), and sends that — plus the mandate — to Claude. Claude returns an action, a confidence score, and a one-sentence reasoning. If confidence is below 65, or data's unavailable, the agent holds — fail closed, never guesses."

**[Show agent detail page → live RSI value + Claude's reasoning text]**

---

## Chapter 5 — Real On-Chain Execution (2:50–3:30)

> "When the mandate triggers, the agent executes a real swap — mUSD to mWETH — on our deployed MockSwapPool AMM on Mantle Sepolia. This isn't simulated. Here's the live swap transaction and the resulting OrderExecuted event on AgentExecutor."

**[Show trade row → linked tx hashes on Mantle Explorer]**

---

## Chapter 6 — On-Chain Reputation + IPFS Audit Trail (NEW) (3:30–4:30)

> "Here's what's new: before the agent acts, it commits a hash of its full reasoning — the price, RSI, confidence, everything — to our AgentReputationRegistry contract. That's a timestamped, on-chain record of what it decided and why, before it acted. The registry also tracks the agent's reputation: how many decisions it's committed, executed, and resolved over time.
>
> And the reasoning itself isn't just a hash — it's pinned to IPFS via Pinata. Click this link, and you get the full reasoning JSON, served from a public IPFS gateway, completely independent of our servers. Anyone — a judge, an auditor, another agent — can verify exactly why this trade happened."

**[Click IPFS link on a trade row → show the gateway page with raw reasoning JSON loading]**

---

## Chapter 7 — Risk Engine & Dashboard (4:30–5:00)

> "Everything ties together on the dashboard — portfolio, risk exposure, on-chain audit trail, and reputation score per agent. Six contracts deployed and verified on Mantle Sepolia, built for the AI Trading & Strategy track."

**[Show risk page → dashboard overview → agent reputation score]**
