import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoansGrid } from './loans-grid'
import type { Loan } from '@/types/loan'

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock sub-components for cleaner testing
vi.mock('./loan-widget', () => ({
  LoanWidget: ({ loan }: { loan: Loan }) => (
    <div data-testid={`loan-widget-${loan.loanId}`}>{loan.loanTitle}</div>
  ),
}))

vi.mock('./empty-loans', () => ({
  EmptyLoans: () => <div data-testid="empty-loans">No loans found</div>,
}))

vi.mock('./sort-loans', () => ({
  SortLoans: ({ selectedOption, onChange }: { selectedOption: string; onChange: (v: string) => void }) => (
    <select
      data-testid="sort-loans"
      value={selectedOption}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="date_desc">Date (desc)</option>
      <option value="name_asc">Name (asc)</option>
    </select>
  ),
}))

const mockLoans: Loan[] = [
  {
    loanId: 'loan1',
    loanTitle: 'First Loan',
    loanDescription: 'First loan description',
    fundingGoal: '1000',
    fundingToken: 'SigUSD',
    fundedAmount: '500',
    fundedPercentage: 50,
    interestRate: '5%',
    repaymentPeriod: '30 days',
    daysLeft: 15,
    creator: '9abc',
    phase: 'loan',
    loanType: 'Solofund',
    isRepayed: false,
    isReadyForWithdrawal: false,
  },
  {
    loanId: 'loan2',
    loanTitle: 'Second Loan',
    loanDescription: 'Second loan description',
    fundingGoal: '2000',
    fundingToken: 'SigUSD',
    fundedAmount: '1000',
    fundedPercentage: 50,
    interestRate: '10%',
    repaymentPeriod: '60 days',
    daysLeft: 30,
    creator: '9def',
    phase: 'loan',
    loanType: 'Crowdfund',
    isRepayed: false,
    isReadyForWithdrawal: false,
  },
  {
    loanId: 'repay1',
    loanTitle: 'Repayment Loan',
    loanDescription: 'Repayment description',
    fundingGoal: '500',
    fundingToken: 'SigUSD',
    fundedAmount: '250',
    fundedPercentage: 50,
    interestRate: '3%',
    repaymentPeriod: '15 days',
    daysLeft: 5,
    creator: '9ghi',
    phase: 'repayment',
    loanType: 'Solofund',
    isRepayed: false,
    isReadyForWithdrawal: false,
  },
]

describe('LoansGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loan Phase', () => {
    it('should display "Loans on EXLE" title for loan phase', () => {
      render(<LoansGrid loans={mockLoans} phase="loan" />)

      expect(screen.getByRole('heading', { name: /loans on exle/i })).toBeInTheDocument()
    })

    it('should filter to show only loan phase loans', () => {
      render(<LoansGrid loans={mockLoans} phase="loan" />)

      expect(screen.getByTestId('loan-widget-loan1')).toBeInTheDocument()
      expect(screen.getByTestId('loan-widget-loan2')).toBeInTheDocument()
      expect(screen.queryByTestId('loan-widget-repay1')).not.toBeInTheDocument()
    })

    it('should show correct count for loan phase', () => {
      render(<LoansGrid loans={mockLoans} phase="loan" />)

      expect(screen.getByText('2 Active Loans')).toBeInTheDocument()
    })
  })

  describe('Repayment Phase', () => {
    it('should display "Repayments on EXLE" title for repayment phase', () => {
      render(<LoansGrid loans={mockLoans} phase="repayment" />)

      expect(screen.getByRole('heading', { name: /repayments on exle/i })).toBeInTheDocument()
    })

    it('should filter to show only repayment phase loans', () => {
      render(<LoansGrid loans={mockLoans} phase="repayment" />)

      expect(screen.getByTestId('loan-widget-repay1')).toBeInTheDocument()
      expect(screen.queryByTestId('loan-widget-loan1')).not.toBeInTheDocument()
    })

    it('should show correct count for repayment phase', () => {
      render(<LoansGrid loans={mockLoans} phase="repayment" />)

      expect(screen.getByText('1 Repayments')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no loans match phase', () => {
      const loansWithoutRepayments = mockLoans.filter((l) => l.phase !== 'repayment')
      // This removes all repayment phase loans
      const onlyRepaymentPhaseLoans: Loan[] = []

      render(<LoansGrid loans={onlyRepaymentPhaseLoans} phase="loan" />)

      expect(screen.getByTestId('empty-loans')).toBeInTheDocument()
    })
  })

  describe('Search', () => {
    it('should render search input', () => {
      render(<LoansGrid loans={mockLoans} phase="loan" />)

      expect(screen.getByPlaceholderText(/search in loans/i)).toBeInTheDocument()
    })

    it('should filter loans based on search query', async () => {
      const user = userEvent.setup()
      render(<LoansGrid loans={mockLoans} phase="loan" />)

      const searchInput = screen.getByPlaceholderText(/search in loans/i)
      await user.type(searchInput, 'First')

      // After search, only matching loan should be visible
      expect(screen.getByTestId('loan-widget-loan1')).toBeInTheDocument()
      expect(screen.queryByTestId('loan-widget-loan2')).not.toBeInTheDocument()
    })
  })

  describe('Sort', () => {
    it('should render sort dropdown', () => {
      render(<LoansGrid loans={mockLoans} phase="loan" />)

      expect(screen.getByTestId('sort-loans')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('should render loans in grid layout', () => {
      render(<LoansGrid loans={mockLoans} phase="loan" />)

      const grid = document.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-1')
    })
  })
})
