// Mock user data for Users / CRM page

export type UserStatus = 'active' | 'paused' | 'pending' | 'blocked'
export type UserPlan   = 'Operator' | 'Strategist' | 'Institutional' | 'Free'

export interface MockUser {
  id:          string
  name:        string
  email:       string
  walletAddr:  string
  plan:        UserPlan
  status:      UserStatus
  agents:      number
  riskScore:   number
  lastLogin:   string
  joinedAt:    string
  region:      string
  initials:    string
  avatarColor: string
}

export const MOCK_USERS: MockUser[] = [
  {
    id:          'u_001',
    name:        'Amara Okafor',
    email:       'amara.okafor@mantlemandate.io',
    walletAddr:  '0x4A8c7e1B...c8F2',
    plan:        'Institutional',
    status:      'active',
    agents:      4,
    riskScore:   18,
    lastLogin:   '2 minutes ago',
    joinedAt:    '2025-08-12',
    region:      'Africa',
    initials:    'AO',
    avatarColor: 'bg-primary',
  },
  {
    id:          'u_002',
    name:        'Noah Kim',
    email:       'noah.kim@mantlemandate.io',
    walletAddr:  '0x9b2A...a103',
    plan:        'Strategist',
    status:      'active',
    agents:      3,
    riskScore:   24,
    lastLogin:   '14 minutes ago',
    joinedAt:    '2025-09-04',
    region:      'Asia',
    initials:    'NK',
    avatarColor: 'bg-success',
  },
  {
    id:          'u_003',
    name:        'Priya Shah',
    email:       'priya.shah@mantlemandate.io',
    walletAddr:  '0x12fA...b7E2',
    plan:        'Operator',
    status:      'active',
    agents:      2,
    riskScore:   31,
    lastLogin:   '1 hour ago',
    joinedAt:    '2025-10-21',
    region:      'Asia',
    initials:    'PS',
    avatarColor: 'bg-warning',
  },
  {
    id:          'u_004',
    name:        'Mateo Ruiz',
    email:       'mateo.ruiz@mantlemandate.io',
    walletAddr:  '0x77Ae...cE19',
    plan:        'Strategist',
    status:      'paused',
    agents:      1,
    riskScore:   46,
    lastLogin:   '3 hours ago',
    joinedAt:    '2025-11-02',
    region:      'Latin America',
    initials:    'MR',
    avatarColor: 'bg-orange',
  },
  {
    id:          'u_005',
    name:        'Linh Nguyen',
    email:       'linh.nguyen@mantlemandate.io',
    walletAddr:  '0xfA31...02d4',
    plan:        'Operator',
    status:      'active',
    agents:      2,
    riskScore:   22,
    lastLogin:   '5 hours ago',
    joinedAt:    '2025-12-14',
    region:      'Asia',
    initials:    'LN',
    avatarColor: 'bg-accent',
  },
  {
    id:          'u_006',
    name:        'Chiamaka Eze',
    email:       'chiamaka.eze@mantlemandate.io',
    walletAddr:  '0xcA27...8B33',
    plan:        'Institutional',
    status:      'active',
    agents:      6,
    riskScore:   12,
    lastLogin:   '1 day ago',
    joinedAt:    '2025-07-08',
    region:      'Africa',
    initials:    'CE',
    avatarColor: 'bg-primary',
  },
  {
    id:          'u_007',
    name:        'Sofía Hernández',
    email:       'sofia.hernandez@mantlemandate.io',
    walletAddr:  '0x6B17...cc40',
    plan:        'Free',
    status:      'pending',
    agents:      0,
    riskScore:   55,
    lastLogin:   '2 days ago',
    joinedAt:    '2026-04-30',
    region:      'Europe',
    initials:    'SH',
    avatarColor: 'bg-error',
  },
  {
    id:          'u_008',
    name:        'Daniel Park',
    email:       'daniel.park@mantlemandate.io',
    walletAddr:  '0x3eD1...91Fc',
    plan:        'Strategist',
    status:      'active',
    agents:      3,
    riskScore:   29,
    lastLogin:   '3 days ago',
    joinedAt:    '2025-12-01',
    region:      'North America',
    initials:    'DP',
    avatarColor: 'bg-success',
  },
]

export const USER_KPIS = {
  totalUsers: { value: 12_842, deltaPct: 11.4, deltaText: '+11.4% vs prev. period' },
  activeAgents: { value: 9_214, deltaPct: 6.2, deltaText: '+6.2% vs prev. period' },
  failedAuth:  { value: 13, deltaText: '−3 today' },
  avgPolicyLatency: { value: 182, unit: 'ms', deltaText: '−18ms vs prev. period' },
}

// User activation trend — 12 weeks of new signups
export const USER_ACTIVATION_TREND = [
  { week: 'W1',  users:  680 },
  { week: 'W2',  users:  720 },
  { week: 'W3',  users:  840 },
  { week: 'W4',  users:  910 },
  { week: 'W5',  users:  990 },
  { week: 'W6',  users: 1080 },
  { week: 'W7',  users: 1010 },
  { week: 'W8',  users: 1140 },
  { week: 'W9',  users: 1280 },
  { week: 'W10', users: 1410 },
  { week: 'W11', users: 1560 },
  { week: 'W12', users: 1720 },
]

export const USER_LOCATIONS = [
  { region: 'North America', users: 5_120, pct: 39.9 },
  { region: 'Europe',         users: 3_240, pct: 25.2 },
  { region: 'Asia',           users: 2_710, pct: 21.1 },
  { region: 'Africa',         users:   980, pct:  7.6 },
  { region: 'Latin America',  users:   520, pct:  4.0 },
  { region: 'Oceania',        users:   272, pct:  2.2 },
]

export const RECENT_ACTIVITY = [
  { id: 'a1', actor: 'Amara Okafor', action: 'verified an on-chain mandate',  time: '2 min ago' },
  { id: 'a2', actor: 'Noah Kim',     action: 'paused agent BTC-Momentum',     time: '8 min ago' },
  { id: 'a3', actor: 'Policy Audit', action: 'flagged 3 agents for review',   time: '17 min ago' },
  { id: 'a4', actor: 'Priya Shah',   action: 'rotated wallet permissions',    time: '32 min ago' },
  { id: 'a5', actor: 'Mateo Ruiz',   action: 'requested mandate uplift',      time: '1 h ago' },
]
