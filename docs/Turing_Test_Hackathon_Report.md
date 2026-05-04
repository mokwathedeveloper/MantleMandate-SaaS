
# Turing Test Hackathon 2026 Report

## **Introduction:**
The **Turing Test Hackathon 2026** challenges participants to build a decentralized, AI-powered application within the **Mantle Network** ecosystem. With a grand prize pool of **$100,000**, the goal of the hackathon is to create innovative solutions that showcase the future potential of **AI**, **Blockchain**, and **Web3 technologies** in practical applications.

This report aims to clarify the **objectives**, **requirements**, and **expectations** of the hackathon, ensuring participants can approach the challenge with a professional, structured mindset. This understanding is vital for creating a winning solution that meets both the technical and strategic needs of the event.

---

## **Hackathon Objective:**
The primary goal of the hackathon is to **build and demonstrate** a fully functional decentralized application (dApp) utilizing **AI-driven strategies** for **trading**, **asset management**, and **risk management**. The platform should showcase the use of the **Mantle Network** and its blockchain capabilities while adhering to strict requirements for transparency, on-chain functionality, and AI integration.

---

## **Key Areas of Focus:**

1. **AI Trading Strategy**:
   - The hackathon seeks **AI-powered trading systems** that can autonomously make trading decisions based on market data.
   - Participants are expected to implement **quantitative trading models**, potentially incorporating **deep learning** or **machine learning** techniques to predict market trends and execute trades on-chain.

2. **AI Alpha Data**:
   - The hackathon emphasizes using AI to **track smart money** and analyze on-chain data.
   - The goal is to create **anomaly detection bots** capable of identifying unusual trading patterns, potentially providing insights into market shifts or significant transactions.

3. **Real-World Asset Integration (RWA)**:
   - The challenge includes **automating risk management** strategies for various **real-world assets** (e.g., USDY, mETH).
   - Participants should focus on **creating dynamic yield strategies** and ensuring that risks are properly managed and executed within the blockchain network.

4. **Blockchain Integration**:
   - The solution must be built on **Mantle’s blockchain infrastructure**. 
   - Smart contracts written in **Solidity** must be deployed to handle trading strategies, risk management, and agent deployment on-chain.

5. **Transparency and Security**:
   - The hackathon emphasizes **radical transparency**. All actions taken by the AI trading agents must be **fully traceable** on-chain.
   - Participants must ensure that user interactions, trades, and agent decisions are visible, immutable, and auditable through the **Mantle blockchain**.

6. **User Experience (UX)**:
   - The platform should be intuitive, with a **clean, professional UI** designed to present key metrics like **ROI**, **trading volume**, and agent performance.
   - The system must be usable for both **novice traders** and **advanced users** alike, with features that ensure easy navigation and control.

---

## **Hackathon Requirements and Criteria**:

1. **Features to be Implemented**:
   - **AI Trading Strategy**: Develop AI quant bots and macro-driven smart contracts, supporting integration with platforms like **Bybit** and utilizing templates in **Python** and **Solidity**.
   - **On-Chain Interaction**: Use **Web3.js** or **Ethers.js** for smart contract deployment and real-time interaction with the blockchain, ensuring every action is recorded and verified on-chain.
   - **Smart Money Tracking & Anomaly Detection**: Build bots to track on-chain anomalies and smart money movements, providing users with insights and data analysis.
   - **Mandate Creation**: Users should be able to create trading mandates using **plain English**, which are then parsed into actionable data for AI trading bots.

2. **Security and Compliance**:
   - The system must comply with best practices in **security**, using **JWT authentication**, and ensuring the **safe storage of user data**.
   - Participants must follow best practices for **secure coding**, including input validation, **encryption** of sensitive data, and ensuring the integrity of smart contracts on the **Mantle Network**.

