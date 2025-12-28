'use client'

import { useExleStore } from '@/stores/useExleStore'
import { LoanWidget } from '@/components/loan/loan-widget'
import { EmptyLoans } from '@/components/loan/empty-loans'
import { dummyLoans } from '@/data/dummy-loans'

export default function MyRepaymentsPage() {
  const changeAddress = useExleStore((state) => state.changeAddress)

  // Filter repayments by connected wallet
  const userRepayments = changeAddress
    ? dummyLoans.filter(
        (loan) => loan.phase === 'repayment' && loan.creator === changeAddress
      )
    : []

  return (
    <div className="container mx-auto py-8 px-4 xl:px-0">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-indigo-900 dark:from-indigo-500 dark:to-indigo-700 bg-clip-text text-transparent">
          My Repayments
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {userRepayments.length} repayments pending
        </p>
      </header>

      {!changeAddress ? (
        <EmptyLoans message="Connect your wallet to view your repayments." />
      ) : userRepayments.length === 0 ? (
        <EmptyLoans message="You don't have any active repayments." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {userRepayments.map((loan) => (
            <LoanWidget key={loan.loanId} loan={loan} showCreator={false} />
          ))}
        </div>
      )}
    </div>
  )
}
