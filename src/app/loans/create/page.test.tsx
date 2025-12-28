import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CreateLoanPage from './page'

// Mock the LoanStepper component
vi.mock('@/components/loan/loan-stepper', () => ({
  LoanStepper: () => <div data-testid="loan-stepper">Loan Stepper</div>,
}))

describe('CreateLoanPage', () => {
  it('should render LoanStepper component', () => {
    render(<CreateLoanPage />)

    expect(screen.getByTestId('loan-stepper')).toBeInTheDocument()
  })
})
