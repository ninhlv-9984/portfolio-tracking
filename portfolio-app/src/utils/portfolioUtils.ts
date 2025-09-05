import type { PortfolioEntry, PositionWithMetrics } from '../types/portfolio'

export interface GroupedPosition {
  asset: string
  totalQuantity: number
  averageBuyPrice: number
  totalInvestment: number
  entries: PortfolioEntry[]
  earliestBuyDate?: string
  latestBuyDate?: string
  notes: string[]
}

export function groupPositionsByAsset(entries: PortfolioEntry[]): GroupedPosition[] {
  const grouped = new Map<string, GroupedPosition>()

  entries.forEach(entry => {
    const existing = grouped.get(entry.asset)
    
    if (existing) {
      // Update existing group
      const newTotalQuantity = existing.totalQuantity + entry.quantity
      const newTotalInvestment = existing.totalInvestment + (entry.quantity * entry.buy_price_usd)
      
      existing.totalQuantity = newTotalQuantity
      existing.totalInvestment = newTotalInvestment
      existing.averageBuyPrice = newTotalInvestment / newTotalQuantity
      existing.entries.push(entry)
      
      // Update dates
      if (entry.buy_date) {
        if (!existing.earliestBuyDate || entry.buy_date < existing.earliestBuyDate) {
          existing.earliestBuyDate = entry.buy_date
        }
        if (!existing.latestBuyDate || entry.buy_date > existing.latestBuyDate) {
          existing.latestBuyDate = entry.buy_date
        }
      }
      
      // Collect notes
      if (entry.notes) {
        existing.notes.push(entry.notes)
      }
    } else {
      // Create new group
      grouped.set(entry.asset, {
        asset: entry.asset,
        totalQuantity: entry.quantity,
        averageBuyPrice: entry.buy_price_usd,
        totalInvestment: entry.quantity * entry.buy_price_usd,
        entries: [entry],
        earliestBuyDate: entry.buy_date,
        latestBuyDate: entry.buy_date,
        notes: entry.notes ? [entry.notes] : []
      })
    }
  })

  return Array.from(grouped.values())
}

export function convertGroupedToMetrics(
  grouped: GroupedPosition[],
  prices: Map<string, any> | undefined
): PositionWithMetrics[] {
  return grouped.map(group => {
    const assetPrice = prices?.get(group.asset)
    const currentPrice = assetPrice?.current_price || 0
    const value = group.totalQuantity * currentPrice
    const cost = group.totalInvestment
    const pnl = value - cost
    const pnlPercentage = cost > 0 ? (pnl / cost) * 100 : 0

    // Create a synthetic entry for display
    const syntheticEntry: PortfolioEntry = {
      id: `grouped-${group.asset}`,
      asset: group.asset,
      quantity: group.totalQuantity,
      buy_price_usd: group.averageBuyPrice,
      buy_date: group.earliestBuyDate,
      notes: group.notes.join('; '),
      created_at: group.entries[0].created_at,
      updated_at: group.entries[group.entries.length - 1].updated_at
    }

    return {
      ...syntheticEntry,
      currentPrice,
      value,
      pnl,
      pnlPercentage,
      assetInfo: assetPrice,
      // Store the original entries for reference
      groupedEntries: group.entries
    } as PositionWithMetrics & { groupedEntries?: PortfolioEntry[] }
  })
}