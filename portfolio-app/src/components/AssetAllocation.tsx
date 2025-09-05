import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import type { PositionWithMetrics } from '@/types/portfolio'
import { CRYPTO_ASSETS } from '@/data/cryptoAssets'

interface AssetAllocationProps {
  positions: PositionWithMetrics[]
}

// Professional color palette for the pie chart
const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
  '#14b8a6', // teal
  '#a855f7', // purple
  '#ef4444', // red
  '#22c55e', // green
  '#0ea5e9', // sky
  '#facc15', // yellow
]

interface ChartData {
  name: string
  value: number
  percentage: number
  quantity: number
  color: string
}

export function AssetAllocation({ positions }: AssetAllocationProps) {
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0)

  if (positions.length === 0 || totalValue === 0) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Asset Allocation</h2>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>No positions to display</p>
        </div>
      </div>
    )
  }

  // Prepare data for pie chart
  const chartData: ChartData[] = positions
    .map((position, index) => {
      const asset = CRYPTO_ASSETS.find(a => a.symbol === position.asset)
      return {
        name: position.asset,
        value: position.value,
        percentage: (position.value / totalValue) * 100,
        quantity: position.quantity,
        color: asset?.color || CHART_COLORS[index % CHART_COLORS.length]
      }
    })
    .sort((a, b) => b.value - a.value) // Sort by value descending

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Quantity: {data.quantity.toLocaleString()}
          </p>
          <p className="text-sm">
            Value: {formatCurrency(data.value)}
          </p>
          <p className="text-sm font-medium">
            {formatPercentage(data.percentage)} of portfolio
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = () => {
    return null // Don't display percentage labels on the pie chart
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {payload.map((entry: any, index: number) => {
          const data = chartData.find(d => d.name === entry.value)
          if (!data) return null
          
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{entry.value}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(data.percentage)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Asset Allocation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Portfolio distribution by value
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            {positions.length} {positions.length === 1 ? 'Asset' : 'Assets'}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(totalValue)}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={110}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <text 
              x="50%" 
              y="50%" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              className="text-2xl font-bold fill-current"
            >
              {chartData.length}
            </text>
            <text 
              x="50%" 
              y="50%" 
              dy={20} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              className="text-xs text-muted-foreground fill-current"
            >
              assets
            </text>
          </PieChart>
        </ResponsiveContainer>

        <div className="border-t pt-4">
          <CustomLegend payload={chartData.map(d => ({ value: d.name, color: d.color }))} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-lg font-semibold">{formatCurrency(totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Largest Position</p>
            <p className="text-lg font-semibold">
              {chartData[0]?.name} ({formatPercentage(chartData[0]?.percentage || 0)})
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}