import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '../api/client';
import PortfolioSummary from './PortfolioSummary';
import HoldingsTable from './HoldingsTable';
import AllocationChart from './AllocationChart';
import { useState, useEffect } from 'react';

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('portfolio-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioApi.getCurrentPortfolio,
    refetchInterval: 60000,
  });

  const syncMutation = useMutation({
    mutationFn: portfolioApi.syncPortfolio,
    onMutate: () => setIsSyncing(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setIsSyncing(false);
    },
    onError: () => setIsSyncing(false),
  });

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--cyan-dim)' }}></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--cyan)' }}></div>
          </div>
          <p className="text-[var(--text-secondary)] font-mono text-sm tracking-wider uppercase">Loading terminal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="glow-card p-8 max-w-md" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <h3 className="font-semibold tracking-wide" style={{ color: 'var(--red)' }}>CONNECTION ERROR</h3>
          </div>
          <p className="text-[var(--text-secondary)] text-sm font-mono mb-6">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="px-5 py-2.5 rounded-lg transition-all font-mono text-sm"
            style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', color: 'var(--red)' }}
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  const portfolio = data?.portfolio;

  return (
    <div className="min-h-screen grid-bg relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Top gradient wash */}
      <div className="fixed top-0 left-0 right-0 h-[400px] pointer-events-none z-0"
        style={{ background: `linear-gradient(to bottom, var(--cyan-glow), transparent)` }}
      ></div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-[var(--border-subtle)]" style={{ background: 'var(--header-bg)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--cyan-dim)', border: '1px solid var(--cyan-dim)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--cyan)' }}>
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  Portfolio <span style={{ color: 'var(--cyan)' }}>Terminal</span>
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="relative w-1.5 h-1.5 rounded-full bg-green-500 pulse-ring"></span>
                  <span className="text-xs font-mono text-[var(--text-muted)] tracking-wider">
                    {portfolio ? new Date(portfolio.lastUpdated).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg transition-all disabled:opacity-40 font-mono text-xs tracking-wider uppercase"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span className={isLoading ? 'animate-spin inline-block' : ''}>↻</span> Refresh
              </button>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-2 rounded-lg transition-all disabled:opacity-40 font-mono text-xs tracking-wider uppercase"
                style={{
                  background: 'var(--cyan-dim)',
                  border: '1px solid var(--cyan-dim)',
                  color: 'var(--cyan)',
                  boxShadow: '0 0 20px var(--cyan-glow)',
                }}
              >
                {isSyncing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block">◌</span> Syncing
                  </span>
                ) : (
                  <span>⚡ Sync OKX</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        {portfolio && (
          <>
            <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <PortfolioSummary portfolio={portfolio} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <AllocationChart holdings={portfolio.holdings} />
              </div>
              <div className="xl:col-span-2 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <HoldingsTable holdings={portfolio.holdings} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
