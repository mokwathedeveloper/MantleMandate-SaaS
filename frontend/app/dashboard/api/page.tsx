'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Copy, Plus, TrendingUp, TrendingDown, CheckCircle2,
  Download, Filter, ChevronDown,
  Wifi, Cpu, Layers, Clock,
} from 'lucide-react'

// ── types ─────────────────────────────────────────────────────────────────────

interface LogLine {
  id: number
  ts: string
  level: 'INFO' | 'WARN' | 'ERROR'
  msg: string
}

// ── constants ─────────────────────────────────────────────────────────────────

const INITIAL_LOGS: LogLine[] = [
  { id: 1, ts: '14:23:01 UTC', level: 'INFO',  msg: 'GET /v5/market/tickers - 200 OK - 124ms - 1,234 rows' },
  { id: 2, ts: '14:23:01 UTC', level: 'INFO',  msg: 'RPC eth_blockNumber - #14589234 - 45ms' },
  { id: 3, ts: '14:22:59 UTC', level: 'INFO',  msg: 'GET /v5/market/kline - 200 OK - 87ms' },
  { id: 4, ts: '14:22:57 UTC', level: 'WARN',  msg: 'Bybit rate limit at 85% — throttling requests' },
  { id: 5, ts: '14:22:55 UTC', level: 'INFO',  msg: 'GET /v5/market/tickers - 200 OK - 112ms' },
  { id: 6, ts: '14:22:53 UTC', level: 'ERROR', msg: 'Connection timeout — retrying (attempt 1/3)' },
]

const ENDPOINT_RESPONSES: Record<string, string> = {
  'Spot Ticker': `{
  "symbol": "ETHUSDT",
  "lastPrice": "3245.67",
  "bidPrice": "3245.42",
  "askPrice": "3245.89",
  "volume": "1234567.89",
  "timestamp": 1715234567,
  "status": "TRADING"
}`,
  'Order Book': `{
  "symbol": "ETHUSDT",
  "bids": [["3245.42", "12.50"], ["3245.10", "8.20"]],
  "asks": [["3245.89", "5.10"], ["3246.00", "18.70"]],
  "timestamp": 1715234568,
  "sequence": 98234567
}`,
  'OHLCV': `{
  "symbol": "ETHUSDT",
  "open": "3210.00",
  "high": "3258.90",
  "low": "3198.45",
  "close": "3245.67",
  "volume": "98234.50",
  "interval": "1h",
  "timestamp": 1715234400
}`,
  'eth_blockNumber': `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0xDED6EA",
  "blockNumber": 14599914,
  "timestamp": 1715234567
}`,
  'eth_gasPrice': `{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x3B9ACA00",
  "gasPrice": "1000000000",
  "gasPriceGwei": "1.0",
  "timestamp": 1715234568
}`,
}

const SOURCE_ENDPOINTS: Record<string, string[]> = {
  'Bybit Market Data': ['Spot Ticker', 'Order Book', 'OHLCV'],
  'Mantle RPC':        ['eth_blockNumber', 'eth_gasPrice'],
}

// ── JSON syntax highlighter ───────────────────────────────────────────────────

function JsonHighlighted({ json }: { json: string }) {
  const lines = json.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        // Match key-string pairs: "key": "value"
        const strMatch = line.match(/^(\s*)("[\w]+")(\s*:\s*)(".*")(,?)$/)
        if (strMatch) {
          return (
            <div key={i}>
              <span style={{ color: '#8B949E' }}>{strMatch[1]}</span>
              <span style={{ color: '#58A6FF' }}>{strMatch[2]}</span>
              <span style={{ color: '#8B949E' }}>{strMatch[3]}</span>
              <span style={{ color: '#22C55E' }}>{strMatch[4]}</span>
              <span style={{ color: '#8B949E' }}>{strMatch[5]}</span>
            </div>
          )
        }
        // Match key-number/boolean pairs: "key": 123
        const numMatch = line.match(/^(\s*)("[\w]+")(\s*:\s*)([0-9.true\-false]+)(,?)$/)
        if (numMatch) {
          return (
            <div key={i}>
              <span style={{ color: '#8B949E' }}>{numMatch[1]}</span>
              <span style={{ color: '#58A6FF' }}>{numMatch[2]}</span>
              <span style={{ color: '#8B949E' }}>{numMatch[3]}</span>
              <span style={{ color: '#F5C542' }}>{numMatch[4]}</span>
              <span style={{ color: '#8B949E' }}>{numMatch[5]}</span>
            </div>
          )
        }
        // Match key-array pairs: "key": [...]
        const arrMatch = line.match(/^(\s*)("[\w]+")(\s*:\s*)(\[.*)$/)
        if (arrMatch) {
          return (
            <div key={i}>
              <span style={{ color: '#8B949E' }}>{arrMatch[1]}</span>
              <span style={{ color: '#58A6FF' }}>{arrMatch[2]}</span>
              <span style={{ color: '#8B949E' }}>{arrMatch[3]}</span>
              <span style={{ color: '#22C55E' }}>{arrMatch[4]}</span>
            </div>
          )
        }
        // Braces and other structural chars
        return (
          <div key={i}>
            <span style={{ color: '#8B949E' }}>{line}</span>
          </div>
        )
      })}
    </>
  )
}

