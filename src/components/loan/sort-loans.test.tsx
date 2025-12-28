import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortLoans, type SortOption } from './sort-loans'

describe('SortLoans', () => {
  const mockOptions: SortOption[] = [
    { value: 'date_asc', label: 'Date added (asc)' },
    { value: 'date_desc', label: 'Date added (desc)' },
    { value: 'name_asc', label: 'Name (asc)' },
  ]

  const mockOnChange = vi.fn()

  it('should render with current selection label', () => {
    render(
      <SortLoans
        selectedOption="date_desc"
        onChange={mockOnChange}
        options={mockOptions}
      />
    )

    expect(screen.getByText('Date added (desc)')).toBeInTheDocument()
  })

  it('should render dropdown trigger button', () => {
    render(
      <SortLoans
        selectedOption="date_asc"
        onChange={mockOnChange}
        options={mockOptions}
      />
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should open dropdown on click', async () => {
    const user = userEvent.setup()
    render(
      <SortLoans
        selectedOption="date_asc"
        onChange={mockOnChange}
        options={mockOptions}
      />
    )

    await user.click(screen.getByRole('button'))

    // All options should be visible
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
  })

  it('should call onChange when option is selected', async () => {
    const user = userEvent.setup()
    render(
      <SortLoans
        selectedOption="date_asc"
        onChange={mockOnChange}
        options={mockOptions}
      />
    )

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Name (asc)'))

    expect(mockOnChange).toHaveBeenCalledWith('name_asc')
  })

  it('should use default options when not provided', () => {
    render(
      <SortLoans
        selectedOption="date_desc"
        onChange={mockOnChange}
      />
    )

    // Default options include date_desc
    expect(screen.getByText('Date added (desc)')).toBeInTheDocument()
  })
})
