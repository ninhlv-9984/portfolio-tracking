import { TrendingUp, Activity, Calendar, Package } from 'lucide-react'
import { useHistoryStore } from '@/stores/apiHistoryStore'
import { usePortfolioStore } from '@/stores/apiPortfolioStore'
import { format } from 'date-fns'

export function HistoryStats() {
  const history = useHistoryStore((state) => state.history)
  const entries = usePortfolioStore((state) => state.entries)
  
  // Calculate stats
  const totalTransactions = history.length
  const addedCount = history.filter(h => h.action === 'add').length
  const updatedCount = history.filter(h => h.action === 'update').length
  const deletedCount = history.filter(h => h.action === 'delete').length
  
  // Get date of first and last transaction
  const firstTransaction = history[history.length - 1]
  const lastTransaction = history[0]
  
  // Calculate unique assets traded
  const uniqueAssets = new Set(history.map(h => h.asset)).size
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">Total Actions</span>
        </div>
        <div className="text-2xl font-bold">{totalTransactions}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {addedCount} added, {updatedCount} updated, {deletedCount} deleted
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm text-muted-foreground">Active Transactions</span>
        </div>
        <div className="text-2xl font-bold">{entries.length}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Currently in portfolio
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm text-muted-foreground">Assets Traded</span>
        </div>
        <div className="text-2xl font-bold">{uniqueAssets}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Different cryptocurrencies
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-sm text-muted-foreground">Trading Period</span>
        </div>
        {firstTransaction && lastTransaction ? (
          <>
            <div className="text-sm font-medium">
              {format(new Date(firstTransaction.timestamp), 'MMM d, yyyy')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              to {format(new Date(lastTransaction.timestamp), 'MMM d, yyyy')}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No activity yet</div>
        )}
      </div>
    </div>
  )
}