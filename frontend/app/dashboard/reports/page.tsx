'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, Download, X, Eye, CheckCircle2 } from 'lucide-react'
import NextLink from 'next/link'
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Report {
  id: string
  name: string
  type: 'PERFORMANCE' | 'RISK' | 'AGENT' | 'PORTFOLIO'
  dateFrom: string
  dateTo: string
  totalPnl: number
  roi: number
  createdAt: string
  drawdown?: number
  sharpeRatio?: number
}

// ─── Mock / fallback data ─────────────────────────────────────────────────────

const MOCK_REPORTS: Report[] = [
  { id: '1', name: 'Agent ETH Conservative · Apr 2026',  type: 'PERFORMANCE', dateFrom: '2026-04-01', dateTo: '2026-04-30', totalPnl: 24580439.21, roi: 72.45,  createdAt: '2026-05-01', drawdown: -1240.5,  sharpeRatio: 2.1 },
  { id: '2', name: 'LTC/USD Mandate · Apr 2026',         type: 'AGENT',       dateFrom: '2026-04-01', dateTo: '2026-04-30', totalPnl: -3245.20,    roi: -5.12,  createdAt: '2026-05-01', drawdown: -3245.2,  sharpeRatio: 0.8 },
  { id: '3', name: 'Portfolio Q1 2026',                   type: 'PORTFOLIO',   dateFrom: '2026-01-01', dateTo: '2026-03-31', totalPnl: 8420.50,     roi: 18.34,  createdAt: '2026-04-01', drawdown: -920.0,   sharpeRatio: 1.6 },
  { id: '4', name: 'BTC Risk Analysis · Mar 2026',        type: 'RISK',        dateFrom: '2026-03-01', dateTo: '2026-03-31', totalPnl: 1280.00,     roi: 4.22,   createdAt: '2026-04-01', drawdown: -440.0,   sharpeRatio: 1.2 },
  { id: '5', name: 'Agent ETH Conservative · Mar 2026',   type: 'PERFORMANCE', dateFrom: '2026-03-01', dateTo: '2026-03-31', totalPnl: 6750.30,     roi: 24.10,  createdAt: '2026-04-01', drawdown: -820.0,   sharpeRatio: 1.9 },
  { id: '6', name: 'ETH Momentum Strategy · Feb 2026',    type: 'AGENT',       dateFrom: '2026-02-01', dateTo: '2026-02-28', totalPnl: -1840.00,    roi: -8.90,  createdAt: '2026-03-01', drawdown: -2100.0,  sharpeRatio: 0.6 },
  { id: '7', name: 'Full Portfolio Audit · Q4 2025',      type: 'PORTFOLIO',   dateFrom: '2025-10-01', dateTo: '2025-12-31', totalPnl: 12340.00,    roi: 45.80,  createdAt: '2026-01-02', drawdown: -1500.0,  sharpeRatio: 2.4 },
]

// ─── Chart mock data ──────────────────────────────────────────────────────────

const PNL_TIMELINE = [
  { d: 'Jan', v: 4200 }, { d: 'Feb', v: 5800 }, { d: 'Mar', v: 7200 },
  { d: 'Apr', v: 6400 }, { d: 'May', v: 9100 }, { d: 'Jun', v: 11500 },
  { d: 'Jul', v: 10200 },{ d: 'Aug', v: 13800 },
]

const AGENT_PNL = [
  { name: 'ETH Conservative', pnl: 24580 },
  { name: 'BTC Momentum',     pnl: 8420  },
  { name: 'LTC/USD',          pnl: -3245 },
  { name: 'SOL Swing',        pnl: 6750  },
  { name: 'ARB Arb Bot',      pnl: -1840 },
]

const PROTOCOL_VOLUME = [
  { name: 'Merchant Moe', value: 42, fill: '#0066FF' },
  { name: 'Agni Finance', value: 31, fill: '#22C55E' },
  { name: 'Fluxion',      value: 27, fill: '#F5C542' },
]

const WIN_RATE = [
  { mandate: 'ETH Conservative', win: 72, loss: 28 },
  { mandate: 'BTC Momentum',     win: 58, loss: 42 },
  { mandate: 'LTC/USD',          win: 41, loss: 59 },
  { mandate: 'SOL Swing',        win: 65, loss: 35 },
]

// ─── Badge ───────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  PERFORMANCE: { bg: 'rgba(0,102,255,0.15)',    color: '#58A6FF' },
  RISK:        { bg: 'rgba(245,199,66,0.15)',   color: '#F5C542' },
  AGENT:       { bg: 'rgba(34,197,94,0.15)',    color: '#22C55E' },
  PORTFOLIO:   { bg: 'rgba(139,148,158,0.15)',  color: '#8B949E' },
}

