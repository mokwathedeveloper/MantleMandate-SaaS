'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Copy, Plus, TrendingUp, TrendingDown, CheckCircle2,
  Download, Filter, ChevronDown,
  Wifi, Cpu, Layers, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
        const strMatch = line.match(/^(\s*)("[\w]+")(\s*:\s*)(".*")(,?)$/)
        if (strMatch) {
          return (
            <div key={i}>
              <span className="text-text-secondary">{strMatch[1]}</span>
              <span className="text-text-link">{strMatch[2]}</span>
              <span className="text-text-secondary">{strMatch[3]}</span>
              <span className="text-success">{strMatch[4]}</span>
              <span className="text-text-secondary">{strMatch[5]}</span>
            </div>
          )
        }
        const numMatch = line.match(/^(\s*)("[\w]+")(\s*:\s*)([0-9.true\-false]+)(,?)$/)
        if (numMatch) {
          return (
            <div key={i}>
              <span className="text-text-secondary">{numMatch[1]}</span>
              <span className="text-text-link">{numMatch[2]}</span>
              <span className="text-text-secondary">{numMatch[3]}</span>
              <span className="text-warning">{numMatch[4]}</span>
              <span className="text-text-secondary">{numMatch[5]}</span>
            </div>
          )
        }
        const arrMatch = line.match(/^(\s*)("[\w]+")(\s*:\s*)(\[.*)$/)
        if (arrMatch) {
          return (
            <div key={i}>
              <span className="text-text-secondary">{arrMatch[1]}</span>
              <span className="text-text-link">{arrMatch[2]}</span>
              <span className="text-text-secondary">{arrMatch[3]}</span>
              <span className="text-success">{arrMatch[4]}</span>
            </div>
          )
        }
        return (
          <div key={i}>
            <span className="text-text-secondary">{line}</span>
          </div>
        )
      })}
    </>
  )
}

// ── Log level / message class helpers ────────────────────────────────────────

function levelClass(level: string): string {
  if (level === 'INFO')  return 'text-text-link'
  if (level === 'WARN')  return 'text-warning'
  if (level === 'ERROR') return 'text-error'
  return 'text-text-secondary'
}

function msgClass(msg: string): string {
  if (msg.includes('200')) return 'text-success'
  if (msg.includes('404') || msg.includes('ERROR') || msg.includes('timeout')) return 'text-error'
  if (msg.includes('WARN') || msg.includes('85%') || msg.includes('throttling')) return 'text-warning'
  return 'text-text-secondary'
}

// ── Ticker row ────────────────────────────────────────────────────────────────

interface TickerRow { sym: string; price: string; chg: string; up: boolean; age: string }

const TICKERS: TickerRow[] = [
  { sym: 'ETHUSDT',  price: '$3,245.67',  chg: '+1.2%', up: true,  age: '2s ago' },
  { sym: 'BTCUSDT',  price: '$62,340.20', chg: '-0.4%', up: false, age: '2s ago' },
  { sym: 'MANTUSDT', price: '$0.857',     chg: '+3.1%', up: true,  age: '3s ago' },
]

// ── Add Integration Modal ─────────────────────────────────────────────────────

const INTEGRATION_TYPES = [
  { id: 'rest',      label: 'REST API',   description: 'HTTP endpoints (Bybit, Binance, custom)' },
  { id: 'websocket', label: 'WebSocket',  description: 'Real-time streaming data feed' },
  { id: 'rpc',       label: 'EVM RPC',    description: 'On-chain data via JSON-RPC node' },
  { id: 'subgraph',  label: 'Subgraph',   description: 'GraphQL endpoint (The Graph protocol)' },
]

