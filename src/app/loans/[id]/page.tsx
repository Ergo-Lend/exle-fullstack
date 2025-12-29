'use client'

import { use } from 'react'
import { LoanDetails } from '@/components/loan/loan-details'
import { useLoansData } from '@/hooks/useLoansData'

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { allLoans, isLoading, error } = useLoansData()

  const loan = allLoans.find((l) => l.loanId === id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading loan details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-destructive">Error</h1>
        <p className="text-muted-foreground">Failed to load loan: {error}</p>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Loan not found</h1>
        <p className="text-muted-foreground">
          The loan with ID &quot;{id}&quot; could not be found.
        </p>
      </div>
    )
  }

  return <LoanDetails loan={loan} />
}
