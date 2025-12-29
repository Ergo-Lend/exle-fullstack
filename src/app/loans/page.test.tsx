import { describe, it, expect, vi, beforeEach } from 'vitest'
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

// Mock the useLoansData hook
vi.mock('@/hooks/useLoansData', () => ({
  useLoansData: vi.fn(),
}))

import { useLoansData } from '@/hooks/useLoansData'

describe('LoansPage', () => {
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

    render(<LoansPage />)

    expect(screen.getByText(/loading loans from blockchain/i)).toBeInTheDocument()
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

    render(<LoansPage />)

    expect(screen.getByText(/failed to load loans.*network error/i)).toBeInTheDocument()
  })

  it('should render LoansGrid component when data loads', () => {
    vi.mocked(useLoansData).mockReturnValue({
      loans: [
        { loanId: '1', phase: 'loan' },
        { loanId: '2', phase: 'loan' },
      ],
      repayments: [],
      allLoans: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })

    render(<LoansPage />)

    expect(screen.getByTestId('loans-grid')).toBeInTheDocument()
  })

  it('should pass loans data to LoansGrid', () => {
    vi.mocked(useLoansData).mockReturnValue({
      loans: [
        { loanId: '1', phase: 'loan' },
        { loanId: '2', phase: 'loan' },
        { loanId: '3', phase: 'loan' },
      ],
      repayments: [],
      allLoans: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })

    render(<LoansPage />)

    const grid = screen.getByTestId('loans-grid')
    expect(grid).toHaveAttribute('data-count', '3')
  })

  it('should pass phase="loan" to LoansGrid', () => {
    vi.mocked(useLoansData).mockReturnValue({
      loans: [],
      repayments: [],
      allLoans: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
    })

    render(<LoansPage />)

    const grid = screen.getByTestId('loans-grid')
    expect(grid).toHaveAttribute('data-phase', 'loan')
  })
})
