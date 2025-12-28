import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'
import { mockErgoTransaction } from '@/lib/exle/__mocks__/mockdata'

// Mock the exle module
vi.mock('@/lib/exle/exle', () => ({
  fetchLoanHistory: vi.fn(),
  isExleTx: vi.fn(),
  txToHistoryItem: vi.fn(),
}))

import { fetchLoanHistory, isExleTx, txToHistoryItem } from '@/lib/exle/exle'

describe('GET /api/blockchain/history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (params: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/blockchain/history')
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return new NextRequest(url)
  }

  const mockHistoryItem = {
    txId: 'tx123',
    type: 'create',
    amount: '100 SigUSD',
    timestamp: 1703721600000,
  }

  it('should return history items on success', async () => {
    vi.mocked(fetchLoanHistory).mockResolvedValue([mockErgoTransaction])
    vi.mocked(isExleTx).mockReturnValue(true)
    vi.mocked(txToHistoryItem).mockReturnValue(mockHistoryItem)

    const response = await GET(createRequest())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.items).toHaveLength(1)
    expect(data.offset).toBe(0)
    expect(data.limit).toBe(50)
    expect(data.count).toBe(1)
  })

  it('should include cache headers', async () => {
    vi.mocked(fetchLoanHistory).mockResolvedValue([])

    const response = await GET(createRequest())

    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=60, stale-while-revalidate=120'
    )
  })

  it('should use default offset and limit', async () => {
    vi.mocked(fetchLoanHistory).mockResolvedValue([])

    await GET(createRequest())

    expect(fetchLoanHistory).toHaveBeenCalledWith(0, 50)
  })

  it('should use custom offset and limit', async () => {
    vi.mocked(fetchLoanHistory).mockResolvedValue([])

    await GET(createRequest({ offset: '10', limit: '25' }))

    expect(fetchLoanHistory).toHaveBeenCalledWith(10, 25)
  })

  it('should cap limit at 100', async () => {
    vi.mocked(fetchLoanHistory).mockResolvedValue([])

    await GET(createRequest({ limit: '500' }))

    expect(fetchLoanHistory).toHaveBeenCalledWith(0, 100)
  })

  it('should filter non-Exle transactions', async () => {
    vi.mocked(fetchLoanHistory).mockResolvedValue([mockErgoTransaction, mockErgoTransaction])
    vi.mocked(isExleTx)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false) // This one should be filtered
    vi.mocked(txToHistoryItem).mockReturnValue(mockHistoryItem)

    const response = await GET(createRequest())
    const data = await response.json()

    expect(data.items).toHaveLength(1)
  })

  it('should filter null history items', async () => {
    vi.mocked(fetchLoanHistory).mockResolvedValue([mockErgoTransaction, mockErgoTransaction])
    vi.mocked(isExleTx).mockReturnValue(true)
    vi.mocked(txToHistoryItem)
      .mockReturnValueOnce(mockHistoryItem)
      .mockReturnValueOnce(null) // This one should be filtered

    const response = await GET(createRequest())
    const data = await response.json()

    expect(data.items).toHaveLength(1)
  })

  it('should return empty array when no history exists', async () => {
    vi.mocked(fetchLoanHistory).mockResolvedValue([])

    const response = await GET(createRequest())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.items).toHaveLength(0)
    expect(data.count).toBe(0)
  })

  it('should return 500 on fetch error', async () => {
    vi.mocked(fetchLoanHistory).mockRejectedValue(new Error('Network error'))

    const response = await GET(createRequest())
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch history')
  })
})
