'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Percent, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { shortenAddress, cn } from '@/lib/utils'
import { useExleStore } from '@/stores/useExleStore'
import { tokenByTicker } from '@/lib/exle/exle'
import type { Loan } from '@/types/loan'

interface LoanDetailsProps {
  loan: Loan
}

export function LoanDetails({ loan }: LoanDetailsProps) {
  const router = useRouter()
  const changeAddress = useExleStore((state) => state.changeAddress)
  const fundLoanSolo = useExleStore((state) => state.fundLoanSolo)
  const fundCrowdfund = useExleStore((state) => state.fundCrowdfund)
  const repayLoan = useExleStore((state) => state.repayLoan)
  const withdrawLoanAsBorrower = useExleStore((state) => state.withdrawLoanAsBorrower)
  const withdrawFromRepaymentAsLender = useExleStore((state) => state.withdrawFromRepaymentAsLender)
  const withdrawFromCrowdfundAsLender = useExleStore((state) => state.withdrawFromCrowdfundAsLender)
  const loadLoansAndRepayments = useExleStore((state) => state.loadLoansAndRepayments)

  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successTxId, setSuccessTxId] = useState<string | null>(null)

  const isInactive = loan.daysLeft === 0 || loan.isRepayed
  const isLoan = loan.phase === 'loan'
  const isRepaymentOverdue = loan.phase === 'repayment' && loan.daysLeft === 0
  const isSolofundFullyFunded = loan.loanType === 'Solofund' && loan.fundedPercentage >= 100 && isLoan

  const getProgressColor = () => {
    if (isInactive) return 'bg-gray-500'
    if (isLoan) return 'bg-green-400'
    return 'bg-indigo-600'
  }

  const getTextColor = () => {
    if (isInactive) return 'text-gray-500'
    if (isLoan) return 'text-green-500'
    return 'text-indigo-600'
  }

  const canFundSoloFundLoan = () => {
    return (
      loan.loanType === 'Solofund' &&
      !loan.isReadyForWithdrawal &&
      loan.phase === 'loan' &&
      loan.daysLeft > 0 &&
      !isSolofundFullyFunded
    )
  }

  const canFundCrowdloan = () => {
    return (
      loan.loanType === 'Crowdloan' &&
      !loan.isReadyForWithdrawal &&
      loan.phase === 'loan' &&
      loan.daysLeft > 0 &&
      loan.fundedPercentage < 100
    )
  }

  const isCrowdloan = loan.loanType === 'Crowdloan'

  const handleAction = async () => {
    setIsSubmitting(true)
    setError(null)
    setSuccessTxId(null)

    try {
      let txId: string | null = null

      if (loan.isReadyForWithdrawal) {
        // Determine if user is borrower or lender
        const isBorrower = loan.creator === changeAddress

        if (isBorrower && isLoan) {
          // Borrower withdrawing funded loan (transitions to repayment)
          txId = await withdrawLoanAsBorrower(loan.loanId)
        } else if (!isBorrower && loan.phase === 'repayment') {
          // Lender withdrawing from fully repaid loan
          txId = await withdrawFromRepaymentAsLender(loan.loanId)
        } else {
          setError('You are not authorized to withdraw from this loan')
          return
        }
      } else if (isLoan) {
        // Fund the loan
        if (loan.loanType === 'Solofund') {
          txId = await fundLoanSolo(loan.loanId)
        } else if (loan.loanType === 'Crowdloan') {
          // For Crowdloan, use the entered amount
          const token = tokenByTicker(loan.fundingToken)
          if (!token) {
            throw new Error(`Unknown token: ${loan.fundingToken}`)
          }
          const fundAmount = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, token.decimals)))
          txId = await fundCrowdfund(loan.loanId, fundAmount)
        } else {
          setError('Unknown loan type')
          return
        }
      } else if (loan.phase === 'repayment') {
        // Repay the loan (borrower)
        const token = tokenByTicker(loan.fundingToken)
        if (!token) {
          throw new Error(`Unknown token: ${loan.fundingToken}`)
        }

        const repayAmount = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, token.decimals)))
        const isPartial = repayAmount < BigInt(Math.floor(parseFloat(loan.fundingGoal) * Math.pow(10, token.decimals)))

        txId = await repayLoan(loan.loanId, repayAmount, isPartial)
      }

      if (txId) {
        setSuccessTxId(txId)
        // Refresh loan data
        await loadLoansAndRepayments()
      } else {
        throw new Error('Transaction failed - no transaction ID returned')
      }
    } catch (err) {
      console.error('Action error:', err)
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const isActionDisabled = () => {
    if (loan.isReadyForWithdrawal) {
      // For withdrawal, borrower can withdraw funded loan, lender can withdraw from repayment
      const isBorrower = loan.creator === changeAddress
      if (isBorrower && isLoan) return false // Borrower can withdraw funded loan
      if (!isBorrower && loan.phase === 'repayment') return false // Lender can withdraw from repayment
      return true
    }
    // For Solofund, no amount input needed (full funding)
    if (canFundSoloFundLoan()) return false
    // For Crowdloan, need an amount
    if (canFundCrowdloan()) return !amount || parseFloat(amount) <= 0
    // For repayment, need an amount
    return !amount || loan.daysLeft === 0
  }

  const getButtonLabel = () => {
    if (loan.isReadyForWithdrawal) {
      const isBorrower = loan.creator === changeAddress
      if (isBorrower && isLoan) return 'Withdraw funded loan'
      return 'Withdraw repayment'
    }
    if (isLoan) {
      return isCrowdloan ? 'Contribute to loan' : 'Fund the loan'
    }
    return 'Repay the loan'
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 xl:px-0">
      <div className="mb-8 mt-10">
        <button onClick={goBack} className="hover:opacity-70 transition-opacity">
          <ArrowLeft className="h-8 w-8" />
        </button>
      </div>

      <div className="flex max-xl:flex-col xl:gap-20">
        {/* Left Column - Loan Info */}
        <div className="xl:w-1/2">
          <div className="mb-2 flex items-center justify-between text-xs font-thin">
            <div>
              <span className="text-muted-foreground">
                Loan ID: {shortenAddress(loan.loanId)}
              </span>
              <h3 className="mb-3 text-xl font-medium">{loan.loanTitle}</h3>
            </div>
            <div className="flex items-center gap-2">
              {isSolofundFullyFunded && (
                <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white">
                  Funded
                </span>
              )}
              <span className="rounded-md bg-muted px-2 py-1 text-sm">
                {loan.loanType}
              </span>
            </div>
          </div>

          <p className="mb-5 line-clamp-4 h-[90px] overflow-hidden text-sm font-light leading-relaxed text-muted-foreground">
            {loan.loanDescription}
          </p>

          <p className="font-thin text-muted-foreground">Borrower:</p>
          <p className="font-thin">{shortenAddress(loan.creator)}</p>

          <ul className="my-5 space-y-4 text-sm">
            <li className="flex items-end gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{loan.repaymentPeriod}</span>
              <span className="text-xs text-muted-foreground">Repayment Period</span>
            </li>
            <li className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{loan.interestRate}</span>
              <span className="text-xs text-muted-foreground">Interest Rate</span>
            </li>
          </ul>
        </div>

        {/* Right Column - Actions */}
        <div className="mb-5 xl:w-1/2">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-thin text-muted-foreground">
              {isLoan ? 'Funding Goal:' : 'Total Repayment:'}
            </span>
            <span className="text-lg font-semibold">
              {loan.fundingGoal} {loan.fundingToken}
            </span>
          </div>

          <div className="h-[10px] w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full transition-all', getProgressColor())}
              style={{ width: `${loan.fundedPercentage}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className={getTextColor()}>
              {loan.fundedAmount} {isLoan ? 'funded' : 'repaid'}
            </span>
            {loan.isReadyForWithdrawal ? (
              <span className="flex items-center gap-1 font-semibold text-green-500">
                <CheckCircle className="h-4 w-4" />
                Ready for withdrawal
              </span>
            ) : (
              <span className="font-normal text-muted-foreground">
                {loan.daysLeft} Days Left
              </span>
            )}
          </div>

          {!loan.isRepayed && !isRepaymentOverdue && (
            <>
              {successTxId && (
                <div className="mb-6 mt-6 rounded-lg border border-green-500 bg-green-500/10 p-4">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Transaction successful!</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Transaction ID: {shortenAddress(successTxId, 10)}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 mt-6 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-500">
                  {error}
                </div>
              )}

              {loan.isReadyForWithdrawal ? (
                <>
                  <div className="mb-4 mt-10 text-xl font-medium">Withdraw funds</div>
                  <div className="mb-10 text-muted-foreground">
                    {loan.creator === changeAddress && isLoan
                      ? 'Your loan has been fully funded and you can withdraw it now.'
                      : 'Funds are available for withdrawal.'}
                  </div>
                </>
              ) : isSolofundFullyFunded ? (
                <>
                  <div className="mb-4 mt-10 text-xl font-medium">Loan Fully Funded</div>
                  <div className="mb-10 text-muted-foreground">
                    This Solofund loan has been fully funded. The borrower can now withdraw the funds and the loan will transition to repayment phase.
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 mt-10 text-xl font-medium">
                    {isLoan ? 'Fund this loan' : 'Repay this loan'}
                  </div>
                  <div className="text-muted-foreground">
                    {loan.loanType === 'Solofund'
                      ? 'You can help fund this loan. Solofund loans can only be fully funded by one person.'
                      : loan.loanType === 'Crowdloan'
                        ? 'You can contribute any amount to this crowdfunded loan. Multiple people can fund it together.'
                        : 'Make a repayment towards this loan.'}
                  </div>
                  <div className="mb-2 mt-8">Amount</div>
                  <div className="relative mb-10 w-full">
                    {canFundSoloFundLoan() ? (
                      <Input
                        type="number"
                        readOnly
                        value={loan.fundingGoal}
                        className="pr-20"
                        disabled={isSubmitting}
                      />
                    ) : (
                      <Input
                        type="number"
                        placeholder={
                          loan.loanType === 'Solofund'
                            ? loan.fundingGoal
                            : loan.loanType === 'Crowdloan'
                              ? 'Enter amount to contribute'
                              : 'Enter repayment amount'
                        }
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pr-20"
                        disabled={isSubmitting}
                      />
                    )}
                    <span className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                      {loan.fundingToken}
                    </span>
                  </div>
                </>
              )}

              <Button
                onClick={handleAction}
                disabled={isActionDisabled() || isSubmitting}
                className="w-full rounded-full bg-exle-accent hover:bg-exle-accent/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  getButtonLabel()
                )}
              </Button>

              <div className="mt-6 text-xs font-thin text-muted-foreground">
                By clicking on &quot;{getButtonLabel()}&quot; button, you agree to our{' '}
                <Link href="/tos" className="underline">
                  terms of service
                </Link>
                .
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
