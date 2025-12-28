import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useExleStore } from './useExleStore'
import {
  mockServiceBox,
  mockLendBoxUnfunded,
  mockLendBoxFunded,
  mockRepaymentBox,
  mockRepaymentBoxFullyRepaid,
  mockCrowdfundBox,
  mockCrowdfundBoxFullyFunded,
  mockUserUtxos,
  mockNodeInfo,
  mockSignedTx,
  mockCreateLendInputParams,
  mockCreateCrowdfundInputParams,
  MOCK_LOAN_ID,
  MOCK_USER_ADDRESS,
  MOCK_BORROWER_ADDRESS,
  setupWindowMocks,
  cleanupWindowMocks,
} from '@/lib/exle/__mocks__/mockdata'

// Mock the exle module
vi.mock('@/lib/exle/exle', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/exle/exle')>()
  return {
    ...original,
    fetchNodeInfo: vi.fn(),
    fetchLoans: vi.fn(),
    fetchRepayments: vi.fn(),
    fetchAllExleMetadata: vi.fn(),
    fetchServiceBox: vi.fn(),
    fetchLendBox: vi.fn(),
    fetchBoxByTokenId: vi.fn(),
    fetchCrowdFundBoxesByLoanId: vi.fn(),
    createLendTokensTx: vi.fn(),
    preparefundLendTokensTx: vi.fn(),
    fundRepaymentTokensTx: vi.fn(),
    fundRepaymentTokensSruProxyTx: vi.fn(),
    prepareNewCrowdFundTx: vi.fn(),
    fundCrowdFundBoxTokensTx: vi.fn(),
    prepareLendToRepaymentTokensTx: vi.fn(),
    sendFromRepaymentBoxToLenderTokensTx: vi.fn(),
    sendFromCrowdBoxToLenderTokensTx: vi.fn(),
    parseLoanBox: vi.fn(),
    parseRepaymentBox: vi.fn(),
  }
})

// Import mocked functions
import {
  fetchNodeInfo,
  fetchLoans,
  fetchRepayments,
  fetchAllExleMetadata,
  fetchServiceBox,
  fetchLendBox,
  fetchBoxByTokenId,
  fetchCrowdFundBoxesByLoanId,
  createLendTokensTx,
  preparefundLendTokensTx,
  fundRepaymentTokensTx,
  fundRepaymentTokensSruProxyTx,
  prepareNewCrowdFundTx,
  fundCrowdFundBoxTokensTx,
  prepareLendToRepaymentTokensTx,
  sendFromRepaymentBoxToLenderTokensTx,
  sendFromCrowdBoxToLenderTokensTx,
  parseLoanBox,
  parseRepaymentBox,
} from '@/lib/exle/exle'

