import { NextRequest, NextResponse } from 'next/server'
import {
  fetchLoans,
  fetchRepayments,
  fetchNodeInfo,
  parseLoanBox,
  parseRepaymentBox,
  getExleLendTokensStatus,
  getExleRepaymentTokensStatus,
  decodeExleFundingInfo,
  decodeExleRepaymentDetailsTokens,
} from '@/lib/exle/exle'

interface LoanAlert {
  loanId: string
  type: 'expired' | 'fully_funded' | 'repayment_complete' | 'overdue'
  message: string
  data?: Record<string, unknown>
}

/**
 * GET /api/cron/check-loans
 * Cron job to check loan statuses and identify actionable items
 * Runs every hour on Vercel
 */
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const startTime = Date.now()

    // Fetch all data in parallel
    const [loanBoxes, repaymentBoxes, nodeInfo] = await Promise.all([
      fetchLoans(),
      fetchRepayments(),
      fetchNodeInfo(),
    ])

    if (!nodeInfo) {
      return NextResponse.json(
        { error: 'Node unavailable' },
        { status: 503 }
      )
    }

    const currentHeight = nodeInfo.fullHeight
    const alerts: LoanAlert[] = []

    // Check active loans
    for (const box of loanBoxes) {
      const loan = parseLoanBox(box, nodeInfo)
      if (!loan) continue

      const status = getExleLendTokensStatus(box)
      const fundingInfo = decodeExleFundingInfo(box)

      // Check if loan is fully funded (fundingLevel >= 100)
      if (status.fundingLevel >= 100n) {
        alerts.push({
          loanId: loan.loanId,
          type: 'fully_funded',
          message: `Loan ${loan.loanId.slice(0, 8)}... is fully funded and ready for conversion to repayment`,
          data: {
            fundedAmount: status.fundedAmount.toString(),
            fundingGoal: fundingInfo.fundingGoal.toString(),
            fundingLevel: status.fundingLevel.toString(),
          },
        })
      }

      // Check if loan deadline passed (simplified - would need actual deadline from box)
      // This is a placeholder for deadline checking logic
    }

    // Check repayments
    for (const box of repaymentBoxes) {
      const repayment = parseRepaymentBox(box, nodeInfo)
      if (!repayment) continue

      const status = getExleRepaymentTokensStatus(box)
      const repaymentDetails = decodeExleRepaymentDetailsTokens(box)

      // Check if repayment is complete (repaymentLevel >= 100)
      if (status.repaymentLevel >= 100n) {
        alerts.push({
          loanId: repayment.loanId,
          type: 'repayment_complete',
          message: `Repayment ${repayment.loanId.slice(0, 8)}... is complete and ready for distribution`,
          data: {
            repaidAmount: repaymentDetails.repaidAmount.toString(),
            repaymentAmount: repaymentDetails.repaymentAmount.toString(),
            repaymentLevel: status.repaymentLevel.toString(),
          },
        })
      }
    }

    const duration = Date.now() - startTime

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      currentHeight,
      stats: {
        loansChecked: loanBoxes.length,
        repaymentsChecked: repaymentBoxes.length,
        alertsGenerated: alerts.length,
      },
      alerts,
    }

    console.log('[CRON] Loan check completed:', {
      ...summary,
      alerts: alerts.length > 0 ? alerts : 'none',
    })

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[CRON] Loan check failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
