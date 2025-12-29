import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import RepaymentsPage from './page'

// Mock the LoansGrid component
vi.mock('@/components/loan/loans-grid', () => ({
  LoansGrid: ({ loans, phase }: { loans: unknown[]; phase: string }) => (
    <div data-testid="loans-grid" data-phase={phase} data-count={loans.length}>
      Loans Grid - Phase: {phase}
    </div>
  ),
}))

// Mock the useLoansData hook
vi.mock('@/hooks/useLoansData', () => ({
  useLoansData: vi.fn(),
}))

import { useLoansData } from '@/hooks/useLoansData'

describe('RepaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    vi.mocked(useLoansData).mockReturnValue({
      loans: [],
      repayments: [],
      allLoans: [],
      isLoading: true,
      error: null,
      reload: vi.fn(),
    })

    render(<RepaymentsPage />)

    expect(screen.getByText(/loading repayments from blockchain/i)).toBeInTheDocument()
  })

  it('should show error state', () => {
    vi.mocked(useLoansData).mockReturnValue({
      loans: [],
      repayments: [],
      allLoans: [],
      isLoading: false,
      error: 'Network error',
      reload: vi.fn(),
    })

    render(<RepaymentsPage />)

    expect(screen.getByText(/failed to load repayments.*network error/i)).toBeInTheDocument()
  })

  it('should render LoansGrid component when data loads', () => {
    vi.mocked(useLoansData).mockReturnValue({
      loans: [],
      repayments: [
        { loanId: '1', phase: 'repayment' },
        { loanId: '2', phase: 'repayment' },
      ],
      allLoans: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })

    render(<RepaymentsPage />)

    expect(screen.getByTestId('loans-grid')).toBeInTheDocument()
  })

  it('should pass repayments data to LoansGrid', () => {
    vi.mocked(useLoansData).mockReturnValue({
      loans: [],
      repayments: [
        { loanId: '1', phase: 'repayment' },
        { loanId: '2', phase: 'repayment' },
        { loanId: '3', phase: 'repayment' },
      ],
      allLoans: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })

    render(<RepaymentsPage />)

    const grid = screen.getByTestId('loans-grid')
    expect(grid).toHaveAttribute('data-count', '3')
  })

  it('should pass phase="repayment" to LoansGrid', () => {
    vi.mocked(useLoansData).mockReturnValue({
      loans: [],
      repayments: [],
      allLoans: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })

    render(<RepaymentsPage />)

    const grid = screen.getByTestId('loans-grid')
    expect(grid).toHaveAttribute('data-phase', 'repayment')
  })
})
