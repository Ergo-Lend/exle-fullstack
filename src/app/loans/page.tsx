'use client'

import { LoansGrid } from '@/components/loan/loans-grid'
import { dummyLoans } from '@/data/dummy-loans'

export default function LoansPage() {
  return <LoansGrid loans={dummyLoans} phase="loan" />
}
