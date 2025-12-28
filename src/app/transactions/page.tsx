'use client'

import { useExleStore } from '@/stores/useExleStore'
import { EmptyLoans } from '@/components/loan/empty-loans'

export default function TransactionsPage() {
  const changeAddress = useExleStore((state) => state.changeAddress)

  return (
    <div className="container mx-auto py-8 px-4 xl:px-0">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Transaction History</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View all your EXLE transactions
        </p>
      </header>

      {!changeAddress ? (
        <EmptyLoans message="Connect your wallet to view your transaction history." />
      ) : (
        <EmptyLoans message="No transactions found." />
      )}
    </div>
  )
}
