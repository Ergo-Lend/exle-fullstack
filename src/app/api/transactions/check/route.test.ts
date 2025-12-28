import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock the exle module
vi.mock('@/lib/exle/exle', () => ({
  checkTransaction: vi.fn(),
}))

import { checkTransaction } from '@/lib/exle/exle'

describe('POST /api/transactions/check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body: unknown) => {
    return new NextRequest('http://localhost/api/transactions/check', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  const validTransaction = {
    id: 'tx123',
    inputs: [{ boxId: 'input1' }],
    outputs: [{ boxId: 'output1' }],
  }

  it('should check transaction successfully', async () => {
    vi.mocked(checkTransaction).mockResolvedValue({ valid: true })

    const response = await POST(createRequest(validTransaction))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.valid).toBe(true)
    expect(checkTransaction).toHaveBeenCalledWith(validTransaction)
  })

  it('should return validation errors', async () => {
    vi.mocked(checkTransaction).mockResolvedValue({
      valid: false,
      errors: ['Insufficient funds'],
    })

    const response = await POST(createRequest(validTransaction))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.valid).toBe(false)
    expect(data.errors).toContain('Insufficient funds')
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

  it('should return 500 on check error', async () => {
    vi.mocked(checkTransaction).mockRejectedValue(new Error('Validation failed'))

    const response = await POST(createRequest(validTransaction))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Transaction check failed')
    expect(data.details).toBe('Validation failed')
  })

  it('should handle unknown error type', async () => {
    vi.mocked(checkTransaction).mockRejectedValue('Unknown error')

    const response = await POST(createRequest(validTransaction))
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Transaction check failed')
    expect(data.details).toBe('Unknown error')
  })
})
