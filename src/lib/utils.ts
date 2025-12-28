import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return ''
  if (address.length <= chars * 2) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatErg(nanoErg: bigint): string {
  const erg = Number(nanoErg) / 1e9
  return erg.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

export function formatToken(amount: bigint, decimals: number): string {
  const divisor = Math.pow(10, decimals)
  const value = Number(amount) / divisor
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals })
}
