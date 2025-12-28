export const CROWDFUND_CONTRACT = `{
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

    val sameCrowdFundStateBox: Boolean          = SELF.id == INPUTS(0).id && SELF.propositionBytes == OUTPUTS(0).propositionBytes
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
        val inLenderBoxes: Coll[Box]              = INPUTS
            .filter{(box: Box) => box.propositionBytes != SELF.propositionBytes}
        val inCrowdFundFundedBoxes: Coll[Box]     = INPUTS
            .filter{(box: Box) => box.propositionBytes == SELF.propositionBytes}

        val outCFBox: Box           = OUTPUTS(0)
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

        val expectedRepaymentAmount: Long           = {
            val interestRateCalculation: Long = interestRate * (percentageDenominator - serviceProfitSharing)
            val interest: Long      = (cfTokenRedeemingAmount * interestRateCalculation) / (percentageDenominator * percentageDenominator)
            cfTokenRedeemingAmount + interest
        }

        val isCorrectCrowdFundStateBox: Boolean = {
            allOf(Coll(
                crowdFundBoxLoanId.get == _LoanId
            ))
        }

        val isRepaymentMade: Boolean = {
            allOf(Coll(
                expectedRepaymentAmount == lenderLoanTokenRedeemed,
                cfBoxLoanTokenRedeemed == lenderLoanTokenRedeemed
            ))
        }

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
        val _loanIdRegister: Coll[Byte]             = cfStateBox.R4[Coll[Byte]]
        val _crowdFundTokenIdRegister: Coll[Byte]   = cfStateBox.R5[Coll[Byte]]
        val _fundingState: Long                     = cfStateBox.R6[Long]

        val crowdFundFunding: Boolean              = _fundingState.get == crowdFundFundingState
        val crowdFundGoalFunded: Boolean           = _fundingState.get == crowdFundGoalFundedState

        if (crowdFundGoalFunded)
        {
            val InLoanBox: Box              = INPUTS(0)
            val OutLoanBox: Box             = OUTPUTS(0)

            val OutCrowdFundStateBox: Box   = OUTPUTS(1)
            val loanTokenId: Coll[Byte]     = InLoanBox.R7[Coll[Byte]]

            val crowdFundBoxHashSame: Boolean =
            {
                OutCrowdFundStateBox.propositionBytes == SELF.propositionBytes
            }

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

            val loanFundedCorrectLoanId: Boolean = InLoanBox.tokens(1)._1 == _LoanId

            sigmaProp(allOf(Coll(
                crowdFundBoxHashSame,
                outCrowdFundBoxRegisterReplicated,
                allLoanTokensFunded,
                loanFundedCorrectLoanId,
                _cfStateBoxCheck,
                fundingCheck
            )))
        }
        else
        {
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

            val cfundTokensDistributed: Boolean     =
            {
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

            val fundingTokenIsLoanTokenId: Boolean  =
            {
                val checkLoanTokenBoxRight: Boolean = DI_SLTLoanBox.tokens(1)._1 == _loanIdRegister.get
                val loanTokenId: Coll[Byte]         = DI_SLTLoanBox.R7[Coll[Byte]]
                val ftIsLoanTokenId: Boolean        = OutCrowdFundBox.tokens(2)._1 == loanTokenId.get

                allOf(Coll(
                    ftIsLoanTokenId,
                    checkLoanTokenBoxRight
                ))
            }

            val allDetailsReplicated: Boolean =
            {
                val R4Same: Boolean     = _loanIdRegister.get == OutCrowdFundBox.R4[Coll[Byte]].get
                val R5Same: Boolean     = _crowdFundTokenIdRegister.get == OutCrowdFundBox.R5[Coll[Byte]].get

                allOf(Coll(
                    R4Same,
                    R5Same
                ))
            }

            val fundingGoalReachedConditions: Boolean =
            {
                if (isFundingGoalReached) {
                    allOf(Coll(
                        OutCrowdFundBox.R6[Long].get == crowdFundGoalFundedState,
                        OutCrowdFundBox.tokens(0)._2 == 1,
                        OutCrowdFundBox.tokens(1)._2 == 1,
                        isFundingGoalReached
                    ))
                } else {
                    allOf(Coll(
                        OutCrowdFundBox.R6[Long].get == crowdFundFundingState,
                        OutCrowdFundBox.tokens(0)._2 == 1,
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
}`;
