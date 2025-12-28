import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock components that may have complex dependencies
vi.mock('@/components/how-it-works-steps', () => ({
  HowItWorksSteps: () => <div data-testid="how-it-works-steps">How It Works Steps</div>,
}))

vi.mock('@/components/ergo-manifesto', () => ({
  ErgoManifesto: () => <div data-testid="ergo-manifesto">Ergo Manifesto</div>,
  ErgoManifestoMobile: () => <div data-testid="ergo-manifesto-mobile">Ergo Manifesto Mobile</div>,
}))

describe('Home Page', () => {
  it('should render the main heading', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /borrow and lend money/i
    )
  })

  it('should render the subheading', () => {
    render(<Home />)

    expect(screen.getByText(/person-to-person.*lending platform/i)).toBeInTheDocument()
  })

  it('should have a Create loan link', () => {
    render(<Home />)

    const createLoanLink = screen.getByRole('link', { name: /create loan/i })
    expect(createLoanLink).toHaveAttribute('href', '/loans/create')
  })

  it('should have a Learn more link', () => {
    render(<Home />)

    const learnMoreLink = screen.getByRole('link', { name: /learn more/i })
    expect(learnMoreLink).toHaveAttribute('href', '/learn-more')
  })

  it('should render How does it work section', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/how does it work/i)
  })

  it('should render HowItWorksSteps component', () => {
    render(<Home />)

    expect(screen.getByTestId('how-it-works-steps')).toBeInTheDocument()
  })

  it('should render ErgoManifesto components', () => {
    render(<Home />)

    expect(screen.getByTestId('ergo-manifesto')).toBeInTheDocument()
    expect(screen.getByTestId('ergo-manifesto-mobile')).toBeInTheDocument()
  })

  it('should have gradient styling on main heading', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('bg-gradient-to-r')
  })
})
