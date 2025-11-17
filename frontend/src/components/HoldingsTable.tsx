import type { Holding } from '../types';
import { useState } from 'react';

interface Props {
  holdings: Holding[];
}

type SortField = 'symbol' | 'amount' | 'currentValue' | 'pnlPercentage' | 'weight';
type SortDirection = 'asc' | 'desc';

export default function HoldingsTable({ holdings }: Props) {
  const [sortField, setSortField] = useState<SortField>('weight');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
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
    if (value === undefined) return '-';
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

  // Filter out holdings with value less than $1
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
    if (sortField !== field) return <span className="text-gray-300">⇅</span>;
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // Define colors for each crypto
  const CRYPTO_COLORS = [
    { from: 'from-orange-400', to: 'to-orange-600', bg: 'bg-orange-500' },
    { from: 'from-blue-400', to: 'to-blue-600', bg: 'bg-blue-500' },
    { from: 'from-indigo-400', to: 'to-indigo-600', bg: 'bg-indigo-500' },
    { from: 'from-green-400', to: 'to-green-600', bg: 'bg-green-500' },
    { from: 'from-pink-400', to: 'to-pink-600', bg: 'bg-pink-500' },
    { from: 'from-purple-400', to: 'to-purple-600', bg: 'bg-purple-500' },
    { from: 'from-teal-400', to: 'to-teal-600', bg: 'bg-teal-500' },
    { from: 'from-amber-400', to: 'to-amber-600', bg: 'bg-amber-500' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-xl font-bold text-gray-900">Your Holdings</h2>
        <p className="text-sm text-gray-500 mt-1">Tap to view details</p>
      </div>
      <div className="p-4 space-y-3">
        {sortedHoldings.map((holding, index) => {
          const colorScheme = CRYPTO_COLORS[index % CRYPTO_COLORS.length];
          const isProfitable = (holding.pnlPercentage || 0) >= 0;
          const isStablecoin = ['USD', 'USDT', 'USDC', 'DAI', 'TUSD', 'BUSD'].includes(holding.symbol);

          return (
            <div
              key={holding.symbol}
              className="bg-gray-50 rounded-2xl p-4 hover:shadow-lg transition-all hover:bg-white border-2 border-transparent hover:border-gray-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                {/* Left: Icon and Name */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorScheme.from} ${colorScheme.to} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                    {holding.symbol.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{holding.symbol}</h3>
                    <p className="text-sm text-gray-500">
                      {formatNumber(holding.amount, holding.amount < 1 ? 8 : 4)} {holding.symbol}
                    </p>
                  </div>
                </div>

                {/* Right: Value and P&L */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(holding.currentValue)}
                  </div>
                  {!isStablecoin && (
                    <div className={`text-sm font-semibold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      {isProfitable ? '+' : ''}{formatCurrency(holding.pnl)} ({formatPercentage(holding.pnlPercentage)})
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Additional Info */}
              <div className="mt-4 grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Avg Cost</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(holding.avgCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Price</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(holding.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Weight</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`${colorScheme.bg} h-1.5 rounded-full transition-all duration-500`}
                        style={{width: `${Math.min((holding.weight || 0), 100)}%`}}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700">
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
