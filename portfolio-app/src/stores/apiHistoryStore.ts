import { create } from 'zustand'
import type { HistoryEntry } from '../types/history'
import { api } from '../services/api'

interface ApiHistoryStore {
  history: HistoryEntry[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadHistory: () => Promise<void>
  getHistory: () => HistoryEntry[]
  getHistoryByAsset: (asset: string) => Promise<HistoryEntry[]>
}

export const useHistoryStore = create<ApiHistoryStore>((set, get) => ({
  history: [],
  isLoading: false,
  error: null,
  
  loadHistory: async () => {
    set({ isLoading: true, error: null })
    try {
      const historyData = await api.getHistory()
      // Convert API format to our format
      const history: HistoryEntry[] = historyData.map(h => ({
        id: h.id,
        timestamp: h.timestamp,
        action: h.action as any,
        entryId: h.transaction_id,
        asset: h.asset,
        type: h.type,
        destination_asset: h.destination_asset,
        quantity: parseFloat(h.quantity as any) || 0,
        buy_price_usd: parseFloat(h.price_usd as any) || 0,
        buy_date: h.transaction_date,
        notes: h.notes
      }))
      set({ history, isLoading: false })
    } catch (error) {
      console.error('Failed to load history:', error)
      set({ 
        error: 'Failed to load history. Please make sure the backend server is running.', 
        isLoading: false 
      })
    }
  },
  
  getHistory: () => {
    return get().history
  },
  
  getHistoryByAsset: async (asset: string) => {
    try {
      const historyData = await api.getHistoryByAsset(asset)
      return historyData.map(h => ({
        id: h.id,
        timestamp: h.timestamp,
        action: h.action as any,
        entryId: h.transaction_id,
        asset: h.asset,
        type: h.type,
        destination_asset: h.destination_asset,
        quantity: h.quantity,
        buy_price_usd: h.price_usd,
        buy_date: h.transaction_date,
        notes: h.notes
      }))
    } catch (error) {
      console.error('Failed to load asset history:', error)
      return []
    }
  }
}))