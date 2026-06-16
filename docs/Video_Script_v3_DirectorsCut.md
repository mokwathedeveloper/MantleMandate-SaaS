# MantleMandate — Director's Cut Video Script
### "AI Trading Mandates with On-Chain Reputation, IPFS Audit Trail & MCP"
**Target length: ~6 min | Track: AI Trading & Strategy**

---

## BEFORE YOU HIT RECORD — Setup Checklist

Do this BEFORE you start recording so nothing interrupts you mid-video.

### Browser tabs to open (in this order):
1. `http://localhost:3000/dashboard` — your local dev app (logged in as your test account)
2. `https://sepolia.mantlescan.xyz/address/0xbC8419baDaa69649940F2D4dDC01a2CFDEb408f6` — AgentExecutor on Mantle Explorer
3. `https://ipfs.io/ipfs/` — have this open, you'll paste a CID into it live
4. Claude Desktop app — open and connected to MantleMandate MCP (see Bonus chapter setup)

### Window / screen:
- Use a **1920×1080** browser window, fullscreen
- Zoom browser to **90%** so more content is visible
- Turn off browser notifications (Settings → Notifications → Block)
- Close all other windows/apps that could pop notifications

### App state to prepare:
- Have **one mandate already created** named: `"ETH Conservative Buyer — RSI Strategy"`
- Have **one AI agent already deployed** for that mandate (status: Active)
- Have **one completed trade** visible in the Trades page
- Have **one On-Chain Audit entry** visible (from your real transaction)
- Be **logged in** — don't start on the login screen

---

## CHAPTER 1 — Hook & Dashboard (0:00–0:30)

### 🎤 SAY:
> "This is MantleMandate. You write a trading rule in plain English — AI enforces it on-chain, on Mantle. Every decision is committed, every trade is verifiable, and every reasoning step is pinned to IPFS before a single dollar moves."

### 👆 DO — click by click:
1. Start on `/dashboard` — the main dashboard page
2. Let the page sit for 2–3 seconds so the judge can take in the layout
3. Slowly scroll DOWN just enough to show the KPI cards (Total Value, P&L, Active Agents)
4. Scroll back UP to the top

