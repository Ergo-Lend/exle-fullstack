import { NextResponse } from 'next/server'
import { fetchNodeInfo } from '@/lib/exle/exle'

/**
 * GET /api/blockchain/info
 * Get current Ergo node info (height, network state, etc.)
 */
export async function GET() {
  try {
    const nodeInfo = await fetchNodeInfo()

    return NextResponse.json(nodeInfo, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Failed to fetch node info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch node info' },
      { status: 500 }
    )
  }
}
