import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyRepaymentsPage from './page'
import { useExleStore } from '@/stores/useExleStore'

// Mock the store
vi.mock('@/stores/useExleStore', () => ({
  useExleStore: vi.fn(),
}))

// Mock the components
vi.mock('@/components/loan/loan-widget', () => ({
  LoanWidget: ({ loan }: { loan: { loanId: string; title: string } }) => (
    <div data-testid={`loan-widget-${loan.loanId}`}>{loan.title}</div>
  ),
}))

vi.mock('@/components/loan/empty-loans', () => ({
  EmptyLoans: ({ message }: { message: string }) => (
    <div data-testid="empty-loans">{message}</div>
  ),
}))

const TEST_USER_ADDRESS = '9testUserAddress'

// Mock dummy loans
vi.mock('@/data/dummy-loans', () => ({
  dummyLoans: [
    {
      loanId: '1',
      title: 'Repayment 1',
      phase: 'repayment',
      creator: '9testUserAddress',
    },
    {
      loanId: '2',
      title: 'Repayment 2',
      phase: 'repayment',
      creator: '9testUserAddress',
    },
    {
      loanId: '3',
      title: 'Other User Repayment',
      phase: 'repayment',
      creator: '9otherAddress',
    },
    {
      loanId: '4',
      title: 'Loan (not repayment)',
      phase: 'loan',
      creator: '9testUserAddress',
    },
  ],
}))

describe('MyRepaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Wallet not connected', () => {
    it('should show connect wallet message', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: '' } as any)
      })

      render(<MyRepaymentsPage />)

      expect(screen.getByTestId('empty-loans')).toHaveTextContent(
        'Connect your wallet to view your repayments.'
      )
    })
  })

  describe('Wallet connected', () => {
    beforeEach(() => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: TEST_USER_ADDRESS } as any)
      })
    })

    it('should show page title', () => {
      render(<MyRepaymentsPage />)

      expect(screen.getByRole('heading', { name: /my repayments/i })).toBeInTheDocument()
    })

    it('should show correct repayment count', () => {
      render(<MyRepaymentsPage />)

      // 2 repayments match the creator filter with phase='repayment'
      expect(screen.getByText('2 repayments pending')).toBeInTheDocument()
    })

    it('should display user repayments', () => {
      render(<MyRepaymentsPage />)

      expect(screen.getByTestId('loan-widget-1')).toBeInTheDocument()
      expect(screen.getByTestId('loan-widget-2')).toBeInTheDocument()
    })

    it('should NOT display other user repayments', () => {
      render(<MyRepaymentsPage />)

      expect(screen.queryByTestId('loan-widget-3')).not.toBeInTheDocument()
    })

    it('should NOT display loans (only repayments)', () => {
      render(<MyRepaymentsPage />)

      expect(screen.queryByTestId('loan-widget-4')).not.toBeInTheDocument()
    })

    it('should have gradient styling on title', () => {
      render(<MyRepaymentsPage />)

      const heading = screen.getByRole('heading', { name: /my repayments/i })
      expect(heading).toHaveClass('bg-gradient-to-r')
    })
  })
})
