'use client'

import { LoansGrid } from '@/components/loan/loans-grid'
import { dummyLoans } from '@/data/dummy-loans'

export default function RepaymentsPage() {
  return <LoansGrid loans={dummyLoans} phase="repayment" />
}
