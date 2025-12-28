'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { Input } from '@/components/ui/input'
import { SortLoans } from './sort-loans'
import { LoanWidget } from './loan-widget'
import { EmptyLoans } from './empty-loans'
import type { Loan } from '@/types/loan'

interface LoansGridProps {
  loans: Loan[]
  phase: 'loan' | 'repayment'
}

const sortOptions = [
  { value: 'date_asc', label: 'Date added (asc)' },
  { value: 'date_desc', label: 'Date added (desc)' },
  { value: 'funding_asc', label: 'Funding Goal (asc)' },
  { value: 'funding_desc', label: 'Funding Goal (desc)' },
  { value: 'name_asc', label: 'Name (asc)' },
  { value: 'name_desc', label: 'Name (desc)' },
  { value: 'interest_asc', label: 'Interest Rate (asc)' },
  { value: 'interest_desc', label: 'Interest Rate (desc)' },
  { value: 'repaid_asc', label: 'Repaid Percentage (asc)' },
  { value: 'repaid_desc', label: 'Repaid Percentage (desc)' },
]

const fuseOptions = {
  includeScore: true,
  shouldSort: true,
  threshold: 0.4,
  keys: [
    'loanTitle',
    'loanDescription',
    'loanId',
    { name: 'borrowerName', weight: 0.7 },
    { name: 'loanPurpose', weight: 0.5 },
  ],
}

export function LoansGrid({ loans, phase }: LoansGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSort, setSelectedSort] = useState('date_desc')

  const fuse = useMemo(() => new Fuse(loans, fuseOptions), [loans])

  const filteredLoans = useMemo(() => {
    let result: Loan[]

    if (!searchQuery || searchQuery.trim() === '') {
      result = loans.filter((l) => l.phase === phase)
    } else {
      const searchResults = fuse.search(searchQuery)
      result = searchResults
        .map((r) => r.item)
        .filter((loan) => loan.phase === phase)
    }

    // Sort
    const [key, dir] = selectedSort.split('_')
    result.sort((a, b) => {
      const aRecord = a as unknown as Record<string, string | number>
      const bRecord = b as unknown as Record<string, string | number>
      let aVal: string | number = aRecord[key]
      let bVal: string | number = bRecord[key]

      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (aVal < bVal) return dir === 'asc' ? -1 : 1
      if (aVal > bVal) return dir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [loans, searchQuery, selectedSort, phase, fuse])

  const isLoanPhase = phase === 'loan'

  return (
    <div className="container mx-auto py-8 px-4 xl:px-0">
      <header className="mb-8 flex items-center justify-between max-md:flex-col max-md:items-start">
        <div>
          <h1
            className={`text-2xl font-semibold bg-clip-text text-transparent ${
              isLoanPhase
                ? 'bg-gradient-to-r from-green-500 to-blue-900 dark:from-green-400 dark:to-blue-900'
                : 'bg-gradient-to-r from-indigo-500 to-indigo-900 dark:from-indigo-500 dark:to-indigo-700'
            }`}
          >
            {isLoanPhase ? 'Loans on EXLE' : 'Repayments on EXLE'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredLoans.length} {isLoanPhase ? 'Active Loans' : 'Repayments'}
          </p>
        </div>

        <div className="flex items-center gap-4 max-md:mt-4 max-md:flex-col-reverse max-md:items-start">
          <SortLoans
            selectedOption={selectedSort}
            onChange={setSelectedSort}
            options={sortOptions}
          />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in loans name, ID, details..."
            className="w-80"
          />
        </div>
      </header>

      {filteredLoans.length === 0 ? (
        <EmptyLoans />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredLoans.map((loan) => (
            <LoanWidget key={loan.loanId} loan={loan} />
          ))}
        </div>
      )}
    </div>
  )
}
