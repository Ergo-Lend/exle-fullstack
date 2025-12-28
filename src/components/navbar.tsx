'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { ExleLogo } from './exle-logo'
import { ThemeToggle } from './theme-toggle'
import { ConnectWalletButton } from './connect-wallet-button'
import { MyAccountButton } from './my-account-button'
import { useExleStore } from '@/stores/useExleStore'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

const links = [
  { name: 'Loans', href: '/loans' },
  { name: 'Repayments', href: '/repayments' },
]

export function Navbar() {
  const changeAddress = useExleStore((state) => state.changeAddress)

  return (
    <nav className="w-full border-b text-sm font-normal border-border">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between p-4 xl:px-0">
        {/* Logo and Desktop Links */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center gap-1 font-semibold">
            <ExleLogo />
            EXLE
          </Link>
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-exle-secondary hidden md:block"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-4 mt-8">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-lg hover:text-exle-secondary"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-4 mt-4">
                  <ThemeToggle />
                  {changeAddress ? <MyAccountButton /> : <ConnectWalletButton />}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center space-x-3 md:flex">
          <ThemeToggle />
          {changeAddress ? <MyAccountButton /> : <ConnectWalletButton />}
        </div>
      </div>
    </nav>
  )
}
