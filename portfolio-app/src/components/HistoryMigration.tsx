import { useEffect } from 'react'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useHistoryStore } from '@/stores/historyStore'

export function HistoryMigration() {
  const entries = usePortfolioStore((state) => state.entries)
  const { hasMigrated, migrateExistingEntries } = useHistoryStore()
  
  useEffect(() => {
    // Run migration if not already done
    if (!hasMigrated && entries.length > 0) {
      console.log('Migrating existing entries to history...')
      migrateExistingEntries(entries)
    }
  }, [hasMigrated, entries, migrateExistingEntries])
  
  return null
}