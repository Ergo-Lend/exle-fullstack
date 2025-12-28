'use client'

import { Package } from 'lucide-react'

interface EmptyLoansProps {
  message?: string
}

export function EmptyLoans({ message = 'No loans found. Try a different search term.' }: EmptyLoansProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Package className="h-16 w-16 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
