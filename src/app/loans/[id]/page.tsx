'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { LoanDetails } from '@/components/loan/loan-details'
import { dummyLoans } from '@/data/dummy-loans'

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const loan = dummyLoans.find((l) => l.loanId === id)

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
