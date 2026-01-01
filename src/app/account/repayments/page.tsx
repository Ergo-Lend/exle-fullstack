'use client'

import { useExleStore } from '@/stores/useExleStore'
import { LoanWidget } from '@/components/loan/loan-widget'
import { EmptyLoans } from '@/components/loan/empty-loans'
import { useLoansData } from '@/hooks/useLoansData'

export default function MyRepaymentsPage() {
  const changeAddress = useExleStore((state) => state.changeAddress)
  const { repayments, isLoading, error } = useLoansData()

  // Filter repayments by connected wallet
  const userRepayments = changeAddress
    ? repayments.filter(
        (loan) => loan.phase === 'repayment' && loan.creator === changeAddress
      )
    : []

  // Split into active (not repaid, has days left) and history (repaid or expired)
  const activeRepayments = userRepayments.filter(
    (loan) => !loan.isRepayed && loan.daysLeft > 0
  )
  const repaymentHistory = userRepayments.filter(
    (loan) => loan.isRepayed || loan.daysLeft <= 0
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 xl:px-0">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-indigo-900 dark:from-indigo-500 dark:to-indigo-700 bg-clip-text text-transparent">
            My Repayments
          </h1>
        </header>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your repayments...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 xl:px-0">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-indigo-900 dark:from-indigo-500 dark:to-indigo-700 bg-clip-text text-transparent">
            My Repayments
          </h1>
        </header>
        <div className="text-center text-destructive">
          <p>Failed to load repayments: {error}</p>
        </div>
      </div>
    )
  }

  if (!changeAddress) {
    return (
      <div className="container mx-auto py-8 px-4 xl:px-0">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-indigo-900 dark:from-indigo-500 dark:to-indigo-700 bg-clip-text text-transparent">
            My Repayments
          </h1>
        </header>
        <EmptyLoans message="Connect your wallet to view your repayments." />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 xl:px-0">
      {/* Active Repayments Section */}
      <section className="mb-12">
        <header className="mb-6">
          <h2 className="text-xl font-semibold">
            Active repayments{' '}
            <span className="font-normal text-muted-foreground">
              ({activeRepayments.length} repayments)
            </span>
          </h2>
        </header>

        {activeRepayments.length === 0 ? (
          <p className="text-muted-foreground">No active repayments.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {activeRepayments.map((loan) => (
              <LoanWidget key={loan.loanId} loan={loan} showCreator={false} />
            ))}
          </div>
        )}
      </section>

      {/* Repayment History Section */}
      <section>
        <header className="mb-6">
          <h2 className="text-xl font-semibold">
            Repayment history{' '}
            <span className="font-normal text-muted-foreground">
              ({repaymentHistory.length} repayments)
            </span>
          </h2>
        </header>

        {repaymentHistory.length === 0 ? (
          <p className="text-muted-foreground">No repayment history yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {repaymentHistory.map((loan) => (
              <LoanWidget key={loan.loanId} loan={loan} showCreator={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