### 📸 WHAT SHOULD BE ON SCREEN:
- Dashboard with real KPI numbers (even if small — $0 is fine, don't fake it)
- Sidebar showing all navigation items
- The "Policy Engine Online" green dot in the right rail

---

## CHAPTER 2 — Writing a Mandate (0:30–1:15)

### 🎤 SAY:
> "Let me show you how a mandate works. I click 'Mandates' in the sidebar — and here's one I already created: Buy ETH when RSI drops below 30, sell when it reaches 70, 2% stop loss, 5% risk per trade. I wrote that in plain English. Claude AI parsed it into a structured policy — asset, trigger, risk limits — in under two seconds."

### 👆 DO — click by click:
1. Click **"Mandates"** in the left sidebar
2. The list of mandates appears — point at your `ETH Conservative Buyer` mandate card
3. Click on that mandate card to open the detail page
4. On the mandate detail page:
   - Point at the **"Trigger"** field showing `RSI < 30`
   - Point at the **"Stop Loss"** field showing `2%`
   - Point at the **"Risk Per Trade"** field showing `5%`
5. Click **"Edit"** button (top right of the mandate detail)
6. You'll see the mandate text box — point at the plain-English text
7. Press **ESC** or click **Cancel** to close without changing anything

### 📸 WHAT SHOULD BE ON SCREEN:
- Mandate detail page with the structured fields filled in
- The original plain-English mandate text visible in edit mode

---

## CHAPTER 3 — On-Chain Policy Anchoring (1:15–2:00)

### 🎤 SAY:
> "Before any trade happens, the strategy is anchored on-chain. When I clicked 'Anchor Policy On-Chain', MetaMask asked me to sign a transaction — and the policy hash was recorded in our MandatePolicy contract on Mantle Sepolia. Immutable. Timestamped. Anyone can verify this exact strategy existed before trade one."

### 👆 DO — click by click:
1. Stay on the mandate detail page
2. Scroll down to find the **"On-Chain Status"** or **"Policy Hash"** section
3. Point at the contract address link (it should link to Mantle Explorer)
4. Click that link — it opens the Mantle Explorer in a new tab
5. On Mantle Explorer: point at the **"Contract"** tab, then point at the recent transaction in the history
6. Switch back to your app tab

### 📸 WHAT SHOULD BE ON SCREEN:
- Mandate detail with the on-chain policy hash visible
- Mantle Explorer showing the MandatePolicy contract with transactions

---

## CHAPTER 4 — The AI Agent & Decision Pipeline (2:00–2:50)

### 🎤 SAY:
> "Now the agent. Every 30 seconds it runs a decision cycle: pull live price data, compute RSI(14), send that plus the mandate to Claude Haiku. Claude returns an action — Buy, Sell, or Hold — a confidence score from 0 to 100, and one sentence of reasoning. If confidence is below 65, or data is unavailable, the agent holds. Fail-closed. It never guesses."

### 👆 DO — click by click:
1. Click **"AI Agents"** in the left sidebar
2. Click on your agent card (the one linked to the ETH mandate)
3. You're now on the agent detail page — point at:
   - **Status badge** (should say "Active" in green)
   - **Capital** field showing the allocation
   - **Total PnL** field
4. Look for the **"Activity"** or **"Logs"** tab on the agent page — click it
5. Point at a recent log entry that shows:
   - The action taken (BUY/SELL/HOLD)
   - The confidence score
   - The reasoning text from Claude
6. If you can see a **"Tick Now"** button, click it — wait 3–4 seconds — a new log entry will appear

### 📸 WHAT SHOULD BE ON SCREEN:
- Agent detail page with status "Active"
- Log/activity tab showing Claude's reasoning text and confidence score

---

## CHAPTER 5 — Real On-Chain Trade Execution (2:50–3:30)

### 🎤 SAY:
> "When the mandate triggers, the agent executes a real swap on our deployed MockSwapPool AMM — mUSD to mWETH — on Mantle Sepolia. This is a real on-chain transaction. Not simulated. Here's the OrderExecuted event from the AgentExecutor contract, timestamped on Mantle Sepolia."

### 👆 DO — click by click:
1. Click **"On-Chain Audit"** in the left sidebar
2. The audit page loads — wait 3–5 seconds for the on-chain data to fetch
3. You'll see:
   - **Total Transactions: 1** (or however many you have)
   - **Last 24 Hours: 1 transaction**
   - A green banner: "1 live on-chain transaction fetched from the AgentExecutor contract"
4. Point at the transaction row in the table:
   - Point at the **TX Hash** (starts with 0x51c4...)
   - Point at the **Block number** (#39,965,644)
   - Point at the **Amount** ($50.00)
   - Point at the **SUCCESS** badge
5. Click **"Explorer"** link in the Actions column on that row
6. Mantle Explorer opens — you're now looking at the REAL transaction on-chain
7. Point at the **"Logs"** tab on Mantle Explorer — click it
8. Point at the **OrderExecuted** event in the logs

### 📸 WHAT SHOULD BE ON SCREEN:
- Audit page with a real transaction showing (not "No on-chain activity")
- Mantle Explorer showing the OrderExecuted event log

---

## CHAPTER 6 — On-Chain Reputation + IPFS Reasoning (3:30–4:30)

### 🎤 SAY:
> "Here's where MantleMandate goes further. Before the agent acts, it commits a hash of its full reasoning — the price, RSI value, confidence score, everything — to our AgentReputationRegistry contract on Mantle Sepolia. That's a timestamped, on-chain record of what it decided and why, before it acted. The registry tracks the agent's reputation: how many decisions committed, executed, and resolved over time.
>
> But we don't stop at the hash. The full reasoning JSON is pinned to IPFS via Pinata. Here — click this IPFS link on the trade row — and you get the complete reasoning, served from a public IPFS gateway, completely independent of our servers. Any judge, auditor, or other AI agent can verify exactly what this agent was thinking before it traded."

### 👆 DO — click by click:
1. Switch back to your app tab (On-Chain Audit page)
2. Click on the transaction row to expand its detail panel
3. In the expanded detail, look for the **"IPFS Reasoning"** or **"Decision Hash"** link
4. Click the IPFS link — it opens `https://ipfs.io/ipfs/<CID>`
5. The page loads and shows the raw JSON reasoning object, e.g.:
   ```json
   {
     "action": "BUY",
     "confidence": 82,
     "reasoning": "RSI at 28 is below the 30 threshold...",
     "price": 2847.33,
     "rsi": 28,
     "timestamp": "2026-06-15T01:26:01Z"
   }
   ```
6. Point at the **action**, **confidence**, and **reasoning** fields
7. Go back to your app — click **"AI Agents"** → open the agent
8. Scroll to find the **reputation section** — point at:
   - **Total Committed** counter
   - **Total Executed** counter
   - **Total Resolved** counter

### 📸 WHAT SHOULD BE ON SCREEN:
- IPFS gateway showing raw reasoning JSON
- Agent reputation counters from AgentReputationRegistry

---

## CHAPTER 7 — Risk Engine & Dashboard Overview (4:30–5:00)

### 🎤 SAY:
> "Everything ties together. The risk engine monitors drawdown, position size, and stop-loss limits in real-time. The dashboard shows portfolio value, P&L, and reputation scores per agent — all derived from real Supabase data and live on-chain reads. Six smart contracts deployed and verified on Mantle Sepolia. Built for the AI Trading & Strategy track."

### 👆 DO — click by click:
1. Click **"Risk Engine"** in the left sidebar — briefly show the page
2. Click **"Portfolio"** in the sidebar — briefly show it
3. Click **"Dashboard"** — return to the main dashboard
4. Point at the right rail:
   - **"Policy Engine Online"** green dot
   - **"Quick Actions → Run Audit"** button
5. Click **"Run Audit"** — the modal opens, click **"Start Audit"**
6. Wait 5–7 seconds while it scans Mantle Sepolia
7. It returns: **"Found 1 on-chain order execution in the last 43,200 blocks"**
8. Click **"View Audit Log →"** to land back on the audit page
9. Smile. You're done with the main demo.

---

## BONUS CHAPTER — MCP: AI Agents Can Talk To MantleMandate (5:00–5:45)

> This is your differentiator. Show it with confidence. No other project in this hackathon has shipped a live MCP server that an AI assistant can call.

### 🎤 SAY:
> "One more thing — and this is the bonus. MantleMandate ships a live Model Context Protocol server. MCP is the standard that lets AI assistants like Claude directly call tools and query systems. We've exposed three tools: search our documentation, get our live contract addresses on Mantle Sepolia, and get the mandate policy schema so any AI can draft a valid mandate. Let me show you — here's Claude Desktop, connected to MantleMandate's MCP server right now."

### 👆 DO — click by click:

#### SETUP (do this BEFORE recording — not on camera):
You need **Claude Desktop** installed. Add this to your Claude Desktop config file:

- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mantlemandate": {
      "url": "https://mantle-mandate-saa-s.vercel.app/api/mcp"
    }
  }
}
```
Restart Claude Desktop. You'll see "mantlemandate" appear as a connected server.

#### ON CAMERA:
1. Switch to **Claude Desktop**
2. Start a new conversation
3. Type (slowly, so camera can see it):
   > `"What are the MantleMandate contract addresses on Mantle Sepolia?"`
4. Hit Enter — Claude will call the `get_contract_addresses` tool automatically
5. Point at the tool call appearing in the UI (it shows "Using mantlemandate → get_contract_addresses")
6. Claude responds with the live JSON: all 6 contract addresses
7. Type a second message:
   > `"How do I write a mandate that buys MNT when RSI is below 25?"`
8. Claude calls `search_docs` and returns relevant documentation
9. Point at the screen and say:

### 🎤 SAY:
> "Claude just called our MCP server — live — to fetch real contract addresses and search our documentation. This means any AI assistant can integrate with MantleMandate as a tool. That's composability. That's the future of DeFi."

### 📸 WHAT SHOULD BE ON SCREEN:
- Claude Desktop showing the MCP tool being called
- The JSON response with real contract addresses
- The docs search result

---

## CLOSING (5:45–6:00)

### 🎤 SAY:
> "MantleMandate — write trading rules in English, enforce them on-chain, verify every decision on IPFS, and let AI assistants connect via MCP. All live on Mantle Sepolia. Thank you."

### 👆 DO:
1. Switch back to the dashboard
2. Let the camera rest on the dashboard for 5 seconds
3. Stop recording

---

## COMMON MISTAKES TO AVOID

| ❌ Don't | ✅ Do instead |
|---|---|
| Rush through screens | Pause 2–3 seconds on each important element |
| Forget to wait for on-chain data to load | Wait for the green "1 live transaction" banner before pointing at the audit table |
| Click on a broken or loading page | Reload the page 30 seconds before you start recording so everything is cached |
| Start with a login screen | Be already logged in before you hit record |
| Scroll too fast | Slow, smooth scrolls — pause at every section |
| Apologize or say "um" | Keep narration confident, even if you make a small mistake |

---

## THE ONE-LINER TO REPEAT (put this in your project description too)

> **"Write it in English. AI enforces it on-chain. Every decision is committed before it executes, reasoned on IPFS, and verifiable by anyone — including other AI agents via MCP."**