// ── Log level color ───────────────────────────────────────────────────────────

function levelColor(level: string): string {
  if (level === 'INFO')  return '#58A6FF'
  if (level === 'WARN')  return '#F5C542'
  if (level === 'ERROR') return '#EF4444'
  return '#8B949E'
}

function msgColor(msg: string): string {
  if (msg.includes('200')) return '#22C55E'
  if (msg.includes('404') || msg.includes('ERROR') || msg.includes('timeout')) return '#EF4444'
  if (msg.includes('WARN') || msg.includes('85%') || msg.includes('throttling')) return '#F5C542'
  return '#8B949E'
}

// ── Ticker row ────────────────────────────────────────────────────────────────

interface TickerRow { sym: string; price: string; chg: string; up: boolean; age: string }

const TICKERS: TickerRow[] = [
  { sym: 'ETHUSDT',  price: '$3,245.67',  chg: '+1.2%', up: true,  age: '2s ago' },
  { sym: 'BTCUSDT',  price: '$62,340.20', chg: '-0.4%', up: false, age: '2s ago' },
  { sym: 'MANTUSDT', price: '$0.857',     chg: '+3.1%', up: true,  age: '3s ago' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ApiPage() {
  const [logs, setLogs]         = useState<LogLine[]>(INITIAL_LOGS)
  const [autoScroll, setAuto]   = useState(true)
  const [source, setSource]     = useState('Bybit Market Data')
  const [endpoint, setEndpoint] = useState('Spot Ticker')
  const [response, setResponse] = useState(ENDPOINT_RESPONSES['Spot Ticker'])
  const [running, setRunning]   = useState(false)
  const [copied, setCopied]     = useState(false)
  const [errors, setErrors]     = useState<LogLine[]>([
    { id: 100, ts: '14:22:53 UTC', level: 'ERROR', msg: 'Rate limit exceeded — Bybit endpoint /v5/market/tickers — Retrying in 60s' },
  ])
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')
  const [showFilter, setShowFilter]   = useState(false)
  const [freshness, setFreshness]     = useState('2.3s ago')
  const logsRef   = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  // Simulate data freshness counter ticking
  useEffect(() => {
    const secs = [2.3, 1.8, 0.9, 2.1, 1.5, 0.6, 2.4, 1.2]
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % secs.length
      setFreshness(`${secs[i]}s ago`)
    }, 1500)
    return () => clearInterval(t)
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSourceChange = (s: string) => {
    setSource(s)
    const eps = SOURCE_ENDPOINTS[s] ?? []
    const ep  = eps[0] ?? ''
    setEndpoint(ep)
    setResponse(ENDPOINT_RESPONSES[ep] ?? '')
  }

  const handleEndpointChange = (ep: string) => {
    setEndpoint(ep)
    setResponse(ENDPOINT_RESPONSES[ep] ?? '')
  }

  const runTest = useCallback(() => {
    setRunning(true)
    const ms = 80 + Math.floor(Math.random() * 60)
    setTimeout(() => {
      const now = new Date().toISOString().slice(11, 19) + ' UTC'
      const newLog: LogLine = {
        id: Date.now(),
        ts: now,
        level: 'INFO',
        msg: `${source === 'Mantle RPC' ? 'RPC' : 'GET'} /${endpoint.replace(' ', '_').toLowerCase()} - 200 OK - ${ms}ms`,
      }
      setLogs(prev => [...prev.slice(-199), newLog])
      setRunning(false)
    }, 800)
  }, [source, endpoint])

  const copyResponse = () => {
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportLogs = () => {
    const content = logs.map(l => `${l.ts}  [${l.level}]  ${l.msg}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'ingestion_log.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const filteredLogs = filterLevel === 'ALL' ? logs : logs.filter(l => l.level === filterLevel)

  return (
    <div className="p-6 space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#F0F6FC' }}>
            API Integration &amp; Data Ingestion
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
            Live market data connections, on-chain state, and ingestion logs.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* System operational badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{ background: '#0D2818', border: '1px solid rgba(34,197,94,0.4)' }}
          >
            <span
              className="h-2 w-2 rounded-full animate-pulse shrink-0"
              style={{ background: '#22C55E' }}
            />
            <span className="text-xs font-semibold" style={{ color: '#22C55E' }}>
              SYSTEM OPERATIONAL
            </span>
            <span className="text-xs ml-1" style={{ color: '#8B949E' }}>
              All APIs Connected
            </span>
          </div>

          {/* Add Integration ghost button */}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors"
            style={{
              border: '1px solid #30363D',
              color: '#8B949E',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#0066FF'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#F0F6FC'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#30363D'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#8B949E'
            }}
          >
            <Plus className="h-4 w-4" />
            Add New Integration
          </button>
        </div>
      </div>

      {/* ── Data source summary cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Market Data',    value: 'Bybit API',   status: 'CONNECTED ✓', Icon: Wifi,    iconColor: '#22C55E' },
          { label: 'On-Chain State', value: 'Mantle RPC',  status: 'CONNECTED ✓', Icon: Cpu,     iconColor: '#22C55E' },
          { label: 'DeFi Protocols', value: '3 active',    status: 'LIVE',        Icon: Layers,  iconColor: '#58A6FF' },
          { label: 'Data Freshness', value: freshness,     status: 'Real-time',   Icon: Clock,   iconColor: '#22C55E' },
        ] as { label: string; value: string; status: string; Icon: typeof Wifi; iconColor: string }[]).map(c => (
          <div
            key={c.label}
            className="rounded-lg p-4"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8B949E' }}>
                {c.label}
              </p>
              <c.Icon className="h-3.5 w-3.5" style={{ color: c.iconColor }} />
            </div>
            <p className="text-sm font-bold" style={{ color: '#F0F6FC' }}>{c.value}</p>
            <span className="text-[10px] font-semibold" style={{ color: '#22C55E' }}>{c.status}</span>
          </div>
        ))}
      </div>

      {/* ── Three-panel layout ────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-10 gap-4 items-start">

        {/* ── LEFT: Integration Settings (30%) ─────────────────────────────── */}
        <div className="lg:col-span-3">
          <div
            className="rounded-lg p-5 space-y-4"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <h4 className="text-sm font-semibold" style={{ color: '#F0F6FC' }}>Integration Settings</h4>

            {/* Bybit Market Data */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: '#22C55E' }} />
                <span className="text-xs font-semibold" style={{ color: '#22C55E' }}>CONNECTED</span>
                <span className="text-xs ml-0.5" style={{ color: '#8B949E' }}>Bybit Market Data</span>
              </div>

              {/* API Key with Edit/Revoke */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] shrink-0 w-20" style={{ color: '#484F58' }}>API Key:</span>
                <div className="flex items-center gap-2 flex-1 justify-between">
                  <span className="font-mono text-[11px]" style={{ color: '#8B949E' }}>byt_api_****1234</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                      style={{ color: '#58A6FF', border: '1px solid rgba(88,166,255,0.3)' }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                      style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>

              {([
                ['Permissions', 'Read Only ✓'],
                ['Rate Limit',  '1,200 / min'],
                ['Data feeds',  'Spot · Perpetual · Ticker · Trend'],
                ['Last ping',   '0.8s'],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-[11px]">
                  <span className="shrink-0 w-20" style={{ color: '#484F58' }}>{k}:</span>
                  <span className="font-mono" style={{ color: '#8B949E' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #21262D' }} className="pt-4 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: '#22C55E' }} />
                <span className="text-xs font-semibold" style={{ color: '#22C55E' }}>CONNECTED</span>
                <span className="text-xs ml-0.5" style={{ color: '#8B949E' }}>Mantle RPC</span>
              </div>

              {/* RPC Endpoint with Edit */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] shrink-0 w-20" style={{ color: '#484F58' }}>RPC Endpoint:</span>
                <div className="flex items-center gap-2 flex-1 justify-between">
                  <span className="font-mono text-[11px] truncate" style={{ color: '#8B949E' }}>rpc.mantle.xyz</span>
                  <button
                    className="text-[10px] px-1.5 py-0.5 rounded shrink-0 transition-colors"
                    style={{ color: '#58A6FF', border: '1px solid rgba(88,166,255,0.3)' }}
                  >
                    Edit
                  </button>
                </div>
              </div>

              {([
                ['Block time',    '2.1s average'],
                ['Latest block',  '#14,589,234'],
                ['Gas (low)',     '0.001 Gwei'],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-[11px]">
                  <span className="shrink-0 w-20" style={{ color: '#484F58' }}>{k}:</span>
                  <span className="font-mono" style={{ color: '#8B949E' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Add new data source */}
            <button
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-xs transition-colors"
              style={{
                border: '1px dashed #30363D',
                color: '#8B949E',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#0066FF'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#F0F6FC'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#30363D'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#8B949E'
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add New Data Source
            </button>
          </div>
        </div>

        {/* ── CENTER: Response Preview (40%) ────────────────────────────────── */}
        <div className="lg:col-span-4">
          <div
            className="rounded-lg p-5 space-y-4"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <h4 className="text-sm font-semibold" style={{ color: '#F0F6FC' }}>Response Preview</h4>

            {/* Request selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={source}
                onChange={e => handleSourceChange(e.target.value)}
                className="rounded-md px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                style={{
                  background: '#0D1117',
                  border: '1px solid #30363D',
                  color: '#8B949E',
                }}
              >
                {Object.keys(SOURCE_ENDPOINTS).map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <select
                value={endpoint}
                onChange={e => handleEndpointChange(e.target.value)}
                className="rounded-md px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                style={{
                  background: '#0D1117',
                  border: '1px solid #30363D',
                  color: '#8B949E',
                }}
              >
                {(SOURCE_ENDPOINTS[source] ?? []).map(ep => (
                  <option key={ep}>{ep}</option>
                ))}
              </select>

              <button
                onClick={runTest}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-white font-medium transition-opacity disabled:opacity-60"
                style={{ background: '#0066FF' }}
              >
                {running && (
                  <span
                    className="h-3 w-3 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                  />
                )}
                Run Test Request
              </button>
            </div>

            {/* JSON response */}
            <div
              className="relative rounded-md p-4"
              style={{
                background: '#0D1117',
                border: '1px solid #21262D',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 13,
                lineHeight: '1.6',
              }}
            >
              {/* Copy button */}
              <button
                onClick={copyResponse}
                className="absolute top-3 right-3 flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: copied ? '#22C55E' : '#8B949E' }}
                title="Copy JSON"
              >
                {copied
                  ? <CheckCircle2 className="h-3.5 w-3.5" />
                  : <Copy className="h-3.5 w-3.5" />
                }
              </button>

              <JsonHighlighted json={response} />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Live Data + Error Log (30%) ───────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Recent Inbound */}
          <div
            className="rounded-lg p-5 space-y-3"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <h4 className="text-sm font-semibold" style={{ color: '#F0F6FC' }}>Recent Inbound</h4>

            {TICKERS.map(t => (
              <div
                key={t.sym}
                className="flex items-center justify-between py-1.5"
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontSize: 12,
                  borderBottom: '1px solid #21262D',
                }}
              >
                <span className="w-20 shrink-0" style={{ color: '#8B949E' }}>{t.sym}</span>
                <span style={{ color: '#F0F6FC' }}>{t.price}</span>
                <div className="flex items-center gap-0.5">
                  {t.up
                    ? <TrendingUp  className="h-3 w-3" style={{ color: '#22C55E' }} />
                    : <TrendingDown className="h-3 w-3" style={{ color: '#EF4444' }} />
                  }
                  <span style={{ color: t.up ? '#22C55E' : '#EF4444' }}>{t.chg}</span>
                </div>
                <span style={{ color: '#484F58' }}>{t.age}</span>
              </div>
            ))}
          </div>

          {/* Error Log */}
          <div
            className="rounded-lg p-5 space-y-3"
            style={{ background: '#161B22', border: '1px solid #21262D' }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold" style={{ color: '#F0F6FC' }}>Error Log</h4>
              <button
                onClick={() => setErrors([])}
                className="text-xs transition-colors hover:opacity-70"
                style={{ color: '#8B949E' }}
              >
                Clear
              </button>
            </div>

            {errors.length === 0 ? (
              <div className="flex items-center justify-center gap-1.5 py-3">
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#22C55E' }} />
                <p className="text-xs" style={{ color: '#22C55E' }}>No errors in the last 24 hours</p>
              </div>
            ) : (
              <div className="space-y-2">
                {errors.map(err => (
                  <div
                    key={err.id}
                    className="pl-3 py-2 rounded-sm"
                    style={{
                      borderLeft: '3px solid #EF4444',
                      background: 'rgba(239,68,68,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-[10px] font-semibold px-1 rounded"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
                      >
                        ERROR
                      </span>
                      <span
                        className="text-[10px]"
                        style={{
                          color: '#484F58',
                          fontFamily: '"JetBrains Mono", monospace',
                        }}
                      >
                        {err.ts}
                      </span>
                    </div>
                    <p
                      className="text-[11px] leading-tight"
                      style={{
                        color: '#EF4444',
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {err.msg.split(' — ')[0]}
                    </p>
                    {err.msg.includes(' — ') && (
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: '#8B949E', fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        {err.msg.split(' — ').slice(1).join(' — ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Ingestion Log (full width) ────────────────────────────────────────── */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: '#161B22', border: '1px solid #21262D' }}
      >
        {/* Log header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid #21262D' }}
        >
          <h4 className="text-sm font-semibold" style={{ color: '#F0F6FC' }}>Ingestion Log</h4>

          <div className="flex items-center gap-3">
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAuto(v => !v)}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors"
              style={{
                border: `1px solid ${autoScroll ? '#22C55E' : '#30363D'}`,
                color: autoScroll ? '#22C55E' : '#8B949E',
                background: 'transparent',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: autoScroll ? '#22C55E' : '#484F58',
                  animation: autoScroll ? 'pulse 2s infinite' : 'none',
                }}
              />
              Auto-scroll {autoScroll ? 'ON' : 'OFF'}
            </button>

            {/* Clear */}
            <button
              onClick={() => setLogs([])}
              className="text-xs transition-colors hover:opacity-70"
              style={{ color: '#8B949E' }}
            >
              Clear
            </button>

            {/* Export */}
            <button
              onClick={exportLogs}
              className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
              style={{ color: '#8B949E' }}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            {/* Filter dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter(v => !v)}
                className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
                style={{ color: '#8B949E' }}
              >
                <Filter className="h-3.5 w-3.5" />
                {filterLevel === 'ALL' ? 'Filter' : filterLevel}
                <ChevronDown className="h-3 w-3" />
              </button>

              {showFilter && (
                <div
                  className="absolute right-0 mt-1 rounded-md overflow-hidden z-20"
                  style={{
                    background: '#1C2128',
                    border: '1px solid #30363D',
                    minWidth: 100,
                    top: '100%',
                  }}
                >
                  {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(lvl => (
                    <button
                      key={lvl}
                      className="w-full text-left px-3 py-1.5 text-xs transition-colors"
                      style={{
                        color: filterLevel === lvl ? '#F0F6FC' : '#8B949E',
                        background: filterLevel === lvl ? '#21262D' : 'transparent',
                      }}
                      onClick={() => { setFilterLevel(lvl); setShowFilter(false) }}
                    >
                      {lvl === 'ALL' ? 'All levels' : lvl}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Log lines */}
        <div
          ref={logsRef}
          style={{
            background: '#0D1117',
            maxHeight: 224,
            overflowY: 'auto',
          }}
        >
          {filteredLogs.length === 0 ? (
            <p
              className="text-center py-8 text-xs"
              style={{ color: '#484F58', fontFamily: '"JetBrains Mono", monospace' }}
            >
              No log entries{filterLevel !== 'ALL' ? ` at level ${filterLevel}` : ''}
            </p>
          ) : (
            filteredLogs.map(l => (
              <div
                key={l.id}
                className="flex gap-3 px-4 py-1.5 transition-colors"
                style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: 12 }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#161B22' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <span className="shrink-0 w-28" style={{ color: '#484F58' }}>{l.ts}</span>
                <span
                  className="shrink-0 font-semibold"
                  style={{ color: levelColor(l.level), width: 52 }}
                >
                  [{l.level}]
                </span>
                <span style={{ color: msgColor(l.msg) }}>{l.msg}</span>
              </div>
            ))
          )}
        </div>

        {/* Log footer — entry count */}
        <div
          className="flex items-center justify-between px-5 py-2 text-[10px]"
          style={{
            borderTop: '1px solid #21262D',
            color: '#484F58',
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          <span>{filteredLogs.length} / 200 entries shown</span>
          <span>
            {logs.filter(l => l.level === 'ERROR').length > 0 && (
              <span style={{ color: '#EF4444' }}>
                {logs.filter(l => l.level === 'ERROR').length} error{logs.filter(l => l.level === 'ERROR').length > 1 ? 's' : ''}
              </span>
            )}
            {logs.filter(l => l.level === 'WARN').length > 0 && (
              <span style={{ color: '#F5C542', marginLeft: 8 }}>
                {logs.filter(l => l.level === 'WARN').length} warning{logs.filter(l => l.level === 'WARN').length > 1 ? 's' : ''}
              </span>
            )}
          </span>
        </div>
      </div>

    </div>
  )
}
