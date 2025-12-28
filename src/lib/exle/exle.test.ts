import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  tokenByTicker,
  tickerByTokenId,
  decimalsByTokenId,
  decimalsByTicker,
  convertToBigInt,
  decodeBigInt,
  decodeUint8Array,
  jsonParseBigInt,
  isErgoAddress,
  EXLE_MINING_FEE,
  EXLE_MAX_BYTE_BOX_FEE,
  SCALA_MAX_LONG,
  type NodeBox,
} from './exle'

describe('Token Utilities', () => {
  describe('tokenByTicker', () => {
    it('should return ERG token info for "ERG" ticker', () => {
      const token = tokenByTicker('ERG')
      expect(token).toBeDefined()
      expect(token?.ticker).toBe('ERG')
      expect(token?.decimals).toBe(9)
      expect(token?.tokenId).toBe('0000000000000000000000000000000000000000000000000000000000000000')
    })

    it('should return SigUSD token info for "SigUSD" ticker', () => {
      const token = tokenByTicker('SigUSD')
      expect(token).toBeDefined()
      expect(token?.ticker).toBe('SigUSD')
      expect(token?.decimals).toBe(2)
    })

    it('should return undefined for unknown ticker', () => {
      const token = tokenByTicker('UNKNOWN')
      expect(token).toBeUndefined()
    })
  })

  describe('tickerByTokenId', () => {
    it('should return "ERG" for ERG token ID', () => {
      const ticker = tickerByTokenId('0000000000000000000000000000000000000000000000000000000000000000')
      expect(ticker).toBe('ERG')
    })

    it('should return "SigUSD" for SigUSD token ID', () => {
      const ticker = tickerByTokenId('03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04')
      expect(ticker).toBe('SigUSD')
    })

    it('should return "???" for unknown token ID', () => {
      const ticker = tickerByTokenId('unknown')
      expect(ticker).toBe('???')
    })
  })

  describe('decimalsByTokenId', () => {
    it('should return 9 for ERG token ID', () => {
      const decimals = decimalsByTokenId('0000000000000000000000000000000000000000000000000000000000000000')
      expect(decimals).toBe(9)
    })

    it('should return 2 for SigUSD token ID', () => {
      const decimals = decimalsByTokenId('03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04')
      expect(decimals).toBe(2)
    })
  })

  describe('decimalsByTicker', () => {
    it('should return 9 for ERG ticker', () => {
      const decimals = decimalsByTicker('ERG')
      expect(decimals).toBe(9)
    })

    it('should return 2 for SigUSD ticker', () => {
      const decimals = decimalsByTicker('SigUSD')
      expect(decimals).toBe(2)
    })
  })
})

describe('Constants', () => {
  it('should have correct EXLE_MINING_FEE', () => {
    expect(EXLE_MINING_FEE).toBe(1_000_000n)
  })

  it('should have correct EXLE_MAX_BYTE_BOX_FEE', () => {
    expect(EXLE_MAX_BYTE_BOX_FEE).toBe(1_474_560n)
  })

  it('should have correct SCALA_MAX_LONG', () => {
    expect(SCALA_MAX_LONG).toBe(9223372036854775807n)
  })
})

describe('Utility Functions', () => {
  describe('convertToBigInt', () => {
    it('should convert value field to BigInt', () => {
      const input = { value: 1000000000 }
      const result = convertToBigInt(input)
      expect(result.value).toBe(1000000000n)
    })

    it('should convert amount field to BigInt', () => {
      const input = { amount: 500 }
      const result = convertToBigInt(input)
      expect(result.amount).toBe(500n)
    })

    it('should handle nested objects', () => {
      const input = {
        outputs: [
          { value: 1000, amount: 100 }
        ]
      }
      const result = convertToBigInt(input)
      expect(result.outputs[0].value).toBe(1000n)
      expect(result.outputs[0].amount).toBe(100n)
    })

    it('should preserve string values with dots', () => {
      const input = { value: '10.5' }
      const result = convertToBigInt(input)
      expect(result.value).toBe('10.5')
    })

    it('should handle arrays', () => {
      const input = [{ value: 100 }, { value: 200 }]
      const result = convertToBigInt(input)
      expect(result[0].value).toBe(100n)
      expect(result[1].value).toBe(200n)
    })
  })

  describe('decodeBigInt', () => {
    it('should return empty array for undefined box', () => {
      const result = decodeBigInt(undefined, 'R4')
      expect(result).toEqual([])
    })

    it('should return empty array for missing register', () => {
      const box: NodeBox = {
        additionalRegisters: {},
        assets: [],
        boxId: 'test',
        creationHeight: 100,
        ergoTree: '00',
        index: 0,
        transactionId: 'tx1',
        value: 1000n,
      }
      const result = decodeBigInt(box, 'R4')
      expect(result).toEqual([])
    })
  })

  describe('decodeUint8Array', () => {
    it('should return empty string for undefined box', () => {
      const result = decodeUint8Array(undefined, 'R4')
      expect(result).toBe('')
    })

    it('should return empty string for missing register', () => {
      const box: NodeBox = {
        additionalRegisters: {},
        assets: [],
        boxId: 'test',
        creationHeight: 100,
        ergoTree: '00',
        index: 0,
        transactionId: 'tx1',
        value: 1000n,
      }
      const result = decodeUint8Array(box, 'R4')
      expect(result).toBe('')
    })
  })

  describe('jsonParseBigInt', () => {
    it('should parse JSON with value fields as strings', () => {
      const input = '{"value": 1000000000}'
      const result = jsonParseBigInt(input)
      expect(result.value).toBe('1000000000')
    })

    it('should parse JSON with amount fields as strings', () => {
      const input = '{"amount": 500}'
      const result = jsonParseBigInt(input)
      expect(result.amount).toBe('500')
    })

    it('should handle nested objects with value/amount', () => {
      const input = '{"outputs": [{"value": 1000, "amount": 100}]}'
      const result = jsonParseBigInt(input)
      expect(result.outputs[0].value).toBe('1000')
      expect(result.outputs[0].amount).toBe('100')
    })

    it('should preserve other numeric fields', () => {
      const input = '{"height": 12345, "value": 1000}'
      const result = jsonParseBigInt(input)
      expect(result.height).toBe(12345)
      expect(result.value).toBe('1000')
    })
  })
})

describe('Address Validation', () => {
  describe('isErgoAddress', () => {
    it('should return true for valid Ergo mainnet address', () => {
      const validAddress = '9f83nJY4x9QkHmeek6PJMcTrf2xcaHAT3j5HD5sANXibXjMUixn'
      expect(isErgoAddress(validAddress)).toBe(true)
    })

    it('should throw for invalid address', () => {
      expect(() => isErgoAddress('invalid')).toThrow()
    })
  })
})
