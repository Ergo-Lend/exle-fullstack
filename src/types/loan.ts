export interface Loan {
  phase: 'loan' | 'repayment'
  loanId: string
  loanType: string
  loanTitle: string
  loanDescription: string
  repaymentPeriod: string
  interestRate: string
  fundingGoal: string
  fundingToken: string
  fundedAmount: string
  fundedPercentage: number
  daysLeft: number
  creator: string
  isReadyForWithdrawal?: boolean
  isRepayed?: boolean
}
