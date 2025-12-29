'use client'

import { LoansGrid } from '@/components/loan/loans-grid'
import { useLoansData } from '@/hooks/useLoansData'

export default function RepaymentsPage() {
  const { repayments, isLoading, error } = useLoansData()

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

  return <LoansGrid loans={repayments} phase="repayment" />
}
