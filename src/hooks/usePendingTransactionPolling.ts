'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useExleStore, type PendingTx } from '@/stores/useExleStore'
import type { TransactionStatus } from '@/lib/exle/exle'

const POLL_INTERVAL_MS = 30_000 // 30 seconds
const MAX_AGE_MS = 60 * 60 * 1000 // 1 hour - auto-cleanup old pending txs

/**
 * Invalidate the Next.js fetch cache for the given transaction type
 */
async function revalidateCache(txType: PendingTx['type']): Promise<void> {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txType }),
    })
  } catch (error) {
    console.error('Failed to revalidate cache:', error)
  }
}

/**
 * Hook that polls for pending transaction status updates.
 * When a transaction is confirmed, it removes it from pending and triggers a data refresh.
 * @param onConfirmed - Optional callback when a transaction is confirmed
 */
export function usePendingTransactionPolling(onConfirmed?: (txId: string, loanId: string) => void) {
  const pendingTransactions = useExleStore((state) => state.pendingTransactions) ?? []
  const removePendingTransaction = useExleStore((state) => state.removePendingTransaction)
  const loadLoansAndRepayments = useExleStore((state) => state.loadLoansAndRepayments)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkTransactionStatus = useCallback(async (txId: string): Promise<TransactionStatus> => {
    try {
      const response = await fetch('/api/transactions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId }),
      })

      if (!response.ok) {
        return 'not_found'
      }

      const data = await response.json()
      return data.status as TransactionStatus
    } catch {
      return 'not_found'
    }
  }, [])

  const pollPendingTransactions = useCallback(async () => {
    if (pendingTransactions.length === 0) return

    const now = Date.now()
    const confirmedTypes = new Set<PendingTx['type']>()

    for (const tx of pendingTransactions) {
      // Auto-cleanup old transactions (older than 1 hour)
      if (now - tx.timestamp > MAX_AGE_MS) {
        removePendingTransaction(tx.txId)
        continue
      }

      const status = await checkTransactionStatus(tx.txId)

      if (status === 'confirmed') {
        removePendingTransaction(tx.txId)
        confirmedTypes.add(tx.type)
        onConfirmed?.(tx.txId, tx.loanId)
      } else if (status === 'not_found') {
        // Transaction might have been dropped from mempool or failed
        // Keep it for a bit longer in case it's still propagating
        // Only remove if it's been pending for more than 10 minutes with not_found
        if (now - tx.timestamp > 10 * 60 * 1000) {
          removePendingTransaction(tx.txId)
        }
      }
      // 'pending' status means tx is still in mempool, keep tracking
    }

    // If any transactions were confirmed, invalidate cache and refresh data
    if (confirmedTypes.size > 0) {
      // Revalidate cache for each confirmed transaction type
      await Promise.all(
        Array.from(confirmedTypes).map((txType) => revalidateCache(txType))
      )
      // Then refresh the loan data
      loadLoansAndRepayments()
    }
  }, [pendingTransactions, removePendingTransaction, loadLoansAndRepayments, checkTransactionStatus, onConfirmed])

  useEffect(() => {
    // Start polling if there are pending transactions
    if (pendingTransactions.length > 0) {
      // Poll immediately on mount/change
      pollPendingTransactions()

      // Then poll at interval
      intervalRef.current = setInterval(pollPendingTransactions, POLL_INTERVAL_MS)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [pendingTransactions.length, pollPendingTransactions])

  return {
    pendingTransactions,
    hasPendingTransactions: pendingTransactions.length > 0,
  }
}
