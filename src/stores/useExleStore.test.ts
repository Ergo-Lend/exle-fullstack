import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useExleStore } from './useExleStore'

// Mock the exle module
vi.mock('@/lib/exle/exle', () => ({
  fetchNodeInfo: vi.fn().mockResolvedValue({ fullHeight: 1000000 }),
  fetchLoans: vi.fn().mockResolvedValue([]),
  fetchRepayments: vi.fn().mockResolvedValue([]),
  fetchAllExleMetadata: vi.fn().mockResolvedValue({
    serviceBox: { value: 1000000n },
    lendBoxesSLE: [],
    repaymentBoxesSLE: [],
    crowdFundBoxesSLE: [],
  }),
  fetchServiceBox: vi.fn(),
  fetchLendBox: vi.fn(),
  fetchCrowdFundBoxesByLoanId: vi.fn(),
  parseLoanBox: vi.fn(),
  parseRepaymentBox: vi.fn(),
  donationsFromExleMetadata: vi.fn().mockReturnValue([]),
  isExleTx: vi.fn(),
  isUserTx: vi.fn(),
  txToHistoryItem: vi.fn(),
  createLendTokensTx: vi.fn(),
  preparefundLendTokensTx: vi.fn(),
  fundRepaymentTokensTx: vi.fn(),
  fundRepaymentTokensSruProxyTx: vi.fn(),
  createLendCrowdfundBoxTx: vi.fn(),
  prepareNewCrowdFundTx: vi.fn(),
  fundCrowdFundBoxTokensTx: vi.fn(),
  fundLendWithCrowdBoxTokensTx: vi.fn(),
  prepareCrowdFundFromLendTx: vi.fn(),
  prepareLendToRepaymentTokensTx: vi.fn(),
  EXLE_MINING_FEE: 1_000_000n,
  decodeExleFundingInfo: vi.fn(),
  decodeExleLoanTokenId: vi.fn(),
}))

describe('useExleStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useExleStore.setState({
      connectedWallet: '',
      changeAddress: '',
      loans: [],
      repayments: [],
      exleMetadata: null,
      isLoading: false,
      error: null,
    })
  })

  describe('Initial State', () => {
    it('should have empty changeAddress initially', () => {
      const state = useExleStore.getState()
      expect(state.changeAddress).toBe('')
    })

    it('should have empty loans array initially', () => {
      const state = useExleStore.getState()
      expect(state.loans).toEqual([])
    })

    it('should have empty repayments array initially', () => {
      const state = useExleStore.getState()
      expect(state.repayments).toEqual([])
    })

    it('should have null exleMetadata initially', () => {
      const state = useExleStore.getState()
      expect(state.exleMetadata).toBeNull()
    })

    it('should not be loading initially', () => {
      const state = useExleStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it('should have null error initially', () => {
      const state = useExleStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('Actions', () => {
    it('should have connectWallet function', () => {
      const state = useExleStore.getState()
      expect(typeof state.connectWallet).toBe('function')
    })

    it('should have disconnectWallet function', () => {
      const state = useExleStore.getState()
      expect(typeof state.disconnectWallet).toBe('function')
    })

    it('should have loadLoansAndRepayments function', () => {
      const state = useExleStore.getState()
      expect(typeof state.loadLoansAndRepayments).toBe('function')
    })

    it('should have loadExleHistory function', () => {
      const state = useExleStore.getState()
      expect(typeof state.loadExleHistory).toBe('function')
    })

    it('should have createSolofundLoan function', () => {
      const state = useExleStore.getState()
      expect(typeof state.createSolofundLoan).toBe('function')
    })

    it('should have fundLoanSolo function', () => {
      const state = useExleStore.getState()
      expect(typeof state.fundLoanSolo).toBe('function')
    })

    it('should have repayLoan function', () => {
      const state = useExleStore.getState()
      expect(typeof state.repayLoan).toBe('function')
    })
  })

  describe('disconnectWallet', () => {
    it('should reset changeAddress to empty string', async () => {
      // Set a wallet address first
      useExleStore.setState({ changeAddress: '9testaddress123' })
      expect(useExleStore.getState().changeAddress).toBe('9testaddress123')

      // Disconnect wallet
      await useExleStore.getState().disconnectWallet()
      expect(useExleStore.getState().changeAddress).toBe('')
    })
  })

  describe('UI Actions', () => {
    it('should toggle mobile menu', () => {
      expect(useExleStore.getState().isMobileMenuOpen).toBe(false)
      useExleStore.getState().toggleMobileMenu()
      expect(useExleStore.getState().isMobileMenuOpen).toBe(true)
      useExleStore.getState().toggleMobileMenu()
      expect(useExleStore.getState().isMobileMenuOpen).toBe(false)
    })

    it('should close mobile menu', () => {
      useExleStore.setState({ isMobileMenuOpen: true })
      useExleStore.getState().closeMobileMenu()
      expect(useExleStore.getState().isMobileMenuOpen).toBe(false)
    })
  })
})
