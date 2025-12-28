import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoanDetails } from './loan-details'
import { useExleStore } from '@/stores/useExleStore'
import {
  mockLoanUnfunded,
  mockLoanFunded,
  mockLoanRepayment,
  mockLoanFullyRepaid,
  MOCK_USER_ADDRESS,
  MOCK_BORROWER_ADDRESS,
  setupWindowMocks,
  cleanupWindowMocks,
  createMockLoan,
} from '@/lib/exle/__mocks__/mockdata'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}))

// Mock the store
vi.mock('@/stores/useExleStore', () => ({
  useExleStore: vi.fn(),
}))

// Mock tokenByTicker
vi.mock('@/lib/exle/exle', () => ({
  tokenByTicker: vi.fn((ticker) => {
    if (ticker === 'SigUSD') {
      return {
        tokenId: '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04',
        decimals: 2,
        name: 'SigmaUSD',
        ticker: 'SigUSD',
      }
    }
    return undefined
  }),
}))

describe('LoanDetails', () => {
  const mockFundLoanSolo = vi.fn()
  const mockFundCrowdfund = vi.fn()
  const mockRepayLoan = vi.fn()
  const mockWithdrawLoanAsBorrower = vi.fn()
  const mockWithdrawFromRepaymentAsLender = vi.fn()
  const mockWithdrawFromCrowdfundAsLender = vi.fn()
  const mockLoadLoansAndRepayments = vi.fn()

  beforeEach(() => {
    vi.mocked(useExleStore).mockImplementation((selector) => {
      const state = {
        changeAddress: MOCK_USER_ADDRESS,
        fundLoanSolo: mockFundLoanSolo,
        fundCrowdfund: mockFundCrowdfund,
        repayLoan: mockRepayLoan,
        withdrawLoanAsBorrower: mockWithdrawLoanAsBorrower,
        withdrawFromRepaymentAsLender: mockWithdrawFromRepaymentAsLender,
        withdrawFromCrowdfundAsLender: mockWithdrawFromCrowdfundAsLender,
        loadLoansAndRepayments: mockLoadLoansAndRepayments,
      }
      return selector(state as any)
    })

    setupWindowMocks()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanupWindowMocks()
  })

  describe('Solofund Loan - Display', () => {
    it('should display loan details correctly', () => {
      render(<LoanDetails loan={mockLoanUnfunded} />)

      expect(screen.getByText('My Loan')).toBeInTheDocument()
      expect(screen.getByText(/This is a test description/)).toBeInTheDocument()
      expect(screen.getByText('Solofund')).toBeInTheDocument()
      expect(screen.getByText('100.00 SigUSD')).toBeInTheDocument()
    })

    it('should show funding goal for loan phase', () => {
      render(<LoanDetails loan={mockLoanUnfunded} />)

      expect(screen.getByText('Funding Goal:')).toBeInTheDocument()
    })

    it('should show total repayment for repayment phase', () => {
      render(<LoanDetails loan={mockLoanRepayment} />)

      expect(screen.getByText('Total Repayment:')).toBeInTheDocument()
    })

    it('should show days left', () => {
      render(<LoanDetails loan={mockLoanUnfunded} />)

      expect(screen.getByText(/Days Left/)).toBeInTheDocument()
    })
  })

  describe('Solofund Loan - Funding', () => {
    it('should show readonly funding amount for Solofund', () => {
      render(<LoanDetails loan={mockLoanUnfunded} />)

      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('readonly')
      expect(input).toHaveValue(100) // 100.00 parsed as number
    })

    it('should enable Fund button for unfunded Solofund', () => {
      render(<LoanDetails loan={mockLoanUnfunded} />)

      const fundButton = screen.getByRole('button', { name: /fund the loan/i })
      expect(fundButton).not.toBeDisabled()
    })

    it('should call fundLoanSolo when funding Solofund', async () => {
      mockFundLoanSolo.mockResolvedValue('tx123')
      const user = userEvent.setup()
      render(<LoanDetails loan={mockLoanUnfunded} />)

      await user.click(screen.getByRole('button', { name: /fund the loan/i }))

      await waitFor(() => {
        expect(mockFundLoanSolo).toHaveBeenCalledWith(mockLoanUnfunded.loanId)
      })
    })

    it('should show success message after funding', async () => {
      mockFundLoanSolo.mockResolvedValue('tx123')
      const user = userEvent.setup()
      render(<LoanDetails loan={mockLoanUnfunded} />)

      await user.click(screen.getByRole('button', { name: /fund the loan/i }))

      await waitFor(() => {
        expect(screen.getByText(/transaction successful/i)).toBeInTheDocument()
      })
    })
  })

  describe('Solofund Loan - Funded Badge', () => {
    it('should show Funded badge when fully funded', () => {
      render(<LoanDetails loan={mockLoanFunded} />)

      expect(screen.getByText('Funded')).toBeInTheDocument()
    })

    it('should show "Loan Fully Funded" message', () => {
      const fundedLoan = createMockLoan({
        ...mockLoanFunded,
        fundedPercentage: 100,
        isReadyForWithdrawal: false,
      })
      render(<LoanDetails loan={fundedLoan} />)

      expect(screen.getByText('Loan Fully Funded')).toBeInTheDocument()
    })
  })

  describe('Crowdloan - Funding', () => {
    const crowdloan = createMockLoan({
      ...mockLoanUnfunded,
      loanType: 'Crowdloan',
      fundedAmount: '50.00 SigUSD',
      fundedPercentage: 50,
    })

    it('should show editable amount input for Crowdloan', () => {
      render(<LoanDetails loan={crowdloan} />)

      const input = screen.getByRole('spinbutton')
      expect(input).not.toHaveAttribute('readonly')
    })

    it('should show Contribute button for Crowdloan', () => {
      render(<LoanDetails loan={crowdloan} />)

      expect(screen.getByRole('button', { name: /contribute to loan/i })).toBeInTheDocument()
    })

    it('should disable Contribute button when amount is empty', () => {
      render(<LoanDetails loan={crowdloan} />)

      const contributeButton = screen.getByRole('button', { name: /contribute to loan/i })
      expect(contributeButton).toBeDisabled()
    })

    it('should enable Contribute button when amount is entered', async () => {
      const user = userEvent.setup()
      render(<LoanDetails loan={crowdloan} />)

      await user.type(screen.getByRole('spinbutton'), '25')

      const contributeButton = screen.getByRole('button', { name: /contribute to loan/i })
      expect(contributeButton).not.toBeDisabled()
    })

    it('should call fundCrowdfund with correct amount', async () => {
      mockFundCrowdfund.mockResolvedValue('tx123')
      const user = userEvent.setup()
      render(<LoanDetails loan={crowdloan} />)

      await user.type(screen.getByRole('spinbutton'), '25')
      await user.click(screen.getByRole('button', { name: /contribute to loan/i }))

      await waitFor(() => {
        expect(mockFundCrowdfund).toHaveBeenCalledWith(crowdloan.loanId, 2500n) // 25 * 10^2 for SigUSD
      })
    })

    it('should show crowdfund specific description', () => {
      render(<LoanDetails loan={crowdloan} />)

      expect(screen.getByText(/contribute any amount to this crowdfunded loan/i)).toBeInTheDocument()
    })
  })

  describe('Borrower Withdrawal', () => {
    const fundedLoanAsBorrower = createMockLoan({
      ...mockLoanFunded,
      creator: MOCK_USER_ADDRESS, // User is the borrower
      isReadyForWithdrawal: true,
    })

    beforeEach(() => {
      // Set the user as borrower
      vi.mocked(useExleStore).mockImplementation((selector) => {
        const state = {
          changeAddress: MOCK_USER_ADDRESS, // Same as creator
          fundLoanSolo: mockFundLoanSolo,
          fundCrowdfund: mockFundCrowdfund,
          repayLoan: mockRepayLoan,
          withdrawLoanAsBorrower: mockWithdrawLoanAsBorrower,
          withdrawFromRepaymentAsLender: mockWithdrawFromRepaymentAsLender,
          withdrawFromCrowdfundAsLender: mockWithdrawFromCrowdfundAsLender,
          loadLoansAndRepayments: mockLoadLoansAndRepayments,
        }
        return selector(state as any)
      })
    })

    it('should show "Ready for withdrawal" indicator', () => {
      render(<LoanDetails loan={fundedLoanAsBorrower} />)

      expect(screen.getByText(/ready for withdrawal/i)).toBeInTheDocument()
    })

    it('should show withdraw button for borrower', () => {
      render(<LoanDetails loan={fundedLoanAsBorrower} />)

      expect(screen.getByRole('button', { name: /withdraw funded loan/i })).toBeInTheDocument()
    })

    it('should call withdrawLoanAsBorrower', async () => {
      mockWithdrawLoanAsBorrower.mockResolvedValue('tx123')
      const user = userEvent.setup()
      render(<LoanDetails loan={fundedLoanAsBorrower} />)

      await user.click(screen.getByRole('button', { name: /withdraw funded loan/i }))

      await waitFor(() => {
        expect(mockWithdrawLoanAsBorrower).toHaveBeenCalledWith(fundedLoanAsBorrower.loanId)
      })
    })
  })

  describe('Lender Withdrawal from Repayment', () => {
    // Use a loan in repayment phase, ready for withdrawal, but NOT fully repaid yet
    // (isRepayed: false because if true, the UI hides action buttons)
    const repaidLoan = createMockLoan({
      ...mockLoanRepayment,
      creator: MOCK_BORROWER_ADDRESS, // User is NOT the borrower
      fundedPercentage: 100,
      isReadyForWithdrawal: true,
      isRepayed: false,
    })

    it('should show withdraw button for lender in repayment phase', () => {
      render(<LoanDetails loan={repaidLoan} />)

      expect(screen.getByRole('button', { name: /withdraw repayment/i })).toBeInTheDocument()
    })

    it('should call withdrawFromRepaymentAsLender', async () => {
      mockWithdrawFromRepaymentAsLender.mockResolvedValue('tx123')
      const user = userEvent.setup()
      render(<LoanDetails loan={repaidLoan} />)

      await user.click(screen.getByRole('button', { name: /withdraw repayment/i }))

      await waitFor(() => {
        expect(mockWithdrawFromRepaymentAsLender).toHaveBeenCalledWith(repaidLoan.loanId)
      })
    })
  })

  describe('Repayment Phase', () => {
    it('should show repayment input', () => {
      render(<LoanDetails loan={mockLoanRepayment} />)

      expect(screen.getByText('Repay this loan')).toBeInTheDocument()
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })

    it('should show Repay button', () => {
      render(<LoanDetails loan={mockLoanRepayment} />)

      expect(screen.getByRole('button', { name: /repay the loan/i })).toBeInTheDocument()
    })

    it('should call repayLoan with entered amount', async () => {
      mockRepayLoan.mockResolvedValue('tx123')
      const user = userEvent.setup()
      render(<LoanDetails loan={mockLoanRepayment} />)

      await user.type(screen.getByRole('spinbutton'), '50')
      await user.click(screen.getByRole('button', { name: /repay the loan/i }))

      await waitFor(() => {
        expect(mockRepayLoan).toHaveBeenCalled()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state while submitting', async () => {
      mockFundLoanSolo.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('tx123'), 1000))
      )
      const user = userEvent.setup()
      render(<LoanDetails loan={mockLoanUnfunded} />)

      await user.click(screen.getByRole('button', { name: /fund the loan/i }))

      expect(screen.getByText(/processing/i)).toBeInTheDocument()
    })

    it('should disable button while submitting', async () => {
      mockFundLoanSolo.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('tx123'), 1000))
      )
      const user = userEvent.setup()
      render(<LoanDetails loan={mockLoanUnfunded} />)

      const button = screen.getByRole('button', { name: /fund the loan/i })
      await user.click(button)

      expect(button).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should show error message on failure', async () => {
      mockFundLoanSolo.mockResolvedValue(null)
      const user = userEvent.setup()
      render(<LoanDetails loan={mockLoanUnfunded} />)

      await user.click(screen.getByRole('button', { name: /fund the loan/i }))

      await waitFor(() => {
        expect(screen.getByText(/transaction failed/i)).toBeInTheDocument()
      })
    })

    it('should show specific error message from exception', async () => {
      mockFundLoanSolo.mockRejectedValue(new Error('Insufficient funds'))
      const user = userEvent.setup()
      render(<LoanDetails loan={mockLoanUnfunded} />)

      await user.click(screen.getByRole('button', { name: /fund the loan/i }))

      await waitFor(() => {
        expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument()
      })
    })
  })

  describe('Inactive Loans', () => {
    it('should show different styling for expired loans', () => {
      const expiredLoan = createMockLoan({
        ...mockLoanUnfunded,
        daysLeft: 0,
      })
      render(<LoanDetails loan={expiredLoan} />)

      // The progress bar should be gray for inactive loans
      expect(screen.getByText('0 Days Left')).toBeInTheDocument()
    })

    it('should show different styling for repaid loans', () => {
      const repaidLoan = createMockLoan({
        ...mockLoanRepayment,
        isRepayed: true,
      })
      render(<LoanDetails loan={repaidLoan} />)

      // Repaid loans shouldn't show action buttons
      expect(screen.queryByRole('button', { name: /repay/i })).not.toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('should show correct progress for partially funded loan', () => {
      const partialLoan = createMockLoan({
        ...mockLoanUnfunded,
        fundedAmount: '50.00 SigUSD',
        fundedPercentage: 50,
      })
      render(<LoanDetails loan={partialLoan} />)

      expect(screen.getByText('50.00 SigUSD funded')).toBeInTheDocument()
    })

    it('should show correct progress for repayment', () => {
      render(<LoanDetails loan={mockLoanRepayment} />)

      expect(screen.getByText(/repaid/)).toBeInTheDocument()
    })
  })
})

describe('LoanDetails - Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not allow non-borrower to withdraw funded loan', async () => {
    // User is not the borrower
    vi.mocked(useExleStore).mockImplementation((selector) => {
      const state = {
        changeAddress: MOCK_USER_ADDRESS, // Different from loan creator
        fundLoanSolo: vi.fn(),
        fundCrowdfund: vi.fn(),
        repayLoan: vi.fn(),
        withdrawLoanAsBorrower: vi.fn(),
        withdrawFromRepaymentAsLender: vi.fn(),
        withdrawFromCrowdfundAsLender: vi.fn(),
        loadLoansAndRepayments: vi.fn(),
      }
      return selector(state as any)
    })

    const fundedLoan = createMockLoan({
      ...mockLoanFunded,
      creator: MOCK_BORROWER_ADDRESS, // Different address
      isReadyForWithdrawal: true,
      phase: 'loan',
    })

    render(<LoanDetails loan={fundedLoan} />)

    // Button should be disabled for non-borrower trying to withdraw from loan phase
    const button = screen.getByRole('button', { name: /withdraw/i })
    expect(button).toBeDisabled()
  })
})
