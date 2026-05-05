export interface Agent {
  id: string
  mandateId: string
  mandateName: string
  name: string
  status: 'active' | 'paused' | 'failed' | 'stopped' | 'inactive'
  capitalCap: number
  totalPnl: number
  totalRoi: number
  totalVolume: number
  drawdownCurrent: number
  deployedAt: string | null
  lastTradeAt: string | null
}
