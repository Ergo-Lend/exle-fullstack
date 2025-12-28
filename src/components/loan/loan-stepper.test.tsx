import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoanStepper } from './loan-stepper'
import { useExleStore } from '@/stores/useExleStore'
import { MOCK_USER_ADDRESS, setupWindowMocks, cleanupWindowMocks } from '@/lib/exle/__mocks__/mockdata'

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
    if (ticker === 'ERG') {
      return {
        tokenId: '0000000000000000000000000000000000000000000000000000000000000000',
        decimals: 9,
        name: 'Ergo',
        ticker: 'ERG',
      }
    }
    return undefined
  }),
}))

describe('LoanStepper', () => {
  const mockCreateSolofundLoan = vi.fn()
  const mockCreateCrowdfundLoan = vi.fn()

  beforeEach(() => {
    vi.mocked(useExleStore).mockImplementation((selector) => {
      const state = {
        changeAddress: MOCK_USER_ADDRESS,
        createSolofundLoan: mockCreateSolofundLoan,
        createCrowdfundLoan: mockCreateCrowdfundLoan,
      }
      return selector(state as any)
    })

    setupWindowMocks()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanupWindowMocks()
  })

  describe('Step 1 - Loan Type Selection', () => {
    it('should render step 1 by default', () => {
      render(<LoanStepper />)

      expect(screen.getByText('Loan type')).toBeInTheDocument()
      expect(screen.getByText('What type of loan do you want to take?')).toBeInTheDocument()
    })

    it('should show Crowdloan and Solofund options', () => {
      render(<LoanStepper />)

      expect(screen.getByText('Crowdloan')).toBeInTheDocument()
      expect(screen.getByText('Solofund')).toBeInTheDocument()
    })

    it('should disable Continue button when no loan type selected', () => {
      render(<LoanStepper />)

      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).toBeDisabled()
    })

    it('should enable Continue button when loan type and wallet confirmed', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)

      // Select Solofund
      await user.click(screen.getByText('Solofund'))

      // Confirm wallet
      await user.click(screen.getByRole('checkbox'))

      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).not.toBeDisabled()
    })

    it('should proceed to step 2 when Continue clicked', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)

      await user.click(screen.getByText('Solofund'))
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /continue/i }))

      expect(screen.getByText('Loan details')).toBeInTheDocument()
    })
  })

  describe('Step 2 - Loan Details', () => {
    const goToStep2 = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByText('Solofund'))
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /continue/i }))
    }

    it('should show loan title and description inputs', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep2(user)

      expect(screen.getByLabelText(/loan title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/loan description/i)).toBeInTheDocument()
    })

    it('should disable Continue when fields are empty', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep2(user)

      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).toBeDisabled()
    })

    it('should allow going back to step 1', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep2(user)

      await user.click(screen.getByRole('button', { name: /go back/i }))

      expect(screen.getByText('Loan type')).toBeInTheDocument()
    })

    it('should proceed to step 3 when fields are filled', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep2(user)

      await user.type(screen.getByLabelText(/loan title/i), 'Test Loan')
      await user.type(screen.getByLabelText(/loan description/i), 'Test Description')
      await user.click(screen.getByRole('button', { name: /continue/i }))

      expect(screen.getByText('Loan parameters')).toBeInTheDocument()
    })
  })

  describe('Step 3 - Loan Parameters', () => {
    const goToStep3 = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByText('Solofund'))
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await user.type(screen.getByLabelText(/loan title/i), 'Test Loan')
      await user.type(screen.getByLabelText(/loan description/i), 'Test Description')
      await user.click(screen.getByRole('button', { name: /continue/i }))
    }

    it('should show all parameter inputs', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep3(user)

      expect(screen.getByText('Loan Token')).toBeInTheDocument()
      expect(screen.getByText('Funding Goal')).toBeInTheDocument()
      expect(screen.getByText('Funding Deadline')).toBeInTheDocument()
      expect(screen.getByText('Interest Rate')).toBeInTheDocument()
      expect(screen.getByText('Repayment Period')).toBeInTheDocument()
    })

    it('should default to SigUSD token', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep3(user)

      // Multiple SigUSD elements may appear (in dropdown, labels, etc.)
      const sigUsdElements = screen.getAllByText('SigUSD')
      expect(sigUsdElements.length).toBeGreaterThan(0)
    })

    it('should proceed to step 4 when all parameters filled', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep3(user)

      // Fill in parameters
      const inputs = screen.getAllByRole('spinbutton')
      await user.type(inputs[0], '100') // Funding Goal
      await user.type(inputs[1], '1') // Funding Deadline
      await user.type(inputs[2], '10') // Interest Rate
      await user.type(inputs[3], '3') // Repayment Period

      await user.click(screen.getByRole('button', { name: /continue/i }))

      expect(screen.getByText('Terms of use')).toBeInTheDocument()
    })
  })

  describe('Step 4 - Terms of Use', () => {
    const goToStep4 = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByText('Solofund'))
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await user.type(screen.getByLabelText(/loan title/i), 'Test Loan')
      await user.type(screen.getByLabelText(/loan description/i), 'Test Description')
      await user.click(screen.getByRole('button', { name: /continue/i }))
      const inputs = screen.getAllByRole('spinbutton')
      await user.type(inputs[0], '100')
      await user.type(inputs[1], '1')
      await user.type(inputs[2], '10')
      await user.type(inputs[3], '3')
      await user.click(screen.getByRole('button', { name: /continue/i }))
    }

    it('should show loan summary', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep4(user)

      expect(screen.getByText('Test Loan')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('100 SigUSD')).toBeInTheDocument()
      expect(screen.getByText('Solofund')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()
    })

    it('should show terms checkboxes', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep4(user)

      expect(screen.getByText(/I agree to the terms of use/i)).toBeInTheDocument()
    })

    it('should proceed to step 5 when terms accepted', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep4(user)

      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /continue/i }))

      expect(screen.getByText('Payment & Finalize')).toBeInTheDocument()
    })
  })

  describe('Step 5 - Payment & Finalize', () => {
    const goToStep5 = async (user: ReturnType<typeof userEvent.setup>, loanType: 'Solofund' | 'Crowdloan' = 'Solofund') => {
      await user.click(screen.getByText(loanType))
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await user.type(screen.getByLabelText(/loan title/i), 'Test Loan')
      await user.type(screen.getByLabelText(/loan description/i), 'Test Description')
      await user.click(screen.getByRole('button', { name: /continue/i }))
      const inputs = screen.getAllByRole('spinbutton')
      await user.type(inputs[0], '100')
      await user.type(inputs[1], '1')
      await user.type(inputs[2], '10')
      await user.type(inputs[3], '3')
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /continue/i }))
    }

    it('should show payment instructions', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep5(user)

      // Multiple elements may contain "pay via browser wallet" (text and button)
      const payElements = screen.getAllByText(/pay via browser wallet/i)
      expect(payElements.length).toBeGreaterThan(0)
      expect(screen.getByText(/0.1 ERG/i)).toBeInTheDocument()
    })

    it('should call createSolofundLoan for Solofund type', async () => {
      mockCreateSolofundLoan.mockResolvedValue('tx123')

      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep5(user, 'Solofund')

      await user.click(screen.getByRole('button', { name: /pay via browser wallet/i }))

      await waitFor(() => {
        expect(mockCreateSolofundLoan).toHaveBeenCalled()
      })
    })

    it('should call createCrowdfundLoan for Crowdloan type', async () => {
      mockCreateCrowdfundLoan.mockResolvedValue('tx123')

      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep5(user, 'Crowdloan')

      await user.click(screen.getByRole('button', { name: /pay via browser wallet/i }))

      await waitFor(() => {
        expect(mockCreateCrowdfundLoan).toHaveBeenCalled()
      })
    })

    it('should show loading state while submitting', async () => {
      mockCreateSolofundLoan.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('tx123'), 1000))
      )

      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep5(user)

      await user.click(screen.getByRole('button', { name: /pay via browser wallet/i }))

      expect(screen.getByText(/creating loan/i)).toBeInTheDocument()
    })

    it('should show success message on successful creation', async () => {
      mockCreateSolofundLoan.mockResolvedValue('tx123')

      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep5(user)

      await user.click(screen.getByRole('button', { name: /pay via browser wallet/i }))

      await waitFor(() => {
        expect(screen.getByText(/transaction has been confirmed/i)).toBeInTheDocument()
      })
    })

    it('should show error message on failed creation', async () => {
      mockCreateSolofundLoan.mockResolvedValue(null)

      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep5(user)

      await user.click(screen.getByRole('button', { name: /pay via browser wallet/i }))

      await waitFor(() => {
        expect(screen.getByText(/transaction failed/i)).toBeInTheDocument()
      })
    })

    it('should show specific error message from exception', async () => {
      mockCreateSolofundLoan.mockRejectedValue(new Error('Wallet rejected'))

      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep5(user)

      await user.click(screen.getByRole('button', { name: /pay via browser wallet/i }))

      await waitFor(() => {
        expect(screen.getByText(/wallet rejected/i)).toBeInTheDocument()
      })
    })

    it('should pass correct parameters to createSolofundLoan', async () => {
      mockCreateSolofundLoan.mockResolvedValue('tx123')

      const user = userEvent.setup()
      render(<LoanStepper />)
      await goToStep5(user)

      await user.click(screen.getByRole('button', { name: /pay via browser wallet/i }))

      await waitFor(() => {
        expect(mockCreateSolofundLoan).toHaveBeenCalledWith(
          expect.objectContaining({
            loanType: 'Solofund',
            borrowerAddress: MOCK_USER_ADDRESS,
            project: ['Test Loan', 'Test Description'],
            loanTokenId: '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04',
            fundingGoal: 10000n, // 100 * 10^2 for SigUSD
            interestRate: 100n, // 10% * 10
          })
        )
      })
    })
  })

  describe('Navigation', () => {
    it('should allow navigating back through all steps', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)

      // Go to step 2
      await user.click(screen.getByText('Solofund'))
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /continue/i }))
      expect(screen.getByText('Loan details')).toBeInTheDocument()

      // Go back to step 1
      await user.click(screen.getByRole('button', { name: /go back/i }))
      expect(screen.getByText('Loan type')).toBeInTheDocument()
    })

    it('should preserve data when navigating back and forth', async () => {
      const user = userEvent.setup()
      render(<LoanStepper />)

      // Go to step 2 and fill data
      await user.click(screen.getByText('Crowdloan'))
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /continue/i }))

      await user.type(screen.getByLabelText(/loan title/i), 'My Crowdloan')
      await user.type(screen.getByLabelText(/loan description/i), 'My Description')

      // Go back to step 1
      await user.click(screen.getByRole('button', { name: /go back/i }))

      // Go forward to step 2 again
      await user.click(screen.getByRole('button', { name: /continue/i }))

      // Data should be preserved
      expect(screen.getByLabelText(/loan title/i)).toHaveValue('My Crowdloan')
      expect(screen.getByLabelText(/loan description/i)).toHaveValue('My Description')
    })
  })
})

describe('LoanStepper - Edge Cases', () => {
  beforeEach(() => {
    vi.mocked(useExleStore).mockImplementation((selector) => {
      const state = {
        changeAddress: '',
        createSolofundLoan: vi.fn(),
        createCrowdfundLoan: vi.fn(),
      }
      return selector(state as any)
    })
  })

  it('should show "Not connected" when no wallet address', () => {
    render(<LoanStepper />)

    expect(screen.getByText(/not connected/i)).toBeInTheDocument()
  })
})
