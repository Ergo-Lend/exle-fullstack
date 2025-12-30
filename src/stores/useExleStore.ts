'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Loan,
  AllExleMetadata,
  Donation,
  HistoryItem,
  CreateLendInputParams,
  NodeBox,
  ErgoTransaction
} from '@/lib/exle/exle'
import {
  fetchLoans,
  fetchRepayments,
  fetchNodeInfo,
  fetchAllExleMetadata,
  fetchServiceBox,
  fetchLendBox,
  fetchCrowdFundBoxesByLoanId,
  fetchBoxByTokenId,
  fetchAllCrowdfundBoxes,
  getCrowdfundLoanIds,
  getExleCrowdFundTokensAmount,
  decodeCrowdfundLoanId,
  parseLoanBox,
  parseRepaymentBox,
  donationsFromExleMetadata,
  isExleTx,
  isUserTx,
  txToHistoryItem,
  createLendTokensTx,
  preparefundLendTokensTx,
  fundRepaymentTokensTx,
  fundRepaymentTokensSruProxyTx,
  createLendCrowdfundBoxTx,
  prepareNewCrowdFundTx,
  fundCrowdFundBoxTokensTx,
  fundLendWithCrowdBoxTokensTx,
  prepareCrowdFundFromLendTx,
  prepareLendToRepaymentTokensTx,
  sendFromRepaymentBoxToLenderTokensTx,
  sendFromCrowdBoxToLenderTokensTx,
  EXLE_MINING_FEE,
  decodeExleFundingInfo,
  decodeExleLoanTokenId,
} from '@/lib/exle/exle'

// Extend Window interface for ergo wallet connector
declare global {
  interface Window {
    ergoConnector?: Record<string, {
      connect: () => Promise<boolean>
      disconnect: () => Promise<void>
    }>
    ergo?: {
      get_change_address: () => Promise<string>
      get_utxos: () => Promise<NodeBox[]>
      get_current_height: () => Promise<number>
      sign_tx: (tx: unknown) => Promise<unknown>
      submit_tx: (tx: unknown) => Promise<string>
    }
  }
}

interface TokenBalance {
  ticker: string
  amount: number
  decimals: number
}

interface ExleStore {
  // UI State
  isMobile: boolean
  isMobileMenuOpen: boolean
  isDark: boolean

  // Wallet State
  connectedWallet: string
  changeAddress: string
  tokenBalance: TokenBalance[]

  // Data State
  loans: Loan[]
  repayments: Loan[]
  exleMetadata: AllExleMetadata | null
  isLoading: boolean
  error: string | null

  // UI Actions
  setIsMobile: (value: boolean) => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  toggleTheme: () => void
  initTheme: () => void

  // Wallet Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>

  // Data Actions
  loadLoansAndRepayments: () => Promise<void>
  loadExleHistory: () => Promise<void>
  getWeb3WalletData: () => Promise<{ me: string; utxos: NodeBox[]; height: number }>

  // Transaction Actions
  createSolofundLoan: (input: CreateLendInputParams) => Promise<string | null>
  fundLoanSolo: (loanId: string) => Promise<string | null>
  repayLoan: (loanId: string, amount: bigint, isPartial: boolean) => Promise<string | null>
  withdrawLoanAsBorrower: (loanId: string) => Promise<string | null>
  withdrawFromRepaymentAsLender: (loanId: string) => Promise<string | null>

  // Crowdfund Actions
  createCrowdfundLoan: (input: CreateLendInputParams) => Promise<string | null>
  fundCrowdfund: (loanId: string, amount: bigint) => Promise<string | null>
  withdrawFromCrowdfundAsLender: (crowdfundBoxId: string) => Promise<string | null>

  // Computed (selectors)
  getMyDonations: () => Donation[]
  getMyTransactions: () => HistoryItem[]
}

