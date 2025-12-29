'use client'

import { useEffect } from 'react'
import { useExleStore } from '@/stores/useExleStore'

/**
 * Hook to load and access real blockchain loan data.
 * Automatically fetches data on mount if not already loaded.
 */
export function useLoansData() {
  const loans = useExleStore((state) => state.loans)
  const repayments = useExleStore((state) => state.repayments)
  const isLoading = useExleStore((state) => state.isLoading)
  const error = useExleStore((state) => state.error)
  const loadLoansAndRepayments = useExleStore((state) => state.loadLoansAndRepayments)

  useEffect(() => {
    // Load data on mount if not already loaded
    if (loans.length === 0 && repayments.length === 0 && !isLoading) {
      loadLoansAndRepayments()
    }
  }, [loans.length, repayments.length, isLoading, loadLoansAndRepayments])

  return {
    loans,
    repayments,
    allLoans: [...loans, ...repayments],
    isLoading,
    error,
    reload: loadLoansAndRepayments,
  }
}
