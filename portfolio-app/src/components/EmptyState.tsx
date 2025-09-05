import { Plus, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'

interface EmptyStateProps {
  onAddClick: () => void
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="bg-muted rounded-full p-4 mb-4">
        <TrendingUp className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Start Tracking Your Portfolio</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Add your first crypto transaction to begin tracking your portfolio performance
        with real-time prices and P/L calculations.
      </p>
      <Button onClick={onAddClick} size="lg">
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Transaction
      </Button>
    </div>
  )
}