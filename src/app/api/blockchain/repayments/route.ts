import { NextResponse } from 'next/server'
import { fetchRepayments, fetchNodeInfo, parseRepaymentBox } from '@/lib/exle/exle'

/**
 * GET /api/blockchain/repayments
 * Get all active repayment boxes from the blockchain
 */
export async function GET() {
  try {
    const [repaymentBoxes, nodeInfo] = await Promise.all([
      fetchRepayments(),
      fetchNodeInfo(),
    ])

    if (!nodeInfo) {
      return NextResponse.json(
        { error: 'Failed to fetch node info' },
        { status: 503 }
      )
    }

    // Parse each repayment box into a structured object
    const repayments = repaymentBoxes
      .map((box) => parseRepaymentBox(box, nodeInfo))
      .filter((repayment): repayment is NonNullable<typeof repayment> => repayment !== null)

    return NextResponse.json(
      { repayments, count: repayments.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch repayments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repayments' },
      { status: 500 }
    )
  }
}
