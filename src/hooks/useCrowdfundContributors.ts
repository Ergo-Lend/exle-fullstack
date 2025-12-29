'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchCrowdfundContributors } from '@/lib/exle/exle'
import type { CrowdfundContributor } from '@/types/loan'

interface UseCrowdfundContributorsOptions {
  loanId: string
  loanType: string
  tokenDecimals?: number
  tokenTicker?: string
}

interface UseCrowdfundContributorsResult {
  contributors: CrowdfundContributor[]
  isLoading: boolean
  error: string | null
  reload: () => void
}

/**
 * Hook to fetch contributors for a crowdfund loan
 */
export function useCrowdfundContributors({
  loanId,
  loanType,
  tokenDecimals = 2,
  tokenTicker = 'SigUSD'
}: UseCrowdfundContributorsOptions): UseCrowdfundContributorsResult {
  const [contributors, setContributors] = useState<CrowdfundContributor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadContributors = useCallback(async () => {
    // Only fetch for crowdfund loans
    if (loanType !== 'Crowdloan') {
      setContributors([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchCrowdfundContributors(loanId, tokenDecimals, tokenTicker)
      setContributors(result)
    } catch (err) {
      console.error('Failed to fetch contributors:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch contributors')
    } finally {
      setIsLoading(false)
    }
  }, [loanId, loanType, tokenDecimals, tokenTicker])

  useEffect(() => {
    loadContributors()
  }, [loadContributors])

  return {
    contributors,
    isLoading,
    error,
    reload: loadContributors
  }
}
