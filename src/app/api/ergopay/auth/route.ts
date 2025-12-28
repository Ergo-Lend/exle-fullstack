import { NextRequest, NextResponse } from 'next/server'

// Session storage with TTL (in-memory for development, use Redis/KV in production)
interface AuthSession {
  address: string
  timestamp: number
}

const sessions = new Map<string, AuthSession>()
const SESSION_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Clean up expired sessions periodically
function cleanExpiredSessions() {
  const now = Date.now()
  for (const [id, session] of sessions.entries()) {
    if (now - session.timestamp > SESSION_TTL_MS) {
      sessions.delete(id)
    }
  }
}

// Run cleanup every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredSessions, 60_000)
}

/**
 * GET /api/ergopay/auth?id=sessionId
 * Poll for wallet connection status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing session id' }, { status: 400 })
  }

  const session = sessions.get(id)

  if (!session) {
    return NextResponse.json({ address: null, status: 'pending' })
  }

  // Check if session is expired
  if (Date.now() - session.timestamp > SESSION_TTL_MS) {
    sessions.delete(id)
    return NextResponse.json({ address: null, status: 'expired' })
  }

  return NextResponse.json({
    address: session.address,
    status: 'connected'
  })
}

/**
 * POST /api/ergopay/auth
 * Set wallet address for session (called by ErgoPay wallet)
 * Body: { id: string, address: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, address } = body

    if (!id || !address) {
      return NextResponse.json(
        { error: 'Missing id or address' },
        { status: 400 }
      )
    }

    // Store the session
    sessions.set(id, {
      address,
      timestamp: Date.now(),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/ergopay/auth?id=sessionId
 * Clear a session
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    sessions.delete(id)
  }

  return NextResponse.json({ success: true })
}
