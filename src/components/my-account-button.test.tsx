import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyAccountButton } from './my-account-button'
import { useExleStore } from '@/stores/useExleStore'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock the store
vi.mock('@/stores/useExleStore', () => ({
  useExleStore: vi.fn(),
}))

describe('MyAccountButton', () => {
  const mockDisconnectWallet = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useExleStore).mockImplementation((selector) => {
      return selector({ disconnectWallet: mockDisconnectWallet } as any)
    })
  })

  it('should render My Account button', () => {
    render(<MyAccountButton />)

    expect(screen.getByRole('button', { name: /my account/i })).toBeInTheDocument()
  })

  it('should open dropdown on click', async () => {
    const user = userEvent.setup()
    render(<MyAccountButton />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText(/my loans/i)).toBeInTheDocument()
    expect(screen.getByText(/my donations/i)).toBeInTheDocument()
    expect(screen.getByText(/my repayments/i)).toBeInTheDocument()
    expect(screen.getByText(/transactions history/i)).toBeInTheDocument()
    expect(screen.getByText(/log out/i)).toBeInTheDocument()
  })

  it('should have correct links in dropdown', async () => {
    const user = userEvent.setup()
    render(<MyAccountButton />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('link', { name: /my loans/i })).toHaveAttribute('href', '/account/loans')
    expect(screen.getByRole('link', { name: /my donations/i })).toHaveAttribute('href', '/account/donations')
    expect(screen.getByRole('link', { name: /my repayments/i })).toHaveAttribute('href', '/account/repayments')
    expect(screen.getByRole('link', { name: /transactions history/i })).toHaveAttribute('href', '/transactions')
  })

  it('should call disconnectWallet when Log out is clicked', async () => {
    const user = userEvent.setup()
    render(<MyAccountButton />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText(/log out/i))

    expect(mockDisconnectWallet).toHaveBeenCalledTimes(1)
  })

  it('should have red color on Log out option', async () => {
    const user = userEvent.setup()
    render(<MyAccountButton />)

    await user.click(screen.getByRole('button'))

    const logoutItem = screen.getByText(/log out/i).closest('[role="menuitem"]')
    expect(logoutItem).toHaveClass('text-red-500')
  })
})
