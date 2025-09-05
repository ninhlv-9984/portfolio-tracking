import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PortfolioEntry } from '../types/portfolio'
import { useHistoryStore } from './historyStore'

interface PortfolioStore {
  entries: PortfolioEntry[]
  addEntry: (entry: Omit<PortfolioEntry, 'id' | 'created_at' | 'updated_at'>) => void
  updateEntry: (id: string, entry: Partial<PortfolioEntry>) => void
  deleteEntry: (id: string) => void
  getEntry: (id: string) => PortfolioEntry | undefined
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (entry) => {
        const newEntry: PortfolioEntry = {
          ...entry,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        set((state) => ({
          entries: [...state.entries, newEntry]
        }))
        // Track in history
        useHistoryStore.getState().addHistoryEntry('add', newEntry)
      },
      
      updateEntry: (id, updates) => {
        const currentEntry = get().entries.find(e => e.id === id)
        if (currentEntry) {
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
          // Don't track updates in history - we treat each as an individual transaction
        }
      },
      
      deleteEntry: (id) => {
        const entryToDelete = get().entries.find(e => e.id === id)
        if (entryToDelete) {
          set((state) => ({
            entries: state.entries.filter((entry) => entry.id !== id)
          }))
          // Track deletion in history
          useHistoryStore.getState().addHistoryEntry('delete', entryToDelete)
        }
      },
      
      getEntry: (id) => {
        return get().entries.find((entry) => entry.id === id)
      }
    }),
    {
      name: 'portfolio-storage'
    }
  )
)