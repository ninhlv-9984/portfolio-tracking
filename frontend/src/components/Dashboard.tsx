import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '../api/client';
import PortfolioSummary from './PortfolioSummary';
import HoldingsTable from './HoldingsTable';
import AllocationChart from './AllocationChart';
import { useState } from 'react';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioApi.getCurrentPortfolio,
    refetchInterval: 60000, // Refetch every minute
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error loading portfolio</h3>
          <p className="text-red-600 text-sm">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const portfolio = data?.portfolio;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Crypto Portfolio Tracker
                  </h1>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Last updated: {portfolio ? new Date(portfolio.lastUpdated).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50 font-medium flex items-center gap-2"
              >
                <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
                Refresh
              </button>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    Sync from OKX
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {portfolio && (
          <>
            {/* Portfolio Summary */}
            <PortfolioSummary portfolio={portfolio} />

            {/* Charts and Holdings */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Allocation Chart */}
              <div className="xl:col-span-1">
                <AllocationChart holdings={portfolio.holdings} />
              </div>

              {/* Holdings Table */}
              <div className="xl:col-span-2">
                <HoldingsTable holdings={portfolio.holdings} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
