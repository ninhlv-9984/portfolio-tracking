import { useState, useMemo } from 'react'
import { ArrowUpDown, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import type { PositionWithMetrics } from '@/types/portfolio'
import { usePortfolioStore } from '@/stores/apiPortfolioStore'

interface PortfolioTableProps {
  positions: PositionWithMetrics[]
  onEdit: (position: PositionWithMetrics) => void
}

type SortKey = 'asset' | 'value' | 'pnl' | 'pnlPercentage'

export function PortfolioTable({ positions, onEdit }: PortfolioTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('value')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  const deleteEntry = usePortfolioStore((state) => state.deleteEntry)

  const filteredAndSortedPositions = useMemo(() => {
    let filtered = positions.filter(p => 
      p.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assetInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      const aValue = a[sortKey] ?? 0
      const bValue = b[sortKey] ?? 0
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue)
      }
      
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return filtered
  }, [positions, searchTerm, sortKey, sortDirection])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      deleteEntry(id)
    }
  }

  if (positions.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search by ticker or name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('asset')}
                    className="flex items-center gap-1"
                  >
                    Asset
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </th>
                <th className="p-4 text-right">Quantity</th>
                <th className="p-4 text-right">Buy Price</th>
                <th className="p-4 text-right">Current Price</th>
                <th className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('value')}
                    className="flex items-center gap-1 ml-auto"
                  >
                    Value
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </th>
                <th className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('pnl')}
                    className="flex items-center gap-1 ml-auto"
                  >
                    P/L
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </th>
                <th className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('pnlPercentage')}
                    className="flex items-center gap-1 ml-auto"
                  >
                    P/L %
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPositions.map((position) => {
                const groupedEntries = (position as any).groupedEntries
                const hasMultipleEntries = groupedEntries && groupedEntries.length > 1
                
                return (
                  <tr key={position.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {position.assetInfo?.image && (
                          <img 
                            src={position.assetInfo.image} 
                            alt={position.asset}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">{position.asset}</div>
                          {position.assetInfo?.name && (
                            <div className="text-sm text-muted-foreground">
                              {position.assetInfo.name}
                            </div>
                          )}
                          {hasMultipleEntries && (
                            <div className="text-xs text-muted-foreground">
                              {groupedEntries.length} transactions • Avg price: {formatCurrency(position.buy_price_usd)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  <td className="p-4 text-right font-mono">
                    {position.quantity.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-mono">
                    {formatCurrency(position.buy_price_usd)}
                  </td>
                  <td className="p-4 text-right font-mono">
                    {formatCurrency(position.currentPrice)}
                    {position.assetInfo?.price_change_percentage_24h && (
                      <div className={`text-xs flex items-center justify-end gap-1 ${
                        position.assetInfo.price_change_percentage_24h > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {position.assetInfo.price_change_percentage_24h > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercentage(position.assetInfo.price_change_percentage_24h)}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right font-mono">
                    {formatCurrency(position.value)}
                  </td>
                  <td className={`p-4 text-right font-mono ${
                    position.pnl >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                  </td>
                  <td className={`p-4 text-right font-mono ${
                    position.pnlPercentage >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {position.pnlPercentage >= 0 ? '+' : ''}{formatPercentage(position.pnlPercentage)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(position)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(position.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}