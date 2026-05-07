// Mock reports

export interface MockReport {
  id:        string
  title:     string
  type:      'P&L' | 'Compliance' | 'Risk' | 'Audit'
  period:    string
  generated: string
  size:      string
  status:    'ready' | 'queued' | 'archived'
}

export const MOCK_REPORTS: MockReport[] = [
  { id: 'r1', title: 'Q2 2026 P&L Statement',        type: 'P&L',        period: 'Apr–Jun 2026', generated: '2026-05-07', size: '1.2 MB', status: 'ready' },
  { id: 'r2', title: 'May 2026 Compliance Pack',     type: 'Compliance', period: 'May 2026',     generated: '2026-05-06', size: '4.8 MB', status: 'ready' },
  { id: 'r3', title: 'Risk Posture Snapshot',        type: 'Risk',       period: '7-day window', generated: '2026-05-05', size: '512 KB', status: 'ready' },
  { id: 'r4', title: 'On-Chain Audit Trail (April)', type: 'Audit',      period: 'Apr 2026',     generated: '2026-05-01', size: '8.1 MB', status: 'archived' },
  { id: 'r5', title: 'Quarterly Risk Review',        type: 'Risk',       period: 'Q1 2026',      generated: '2026-04-04', size: '2.4 MB', status: 'archived' },
  { id: 'r6', title: 'June 2026 P&L Forecast',       type: 'P&L',        period: 'Jun 2026',     generated: '—',          size: '—',      status: 'queued' },
]

export const REPORT_KPIS = {
  generated:    { value:  47,   deltaText: 'YTD reports' },
  scheduled:    { value:   6,   deltaText: 'recurring schedules' },
  exportSizeMb: { value: 184,   unit: 'MB', deltaText: 'this quarter' },
  retentionDays:{ value: 365,   deltaText: 'enterprise retention' },
}