function AddIntegrationModal({ onClose }: { onClose: () => void }) {
  const [step,   setStep]   = useState<'type' | 'config' | 'done'>('type')
  const [kind,   setKind]   = useState<string | null>(null)
  const [name,   setName]   = useState('')
  const [url,    setUrl]    = useState('')
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !url.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setSaving(false)
    setStep('done')
  }

  const canSave = name.trim().length > 0 && url.trim().length > 0

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-integration-title"
        className="fixed z-50 w-[calc(100vw-2rem)] max-w-[480px] rounded-xl overflow-hidden shadow-2xl bg-card border border-border top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-surface border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full flex items-center justify-center bg-primary/15">
              <Plus className="h-3.5 w-3.5 text-primary" />
            </div>
            <span id="add-integration-title" className="text-[13px] font-semibold text-text-primary">Add New Integration</span>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="p-5">
          {step === 'type' && (
            <div className="space-y-3">
              <p className="text-xs text-text-secondary">Select the type of data source you want to add:</p>
              <div className="grid grid-cols-2 gap-2">
                {INTEGRATION_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setKind(t.id)}
                    className={cn(
                      'text-left p-3 rounded-lg border transition-all',
                      kind === t.id ? 'bg-primary/10 border-primary' : 'bg-page border-border hover:border-text-disabled'
                    )}
                  >
                    <p className="text-xs font-semibold text-text-primary">{t.label}</p>
                    <p className="text-[11px] mt-0.5 text-text-secondary">{t.description}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-1">
                <button
                  disabled={!kind}
                  onClick={() => setStep('config')}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-xs font-semibold transition-colors',
                    kind ? 'bg-primary text-white hover:opacity-90' : 'bg-border text-text-disabled cursor-not-allowed'
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 'config' && (
            <div className="space-y-3">
              <p className="text-xs text-text-secondary">
                Configure your <span className="text-text-primary font-semibold">{INTEGRATION_TYPES.find(t => t.id === kind)?.label}</span> integration:
              </p>

              {[
                { label: 'Integration Name',  value: name,   set: setName,   placeholder: 'e.g. Bybit Futures Feed',       required: true },
                { label: 'Endpoint URL',      value: url,    set: setUrl,    placeholder: 'https://api.example.com/v1',    required: true },
                { label: 'API Key (optional)', value: apiKey, set: setApiKey, placeholder: 'sk-…',                          required: false },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-[11px] font-medium mb-1 text-text-secondary">
                    {field.label}{field.required && <span className="text-error"> *</span>}
                  </label>
                  <input
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-md px-3 py-2 text-xs bg-page border border-border text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-primary"
                  />
                </div>
              ))}

              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => setStep('type')}
                  className="px-3 py-1.5 rounded-md text-xs border border-border text-text-secondary hover:text-text-primary transition-colors"
                >
                  Back
                </button>
                <button
                  disabled={!canSave || saving}
                  onClick={handleSave}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors',
                    canSave ? 'bg-primary text-white hover:opacity-90' : 'bg-border text-text-disabled cursor-not-allowed'
                  )}
                >
                  {saving && <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Saving…' : 'Save Integration'}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-success/15">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{name} added</p>
                <p className="text-xs mt-1 text-text-secondary">Integration saved. Data will begin flowing in shortly.</p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-1.5 rounded-md text-xs font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

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
  const [filterLevel, setFilterLevel]   = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')
  const [showFilter, setShowFilter]     = useState(false)
  const [freshness, setFreshness]       = useState('2.3s ago')
  const [showAddModal, setShowAddModal] = useState(false)
  const logsRef   = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const secs = [2.3, 1.8, 0.9, 2.1, 1.5, 0.6, 2.4, 1.2]
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % secs.length
      setFreshness(`${secs[i]}s ago`)
    }, 1500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (autoScroll && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs, autoScroll])

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
  const errorCount = logs.filter(l => l.level === 'ERROR').length
  const warnCount  = logs.filter(l => l.level === 'WARN').length

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            API Integration &amp; Data Ingestion
          </h2>
          <p className="text-sm mt-0.5 text-text-secondary">
            Live market data connections, on-chain state, and ingestion logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success-bg border border-success/40">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-success">SYSTEM OPERATIONAL</span>
            <span className="text-xs ml-1 text-text-secondary">All APIs Connected</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-border text-text-secondary hover:border-primary hover:text-text-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Integration
          </button>
        </div>
      </div>

      {/* ── Data source summary cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {([
          { label: 'Market Data',    value: 'Bybit API',  status: 'CONNECTED ✓', Icon: Wifi,   iconClass: 'text-success' },
          { label: 'On-Chain State', value: 'Mantle RPC', status: 'CONNECTED ✓', Icon: Cpu,    iconClass: 'text-success' },
          { label: 'DeFi Protocols', value: '3 active',   status: 'LIVE',        Icon: Layers, iconClass: 'text-text-link' },
          { label: 'Data Freshness', value: freshness,    status: 'Real-time',   Icon: Clock,  iconClass: 'text-success' },
        ] as { label: string; value: string; status: string; Icon: typeof Wifi; iconClass: string }[]).map(c => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                {c.label}
              </p>
              <c.Icon className={cn('h-3.5 w-3.5', c.iconClass)} />
            </div>
            <p className="text-sm font-bold text-text-primary">{c.value}</p>
            <span className="text-[10px] font-semibold text-success">{c.status}</span>
          </div>
        ))}
      </div>

      {/* ── Three-panel layout ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4 items-start">

        {/* ── LEFT: Integration Settings ────────────────────────────────────── */}
        <div className="md:col-span-1 lg:col-span-3">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">Integration Settings</h4>

            {/* Bybit Market Data */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-xs font-semibold text-success">CONNECTED</span>
                <span className="text-xs ml-0.5 text-text-secondary">Bybit Market Data</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] shrink-0 w-20 text-text-disabled">API Key:</span>
                <div className="flex items-center gap-2 flex-1 justify-between">
                  <span className="font-mono text-[11px] text-text-secondary">byt_api_****1234</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="text-[10px] px-1.5 py-0.5 rounded border border-text-link/30 text-text-link hover:bg-text-link/10 transition-colors">
                      Edit
                    </button>
                    <button className="text-[10px] px-1.5 py-0.5 rounded border border-error/30 text-error hover:bg-error/10 transition-colors">
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
                  <span className="shrink-0 w-20 text-text-disabled">{k}:</span>
                  <span className="font-mono text-text-secondary">{v}</span>
                </div>
              ))}
            </div>

            {/* Mantle RPC section */}
            <div className="border-t border-border pt-4 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-xs font-semibold text-success">CONNECTED</span>
                <span className="text-xs ml-0.5 text-text-secondary">Mantle RPC</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] shrink-0 w-20 text-text-disabled">RPC Endpoint:</span>
                <div className="flex items-center gap-2 flex-1 justify-between">
                  <span className="font-mono text-[11px] text-text-secondary truncate">rpc.mantle.xyz</span>
                  <button className="text-[10px] px-1.5 py-0.5 rounded shrink-0 border border-text-link/30 text-text-link hover:bg-text-link/10 transition-colors">
                    Edit
                  </button>
                </div>
              </div>

              {([
                ['Block time',   '2.1s average'],
                ['Latest block', '#14,589,234'],
                ['Gas (low)',    '0.001 Gwei'],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-[11px]">
                  <span className="shrink-0 w-20 text-text-disabled">{k}:</span>
                  <span className="font-mono text-text-secondary">{v}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-xs border border-dashed border-border text-text-secondary hover:border-primary hover:text-text-primary transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add New Data Source
            </button>
          </div>
        </div>

        {/* ── CENTER: Response Preview ───────────────────────────────────────── */}
        <div className="md:col-span-1 lg:col-span-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-semibold text-text-primary">Response Preview</h4>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={source}
                onChange={e => handleSourceChange(e.target.value)}
                className="rounded-md px-2.5 py-1.5 text-xs bg-page border border-border text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
              >
                {Object.keys(SOURCE_ENDPOINTS).map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              <select
                value={endpoint}
                onChange={e => handleEndpointChange(e.target.value)}
                className="rounded-md px-2.5 py-1.5 text-xs bg-page border border-border text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
              >
                {(SOURCE_ENDPOINTS[source] ?? []).map(ep => (
                  <option key={ep}>{ep}</option>
                ))}
              </select>

              <button
                onClick={runTest}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-white font-medium bg-primary hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {running && (
                  <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Run Test Request
              </button>
            </div>

            {/* JSON response */}
            <div className="relative bg-page border border-border rounded-md p-4 font-mono text-[13px] leading-[1.6]">
              <button
                onClick={copyResponse}
                className={cn('absolute top-3 right-3 flex items-center gap-1 hover:opacity-70 transition-opacity', copied ? 'text-success' : 'text-text-secondary')}
                aria-label="Copy JSON"
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

        {/* ── RIGHT: Live Data + Error Log ──────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Recent Inbound */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Recent Inbound</h4>

            {TICKERS.map(t => (
              <div
                key={t.sym}
                className="flex items-center justify-between py-1.5 border-b border-border font-mono text-xs last:border-b-0"
              >
                <span className="w-20 shrink-0 text-text-secondary">{t.sym}</span>
                <span className="text-text-primary">{t.price}</span>
                <div className="flex items-center gap-0.5">
                  {t.up
                    ? <TrendingUp  className="h-3 w-3 text-success" />
                    : <TrendingDown className="h-3 w-3 text-error" />
                  }
                  <span className={t.up ? 'text-success' : 'text-error'}>{t.chg}</span>
                </div>
                <span className="text-text-disabled">{t.age}</span>
              </div>
            ))}
          </div>

          {/* Error Log */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-primary">Error Log</h4>
              <button
                onClick={() => setErrors([])}
                className="text-xs text-text-secondary hover:opacity-70 transition-opacity"
              >
                Clear
              </button>
            </div>

            {errors.length === 0 ? (
              <div className="flex items-center justify-center gap-1.5 py-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                <p className="text-xs text-success">No errors in the last 24 hours</p>
              </div>
            ) : (
              <div className="space-y-2">
                {errors.map(err => (
                  <div
                    key={err.id}
                    className="pl-3 py-2 rounded-sm border-l-[3px] border-l-error bg-error/[0.06]"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold px-1 rounded bg-error/15 text-error">
                        ERROR
                      </span>
                      <span className="text-[10px] font-mono text-text-disabled">
                        {err.ts}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono leading-tight text-error">
                      {err.msg.split(' — ')[0]}
                    </p>
                    {err.msg.includes(' — ') && (
                      <p className="text-[10px] font-mono mt-0.5 text-text-secondary">
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
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Log header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h4 className="text-sm font-semibold text-text-primary">Ingestion Log</h4>

          <div className="flex items-center gap-3">
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAuto(v => !v)}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-colors',
                autoScroll ? 'border-success text-success' : 'border-border text-text-secondary'
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', autoScroll ? 'bg-success animate-pulse' : 'bg-text-disabled')} />
              Auto-scroll {autoScroll ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setLogs([])}
              className="text-xs text-text-secondary hover:opacity-70 transition-opacity"
            >
              Clear
            </button>

            <button
              onClick={exportLogs}
              className="flex items-center gap-1 text-xs text-text-secondary hover:opacity-70 transition-opacity"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            {/* Filter dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter(v => !v)}
                className="flex items-center gap-1 text-xs text-text-secondary hover:opacity-70 transition-opacity"
              >
                <Filter className="h-3.5 w-3.5" />
                {filterLevel === 'ALL' ? 'Filter' : filterLevel}
                <ChevronDown className="h-3 w-3" />
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-1 bg-surface border border-border rounded-md overflow-hidden z-20 min-w-[100px]" style={{ top: '100%' }}>
                  {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(lvl => (
                    <button
                      key={lvl}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-xs transition-colors',
                        filterLevel === lvl ? 'bg-border text-text-primary' : 'text-text-secondary hover:bg-card'
                      )}
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
        <div ref={logsRef} className="bg-page max-h-56 overflow-y-auto overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-center py-8 text-xs font-mono text-text-disabled">
              No log entries{filterLevel !== 'ALL' ? ` at level ${filterLevel}` : ''}
            </p>
          ) : (
            filteredLogs.map(l => (
              <div
                key={l.id}
                className="flex flex-nowrap items-baseline gap-3 px-4 py-1.5 font-mono text-xs hover:bg-card transition-colors"
              >
                <span className="text-text-disabled shrink-0 whitespace-nowrap w-24">{l.ts}</span>
                <span className={cn('shrink-0 font-semibold whitespace-nowrap w-14', levelClass(l.level))}>
                  [{l.level}]
                </span>
                <span className={cn('min-w-0 overflow-hidden text-ellipsis whitespace-nowrap', msgClass(l.msg))}>
                  {l.msg}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Log footer */}
        <div className="flex items-center justify-between px-5 py-2 text-[10px] border-t border-border font-mono text-text-disabled">
          <span>{filteredLogs.length} / 200 entries shown</span>
          <span className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="text-error">
                {errorCount} error{errorCount > 1 ? 's' : ''}
              </span>
            )}
            {warnCount > 0 && (
              <span className="text-warning">
                {warnCount} warning{warnCount > 1 ? 's' : ''}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ── Add Integration Modal ───────────────────────────────────────────── */}
      {showAddModal && <AddIntegrationModal onClose={() => setShowAddModal(false)} />}

    </div>
  )
}
