'use client'

import { useState, useRef, useEffect } from 'react'
import { Copy, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogLine {
  id: number
  ts: string
  level: 'INFO' | 'WARN' | 'ERROR'
  msg: string
}

const INITIAL_LOGS: LogLine[] = [
  { id: 1, ts: '14:23:01 UTC', level: 'INFO',  msg: 'GET /v5/market/tickers - 200 OK - 124ms - 1,234 rows' },
  { id: 2, ts: '14:23:01 UTC', level: 'INFO',  msg: 'RPC eth_blockNumber - #14589234 - 45ms' },
  { id: 3, ts: '14:22:59 UTC', level: 'INFO',  msg: 'GET /v5/market/kline - 200 OK - 87ms' },
  { id: 4, ts: '14:22:57 UTC', level: 'WARN',  msg: 'Bybit rate limit at 85% — throttling requests' },
  { id: 5, ts: '14:22:55 UTC', level: 'INFO',  msg: 'GET /v5/market/tickers - 200 OK - 112ms' },
  { id: 6, ts: '14:22:53 UTC', level: 'ERROR', msg: 'Connection timeout — retrying (attempt 1/3)' },
]

const LEVEL_COLOR: Record<string, string> = {
  INFO:  'text-text-link',
  WARN:  'text-warning',
  ERROR: 'text-error',
}

const SAMPLE_RESPONSE = `{
  "symbol": "ETHUSDT",
  "lastPrice": "3245.67",
  "bidPrice": "3245.42",
  "askPrice": "3245.89",
  "volume": "1234567.89",
  "timestamp": 1715234567,
  "status": "TRADING"
}`

function JsonLine({ line }: { line: string }) {
  if (line.includes('": "')) {
    const [key, ...rest] = line.split('": "')
    return (
      <span>
        <span className="text-text-link">{key}&quot;: &quot;</span>
        <span className="text-success">{rest.join('": "').replace(/",?$/, '')}&quot;</span>
        {line.endsWith(',') ? ',' : ''}
      </span>
    )
  }
  if (line.match(/": \d/)) {
    const [key, val] = line.split(': ')
    return (
      <span>
        <span className="text-text-link">{key}: </span>
        <span className="text-warning">{val}</span>
      </span>
    )
  }
  return <span className="text-text-primary">{line}</span>
}

export default function ApiPage() {
  const [logs, setLogs]         = useState<LogLine[]>(INITIAL_LOGS)
  const [autoScroll, setAuto]   = useState(true)
  const [source, setSource]     = useState('Bybit Market Data')
  const [endpoint, setEndpoint] = useState('Spot Ticker')
  const [response] = useState(SAMPLE_RESPONSE)
  const [running, setRunning]   = useState(false)
  const logsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const runTest = () => {
    setRunning(true)
    setTimeout(() => {
      setLogs(prev => [...prev.slice(-199), {
        id: Date.now(),
        ts: new Date().toISOString().slice(11, 19) + ' UTC',
        level: 'INFO',
        msg: `GET /v5/market/tickers - 200 OK - ${80 + Math.floor(Math.random() * 60)}ms`,
      }])
      setRunning(false)
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">API Integration &amp; Data Ingestion</h2>
          <p className="text-sm text-text-secondary mt-0.5">Live market data connections, on-chain state, and ingestion logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-success-bg border border-success/30 rounded-md px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-success">SYSTEM OPERATIONAL</span>
            <span className="text-xs text-text-secondary ml-1">All APIs Connected</span>
          </div>
          <button className="flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:border-primary transition-colors">
            <Plus className="h-4 w-4" />
            Add New Integration
          </button>
        </div>
      </div>

      {/* Data source summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Market Data',    value: 'Bybit API',    status: 'CONNECTED' },
          { label: 'On-Chain State', value: 'Mantle RPC',   status: 'CONNECTED' },
          { label: 'DeFi Protocols', value: '3 active',     status: 'LIVE' },
          { label: 'Data Freshness', value: '2.3s ago',     status: 'Real-time' },
        ] as { label: string; value: string; status: string }[]).map(c => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">{c.label}</p>
            <p className="text-sm font-bold text-text-primary">{c.value}</p>
            <span className="text-[10px] font-semibold text-success">{c.status} ✓</span>
          </div>
        ))}
      </div>

      {/* Three-panel */}
      <div className="grid lg:grid-cols-10 gap-4">
        {/* Left — config (30%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Integration Settings</h4>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-xs font-semibold text-success">CONNECTED</span>
                <span className="text-xs text-text-secondary ml-1">Bybit Market Data</span>
              </div>
              {[
                ['API Key',     'byt_api_****1234'],
                ['Permissions', 'Read Only ✓'],
                ['Rate Limit',  '1,200 / min'],
                ['Data feeds',  'Spot · Perp · Ticker'],
                ['Last ping',   '0.8s'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span className="text-text-disabled w-24 shrink-0">{k}:</span>
                  <span className="font-mono text-text-secondary">{v}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-xs font-semibold text-success">CONNECTED</span>
                <span className="text-xs text-text-secondary ml-1">Mantle RPC</span>
              </div>
              {[
                ['RPC',         'rpc.mantle.xyz'],
                ['Block time',  '2.1s average'],
                ['Latest',      '#14,589,234'],
                ['Gas (low)',   '0.001 Gwei'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span className="text-text-disabled w-24 shrink-0">{k}:</span>
                  <span className="font-mono text-text-secondary">{v}</span>
                </div>
              ))}
            </div>

            <button className="w-full border border-dashed border-border rounded-md py-2 text-xs text-text-secondary hover:text-text-primary hover:border-primary transition-colors flex items-center justify-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add New Data Source
            </button>
          </div>
        </div>

        {/* Center — response (40%) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Response Preview</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                className="bg-input border border-border rounded-md px-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option>Bybit Market Data</option>
                <option>Mantle RPC</option>
              </select>
              <select
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
                className="bg-input border border-border rounded-md px-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option>Spot Ticker</option>
                <option>Order Book</option>
                <option>OHLCV</option>
              </select>
              <button
                onClick={runTest}
                disabled={running}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-60"
              >
                {running ? <span className="h-3 w-3 border border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Run Test
              </button>
            </div>

            <div className="relative bg-page border border-border rounded-md p-4 font-mono text-xs">
              <button
                onClick={() => navigator.clipboard.writeText(response)}
                className="absolute top-2 right-2 text-text-secondary hover:text-text-primary"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              {response.split('\n').map((line, i) => (
                <div key={i}><JsonLine line={line} /></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — live data (30%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Recent Inbound</h4>
            {([
              { sym: 'ETHUSDT',  price: '$3,245.67', chg: '+1.2%', up: true },
              { sym: 'BTCUSDT',  price: '$62,340.20', chg: '-0.4%', up: false },
              { sym: 'MANTUSDT', price: '$0.857',     chg: '+3.1%', up: true },
            ] as { sym: string; price: string; chg: string; up: boolean }[]).map(t => (
              <div key={t.sym} className="flex items-center justify-between font-mono text-xs">
                <span className="text-text-secondary w-20">{t.sym}</span>
                <span className="text-text-primary">{t.price}</span>
                <div className="flex items-center gap-0.5">
                  {t.up
                    ? <TrendingUp className="h-3 w-3 text-success" />
                    : <TrendingDown className="h-3 w-3 text-error" />
                  }
                  <span className={t.up ? 'text-success' : 'text-error'}>{t.chg}</span>
                </div>
                <span className="text-text-disabled">2s ago</span>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-primary">Error Log</h4>
              <button onClick={() => setLogs([])} className="text-xs text-text-secondary hover:text-text-primary transition-colors">Clear</button>
            </div>
            {logs.filter(l => l.level === 'ERROR').length === 0 ? (
              <p className="text-xs text-success text-center py-2">✓ No errors in the last 24 hours</p>
            ) : (
              logs.filter(l => l.level === 'ERROR').map(l => (
                <div key={l.id} className="border-l-2 border-error pl-2 py-1">
                  <p className="text-[10px] text-text-disabled">{l.ts}</p>
                  <p className="text-xs text-error font-mono">{l.msg}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ingestion log */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h4 className="text-sm font-semibold text-text-primary">Ingestion Log</h4>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAuto(v => !v)}
              className={cn('flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-colors', autoScroll ? 'border-success text-success' : 'border-border text-text-secondary')}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', autoScroll ? 'bg-success animate-pulse' : 'bg-text-disabled')} />
              Auto-scroll {autoScroll ? 'ON' : 'OFF'}
            </button>
            <button onClick={() => setLogs([])} className="text-xs text-text-secondary hover:text-text-primary">Clear</button>
          </div>
        </div>
        <div ref={logsRef} className="bg-page max-h-48 overflow-y-auto">
          {logs.map(l => (
            <div key={l.id} className="flex gap-3 px-4 py-1.5 font-mono text-xs hover:bg-surface">
              <span className="text-text-disabled shrink-0 w-28">{l.ts}</span>
              <span className={cn('shrink-0 w-12', LEVEL_COLOR[l.level])}>[{l.level}]</span>
              <span className="text-text-secondary">{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
