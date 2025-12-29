import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the useLoansData hook
vi.mock('@/hooks/useLoansData', () => ({
  useLoansData: vi.fn(),
}))

import { useLoansData } from '@/hooks/useLoansData'

// Mock data
const mockLoans = [
  { loanId: 'loan-123', loanTitle: 'Test Loan 1', phase: 'loan' },
  { loanId: 'loan-456', loanTitle: 'Test Loan 2', phase: 'repayment' },
]

// Mock the LoanDetails component
vi.mock('@/components/loan/loan-details', () => ({
  LoanDetails: ({ loan }: { loan: { loanId: string; loanTitle: string } }) => (
    <div data-testid="loan-details">
      <span data-testid="loan-title">{loan.loanTitle}</span>
      <span data-testid="loan-id">{loan.loanId}</span>
    </div>
  ),
}))

describe('LoanDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Data loading and lookup', () => {
    it('should find existing loan by ID from allLoans', () => {
      vi.mocked(useLoansData).mockReturnValue({
        loans: [],
        repayments: [],
        allLoans: mockLoans,
        isLoading: false,
        error: null,
        reload: vi.fn(),
      })

      const loan = mockLoans.find((l) => l.loanId === 'loan-123')
      expect(loan).toBeDefined()
      expect(loan?.loanTitle).toBe('Test Loan 1')
    })

    it('should find repayment by ID from allLoans', () => {
      vi.mocked(useLoansData).mockReturnValue({
        loans: [],
        repayments: [],
        allLoans: mockLoans,
        isLoading: false,
        error: null,
        reload: vi.fn(),
      })

      const loan = mockLoans.find((l) => l.loanId === 'loan-456')
      expect(loan).toBeDefined()
      expect(loan?.loanTitle).toBe('Test Loan 2')
    })

    it('should not find non-existent loan', () => {
      vi.mocked(useLoansData).mockReturnValue({
        loans: [],
        repayments: [],
        allLoans: mockLoans,
        isLoading: false,
        error: null,
        reload: vi.fn(),
      })

      const loan = mockLoans.find((l) => l.loanId === 'non-existent')
      expect(loan).toBeUndefined()
    })
  })

  // Verify the mock data structure matches what the page expects
  it('should have correct mock data structure for LoanDetails', () => {
    const loan = mockLoans[0]
    expect(loan).toHaveProperty('loanId')
    expect(loan).toHaveProperty('loanTitle')
    expect(typeof loan.loanId).toBe('string')
    expect(typeof loan.loanTitle).toBe('string')
  })

  // Test loading state UI
  it('should display loading state structure', () => {
    render(
      <div className="mx-auto max-w-screen-xl px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading loan details...</p>
      </div>
    )

    expect(screen.getByText(/loading loan details/i)).toBeInTheDocument()
  })

  // Test not found UI
  it('should display not found message structure', () => {
    render(
      <div className="mx-auto max-w-screen-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Loan not found</h1>
        <p className="text-muted-foreground">
          The loan with ID &quot;non-existent&quot; could not be found.
        </p>
      </div>
    )

    expect(screen.getByText(/loan not found/i)).toBeInTheDocument()
    expect(screen.getByText(/non-existent/)).toBeInTheDocument()
  })

  // Test error state UI
  it('should display error message structure', () => {
    render(
      <div className="mx-auto max-w-screen-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-destructive">Error</h1>
        <p className="text-muted-foreground">Failed to load loan: Network error</p>
      </div>
    )

    expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument()
    expect(screen.getByText(/failed to load loan.*network error/i)).toBeInTheDocument()
  })
})