describe('useExleStore - Transaction Actions', () => {
  let mockWallet: ReturnType<typeof setupWindowMocks>['mockWallet']
  let mockConnector: ReturnType<typeof setupWindowMocks>['mockConnector']

  beforeEach(() => {
    // Reset store state
    useExleStore.setState({
      connectedWallet: 'nautilus',
      changeAddress: MOCK_USER_ADDRESS,
      loans: [],
      repayments: [],
      exleMetadata: null,
      isLoading: false,
      error: null,
    })

    // Setup window mocks
    const mocks = setupWindowMocks()
    mockWallet = mocks.mockWallet
    mockConnector = mocks.mockConnector

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanupWindowMocks()
  })

  describe('createSolofundLoan', () => {
    it('should create a solofund loan successfully', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(createLendTokensTx).mockReturnValue(mockUnsignedTx)

      const { createSolofundLoan } = useExleStore.getState()
      const result = await createSolofundLoan(mockCreateLendInputParams)

      expect(result).toBe('submitted123tx456id789')
      expect(fetchServiceBox).toHaveBeenCalled()
      expect(createLendTokensTx).toHaveBeenCalledWith(
        mockCreateLendInputParams,
        expect.objectContaining({
          height: 1000000,
          serviceBox: mockServiceBox,
        })
      )
      expect(mockWallet.sign_tx).toHaveBeenCalled()
      expect(mockWallet.submit_tx).toHaveBeenCalled()
    })

    it('should return null and set error when service box not found', async () => {
      vi.mocked(fetchServiceBox).mockResolvedValue(undefined)

      const { createSolofundLoan } = useExleStore.getState()
      const result = await createSolofundLoan(mockCreateLendInputParams)

      expect(result).toBeNull()
      expect(useExleStore.getState().error).toBe('Failed to create loan')
    })

    it('should return null when wallet not connected', async () => {
      cleanupWindowMocks()
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(createLendTokensTx).mockReturnValue({ inputs: [], outputs: [] })

      const { createSolofundLoan } = useExleStore.getState()
      const result = await createSolofundLoan(mockCreateLendInputParams)

      expect(result).toBeNull()
    })

    it('should return null when signing fails', async () => {
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(createLendTokensTx).mockReturnValue({ inputs: [], outputs: [] })
      mockWallet.sign_tx.mockRejectedValue(new Error('User rejected'))

      const { createSolofundLoan } = useExleStore.getState()
      const result = await createSolofundLoan(mockCreateLendInputParams)

      expect(result).toBeNull()
      expect(useExleStore.getState().error).toBe('Failed to create loan')
    })
  })

  describe('fundLoanSolo', () => {
    it('should fund a loan successfully', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      vi.mocked(fetchLendBox).mockResolvedValue(mockLendBoxUnfunded)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(preparefundLendTokensTx).mockReturnValue(mockUnsignedTx)

      const { fundLoanSolo } = useExleStore.getState()
      const result = await fundLoanSolo(MOCK_LOAN_ID)

      expect(result).toBe('submitted123tx456id789')
      expect(fetchLendBox).toHaveBeenCalledWith(MOCK_LOAN_ID)
      expect(preparefundLendTokensTx).toHaveBeenCalled()
    })

    it('should return null when lend box not found', async () => {
      vi.mocked(fetchLendBox).mockResolvedValue(undefined)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)

      const { fundLoanSolo } = useExleStore.getState()
      const result = await fundLoanSolo(MOCK_LOAN_ID)

      expect(result).toBeNull()
      expect(useExleStore.getState().error).toBe('Failed to fund loan')
    })

    it('should return null when service box not found', async () => {
      vi.mocked(fetchLendBox).mockResolvedValue(mockLendBoxUnfunded)
      vi.mocked(fetchServiceBox).mockResolvedValue(undefined)

      const { fundLoanSolo } = useExleStore.getState()
      const result = await fundLoanSolo(MOCK_LOAN_ID)

      expect(result).toBeNull()
    })
  })

  describe('repayLoan', () => {
    it('should repay loan partially', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      vi.mocked(fetchLendBox).mockResolvedValue(mockRepaymentBox)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(fundRepaymentTokensTx).mockReturnValue(mockUnsignedTx)

      const { repayLoan } = useExleStore.getState()
      const result = await repayLoan(MOCK_LOAN_ID, 5000n, true)

      expect(result).toBe('submitted123tx456id789')
      expect(fundRepaymentTokensTx).toHaveBeenCalled()
    })

    it('should repay loan fully using proxy', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      vi.mocked(fetchLendBox).mockResolvedValue(mockRepaymentBox)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(fundRepaymentTokensSruProxyTx).mockReturnValue(mockUnsignedTx)

      const { repayLoan } = useExleStore.getState()
      const result = await repayLoan(MOCK_LOAN_ID, 10100n, false)

      expect(result).toBe('submitted123tx456id789')
      expect(fundRepaymentTokensSruProxyTx).toHaveBeenCalled()
    })

    it('should return null when repayment box not found', async () => {
      vi.mocked(fetchLendBox).mockResolvedValue(undefined)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)

      const { repayLoan } = useExleStore.getState()
      const result = await repayLoan(MOCK_LOAN_ID, 5000n, true)

      expect(result).toBeNull()
      expect(useExleStore.getState().error).toBe('Failed to repay loan')
    })
  })

  describe('withdrawLoanAsBorrower', () => {
    it('should withdraw loan as borrower successfully', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      vi.mocked(fetchLendBox).mockResolvedValue(mockLendBoxFunded)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(prepareLendToRepaymentTokensTx).mockReturnValue(mockUnsignedTx)

      const { withdrawLoanAsBorrower } = useExleStore.getState()
      const result = await withdrawLoanAsBorrower(MOCK_LOAN_ID)

      expect(result).toBe('submitted123tx456id789')
      expect(prepareLendToRepaymentTokensTx).toHaveBeenCalled()
    })

    it('should return null when lend box not found', async () => {
      vi.mocked(fetchLendBox).mockResolvedValue(undefined)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)

      const { withdrawLoanAsBorrower } = useExleStore.getState()
      const result = await withdrawLoanAsBorrower(MOCK_LOAN_ID)

      expect(result).toBeNull()
      expect(useExleStore.getState().error).toBe('Failed to withdraw loan')
    })
  })

  describe('withdrawFromRepaymentAsLender', () => {
    it('should withdraw from repayment as lender successfully', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      vi.mocked(fetchBoxByTokenId).mockResolvedValue(mockRepaymentBoxFullyRepaid)
      vi.mocked(sendFromRepaymentBoxToLenderTokensTx).mockReturnValue(mockUnsignedTx)

      const { withdrawFromRepaymentAsLender } = useExleStore.getState()
      const result = await withdrawFromRepaymentAsLender(MOCK_LOAN_ID)

      expect(result).toBe('submitted123tx456id789')
      expect(sendFromRepaymentBoxToLenderTokensTx).toHaveBeenCalledWith(
        mockRepaymentBoxFullyRepaid,
        1000000,
        expect.any(BigInt)
      )
    })

    it('should return null when repayment box not found', async () => {
      vi.mocked(fetchBoxByTokenId).mockResolvedValue(undefined)

      const { withdrawFromRepaymentAsLender } = useExleStore.getState()
      const result = await withdrawFromRepaymentAsLender(MOCK_LOAN_ID)

      expect(result).toBeNull()
      expect(useExleStore.getState().error).toBe('Failed to withdraw from repayment')
    })
  })

  describe('createCrowdfundLoan', () => {
    it('should create a crowdfund loan successfully', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      const mockSignedLendTx = {
        ...mockSignedTx,
        outputs: [
          { assets: [] },
          { assets: [{ tokenId: 'token1' }, { tokenId: MOCK_LOAN_ID }] },
        ],
      }

      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(createLendTokensTx).mockReturnValue(mockUnsignedTx)
      vi.mocked(fetchLendBox).mockResolvedValue(mockLendBoxUnfunded)
      vi.mocked(prepareNewCrowdFundTx).mockReturnValue(mockUnsignedTx)
      mockWallet.sign_tx.mockResolvedValueOnce(mockSignedLendTx).mockResolvedValueOnce(mockSignedTx)
      mockWallet.submit_tx.mockResolvedValueOnce('lendTxId123').mockResolvedValueOnce('crowdTxId456')

      const { createCrowdfundLoan } = useExleStore.getState()
      const result = await createCrowdfundLoan(mockCreateCrowdfundInputParams)

      expect(result).toBe('crowdTxId456')
      expect(createLendTokensTx).toHaveBeenCalled()
      expect(prepareNewCrowdFundTx).toHaveBeenCalled()
    })

    it('should return lend tx id if crowdfund box creation fails', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      const mockSignedLendTx = {
        ...mockSignedTx,
        outputs: [{ assets: [] }, { assets: [] }], // No loan token ID
      }

      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(createLendTokensTx).mockReturnValue(mockUnsignedTx)
      mockWallet.sign_tx.mockResolvedValueOnce(mockSignedLendTx)
      mockWallet.submit_tx.mockResolvedValueOnce('lendTxId123')

      const { createCrowdfundLoan } = useExleStore.getState()
      const result = await createCrowdfundLoan(mockCreateCrowdfundInputParams)

      expect(result).toBe('lendTxId123')
    })

    it('should return null when service box not found', async () => {
      vi.mocked(fetchServiceBox).mockResolvedValue(undefined)

      const { createCrowdfundLoan } = useExleStore.getState()
      const result = await createCrowdfundLoan(mockCreateCrowdfundInputParams)

      expect(result).toBeNull()
      expect(useExleStore.getState().error).toBe('Failed to create crowdfund loan')
    })
  })

  describe('fundCrowdfund', () => {
    it('should fund a crowdfund loan successfully', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      vi.mocked(fetchLendBox).mockResolvedValue(mockLendBoxUnfunded)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(fetchCrowdFundBoxesByLoanId).mockResolvedValue([mockCrowdfundBox])
      vi.mocked(fundCrowdFundBoxTokensTx).mockReturnValue(mockUnsignedTx)

      const { fundCrowdfund } = useExleStore.getState()
      const result = await fundCrowdfund(MOCK_LOAN_ID, 5000n)

      expect(result).toBe('submitted123tx456id789')
      expect(fetchCrowdFundBoxesByLoanId).toHaveBeenCalledWith(MOCK_LOAN_ID)
      expect(fundCrowdFundBoxTokensTx).toHaveBeenCalled()
    })

    it('should return null when no crowdfund boxes found', async () => {
      vi.mocked(fetchLendBox).mockResolvedValue(mockLendBoxUnfunded)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(fetchCrowdFundBoxesByLoanId).mockResolvedValue([])

      const { fundCrowdfund } = useExleStore.getState()
      const result = await fundCrowdfund(MOCK_LOAN_ID, 5000n)

      expect(result).toBeNull()
      expect(useExleStore.getState().error).toBe('Failed to fund crowdfund')
    })

    it('should return null when no suitable payment box found', async () => {
      vi.mocked(fetchLendBox).mockResolvedValue(mockLendBoxUnfunded)
      vi.mocked(fetchServiceBox).mockResolvedValue(mockServiceBox)
      vi.mocked(fetchCrowdFundBoxesByLoanId).mockResolvedValue([mockCrowdfundBox])
      // Mock wallet returning UTXOs without sufficient tokens
      mockWallet.get_utxos.mockResolvedValue([{ boxId: 'empty', assets: [] }])

      const { fundCrowdfund } = useExleStore.getState()
      const result = await fundCrowdfund(MOCK_LOAN_ID, 999999999n) // Very large amount

      expect(result).toBeNull()
    })
  })

  describe('withdrawFromCrowdfundAsLender', () => {
    it('should withdraw from crowdfund as lender successfully', async () => {
      const mockUnsignedTx = { inputs: [], outputs: [] }
      vi.mocked(fetchBoxByTokenId).mockResolvedValue(mockCrowdfundBoxFullyFunded)
      vi.mocked(sendFromCrowdBoxToLenderTokensTx).mockReturnValue(mockUnsignedTx)

      const { withdrawFromCrowdfundAsLender } = useExleStore.getState()
      const result = await withdrawFromCrowdfundAsLender('cf123token456id789')

      expect(result).toBe('submitted123tx456id789')
      expect(sendFromCrowdBoxToLenderTokensTx).toHaveBeenCalled()
    })

    it('should return null when crowdfund box not found', async () => {
      vi.mocked(fetchBoxByTokenId).mockResolvedValue(undefined)

      const { withdrawFromCrowdfundAsLender } = useExleStore.getState()
      const result = await withdrawFromCrowdfundAsLender('nonexistent')

      expect(result).toBeNull()
      expect(useExleStore.getState().error).toBe('Failed to withdraw from crowdfund')
    })
  })
})

