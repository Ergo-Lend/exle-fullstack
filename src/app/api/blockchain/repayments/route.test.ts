import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import {
  mockNodeInfo,
  mockRepaymentBox,
  mockLoanRepayment,
} from '@/lib/exle/__mocks__/mockdata'

// Mock the exle module
vi.mock('@/lib/exle/exle', () => ({
  fetchRepayments: vi.fn(),
  fetchNodeInfo: vi.fn(),
  parseRepaymentBox: vi.fn(),
}))

import { fetchRepayments, fetchNodeInfo, parseRepaymentBox } from '@/lib/exle/exle'

describe('GET /api/blockchain/repayments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return parsed repayments on success', async () => {
    vi.mocked(fetchRepayments).mockResolvedValue([mockRepaymentBox])
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)
    vi.mocked(parseRepaymentBox).mockReturnValue(mockLoanRepayment)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.repayments).toHaveLength(1)
    expect(data.count).toBe(1)
    expect(data.repayments[0].phase).toBe('repayment')
  })

  it('should include cache headers', async () => {
    vi.mocked(fetchRepayments).mockResolvedValue([])
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)

    const response = await GET()

    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=30, stale-while-revalidate=60'
    )
  })

  it('should return 503 when node info is unavailable', async () => {
    vi.mocked(fetchRepayments).mockResolvedValue([mockRepaymentBox])
    vi.mocked(fetchNodeInfo).mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toBe('Failed to fetch node info')
  })

  it('should filter out null parsed repayments', async () => {
    vi.mocked(fetchRepayments).mockResolvedValue([mockRepaymentBox, mockRepaymentBox])
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)
    vi.mocked(parseRepaymentBox)
      .mockReturnValueOnce(mockLoanRepayment)
      .mockReturnValueOnce(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.repayments).toHaveLength(1)
  })

  it('should return empty array when no repayments exist', async () => {
    vi.mocked(fetchRepayments).mockResolvedValue([])
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.repayments).toHaveLength(0)
    expect(data.count).toBe(0)
  })

  it('should return 500 on fetch error', async () => {
    vi.mocked(fetchRepayments).mockRejectedValue(new Error('Network error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch repayments')
  })
})
