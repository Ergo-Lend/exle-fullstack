'use client'

import { ChevronDown, ArrowUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface SortOption {
  value: string
  label: string
}

const defaultOptions: SortOption[] = [
  { value: 'date_asc', label: 'Date added (asc)' },
  { value: 'date_desc', label: 'Date added (desc)' },
  { value: 'funding_asc', label: 'Funding Goal (asc)' },
  { value: 'funding_desc', label: 'Funding Goal (desc)' },
  { value: 'name_asc', label: 'Name (asc)' },
  { value: 'name_desc', label: 'Name (desc)' },
  { value: 'interest_asc', label: 'Interest Rate (asc)' },
  { value: 'interest_desc', label: 'Interest Rate (desc)' },
  { value: 'repaid_asc', label: 'Repaid Percentage (asc)' },
  { value: 'repaid_desc', label: 'Repaid Percentage (desc)' },
]

interface SortLoansProps {
  selectedOption: string
  onChange: (value: string) => void
  options?: SortOption[]
}

export function SortLoans({
  selectedOption,
  onChange,
  options = defaultOptions,
}: SortLoansProps) {
  const currentLabel = options.find((o) => o.value === selectedOption)?.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-[240px] justify-start gap-2 h-[31px] px-2">
          <ArrowUpDown className="h-4 w-4" />
          {currentLabel}
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="cursor-pointer"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
