import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DataSource = 'local' | 'database'

interface DataSourceStore {
  dataSource: DataSource
  isConnected: boolean
  setDataSource: (source: DataSource) => void
  setConnectionStatus: (status: boolean) => void
}

export const useDataSourceStore = create<DataSourceStore>()(
  persist(
    (set) => ({
      dataSource: 'local',
      isConnected: false,
      setDataSource: (source) => set({ dataSource: source }),
      setConnectionStatus: (status) => set({ isConnected: status }),
    }),
    {
      name: 'data-source-storage'
    }
  )
)