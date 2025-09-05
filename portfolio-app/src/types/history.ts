export type HistoryActionType = 'add' | 'update' | 'delete'

export interface HistoryEntry {
  id: string
  timestamp: string
  action: HistoryActionType
  entryId: string
  asset: string
  quantity: number
  buy_price_usd: number
  buy_date?: string
  notes?: string
  previousValue?: {
    quantity?: number
    buy_price_usd?: number
    buy_date?: string
    notes?: string
  }
  metadata?: {
    totalValue?: number
    pnl?: number
  }
}