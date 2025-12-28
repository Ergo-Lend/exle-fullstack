import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoansPage from './page'

// Mock the LoansGrid component
vi.mock('@/components/loan/loans-grid', () => ({
  LoansGrid: ({ loans, phase }: { loans: unknown[]; phase: string }) => (
    <div data-testid="loans-grid" data-phase={phase} data-count={loans.length}>
      Loans Grid - Phase: {phase}
    </div>
  ),
}))

// Mock dummy loans
vi.mock('@/data/dummy-loans', () => ({
  dummyLoans: [
    { loanId: '1', phase: 'loan' },
    { loanId: '2', phase: 'loan' },
    { loanId: '3', phase: 'repayment' },
  ],
}))

describe('LoansPage', () => {
  it('should render LoansGrid component', () => {
    render(<LoansPage />)

    expect(screen.getByTestId('loans-grid')).toBeInTheDocument()
  })

  it('should pass loans data to LoansGrid', () => {
    render(<LoansPage />)

    const grid = screen.getByTestId('loans-grid')
    expect(grid).toHaveAttribute('data-count', '3')
  })

  it('should pass phase="loan" to LoansGrid', () => {
    render(<LoansPage />)

    const grid = screen.getByTestId('loans-grid')
    expect(grid).toHaveAttribute('data-phase', 'loan')
  })
})
