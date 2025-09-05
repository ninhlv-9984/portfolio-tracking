import { useState } from 'react'
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
import { HistoryMigration } from './components/HistoryMigration'
import { usePortfolio } from './hooks/usePortfolio'
import type { PortfolioEntry } from './types/portfolio'

const queryClient = new QueryClient()

function PortfolioApp() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PortfolioEntry | undefined>()
  const { positions, metrics, isLoading, refetch } = usePortfolio()
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toISOString())

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

  return (
    <div className="min-h-screen bg-background">
      <HistoryMigration />
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
  return (
    <QueryClientProvider client={queryClient}>
      <PortfolioApp />
    </QueryClientProvider>
  )
}

export default App
