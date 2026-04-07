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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value — Hero card */}
      <div className="glow-card glow-cyan p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">Net Value</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--cyan-dim)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--cyan)' }}>
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold font-mono tracking-tight" style={{ color: 'var(--cyan)' }}>
          {formatCurrency(portfolio.totalValue)}
        </p>
        <p className="text-xs font-mono text-[var(--text-muted)] mt-2">
          {portfolio.holdings.length} assets tracked
        </p>
      </div>

      {/* Total Cost */}
      <div className="glow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">Cost Basis</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-dim)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--gold)' }}>
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
          {formatCurrency(portfolio.totalCost)}
        </p>
        <p className="text-xs font-mono text-[var(--text-muted)] mt-2">
          Weighted average
        </p>
      </div>

      {/* P&L */}
      <div className="glow-card p-6" style={{
        borderColor: isProfitable ? 'var(--green-dim)' : 'var(--red-dim)',
        boxShadow: `0 0 20px ${isProfitable ? 'var(--green-dim)' : 'var(--red-dim)'}`,
      }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">Profit & Loss</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: isProfitable ? 'var(--green-dim)' : 'var(--red-dim)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{
                color: isProfitable ? 'var(--green)' : 'var(--red)',
                transform: isProfitable ? 'none' : 'rotate(180deg)',
              }}
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold font-mono tracking-tight" style={{ color: isProfitable ? 'var(--green)' : 'var(--red)' }}>
          {formatCurrency(portfolio.totalPnl)}
        </p>
        <p className="text-xs font-mono mt-2" style={{ color: isProfitable ? 'var(--green)' : 'var(--red)', opacity: 0.6 }}>
          {isProfitable ? 'Unrealized gain' : 'Unrealized loss'}
        </p>
      </div>

      {/* Return % */}
      <div className="glow-card p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">Return</span>
          <div className="px-2.5 py-1 rounded-md text-xs font-mono font-bold"
            style={{
              background: isProfitable ? 'var(--green-dim)' : 'var(--red-dim)',
              color: isProfitable ? 'var(--green)' : 'var(--red)',
              border: `1px solid ${isProfitable ? 'var(--green-dim)' : 'var(--red-dim)'}`,
            }}
          >
            {isProfitable ? 'GAIN' : 'LOSS'}
          </div>
        </div>
        <p className="text-4xl font-bold font-mono tracking-tight" style={{ color: isProfitable ? 'var(--green)' : 'var(--red)' }}>
          {formatPercentage(portfolio.totalPnlPercentage)}
        </p>
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bar-bg)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(Math.abs(portfolio.totalPnlPercentage), 100)}%`,
              background: isProfitable ? 'var(--green)' : 'var(--red)',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
