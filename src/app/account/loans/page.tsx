'use client'

import { useExleStore } from '@/stores/useExleStore'
import { LoanWidget } from '@/components/loan/loan-widget'
import { EmptyLoans } from '@/components/loan/empty-loans'
import { useLoansData } from '@/hooks/useLoansData'

export default function MyLoansPage() {
  const changeAddress = useExleStore((state) => state.changeAddress)
  const { loans, isLoading, error } = useLoansData()

  // Filter loans by connected wallet
  const userLoans = changeAddress
    ? loans.filter(
        (loan) => loan.phase === 'loan' && loan.creator === changeAddress
      )
    : []

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 xl:px-0">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-green-500 to-blue-900 dark:from-green-400 dark:to-blue-900 bg-clip-text text-transparent">
            My Loans
          </h1>
        </header>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your loans...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 xl:px-0">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-green-500 to-blue-900 dark:from-green-400 dark:to-blue-900 bg-clip-text text-transparent">
            My Loans
          </h1>
        </header>
        <div className="text-center text-destructive">
          <p>Failed to load loans: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 xl:px-0">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-green-500 to-blue-900 dark:from-green-400 dark:to-blue-900 bg-clip-text text-transparent">
          My Loans
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {userLoans.length} loans created by you
        </p>
      </header>

      {!changeAddress ? (
        <EmptyLoans message="Connect your wallet to view your loans." />
      ) : userLoans.length === 0 ? (
        <EmptyLoans message="You haven't created any loans yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {userLoans.map((loan) => (
            <LoanWidget key={loan.loanId} loan={loan} showCreator={false} />
          ))}
        </div>
      )}
    </div>
  )
}
