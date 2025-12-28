import { NextRequest, NextResponse } from 'next/server'
import { checkTransaction, type ErgoTransaction } from '@/lib/exle/exle'

/**
 * POST /api/transactions/check
 * Verify a transaction before submission
 * Body: ErgoTransaction object
 */
export async function POST(request: NextRequest) {
  try {
    const transaction: ErgoTransaction = await request.json()

    if (!transaction || !transaction.inputs || !transaction.outputs) {
      return NextResponse.json(
        { error: 'Invalid transaction format' },
        { status: 400 }
      )
    }

    const result = await checkTransaction(transaction)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Transaction check failed:', error)
    return NextResponse.json(
      {
        error: 'Transaction check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
