export type HistoryActionType = 'add' | 'update' | 'delete'

export interface HistoryEntry {
  id: string
  timestamp: string
  action: HistoryActionType
  entryId: string
  asset: string
  type?: 'buy' | 'sell'
  destination_asset?: string
  location?: string
  quantity: number
  buy_price_usd: number
  buy_date?: string
  notes?: string
  previousValue?: {
    quantity?: number
    buy_price_usd?: number
    buy_date?: string
    notes?: string
    location?: string
  }
  metadata?: {
    totalValue?: number
    pnl?: number
  }
}