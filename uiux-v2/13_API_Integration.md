# Screen 13 — API Integration & Data Ingestion
## MantleMandate

---

## PURPOSE
Technical users (devs, quant traders) monitor live API connections, test integrations, and view raw data ingestion logs. This screen signals technical depth to hackathon judges.

---

## WHAT CHANGED FROM V1
- Brand: "ALPHACAP" → "MantleMandate" in sidebar
- Status indicator: "SYSTEM OPERATIONAL" badge made more prominent
- Error panel styling standardized to design system
- Request log uses proper monospace styling

---

## LAYOUT

Standard app layout (sidebar + main content)
Main content: 3-panel layout (left config 30% | center response preview 40% | right data panels 30%)

---

## PAGE HEADER

"API Integration & Data Ingestion" — H2, `#F0F6FC`
Sub-text: "Live market data connections, on-chain state, and ingestion logs." — Body 14px, `#8B949E`

**Right:** System status badge:
```
● SYSTEM OPERATIONAL    All APIs Connected    [ + Add New Integration ]
```
Status dot: 8px `#22C55E` with pulse animation
"Add New Integration": Ghost button

---

## TOP ROW — DATA SOURCE CARDS (4 compact cards)

| Card | Label | Value | Status |
|------|-------|-------|--------|
| Market Data | Bybit API | CONNECTED ✓ | |
| On-Chain State | Mantle RPC | CONNECTED ✓ | |
| DeFi Protocols | 3 active | LIVE | |
| Data Freshness | 2.3s ago | Real-time | |

---

## THREE-PANEL LAYOUT

### LEFT PANEL — Integration Config (30%)

**Heading:** "Integration Settings" — H4, `#F0F6FC`

**Bybit Market Data:**
```
Status: CONNECTED ✓

API Key:     byt_api_****1234  [Edit] [Revoke]
Permissions: Read Only ✓
Rate Limit:  1,200 / min
Data feeds:  Spot · Perpetual · Ticker · Trend
Last ping:   0.8s
```

**On-Chain State (Mantle RPC):**
```
Status: CONNECTED ✓

RPC Endpoint: https://rpc.mantle.xyz  [Edit]
Block time:   2.1s average
Latest block: #14,589,234
Gas (low):    0.001 Gwei
```

**Add API button:**
```
[ + Add New Data Source ]
```
Ghost button, full width of panel

---

### CENTER PANEL — Response Preview (40%)

**Heading:** "Response Preview" — H4, `#F0F6FC`

**Request selector (top of panel):**
```
Data source: [ Bybit Market Data ▾ ]    Endpoint: [ Spot Ticker ▾ ]    [ Run Test Request ]
```

**JSON response display:**
```
{
  "symbol": "ETHUSDT",
  "lastPrice": "3245.67",
  "bidPrice": "3245.42",
  "askPrice": "3245.89",
  "volume": "1234567.89",
  "timestamp": 1715234567,
  "status": "TRADING"
}
```
- Background: `#0D1117`, border: 1px `#21262D`, border-radius 6px, padding 16px
- Font: JetBrains Mono 13px, `#F0F6FC`
- Syntax highlighting: keys in `#58A6FF`, strings in `#22C55E`, numbers in `#F5C542`
- Copy button top-right: Copy icon, `#8B949E`

---

### RIGHT PANEL — Live Data (30%)

**Top section: Recent Inbound Data**

Heading: "Recent Inbound" — H4, `#F0F6FC`

Small cards (compact, 3 rows):
```
ETHUSDT    $3,245.67    ▲ +1.2%    2s ago
BTCUSDT   $62,340.20   ▼ -0.4%    2s ago
MANTUSDT    $0.857     ▲ +3.1%    3s ago
```
Font: JetBrains Mono 12px
Green up arrows: `#22C55E`
Red down arrows: `#EF4444`

**Bottom section: Error Log**

Heading: "Error Log" — H4, `#F0F6FC`
"Clear" button right-aligned

If no errors:
```
✓ No errors in the last 24 hours
```
`#22C55E`, centered

If errors:
```
[EF4444 border-left card]
ERROR  14:23:01 UTC
Rate limit exceeded — Bybit endpoint
Endpoint: /v5/market/tickers
Retrying in 60s
```
Font: JetBrains Mono 12px, error text `#EF4444`

---

## BOTTOM PANEL — Request/Ingestion Log

**Full width** below the 3-panel section

**Heading:** "Ingestion Log" — H4, `#F0F6FC`
**Right controls:** Auto-scroll toggle [● ON] | Clear | Export | Filter ▾

**Log lines (terminal-style, monospace):**

```
14:23:01 UTC  [INFO]   GET /v5/market/tickers - 200 OK - 124ms - 1,234 rows
14:23:01 UTC  [INFO]   RPC eth_blockNumber - #14589234 - 45ms
14:22:59 UTC  [INFO]   GET /v5/market/kline - 200 OK - 87ms
14:22:57 UTC  [WARN]   Bybit rate limit at 85% — throttling requests
14:22:55 UTC  [INFO]   GET /v5/market/tickers - 200 OK - 112ms
14:22:53 UTC  [ERROR]  Connection timeout — retrying (attempt 1/3)
```

Log line formatting:
- Background: `#0D1117`, padding 6px 12px per line, no gap between lines
- Font: JetBrains Mono 12px
- Timestamp: `#484F58`
- [INFO]: `#58A6FF`
- [WARN]: `#F5C542`
- [ERROR]: `#EF4444`
- Message: `#8B949E`
- Status codes (200, 404): colored by HTTP status

Auto-scroll: when enabled, log scrolls to bottom as new entries come in
Maximum lines shown: 200 (older entries pruned)