function TypeBadge({ type }: { type: string }) {
  const s = TYPE_COLORS[type] ?? TYPE_COLORS.PORTFOLIO
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded w-fit"
      style={{ background: s.bg, color: s.color }}
    >
      {type}
    </span>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n))
}

function dateRange(from: string, to: string): string {
  const f = new Date(from)
  const t = new Date(to)
  const mo = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${mo(f)} – ${t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-[6px] px-4 py-3 text-sm font-medium"
      style={{ background: '#0D2818', border: '1px solid #22C55E', color: '#22C55E' }}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {msg}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-border">
          {[24, 10, 16, 12, 10, 14].map((w, j) => (
            <div key={j} className="h-3 bg-surface rounded animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BarChart2 className="h-12 w-12 mb-4" style={{ color: '#484F58' }} />
      <p className="text-text-primary font-semibold text-sm mb-2">No reports yet</p>
      <p className="text-text-secondary text-sm max-w-sm mb-6">
        Reports are generated automatically each week once your agents start executing trades.
      </p>
      <NextLink
        href="/dashboard/agents"
        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
      >
        Deploy Your First Agent
      </NextLink>
    </div>
  )
}

// ─── Report View Modal ────────────────────────────────────────────────────────

function ReportViewModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const pnlPositive = report.totalPnl >= 0
  const roiPositive = report.roi >= 0

  const metrics = [
    { label: 'Total P&L',    value: `${pnlPositive ? '+' : '-'}$${fmt(report.totalPnl)}`,    color: pnlPositive ? '#22C55E' : '#EF4444' },
    { label: 'ROI',          value: `${roiPositive ? '+' : ''}${report.roi.toFixed(2)}%`,     color: roiPositive ? '#22C55E' : '#EF4444' },
    { label: 'Max Drawdown', value: report.drawdown != null ? `-$${fmt(Math.abs(report.drawdown))}` : '—', color: '#EF4444' },
    { label: 'Sharpe Ratio', value: report.sharpeRatio != null ? String(report.sharpeRatio) : '—', color: '' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed z-50 w-[calc(100vw-2rem)] max-w-[520px] rounded-xl overflow-hidden shadow-2xl"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#161B22', border: '1px solid #21262D' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid #21262D' }}>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{report.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <TypeBadge type={report.type} />
              <span className="text-xs text-text-secondary">{dateRange(report.dateFrom, report.dateTo)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors shrink-0 mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3 p-5">
          {metrics.map(m => (
            <div key={m.label} className="rounded-lg p-4" style={{ background: '#0D1117', border: '1px solid #21262D' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">{m.label}</p>
              <p className="text-xl font-bold" style={{ color: m.color || 'var(--color-text-primary)' }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="px-5 pb-5 space-y-2">
          {[
            ['Report Type',   report.type],
            ['Period From',   report.dateFrom],
            ['Period To',     report.dateTo],
            ['Generated On',  new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-xs text-text-secondary">{k}</span>
              <span className="text-xs font-medium text-text-primary">{v}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex justify-end gap-2" style={{ borderTop: '1px solid #21262D' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Export Modal ─────────────────────────────────────────────────────────────

function ExportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (msg: string) => void }) {
  const [reportType, setReportType] = useState('Performance Summary')
  const [format,     setFormat]     = useState('CSV')
  const [loading,    setLoading]    = useState(false)
  const [dateFrom,   setDateFrom]   = useState('2026-04-01')
  const [dateTo,     setDateTo]     = useState('2026-04-30')

  const handle = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const slug     = reportType.replace(/\s+/g, '-')
      const range    = `${dateFrom} to ${dateTo}`
      const filename = `${slug}-${dateFrom.slice(0, 7)}`

      if (format === 'CSV') {
        const rows = [
          ['Period', 'Metric', 'Value'],
          [range, 'Total P&L',      '+$34,265.00'],
          [range, 'Win Rate',       '67.3%'],
          [range, 'Total Trades',   '847'],
          [range, 'Sharpe Ratio',   '2.41'],
          [range, 'Max Drawdown',   '-8.2%'],
          ...PNL_TIMELINE.map(r => [r.d, 'Monthly P&L', `$${r.v.toLocaleString()}`]),
          ...AGENT_PNL.map(r    => [range, `Agent P&L — ${r.name}`, `${r.pnl >= 0 ? '+' : ''}$${Math.abs(r.pnl).toLocaleString()}`]),
        ]
        const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href = url; a.download = `${filename}.csv`; a.click()
        URL.revokeObjectURL(url)

      } else if (format === 'JSON') {
        const payload = {
          report:    reportType,
          generated: new Date().toISOString(),
          period:    { from: dateFrom, to: dateTo },
          summary: { totalPnl: 34265, winRate: 67.3, trades: 847, sharpe: 2.41, maxDrawdown: -8.2 },
          pnlTimeline:     PNL_TIMELINE,
          agentBreakdown:  AGENT_PNL,
          protocolVolume:  PROTOCOL_VOLUME,
          winRates:        WIN_RATE,
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href = url; a.download = `${filename}.json`; a.click()
        URL.revokeObjectURL(url)

      } else if (format === 'PDF') {
        const win = window.open('', '_blank', 'width=900,height=700')
        if (!win) return
        win.document.write(`<!DOCTYPE html><html><head>
          <title>${reportType} — ${range}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; color: #111; }
            h1   { font-size: 22px; margin-bottom: 4px; }
            p.sub{ font-size: 13px; color: #555; margin-bottom: 32px; }
            table{ width: 100%; border-collapse: collapse; font-size: 13px; }
            th   { background: #f4f4f4; padding: 8px 12px; text-align: left; border-bottom: 2px solid #ddd; }
            td   { padding: 7px 12px; border-bottom: 1px solid #eee; }
            tr:nth-child(even) td { background: #fafafa; }
            .kpi { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 32px; }
            .kpi-card { padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
            .kpi-label { font-size: 11px; text-transform: uppercase; color: #777; }
            .kpi-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
            h2   { font-size: 15px; margin: 24px 0 8px; }
          </style>
        </head><body>
          <h1>MantleMandate — ${reportType}</h1>
          <p class="sub">Period: ${range} &nbsp;·&nbsp; Generated: ${new Date().toLocaleString()}</p>
          <div class="kpi">
            <div class="kpi-card"><div class="kpi-label">Total P&amp;L</div><div class="kpi-value">+$34,265</div></div>
            <div class="kpi-card"><div class="kpi-label">Win Rate</div><div class="kpi-value">67.3%</div></div>
            <div class="kpi-card"><div class="kpi-label">Total Trades</div><div class="kpi-value">847</div></div>
            <div class="kpi-card"><div class="kpi-label">Sharpe Ratio</div><div class="kpi-value">2.41</div></div>
            <div class="kpi-card"><div class="kpi-label">Max Drawdown</div><div class="kpi-value">-8.2%</div></div>
            <div class="kpi-card"><div class="kpi-label">Avg Trade Size</div><div class="kpi-value">$4,850</div></div>
          </div>
          <h2>Monthly P&amp;L Timeline</h2>
          <table><tr><th>Month</th><th>P&amp;L</th></tr>
            ${PNL_TIMELINE.map(r => `<tr><td>${r.d}</td><td>$${r.v.toLocaleString()}</td></tr>`).join('')}
          </table>
          <h2>Agent Breakdown</h2>
          <table><tr><th>Agent</th><th>P&amp;L</th></tr>
            ${AGENT_PNL.map(r => `<tr><td>${r.name}</td><td>${r.pnl >= 0 ? '+' : ''}$${Math.abs(r.pnl).toLocaleString()}</td></tr>`).join('')}
          </table>
          <h2>Protocol Volume</h2>
          <table><tr><th>Protocol</th><th>Share</th></tr>
            ${PROTOCOL_VOLUME.map(r => `<tr><td>${r.name}</td><td>${r.value}%</td></tr>`).join('')}
          </table>
          <h2>Win Rates by Mandate</h2>
          <table><tr><th>Mandate</th><th>Win %</th><th>Loss %</th></tr>
            ${WIN_RATE.map(r => `<tr><td>${r.mandate}</td><td>${r.win}%</td><td>${r.loss}%</td></tr>`).join('')}
          </table>
          <script>window.onload = function(){ window.print(); }</script>
        </body></html>`)
        win.document.close()
      }

      onSuccess(`${reportType} — ${format} downloaded`)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-[calc(100vw-2rem)] max-w-[480px] p-5 sm:p-6 space-y-5"
        style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '10px' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">Export Report</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Report type */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Report type</p>
          {['Performance Summary', 'Full Trade Log', 'Agent Activity Report', 'On-Chain Audit Export'].map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rt"
                checked={reportType === t}
                onChange={() => setReportType(t)}
                className="accent-primary"
              />
              <span className="text-sm text-text-secondary">{t}</span>
            </label>
          ))}
        </div>

        {/* Date range */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Date range</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            />
            <span className="text-text-disabled text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Agent + Mandate selects */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-text-secondary">Agent</label>
            <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer">
              <option>All Agents</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-secondary">Mandate</label>
            <select className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer">
              <option>All Mandates</option>
            </select>
          </div>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Format</p>
          <div className="flex gap-4">
            {['CSV', 'PDF', 'JSON'].map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="fmt"
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  className="accent-primary"
                />
                <span className="text-sm text-text-secondary">{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handle}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium py-2.5 rounded-md transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Generate &amp; Download
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-border rounded-md text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Chart cards ─────────────────────────────────────────────────────────────

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: '#161B22', border: '1px solid #21262D', borderRadius: 6, fontSize: 12 },
  labelStyle:   { color: '#8B949E' },
  itemStyle:    { color: '#F0F6FC' },
}

function ChartCard({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {actions}
      </div>
      {children}
    </div>
  )
}

function PnlTimeline() {
  const [range, setRange] = useState('1M')
  return (
    <ChartCard
      title="Portfolio P&L Over Time"
      actions={
        <div className="flex items-center gap-1">
          {['1W', '1M', '3M', '1Y'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'text-[11px] px-2 py-0.5 rounded transition-colors',
                range === r ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={PNL_TIMELINE} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#0066FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#21262D" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="d" tick={{ fill: '#8B949E', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} axisLine={false} tickLine={false} width={50}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => [`$${fmt(Number(v))}`, 'P&L']} />
          <Line type="monotone" dataKey="v" stroke="#0066FF" strokeWidth={2} dot={false} fill="url(#pnlGrad)" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function AgentPnlChart() {
  return (
    <ChartCard title="P&L by Agent">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={AGENT_PNL} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#21262D" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#8B949E', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#8B949E', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
          <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => { const n = Number(v); return [`${n >= 0 ? '+' : ''}$${fmt(n)}`, 'P&L'] }} />
          <Bar dataKey="pnl" radius={[0, 3, 3, 0]}>
            {AGENT_PNL.map((entry, i) => (
              <Cell key={i} fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function ProtocolChart() {
  return (
    <ChartCard title="Trade Volume by Protocol">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={PROTOCOL_VOLUME}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {PROTOCOL_VOLUME.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            {...CHART_TOOLTIP_STYLE}
            formatter={(v) => [`${v}%`, 'Volume']}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: '#8B949E', paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function WinRateChart() {
  return (
    <ChartCard title="Win Rate by Mandate">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={WIN_RATE} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#21262D" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8B949E', fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="mandate" tick={{ fill: '#8B949E', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
          <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v) => [`${v}%`]} />
          <Bar dataKey="win"  stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} />
          <Bar dataKey="loss" stackId="a" fill="#EF4444" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

type ViewMode = 'table' | 'charts'

export default function ReportsPage() {
  const [view,         setView]         = useState<ViewMode>('table')
  const [showExport,   setExport]       = useState(false)
  const [toast,        setToast]        = useState<string | null>(null)
  const [showExtra,    setShowExtra]    = useState(false)
  const [dateFrom,     setDateFrom]     = useState('2026-04-01')
  const [dateTo,       setDateTo]       = useState('2026-04-30')
  const [viewReport,   setViewReport]   = useState<Report | null>(null)

  const { data, isLoading, isError } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn:  () => fetch('/api/reports').then(r => r.json()),
    staleTime: 60_000,
  })

  const reports = (!isLoading && !isError && data && data.length > 0) ? data : MOCK_REPORTS
  const isEmpty  = !isLoading && !isError && data && data.length === 0

  //                   Name   Type  DateRange  P&L   ROI   Actions
  const COLS_BASE  = '220px 120px    160px    125px  85px  145px'
  //                   GeneratedOn  Drawdown  Sharpe
  const COLS_EXTRA = '120px         115px     70px'
  const cols       = showExtra ? `${COLS_BASE} ${COLS_EXTRA}` : COLS_BASE
  const tableMinW  = showExtra ? 1160 : 855

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {viewReport && <ReportViewModal report={viewReport} onClose={() => setViewReport(null)} />}
      {showExport && (
        <ExportModal
          onClose={() => setExport(false)}
          onSuccess={(msg) => setToast(msg)}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Reports &amp; Exporting</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Performance summaries, trade logs, and compliance exports.
          </p>
        </div>
        <button
          onClick={() => setExport(true)}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shrink-0 self-start"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* ── KPI strip (5 cards) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {([
          { label: 'Total Reports', value: '1,248',          sub: 'Generated',     color: '' },
          { label: 'Total P&L',     value: '$24,580,439.21', sub: 'All time',      color: '' },
          { label: 'Total P&L %',   value: '72.45%',         sub: '',              color: '#22C55E' },
          { label: 'Max Drawdown',  value: '-$3,245.20',     sub: '',              color: '#EF4444' },
          { label: 'Sharpe Ratio',  value: '20',             sub: 'Risk-adjusted', color: '' },
        ] as { label: string; value: string; sub: string; color: string }[]).map(c => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
              {c.label}
            </p>
            <p
              className="text-base sm:text-xl font-bold truncate"
              style={{ color: c.color || undefined }}
            >
              {c.value}
            </p>
            {c.sub && <p className="text-xs text-text-secondary mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── View toggle + Filters ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Toggle */}
        <div className="flex items-center gap-4">
          {(['table', 'charts'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'text-sm font-medium pb-0.5 transition-colors',
                view === v
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {v === 'table' ? '≡ Table' : '📊 Charts'}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="bg-input border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
          />
          <span className="text-text-disabled text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="bg-input border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
          />
          {['Agent', 'Mandate'].map(f => (
            <select
              key={f}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option>All {f}s</option>
            </select>
          ))}
        </div>
      </div>

      {/* ── Table View ── */}
      {view === 'table' && (
        <div className="overflow-x-auto rounded-lg border border-[#21262D]">
        <div style={{ minWidth: tableMinW }}>
          {/* Header row */}
          <div className="grid px-4 py-2.5 bg-page" style={{ gridTemplateColumns: cols }}>
            {['REPORT NAME', 'TYPE', 'DATE RANGE', 'TOTAL P&L', 'ROI', 'ACTIONS',
              ...(showExtra ? ['GENERATED ON', 'DRAWDOWN', 'SHARPE'] : [])
            ].map(h => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                {h}
              </span>
            ))}
          </div>

          {/* Show More Columns toggle */}
          <div className="flex justify-end px-4 py-1.5 border-b border-border bg-page">
            <button
              onClick={() => setShowExtra(v => !v)}
              className="text-[12px] flex items-center gap-0.5 transition-colors"
              style={{ color: '#58A6FF' }}
            >
              {showExtra ? 'Hide extra columns −' : 'Show more columns +'}
            </button>
          </div>

          {isLoading && <TableSkeleton />}
          {isError   && <div className="py-8 text-center text-sm text-error">Failed to load reports.</div>}
          {isEmpty   && <EmptyState />}

          {!isEmpty && !isLoading && !isError && reports.map((r, i) => (
            <div
              key={r.id}
              className="grid px-4 items-center transition-colors"
              style={{
                gridTemplateColumns: cols,
                minHeight: '52px',
                background: i % 2 === 0 ? '' : '',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1C2128')}
              onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'var(--color-card)' : 'var(--color-page)')}
            >
              <button
                className="text-sm font-medium text-left truncate pr-2 hover:underline underline-offset-2"
                style={{ color: '#58A6FF' }}
              >
                {r.name}
              </button>
              <TypeBadge type={r.type} />
              <span className="text-xs text-text-secondary whitespace-nowrap">{dateRange(r.dateFrom, r.dateTo)}</span>
              <span className="text-sm font-medium whitespace-nowrap" style={{ color: r.totalPnl >= 0 ? '#22C55E' : '#EF4444' }}>
                {r.totalPnl >= 0 ? '+' : '-'}${fmt(r.totalPnl)}
              </span>
              <span className="text-sm font-medium whitespace-nowrap" style={{ color: r.roi >= 0 ? '#22C55E' : '#EF4444' }}>
                {r.roi >= 0 ? '+' : ''}{r.roi.toFixed(2)}%
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewReport(r)}
                  className="flex items-center gap-1 text-xs border border-border rounded px-2 py-1 text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
                >
                  <Eye className="h-3 w-3" /> View
                </button>
                <button
                  onClick={() => setToast(`Report downloaded: ${r.name.replace(/\s·\s|[\s/]/g, '-')}.csv`)}
                  className="flex items-center gap-1 text-xs border border-border rounded px-2 py-1 text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
                >
                  <Download className="h-3 w-3" /> Export
                </button>
              </div>
              {showExtra && (
                <>
                  <span className="text-xs text-text-secondary whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#EF4444' }}>
                    {r.drawdown != null ? `-$${fmt(Math.abs(r.drawdown))}` : '—'}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {r.sharpeRatio ?? '—'}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
        </div>
      )}

      {/* ── Charts View ── */}
      {view === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PnlTimeline />
          <AgentPnlChart />
          <ProtocolChart />
          <WinRateChart />
        </div>
      )}
    </div>
  )
}
