import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HistoryEntry, HistoryActionType } from '../types/history'
import type { PortfolioEntry } from '../types/portfolio'

interface HistoryStore {
  history: HistoryEntry[]
  hasMigrated: boolean
  addHistoryEntry: (
    action: HistoryActionType, 
    entry: PortfolioEntry, 
    previousValue?: Partial<PortfolioEntry>
  ) => void
  getHistory: () => HistoryEntry[]
  getHistoryByAsset: (asset: string) => HistoryEntry[]
  getHistoryByEntry: (entryId: string) => HistoryEntry[]
  clearHistory: () => void
  migrateExistingEntries: (entries: PortfolioEntry[]) => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      hasMigrated: false,
      
      addHistoryEntry: (action, entry, previousValue) => {
        const historyEntry: HistoryEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action,
          entryId: entry.id,
          asset: entry.asset,
          quantity: entry.quantity,
          buy_price_usd: entry.buy_price_usd,
          buy_date: entry.buy_date,
          notes: entry.notes,
          previousValue: previousValue ? {
            quantity: previousValue.quantity,
            buy_price_usd: previousValue.buy_price_usd,
            buy_date: previousValue.buy_date,
            notes: previousValue.notes
          } : undefined
        }
        
        set((state) => ({
          history: [historyEntry, ...state.history] // Newest first
        }))
      },
      
      getHistory: () => {
        return get().history
      },
      
      getHistoryByAsset: (asset) => {
        return get().history.filter(h => h.asset === asset)
      },
      
      getHistoryByEntry: (entryId) => {
        return get().history.filter(h => h.entryId === entryId)
      },
      
      clearHistory: () => {
        set({ history: [] })
      },
      
      migrateExistingEntries: (entries) => {
        const state = get()
        if (state.hasMigrated) return // Already migrated
        
        // Create history entries for existing positions
        const migrationEntries: HistoryEntry[] = entries.map(entry => ({
          id: `migration-${entry.id}`,
          timestamp: entry.created_at || new Date().toISOString(),
          action: 'add' as HistoryActionType,
          entryId: entry.id,
          asset: entry.asset,
          quantity: entry.quantity,
          buy_price_usd: entry.buy_price_usd,
          buy_date: entry.buy_date,
          notes: entry.notes
        }))
        
        // Add migration entries to history (oldest first)
        set({
          history: [...state.history, ...migrationEntries.reverse()],
          hasMigrated: true
        })
      }
    }),
    {
      name: 'portfolio-history-storage'
    }
  )
)