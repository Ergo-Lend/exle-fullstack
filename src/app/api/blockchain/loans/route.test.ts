import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import {
  mockNodeInfo,
  mockLendBoxUnfunded,
  mockLendBoxFunded,
  mockLoanUnfunded,
  mockLoanFunded,
} from '@/lib/exle/__mocks__/mockdata'

// Mock the exle module
vi.mock('@/lib/exle/exle', () => ({
  fetchLoans: vi.fn(),
  fetchNodeInfo: vi.fn(),
  parseLoanBox: vi.fn(),
}))

import { fetchLoans, fetchNodeInfo, parseLoanBox } from '@/lib/exle/exle'

describe('GET /api/blockchain/loans', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return parsed loans on success', async () => {
    vi.mocked(fetchLoans).mockResolvedValue([mockLendBoxUnfunded, mockLendBoxFunded])
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)
    vi.mocked(parseLoanBox)
      .mockReturnValueOnce(mockLoanUnfunded)
      .mockReturnValueOnce(mockLoanFunded)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.loans).toHaveLength(2)
    expect(data.count).toBe(2)
    expect(data.loans[0].loanTitle).toBe('My Loan')
  })

  it('should include cache headers', async () => {
    vi.mocked(fetchLoans).mockResolvedValue([])
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)

    const response = await GET()

    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=30, stale-while-revalidate=60'
    )
  })

  it('should return 503 when node info is unavailable', async () => {
    vi.mocked(fetchLoans).mockResolvedValue([mockLendBoxUnfunded])
    vi.mocked(fetchNodeInfo).mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toBe('Failed to fetch node info')
  })

  it('should filter out null parsed loans', async () => {
    vi.mocked(fetchLoans).mockResolvedValue([mockLendBoxUnfunded, mockLendBoxFunded])
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)
    vi.mocked(parseLoanBox)
      .mockReturnValueOnce(mockLoanUnfunded)
      .mockReturnValueOnce(null) // This one should be filtered

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.loans).toHaveLength(1)
    expect(data.count).toBe(1)
  })

  it('should return empty array when no loans exist', async () => {
    vi.mocked(fetchLoans).mockResolvedValue([])
    vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.loans).toHaveLength(0)
    expect(data.count).toBe(0)
  })

  it('should return 500 on fetch error', async () => {
    vi.mocked(fetchLoans).mockRejectedValue(new Error('Network error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch loans')
  })
})
