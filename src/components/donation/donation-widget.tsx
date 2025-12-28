'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Coins, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shortenAddress, cn } from '@/lib/utils'
import { useExleStore } from '@/stores/useExleStore'
import type { Donation } from '@/lib/exle/exle'

interface DonationWidgetProps {
  donation: Donation
}

export function DonationWidget({ donation }: DonationWidgetProps) {
  const withdrawFromRepaymentAsLender = useExleStore((state) => state.withdrawFromRepaymentAsLender)
  const withdrawFromCrowdfundAsLender = useExleStore((state) => state.withdrawFromCrowdfundAsLender)
  const loadExleHistory = useExleStore((state) => state.loadExleHistory)

  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successTxId, setSuccessTxId] = useState<string | null>(null)

  const canWithdraw = donation.status === 'Fully Repaid' || donation.status === 'Cancelled'
  const isCrowdloan = donation.type === 'Crowdloan'

  const getStatusColor = () => {
    switch (donation.status) {
      case 'Fully Repaid':
        return 'bg-green-500 text-white'
      case 'Partialy Repaid':
      case 'In repayment':
        return 'bg-indigo-600 text-white'
      case 'Fully Funded':
        return 'bg-amber-500 text-white'
      case 'Funding':
        return 'bg-blue-500 text-white'
      case 'Cancelled':
        return 'bg-red-500 text-white'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = () => {
    switch (donation.status) {
      case 'Fully Repaid':
        return <CheckCircle className="h-4 w-4" />
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatAmount = () => {
    // Convert bigint to display value (assuming 2 decimals for SigUSD)
    const decimals = donation.ticker === 'SigUSD' ? 2 : 9
    const divisor = BigInt(Math.pow(10, decimals))
    const whole = donation.amount / divisor
    const fraction = donation.amount % divisor

    if (fraction === 0n) {
      return `${whole.toString()} ${donation.ticker}`
    }

    const fractionStr = fraction.toString().padStart(decimals, '0')
    return `${whole.toString()}.${fractionStr.replace(/0+$/, '')} ${donation.ticker}`
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    setError(null)
    setSuccessTxId(null)

    try {
      let txId: string | null = null

      if (isCrowdloan) {
        // For Crowdfund, use the loanId as the crowdfund box identifier
        txId = await withdrawFromCrowdfundAsLender(donation.loanId)
      } else {
        // For Solofund, withdraw from repayment
        txId = await withdrawFromRepaymentAsLender(donation.loanId)
      }

      if (txId) {
        setSuccessTxId(txId)
        // Refresh donation data
        await loadExleHistory()
      } else {
        throw new Error('Transaction failed - no transaction ID returned')
      }
    } catch (err) {
      console.error('Withdraw error:', err)
      setError(err instanceof Error ? err.message : 'Failed to withdraw')
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-border p-6 px-5 transition-colors hover:border-primary/50">
      <div className="mb-2 flex items-center justify-between text-xs font-thin text-muted-foreground">
        <span>Loan ID: {shortenAddress(donation.loanId)}</span>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            getStatusColor()
          )}
        >
          {getStatusIcon()}
          {donation.status}
        </span>
      </div>

      <h3 className="mb-3 text-xl font-medium">{donation.title}</h3>

      <div className="mb-4 flex items-center gap-2 text-muted-foreground">
        <Coins className="h-5 w-5" />
        <span className="text-sm">Your contribution:</span>
        <span className="font-medium text-foreground">{formatAmount()}</span>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            'rounded-md px-2 py-1',
            isCrowdloan ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
          )}
        >
          {donation.type}
        </span>
      </div>

      {successTxId && (
        <div className="mb-4 rounded-lg border border-green-500 bg-green-500/10 p-3">
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Withdrawal successful!</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            TX: {shortenAddress(successTxId, 10)}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Link href={`/loans/${donation.loanId}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Loan
          </Button>
        </Link>

        {canWithdraw && !successTxId && (
          <Button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="flex-1 bg-exle-accent hover:bg-exle-accent/90"
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Withdrawing...
              </>
            ) : (
              'Withdraw'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
