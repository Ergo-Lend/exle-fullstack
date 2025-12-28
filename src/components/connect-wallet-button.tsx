'use client'

import { useExleStore } from '@/stores/useExleStore'
import { Button } from '@/components/ui/button'

export function ConnectWalletButton() {
  const connectWallet = useExleStore((state) => state.connectWallet)

  return (
    <Button
      onClick={connectWallet}
      className="w-[150px] h-[31px] rounded-full bg-exle-accent text-white hover:opacity-90"
    >
      Connect wallet
    </Button>
  )
}
