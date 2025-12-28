import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { mockSignedTx } from '@/lib/exle/__mocks__/mockdata'

// Mock the exle module
vi.mock('@/lib/exle/exle', () => ({
  submitTransaction: vi.fn(),
}))

import { submitTransaction } from '@/lib/exle/exle'

describe('POST /api/transactions/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost/api/transactions/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  const validTransaction = {
    id: 'tx123',
    inputs: [{ boxId: 'input1' }],
    outputs: [{ boxId: 'output1' }],
  }

  it('should submit transaction successfully', async () => {
    vi.mocked(submitTransaction).mockResolvedValue({ txId: 'submitted123' })

    const response = await POST(createRequest(validTransaction))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.txId).toBe('submitted123')
    expect(submitTransaction).toHaveBeenCalledWith(validTransaction)
  })

  it('should return 400 for missing inputs', async () => {
    const invalidTx = { id: 'tx123', outputs: [{ boxId: 'output1' }] }

    const response = await POST(createRequest(invalidTx))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid transaction format')
  })

  it('should return 400 for missing outputs', async () => {
    const invalidTx = { id: 'tx123', inputs: [{ boxId: 'input1' }] }

    const response = await POST(createRequest(invalidTx))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid transaction format')
  })

  it('should return 400 for null transaction', async () => {
    const response = await POST(createRequest(null))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid transaction format')
  })

  it('should return 400 for empty object', async () => {
    const response = await POST(createRequest({}))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid transaction format')
  })

  it('should return 500 on submission error', async () => {
    vi.mocked(submitTransaction).mockRejectedValue(new Error('Blockchain rejection'))

    const response = await POST(createRequest(validTransaction))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Transaction submission failed')
    expect(data.details).toBe('Blockchain rejection')
  })

  it('should handle unknown error type', async () => {
    vi.mocked(submitTransaction).mockRejectedValue('Unknown error')

    const response = await POST(createRequest(validTransaction))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Transaction submission failed')
    expect(data.details).toBe('Unknown error')
  })
})
