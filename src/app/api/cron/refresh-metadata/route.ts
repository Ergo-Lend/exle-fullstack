import { NextRequest, NextResponse } from 'next/server'
import { fetchAllExleMetadata } from '@/lib/exle/exle'

// In-memory cache for metadata (use Redis/KV in production)
let cachedMetadata: Awaited<ReturnType<typeof fetchAllExleMetadata>> | null = null
let lastRefresh: number = 0

export function getCachedMetadata() {
  return cachedMetadata
}

export function getLastRefresh() {
  return lastRefresh
}

/**
 * GET /api/cron/refresh-metadata
 * Cron job to refresh blockchain metadata cache
 * Runs every 5 minutes on Vercel
 */
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const startTime = Date.now()
    const metadata = await fetchAllExleMetadata()
    const duration = Date.now() - startTime

    // Update cache
    cachedMetadata = metadata
    lastRefresh = Date.now()

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      stats: {
        nodeHeight: metadata.nodeInfo?.fullHeight || 0,
        loanBoxes: metadata.loanBoxes?.length || 0,
        repaymentBoxes: metadata.repaymentBoxes?.length || 0,
        crowdfundBoxes: metadata.crowdfundBoxes?.length || 0,
      },
    }

    console.log('[CRON] Metadata refresh completed:', summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[CRON] Metadata refresh failed:', error)
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
