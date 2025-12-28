import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Use vi.hoisted() to ensure mock is available when vi.mock is hoisted
const { mockFetchBoxByTokenId } = vi.hoisted(() => ({
  mockFetchBoxByTokenId: vi.fn(),
}))

// Mock the exle module before importing route
vi.mock('@/lib/exle/exle', () => ({
  fetchBoxByTokenId: mockFetchBoxByTokenId,
}))

// Import route AFTER mock setup
import { GET } from './route'

// Mock loan ID (64 hex chars)
const MOCK_LOAN_ID = '05692a2965c6bab42ef7e440ce25108e7f5cad42ec97ea7fe4fc6d55b7119141'

// JSON-serializable mock box (no BigInt values)
const mockBoxSerializable = {
  boxId: 'lend123box456id789abc0123456789abcdef0123456789abcdef01234567890',
  transactionId: 'tx123',
  index: 0,
  value: '1000000000',
  creationHeight: 999990,
  assets: [{ tokenId: MOCK_LOAN_ID, amount: '1' }],
}

describe('GET /api/blockchain/boxes/[tokenId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = () => {
    return new NextRequest('http://localhost/api/blockchain/boxes/' + MOCK_LOAN_ID)
  }

  const createParams = (tokenId: string) => ({
    params: Promise.resolve({ tokenId }),
  })

  it('should return box on success', async () => {
    mockFetchBoxByTokenId.mockResolvedValue(mockBoxSerializable)

    const response = await GET(createRequest(), createParams(MOCK_LOAN_ID))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.boxId).toBeDefined()
    expect(mockFetchBoxByTokenId).toHaveBeenCalledWith(MOCK_LOAN_ID)
  })

  it('should include cache headers', async () => {
    mockFetchBoxByTokenId.mockResolvedValue(mockBoxSerializable)

    const response = await GET(createRequest(), createParams(MOCK_LOAN_ID))

    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=10, stale-while-revalidate=30'
    )
  })

  it('should return 400 for invalid token ID format', async () => {
    const response = await GET(createRequest(), createParams('invalid-short-id'))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid token ID format')
  })

  it('should return 400 for empty token ID', async () => {
    const response = await GET(createRequest(), createParams(''))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid token ID format')
  })

  it('should return 404 when box not found', async () => {
    mockFetchBoxByTokenId.mockResolvedValue(null)

    const response = await GET(createRequest(), createParams(MOCK_LOAN_ID))
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Box not found')
  })

  it('should return 500 on fetch error', async () => {
    mockFetchBoxByTokenId.mockRejectedValue(new Error('Network error'))

    const response = await GET(createRequest(), createParams(MOCK_LOAN_ID))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch box')
  })
})
