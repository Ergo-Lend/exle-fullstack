'use client'

import Link from 'next/link'
import { Clock, Percent, CheckCircle } from 'lucide-react'
import { shortenAddress } from '@/lib/utils'
import type { Loan } from '@/types/loan'
import { cn } from '@/lib/utils'

interface LoanWidgetProps {
  loan: Loan
  showCreator?: boolean
}

export function LoanWidget({ loan, showCreator = true }: LoanWidgetProps) {
  const isInactive = loan.daysLeft === 0 || loan.isRepayed
  const isLoan = loan.phase === 'loan'
  const isActive = !isInactive
  const isSolofundFullyFunded = loan.loanType === 'Solofund' && loan.fundedPercentage >= 100 && isLoan

  const getProgressColor = () => {
    if (isInactive) return 'bg-gray-500'
    if (isSolofundFullyFunded) return 'bg-amber-500'
    if (isLoan) return 'bg-green-500'
    return 'bg-indigo-600'
  }

  const getTextColor = () => {
    if (isInactive) return 'text-gray-500'
    if (isLoan) return 'text-green-500'
    return 'text-indigo-600 dark:text-indigo-400'
  }

  const formatRepaidDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <Link href={`/loans/${loan.loanId}`}>
      <div className="rounded-2xl border-2 border-border p-6 px-5 hover:border-primary/50 transition-colors">
        <div className="mb-2 flex items-center justify-between text-xs font-thin text-muted-foreground">
          <span>Loan ID: {shortenAddress(loan.loanId)}</span>
          <div className="flex items-center gap-2">
            {isSolofundFullyFunded && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                Funded
              </span>
            )}
            <span>{loan.loanType}</span>
          </div>
        </div>
        <h3 className="mb-3 text-xl font-medium">{loan.loanTitle}</h3>
        <p className="mb-5 line-clamp-4 h-[90px] overflow-hidden text-sm font-thin leading-relaxed text-muted-foreground">
          {loan.loanDescription}
        </p>
        <ul className="mb-5 space-y-4 text-sm">
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
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-thin text-muted-foreground">
              {isLoan ? 'Funding Goal:' : 'Total Repayment:'}
            </span>
            <span className="font-medium">
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
              <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
                <CheckCircle className="h-4 w-4" />
                Ready for withdrawal
              </span>
            ) : loan.isRepayed ? (
              <span className="font-normal text-muted-foreground">
                {loan.repaidDate
                  ? `Repaid on ${formatRepaidDate(loan.repaidDate)}`
                  : 'Fully repaid'}
              </span>
            ) : (
              <span className="font-normal text-muted-foreground">
                {loan.daysLeft} Days Left
              </span>
            )}
          </div>
        </div>
        {showCreator && (
          <p className="mt-5 text-xs font-thin text-muted-foreground">
            Created by: {shortenAddress(loan.creator)}
          </p>
        )}
      </div>
    </Link>
  )
}
