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
    const isSell = entry.type === 'sell'
    const isWithdraw = entry.type === 'withdraw'
    const isDeposit = entry.type === 'deposit'
    const isBuy = entry.type === 'buy'
    const isSwap = entry.type === 'swap'
    
    // Calculate quantity change based on transaction type
    const quantityChange = (isSell || isWithdraw) ? -entry.quantity : entry.quantity
    
    if (existing) {
      // Update existing group
      const newTotalQuantity = existing.totalQuantity + quantityChange
      
      // Handle investment calculation based on transaction type
      let newTotalInvestment: number
      if (isSell || isWithdraw) {
        // For sells/withdraws, reduce investment proportionally based on average price
        const reduceValue = entry.quantity * existing.averageBuyPrice
        newTotalInvestment = Math.max(0, existing.totalInvestment - reduceValue)
      } else if (isDeposit) {
        // For deposits, use provided price or current average
        const depositPrice = entry.buy_price_usd || existing.averageBuyPrice
        newTotalInvestment = existing.totalInvestment + (entry.quantity * depositPrice)
      } else {
        // For buys and swaps, add to the investment
        newTotalInvestment = existing.totalInvestment + (entry.quantity * entry.buy_price_usd)
      }
      
      existing.totalQuantity = newTotalQuantity
      existing.totalInvestment = newTotalInvestment
      existing.averageBuyPrice = newTotalQuantity > 0 ? newTotalInvestment / newTotalQuantity : 0
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
    } else if (!isSell && !isWithdraw) {
      // Create new group for buy/deposit/swap transactions
      const initialPrice = entry.buy_price_usd || 0 // For deposits with no price
      grouped.set(entry.asset, {
        asset: entry.asset,
        totalQuantity: entry.quantity,
        averageBuyPrice: initialPrice,
        totalInvestment: entry.quantity * initialPrice,
        entries: [entry],
        earliestBuyDate: entry.buy_date,
        latestBuyDate: entry.buy_date,
        notes: entry.notes ? [entry.notes] : []
      })
    }
    // If it's a sell/withdraw and no existing position, skip it (can't sell/withdraw what you don't have)
  })

  // Filter out positions with zero or negative quantity
  return Array.from(grouped.values()).filter(group => group.totalQuantity > 0)
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
      type: 'buy', // Default type for grouped display
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