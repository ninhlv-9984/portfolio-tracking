import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
}

const COLORS = [
  '#00e5ff', // cyan
  '#fbbf24', // gold
  '#a78bfa', // purple
  '#34d399', // emerald
  '#f87171', // red
  '#fb923c', // orange
  '#60a5fa', // blue
  '#e879f9', // pink
];

const GROUP_COLORS: Record<string, string> = {
  'BTC': '#F7931A',
  'Cash': '#22c55e',
  'Gold': '#fbbf24',
  'Altcoins': '#a78bfa',
};

type ViewMode = 'individual' | 'grouped';

function categorizeAsset(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  if (upperSymbol === 'BTC') return 'BTC';
  if (['USDT', 'USDC', 'USD', 'DAI', 'BUSD', 'TUSD'].includes(upperSymbol)) return 'Cash';
  if (['PAXG', 'XAU'].includes(upperSymbol)) return 'Gold';
  return 'Altcoins';
}

export default function AllocationChart({ holdings }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('individual');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const individualData = holdings
    .map((holding) => ({
      name: holding.symbol,
      value: holding.weight || 0,
      amount: holding.currentValue || 0,
    }))
    .sort((a, b) => b.value - a.value);

  const groupedData = Object.entries(
    holdings.reduce((acc, holding) => {
      const group = categorizeAsset(holding.symbol);
      if (!acc[group]) {
        acc[group] = { value: 0, amount: 0 };
      }
      acc[group].value += holding.weight || 0;
      acc[group].amount += holding.currentValue || 0;
      return acc;
    }, {} as Record<string, { value: number; amount: number }>)
  )
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.value - a.value);

  const chartData = viewMode === 'individual' ? individualData : groupedData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="px-4 py-3 rounded-lg shadow-xl"
          style={{
            background: 'var(--chart-tooltip-bg)',
            border: '1px solid var(--border-hover)',
          }}
        >
          <p className="font-bold text-sm text-[var(--text-primary)]">{data.name}</p>
          <p className="text-xs font-mono mt-1" style={{ color: 'var(--cyan)' }}>{formatCurrency(data.amount)}</p>
          <p className="text-xs font-mono text-[var(--text-muted)]">{data.value.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  const significantHoldings = viewMode === 'individual'
    ? chartData.filter(h => h.value >= 0.5)
    : chartData;
  const otherHoldings = viewMode === 'individual'
    ? chartData.filter(h => h.value < 0.5)
    : [];
  const otherTotal = otherHoldings.reduce((sum, h) => sum + h.value, 0);
  const otherAmount = otherHoldings.reduce((sum, h) => sum + h.amount, 0);

  const displayData = [...significantHoldings];
  if (otherHoldings.length > 0) {
    displayData.push({ name: 'Others', value: otherTotal, amount: otherAmount });
  }

  const getColor = (index: number, name: string) => {
    if (viewMode === 'grouped' && GROUP_COLORS[name]) {
      return GROUP_COLORS[name];
    }
    return COLORS[index % COLORS.length];
  };

  return (
    <div className="glow-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Allocation</h2>
        <div className="flex rounded-lg p-0.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setViewMode('individual')}
            className="px-3 py-1.5 rounded-md text-xs font-mono transition-all"
            style={viewMode === 'individual' ? {
              background: 'var(--cyan-dim)',
              color: 'var(--cyan)',
            } : {
              color: 'var(--text-muted)',
            }}
          >
            Assets
          </button>
          <button
            onClick={() => setViewMode('grouped')}
            className="px-3 py-1.5 rounded-md text-xs font-mono transition-all"
            style={viewMode === 'grouped' ? {
              background: 'var(--cyan-dim)',
              color: 'var(--cyan)',
            } : {
              color: 'var(--text-muted)',
            }}
          >
            Groups
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={false}
            outerRadius={110}
            innerRadius={75}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={3}
            strokeWidth={0}
          >
            {displayData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(index, entry.name)}
                opacity={0.85}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 space-y-1.5">
        {displayData.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer"
            style={{ }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--row-hover-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: getColor(index, item.name) }}
              />
              <span className="text-sm font-semibold text-[var(--text-secondary)]">{item.name}</span>
            </div>
            <div className="text-right flex items-center gap-4">
              <span className="text-xs font-mono text-[var(--text-muted)]">{formatCurrency(item.amount)}</span>
              <span className="text-sm font-mono font-bold text-[var(--text-primary)] w-14 text-right">{item.value.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
