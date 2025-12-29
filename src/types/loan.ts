export interface CrowdfundContributor {
  address: string
  amount: string // Formatted amount with token ticker (e.g., "0.50 SigUSD")
  rawAmount: bigint // Raw amount for calculations
  timestamp: number
  txId: string
}

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
  contributors?: CrowdfundContributor[]
}
