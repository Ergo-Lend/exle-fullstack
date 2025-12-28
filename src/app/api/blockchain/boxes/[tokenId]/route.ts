import { NextRequest, NextResponse } from 'next/server'
import { fetchBoxByTokenId } from '@/lib/exle/exle'

interface RouteParams {
  params: Promise<{
    tokenId: string
  }>
}

/**
 * GET /api/blockchain/boxes/[tokenId]
 * Get unspent box by token ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { tokenId } = await params

  if (!tokenId || tokenId.length !== 64) {
    return NextResponse.json(
      { error: 'Invalid token ID format' },
      { status: 400 }
    )
  }

  try {
    const box = await fetchBoxByTokenId(tokenId)

    if (!box) {
      return NextResponse.json(
        { error: 'Box not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(box, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Failed to fetch box:', error)
    return NextResponse.json(
      { error: 'Failed to fetch box' },
      { status: 500 }
    )
  }
}