export const useExleStore = create<ExleStore>()(
  persist(
    (set, get) => ({
      // Initial UI State
      isMobile: false,
      isMobileMenuOpen: false,
      isDark: true,

      // Initial Wallet State
      connectedWallet: '',
      changeAddress: '',
      tokenBalance: [
        { ticker: 'ERG', amount: 0, decimals: 9 },
        { ticker: 'SigUSD', amount: 0, decimals: 2 },
      ],

      // Initial Data State
      loans: [],
      repayments: [],
      exleMetadata: null,
      isLoading: false,
      error: null,

      // UI Actions
      setIsMobile: (value) => set({ isMobile: value }),

      toggleMobileMenu: () => set((state) => ({
        isMobileMenuOpen: !state.isMobileMenuOpen
      })),

      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      toggleTheme: () => {
        set((state) => {
          const newValue = !state.isDark
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', newValue)
            localStorage.setItem('theme', newValue ? 'dark' : 'light')
          }
          return { isDark: newValue }
        })
      },

      initTheme: () => {
        if (typeof window !== 'undefined') {
          const storedTheme = localStorage.getItem('theme') === 'dark'
          document.documentElement.classList.toggle('dark', storedTheme)
          set({ isDark: storedTheme })
        }
      },

      // Wallet Actions
      connectWallet: async () => {
        if (typeof window === 'undefined' || !window.ergoConnector) {
          console.warn('No wallet connector found')
          return
        }

        const wallets = Object.keys(window.ergoConnector)
        if (wallets.length === 0) {
          console.warn('No wallets available')
          return
        }

        try {
          const walletName = wallets[0]
          const connected = await window.ergoConnector[walletName].connect()

          if (connected && window.ergo) {
            const address = await window.ergo.get_change_address()
            set({
              connectedWallet: walletName,
              changeAddress: address
            })
          } else {
            console.warn(`Connecting ${walletName} failed`)
          }
        } catch (error) {
          console.error('Wallet connection error:', error)
          set({ error: 'Failed to connect wallet' })
        }
      },

      disconnectWallet: async () => {
        const { connectedWallet } = get()
        if (typeof window !== 'undefined' && window.ergoConnector && connectedWallet) {
          try {
            await window.ergoConnector[connectedWallet].disconnect()
          } catch {
            // Ignore disconnect errors
          }
        }
        set({ connectedWallet: '', changeAddress: '' })
      },

      // Data Actions
      loadLoansAndRepayments: async () => {
        set({ isLoading: true, error: null })

        try {
          const [loanBoxes, repaymentBoxes, crowdfundBoxes, nodeInfo] = await Promise.all([
            fetchLoans(),
            fetchRepayments(),
            fetchAllCrowdfundBoxes(),
            fetchNodeInfo(),
          ])

          if (!nodeInfo) {
            throw new Error('Failed to fetch node info')
          }

          // Get loan IDs that have crowdfund boxes (these are Crowdloan type)
          const crowdfundLoanIds = getCrowdfundLoanIds(crowdfundBoxes || [])

          // Create a map of loanId -> funded amount from crowdfund boxes
          const crowdfundFundedAmounts = new Map<string, bigint>()
          for (const cfBox of crowdfundBoxes || []) {
            const loanId = decodeCrowdfundLoanId(cfBox)
            if (loanId) {
              const fundedAmount = getExleCrowdFundTokensAmount(cfBox) ?? 0n
              crowdfundFundedAmounts.set(loanId, fundedAmount)
            }
          }

          const loans = (loanBoxes || [])
            .map((b) => {
              // The loan token ID is at assets[1], not assets[0]
              const loanTokenId = b.assets?.[1]?.tokenId
              const isCrowdloan = crowdfundLoanIds.has(loanTokenId)
              const loanType = isCrowdloan ? 'Crowdloan' : 'Solofund'
              // For crowdloans, pass the funded amount from the crowdfund box
              const crowdfundFundedAmount = isCrowdloan ? crowdfundFundedAmounts.get(loanTokenId) : undefined
              return parseLoanBox(b, nodeInfo, loanType, crowdfundFundedAmount)
            })
            .filter(Boolean) as Loan[]

          const repayments = (repaymentBoxes || [])
            .map((b) => parseRepaymentBox(b, nodeInfo))
            .filter(Boolean) as Loan[]

          set({ loans, repayments, isLoading: false })
        } catch (error) {
          console.error('Failed to load loans:', error)
          set({ error: 'Failed to load loans', isLoading: false })
        }
      },

      loadExleHistory: async () => {
        set({ isLoading: true })

        try {
          const meta = await fetchAllExleMetadata()
          if (meta) {
            set({ exleMetadata: meta, isLoading: false })
          }
        } catch (error) {
          console.error('Failed to load history:', error)
          set({ error: 'Failed to load history', isLoading: false })
        }
      },

      getWeb3WalletData: async () => {
        if (typeof window === 'undefined' || !window.ergoConnector?.nautilus) {
          throw new Error('Wallet not available')
        }

        await window.ergoConnector.nautilus.connect()
        const me = await window.ergo!.get_change_address()
        const utxos = await window.ergo!.get_utxos()
        const height = await window.ergo!.get_current_height()

        return { me, utxos, height }
      },

      // Transaction Actions
      createSolofundLoan: async (userInput) => {
        try {
          const { utxos, height } = await get().getWeb3WalletData()
          const serviceBox = await fetchServiceBox()

          if (!serviceBox) {
            throw new Error('Service box not found')
          }

          const unsignedTx = createLendTokensTx(
            userInput,
            { height, serviceBox, userUtxo: utxos }
          )

          if (!window.ergo) throw new Error('Wallet not connected')

          const signedTx = await window.ergo.sign_tx(unsignedTx)
          const txId = await window.ergo.submit_tx(signedTx)

          return txId
        } catch (error) {
          console.error('Create loan error:', error)
          throw error
        }
      },

      fundLoanSolo: async (loanId) => {
        try {
          const { utxos, height, me } = await get().getWeb3WalletData()
          const lendBox = await fetchLendBox(loanId)
          const serviceBox = await fetchServiceBox()

          if (!lendBox || !serviceBox) {
            throw new Error('Required boxes not found')
          }

          // Get funding amount from the lend box
          const fundingInfo = decodeExleFundingInfo(lendBox)
          const fundingAmount = fundingInfo.fundingGoal

          const unsignedTx = preparefundLendTokensTx(
            fundingAmount,
            me,
            utxos,
            lendBox,
            height,
            EXLE_MINING_FEE
          )

          if (!window.ergo) throw new Error('Wallet not connected')

          const signedTx = await window.ergo.sign_tx(unsignedTx)
          const txId = await window.ergo.submit_tx(signedTx)

          return txId
        } catch (error) {
          console.error('Fund loan error:', error)
          throw error
        }
      },

      repayLoan: async (loanId, amount, isPartial) => {
        try {
          const { utxos, height, me } = await get().getWeb3WalletData()
          const repaymentBox = await fetchLendBox(loanId)
          const serviceBox = await fetchServiceBox()

          if (!repaymentBox || !serviceBox) {
            throw new Error('Required boxes not found')
          }

          const unsignedTx = isPartial
            ? fundRepaymentTokensTx(
                amount,
                me,
                utxos,
                repaymentBox,
                serviceBox,
                height,
                EXLE_MINING_FEE
              )
            : fundRepaymentTokensSruProxyTx(
                amount,
                me,
                utxos,
                repaymentBox,
                height,
                EXLE_MINING_FEE
              )

          if (!window.ergo) throw new Error('Wallet not connected')

          const signedTx = await window.ergo.sign_tx(unsignedTx)
          const txId = await window.ergo.submit_tx(signedTx)

          return txId
        } catch (error) {
          console.error('Repay loan error:', error)
          throw error
        }
      },

      withdrawLoanAsBorrower: async (loanId) => {
        try {
          const { height, me } = await get().getWeb3WalletData()
          const lendBox = await fetchLendBox(loanId)
          const serviceBox = await fetchServiceBox()

          if (!lendBox || !serviceBox) {
            throw new Error('Required boxes not found')
          }

          if (!window.ergo) throw new Error('Wallet not connected')

          // Check if this is a crowdfund loan that needs merging first
          const crowdfundBoxes = await fetchCrowdFundBoxesByLoanId(loanId)
          if (crowdfundBoxes && crowdfundBoxes.length > 0) {
            const crowdfundBox = crowdfundBoxes[0]
            // Check crowdfund state (R6): 0 = funding, 1 = fully funded, 2 = repayment
            const stateHex = crowdfundBox.additionalRegisters?.R6
            // Decode SLong: format is "05xx" where xx is the value * 2
            const state = stateHex ? parseInt(stateHex.slice(2), 16) / 2 : 0

            if (state === 1) {
              // Crowdfund is fully funded but not yet merged with lend box
              // First, merge the crowdfund box with the lend box
              const mergeTx = fundLendWithCrowdBoxTokensTx(
                crowdfundBox,
                lendBox,
                height,
                EXLE_MINING_FEE
              )

              const signedMergeTx = await window.ergo.sign_tx(mergeTx)
              const mergeTxId = await window.ergo.submit_tx(signedMergeTx)

              // Return the merge tx ID - user needs to wait and click withdraw again
              // to complete the lend->repayment transition
              return mergeTxId
            }
          }

          // For solo loans OR after crowdfund merge is complete:
          // Transition the loan to repayment phase and send funds to borrower
          const unsignedTx = prepareLendToRepaymentTokensTx(
            height,
            serviceBox,
            lendBox,
            EXLE_MINING_FEE,
            me
          )

          const signedTx = await window.ergo.sign_tx(unsignedTx)
          const txId = await window.ergo.submit_tx(signedTx)

          return txId
        } catch (error) {
          console.error('Withdraw loan error:', error)
          throw error
        }
      },

      withdrawFromRepaymentAsLender: async (loanId) => {
        try {
          const { height } = await get().getWeb3WalletData()
          const repaymentBox = await fetchBoxByTokenId(loanId)

          if (!repaymentBox) {
            throw new Error('Repayment box not found')
          }

          const unsignedTx = sendFromRepaymentBoxToLenderTokensTx(
            repaymentBox,
            height,
            EXLE_MINING_FEE
          )

          if (!window.ergo) throw new Error('Wallet not connected')

          const signedTx = await window.ergo.sign_tx(unsignedTx)
          const txId = await window.ergo.submit_tx(signedTx)

          return txId
        } catch (error) {
          console.error('Withdraw from repayment error:', error)
          throw error
        }
      },

      // Crowdfund Actions
      createCrowdfundLoan: async (userInput) => {
        try {
          const { utxos, height, me } = await get().getWeb3WalletData()
          const serviceBox = await fetchServiceBox()

          if (!serviceBox) {
            throw new Error('Service box not found')
          }

          // Step 1: Create the lend box (same as Solofund)
          const unsignedLendTx = createLendTokensTx(
            userInput,
            { height, serviceBox, userUtxo: utxos }
          )

          if (!window.ergo) throw new Error('Wallet not connected')

          const signedLendTx = await window.ergo.sign_tx(unsignedLendTx) as { outputs?: Array<{ assets?: Array<{ tokenId: string }> }> }
          const lendTxId = await window.ergo.submit_tx(signedLendTx)

          // Wait a moment for the transaction to be picked up
          await new Promise((resolve) => setTimeout(resolve, 2000))

          // Step 2: Fetch the newly created lend box and service box
          const newServiceBox = await fetchServiceBox()
          const loanTokenId = signedLendTx.outputs?.[1]?.assets?.[1]?.tokenId
          if (!loanTokenId || !newServiceBox) {
            console.warn('Could not fetch new boxes for crowdfund creation, returning lend tx id')
            return lendTxId
          }

          const newLendBox = await fetchLendBox(loanTokenId)
          if (!newLendBox) {
            console.warn('Lend box not yet available, returning lend tx id')
            return lendTxId
          }

          // Step 3: Create the crowdfund box
          const newUtxos = await window.ergo.get_utxos()
          const unsignedCrowdTx = prepareNewCrowdFundTx(
            newServiceBox,
            newLendBox,
            newUtxos,
            height + 1,
            me
          )

          const signedCrowdTx = await window.ergo.sign_tx(unsignedCrowdTx)
          const crowdTxId = await window.ergo.submit_tx(signedCrowdTx)

          return crowdTxId
        } catch (error) {
          console.error('Create crowdfund loan error:', error)
          throw error
        }
      },

      fundCrowdfund: async (loanId, amount) => {
        try {
          const { utxos, height, me } = await get().getWeb3WalletData()
          const lendBox = await fetchLendBox(loanId)
          const serviceBox = await fetchServiceBox()
          const crowdfundBoxes = await fetchCrowdFundBoxesByLoanId(loanId)

          if (!lendBox || !serviceBox || crowdfundBoxes.length === 0) {
            throw new Error('Required boxes not found')
          }

          const crowdfundBox = crowdfundBoxes[0]
          const loanTokenId = decodeExleLoanTokenId(lendBox)

          // Find a suitable payment box with enough tokens
          const paymentBox = utxos.find((box) =>
            box.assets?.some((a) => a.tokenId === loanTokenId && BigInt(a.amount) >= amount)
          )

          if (!paymentBox) {
            throw new Error('No box with sufficient tokens found')
          }

          const otherUtxos = utxos.filter((box) => box.boxId !== paymentBox.boxId)

          const unsignedTx = fundCrowdFundBoxTokensTx(
            amount,
            crowdfundBox,
            lendBox,
            serviceBox,
            paymentBox,
            otherUtxos,
            height,
            EXLE_MINING_FEE,
            me
          )

          if (!window.ergo) throw new Error('Wallet not connected')

          const signedTx = await window.ergo.sign_tx(unsignedTx)
          const txId = await window.ergo.submit_tx(signedTx)

          return txId
        } catch (error) {
          console.error('Fund crowdfund error:', error)
          throw error
        }
      },

      withdrawFromCrowdfundAsLender: async (crowdfundBoxId) => {
        try {
          const { utxos, height } = await get().getWeb3WalletData()
          const crowdfundBox = await fetchBoxByTokenId(crowdfundBoxId)

          if (!crowdfundBox) {
            throw new Error('Crowdfund box not found')
          }

          const unsignedTx = sendFromCrowdBoxToLenderTokensTx(
            crowdfundBox,
            utxos,
            height,
            EXLE_MINING_FEE
          )

          if (!window.ergo) throw new Error('Wallet not connected')

          const signedTx = await window.ergo.sign_tx(unsignedTx)
          const txId = await window.ergo.submit_tx(signedTx)

          return txId
        } catch (error) {
          console.error('Withdraw from crowdfund error:', error)
          throw error
        }
      },

      // Computed Selectors
      getMyDonations: () => {
        const { exleMetadata, changeAddress } = get()
        if (!exleMetadata || !changeAddress) return []
        return donationsFromExleMetadata(exleMetadata, changeAddress)
      },

      getMyTransactions: () => {
        const { exleMetadata, changeAddress } = get()
        if (!exleMetadata || !changeAddress) return []

        const allTxs = [
          ...exleMetadata.crowdfundHistoryTxs,
          ...exleMetadata.loanHistoryTxs,
        ]

        return allTxs
          .filter((tx): tx is ErgoTransaction => tx !== null)
          .filter((tx) => isExleTx(tx))
          .filter((tx) => isUserTx(tx, changeAddress))
          .map((tx) => txToHistoryItem(tx))
          .filter(Boolean) as HistoryItem[]
      },
    }),
    {
      name: 'exle-storage',
      partialize: (state) => ({
        isDark: state.isDark,
        connectedWallet: state.connectedWallet,
        changeAddress: state.changeAddress,
      }),
    }
  )
)

// Selector hooks for common use cases
export const useLoans = () => useExleStore((state) => state.loans)
export const useRepayments = () => useExleStore((state) => state.repayments)
export const useWallet = () => useExleStore((state) => ({
  connectedWallet: state.connectedWallet,
  changeAddress: state.changeAddress,
  connect: state.connectWallet,
  disconnect: state.disconnectWallet,
}))
export const useTheme = () => useExleStore((state) => ({
  isDark: state.isDark,
  toggle: state.toggleTheme,
  init: state.initTheme,
}))
