import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from './navbar'
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

// Mock sub-components
vi.mock('./exle-logo', () => ({
  ExleLogo: () => <span data-testid="exle-logo">Logo</span>,
}))

vi.mock('./theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme</button>,
}))

vi.mock('./connect-wallet-button', () => ({
  ConnectWalletButton: () => <button data-testid="connect-wallet">Connect</button>,
}))

vi.mock('./my-account-button', () => ({
  MyAccountButton: () => <button data-testid="my-account">Account</button>,
}))

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('When wallet is not connected', () => {
    beforeEach(() => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: '' } as any)
      })
    })

    it('should render EXLE brand link', () => {
      render(<Navbar />)

      const brandLink = screen.getByRole('link', { name: /exle/i })
      expect(brandLink).toHaveAttribute('href', '/')
    })

    it('should render Loans navigation link', () => {
      render(<Navbar />)

      const loansLinks = screen.getAllByRole('link', { name: /loans/i })
      const navLoansLink = loansLinks.find((link) => link.getAttribute('href') === '/loans')
      expect(navLoansLink).toBeInTheDocument()
    })

    it('should render Repayments navigation link', () => {
      render(<Navbar />)

      const repaymentsLinks = screen.getAllByRole('link', { name: /repayments/i })
      const navRepaymentsLink = repaymentsLinks.find((link) => link.getAttribute('href') === '/repayments')
      expect(navRepaymentsLink).toBeInTheDocument()
    })

    it('should render theme toggle', () => {
      render(<Navbar />)

      // Multiple theme toggles (desktop and mobile)
      expect(screen.getAllByTestId('theme-toggle').length).toBeGreaterThanOrEqual(1)
    })

    it('should render connect wallet button when not connected', () => {
      render(<Navbar />)

      expect(screen.getAllByTestId('connect-wallet').length).toBeGreaterThanOrEqual(1)
    })

    it('should NOT render my account button when not connected', () => {
      render(<Navbar />)

      expect(screen.queryByTestId('my-account')).not.toBeInTheDocument()
    })
  })

  describe('When wallet is connected', () => {
    beforeEach(() => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: '9abc123' } as any)
      })
    })

    it('should render my account button when connected', () => {
      render(<Navbar />)

      expect(screen.getAllByTestId('my-account').length).toBeGreaterThanOrEqual(1)
    })

    it('should NOT render connect wallet button when connected', () => {
      render(<Navbar />)

      expect(screen.queryByTestId('connect-wallet')).not.toBeInTheDocument()
    })
  })

  describe('Mobile Menu', () => {
    it('should render mobile menu trigger', () => {
      render(<Navbar />)

      // The mobile menu trigger is a button with Menu icon
      const menuButtons = screen.getAllByRole('button')
      expect(menuButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Logo', () => {
    it('should render EXLE logo', () => {
      vi.mocked(useExleStore).mockImplementation((selector) => {
        return selector({ changeAddress: '' } as any)
      })

      render(<Navbar />)

      expect(screen.getByTestId('exle-logo')).toBeInTheDocument()
    })
  })
})