3. **Submission Requirements**:
   - **Submission Deadline**: June 15, 2026, at 18:59 UTC.
   - **Codebase**: The code should be hosted on **GitHub** or similar repositories. Commit history should reflect structured development, with clear commit messages and branching strategies.
   - **Documentation**: Detailed **README.md** files explaining the project setup, features, and architectural decisions.

---

## **Tech Stack**:

> **Authoritative reference:** `docs/MASTER_Architecture_and_Stack.md`

The confirmed tech stack for MantleMandate:

1. **Frontend — Next.js 14 TypeScript**:
   - **Next.js 14** with App Router (`app/` directory) — TypeScript, `.tsx`/`.ts` files only
   - **Tailwind CSS** for responsive and consistent styling
   - **wagmi + viem** for wallet connections (MetaMask, WalletConnect)
   - **Ethers.js v6** for direct contract reads from the browser
   - **TanStack Query** for server state and caching
   - **Zustand** for global client state (auth, alerts, UI)
   - **React Hook Form + Zod** for type-safe form validation
   - **socket.io-client** for real-time WebSocket alerts
   - **Axios** for API communication (with JWT interceptor)

2. **Backend — Flask (Python 3.11+)**:
   - **Flask 3.x** with Application Factory + Blueprints
   - **Flask-JWT-Extended** for JWT auth (15-min access + 30-day refresh tokens)
   - **flask-bcrypt** for password hashing (bcrypt, cost factor 12)
   - **SQLAlchemy 2.x** ORM + **Flask-Migrate** (Alembic) for database migrations
   - **Flask-CORS** for cross-origin requests
   - **Flask-SocketIO + gevent** for real-time WebSocket push
   - **Flask-Limiter** for rate limiting
   - **marshmallow** for request/response validation
   - **Celery + Redis** for background AI agent execution
   - **web3.py** for Mantle Network contract interaction

3. **Blockchain — Mantle Network**:
   - **Solidity 0.8.x** for smart contracts
   - **Hardhat** for compiling, testing, and deploying (not Truffle)
   - Contracts: `MandatePolicy.sol`, `AgentExecutor.sol`, `RiskGuard.sol`
   - **web3.py** for backend → contract calls
   - **Ethers.js v6 + wagmi** for frontend → contract reads/writes

4. **AI Integration (inside Flask backend)**:
   - **Python 3.11+** — TensorFlow / PyTorch / Scikit-learn
   - AI modules in `backend/ai/`: `mandate_parser.py`, `trading_model.py`, `risk_engine.py`, `bybit_feed.py`
   - Heavy inference dispatched as Celery tasks (non-blocking)

5. **Database and Infrastructure**:
   - **PostgreSQL 15** (Supabase or AWS RDS)
   - **Redis** — Celery broker + task results (Upstash)
   - **Vercel** — frontend hosting
   - **Railway or Render** — Flask backend + Celery workers

6. **Security**:
   - **Flask-JWT-Extended** for token-based authentication
   - **flask-bcrypt** for password hashing (Python, not Node.js bcrypt)
   - **TLS/HTTPS** enforced via Nginx reverse proxy in production
   - **Flask-CORS** restricted to frontend domain only

7. **Testing**:
   - **pytest + pytest-flask** for backend testing — NOT Mocha or Chai
   - **Jest + React Testing Library** for frontend testing
   - **Hardhat** built-in test runner for smart contracts

---

## **Conclusion**:

The **Turing Test Hackathon 2026** presents a unique opportunity to demonstrate the potential of AI-driven, decentralized applications. To succeed, participants must build a platform that integrates blockchain technology with AI, ensuring **transparency**, **security**, and **real-time performance**. The **MantleMandate** project should aim to provide users with the tools to easily manage their trading mandates while ensuring that all actions are fully auditable on the **Mantle Network**.

By carefully following the **hackathon requirements**, selecting the appropriate **tech stack**, and adhering to the outlined **features**, **security**, and **performance guidelines**, your submission will stand out as a professional, fully integrated solution that meets the expectations of the hackathon organizers.

---
