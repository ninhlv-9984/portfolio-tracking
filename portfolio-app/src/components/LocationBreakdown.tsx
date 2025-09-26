import { useMemo } from 'react'
import { MapPin, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import type { PositionWithMetrics } from '@/types/portfolio'

interface LocationBreakdownProps {
  positions: PositionWithMetrics[]
}

interface LocationGroup {
  location: string
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercentage: number
  assets: Array<{
    symbol: string
    value: number
    quantity: number
    pnl: number
    pnlPercentage: number
  }>
}

export function LocationBreakdown({ positions }: LocationBreakdownProps) {
  const locationGroups = useMemo(() => {
    const groups = new Map<string, LocationGroup>()

    positions.forEach(position => {
      const locations = (position as any).locations as string[] | undefined

      if (!locations || locations.length === 0) {
        // Handle assets with no location specified
        const key = 'Unknown'
        if (!groups.has(key)) {
          groups.set(key, {
            location: key,
            totalValue: 0,
            totalCost: 0,
            totalPnL: 0,
            totalPnLPercentage: 0,
            assets: []
          })
        }

        const group = groups.get(key)!
        group.totalValue += position.value
        group.totalCost += position.quantity * position.buy_price_usd
        group.totalPnL += position.pnl
        group.assets.push({
          symbol: position.asset,
          value: position.value,
          quantity: position.quantity,
          pnl: position.pnl,
          pnlPercentage: position.pnlPercentage
        })
      } else {
        // Handle assets with locations (may be in multiple locations)
        locations.forEach(location => {
          if (!groups.has(location)) {
            groups.set(location, {
              location,
              totalValue: 0,
              totalCost: 0,
              totalPnL: 0,
              totalPnLPercentage: 0,
              assets: []
            })
          }

          const group = groups.get(location)!
          // If asset is in multiple locations, we split evenly
          const splitRatio = 1 / locations.length
          const splitValue = position.value * splitRatio
          const splitCost = (position.quantity * position.buy_price_usd) * splitRatio
          const splitPnL = position.pnl * splitRatio

          group.totalValue += splitValue
          group.totalCost += splitCost
          group.totalPnL += splitPnL

          // Check if this asset is already in the group
          const existingAsset = group.assets.find(a => a.symbol === position.asset)
          if (existingAsset) {
            existingAsset.value += splitValue
            existingAsset.quantity += position.quantity * splitRatio
            existingAsset.pnl += splitPnL
            existingAsset.pnlPercentage = position.pnlPercentage // Keep the same percentage
          } else {
            group.assets.push({
              symbol: position.asset,
              value: splitValue,
              quantity: position.quantity * splitRatio,
              pnl: splitPnL,
              pnlPercentage: position.pnlPercentage
            })
          }
        })
      }
    })

    // Calculate total P&L percentage for each location
    groups.forEach(group => {
      if (group.totalCost > 0) {
        group.totalPnLPercentage = (group.totalPnL / group.totalCost) * 100
      }
    })

    // Sort by total value descending
    return Array.from(groups.values()).sort((a, b) => b.totalValue - a.totalValue)
  }, [positions])

  if (positions.length === 0) {
    return null
  }

  const totalPortfolioValue = locationGroups.reduce((sum, group) => sum + group.totalValue, 0)

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Assets by Location</h2>
        </div>

        <div className="space-y-4">
          {locationGroups.map((group) => {
            const percentage = (group.totalValue / totalPortfolioValue) * 100

            return (
              <div key={group.location} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{group.location}</span>
                    <span className="text-sm text-muted-foreground">
                      ({group.assets.length} {group.assets.length === 1 ? 'asset' : 'assets'})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(group.totalValue)}</div>
                    <div className="text-sm text-muted-foreground">{formatPercentage(percentage)} of total</div>
                  </div>
                </div>

                {/* P&L for this location */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className={`font-medium ${group.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {group.totalPnL >= 0 ? '+' : ''}{formatCurrency(group.totalPnL)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {group.totalPnL >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`font-medium ${group.totalPnLPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {group.totalPnLPercentage >= 0 ? '+' : ''}{formatPercentage(group.totalPnLPercentage)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-primary transition-all"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {/* Asset list for this location */}
                <div className="pl-4 space-y-1">
                  {group.assets.map(asset => (
                    <div key={asset.symbol} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{asset.symbol}</span>
                      <div className="flex items-center gap-3">
                        <span>{formatCurrency(asset.value)}</span>
                        <span className={`text-xs ${asset.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {asset.pnl >= 0 ? '+' : ''}{formatPercentage(asset.pnlPercentage)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}