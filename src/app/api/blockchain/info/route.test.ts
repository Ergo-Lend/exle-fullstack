import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { mockNodeInfo } from '@/lib/exle/__mocks__/mockdata'

// Mock the exle module
vi.mock('@/lib/exle/exle', () => ({
  fetchNodeInfo: vi.fn(),
}))

import { fetchNodeInfo } from '@/lib/exle/exle'

describe('GET /api/blockchain/info', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return node info on success', async () => {
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockNodeInfo)
    expect(data.fullHeight).toBe(1000000)
  })

  it('should include cache headers', async () => {
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)

    const response = await GET()

    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=10, stale-while-revalidate=30'
    )
  })

  it('should return 500 on fetch error', async () => {
    vi.mocked(fetchNodeInfo).mockRejectedValue(new Error('Network error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch node info')
  })

  it('should handle null response from fetchNodeInfo', async () => {
    vi.mocked(fetchNodeInfo).mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    // Returns null as valid JSON response
    expect(response.status).toBe(200)
    expect(data).toBeNull()
  })
})
