
# MantleMandate-SaaS Features

## Core Features

### 1. **Dashboard for Performance Tracking**
   - Displays **Net Asset Value (NAV)**, **ROI**, **gross trading volume**, and **active mandates**.
   - Tracks **recent trades**, **drawdown**, **venue split**, and provides **explorer links** for transaction transparency.

### 2. **Plain-English Mandate Editor**
   - Users can create mandates using plain English.
   - Automatically compiles mandates into **structured, enforceable policy** for the AI to follow.
   - Validates the policies and outputs a **policy hash** for on-chain transparency.

### 3. **AI Trading Agent Deployment & Monitoring**
   - Create, configure, and deploy trading agents to execute mandates across Mantle's DeFi protocols (e.g., **Merchant Moe**, **Agni Finance**, and **Fluxion**).
   - Includes functionalities to **bind execution wallets**, set capital caps, and schedule trading activities.

### 4. **On-Chain Audit Viewer**
   - View a **public audit trail** of every decision, trade, and policy execution.
   - Displays **decision hashes**, **trade hashes**, and **performance snapshots**.
   - Ensures **verifiable transparency** with public explorer links.

### 5. **Real-Time Alerts**
   - Sends alerts for **mandate breaches**, **drawdown limits**, and **execution failures**.
   - Provides notifications on issues such as **low gas** or **approvals needed** for trade execution.

### 6. **Reports & Exporting**
   - Provides detailed **daily/weekly performance reports**.
   - Includes **venue summaries**, **slippage breakdowns**, and **CSV export** options for further analysis.

### 7. **Security and Compliance**
   - Integrates **wallet security** via **multisig** and **access control** for role-based permissions.
   - Implements **risk management features** like **max notional per trade**, **drawdown limits**, and **cooldown periods**.

### 8. **Multi-Protocol Integration**
   - Supports **Merchant Moe**, **Agni Finance**, and **Fluxion** for quote and execution.
   - Normalizes trade execution across different decentralized finance protocols.

### 9. **API Integration & Data Ingestion**
   - Integrates **Bybit** for read-only market data (e.g., spot, perpetual ticker, and trend confirmation) as signal sources, while using **Mantle’s protocols** for execution.
   - Fetches **on-chain states** and protocol information in real-time to make trading decisions.

### 10. **Risk Engine & Venue Planner**
    - Ensures that trades follow **predefined risk parameters** and selects appropriate venues for execution (Merchant Moe, Agni, Fluxion).
    - Prevents risky or excessive trades via **deterministic rules**.

## Conclusion
These features align directly with the hackathon's judging criteria, emphasizing **autonomous AI trading agents**, **on-chain transparency**, and **trading volume/ROI**. The platform is designed to showcase innovation in **DeFi portfolio management** and **AI-powered asset management**.
