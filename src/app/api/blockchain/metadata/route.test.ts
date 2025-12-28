import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted() to ensure mock is available when vi.mock is hoisted
const { mockFetchAllExleMetadata } = vi.hoisted(() => ({
  mockFetchAllExleMetadata: vi.fn(),
}))

// Mock the exle module before importing route
vi.mock('@/lib/exle/exle', () => ({
  fetchAllExleMetadata: mockFetchAllExleMetadata,
}))

// Import route AFTER mock setup
import { GET } from './route'

// JSON-serializable mock metadata (no BigInt values)
const mockMetadataSerializable = {
  nodeInfo: {
    fullHeight: 1000000,
    headersHeight: 1000000,
    network: 'mainnet',
    appVersion: '5.0.4',
  },
  loanBoxes: [{ boxId: 'loan123', value: '1000000000' }],
  repaymentBoxes: [{ boxId: 'repay123', value: '500000000' }],
  crowdfundBoxes: [{ boxId: 'crowd123', value: '2000000000' }],
}

describe('GET /api/blockchain/metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all metadata on success', async () => {
    mockFetchAllExleMetadata.mockResolvedValue(mockMetadataSerializable)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.nodeInfo).toBeDefined()
    expect(data.loanBoxes).toBeDefined()
    expect(data.repaymentBoxes).toBeDefined()
    expect(data.crowdfundBoxes).toBeDefined()
  })

  it('should include cache headers', async () => {
    mockFetchAllExleMetadata.mockResolvedValue(mockMetadataSerializable)

    const response = await GET()

    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=30, stale-while-revalidate=60'
    )
  })

  it('should return metadata with expected structure', async () => {
    mockFetchAllExleMetadata.mockResolvedValue(mockMetadataSerializable)

    const response = await GET()
    const data = await response.json()

    expect(data.nodeInfo.fullHeight).toBe(1000000)
    expect(Array.isArray(data.loanBoxes)).toBe(true)
    expect(Array.isArray(data.repaymentBoxes)).toBe(true)
    expect(Array.isArray(data.crowdfundBoxes)).toBe(true)
  })

  it('should return 500 on fetch error', async () => {
    mockFetchAllExleMetadata.mockRejectedValue(new Error('Network error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch metadata')
  })
})
