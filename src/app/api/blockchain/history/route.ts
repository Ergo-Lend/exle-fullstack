import { NextRequest, NextResponse } from 'next/server'
import { fetchLoanHistory, txToHistoryItem, isExleTx } from '@/lib/exle/exle'

/**
 * GET /api/blockchain/history
 * Get loan transaction history with optional pagination
 * Query params:
 *   - offset: number (default: 0)
 *   - limit: number (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const limit = Math.min(
    parseInt(searchParams.get('limit') || '50', 10),
    100
  )

  try {
    const transactions = await fetchLoanHistory(offset, limit)

    // Filter to only Exle transactions and convert to history items
    const historyItems = transactions
      .filter((tx) => isExleTx(tx))
      .map((tx) => txToHistoryItem(tx))
      .filter((item): item is NonNullable<typeof item> => item !== null)

    return NextResponse.json(
      {
        items: historyItems,
        offset,
        limit,
        count: historyItems.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
