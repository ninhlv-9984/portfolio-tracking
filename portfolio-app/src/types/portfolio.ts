export interface PortfolioEntry {
  id: string
  asset: string
  quantity: number
  buy_price_usd: number
  buy_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface AssetPrice {
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  last_updated: string
  image?: string
}

export interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercentage: number
  change24h: number
  change24hPercentage: number
}

export interface PositionWithMetrics extends PortfolioEntry {
  currentPrice: number
  value: number
  pnl: number
  pnlPercentage: number
  assetInfo?: AssetPrice
}