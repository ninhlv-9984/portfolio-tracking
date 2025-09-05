import { useQuery } from '@tanstack/react-query'
import { usePortfolioStore } from '../stores/portfolioStore'
import { priceService } from '../services/priceService'
import type { PositionWithMetrics, PortfolioMetrics } from '../types/portfolio'

export const usePortfolio = () => {
  const entries = usePortfolioStore((state) => state.entries)
  
  const { data: prices, isLoading, error, refetch } = useQuery({
    queryKey: ['prices', entries.map(e => e.asset)],
    queryFn: async () => {
      const symbols = [...new Set(entries.map(e => e.asset))]
      if (symbols.length === 0) return new Map()
      return priceService.getPrices(symbols)
    },
    refetchInterval: 15000, // Refetch every 15 seconds
    enabled: entries.length > 0
  })

  const positionsWithMetrics: PositionWithMetrics[] = entries.map(entry => {
    const assetPrice = prices?.get(entry.asset)
    const currentPrice = assetPrice?.current_price || 0
    const value = entry.quantity * currentPrice
    const cost = entry.quantity * entry.buy_price_usd
    const pnl = value - cost
    const pnlPercentage = cost > 0 ? (pnl / cost) * 100 : 0

    return {
      ...entry,
      currentPrice,
      value,
      pnl,
      pnlPercentage,
      assetInfo: assetPrice
    }
  })

  const metrics: PortfolioMetrics = positionsWithMetrics.reduce(
    (acc, position) => {
      const cost = position.quantity * position.buy_price_usd
      acc.totalValue += position.value
      acc.totalCost += cost
      acc.totalPnL += position.pnl
      
      if (position.assetInfo?.price_change_percentage_24h) {
        const prevValue = position.value / (1 + position.assetInfo.price_change_percentage_24h / 100)
        acc.change24h += position.value - prevValue
      }
      
      return acc
    },
    {
      totalValue: 0,
      totalCost: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      change24h: 0,
      change24hPercentage: 0
    }
  )

  metrics.totalPnLPercentage = metrics.totalCost > 0 
    ? (metrics.totalPnL / metrics.totalCost) * 100 
    : 0
  
  metrics.change24hPercentage = (metrics.totalValue - metrics.change24h) > 0
    ? (metrics.change24h / (metrics.totalValue - metrics.change24h)) * 100
    : 0

  return {
    positions: positionsWithMetrics,
    metrics,
    isLoading,
    error,
    refetch
  }
}