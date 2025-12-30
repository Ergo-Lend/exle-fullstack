import { NextRequest, NextResponse } from 'next/server'
import { checkTransactionStatus } from '@/lib/exle/exle'

/**
 * POST /api/transactions/status
 * Check the status of a transaction
 * Body: { txId: string }
 * Returns: { status: 'pending' | 'confirmed' | 'not_found' }
 */
export async function POST(request: NextRequest) {
  try {
    const { txId } = await request.json()

    if (!txId || typeof txId !== 'string') {
      return NextResponse.json(
        { error: 'txId is required and must be a string' },
        { status: 400 }
      )
    }

    const status = await checkTransactionStatus(txId)

    return NextResponse.json({ txId, status })
  } catch (error) {
    console.error('Transaction status check failed:', error)
    return NextResponse.json(
      {
        error: 'Transaction status check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
