import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoanWidget } from './loan-widget'
import type { Loan } from '@/types/loan'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const baseLoan: Loan = {
  loanId: 'loan123abc456def789',
  loanTitle: 'Test Loan Title',
  loanDescription: 'This is a test loan description for testing purposes.',
  fundingGoal: '1000',
  fundingToken: 'SigUSD',
  fundedAmount: '500',
  fundedPercentage: 50,
  interestRate: '5%',
  repaymentPeriod: '30 days',
  daysLeft: 15,
  creator: '9abcdef123456789',
  phase: 'loan',
  loanType: 'Solofund',
  isRepayed: false,
  isReadyForWithdrawal: false,
}

describe('LoanWidget', () => {
  describe('Basic Rendering', () => {
    it('should render loan title', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText('Test Loan Title')).toBeInTheDocument()
    })

    it('should render loan description', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText(/test loan description/i)).toBeInTheDocument()
    })

    it('should render loan ID (shortened)', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText(/Loan ID:/)).toBeInTheDocument()
    })

    it('should render loan type', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText('Solofund')).toBeInTheDocument()
    })

    it('should link to loan detail page', () => {
      render(<LoanWidget loan={baseLoan} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/loans/loan123abc456def789')
    })
  })

  describe('Loan Details', () => {
    it('should display repayment period', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText('30 days')).toBeInTheDocument()
      expect(screen.getByText('Repayment Period')).toBeInTheDocument()
    })

    it('should display interest rate', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText('5%')).toBeInTheDocument()
      expect(screen.getByText('Interest Rate')).toBeInTheDocument()
    })

    it('should display funding goal', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText('1000 SigUSD')).toBeInTheDocument()
    })

    it('should display days left', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText('15 Days Left')).toBeInTheDocument()
    })
  })

  describe('Progress Indicators', () => {
    it('should show "funded" for loan phase', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText('500 funded')).toBeInTheDocument()
    })

    it('should show "repaid" for repayment phase', () => {
      render(<LoanWidget loan={{ ...baseLoan, phase: 'repayment' }} />)

      expect(screen.getByText('500 repaid')).toBeInTheDocument()
    })

    it('should show "Total Repayment:" for repayment phase', () => {
      render(<LoanWidget loan={{ ...baseLoan, phase: 'repayment' }} />)

      expect(screen.getByText('Total Repayment:')).toBeInTheDocument()
    })
  })

  describe('Creator Display', () => {
    it('should show creator by default', () => {
      render(<LoanWidget loan={baseLoan} />)

      expect(screen.getByText(/Created by:/)).toBeInTheDocument()
    })

    it('should hide creator when showCreator is false', () => {
      render(<LoanWidget loan={baseLoan} showCreator={false} />)

      expect(screen.queryByText(/Created by:/)).not.toBeInTheDocument()
    })
  })

  describe('Special States', () => {
    it('should show "Funded" badge when solofund is fully funded', () => {
      const fullyFundedLoan = {
        ...baseLoan,
        fundedPercentage: 100,
        loanType: 'Solofund' as const,
      }
      render(<LoanWidget loan={fullyFundedLoan} />)

      expect(screen.getByText('Funded')).toBeInTheDocument()
    })

    it('should show "Ready for withdrawal" when applicable', () => {
      const readyLoan = {
        ...baseLoan,
        isReadyForWithdrawal: true,
      }
      render(<LoanWidget loan={readyLoan} />)

      expect(screen.getByText('Ready for withdrawal')).toBeInTheDocument()
    })
  })
})
