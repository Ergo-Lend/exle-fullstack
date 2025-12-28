import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyLoans } from './empty-loans'

describe('EmptyLoans', () => {
  it('should render default message', () => {
    render(<EmptyLoans />)

    expect(screen.getByText('No loans found. Try a different search term.')).toBeInTheDocument()
  })

  it('should render custom message', () => {
    render(<EmptyLoans message="Connect your wallet to view your loans." />)

    expect(screen.getByText('Connect your wallet to view your loans.')).toBeInTheDocument()
  })

  it('should render Package icon', () => {
    render(<EmptyLoans />)

    // The Package icon renders as an SVG
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should have centered layout', () => {
    render(<EmptyLoans />)

    const container = screen.getByText(/no loans found/i).closest('div')
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
  })
})
