import { useQuery } from '@tanstack/react-query'
import { usePortfolioStore } from '../stores/portfolioStore'
import { priceManager } from '../services/priceManager'
import type { PositionWithMetrics, PortfolioMetrics } from '../types/portfolio'
import { useState } from 'react'

export const usePortfolio = () => {
  const entries = usePortfolioStore((state) => state.entries)
  const [dataSource, setDataSource] = useState<'api' | 'scraper'>('api')
  const [sourceMessage, setSourceMessage] = useState<string>('')
  
  const { data: priceData, isLoading, error, refetch } = useQuery({
    queryKey: ['prices', entries.map(e => e.asset)],
    queryFn: async () => {
      const symbols = [...new Set(entries.map(e => e.asset))]
      if (symbols.length === 0) return { prices: new Map(), source: 'api' as const }
      
      const result = await priceManager.getPrices(symbols)
      setDataSource(result.source)
      if (result.message) {
        setSourceMessage(result.message)
        // Clear message after 5 seconds
        setTimeout(() => setSourceMessage(''), 5000)
      }
      return result
    },
    refetchInterval: 60000, // Refetch every 60 seconds (reduced from 15s to avoid rate limits)
    staleTime: 30000, // Consider data stale after 30 seconds
    enabled: entries.length > 0
  })
  
  const prices = priceData?.prices

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
    refetch,
    dataSource,
    sourceMessage
  }
}