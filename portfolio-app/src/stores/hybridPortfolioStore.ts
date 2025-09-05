import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PortfolioEntry } from '../types/portfolio'
import { useHistoryStore } from './historyStore'
import { useDataSourceStore } from './dataSourceStore'
import { api } from '../services/api'

interface HybridPortfolioStore {
  entries: PortfolioEntry[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadEntries: () => Promise<void>
  addEntry: (entry: Omit<PortfolioEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateEntry: (id: string, entry: Partial<PortfolioEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  getEntry: (id: string) => PortfolioEntry | undefined
}

export const useHybridPortfolioStore = create<HybridPortfolioStore>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,
      
      loadEntries: async () => {
        const dataSource = useDataSourceStore.getState().dataSource
        
        if (dataSource === 'database') {
          set({ isLoading: true, error: null })
          try {
            const transactions = await api.getTransactions()
            // Convert API format to our format
            const entries: PortfolioEntry[] = transactions.map(t => ({
              id: t.id,
              asset: t.asset,
              type: t.type,
              quantity: t.quantity,
              buy_price_usd: t.price_usd,
              destination_asset: t.destination_asset,
              buy_date: t.transaction_date,
              notes: t.notes,
              created_at: t.created_at,
              updated_at: t.updated_at
            }))
            set({ entries, isLoading: false })
          } catch (error) {
            console.error('Failed to load from database:', error)
            set({ error: 'Failed to load transactions', isLoading: false })
            // Fall back to local storage
            useDataSourceStore.getState().setDataSource('local')
          }
        }
        // For local storage, entries are already loaded via persist
      },
      
      addEntry: async (entry) => {
        const dataSource = useDataSourceStore.getState().dataSource
        
        if (dataSource === 'database') {
          set({ isLoading: true, error: null })
          try {
            const transaction = await api.createTransaction({
              asset: entry.asset,
              type: entry.type,
              quantity: entry.quantity,
              price_usd: entry.buy_price_usd,
              destination_asset: entry.destination_asset,
              transaction_date: entry.buy_date,
              notes: entry.notes
            })
            
            const newEntry: PortfolioEntry = {
              id: transaction.id,
              asset: transaction.asset,
              type: transaction.type,
              quantity: transaction.quantity,
              buy_price_usd: transaction.price_usd,
              destination_asset: transaction.destination_asset,
              buy_date: transaction.transaction_date,
              notes: transaction.notes,
              created_at: transaction.created_at,
              updated_at: transaction.updated_at
            }
            
            set((state) => ({
              entries: [...state.entries, newEntry],
              isLoading: false
            }))
          } catch (error) {
            console.error('Failed to create transaction:', error)
            set({ error: 'Failed to create transaction', isLoading: false })
            throw error
          }
        } else {
          // Local storage logic (original implementation)
          const newEntry: PortfolioEntry = {
            ...entry,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          // Handle sell transactions with destination
          if (newEntry.type === 'sell' && newEntry.destination_asset) {
            const receiveAmount = newEntry.quantity * newEntry.buy_price_usd
            const destinationEntry: PortfolioEntry = {
              asset: newEntry.destination_asset,
              type: 'buy',
              quantity: receiveAmount,
              buy_price_usd: 1,
              buy_date: newEntry.buy_date,
              notes: `Received from selling ${newEntry.quantity} ${newEntry.asset}`,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            set((state) => ({
              entries: [...state.entries, newEntry, destinationEntry]
            }))
            
            // Track both in history
            useHistoryStore.getState().addHistoryEntry('add', newEntry)
            useHistoryStore.getState().addHistoryEntry('add', destinationEntry)
          } else {
            set((state) => ({
              entries: [...state.entries, newEntry]
            }))
            useHistoryStore.getState().addHistoryEntry('add', newEntry)
          }
        }
      },
      
      updateEntry: async (id, updates) => {
        const dataSource = useDataSourceStore.getState().dataSource
        const currentEntry = get().entries.find(e => e.id === id)
        
        if (!currentEntry) return
        
        if (dataSource === 'database') {
          set({ isLoading: true, error: null })
          try {
            const transaction = await api.updateTransaction(id, {
              asset: updates.asset || currentEntry.asset,
              type: updates.type || currentEntry.type,
              quantity: updates.quantity || currentEntry.quantity,
              price_usd: updates.buy_price_usd || currentEntry.buy_price_usd,
              destination_asset: updates.destination_asset,
              transaction_date: updates.buy_date,
              notes: updates.notes
            })
            
            const updatedEntry: PortfolioEntry = {
              ...currentEntry,
              ...updates,
              updated_at: transaction.updated_at
            }
            
            set((state) => ({
              entries: state.entries.map((entry) =>
                entry.id === id ? updatedEntry : entry
              ),
              isLoading: false
            }))
          } catch (error) {
            console.error('Failed to update transaction:', error)
            set({ error: 'Failed to update transaction', isLoading: false })
            throw error
          }
        } else {
          // Local storage logic
          const updatedEntry = {
            ...currentEntry,
            ...updates,
            updated_at: new Date().toISOString()
          }
          set((state) => ({
            entries: state.entries.map((entry) =>
              entry.id === id ? updatedEntry : entry
            )
          }))
        }
      },
      
      deleteEntry: async (id) => {
        const dataSource = useDataSourceStore.getState().dataSource
        const entryToDelete = get().entries.find(e => e.id === id)
        
        if (!entryToDelete) return
        
        if (dataSource === 'database') {
          set({ isLoading: true, error: null })
          try {
            await api.deleteTransaction(id)
            set((state) => ({
              entries: state.entries.filter((entry) => entry.id !== id),
              isLoading: false
            }))
          } catch (error) {
            console.error('Failed to delete transaction:', error)
            set({ error: 'Failed to delete transaction', isLoading: false })
            throw error
          }
        } else {
          // Local storage logic
          set((state) => ({
            entries: state.entries.filter((entry) => entry.id !== id)
          }))
          useHistoryStore.getState().addHistoryEntry('delete', entryToDelete)
        }
      },
      
      getEntry: (id) => {
        return get().entries.find((entry) => entry.id === id)
      }
    }),
    {
      name: 'portfolio-storage',
      // Only persist when using local storage
      partialize: (state) => 
        useDataSourceStore.getState().dataSource === 'local' 
          ? { entries: state.entries }
          : {}
    }
  )
)