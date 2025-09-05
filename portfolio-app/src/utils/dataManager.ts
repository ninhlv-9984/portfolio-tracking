import { usePortfolioStore } from '@/stores/portfolioStore'
import { useHistoryStore } from '@/stores/historyStore'

export interface BackupData {
  version: string
  timestamp: string
  portfolio: {
    entries: any[]
  }
  history: {
    entries: any[]
    hasMigrated: boolean
  }
}

export const dataManager = {
  // Export all data as JSON
  exportData: (): BackupData => {
    const portfolioState = usePortfolioStore.getState()
    const historyState = useHistoryStore.getState()
    
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      portfolio: {
        entries: portfolioState.entries
      },
      history: {
        entries: historyState.history,
        hasMigrated: historyState.hasMigrated
      }
    }
  },

  // Download data as JSON file
  downloadBackup: () => {
    const data = dataManager.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  // Import data from JSON
  importData: (data: BackupData): boolean => {
    try {
      // Validate data structure
      if (!data.version || !data.portfolio || !data.history) {
        throw new Error('Invalid backup file format')
      }

      // Clear existing data
      localStorage.removeItem('portfolio-storage')
      localStorage.removeItem('portfolio-history-storage')

      // Import portfolio entries
      const portfolioState = {
        state: {
          entries: data.portfolio.entries || []
        },
        version: 0
      }
      localStorage.setItem('portfolio-storage', JSON.stringify(portfolioState))

      // Import history
      const historyState = {
        state: {
          history: data.history.entries || [],
          hasMigrated: data.history.hasMigrated || false
        },
        version: 0
      }
      localStorage.setItem('portfolio-history-storage', JSON.stringify(historyState))

      // Reload the page to apply changes
      window.location.reload()
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  },

  // Upload and import JSON file
  uploadBackup: (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          const success = dataManager.importData(data)
          resolve(success)
        } catch (error) {
          console.error('Failed to parse backup file:', error)
          resolve(false)
        }
      }
      reader.readAsText(file)
    })
  },

  // Clear all data
  clearAllData: () => {
    if (window.confirm('Are you sure you want to delete all data? This cannot be undone!')) {
      localStorage.removeItem('portfolio-storage')
      localStorage.removeItem('portfolio-history-storage')
      window.location.reload()
    }
  },

  // Get data size info
  getStorageInfo: () => {
    const portfolioData = localStorage.getItem('portfolio-storage') || '{}'
    const historyData = localStorage.getItem('portfolio-history-storage') || '{}'
    
    const totalSize = portfolioData.length + historyData.length
    const portfolioEntries = JSON.parse(portfolioData)?.state?.entries?.length || 0
    const historyEntries = JSON.parse(historyData)?.state?.history?.length || 0
    
    return {
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      portfolioEntries,
      historyEntries,
      storageUsed: `${((totalSize / 5242880) * 100).toFixed(2)}%` // 5MB localStorage limit
    }
  }
}