describe('useExleStore - Data Loading', () => {
  let mockWallet: ReturnType<typeof setupWindowMocks>['mockWallet']

  beforeEach(() => {
    useExleStore.setState({
      connectedWallet: 'nautilus',
      changeAddress: MOCK_USER_ADDRESS,
      loans: [],
      repayments: [],
      exleMetadata: null,
      isLoading: false,
      error: null,
    })

    const mocks = setupWindowMocks()
    mockWallet = mocks.mockWallet
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanupWindowMocks()
  })

  describe('loadLoansAndRepayments', () => {
    it('should load loans and repayments successfully', async () => {
      vi.mocked(fetchLoans).mockResolvedValue([mockLendBoxUnfunded, mockLendBoxFunded])
      vi.mocked(fetchRepayments).mockResolvedValue([mockRepaymentBox])
      vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)
      vi.mocked(parseLoanBox).mockImplementation((box) => ({
        phase: 'loan' as const,
        loanId: box.assets[1]?.tokenId || '',
        loanType: 'Solofund',
        loanTitle: 'Test',
        loanDescription: 'Test',
        repaymentPeriod: '7',
        interestRate: '10%',
        fundingGoal: '100',
        fundingToken: 'SigUSD',
        fundedAmount: '0',
        fundedPercentage: 0,
        daysLeft: 1,
        creator: MOCK_BORROWER_ADDRESS,
      }))
      vi.mocked(parseRepaymentBox).mockImplementation((box) => ({
        phase: 'repayment' as const,
        loanId: box.assets[1]?.tokenId || '',
        loanType: 'Crowdloan',
        loanTitle: 'Test',
        loanDescription: 'Test',
        repaymentPeriod: '7',
        interestRate: '10%',
        fundingGoal: '101',
        fundingToken: 'SigUSD',
        fundedAmount: '50',
        fundedPercentage: 50,
        daysLeft: 5,
        creator: MOCK_BORROWER_ADDRESS,
      }))

      const { loadLoansAndRepayments } = useExleStore.getState()
      await loadLoansAndRepayments()

      const state = useExleStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.loans.length).toBe(2)
      expect(state.repayments.length).toBe(1)
      expect(state.error).toBeNull()
    })

    it('should handle errors when loading fails', async () => {
      vi.mocked(fetchLoans).mockRejectedValue(new Error('Network error'))
      vi.mocked(fetchRepayments).mockResolvedValue([])
      vi.mocked(fetchNodeInfo).mockResolvedValue(mockNodeInfo)

      const { loadLoansAndRepayments } = useExleStore.getState()
      await loadLoansAndRepayments()

      const state = useExleStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Failed to load loans')
    })

    it('should handle missing node info', async () => {
      vi.mocked(fetchLoans).mockResolvedValue([])
      vi.mocked(fetchRepayments).mockResolvedValue([])
      vi.mocked(fetchNodeInfo).mockResolvedValue(null)

      const { loadLoansAndRepayments } = useExleStore.getState()
      await loadLoansAndRepayments()

      const state = useExleStore.getState()
      expect(state.error).toBe('Failed to load loans')
    })
  })

  describe('getWeb3WalletData', () => {
    it('should return wallet data when connected', async () => {
      const { getWeb3WalletData } = useExleStore.getState()
      const result = await getWeb3WalletData()

      expect(result.me).toBe(MOCK_USER_ADDRESS)
      expect(result.height).toBe(1000000)
      expect(result.utxos).toEqual(mockUserUtxos)
    })

    it('should throw error when wallet not available', async () => {
      cleanupWindowMocks()

      const { getWeb3WalletData } = useExleStore.getState()
      await expect(getWeb3WalletData()).rejects.toThrow('Wallet not available')
    })
  })
})

