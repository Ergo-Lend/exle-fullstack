import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyLoansPage from './page'
import { useExleStore } from '@/stores/useExleStore'

// Mock the store
vi.mock('@/stores/useExleStore', () => ({
  useExleStore: vi.fn(),
}))

// Mock the useLoansData hook
vi.mock('@/hooks/useLoansData', () => ({
  useLoansData: vi.fn(),
}))

import { useLoansData } from '@/hooks/useLoansData'

// Mock the components
vi.mock('@/components/loan/loan-widget', () => ({
  LoanWidget: ({ loan }: { loan: { loanId: string; loanTitle: string } }) => (
    <div data-testid={`loan-widget-${loan.loanId}`}>{loan.loanTitle}</div>
  ),
}))

vi.mock('@/components/loan/empty-loans', () => ({
  EmptyLoans: ({ message }: { message: string }) => (
    <div data-testid="empty-loans">{message}</div>
  ),
}))

const TEST_USER_ADDRESS = '9testUserAddress'

const mockLoans = [
  {
    loanId: '1',
    loanTitle: 'Test Loan 1',
    phase: 'loan',
    creator: '9testUserAddress',
  },
  {
    loanId: '2',
    loanTitle: 'Test Loan 2',
    phase: 'loan',
    creator: '9testUserAddress',
  },
  {
    loanId: '3',
    loanTitle: 'Other User Loan',
    phase: 'loan',
    creator: '9otherAddress',
  },
  {
    loanId: '4',
    loanTitle: 'Repayment',
    phase: 'repayment',
    creator: '9testUserAddress',
  },
]

describe('MyLoansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('should show loading spinner', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: TEST_USER_ADDRESS } as any)
      })
      vi.mocked(useLoansData).mockReturnValue({
        loans: [],
        repayments: [],
        allLoans: [],
        isLoading: true,
        error: null,
        reload: vi.fn(),
      })

      render(<MyLoansPage />)

      expect(screen.getByText(/loading your loans/i)).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('should show error message', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: TEST_USER_ADDRESS } as any)
      })
      vi.mocked(useLoansData).mockReturnValue({
        loans: [],
        repayments: [],
        allLoans: [],
        isLoading: false,
        error: 'Network error',
        reload: vi.fn(),
      })

      render(<MyLoansPage />)

      expect(screen.getByText(/failed to load loans.*network error/i)).toBeInTheDocument()
    })
  })

  describe('Wallet not connected', () => {
    it('should show connect wallet message', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: '' } as any)
      })
      vi.mocked(useLoansData).mockReturnValue({
        loans: mockLoans,
        repayments: [],
        allLoans: mockLoans,
        isLoading: false,
        error: null,
        reload: vi.fn(),
      })

      render(<MyLoansPage />)

      expect(screen.getByTestId('empty-loans')).toHaveTextContent(
        'Connect your wallet to view your loans.'
      )
    })
  })

  describe('Wallet connected', () => {
    beforeEach(() => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: TEST_USER_ADDRESS } as any)
      })
      vi.mocked(useLoansData).mockReturnValue({
        loans: mockLoans,
        repayments: [],
        allLoans: mockLoans,
        isLoading: false,
        error: null,
        reload: vi.fn(),
      })
    })

    it('should show page title', () => {
      render(<MyLoansPage />)

      expect(screen.getByRole('heading', { name: /my loans/i })).toBeInTheDocument()
    })

    it('should show correct loan count', () => {
      render(<MyLoansPage />)

      // 2 loans match the creator filter with phase='loan'
      expect(screen.getByText('2 loans created by you')).toBeInTheDocument()
    })

    it('should display user loans', () => {
      render(<MyLoansPage />)

      expect(screen.getByTestId('loan-widget-1')).toBeInTheDocument()
      expect(screen.getByTestId('loan-widget-2')).toBeInTheDocument()
    })

    it('should NOT display other user loans', () => {
      render(<MyLoansPage />)

      expect(screen.queryByTestId('loan-widget-3')).not.toBeInTheDocument()
    })

    it('should NOT display repayments', () => {
      render(<MyLoansPage />)

      expect(screen.queryByTestId('loan-widget-4')).not.toBeInTheDocument()
    })

    it('should have gradient styling on title', () => {
      render(<MyLoansPage />)

      const heading = screen.getByRole('heading', { name: /my loans/i })
      expect(heading).toHaveClass('bg-gradient-to-r')
    })
  })

  describe('No loans found', () => {
    it('should show empty message when no matching loans', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: TEST_USER_ADDRESS } as any)
      })
      vi.mocked(useLoansData).mockReturnValue({
        loans: [],
        repayments: [],
        allLoans: [],
        isLoading: false,
        error: null,
        reload: vi.fn(),
      })

      render(<MyLoansPage />)

      expect(screen.getByTestId('empty-loans')).toHaveTextContent(
        "You haven't created any loans yet."
      )
    })
  })
})
