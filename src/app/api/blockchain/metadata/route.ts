import { NextResponse } from 'next/server'
import { fetchAllExleMetadata } from '@/lib/exle/exle'

/**
 * GET /api/blockchain/metadata
 * Get all Exle metadata in a single call:
 * - Node info
 * - Service box
 * - All lend boxes
 * - All repayment boxes
 * - All crowdfund boxes
 */
export async function GET() {
  try {
    const metadata = await fetchAllExleMetadata()

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Failed to fetch metadata:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    )
  }
}
