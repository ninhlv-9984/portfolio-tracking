import type { Portfolio } from '../types';

interface Props {
  portfolio: Portfolio;
}

export default function PortfolioSummary({ portfolio }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const isProfitable = portfolio.totalPnl >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Value - Highlighted */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-2xl p-6 text-white transition-all hover:-translate-y-1 cursor-pointer">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-100">Total Portfolio Value</p>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-3xl font-bold mt-2">
            {formatCurrency(portfolio.totalValue)}
          </p>
          <p className="text-sm text-blue-100 mt-2">
            {portfolio.holdings.length} assets
          </p>
        </div>
      </div>

      {/* Total Cost */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl p-6 border-2 border-gray-100 hover:border-gray-300 transition-all hover:-translate-y-1 cursor-pointer">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600">Total Cost Basis</p>
            <span className="text-3xl">💵</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(portfolio.totalCost)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Average buy price
          </p>
        </div>
      </div>

      {/* Total P&L */}
      <div className={`rounded-xl shadow-lg hover:shadow-2xl p-6 ${isProfitable ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white transition-all hover:-translate-y-1 cursor-pointer`}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white/90">Profit & Loss</p>
            <span className="text-3xl">{isProfitable ? '📈' : '📉'}</span>
          </div>
          <p className="text-3xl font-bold mt-2">
            {formatCurrency(portfolio.totalPnl)}
          </p>
          <p className="text-sm text-white/90 mt-2">
            {isProfitable ? 'In profit' : 'Unrealized loss'}
          </p>
        </div>
      </div>

      {/* P&L Percentage */}
      <div className={`rounded-xl shadow-lg hover:shadow-2xl p-6 border-2 ${isProfitable ? 'border-green-200 bg-green-50 hover:border-green-300' : 'border-red-200 bg-red-50 hover:border-red-300'} transition-all hover:-translate-y-1 cursor-pointer`}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>Return</p>
            <span className="text-3xl">{isProfitable ? '✅' : '⚠️'}</span>
          </div>
          <p className={`text-3xl font-bold mt-2 ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(portfolio.totalPnlPercentage)}
          </p>
          <p className={`text-sm mt-2 ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            Overall performance
          </p>
        </div>
      </div>
    </div>
  );
}
