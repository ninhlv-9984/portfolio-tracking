import { formatCurrency, formatPercentage } from '@/lib/utils'
import type { PositionWithMetrics } from '@/types/portfolio'
import { CRYPTO_ASSETS } from '@/data/cryptoAssets'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface AllocationBreakdownProps {
  positions: PositionWithMetrics[]
}

export function AllocationBreakdown({ positions }: AllocationBreakdownProps) {
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0)

  if (positions.length === 0 || totalValue === 0) {
    return null
  }

  // Sort positions by value
  const sortedPositions = [...positions].sort((a, b) => b.value - a.value)

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">Allocation Breakdown</h2>
      
      <div className="space-y-3">
        {sortedPositions.map((position) => {
          const percentage = (position.value / totalValue) * 100
          const asset = CRYPTO_ASSETS.find(a => a.symbol === position.asset)
          
          return (
            <div key={position.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {asset?.logo && (
                    <img 
                      src={asset.logo} 
                      alt={asset.name}
                      className="w-5 h-5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <span className="font-medium">{position.asset}</span>
                  <span className="text-sm text-muted-foreground">
                    {position.quantity.toLocaleString()} units
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(position.value)}</div>
                  <div className={`text-xs flex items-center justify-end gap-1 ${
                    position.pnl >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {position.pnl >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: asset?.color || '#3b82f6'
                    }}
                  />
                </div>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
                  {formatPercentage(percentage)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Assets</p>
          <p className="font-semibold">{positions.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Profitable</p>
          <p className="font-semibold text-green-600 dark:text-green-400">
            {positions.filter(p => p.pnl >= 0).length}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">At Loss</p>
          <p className="font-semibold text-red-600 dark:text-red-400">
            {positions.filter(p => p.pnl < 0).length}
          </p>
        </div>
      </div>
    </div>
  )
}