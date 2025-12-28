'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useExleStore } from '@/stores/useExleStore'
import { EmptyLoans } from '@/components/loan/empty-loans'
import { DonationWidget } from '@/components/donation/donation-widget'

export default function MyDonationsPage() {
  const changeAddress = useExleStore((state) => state.changeAddress)
  const getMyDonations = useExleStore((state) => state.getMyDonations)
  const loadExleHistory = useExleStore((state) => state.loadExleHistory)
  const isLoading = useExleStore((state) => state.isLoading)
  const exleMetadata = useExleStore((state) => state.exleMetadata)

  // Load history when wallet is connected
  useEffect(() => {
    if (changeAddress && !exleMetadata) {
      loadExleHistory()
    }
  }, [changeAddress, exleMetadata, loadExleHistory])

  const donations = getMyDonations()

  return (
    <div className="container mx-auto py-8 px-4 xl:px-0">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-exle-accent to-exle-secondary bg-clip-text text-transparent">
          My Donations
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {donations.length > 0
            ? `${donations.length} loan${donations.length !== 1 ? 's' : ''} funded by you`
            : 'View loans you have funded'}
        </p>
      </header>

      {!changeAddress ? (
        <EmptyLoans message="Connect your wallet to view your donations." />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : donations.length === 0 ? (
        <EmptyLoans message="You haven't made any donations yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {donations.map((donation) => (
            <DonationWidget key={donation.loanId} donation={donation} />
          ))}
        </div>
      )}
    </div>
  )
}
