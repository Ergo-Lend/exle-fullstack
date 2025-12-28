import { NextRequest, NextResponse } from 'next/server'
import { submitTransaction, type ErgoTransaction } from '@/lib/exle/exle'

/**
 * POST /api/transactions/submit
 * Submit a signed transaction to the blockchain
 * Body: ErgoTransaction object (must be signed)
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

    const result = await submitTransaction(transaction)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Transaction submission failed:', error)
    return NextResponse.json(
      {
        error: 'Transaction submission failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
