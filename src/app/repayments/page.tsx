'use client'

import { LoanWidget } from '@/components/loan/loan-widget'
import { useLoansData } from '@/hooks/useLoansData'

export default function RepaymentsPage() {
  const { repayments, isLoading, error } = useLoansData()

  // Split into active (not repaid, has days left) and history (repaid or expired)
  const activeRepayments = repayments.filter(
    (loan) => !loan.isRepayed && loan.daysLeft > 0
  )
  const repaymentHistory = repayments.filter(
    (loan) => loan.isRepayed || loan.daysLeft <= 0
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 xl:px-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading repayments from blockchain...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 xl:px-0">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-destructive">
            <p>Failed to load repayments: {error}</p>
          </div>
        </div>
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
              <LoanWidget key={loan.loanId} loan={loan} />
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
              <LoanWidget key={loan.loanId} loan={loan} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
