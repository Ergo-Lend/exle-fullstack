import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Map transaction types to cache tags that should be invalidated
// Using simpler types that match the store's PendingTx.type
const TX_TYPE_TAGS: Record<string, string[]> = {
  // Simple types used by the store
  create: ['loans', 'metadata'],
  fund: ['loans', 'metadata', 'crowdfund'],
  repay: ['repayments', 'metadata'],
  withdraw: ['loans', 'repayments', 'metadata', 'crowdfund'],
  // More specific types for fine-grained control if needed
  'create-loan': ['loans', 'metadata'],
  'fund-loan': ['loans', 'metadata'],
  'fund-crowdfund': ['loans', 'metadata', 'crowdfund'],
  'repay-loan': ['repayments', 'metadata'],
  'withdraw-borrower': ['loans', 'repayments', 'metadata'],
  'withdraw-lender': ['repayments', 'metadata'],
  'withdraw-crowdfund': ['crowdfund', 'metadata'],
}

export type TransactionType = keyof typeof TX_TYPE_TAGS

/**
 * POST /api/revalidate
 * Invalidate specific cache tags based on transaction type
 *
 * Body: { txType: string } or { tags: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { txType, tags } = body as { txType?: string; tags?: string[] }

    // Determine which tags to invalidate
    const tagsToInvalidate = tags || (txType && TX_TYPE_TAGS[txType]) || []

    if (tagsToInvalidate.length === 0) {
      return NextResponse.json(
        { error: 'No valid tags to invalidate. Provide txType or tags.' },
        { status: 400 }
      )
    }

    // Revalidate each tag (Next.js 16+ requires cacheLife profile as second arg)
    tagsToInvalidate.forEach((tag: string) => {
      revalidateTag(tag, 'max')
    })

    return NextResponse.json({
      revalidated: true,
      tags: tagsToInvalidate,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Failed to revalidate cache:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    )
  }
}
