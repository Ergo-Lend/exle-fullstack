import { describe, it, expect } from 'vitest'
import { cn, shortenAddress, formatErg, formatToken } from './utils'

describe('cn (classNames utility)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should merge Tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('should handle undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })
})

describe('shortenAddress', () => {
  it('should shorten a long address', () => {
    const address = '9euvZDx78vhK5k1wBXsNvVFGc5cnoSasnXCzANpaawQveDCHLbU'
    const shortened = shortenAddress(address)
    // Default is 6 chars from start and 6 from end
    expect(shortened).toBe('9euvZD...DCHLbU')
    expect(shortened.length).toBeLessThan(address.length)
  })

  it('should return empty string for empty input', () => {
    expect(shortenAddress('')).toBe('')
  })

  it('should handle custom char count', () => {
    const address = '9euvZDx78vhK5k1wBXsNvVFGc5cnoSasnXCzANpaawQveDCHLbU'
    const shortened = shortenAddress(address, 10)
    // 10 chars from start and 10 from end
    expect(shortened).toBe('9euvZDx78v...wQveDCHLbU')
  })

  it('should return original if short enough', () => {
    const shortAddress = '1234567890'
    expect(shortenAddress(shortAddress)).toBe(shortAddress)
  })
})

describe('formatErg', () => {
  it('should convert nanoErg to Erg', () => {
    expect(formatErg(1_000_000_000n)).toBe('1')
  })

  it('should handle large amounts', () => {
    expect(formatErg(10_000_000_000n)).toBe('10')
  })

  it('should handle small amounts', () => {
    expect(formatErg(100_000_000n)).toBe('0.1')
  })

  it('should handle zero', () => {
    expect(formatErg(0n)).toBe('0')
  })

  it('should handle fractional amounts', () => {
    const result = formatErg(1_234_567_890n)
    expect(result).toContain('1.234')
  })
})

describe('formatToken', () => {
  it('should format token with 2 decimals', () => {
    expect(formatToken(1000n, 2)).toBe('10')
  })

  it('should format token with 9 decimals (ERG)', () => {
    expect(formatToken(1_000_000_000n, 9)).toBe('1')
  })

  it('should handle zero', () => {
    expect(formatToken(0n, 2)).toBe('0')
  })

  it('should format with fractional parts', () => {
    const result = formatToken(150n, 2)
    expect(result).toBe('1.5')
  })
})
