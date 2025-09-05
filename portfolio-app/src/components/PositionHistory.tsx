import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Search,
  Pencil
} from 'lucide-react'
import { Input } from './ui/input'
import { formatCurrency } from '@/lib/utils'
import { useHistoryStore } from '@/stores/historyStore'
import { CRYPTO_ASSETS } from '@/data/cryptoAssets'
import { HistoryStats } from './HistoryStats'
import { Button } from './ui/button'
import type { HistoryActionType } from '@/types/history'
import type { PortfolioEntry } from '@/types/portfolio'

interface PositionHistoryProps {
  onEdit?: (entry: PortfolioEntry) => void
}

export function PositionHistory({ onEdit }: PositionHistoryProps = {}) {
  const history = useHistoryStore((state) => state.history)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<HistoryActionType | 'all'>('all')
  const [filterAsset, setFilterAsset] = useState<string>('all')

  // Get unique assets from history
  const uniqueAssets = useMemo(() => {
    const assets = new Set(history.map(h => h.asset))
    return Array.from(assets).sort()
  }, [history])

  // Filter history based on search and filters (exclude updates)
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      // Skip update entries since we don't track them anymore
      if (entry.action === 'update') return false
      
      const matchesSearch = searchTerm === '' || 
        entry.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesAction = filterAction === 'all' || entry.action === filterAction
      const matchesAsset = filterAsset === 'all' || entry.asset === filterAsset
      
      return matchesSearch && matchesAction && matchesAsset
    })
  }, [history, searchTerm, filterAction, filterAsset])

  const getActionIcon = (action: HistoryActionType) => {
    switch (action) {
      case 'add':
        return <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'update':
        return <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
    }
  }

  const getActionLabel = (action: HistoryActionType) => {
    switch (action) {
      case 'add':
        return 'Added transaction'
      case 'update':
        return 'Updated transaction'
      case 'delete':
        return 'Deleted transaction'
    }
  }

  const getActionColor = (action: HistoryActionType) => {
    switch (action) {
      case 'add':
        return 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'update':
        return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'delete':
        return 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    }
  }

  if (history.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-8 text-center">
        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">No History Yet</h2>
        <p className="text-muted-foreground">
          Your transaction history will appear here once you start adding transactions to your portfolio.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <HistoryStats />
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track all your portfolio transactions
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredHistory.length} {filteredHistory.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by asset or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as HistoryActionType | 'all')}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="all">All Actions</option>
              <option value="add">Added</option>
              <option value="delete">Deleted</option>
            </select>

            <select
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="all">All Assets</option>
              {uniqueAssets.map(asset => (
                <option key={asset} value={asset}>{asset}</option>
              ))}
            </select>
          </div>
        </div>

        {/* History Timeline */}
        <div className="space-y-4">
          {filteredHistory.map((entry, index) => {
            const asset = CRYPTO_ASSETS.find(a => a.symbol === entry.asset)
            const isLastItem = index === filteredHistory.length - 1
            
            return (
              <div key={entry.id} className="relative">
                {!isLastItem && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                )}
                
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      {getActionIcon(entry.action)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {asset?.logo && (
                            <img 
                              src={asset.logo} 
                              alt={asset.name}
                              className="w-6 h-6"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{entry.asset}</span>
                              {entry.type && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  entry.type === 'buy' 
                                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                    : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                }`}>
                                  {entry.type === 'buy' ? 'Buy' : 'Sell'}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getActionColor(entry.action)}`}>
                                {getActionLabel(entry.action)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(entry.timestamp), 'PPp')}</span>
                            </div>
                          </div>
                        </div>
                        {onEdit && entry.action !== 'delete' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const entryToEdit: PortfolioEntry = {
                                id: entry.entryId || entry.id,
                                asset: entry.asset,
                                type: entry.type || 'buy',
                                quantity: entry.quantity,
                                buy_price_usd: entry.buy_price_usd,
                                destination_asset: entry.destination_asset,
                                buy_date: entry.buy_date,
                                notes: entry.notes,
                                created_at: entry.timestamp,
                                updated_at: entry.timestamp
                              }
                              onEdit(entryToEdit)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>
                          <div className="font-medium">
                            {entry.action === 'update' && entry.previousValue?.quantity && 
                             entry.previousValue.quantity !== entry.quantity ? (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground line-through">
                                  {entry.previousValue.quantity}
                                </span>
                                <ArrowUpRight className="h-3 w-3" />
                                <span>{entry.quantity}</span>
                              </div>
                            ) : (
                              <span>{entry.quantity}</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Buy Price:</span>
                          <div className="font-medium">
                            {entry.action === 'update' && entry.previousValue?.buy_price_usd && 
                             entry.previousValue.buy_price_usd !== entry.buy_price_usd ? (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground line-through">
                                  {formatCurrency(entry.previousValue.buy_price_usd)}
                                </span>
                                {entry.buy_price_usd > entry.previousValue.buy_price_usd ? (
                                  <ArrowUpRight className="h-3 w-3 text-red-500" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 text-green-500" />
                                )}
                                <span>{formatCurrency(entry.buy_price_usd)}</span>
                              </div>
                            ) : (
                              <span>{formatCurrency(entry.buy_price_usd)}</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-foreground">
                            {entry.type === 'sell' ? 'Total Received:' : 'Total Investment:'}
                          </span>
                          <div className="font-medium">
                            {formatCurrency(entry.quantity * entry.buy_price_usd)}
                            {entry.type === 'sell' && entry.destination_asset && (
                              <span className="text-xs text-muted-foreground ml-1">
                                in {entry.destination_asset}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Buy Date */}
                      {entry.buy_date && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Purchase Date: </span>
                          <span className="font-medium">
                            {format(new Date(entry.buy_date), 'PP')}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {entry.notes && (
                        <div className="text-sm p-3 bg-background rounded border">
                          <span className="text-muted-foreground">Note: </span>
                          <span>{entry.notes}</span>
                        </div>
                      )}

                      {/* Changes for updates */}
                      {entry.action === 'update' && entry.previousValue && (
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          <span>Changes made in this update</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}