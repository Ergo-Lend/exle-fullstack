'use client'

import Link from 'next/link'
import { ChevronDown, LogOut } from 'lucide-react'
import { useExleStore } from '@/stores/useExleStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function MyAccountButton() {
  const disconnectWallet = useExleStore((state) => state.disconnectWallet)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-[150px] h-[31px] rounded-full bg-muted hover:opacity-90 gap-1"
        >
          My Account <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem asChild>
          <Link href="/account/loans" className="cursor-pointer">
            My Loans
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/donations" className="cursor-pointer">
            My Donations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/repayments" className="cursor-pointer">
            My Repayments
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/transactions" className="cursor-pointer">
            Transactions History
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={disconnectWallet}
          className="text-red-500 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
