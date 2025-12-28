{
    // ===== Contract Info ===== //
    // Name             : SLT [Single Lender Tokens] Lend Box Guard Script
    // Description      : A single lender lend box allows interested lenders to participate
    //                    in the activity of lending to a borrower. The box ensures that
    //                    all value within the box is funded to the borrower and borrower
    //                    only. It also ensures that a repayment box is created upon successful
    //                    lending.
    // Type             : Guard Script
    // Author           : Kii
    // Last Modified    : Nov 5th 2022
    // Version          : v 1.1
    // Status           : Live Testing Phase
    // Modification Logs: 1.1 - add unmodified state to work with crowdfund box
    //                      In this state, the lendbox has to come out unmodified.

    // ===== Contract Hard-Coded Constants ===== //
    // val _MinFee:                     Long
    // val _MaxByteBoxFee:              Long
    // val _MinBoxAmount:               Long
    // val _SLTServiceNFTId:            Coll[Byte]
    // val _SLTLendTokenId:             Coll[Byte]
    // val _SLTRepaymentTokenId:        Coll[Byte]

    // ===== Contract Conditions ===== //
    // 1. Fund Lend         - Fund the lend box when it is still fundable
    // 2. Fund Successful   - Loan has been successfully funded and is ready for the next step
    // 3. Refund Lend       - The lend box has existed past its deadline and the box is absorbed
    // 4. Mistakenly Funded - If the box was funded during creation (No lender and can't accept funds)
    //                        The box will be refunded back to the borrower.
    // 5. Modify Funding Details    - Modify the details of funding

    // ===== Contract Constants ===== //
    // #### Registers #### //
    val _fundingInfoRegister: Coll[Long]                = SELF.R4[Coll[Long]]
    val _projectDetailRegister: Coll[Coll[Byte]]        = SELF.R5[Coll[Coll[Byte]]]
    val _borrowerRegister: Coll[Byte]                   = SELF.R6[Coll[Byte]]
    val _loanTokenId: Coll[Byte]                        = SELF.R7[Coll[Byte]]
    val _lenderRegister: Coll[Byte]                     = SELF.R8[Coll[Byte]]

    // #### Others #### //
    val _fundingGoal: Long                              = _fundingInfoRegister.get(0)
    val _deadlineHeight: Long                           = _fundingInfoRegister.get(1)
    val _interestRate: Long                             = _fundingInfoRegister.get(2)
    val _repaymentHeightLength: Long                    = _fundingInfoRegister.get(3)

    // This is following modify lend box
    val inLenderDefined: Boolean                 = SELF.R8[Coll[Byte]].isDefined

    // #### Conditions #### //
    val deadlinePassed: Boolean                 = HEIGHT > _deadlineHeight
    val modifyLendBox: Boolean                  = {
        allOf(Coll(
            // 1. The Non-Loan token has to be the same.
            // Loan Identifier and ExleLoan Identifier
            SELF.tokens.size        == OUTPUTS(0).tokens.size,
            SELF.tokens(0)          == OUTPUTS(0).tokens(0),
            SELF.tokens(1)          == OUTPUTS(0).tokens(1),
            SELF.value              == OUTPUTS(0).value,

            // 2. Has to still be a loan box
            SELF.propositionBytes   == OUTPUTS(0).propositionBytes,

            // 3. Borrower has to be the same borrower
            _borrowerRegister.get   == OUTPUTS(0).R6[Coll[Byte]].get,

            // 4. You can't change loan details after it is funded.
            !inLenderDefined,

            // 5. Some of the registers has difference in value
            anyOf(Coll(
                SELF.R4[Coll[Long]]         != OUTPUTS(0).R4[Coll[Long]],
                SELF.R5[Coll[Coll[Byte]]]   != OUTPUTS(0).R5[Coll[Coll[Byte]]],
                SELF.R7[Coll[Byte]]         != OUTPUTS(0).R7[Coll[Byte]],
            ))
        ))
    }

    // #NOTE: Due to convenience sake, unmodification can only be done when the
    // Loanbox ends up being in the second output.
    val isUnmodifiedLendBox: Boolean            = {
        allOf(Coll(
            OUTPUTS.size > 3,
            OUTPUTS(1).tokens.size > 1,
        ))
    }

    // ===== Funded Successful ===== //
    // Description  : The funding is completed, and we're moving towards
    //              distributing the funds and converting the box to a
    //              repayment box
    // Input Boxes  : 0 -> SLTServiceBox, 1 -> SELF
    // Output Boxes : 0 -> SLTServiceBox, 1 -> SLTRepaymentBox, 2 -> FundsToBorrowerBox, 3 -> MiningFee
    //
    // Trigger Conditions:
    //      1. Loan hit funding goal
    //      2. Lender Register not empty

    val isMoreThanTwoToken: Boolean             = SELF.tokens.size > 2
    val emptyToken: (Coll[Byte], Long)          = (Coll(1.toByte), 0L)
    val loanHitFundingGoal: Boolean             = isMoreThanTwoToken && SELF.tokens.getOrElse(2, emptyToken)._2 == _fundingGoal
    val ergValueEnoughForTx: Boolean            = SELF.value >= (_MinFee * 3)
    val lenderNonEmpty: Boolean                 = _lenderRegister.isDefined
    val isFunded: Boolean                       = loanHitFundingGoal && lenderNonEmpty && ergValueEnoughForTx
    val absorbLendBox: Boolean                  = deadlinePassed && !loanHitFundingGoal


    val serviceBoxInteraction: Boolean          = INPUTS(0).tokens(0)._1 == _SLTServiceNFTId
    val serviceBoxLendTokenIncrement: Boolean   = INPUTS(0).tokens(1)._2 + 1 == OUTPUTS(0).tokens(1)._2 && INPUTS(0).tokens(1)._1 == OUTPUTS(0).tokens(1)._1
    val serviceBoxRepaymentTokenSame: Boolean   = INPUTS(0).tokens(2) == OUTPUTS(0).tokens(2)
    val isCancel: Boolean                       = serviceBoxInteraction && serviceBoxLendTokenIncrement && serviceBoxRepaymentTokenSame

    if (isFunded && !isCancel)
    {
        // #### Boxes #### //
        val inputSLTServiceBox: Box                 = INPUTS(0)

        val outputSLTServiceBox: Box                = OUTPUTS(0)
        val outputSLTRepaymentBox: Box              = OUTPUTS(1)
        val fundsToBorrowerBox: Box                 = OUTPUTS(2)

        val loanToken: (Coll[Byte], Long)           = SELF.tokens(2)
        val repaymentDetails: Coll[Long]            = outputSLTRepaymentBox.R9[Coll[Long]]
        val repaymentBoxFundedHeight: Long          = repaymentDetails.get(0)
        val repaymentBoxRepaymentAmount: Long       = repaymentDetails.get(1)
        val repaymentBoxInterestRate: Long          = repaymentDetails.get(2)
        val repaymentBoxRepaymentHeightGoal: Long   = repaymentDetails.get(3)
        val totalInterestAmount: Long               = (_fundingGoal * _interestRate / 1000)

        // #### Condition Checks #### //
        val loanToBorrower: Boolean                 = {
            allOf(Coll(
                fundsToBorrowerBox.tokens(0)._1         == loanToken._1,
                fundsToBorrowerBox.tokens(0)._2         == loanToken._2,
                fundsToBorrowerBox.propositionBytes     == _borrowerRegister.get
            ))
        }

        val repaymentBoxCreation: Boolean           = {
            allOf(Coll(
                outputSLTRepaymentBox.tokens(0)._1      == _SLTRepaymentTokenId,
                outputSLTRepaymentBox.tokens(0)._2      == 1,
                outputSLTRepaymentBox.value             == _MaxByteBoxFee,
            ))
        }

        val loanNftTransfer: Boolean                    = {
            allOf(Coll(
                outputSLTRepaymentBox.tokens(1)         == SELF.tokens(1)
            ))
        }

        val fundDetailsReplicated: Boolean          = {
            allOf(Coll(
                outputSLTRepaymentBox.R4[Coll[Long]]        == _fundingInfoRegister,
                outputSLTRepaymentBox.R5[Coll[Coll[Byte]]]  == _projectDetailRegister,
                outputSLTRepaymentBox.R6[Coll[Byte]]        == _borrowerRegister,
                outputSLTRepaymentBox.R7[Coll[Byte]]        == _loanTokenId,
                outputSLTRepaymentBox.R8[Coll[Byte]]        == _lenderRegister
            ))
        }

        val repaymentDetailCreated: Boolean         = {
            allOf(Coll(
                repaymentBoxRepaymentAmount     == _fundingGoal + totalInterestAmount,
                repaymentBoxInterestRate        == totalInterestAmount,
                repaymentBoxRepaymentHeightGoal == _deadlineHeight + _repaymentHeightLength
            ))
        }

        val serviceBoxVerification: Boolean         = inputSLTServiceBox.tokens(0)._1 == _SLTServiceNFTId

        sigmaProp(allOf(Coll(
            loanToBorrower,
            repaymentBoxCreation,
            fundDetailsReplicated,
            repaymentDetailCreated,
            serviceBoxVerification,
            loanNftTransfer
        )))
    }
    else if (absorbLendBox)
    {
        // ===== Not Funded Actions ===== //
        // Description  : A lend box can exists in 2 states. Funded, or not funded.
        //              In this else bracket, we exists in the not funded state.
        //              We can go through multiple steps within this stage.
        //

        // ===== Refund: Deadline Passed ===== //
        // Description  : When the deadline passed, the box will definitely be
        //              in the state of not funded at all. Therefore we can
        //              just consume the lend box
        // Input Boxes  : 0 -> SLTServiceBox, 1 -> SELF
        // Output Boxes : 0 -> SLTServiceBox, 1 -> MiningFee
        // Loan token would not exist.
        // #### Not Funded Constants ####
        val loanDidNotHitFundingGoal: Boolean       =
            if (SELF.tokens.size > 2) {
                SELF.tokens(2)._2 < _fundingGoal
            } else true

        sigmaProp(allOf(Coll(
            serviceBoxInteraction,
            deadlinePassed,
            loanDidNotHitFundingGoal)))
    }
    else if (isCancel)
    {
        // ===== Cancel Loan ===== //
        // Description  : User Cancelling the Loan
        // Input Boxes  : 0 -> SLTServiceBox, 1 -> SELF, 2-> BorrowerBox
        // Output Boxes : 0 -> SLTServiceBox, 1 -> MiningFee
        // Loan token would not exist.

        // #### Not Funded Constants ####
        val borrowerBox: Box                        = INPUTS(2)

        val isBorrowerBox: Boolean                  = borrowerBox.propositionBytes == _borrowerRegister.get

        if (isFunded) {
            val outLenderBox: Box               = OUTPUTS(1)
            val isLenderBox: Boolean            = outLenderBox.propositionBytes == _lenderRegister.get
            val lenderBoxGetsFund: Boolean      = outLenderBox.tokens(0) == SELF.tokens(2)

            sigmaProp(allOf(Coll(
                isLenderBox,
                isBorrowerBox,
                lenderBoxGetsFund,
                isCancel
            )))
        } else {
            sigmaProp(allOf(Coll(
                isBorrowerBox,
                isCancel
            )))
        }
    }
    else if (modifyLendBox)
    {
        // ===== Modify Lend Box ===== //
        // Description  : Modify the information of the lend Box
        // Input Boxes  : 0 -> SELF, 1 -> UserFee
        // Output Boxes : 0 -> OutLendBox, 1 -> MiningFee
        //
        // Trigger Conditions:
        //      1. Loan hit funding goal
        //      2. Lender Register not empty
        val outLendBox: Box     = OUTPUTS(0)
        val isSizeOfFundingDetailsSame: Boolean     = _fundingInfoRegister.get.size == outLendBox.R4[Coll[Long]].get.size
        val isSizeOfLoanDetailsSame: Boolean        = _projectDetailRegister.get.size == outLendBox.R5[Coll[Coll[Byte]]].get.size
        val isLoanTokenIdDefined: Boolean           = outLendBox.R7[Coll[Byte]].isDefined

        // ##### Constants Declaration ##### //
        val outFundingInfoRegister: Coll[Long]          = outLendBox.R4[Coll[Long]]

        val lenderDefined: Boolean                      = OUTPUTS(0).R8[Coll[Byte]].isDefined

        val lendBoxCheck: Boolean                   = {
            allOf(Coll(
                _fundingInfoRegister == outFundingInfoRegister,
                _loanTokenId == outLendBox.R7[Coll[Byte]],
                // Ensure Loan NFT Identifier gets transferred
                outLendBox.tokens(1)              == SELF.tokens(1),
                !lenderDefined
            ))
        }

        val txFeeIsBorrower: Boolean                = INPUTS(1).propositionBytes == _borrowerRegister.get

        sigmaProp(allOf(Coll(
            lendBoxCheck,
            isSizeOfFundingDetailsSame,
            isSizeOfLoanDetailsSame,
            modifyLendBox,
            txFeeIsBorrower
        )))
    }
    else if (isUnmodifiedLendBox)
    {
        // ===== Unmodified Lend Box ===== //
        // Description  : Have the lendbox go through a condition where
        //                  nothing is changed.
        // Input Boxes  : 0 -> Random Box, 1 -> LendBox
        // Output Boxes : 0 -> Random Box, 1 -> LendBox, 2 -> MiningFee
        val outputLendBox: Box = OUTPUTS(1)
        val selfLoanTokens = SELF.tokens.getOrElse(2, emptyToken)
        val outputLoanBoxLoanTokens = outputLendBox.tokens.getOrElse(2, emptyToken)
        val unmodifiedLendBox: Boolean              =
            if (OUTPUTS.size > 2)
            {
                allOf(Coll(
                    // 1. The Non-Loan token has to be the same.
                    // Loan Identifier and ExleLoan Identifier
                    SELF.tokens.size        == outputLendBox.tokens.size,
                    SELF.tokens(0)          == outputLendBox.tokens(0),
                    SELF.tokens(1)          == outputLendBox.tokens(1),
                    selfLoanTokens          == outputLoanBoxLoanTokens,
                    SELF.value              == outputLendBox.value,

                    // 2. Has to still be a loan box
                    SELF.propositionBytes   == outputLendBox.propositionBytes,

                    // 3. Borrower has to be the same borrower
                    _borrowerRegister.get   == outputLendBox.R6[Coll[Byte]].get,

                    // 4. You can't change loan details after it is funded.
                    !inLenderDefined,
                    // 5. All of the registers are same
                    SELF.R4[Coll[Long]]         == outputLendBox.R4[Coll[Long]],
                    SELF.R5[Coll[Coll[Byte]]]   == outputLendBox.R5[Coll[Coll[Byte]]],
                    SELF.R7[Coll[Byte]]         == outputLendBox.R7[Coll[Byte]],
                ))
            } else false
        sigmaProp(unmodifiedLendBox)
    }
    else
    {
        // #### Boxes #### //
        val inputSLTServiceBox: Box         = INPUTS(0)

        val outputSLTServiceBox: Box        = OUTPUTS(0)

        // ===== Mistakenly Funded: When Initiated ===== //
        // Description  : Sometimes there will exists states where the lendbox is
        //              mistakenly funded during the creation of the lendbox as
        //              the lendbox is a new output box, therefore there is no
        //              contract to control it's input. We have to refund this
        //              type of boxes.
        // Input Boxes  : 0 -> SLTServiceBox, 1 -> SELF
        // Output Boxes : 0 -> SLTServiceBox, 1 -> RefundToBorrowerBox, 2 -> MiningFee
        val isLenderEmpty: Boolean          = !_lenderRegister.isDefined
        val serviceBoxCheck: Boolean        = inputSLTServiceBox.tokens(0)._1 == _SLTServiceNFTId

        val mistakenlyFunded: Boolean       = allOf(Coll(isLenderEmpty && serviceBoxCheck))
        if (mistakenlyFunded)
        {
            val refundToBorrowerBox: Box    = OUTPUTS(1)
            val valueRefunded: Boolean      = refundToBorrowerBox.value == SELF.value - _MinFee

            val refundBoxToLender: Boolean  = refundToBorrowerBox.propositionBytes == _borrowerRegister.get

            sigmaProp(allOf(Coll(
                mistakenlyFunded,
                valueRefunded,
                refundBoxToLender
            )))
        }
        else
        {
            // ===== Fund Actions ===== //
            // Description  : If we do not get into any other situations, it means we
            //              are open for business (funding). We handle funding situations
            //              and edge cases in here.
            // Input Boxes  : 0 -> SELF, 1 -> PaymentBox
            // OutputBoxes  : 0 -> OutputSLTLendBox, 1 -> MiningFee
            // #### Boxes #### //
            val outputSLTLendBox: Box               = OUTPUTS(0)

            val lenderRegisterDefined: Boolean      = outputSLTLendBox.R8[Coll[Byte]].isDefined
            val fundedTokenValueTransferred: Boolean     = {
                allOf(Coll(
                    // @todo kii check all loantokenId comparison
                    // NOTE: I forgot what this meant. But I'm
                    // leaving it here in hopes that one day I'll
                    // figure it out if it's important.
                    outputSLTLendBox.tokens(2)._1           == _loanTokenId.get,
                    outputSLTLendBox.tokens(2)._2           == _fundingGoal
                ))
            }

            val outLendBoxErgValueSufficientForLendToRepaymentTx: Boolean =
                outputSLTLendBox.value >= ((_MinFee * 2) + _MaxByteBoxFee)

            val lendBoxDetailReplication: Boolean   = {
                allOf(Coll(
                    outputSLTLendBox.R4[Coll[Long]]         == _fundingInfoRegister,
                    outputSLTLendBox.R5[Coll[Coll[Byte]]]   == _projectDetailRegister,
                    outputSLTLendBox.R6[Coll[Byte]]         == _borrowerRegister,
                    outputSLTLendBox.R7[Coll[Byte]]         == _loanTokenId,
                    outputSLTLendBox.propositionBytes       == SELF.propositionBytes,
                    outputSLTLendBox.tokens(0)              == SELF.tokens(0),
                    outputSLTLendBox.tokens(1)              == SELF.tokens(1)
                ))
            }

            sigmaProp(allOf(Coll(
                lenderRegisterDefined,
                fundedTokenValueTransferred,
                lendBoxDetailReplication,
                outLendBoxErgValueSufficientForLendToRepaymentTx
            )))
        }
    }
}