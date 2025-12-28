import { NextRequest, NextResponse } from 'next/server'
import { fetchNodeInfo } from '@/lib/exle/exle'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    ergoNode: {
      status: 'up' | 'down'
      latency?: number
      height?: number
      error?: string
    }
    api: {
      status: 'up'
    }
  }
}

/**
 * GET /api/cron/health
 * Health check endpoint for monitoring
 * Runs every 15 minutes on Vercel
 */
export async function GET(request: NextRequest) {
  // Verify cron secret in production (optional for health endpoint)
  const authHeader = request.headers.get('authorization')
  const isCronCall = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`

  const startTime = Date.now()
  let nodeStatus: HealthStatus['checks']['ergoNode']

  try {
    const nodeInfo = await fetchNodeInfo()
    const latency = Date.now() - startTime

    if (nodeInfo) {
      nodeStatus = {
        status: 'up',
        latency,
        height: nodeInfo.fullHeight,
      }
    } else {
      nodeStatus = {
        status: 'down',
        latency,
        error: 'Node returned null response',
      }
    }
  } catch (error) {
    nodeStatus = {
      status: 'down',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  const healthStatus: HealthStatus = {
    status: nodeStatus.status === 'up' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      ergoNode: nodeStatus,
      api: { status: 'up' },
    },
  }

  if (isCronCall) {
    console.log('[CRON] Health check:', healthStatus)
  }

  const httpStatus = healthStatus.status === 'healthy' ? 200 : 503

  return NextResponse.json(healthStatus, { status: httpStatus })
}
