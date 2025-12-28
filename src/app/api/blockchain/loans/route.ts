import { NextResponse } from 'next/server'
import { fetchLoans, fetchNodeInfo, parseLoanBox } from '@/lib/exle/exle'

/**
 * GET /api/blockchain/loans
 * Get all active loans from the blockchain
 */
export async function GET() {
  try {
    const [loanBoxes, nodeInfo] = await Promise.all([
      fetchLoans(),
      fetchNodeInfo(),
    ])

    if (!nodeInfo) {
      return NextResponse.json(
        { error: 'Failed to fetch node info' },
        { status: 503 }
      )
    }

    // Parse each loan box into a structured Loan object
    const loans = loanBoxes
      .map((box) => parseLoanBox(box, nodeInfo))
      .filter((loan): loan is NonNullable<typeof loan> => loan !== null)

    return NextResponse.json(
      { loans, count: loans.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch loans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    )
  }
}
