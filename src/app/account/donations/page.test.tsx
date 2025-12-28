import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import MyDonationsPage from './page'
import { useExleStore } from '@/stores/useExleStore'
import {
  mockDonations,
  MOCK_USER_ADDRESS,
  mockAllExleMetadata,
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

describe('MyDonationsPage', () => {
  const mockLoadExleHistory = vi.fn()
  const mockGetMyDonations = vi.fn()
  const mockWithdrawFromRepaymentAsLender = vi.fn()
  const mockWithdrawFromCrowdfundAsLender = vi.fn()

  const defaultMockState = {
    changeAddress: MOCK_USER_ADDRESS,
    getMyDonations: mockGetMyDonations,
    loadExleHistory: mockLoadExleHistory,
    isLoading: false,
    exleMetadata: mockAllExleMetadata,
    withdrawFromRepaymentAsLender: mockWithdrawFromRepaymentAsLender,
    withdrawFromCrowdfundAsLender: mockWithdrawFromCrowdfundAsLender,
  }

  beforeEach(() => {
    mockGetMyDonations.mockReturnValue([])
    vi.mocked(useExleStore).mockImplementation((selector) => {
      return selector(defaultMockState as any)
    })
    setupWindowMocks()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanupWindowMocks()
  })

  describe('Wallet Connection', () => {
    it('should show connect wallet message when not connected', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({
          ...defaultMockState,
          changeAddress: '',
        } as any)
      })

      render(<MyDonationsPage />)

      expect(screen.getByText(/connect your wallet to view your donations/i)).toBeInTheDocument()
    })

    it('should show empty state when connected but no donations', () => {
      mockGetMyDonations.mockReturnValue([])

      render(<MyDonationsPage />)

      expect(screen.getByText(/you haven't made any donations yet/i)).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator while fetching', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({
          ...defaultMockState,
          isLoading: true,
        } as any)
      })

      render(<MyDonationsPage />)

      // Look for the loading spinner (Loader2 component)
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('Donations Display', () => {
    it('should display donations when available', () => {
      mockGetMyDonations.mockReturnValue(mockDonations)

      render(<MyDonationsPage />)

      expect(screen.getByText('My Loan')).toBeInTheDocument()
      expect(screen.getByText('Community Project')).toBeInTheDocument()
    })

    it('should show correct count in header', () => {
      mockGetMyDonations.mockReturnValue(mockDonations)

      render(<MyDonationsPage />)

      expect(screen.getByText('2 loans funded by you')).toBeInTheDocument()
    })

    it('should show singular form for 1 donation', () => {
      mockGetMyDonations.mockReturnValue([mockDonations[0]])

      render(<MyDonationsPage />)

      expect(screen.getByText('1 loan funded by you')).toBeInTheDocument()
    })

    it('should render DonationWidget for each donation', () => {
      mockGetMyDonations.mockReturnValue(mockDonations)

      render(<MyDonationsPage />)

      // Each donation should have a View Loan link
      const viewLinks = screen.getAllByRole('link', { name: /view loan/i })
      expect(viewLinks).toHaveLength(2)
    })
  })

  describe('Data Loading', () => {
    it('should call loadExleHistory when wallet connected but no metadata', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({
          ...defaultMockState,
          exleMetadata: null,
        } as any)
      })

      render(<MyDonationsPage />)

      expect(mockLoadExleHistory).toHaveBeenCalled()
    })

    it('should NOT call loadExleHistory when metadata already loaded', () => {
      render(<MyDonationsPage />)

      expect(mockLoadExleHistory).not.toHaveBeenCalled()
    })

    it('should NOT call loadExleHistory when wallet not connected', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({
          ...defaultMockState,
          changeAddress: '',
          exleMetadata: null,
        } as any)
      })

      render(<MyDonationsPage />)

      expect(mockLoadExleHistory).not.toHaveBeenCalled()
    })
  })

  describe('Page Header', () => {
    it('should display My Donations title', () => {
      render(<MyDonationsPage />)

      expect(screen.getByRole('heading', { name: /my donations/i })).toBeInTheDocument()
    })

    it('should have gradient styling on title', () => {
      render(<MyDonationsPage />)

      const heading = screen.getByRole('heading', { name: /my donations/i })
      expect(heading).toHaveClass('bg-gradient-to-r')
    })
  })

  describe('Grid Layout', () => {
    it('should render donations in a grid', () => {
      mockGetMyDonations.mockReturnValue(mockDonations)

      render(<MyDonationsPage />)

      // Check for grid container
      const container = document.querySelector('.grid')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('grid-cols-1')
    })
  })
})
