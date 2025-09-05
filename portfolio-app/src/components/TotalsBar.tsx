import { TrendingUp, TrendingDown, DollarSign, Percent, Clock } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import type { PortfolioMetrics } from '@/types/portfolio'

interface TotalsBarProps {
  metrics: PortfolioMetrics
  lastUpdated?: string
  onRefresh?: () => void
}

export function TotalsBar({ metrics, lastUpdated, onRefresh }: TotalsBarProps) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            Total Value
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.totalValue)}
          </div>
          {metrics.change24h !== 0 && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${
              metrics.change24h >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {metrics.change24h >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                {metrics.change24h >= 0 ? '+' : ''}{formatCurrency(metrics.change24h)}
                {' '}({formatPercentage(metrics.change24hPercentage)})
              </span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            Total Cost
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.totalCost)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            Total P/L
          </div>
          <div className={`text-2xl font-bold ${
            metrics.totalPnL >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {metrics.totalPnL >= 0 ? '+' : ''}{formatCurrency(metrics.totalPnL)}
          </div>
          <div className={`flex items-center gap-1 mt-1 text-sm ${
            metrics.totalPnLPercentage >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            <Percent className="h-3 w-3" />
            <span>
              {metrics.totalPnLPercentage >= 0 ? '+' : ''}{formatPercentage(metrics.totalPnLPercentage)}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            Last Updated
          </div>
          <div className="text-sm">
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Refresh now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}