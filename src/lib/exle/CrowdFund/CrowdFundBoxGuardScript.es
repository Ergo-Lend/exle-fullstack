{
    // ===== Contract Info ===== //
    // Name             : Crowd Fund Box Guard Script
    // Description      : A box that allows users to crowd fund for a SLT Loan
    //                      NOTE TO USERS of this CONTRACT -> Please ensure that the output
    //                          that returns the CF token to you is the right amount.
    //                          This contract only focuses on a single responsibility,
    //                          which is getting funded and repayment.
    //                          As the transaction is controlled by your wallet, the only way
    //                          you'll lose your money is when you do not pay attention to the
    //                          output, and a malicious party change the output token to send
    //                          to their address rather than yours.
    // Type             : Guard Script
    // Author           : Kii
    // Last Modified    : Feb 26 2023
    // Version          : v 1.0
    // Status           : Draft

    // ===== Contract Hard-Coded Constants ===== //
    // val _MinFee:                     Long
    // val _MaxByteBoxFee:              Long
    // val _LoanId:                     Coll[Byte]
    // val _SLTCFTokenId:               Coll[Byte]
    // val _SLTRepaymentTokenId:        Coll[Byte]

    // ===== Contract Conditions ===== //
    // 1. CrowdFund Funding        - Fund the repayment box when it is still fundable.
    //                              Also processes over funded boxes
    // 2. LoanBox Funding        - Fund the repayment box when it is still fundable.
    // 3. CrowdFund Repayment        - Fund the repayment box when it is still fundable.
    // 4. Repayment To CrowdFund        - No Actions needed theoretically.
    // #NOTE: No refunds just repayments.

    // ===== Registers ===== //
    // R4 - Loan Token Id -> Coll[Byte]
    // R5 - CrowdFund Token Id -> Coll[Byte]
    // R6 - Funding State -> Integer.
    //          0 -> CrowdFunding,
    //          1 -> Loan Funded,
    //          2 -> Repayment Funds

    // ===== DataInputs ===== //
    // 1. LoanBox       => SLTLoanBox
    // 2. RepaymentBox  => SLTRepaymentBox


    // ===== Repayment Condition ===== //
    // During repayment, the funds that are sent to the crowdfund address
    // do not have any registers. So we have to account for that. It's either
    // in repayment mode. or the others.
    //
    // Q: How do we identify repayment mode though?
    // A: The identifier is the token that it holds. If the only token that it holds
    //  is the loanToken. Then it is a repayment fund.

    val crowdFundFundingState: Long              = 0L
    val crowdFundGoalFundedState: Long           = 1L
    val crowdFundRepaymentFundsState: Long       = 2L
    val percentageDenominator: Long              = 1000L

    val emptyToken: (Coll[Byte], Long)          = (Coll(1.toByte), 0L)
    val cfStateBox: Box                         = CONTEXT.dataInputs(0)

    val _cfStateBoxCheck: Boolean               = allOf(Coll(
        cfStateBox.propositionBytes == SELF.propositionBytes,
        cfStateBox.tokens(0)._1 == _SLTCFTokenId,
        cfStateBox.tokens(0)._2 == 1
    ))

    val fundingCheck: Boolean                  = allOf(Coll(
        SELF.value >= (_MinFee * 4)
    ))

    // We can allow others to hack the system and force a repayment run,
    // however, we can ensure that the crowdfundstatebox make sure it can't
    // be spent non-chalantly
    val isCrowdFundRepayment: Boolean           = if (
        cfStateBox.tokens.size == 2 &&
        CONTEXT.dataInputs.size == 3) {
            val repaymentBox: Box                   = CONTEXT.dataInputs(2)
            val loanId: Coll[Byte]                  = repaymentBox.tokens(1)._1
            val cfLoanId: Coll[Byte]                = cfStateBox.R4[Coll[Byte]].get
            val cfTokenCount: Long                  = cfStateBox.tokens(1)._2
            val repaymentBoxSLTToken: Coll[Byte]    = repaymentBox.tokens(0)._1

            allOf(Coll(
                loanId == cfLoanId,
                repaymentBoxSLTToken == _SLTRepaymentTokenId,
                cfStateBox.R6[Long].get == crowdFundRepaymentFundsState,
                cfTokenCount == 1
            ))
    } else false

    // Inputs: CrowdFundStateBox (0), LenderBoxToken (1)
    // Outputs: CrowdFundStateBox (0), LenderBoxToken (1), MiningFee(2)
    val sameCrowdFundStateBox: Boolean          = SELF.id == INPUTS(0).id && SELF.propositionBytes == OUTPUTS(0).propositionBytes
    // CF Token in refund has to be more than inputs
    val sameBoxTokenLesser: Boolean             = SELF.tokens.getOrElse(1, emptyToken)._2 < OUTPUTS(0).tokens.getOrElse(1, emptyToken)._2
    val sameBoxSameCFToken: Boolean             = SELF.tokens.getOrElse(1, emptyToken)._1 == OUTPUTS(0).tokens.getOrElse(1, emptyToken)._1
    val outCFBoxCFTokenNotOne: Boolean          = OUTPUTS(0).tokens.getOrElse(1, emptyToken)._2 != 1
    val isCrowdFundRefund: Boolean              = allOf(Coll(
        sameCrowdFundStateBox,
        sameBoxTokenLesser,
        outCFBoxCFTokenNotOne,
        sameBoxSameCFToken
    ))

    if (isCrowdFundRepayment) {
        // ===== Repayment to Funders ==== //
        // Description  :   Allows Lenders to pull out funds that are repaid.
        // Inputs       :   1. FundedCrowdFundBox
        //                  2. LenderBox
        // DataInputs   :   1. CrowdFundStateBox
        //                  2. ServiceBox
        //                  3. SLTRepaymentBox
        // Outputs      :   1. FundedCrowdFundBox (if there is)
        //                  2. LenderFundedBox
        //
        // Conditions   :   1. Check if is CrowdFundStateBox
        //                      CrowdFundStateBox
        //                      a. Ensure NFT is the same
        //                      b. Ensure cannot be spent
        //                      CrowdFundRepaymentBox
        //                      a. CrowdFundRepaymentBox.LoanToken.Id == LoanTokenId
        //                      b. OutCrowdFundRepaymentBox.LoanToken.Amount
        //                          == InCrowdFundRepaymentBox.LoanToken.Amount -
        //                          (OutLenderBox.CFToken.Amount - InLenderBox.CFToken.Amount)
        //                  2. InLenderBox.CFToken.Id == CFToken.Id
        //                  3. InLenderBox.CFToken.Amount - OutLenderBox.CFToken.Amount == LoanToken.Amount
        //
        //                  8. IMPORTANT: CrowdFundBox Hash, this is to ensure that if not all funds are repaid,
        //                          the funds are still at the same contract
        val inLenderBoxes: Coll[Box]              = INPUTS
            .filter{(box: Box) => box.propositionBytes != SELF.propositionBytes}
        val inCrowdFundFundedBoxes: Coll[Box]     = INPUTS
            .filter{(box: Box) => box.propositionBytes == SELF.propositionBytes}

        val outCFBox: Box           = OUTPUTS(0)
        // This will include the miner box too, but its okay. we only care about the cf tokens
        val outLenderBox: Box              = OUTPUTS(1)

        val DI_CrowdFundStateBox: Box       = CONTEXT.dataInputs(0)
        val DI_SLTServiceBox: Box           = CONTEXT.dataInputs(1)
        val DI_SLTRepaymentBox: Box         = CONTEXT.dataInputs(2)

        val crowdFundTokenId: Coll[Byte]        = DI_CrowdFundStateBox.R5[Coll[Byte]]
        val crowdFundBoxLoanId: Coll[Byte]      = DI_CrowdFundStateBox.R4[Coll[Byte]]
        val loanTokenId: Coll[Byte]             = DI_SLTRepaymentBox.R7[Coll[Byte]]
        val fundingDetails: Coll[Long]          = DI_SLTRepaymentBox.R4[Coll[Long]]

        val fundingGoal: Long                   = fundingDetails.get(0)
        val interestRate: Long                  = fundingDetails.get(2)
        val serviceProfitSharingInfo: Coll[Long]   = DI_SLTServiceBox.R8[Coll[Long]]
        val serviceProfitSharing: Long          = serviceProfitSharingInfo.get(0)

        val inLenderBoxCFTokenAmount: Long  = inLenderBoxes
            .flatMap{(box: Box) => box.tokens.filter{(t: (Coll[Byte], Long)) => t._1 == crowdFundTokenId.get}}
            .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})
        val outLenderBoxCFTokenAmount: Long = outLenderBox.tokens
            .filter{(t: (Coll[Byte], Long)) => t._1 == crowdFundTokenId.get}
            .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})

        val inLenderBoxLoanTokenAmount: Long  = inLenderBoxes
            .flatMap{(box: Box) => box.tokens.filter{(t: (Coll[Byte], Long)) => t._1 == loanTokenId.get}}
            .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})
        val outLenderBoxLoanTokenAmount: Long = outLenderBox.tokens
            .filter{(t: (Coll[Byte], Long)) => t._1 == loanTokenId.get}
            .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})

        val inCFBoxesLoanTokenAmount: Long  = inCrowdFundFundedBoxes
            .flatMap{(box: Box) => box.tokens.filter{(t: (Coll[Byte], Long)) => t._1 == loanTokenId.get}}
            .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})
        val outCFBoxesLoanTokenAmount: Long = outCFBox.tokens
            .filter{(t: (Coll[Byte], Long)) => t._1 == loanTokenId.get}
            .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})


        val cfTokenRedeemingAmount: Long               = inLenderBoxCFTokenAmount - outLenderBoxCFTokenAmount
        val cfBoxLoanTokenRedeemed: Long               = inCFBoxesLoanTokenAmount - outCFBoxesLoanTokenAmount
        val lenderLoanTokenRedeemed: Long              = outLenderBoxLoanTokenAmount - inLenderBoxLoanTokenAmount

        // CFRepaymentX = X + X(InterestRate)(1 - ProfitSharingService)
        val expectedRepaymentAmount: Long           = {
            val interestRateCalculation: Long = interestRate * (percentageDenominator - serviceProfitSharing)
            val interest: Long      = (cfTokenRedeemingAmount * interestRateCalculation) / (percentageDenominator * percentageDenominator)

            cfTokenRedeemingAmount + interest
        }

        // Condition 1: Check if is CrowdFundStateBox
        //                CrowdFundStateBox
        //                a. Ensure CrowdFundToken is the same
        //                b. Ensure cannot be spent
        //                CrowdFundRepaymentBox
        //                a. CrowdFundRepaymentBox.LoanToken.Id == LoanTokenId
        //                b. OutCrowdFundRepaymentBox.LoanToken.Amount
        //                    == InCrowdFundRepaymentBox.LoanToken.Amount -
        //                    (OutLenderBox.CFToken.Amount - InLenderBox.CFToken.Amount)
        // Condition 2: InLenderBox.CFToken.Id == CFToken.Id
        val isCorrectCrowdFundStateBox: Boolean = {
            allOf(Coll(
                crowdFundBoxLoanId.get == _LoanId,
            ))
        }

        val isRepaymentMade: Boolean = {
            allOf(Coll(
                expectedRepaymentAmount == lenderLoanTokenRedeemed,
                cfBoxLoanTokenRedeemed == lenderLoanTokenRedeemed
            ))
        }


        // Condition 8: IMPORTANT: CrowdFundBox Hash
        val crowdFundBoxHashSame: Boolean =
        {
            outCFBox.propositionBytes == SELF.propositionBytes
        }

        sigmaProp(allOf(Coll(
            isCorrectCrowdFundStateBox,
            isRepaymentMade,
            crowdFundBoxHashSame
        )))
    }
    else if (isCrowdFundRefund)
    {
        // ===== Refund LoanBox ==== //
        // Inputs: CrowdFundStateBox (0), LenderBoxToken (1)
        // Outputs: CrowdFundStateBox (0), LenderBoxToken (1), MiningFee(2)
        //
        // Conditions: 1. Check if the loanToken given back is the same,
        //              2. Check if funding State is
        val outCFBox: Box       = OUTPUTS(0)
        val inLenderBoxes: Box    = INPUTS.slice(1, INPUTS.size + 1)
        val outLenderBox: Box   = OUTPUTS(1)
        val DI_SLTLoanBox: Box      = CONTEXT.dataInputs(2)
        val LoanTokenId: Coll[Byte] = DI_SLTLoanBox.R7[Coll[Byte]]
        val LoanFundingInfoRegister: Coll[Long]                = DI_SLTLoanBox.R4[Coll[Long]]
        val LoanFundingGoal: Long                              = LoanFundingInfoRegister.get(0)

        val _loanIdRegister: Coll[Byte]             = cfStateBox.R4[Coll[Byte]]
        val _crowdFundTokenIdRegister: Coll[Byte]   = cfStateBox.R5[Coll[Byte]]
        val _fundingState: Long                     = cfStateBox.R6[Long]

        val __fundingStateIsFunding: Boolean        = _fundingState.get == crowdFundFundingState

        val __cfTokenEqualsLoanTokenReduced: Boolean    = {
            val inCFStateBoxCFTokenAmount: Long = SELF.tokens
                .filter{(t: (Coll[Byte], Long)) => t._1 == _crowdFundTokenIdRegister.get}
                .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})
            val outCFStateBoxCFTokenAmount: Long = outCFBox.tokens
                .filter{(t: (Coll[Byte], Long)) => t._1 == _crowdFundTokenIdRegister.get}
                .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})
            val inCFStateBoxLoanTokenAmount: Long = SELF.tokens
                .filter{(t: (Coll[Byte], Long)) => t._1 == LoanTokenId.get}
                .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})
            val outCFStateBoxLoanTokenAmount: Long = outCFBox.tokens
                .filter{(t: (Coll[Byte], Long)) => t._1 == LoanTokenId.get}
                .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})

            val reducedCFStateBoxCFTokenAmount: Long = outCFStateBoxCFTokenAmount - inCFStateBoxCFTokenAmount
            val increasedCFStateBoxLoanTokenAmount: Long = inCFStateBoxLoanTokenAmount - outCFStateBoxLoanTokenAmount

            val inLenderBoxCFTokenAmount: Long  = inLenderBoxes
                .flatMap{(box: Box) => box.tokens.filter{(t: (Coll[Byte], Long)) => t._1 == _crowdFundTokenIdRegister.get}}
                .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})
            val outLenderBoxCFTokenAmount: Long = outLenderBox.tokens
                .filter{(t: (Coll[Byte], Long)) => t._1 == _crowdFundTokenIdRegister.get}
                .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})
            val inLenderBoxLoanTokenAmount: Long = inLenderBoxes
                .flatMap{(box: Box) => box.tokens.filter{(t: (Coll[Byte], Long)) => t._1 == LoanTokenId.get}}
                .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})
            val outLenderBoxLoanTokenAmount: Long = outLenderBox.tokens
                .filter{(t: (Coll[Byte], Long)) => t._1 == LoanTokenId.get}
                .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})

            val reducedLenderBoxCFTokenAmount: Long = inLenderBoxCFTokenAmount - outLenderBoxCFTokenAmount
            val increasedLenderBoxLoanTokenAmount: Long = outLenderBoxLoanTokenAmount - inLenderBoxLoanTokenAmount

            allOf(Coll(
                reducedLenderBoxCFTokenAmount == increasedLenderBoxLoanTokenAmount,
                reducedCFStateBoxCFTokenAmount == increasedCFStateBoxLoanTokenAmount
            ))
        }

        val __sameLenderHash: Boolean       = inLenderBoxes.forall{(box: Box) => box.propositionBytes == outLenderBox.propositionBytes}

        sigmaProp(allOf(Coll(
            __fundingStateIsFunding,
            __cfTokenEqualsLoanTokenReduced,
            __sameLenderHash,
            fundingCheck
        )))
    }
    else
    {
        // Since the dataInputs for 0 is always the state box. We can use
        // the value from that to get all the registers, ##as a hack##.
        val _loanIdRegister: Coll[Byte]             = cfStateBox.R4[Coll[Byte]]
        val _crowdFundTokenIdRegister: Coll[Byte]   = cfStateBox.R5[Coll[Byte]]
        val _fundingState: Long                     = cfStateBox.R6[Long]

        val crowdFundFunding: Boolean              = _fundingState.get == crowdFundFundingState
        val crowdFundGoalFunded: Boolean           = _fundingState.get == crowdFundGoalFundedState

        if (crowdFundGoalFunded)
        {
            // ===== Fund LoanBox ==== //
            // Description  :   Merge funds with LoanBox, however, we ensure that
            //                  a CrowdFundBox is created with tokens and also
            //                  register retained and updated properly
            // Inputs       :   1. LoanBox
            //                  2. InCrowdFundBox
            // Outputs      :   1. LoanBox (Funded)
            //                  2. CrowdFundStateBox (same contract as crowdfundbox)
            //                  3. MinerFee
            //
            // Conditions   :   1. OutCrowdFundStateBox == Outputs(1)
            //                  2. OutCrowdFundStateBox.Registers replicated (except FundingState)
            //                  3. OutCrowdFundStateBox.FundingState == ReturningFunds
            //                  4. AllTokens to LoanBox
            //                  5. OutCrowdFundStateBox.Token(0) Left One
            //                      a. Amount == 1
            //                  6. CrowdFundBoxHash same for OutCrowdFundStateBox
            //                  7. Loan Funded is LoanId
            //                  8. IMPORTANT: CrowdFundBox Hash

            val InLoanBox: Box              = INPUTS(0)
            val OutLoanBox: Box             = OUTPUTS(0)

            val OutCrowdFundStateBox: Box   = OUTPUTS(1)
            val loanTokenId: Coll[Byte]     = InLoanBox.R7[Coll[Byte]]


            // Condition 1: OutCrowdFundStateBox == Outputs(1)
            // Condition 8: IMPORTANT: CrowdFundBox Hash
            val crowdFundBoxHashSame: Boolean =
            {
                OutCrowdFundStateBox.propositionBytes == SELF.propositionBytes
            }

            // Condition 2: OutCrowdFundStateBox.Registers replicated (except FundingState)
            // Condition 3: OutCrowdFundStateBox.FundingState == RepaymentFunds (2)
            val outCrowdFundBoxRegisterReplicated: Boolean = {
                val R4Same: Boolean     = _loanIdRegister.get == OutCrowdFundStateBox.R4[Coll[Byte]].get
                val R5Same: Boolean     = _crowdFundTokenIdRegister.get == OutCrowdFundStateBox.R5[Coll[Byte]].get
                val fundingStateToRepayment: Boolean = OutCrowdFundStateBox.R6[Long].get == crowdFundRepaymentFundsState

                allOf(Coll(
                    R4Same,
                    R5Same,
                    fundingStateToRepayment
                ))
            }

            // Condition 4: AllTokens to LoanBox
            // Condition 5: OutCrowdFundStateBox.Token(0) left 1
            //              a. Amount == 1
            val allLoanTokensFunded: Boolean = {
                val only1CrowdFundToken: Boolean        = allOf(Coll(
                    OutCrowdFundStateBox.tokens.size == 2,
                    OutCrowdFundStateBox.tokens(1)._1 == _crowdFundTokenIdRegister.get,
                    OutCrowdFundStateBox.tokens(1)._2 == 1
                ))

                val lendBoxReceivedLoanToken: Boolean   = allOf(Coll(
                    OutLoanBox.tokens(2)._1 == loanTokenId.get,
                    OutLoanBox.tokens(2)._2 == SELF.tokens(2)._2
                ))

                allOf(Coll(
                    only1CrowdFundToken,
                    lendBoxReceivedLoanToken
                ))
            }

            // Condition 7: Loan Funded is LoanId
            val loanFundedCorrectLoanId: Boolean = InLoanBox.tokens(1)._1 == _LoanId


            sigmaProp(allOf(Coll(
                crowdFundBoxHashSame,
                outCrowdFundBoxRegisterReplicated,
                allLoanTokensFunded,
                loanFundedCorrectLoanId,
                _cfStateBoxCheck,
                fundingCheck,
            )))
        }
        else
        {
            // ===== Funding ==== //
            // Description  :   For every token funded to this crowdfund box
            //                  we return a token of equivalent value to the
            //                  lender.
            // Inputs       :   1. CrowdFundBox, 2. LenderBox
            // Outputs      :   1. CrowdFundBox, 2. LenderBox
            // DataInputs   :   1. SLTLoanBox
            //
            // Variables    :   1. LoanT => Loan Token
            //                  2. CFundT => CrowdFund Token
            // Conditions   :   1. InLenderBox.LoanT.Amount is equal to OutLenderBox.CFundT.Amount
            //                  2. LoanT.id is equal LoanTokenId
            //                  3. All details in Register stays the same
            //                  4. InCFund.CFundT is equal to OutCFund.CFundT + OutLenderBox.CFundT
            //                  5. OutCFund.CFundT.Amount is equal to InCFund.CFundT.Amount - InLenderBox.LoanT.Amount
            //                  6. If DataInputs.LoanBox.FundingGoal == OutCFundBox.LoanToken.Amount,
            //                      a. CFundBox.FundingState == 1 (Funded)
            //                      b. CFundBox.CFundT all burned
            //                  7. FundingGoal does not exceeds
            //                  8. IMPORTANT: CrowdFundBox Hash

            val InLenderBox: Box        = INPUTS(1)
            val OutCrowdFundBox: Box    = OUTPUTS(0)
            val OutLenderBox: Box       = OUTPUTS(1)

            val DI_SLTLoanBox: Box      = CONTEXT.dataInputs(2)
            val LoanTokenId: Coll[Byte] = DI_SLTLoanBox.R7[Coll[Byte]]
            val LoanFundingInfoRegister: Coll[Long]                = DI_SLTLoanBox.R4[Coll[Long]]
            val LoanFundingGoal: Long                              = LoanFundingInfoRegister.get(0)

            val cfBoxLoanToken: Long = OutCrowdFundBox.tokens
                .filter{(t: (Coll[Byte], Long)) => t._1 == LoanTokenId.get}
                .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})

            val isFundingGoalReached: Boolean = OutCrowdFundBox.tokens(2)._2 == LoanFundingGoal


            // Condition 1: LoanToken.Amount == CFundT.Amount
            // Condition 4: InCFund.CFundT is equal to OutCFund.CFundT + OutLenderBox.CFundT
            // Condition 5: OutCFund.CFundT.Amount is equal to InCFund.CFundT.Amount - InLenderBox.LoanT.Amount
            // NOTE: Due to circumstances. Crowdfundbox can have one utility, which is receiving the funds,
            //      and then merging with the loanbox. That is it's sole responsibility.
            val cfundTokensDistributed: Boolean     =
            {
                // 1. Total amount of CF tokens given out by CFBox

                // 2. Total amount of CF Tokens received by Lender
                val outLenderBoxCFTokenAmount: Long = OutLenderBox.tokens
                    .filter{(t: (Coll[Byte], Long)) => t._1 == _crowdFundTokenIdRegister.get}
                    .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})

                val inLenderBoxCFTokenAmount: Coll[(Coll[Byte], Long)] = InLenderBox.tokens
                    .filter{(t: (Coll[Byte], Long)) => t._1 == _crowdFundTokenIdRegister.get}
                    .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})

                val totalAmountOfCFTokenReceivedByLender: Long = outLenderBoxCFTokenAmount - inLenderBoxCFTokenAmount

                val loanTokenReceived: Int              = OutCrowdFundBox.tokens(2)._2 - SELF.tokens.getOrElse(2, emptyToken)._2
                val loanTokenIdSame: Boolean            = OutCrowdFundBox.tokens(2)._1 == LoanTokenId.get

                val cfTokenDistributedViaCrowdFundBox: Boolean = if (isFundingGoalReached) {
                    allOf(Coll(
                        OutCrowdFundBox.tokens(1)._2 == 1,
                        OutCrowdFundBox.tokens(1)._1 == SELF.tokens(1)._1,
                        loanTokenIdSame
                    ))
                } else {
                    allOf(Coll(
                        SELF.tokens(1)._2 - OutCrowdFundBox.tokens(1)._2 == loanTokenReceived,
                        OutCrowdFundBox.tokens(1)._1 == SELF.tokens(1)._1,
                        loanTokenIdSame
                    ))
                }

                val lenderReceivedRightAmountOfCFTokens: Boolean = totalAmountOfCFTokenReceivedByLender == loanTokenReceived

                allOf(Coll(
                    cfTokenDistributedViaCrowdFundBox,
                    lenderReceivedRightAmountOfCFTokens
                ))
            }

            // Condition 2: LoanT.Id is equal to LoanTokenId
            val fundingTokenIsLoanTokenId: Boolean  =
            {
                // Check that the loan token box is right by identifying it against the loan id
                val checkLoanTokenBoxRight: Boolean = DI_SLTLoanBox.tokens(1)._1 == _loanIdRegister.get
                val loanTokenId: Coll[Byte]         = DI_SLTLoanBox.R7[Coll[Byte]]
                val ftIsLoanTokenId: Boolean        = OutCrowdFundBox.tokens(2)._1 == loanTokenId.get

                allOf(Coll(
                    ftIsLoanTokenId,
                    checkLoanTokenBoxRight
                ))
            }

            // Condition 3: All details in Register stays the same
            val allDetailsReplicated: Boolean =
            {
                val R4Same: Boolean     = _loanIdRegister.get == OutCrowdFundBox.R4[Coll[Byte]].get
                val R5Same: Boolean     = _crowdFundTokenIdRegister.get == OutCrowdFundBox.R5[Coll[Byte]].get

                allOf(Coll(
                    R4Same,
                    R5Same,
                ))
            }

            // Condition 6: If DataInputs.LoanBox.FundingGoal == OutCFundBox.LoanToken.Amount,
            //    a. CFundBox.FundingState == 1 (Funded)
            //    b. CFundBox.CFundT burned except for 1
            val fundingGoalReachedConditions: Boolean =
            {
                if (isFundingGoalReached) {
                    allOf(Coll(
                        OutCrowdFundBox.R6[Long].get == crowdFundGoalFundedState,
                        OutCrowdFundBox.tokens(0)._2 == 1,
                        // CF Token should be at 1 now
                        OutCrowdFundBox.tokens(1)._2 == 1,
                        isFundingGoalReached
                    ))
                } else {
                    allOf(Coll(
                        OutCrowdFundBox.R6[Long].get == crowdFundFundingState,
                        OutCrowdFundBox.tokens(0)._2 == 1,
                        // CF Token should be more than 1
                        OutCrowdFundBox.tokens(1)._2 != 1
                    ))
                }
            }

            val notBeyondFundingGoal: Boolean =
            {
                val outCFBoxLoanToken: Coll[(Coll[Byte], Long)] = OutCrowdFundBox.tokens
                    .filter{(t: (Coll[Byte], Long)) => t._1 == LoanTokenId.get}
                    .fold(0L, {(acc: Long, token: (Coll[Byte], Long)) => acc + token._2})

                allOf(Coll(
                    outCFBoxLoanToken <= LoanFundingGoal
                ))
            }

            // Condition 8: IMPORTANT: CrowdFundBox Hash
            val crowdFundBoxHashSame: Boolean =
            {
                OutCrowdFundBox.propositionBytes == SELF.propositionBytes
            }

            sigmaProp(allOf(Coll(
                cfundTokensDistributed,
                fundingTokenIsLoanTokenId,
                allDetailsReplicated,
                fundingGoalReachedConditions,
                crowdFundBoxHashSame,
                _cfStateBoxCheck,
                fundingCheck,
                notBeyondFundingGoal
            )))
        }
    }
}