'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Info, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExleStore } from '@/stores/useExleStore'
import { shortenAddress, cn } from '@/lib/utils'
import { tokenByTicker } from '@/lib/exle/exle'

const BLOCKS_PER_DAY = 720

function StepHeader({ currentStep }: { currentStep: number }) {
  const steps = [
    'Loan type',
    'Loan details',
    'Loan parameters',
    'Terms of use',
    'Payment & Finalize',
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                index + 1 === currentStep
                  ? 'bg-exle-accent text-white'
                  : index + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {index + 1 < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={cn('h-[2px] w-8', index + 1 < currentStep ? 'bg-green-500' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>
      <h2 className="text-xl font-semibold">{steps[currentStep - 1]}</h2>
    </div>
  )
}

export function LoanStepper() {
  const router = useRouter()
  const changeAddress = useExleStore((state) => state.changeAddress)
  const createSolofundLoan = useExleStore((state) => state.createSolofundLoan)
  const createCrowdfundLoan = useExleStore((state) => state.createCrowdfundLoan)

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedLoanType, setSelectedLoanType] = useState<'Crowdloan' | 'Solofund' | null>(null)
  const [isWalletConfirmed, setIsWalletConfirmed] = useState(false)
  const [loanTitle, setLoanTitle] = useState('')
  const [loanDescription, setLoanDescription] = useState('')
  const [loanToken, setLoanToken] = useState('SigUSD')
  const [fundingGoal, setFundingGoal] = useState('')
  const [fundingDeadline, setFundingDeadline] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [repaymentPeriod, setRepaymentPeriod] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [waitingForSignature, setWaitingForSignature] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdLoanId, setCreatedLoanId] = useState<string | null>(null)

  const goBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const handleContinue = () => {
    if (currentStep === 1 && selectedLoanType && isWalletConfirmed) {
      setCurrentStep(2)
    } else if (currentStep === 2 && loanTitle && loanDescription) {
      setCurrentStep(3)
    } else if (currentStep === 3 && loanToken && fundingGoal && fundingDeadline && interestRate && repaymentPeriod) {
      setCurrentStep(4)
    } else if (currentStep === 4 && termsAccepted) {
      setCurrentStep(5)
    }
  }

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalizePayment = async () => {
    if (!selectedLoanType) {
      setSubmitError('Please select a loan type')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Get token info to calculate proper amounts
      const token = tokenByTicker(loanToken)
      if (!token) {
        throw new Error(`Unknown token: ${loanToken}`)
      }

      // Convert user input to blockchain values
      const fundingGoalAmount = BigInt(Math.floor(parseFloat(fundingGoal) * Math.pow(10, token.decimals)))
      const deadlineBlocks = BigInt(Number(fundingDeadline) * BLOCKS_PER_DAY * 30)
      const repaymentBlocks = BigInt(Number(repaymentPeriod) * BLOCKS_PER_DAY * 30)
      const interestBasisPoints = BigInt(Math.floor(parseFloat(interestRate) * 10)) // 10% = 100 basis points

      const loanParams = {
        loanType: selectedLoanType as 'Solofund' | 'Crowdloan',
        borrowerAddress: changeAddress,
        project: [loanTitle, loanDescription],
        loanTokenId: token.tokenId,
        fundingGoal: fundingGoalAmount,
        fundingDeadlineLength: deadlineBlocks,
        interestRate: interestBasisPoints,
        repaymentHeightLength: repaymentBlocks,
      }

      let txId: string | null = null

      setWaitingForSignature(true)
      try {
        if (selectedLoanType === 'Solofund') {
          txId = await createSolofundLoan(loanParams)
        } else {
          txId = await createCrowdfundLoan(loanParams)
        }
      } finally {
        setWaitingForSignature(false)
      }

      if (txId) {
        setCreatedLoanId(txId)
        setPaymentConfirmed(true)
      } else {
        throw new Error('Transaction failed - no transaction ID returned')
      }
    } catch (error) {
      console.error('Create loan error:', error)
      const message = error instanceof Error ? error.message : String(error)

      // Map common wallet errors to user-friendly messages
      if (message.toLowerCase().includes('rejected') || message.toLowerCase().includes('cancelled') || message.toLowerCase().includes('canceled')) {
        setSubmitError('Transaction was cancelled. Please try again.')
      } else if (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('timed out')) {
        setSubmitError('Wallet signing took too long. Please try again.')
      } else if (message.toLowerCase().includes('not connected')) {
        setSubmitError('Wallet not connected. Please connect your wallet and try again.')
      } else {
        setSubmitError(message || 'Failed to create loan')
      }
    } finally {
      setIsSubmitting(false)
      setWaitingForSignature(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl grow rounded-lg p-6 pt-8 text-sm">
      {currentStep === 1 && (
        <div className="w-full">
          <StepHeader currentStep={currentStep} />

          <div className="mb-8">
            <p className="mb-4">What type of loan do you want to take?</p>
            <div className="flex gap-4 max-md:flex-col">
              <button
                type="button"
                className={cn(
                  'w-full rounded-lg border-2 p-4 text-left transition',
                  selectedLoanType === 'Crowdloan'
                    ? 'border-exle-accent bg-exle-accent text-white'
                    : 'border-border hover:border-exle-accent/50'
                )}
                onClick={() => setSelectedLoanType('Crowdloan')}
              >
                <p className="mb-4 text-md font-semibold">Crowdloan</p>
                <p className="text-sm">Multiple people can contribute to fund a crowdloan.</p>
              </button>

              <button
                type="button"
                className={cn(
                  'w-full rounded-lg border-2 p-4 text-left transition',
                  selectedLoanType === 'Solofund'
                    ? 'border-exle-accent bg-exle-accent text-white'
                    : 'border-border hover:border-exle-accent/50'
                )}
                onClick={() => setSelectedLoanType('Solofund')}
              >
                <p className="mb-4 text-md font-semibold">Solofund</p>
                <p className="text-sm">Only one person can contribute to fund a Solofund.</p>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <label className="flex items-start space-x-2">
              <Checkbox
                checked={isWalletConfirmed}
                onCheckedChange={(checked) => setIsWalletConfirmed(checked as boolean)}
              />
              <div>
                <span>
                  I confirm this is my wallet address:
                  <br />
                  <span className="font-bold">{changeAddress ? shortenAddress(changeAddress) : 'Not connected'}</span>
                  <br />
                  (Loaned funds will be sent to this address)
                </span>
              </div>
            </label>
          </div>

          <div className="mb-10 flex gap-2">
            <Info className="h-5 w-5 flex-shrink-0" />
            <div>
              <span className="font-semibold">Loan creation fee</span>
              <br />
              There&apos;s a 0.1 ERG fee for creating your loan.
            </div>
          </div>

          <div className="flex justify-between gap-4 max-md:flex-col-reverse">
            <Button variant="outline" onClick={goBack}>
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selectedLoanType || !isWalletConfirmed}
              className="bg-exle-accent hover:bg-exle-accent/90"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="w-full">
          <StepHeader currentStep={currentStep} />

          <div className="mb-6">
            <label htmlFor="loan-title" className="block text-sm font-medium">
              Loan Title
            </label>
            <Input
              id="loan-title"
              value={loanTitle}
              onChange={(e) => setLoanTitle(e.target.value)}
              placeholder="Give your loan a meaningful title"
              className="mt-2"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="loan-description" className="block text-sm font-medium">
              Loan Description
            </label>
            <Textarea
              id="loan-description"
              value={loanDescription}
              onChange={(e) => setLoanDescription(e.target.value)}
              placeholder="Provide some details and description for your loan..."
              className="mt-2"
              rows={4}
            />
          </div>

          <div className="flex justify-between gap-4 max-md:flex-col-reverse">
            <Button variant="outline" onClick={handleGoBack}>
              Go back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!loanTitle || !loanDescription}
              className="bg-exle-accent hover:bg-exle-accent/90"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="w-full">
          <StepHeader currentStep={currentStep} />

          <div className="mb-6">
            <label className="block font-medium">Loan Token</label>
            <Select value={loanToken} onValueChange={setLoanToken}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SigUSD">SigUSD</SelectItem>
                <SelectItem value="ERG">ERG</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">(Token to borrow for this loan)</p>
          </div>

          <div className="mb-6">
            <label className="block font-medium">Funding Goal</label>
            <div className="relative mt-2">
              <Input
                type="number"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                placeholder="Amount to be raised"
                className="pr-16"
              />
              <span className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                {loanToken}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-medium">Funding Deadline</label>
            <div className="relative mt-2">
              <Input
                type="number"
                value={fundingDeadline}
                onChange={(e) => setFundingDeadline(e.target.value)}
                placeholder="Deadline for funding"
                className="pr-20"
              />
              <span className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                Months
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-medium">Interest Rate</label>
            <div className="relative mt-2">
              <Input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Interest rate"
                className="pr-12"
              />
              <span className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-medium">Repayment Period</label>
            <div className="relative mt-2">
              <Input
                type="number"
                value={repaymentPeriod}
                onChange={(e) => setRepaymentPeriod(e.target.value)}
                placeholder="Repayment period"
                className="pr-20"
              />
              <span className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                Months
              </span>
            </div>
          </div>

          <div className="flex justify-between gap-4 max-md:flex-col-reverse">
            <Button variant="outline" onClick={handleGoBack}>
              Go back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!loanToken || !fundingGoal || !fundingDeadline || !interestRate || !repaymentPeriod}
              className="bg-exle-accent hover:bg-exle-accent/90"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="w-full">
          <StepHeader currentStep={currentStep} />

          <div className="mb-6 space-y-4">
            <div>
              <div className="text-muted-foreground">Loan Title:</div>
              {loanTitle}
            </div>
            <div>
              <div className="text-muted-foreground">Loan Description:</div>
              {loanDescription}
            </div>
            <div>
              <div className="text-muted-foreground">Borrower&apos;s Address:</div>
              {shortenAddress(changeAddress || '')}
            </div>
            <div>
              <div className="text-muted-foreground">Funding Goal:</div>
              {fundingGoal} {loanToken}
            </div>
            <div>
              <div className="text-muted-foreground">Loan Type:</div>
              {selectedLoanType}
            </div>
            <div>
              <div className="text-muted-foreground">Funding Deadline:</div>
              Around {fundingDeadline} months / {Number(fundingDeadline) * BLOCKS_PER_DAY * 30} Blocks
            </div>
            <div>
              <div className="text-muted-foreground">Interest Rate:</div>
              {interestRate}%
            </div>
            <div>
              <div className="text-muted-foreground">Repayment Period:</div>
              Around {repaymentPeriod} months / {Number(repaymentPeriod) * BLOCKS_PER_DAY * 30} Blocks
            </div>
          </div>

          <div className="mb-6">
            <div className="rounded-lg border-2 border-border p-4">
              <ul className="list-disc space-y-2 pl-6 text-sm">
                <li>Creating or participating in loans is not illegal in your country.</li>
                <li>
                  You are over the legal age required to use financial services such as funding loans
                  and are not funding loans on behalf of an underage person.
                </li>
                <li>
                  You are solely responsible for all legal or moral obligations and liabilities.
                </li>
                <li>
                  You understand that there is a risk that the loan is not repaid and EXLE is not liable.
                </li>
                <li>You are solely responsible for any due taxes and legal reports.</li>
                <li>I promise to repay what I owe.</li>
              </ul>
            </div>
            <div className="mt-4">
              <label className="flex items-start space-x-2">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <span>I agree to the terms of use</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between gap-4 max-md:flex-col-reverse">
            <Button variant="outline" onClick={handleGoBack}>
              Go back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!termsAccepted}
              className="bg-exle-accent hover:bg-exle-accent/90"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {currentStep === 5 && !paymentConfirmed && (
        <div className="w-full">
          <StepHeader currentStep={currentStep} />

          <div className="mb-6">
            <p className="max-w-[400px] text-muted-foreground">
              In order to finalize your loan, you need to make a 0.1 ERG payment on your wallet.
              Your loan will be created after the payment transaction has finalized.
            </p>
          </div>

          {submitError && (
            <div className="mb-6 rounded-lg border border-red-500 bg-red-500/10 p-4 text-red-500">
              {submitError}
            </div>
          )}

          <div className="mb-6 flex flex-col items-center rounded-lg border text-center p-8">
            <p className="mb-6 font-medium">Pay via browser wallet</p>
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              {isSubmitting ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-8 w-8">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              )}
            </div>
            <p className="text-lg font-medium">Nautilus Wallet</p>
            {isSubmitting && (
              <div className="mt-2 text-sm text-muted-foreground">
                {waitingForSignature ? (
                  <>
                    <p className="font-medium text-exle-accent">Please sign the transaction in your Nautilus wallet...</p>
                    <p className="mt-1 text-xs">Check for the Nautilus popup. If you don&apos;t see it, click the Nautilus icon in your browser.</p>
                  </>
                ) : (
                  <p>Preparing transaction...</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4 max-md:flex-col-reverse">
            <Button variant="outline" onClick={goBack} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleFinalizePayment}
              className="bg-exle-accent hover:bg-exle-accent/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {waitingForSignature ? 'Waiting for signature...' : 'Creating loan...'}
                </>
              ) : (
                'Pay via browser wallet'
              )}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 5 && paymentConfirmed && (
        <div className="flex flex-grow flex-col text-center w-full">
          <StepHeader currentStep={currentStep} />
          <div className="flex flex-grow flex-col items-center justify-center md:mb-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
              <Check className="h-8 w-8 text-white" />
            </div>
            <p className="mb-8 max-w-[320px] text-sm text-muted-foreground">
              Your transaction has been confirmed and your loan is created.
              You can view it by clicking on the button below:
            </p>
            <Button asChild className="bg-exle-accent hover:bg-exle-accent/90">
              <Link href="/loans">Take me to the loan page</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
