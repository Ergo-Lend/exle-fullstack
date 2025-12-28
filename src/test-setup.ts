import '@testing-library/jest-dom'
import { Buffer } from 'buffer'

// Polyfill Buffer for browser environment
globalThis.Buffer = Buffer
