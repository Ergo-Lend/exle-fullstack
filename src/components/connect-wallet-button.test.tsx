import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConnectWalletButton } from './connect-wallet-button'
import { useExleStore } from '@/stores/useExleStore'

// Mock the store
vi.mock('@/stores/useExleStore', () => ({
  useExleStore: vi.fn(),
}))

describe('ConnectWalletButton', () => {
  const mockConnectWallet = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useExleStore).mockImplementation((selector) => {
      return selector({ connectWallet: mockConnectWallet } as any)
    })
  })

  it('should render connect wallet button', () => {
    render(<ConnectWalletButton />)

    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
  })

  it('should call connectWallet when clicked', async () => {
    const user = userEvent.setup()
    render(<ConnectWalletButton />)

    await user.click(screen.getByRole('button'))

    expect(mockConnectWallet).toHaveBeenCalledTimes(1)
  })

  it('should have rounded-full styling', () => {
    render(<ConnectWalletButton />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('rounded-full')
  })

  it('should have exle-accent background', () => {
    render(<ConnectWalletButton />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-exle-accent')
  })
})
