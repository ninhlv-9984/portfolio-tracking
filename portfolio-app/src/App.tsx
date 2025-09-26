import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Plus, RefreshCw, Wallet, History } from 'lucide-react'
import { Button } from './components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { PortfolioTable } from './components/PortfolioTable'
import { AddEditModal } from './components/AddEditModal'
import { TotalsBar } from './components/TotalsBar'
import { ThemeToggle } from './components/ThemeToggle'
import { EmptyState } from './components/EmptyState'
import { PriceSourceSettings } from './components/PriceSourceSettings'
import { AssetAllocation } from './components/AssetAllocation'
import { AllocationBreakdown } from './components/AllocationBreakdown'
import { PositionHistory } from './components/PositionHistory'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthPage } from './pages/Auth'
import { usePortfolio } from './hooks/usePortfolio'
import { useAuthStore } from './stores/authStore'
import { authApi } from './lib/auth'
import type { PortfolioEntry } from './types/portfolio'
import { LogOut, User } from 'lucide-react'

const queryClient = new QueryClient()

function PortfolioApp() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PortfolioEntry | undefined>()
  const { positions, metrics, isLoading, refetch } = usePortfolio()
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toISOString())
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleAdd = () => {
    setEditingEntry(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (entry: any) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleRefresh = () => {
    refetch()
    setLastRefresh(new Date().toISOString())
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingEntry(undefined)
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/auth'
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
              <p className="text-sm text-muted-foreground">
                Track your crypto investments in real-time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <PriceSourceSettings />
              <ThemeToggle />
              {positions.length > 0 && (
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              )}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {user?.username || user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {positions.length === 0 ? (
              <EmptyState onAddClick={handleAdd} />
            ) : (
              <>
                <TotalsBar
                  metrics={metrics}
                  lastUpdated={lastRefresh}
                  onRefresh={handleRefresh}
                />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <AssetAllocation positions={positions} />
                  <AllocationBreakdown positions={positions} />
                </div>
                <PortfolioTable
                  positions={positions}
                  onEdit={handleEdit}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="history">
            <PositionHistory onEdit={handleEdit} />
          </TabsContent>
        </Tabs>
      </main>

      <AddEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        entry={editingEntry}
      />
    </div>
  )
}

function App() {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    // Verify token on app load
    if (token) {
      authApi.verify(token).then((response) => {
        setUser(response.user);
      }).catch(() => {
        // Token is invalid, logout
        useAuthStore.getState().logout();
      });
    }
  }, [token]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PortfolioApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
