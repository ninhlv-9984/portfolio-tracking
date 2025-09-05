import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PortfolioEntry } from '../types/portfolio'

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
      },
      
      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, ...updates, updated_at: new Date().toISOString() }
              : entry
          )
        }))
      },
      
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id)
        }))
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