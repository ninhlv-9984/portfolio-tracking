import { create } from 'zustand'
import type { PortfolioEntry } from '../types/portfolio'
import { api } from '../services/api'

interface ApiPortfolioStore {
  entries: PortfolioEntry[]
  isLoading: boolean
  error: string | null

  // Actions
  loadEntries: () => Promise<void>
  addEntry: (entry: Omit<PortfolioEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateEntry: (id: string, entry: Partial<PortfolioEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  getEntry: (id: string) => PortfolioEntry | undefined
  fetchEntry: (id: string) => Promise<PortfolioEntry | null>
}

export const usePortfolioStore = create<ApiPortfolioStore>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,
  
  loadEntries: async () => {
    set({ isLoading: true, error: null })
    try {
      const transactions = await api.getTransactions()
      // Convert API format to our format
      const entries: PortfolioEntry[] = transactions.map(t => ({
        id: t.id,
        asset: t.asset,
        type: t.type,
        quantity: parseFloat(t.quantity as any) || 0,
        buy_price_usd: parseFloat(t.price_usd as any) || 0,
        destination_asset: t.destination_asset,
        source_asset: t.source_asset,
        location: t.location,
        buy_date: t.transaction_date,
        notes: t.notes,
        created_at: t.created_at,
        updated_at: t.updated_at
      }))
      set({ entries, isLoading: false })
    } catch (error) {
      console.error('Failed to load transactions:', error)
      set({ 
        error: 'Failed to load transactions. Please make sure the backend server is running.', 
        isLoading: false 
      })
    }
  },
  
  addEntry: async (entry) => {
    set({ isLoading: true, error: null })
    try {
      const transaction = await api.createTransaction({
        asset: entry.asset,
        type: entry.type,
        quantity: entry.quantity,
        price_usd: entry.buy_price_usd,
        destination_asset: entry.destination_asset,
        source_asset: entry.source_asset,
        location: entry.location,
        transaction_date: entry.buy_date,
        notes: entry.notes
      })
      
      const newEntry: PortfolioEntry = {
        id: transaction.id,
        asset: transaction.asset,
        type: transaction.type,
        quantity: parseFloat(transaction.quantity as any) || 0,
        buy_price_usd: parseFloat(transaction.price_usd as any) || 0,
        destination_asset: transaction.destination_asset,
        source_asset: transaction.source_asset,
        location: transaction.location,
        buy_date: transaction.transaction_date,
        notes: transaction.notes,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at
      }
      
      // If it's a sell with destination, the backend automatically creates the buy transaction
      // We need to reload to get the updated list
      if (entry.type === 'sell' && entry.destination_asset) {
        await get().loadEntries()
      } else {
        set((state) => ({
          entries: [...state.entries, newEntry],
          isLoading: false
        }))
      }
    } catch (error) {
      console.error('Failed to create transaction:', error)
      set({ error: 'Failed to create transaction', isLoading: false })
      throw error
    }
  },
  
  updateEntry: async (id, updates) => {
    const currentEntry = get().entries.find(e => e.id === id)
    if (!currentEntry) return
    
    set({ isLoading: true, error: null })
    try {
      const transaction = await api.updateTransaction(id, {
        asset: updates.asset || currentEntry.asset,
        type: updates.type || currentEntry.type,
        quantity: updates.quantity || currentEntry.quantity,
        price_usd: updates.buy_price_usd || currentEntry.buy_price_usd,
        destination_asset: updates.destination_asset,
        source_asset: updates.source_asset,
        location: updates.location,
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
  },
  
  deleteEntry: async (id) => {
    const entryToDelete = get().entries.find(e => e.id === id)
    if (!entryToDelete) return
    
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
  },
  
  getEntry: (id) => {
    return get().entries.find((entry) => entry.id === id)
  },

  fetchEntry: async (id) => {
    try {
      const transaction = await api.getTransaction(id)
      const entry: PortfolioEntry = {
        id: transaction.id,
        asset: transaction.asset,
        type: transaction.type,
        quantity: parseFloat(transaction.quantity as any) || 0,
        buy_price_usd: parseFloat(transaction.price_usd as any) || 0,
        destination_asset: transaction.destination_asset,
        source_asset: transaction.source_asset,
        location: transaction.location,
        buy_date: transaction.transaction_date,
        notes: transaction.notes,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at
      }
      return entry
    } catch (error) {
      console.error('Failed to fetch transaction:', error)
      return null
    }
  }
}))