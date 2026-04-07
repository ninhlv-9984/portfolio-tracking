import type { Holding } from '../types';
import { useState } from 'react';
import { getCryptoLogoUrl } from '../utils/cryptoLogos';

interface Props {
  holdings: Holding[];
}

type SortField = 'symbol' | 'amount' | 'currentValue' | 'pnlPercentage' | 'weight';
type SortDirection = 'asc' | 'desc';

export default function HoldingsTable({ holdings }: Props) {
  const [sortField, setSortField] = useState<SortField>('weight');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 8) => {
    return value.toFixed(decimals);
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '—';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredHoldings = holdings.filter(holding => (holding.currentValue || 0) >= 1);

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    let aValue: number, bValue: number;

    switch (sortField) {
      case 'symbol':
        return sortDirection === 'asc'
          ? a.symbol.localeCompare(b.symbol)
          : b.symbol.localeCompare(a.symbol);
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'currentValue':
        aValue = a.currentValue || 0;
        bValue = b.currentValue || 0;
        break;
      case 'pnlPercentage':
        aValue = a.pnlPercentage || 0;
        bValue = b.pnlPercentage || 0;
        break;
      case 'weight':
        aValue = a.weight || 0;
        bValue = b.weight || 0;
        break;
      default:
        return 0;
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-[var(--text-muted)] ml-1">⇅</span>;
    return <span className="ml-1" style={{ color: 'var(--cyan)' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="glow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Holdings</h2>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5 tracking-wider">{sortedHoldings.length} POSITIONS</p>
        </div>
        <div className="flex gap-1">
          {(['weight', 'currentValue', 'pnlPercentage'] as SortField[]).map(field => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className="px-3 py-1.5 rounded-md text-xs font-mono transition-all"
              style={sortField === field ? {
                background: 'var(--cyan-dim)',
                color: 'var(--cyan)',
                border: '1px solid var(--cyan-dim)',
              } : {
                color: 'var(--text-muted)',
                border: '1px solid transparent',
              }}
            >
              {field === 'weight' ? 'WT' : field === 'currentValue' ? 'VAL' : 'P&L'}
              <SortIcon field={field} />
            </button>
          ))}
        </div>
      </div>

      {/* Holdings list */}
      <div className="p-4 space-y-2">
        {sortedHoldings.map((holding) => {
          const isProfitable = (holding.pnlPercentage || 0) >= 0;
          const isStablecoin = holding.symbol === 'USD' || ['USDT', 'USDC', 'DAI', 'TUSD', 'BUSD'].includes(holding.symbol);

          return (
            <div
              key={holding.symbol}
              className="rounded-xl p-4 border border-transparent transition-all cursor-pointer"
              style={{
                background: 'var(--row-bg)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--row-hover-bg)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--row-bg)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div className="flex items-center justify-between">
                {/* Left: Icon + Name */}
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'var(--bg-card)',
                      boxShadow: `inset 0 0 0 1px var(--ring-color)`,
                    }}
                  >
                    <img
                      src={getCryptoLogoUrl(holding.symbol)}
                      alt={holding.symbol}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">{holding.symbol}</h3>
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      {formatNumber(holding.amount, holding.amount < 1 ? 8 : 4)}
                    </p>
                  </div>
                </div>

                {/* Right: Value + P&L */}
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-[var(--text-primary)]">
                    {formatCurrency(holding.currentValue)}
                  </p>
                  {!isStablecoin && (
                    <p className="text-xs font-mono font-semibold" style={{ color: isProfitable ? 'var(--green)' : 'var(--red)' }}>
                      {formatPercentage(holding.pnlPercentage)}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom row: details */}
              <div className="mt-3 pt-3 grid grid-cols-3 gap-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-0.5">Avg Cost</p>
                  <p className="text-xs font-mono font-semibold text-[var(--text-secondary)]">{formatCurrency(holding.avgCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-0.5">Price</p>
                  <p className="text-xs font-mono font-semibold text-[var(--text-secondary)]">{formatCurrency(holding.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-0.5">Weight</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bar-bg)' }}>
                      <div
                        className="h-full rounded-full bar-shimmer"
                        style={{ width: `${Math.min((holding.weight || 0), 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--cyan)' }}>
                      {holding.weight?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