describe('useExleStore - Wallet Actions', () => {
  beforeEach(() => {
    useExleStore.setState({
      connectedWallet: '',
      changeAddress: '',
      error: null,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanupWindowMocks()
  })

  describe('connectWallet', () => {
    it('should connect wallet successfully', async () => {
      setupWindowMocks()

      const { connectWallet } = useExleStore.getState()
      await connectWallet()

      const state = useExleStore.getState()
      expect(state.connectedWallet).toBe('nautilus')
      expect(state.changeAddress).toBe(MOCK_USER_ADDRESS)
    })

    it('should handle missing wallet connector', async () => {
      // Don't setup mocks, so window.ergoConnector is undefined

      const { connectWallet } = useExleStore.getState()
      await connectWallet()

      const state = useExleStore.getState()
      expect(state.connectedWallet).toBe('')
    })

    it('should handle connection failure', async () => {
      const { mockConnector } = setupWindowMocks()
      mockConnector.nautilus.connect.mockResolvedValue(false)

      const { connectWallet } = useExleStore.getState()
      await connectWallet()

      const state = useExleStore.getState()
      expect(state.connectedWallet).toBe('')
    })
  })

  describe('disconnectWallet', () => {
    it('should disconnect wallet successfully', async () => {
      const { mockConnector } = setupWindowMocks()
      useExleStore.setState({
        connectedWallet: 'nautilus',
        changeAddress: MOCK_USER_ADDRESS,
      })

      const { disconnectWallet } = useExleStore.getState()
      await disconnectWallet()

      const state = useExleStore.getState()
      expect(state.connectedWallet).toBe('')
      expect(state.changeAddress).toBe('')
      expect(mockConnector.nautilus.disconnect).toHaveBeenCalled()
    })
  })
})

describe('useExleStore - UI Actions', () => {
  beforeEach(() => {
    useExleStore.setState({
      isMobile: false,
      isMobileMenuOpen: false,
      isDark: true,
    })
  })

  it('should toggle mobile menu', () => {
    const { toggleMobileMenu } = useExleStore.getState()

    toggleMobileMenu()
    expect(useExleStore.getState().isMobileMenuOpen).toBe(true)

    toggleMobileMenu()
    expect(useExleStore.getState().isMobileMenuOpen).toBe(false)
  })

  it('should close mobile menu', () => {
    useExleStore.setState({ isMobileMenuOpen: true })

    const { closeMobileMenu } = useExleStore.getState()
    closeMobileMenu()

    expect(useExleStore.getState().isMobileMenuOpen).toBe(false)
  })

  it('should set isMobile', () => {
    const { setIsMobile } = useExleStore.getState()

    setIsMobile(true)
    expect(useExleStore.getState().isMobile).toBe(true)

    setIsMobile(false)
    expect(useExleStore.getState().isMobile).toBe(false)
  })
})
