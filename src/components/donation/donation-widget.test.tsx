import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DonationWidget } from './donation-widget'
import { useExleStore } from '@/stores/useExleStore'
import {
  mockDonations,
  createMockDonation,
  MOCK_LOAN_ID,
  setupWindowMocks,
  cleanupWindowMocks,
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

describe('DonationWidget', () => {
  const mockWithdrawFromRepaymentAsLender = vi.fn()
  const mockWithdrawFromCrowdfundAsLender = vi.fn()
  const mockLoadExleHistory = vi.fn()

  beforeEach(() => {
    vi.mocked(useExleStore).mockImplementation((selector) => {
      const state = {
        withdrawFromRepaymentAsLender: mockWithdrawFromRepaymentAsLender,
        withdrawFromCrowdfundAsLender: mockWithdrawFromCrowdfundAsLender,
        loadExleHistory: mockLoadExleHistory,
      }
      return selector(state as any)
    })

    setupWindowMocks()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanupWindowMocks()
  })

  describe('Display', () => {
    it('should display donation details correctly', () => {
      render(<DonationWidget donation={mockDonations[0]} />)

      expect(screen.getByText('My Loan')).toBeInTheDocument()
      expect(screen.getByText('In repayment')).toBeInTheDocument()
      expect(screen.getByText('Solofund')).toBeInTheDocument()
    })

    it('should format SigUSD amount correctly', () => {
      const donation = createMockDonation({
        amount: 10000n, // 100.00 SigUSD
        ticker: 'SigUSD',
      })
      render(<DonationWidget donation={donation} />)

      expect(screen.getByText('100 SigUSD')).toBeInTheDocument()
    })

    it('should show shortened loan ID', () => {
      render(<DonationWidget donation={mockDonations[0]} />)

      // Should show shortened version of loan ID
      expect(screen.getByText(/Loan ID:/)).toBeInTheDocument()
    })

    it('should display Crowdloan type badge', () => {
      const crowdloan = createMockDonation({
        type: 'Crowdloan',
      })
      render(<DonationWidget donation={crowdloan} />)

      expect(screen.getByText('Crowdloan')).toBeInTheDocument()
    })

    it('should show View Loan button', () => {
      render(<DonationWidget donation={mockDonations[0]} />)

      expect(screen.getByRole('link', { name: /view loan/i })).toBeInTheDocument()
    })
  })

  describe('Status Badges', () => {
    it('should show green badge for Fully Repaid', () => {
      const donation = createMockDonation({ status: 'Fully Repaid' })
      render(<DonationWidget donation={donation} />)

      const badge = screen.getByText('Fully Repaid')
      expect(badge).toHaveClass('bg-green-500')
    })

    it('should show amber badge for Fully Funded', () => {
      const donation = createMockDonation({ status: 'Fully Funded' })
      render(<DonationWidget donation={donation} />)

      const badge = screen.getByText('Fully Funded')
      expect(badge).toHaveClass('bg-amber-500')
    })

    it('should show indigo badge for In repayment', () => {
      const donation = createMockDonation({ status: 'In repayment' })
      render(<DonationWidget donation={donation} />)

      const badge = screen.getByText('In repayment')
      expect(badge).toHaveClass('bg-indigo-600')
    })

    it('should show blue badge for Funding', () => {
      const donation = createMockDonation({ status: 'Funding' })
      render(<DonationWidget donation={donation} />)

      const badge = screen.getByText('Funding')
      expect(badge).toHaveClass('bg-blue-500')
    })

    it('should show red badge for Cancelled', () => {
      const donation = createMockDonation({ status: 'Cancelled' })
      render(<DonationWidget donation={donation} />)

      const badge = screen.getByText('Cancelled')
      expect(badge).toHaveClass('bg-red-500')
    })
  })

  describe('Withdrawal', () => {
    it('should show Withdraw button for Fully Repaid donations', () => {
      const donation = createMockDonation({ status: 'Fully Repaid' })
      render(<DonationWidget donation={donation} />)

      expect(screen.getByRole('button', { name: /withdraw/i })).toBeInTheDocument()
    })

    it('should show Withdraw button for Cancelled donations', () => {
      const donation = createMockDonation({ status: 'Cancelled' })
      render(<DonationWidget donation={donation} />)

      expect(screen.getByRole('button', { name: /withdraw/i })).toBeInTheDocument()
    })

    it('should NOT show Withdraw button for In repayment donations', () => {
      const donation = createMockDonation({ status: 'In repayment' })
      render(<DonationWidget donation={donation} />)

      expect(screen.queryByRole('button', { name: /withdraw/i })).not.toBeInTheDocument()
    })

    it('should NOT show Withdraw button for Funding donations', () => {
      const donation = createMockDonation({ status: 'Funding' })
      render(<DonationWidget donation={donation} />)

      expect(screen.queryByRole('button', { name: /withdraw/i })).not.toBeInTheDocument()
    })

    it('should call withdrawFromRepaymentAsLender for Solofund', async () => {
      mockWithdrawFromRepaymentAsLender.mockResolvedValue('tx123')
      const user = userEvent.setup()

      const donation = createMockDonation({
        type: 'Solofund',
        status: 'Fully Repaid',
      })
      render(<DonationWidget donation={donation} />)

      await user.click(screen.getByRole('button', { name: /withdraw/i }))

      await waitFor(() => {
        expect(mockWithdrawFromRepaymentAsLender).toHaveBeenCalledWith(donation.loanId)
      })
    })

    it('should call withdrawFromCrowdfundAsLender for Crowdloan', async () => {
      mockWithdrawFromCrowdfundAsLender.mockResolvedValue('tx123')
      const user = userEvent.setup()

      const donation = createMockDonation({
        type: 'Crowdloan',
        status: 'Fully Repaid',
      })
      render(<DonationWidget donation={donation} />)

      await user.click(screen.getByRole('button', { name: /withdraw/i }))

      await waitFor(() => {
        expect(mockWithdrawFromCrowdfundAsLender).toHaveBeenCalledWith(donation.loanId)
      })
    })

    it('should show success message after withdrawal', async () => {
      mockWithdrawFromRepaymentAsLender.mockResolvedValue('tx123success')
      const user = userEvent.setup()

      const donation = createMockDonation({
        type: 'Solofund',
        status: 'Fully Repaid',
      })
      render(<DonationWidget donation={donation} />)

      await user.click(screen.getByRole('button', { name: /withdraw/i }))

      await waitFor(() => {
        expect(screen.getByText(/withdrawal successful/i)).toBeInTheDocument()
      })
    })

    it('should hide Withdraw button after successful withdrawal', async () => {
      mockWithdrawFromRepaymentAsLender.mockResolvedValue('tx123')
      const user = userEvent.setup()

      const donation = createMockDonation({
        type: 'Solofund',
        status: 'Fully Repaid',
      })
      render(<DonationWidget donation={donation} />)

      await user.click(screen.getByRole('button', { name: /withdraw/i }))

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /^withdraw$/i })).not.toBeInTheDocument()
      })
    })

    it('should refresh history after withdrawal', async () => {
      mockWithdrawFromRepaymentAsLender.mockResolvedValue('tx123')
      const user = userEvent.setup()

      const donation = createMockDonation({
        type: 'Solofund',
        status: 'Fully Repaid',
      })
      render(<DonationWidget donation={donation} />)

      await user.click(screen.getByRole('button', { name: /withdraw/i }))

      await waitFor(() => {
        expect(mockLoadExleHistory).toHaveBeenCalled()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state while withdrawing', async () => {
      mockWithdrawFromRepaymentAsLender.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('tx123'), 1000))
      )
      const user = userEvent.setup()

      const donation = createMockDonation({
        type: 'Solofund',
        status: 'Fully Repaid',
      })
      render(<DonationWidget donation={donation} />)

      await user.click(screen.getByRole('button', { name: /withdraw/i }))

      expect(screen.getByText(/withdrawing/i)).toBeInTheDocument()
    })

    it('should disable button while withdrawing', async () => {
      mockWithdrawFromRepaymentAsLender.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('tx123'), 1000))
      )
      const user = userEvent.setup()

      const donation = createMockDonation({
        type: 'Solofund',
        status: 'Fully Repaid',
      })
      render(<DonationWidget donation={donation} />)

      const button = screen.getByRole('button', { name: /withdraw/i })
      await user.click(button)

      expect(button).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should show error message on withdrawal failure', async () => {
      mockWithdrawFromRepaymentAsLender.mockResolvedValue(null)
      const user = userEvent.setup()

      const donation = createMockDonation({
        type: 'Solofund',
        status: 'Fully Repaid',
      })
      render(<DonationWidget donation={donation} />)

      await user.click(screen.getByRole('button', { name: /withdraw/i }))

      await waitFor(() => {
        expect(screen.getByText(/transaction failed/i)).toBeInTheDocument()
      })
    })

    it('should show specific error message from exception', async () => {
      mockWithdrawFromRepaymentAsLender.mockRejectedValue(new Error('Insufficient ERG'))
      const user = userEvent.setup()

      const donation = createMockDonation({
        type: 'Solofund',
        status: 'Fully Repaid',
      })
      render(<DonationWidget donation={donation} />)

      await user.click(screen.getByRole('button', { name: /withdraw/i }))

      await waitFor(() => {
        expect(screen.getByText(/insufficient erg/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should have correct link to loan details', () => {
      render(<DonationWidget donation={mockDonations[0]} />)

      const link = screen.getByRole('link', { name: /view loan/i })
      expect(link).toHaveAttribute('href', `/loans/${mockDonations[0].loanId}`)
    })
  })
})
