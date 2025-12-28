import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import TransactionsPage from './page'
import { useExleStore } from '@/stores/useExleStore'

// Mock the store
vi.mock('@/stores/useExleStore', () => ({
  useExleStore: vi.fn(),
}))

// Mock the EmptyLoans component
vi.mock('@/components/loan/empty-loans', () => ({
  EmptyLoans: ({ message }: { message: string }) => (
    <div data-testid="empty-loans">{message}</div>
  ),
}))

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Wallet not connected', () => {
    it('should show connect wallet message', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: '' } as any)
      })

      render(<TransactionsPage />)

      expect(screen.getByTestId('empty-loans')).toHaveTextContent(
        'Connect your wallet to view your transaction history.'
      )
    })
  })

  describe('Wallet connected', () => {
    beforeEach(() => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: '9testAddress' } as any)
      })
    })

    it('should show page title', () => {
      render(<TransactionsPage />)

      expect(screen.getByRole('heading', { name: /transaction history/i })).toBeInTheDocument()
    })

    it('should show subtitle', () => {
      render(<TransactionsPage />)

      expect(screen.getByText(/view all your exle transactions/i)).toBeInTheDocument()
    })

    it('should show no transactions message (placeholder)', () => {
      render(<TransactionsPage />)

      expect(screen.getByTestId('empty-loans')).toHaveTextContent('No transactions found.')
    })
  })
})
