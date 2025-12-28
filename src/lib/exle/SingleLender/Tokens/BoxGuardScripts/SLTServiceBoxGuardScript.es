{
    // ===== Contract Info ===== //
    // Name             : SLT [Single Lender Tokens] Service Box Guard Script
    // Description      : A single lender service box manages the boxes that are run throughout
    //                    the SLE system. This will ensure that lend and repayment boxes receives
    //                    their identification tokens. It ensures that the Exle DAO is paid through
    //                    service fees and interest cut.
    // Type             : Guard Script
    // Author           : Kii
    // Last Modified    : Nov 5th 2022
    // Version          : v 1.1
    // Status           : Live Testing Phase
    // Modification Logs: 1.1 - Added CrowdFundTokens to ServiceBox and logic to
    //                      to create CrowdFundBox.

    // ===== Contract Hard-Coded Constants ===== //
    // val _MinFee:                         Long
    // val _MaxByteBoxFee:                  Long
    // val _OwnerPK:                        Coll[Byte]

    // ===== Contract Conditions ===== //
    // 1. Mutating Service Box          - Mutate Service box with new logic
    // 2. Lend Initiation               - Initialized/create a loan box
    // 3. Lend to Repayment             - Lend box succeeds in funding, and is converted to Repayment box
    // 4. Repayment Absorption          - Absorbing repayment box (may be defaulted or completed)
    //      a. Defaulted | Zero Interest        - As stated
    //      b. Completed                        - Repayment Success
    // 5. Lend Box Absorption           - Absorbing a lend box due to inactivity

    // ===== Contract Constants ===== //
    // ##### Boxes ##### //
    val _inputServiceBox: Box                   = INPUTS(0)
    val _outputServiceBox: Box                  = OUTPUTS(0)

    // ##### Values ##### //
    val emptyToken: (Coll[Byte], Long)          = (Coll(1.toByte), 0L)
    val _creationInfo: Coll[Long]               = SELF.R4[Coll[Long]]
    val _contractHashes: Coll[Coll[Byte]]       = SELF.R5[Coll[Coll[Byte]]]
    val _serviceOwnerPubKey: Coll[Byte]         = SELF.R7[Coll[Byte]]
    val _serviceProfitSharingInfo: Coll[Long]   = SELF.R8[Coll[Long]]
    val _serviceFee: Long                       = _serviceProfitSharingInfo.get(1)
    val _sltLendBoxHash: Coll[Byte]             = _contractHashes.get(0)
    val _sltRepaymentBoxHash: Coll[Byte]        = _contractHashes.get(1)

    // ##### Conditions ##### //
    val _serviceFullCheck: Boolean              = {
        allOf(Coll(
            _outputServiceBox.propositionBytes      == _inputServiceBox.propositionBytes,
            _outputServiceBox.tokens(0)._1          == _inputServiceBox.tokens(0)._1,
            _outputServiceBox.tokens(1)._1          == _inputServiceBox.tokens(1)._1,
            _outputServiceBox.tokens(2)._1          == _inputServiceBox.tokens(2)._1,
            _outputServiceBox.tokens(3)._1          == _inputServiceBox.tokens(3)._1,
            _outputServiceBox.tokens.size           == 4,
            _outputServiceBox.value                 == _inputServiceBox.value,
            _outputServiceBox.R5[Coll[Coll[Byte]]]  == _inputServiceBox.R5[Coll[Coll[Byte]]],
            _outputServiceBox.R6[Coll[Byte]]        == _inputServiceBox.R6[Coll[Byte]],
            _outputServiceBox.R7[Coll[Byte]]        == _inputServiceBox.R7[Coll[Byte]]
        ))
    }

    val _serviceLongCheck: Boolean              = {
        allOf(Coll(
            _outputServiceBox.R4[Coll[Long]]        == _inputServiceBox.R4[Coll[Long]],
            _outputServiceBox.R8[Coll[Long]]        == _inputServiceBox.R8[Coll[Long]]
        ))
    }

    val _lendBoxTokensUnchanged: Boolean        = _inputServiceBox.tokens(1)._2 == _outputServiceBox.tokens(1)._2
    val _lendBoxTokenAbsorbed: Boolean          = _inputServiceBox.tokens(1)._2 + 1 == _outputServiceBox.tokens(1)._2
    val _lendBoxTokenDistribution: Boolean      = _inputServiceBox.tokens(1)._2 - 1 == _outputServiceBox.tokens(1)._2

    val _repaymentBoxTokensUnchanged: Boolean   = _inputServiceBox.tokens(2)._2 == _outputServiceBox.tokens(2)._2
    val _repaymentBoxTokenAbsorbed: Boolean     = _inputServiceBox.tokens(2)._2 + 1 == _outputServiceBox.tokens(2)._2
    val _repaymentBoxTokenDistribution: Boolean = _inputServiceBox.tokens(2)._2 - 1 == _outputServiceBox.tokens(2)._2

    val _crowdFundTokensUnchanged: Boolean   = _inputServiceBox.tokens(3)._2 == _outputServiceBox.tokens(3)._2
    val _crowdFundTokenAbsorbed: Boolean     = _inputServiceBox.tokens(3)._2 + 1 == _outputServiceBox.tokens(3)._2
    val _crowdFundTokenDistribution: Boolean = _inputServiceBox.tokens(3)._2 - 1 == _outputServiceBox.tokens(3)._2

    // ##### Trigger Actions ##### //
    val _mutateServiceBox: Boolean              = {
        allOf(Coll(
            _lendBoxTokensUnchanged,
            _repaymentBoxTokensUnchanged,
            _crowdFundTokensUnchanged
        ))
    }

    val _SLTLoanCreation: Boolean               = {
        allOf(Coll(
            _lendBoxTokenDistribution,
            _repaymentBoxTokensUnchanged,
            _crowdFundTokensUnchanged
        ))
    }

    val _SLTLendToRepaymentConversion: Boolean  = {
        allOf(Coll(
            _lendBoxTokenAbsorbed,
            _repaymentBoxTokenDistribution,
            _crowdFundTokensUnchanged
        ))
    }

    val _SLTRepaymentCompletion: Boolean        = {
        allOf(Coll(
            _lendBoxTokensUnchanged,
            _repaymentBoxTokenAbsorbed,
            _crowdFundTokensUnchanged
        ))
    }

    val _SLTLoanAbsorption: Boolean             = {
        allOf(Coll(
            _lendBoxTokenAbsorbed,
            _repaymentBoxTokensUnchanged,
            _crowdFundTokensUnchanged
        ))
    }

    val _SLTCrowdFundCreation: Boolean          = {
        allOf(Coll(
            _lendBoxTokensUnchanged,
            _repaymentBoxTokensUnchanged,
            _crowdFundTokenDistribution
        ))
    }

    val _SLTCrowdFundAbsorption: Boolean          = {
        allOf(Coll(
            _lendBoxTokensUnchanged,
            _repaymentBoxTokensUnchanged,
            _crowdFundTokenAbsorbed
        ))
    }

    // ===== Mutating service box ===== //
    // Description  : Mutate the box when there is no interaction with other boxes
    // Input Boxes  : 0 -> SELF
    // Output Boxes : 0 -> OutputSLTServiceBox, 1 -> MiningFee
    if (_mutateServiceBox)
    {
        _OwnerPK
    }
    else if (_SLTLoanCreation)
    {
        // ===== Lend Initiation ===== //
        // Description  : Create a Loan
        // Input Boxes  : 0 -> SELF, 1 -> SLTCreateLendBoxPaymentBox
        // Output Boxes : 0 -> OutputSLTServiceBox, 1 -> ServiceFeeBox, 2 -> SLTLendBox, 3 -> MiningFee
        // ##### Boxes ##### //
        val serviceFeeBox: Box      = OUTPUTS(2)
        val sltLendBox: Box         = OUTPUTS(1)

        // ##### Constants Declaration ##### //
        val fundingInfoRegister: Coll[Long]         = sltLendBox.R4[Coll[Long]]
        val fundingGoal: Long                       = fundingInfoRegister.get(0)
        val deadlineHeight: Long                    = fundingInfoRegister.get(1)
        val interestRate: Long                      = fundingInfoRegister.get(2)
        val repaymentHeightLength: Long             = fundingInfoRegister.get(3)

        val lendBoxCheck: Boolean                   = {
            allOf(Coll(
                fundingGoal > 0,
                deadlineHeight - HEIGHT > 0,
                interestRate >= 0,
                repaymentHeightLength > 0,
                // Instantitation of Loan Identifier NFT
                sltLendBox.tokens(1)._1 == INPUTS(0).id,
                sltLendBox.tokens(1)._2 == 1,
                sltLendBox.value == _MaxByteBoxFee
            ))
        }

        val isLendInitiationServiceCheck: Boolean   = {
            allOf(Coll(
                blake2b256(sltLendBox.propositionBytes) == _sltLendBoxHash,
                serviceFeeBox.value >= _serviceFee,
                serviceFeeBox.propositionBytes == _serviceOwnerPubKey.get
            ))
        }

        sigmaProp(allOf(Coll(
            lendBoxCheck,
            isLendInitiationServiceCheck,
            _serviceFullCheck,
            _serviceLongCheck
        )))
    }
    else if (_SLTLendToRepaymentConversion)
    {
        // ===== Lend to Repayment (Lend Success) ===== //
        // Description  : Lend Box is fully funded, therefore we convert it to
        //              repayment box
        // Input Boxes  : 0 -> SELF, 1 -> SLTLendBox
        // Output Boxes : 0 -> OutputSLTServiceBox, 1 -> SLTRepaymentBox, 2 -> BorrowerLoanedFunds, 3 -> MiningFee
        // ##### Boxes ##### //
        val sltLendBox: Box         = INPUTS(1)
        val sltRepaymentBox: Box    = OUTPUTS(1)

        val lendBoxCheck: Boolean       = {
            allOf(Coll(
                sltLendBox.tokens(0)._1     == SELF.tokens(1)._1,
                blake2b256(sltLendBox.propositionBytes) == _sltLendBoxHash,
            ))
        }

        val repaymentBoxCheck: Boolean  = {
            allOf(Coll(
                blake2b256(sltRepaymentBox.propositionBytes) == _sltRepaymentBoxHash,
                sltRepaymentBox.tokens(0)._1    == SELF.tokens(2)._1,
                sltRepaymentBox.tokens(0)._2    == 1,
                sltRepaymentBox.tokens(1)       == sltLendBox.tokens(1)
            ))
        }

        sigmaProp(allOf(Coll(
            lendBoxCheck,
            repaymentBoxCheck,
            _serviceFullCheck,
            _serviceLongCheck
        )))
    }
    else if (_SLTRepaymentCompletion)
    {
        // ===== Repayment Absorption ===== //
        // Description  : Repayment Completed in one way or another (defaulted and what not),
        //              therefore we try to absorb the box
        // Input Boxes  : 0 -> SELF, 1 -> SLTRepaymentBox
        // ##### Contract Constants ##### //
        // ##### Boxes ##### //
        val sltRepaymentBox: Box    = INPUTS(1)

        // ##### Values ##### //
        val repaymentDetailsRegister: Coll[Long]    = sltRepaymentBox.R9[Coll[Long]]
        val fundingInfoRegister: Coll[Long]         = sltRepaymentBox.R4[Coll[Long]]

        val loanInterestRate: Long                  = fundingInfoRegister.get(2)
        val repaymentAmount: Long                   = repaymentDetailsRegister.get(1)
        val repaymentInterestAmount: Long           = repaymentDetailsRegister.get(2)
        val repaymentHeightGoal: Long               = repaymentDetailsRegister.get(3)
        val profitSharingPercentage: Long           = SELF.R8[Coll[Long]].get(0)
        val profitSharingAmount: Long               = (repaymentInterestAmount * profitSharingPercentage) / 1000

        // ===== Defaulted | Zero Interest Loans ===== //
        // Description  : For conditions like, Defaulted, zero interest loan. We are not taking
        //              profits. Therefore we run it differently as compared to fully funded
        // Output Boxes : 0 -> OutputSLTServiceBox, 1 -> LenderRepaidFundBox, 2 -> MiningFee
        val interestRateZero: Boolean       = loanInterestRate == 0
        val defaulted: Boolean              = {
            allOf(Coll(
                repaymentHeightGoal < HEIGHT,
                sltRepaymentBox.value < repaymentAmount
            ))
        }

        if (interestRateZero || defaulted)
        {
            sigmaProp(_serviceFullCheck && _serviceLongCheck)
        }
        else
        {
            // ==== Successful Repayment ===== //
            // Description  : The repayment is successful and we cant ake profit as
            //              interest rate is not 0
            // Output Boxes : 0 -> OutputSLTServiceBox, 1 -> ProfitSharingBox, 2 -> LenderRepaidFundBox, 3 -> MiningFee
            // ##### Boxes ##### //
            val profitSharingBox: Box       = OUTPUTS(1)

            val profitSharingCheck: Boolean         = {
                allOf(Coll(
                    profitSharingBox.propositionBytes   == _serviceOwnerPubKey.get,
                    profitSharingBox.tokens(0)._2       == profitSharingAmount
                ))
            }

            sigmaProp(allOf(Coll(
                profitSharingCheck,
                _serviceFullCheck,
                _serviceLongCheck
            )))
        }
    }
    else if (_SLTLoanAbsorption)
    {
        // ===== Refund Lend Box ===== //
        // Description  : LendBox is not funded, therefore we absorb the lendbox
        // Input Boxes  : 0 -> SELF, 1 -> SLTLendBox
        // Output Boxes : 0 -> OutputSLTServiceBox, 1 -> MiningFee
        sigmaProp(allOf(Coll(
            _serviceFullCheck,
            _serviceLongCheck,
            _SLTLoanAbsorption
        )))
    }
    else if (_SLTCrowdFundCreation)
    {
        // ===== Crowd Fund Creation ===== //
        // Description  : Create crowdFund box
        // Input Boxes  : 0 -> SELF, 1 -> SLTLendBox, 2 -> UserCreationBox
        // Output Boxes : 0 -> OutputSLTServiceBox, 1 -> OutSLTLendBox, 2 -> CrowdFundBox, 3 -> ServiceFee, 4 -> MiningFee
        // Conditions   : 1. Check if there is a lendbox.
        //                2. Send a fee to Exle (to prevent spamming)
        val lendBox: Box        = INPUTS(1)
        val isLendBox: Boolean  = lendBox.tokens(0)._1 == SELF.tokens(1)._1

        val crowdFundBox: Box   = OUTPUTS(2)


        val crowdFundBoxCFToken: (Coll[Byte], Long)     = crowdFundBox.tokens.getOrElse(1, emptyToken)
        // Since the current version of ErgoScript won't allow us to check when the OUTPUTS(2)
        // does not exist, we cannot check R4 and R5. Since R4 is LoanId, and R5 is CrowdFundToken,
        // we can fix this hack in a different way. Which is, allowing absorption if R5 is not the
        // crowdfundtokenid. And if R4 is not the loanId, which is that it is not equal to the loanId
        // as an optional argument, then we can absorb it. And in this case, we just ignore checking
        // these for the time being as its not possible
        val crowdFundBoxFundingStateRegister: Long      = crowdFundBox.R6[Long]

        val serviceFeeBox: Box      = OUTPUTS(3)
        val isCrowdFundInitiationServiceCheck: Boolean   = {
            allOf(Coll(
                crowdFundBox.value == _MinFee * 4,
                crowdFundBox.tokens(0)._1 == _inputServiceBox.tokens(3)._1,
                crowdFundBoxFundingStateRegister.get == 0,
                serviceFeeBox.value >= _serviceFee,
                serviceFeeBox.propositionBytes == _serviceOwnerPubKey.get,
                crowdFundBox.R4[Coll[Byte]].get == lendBox.tokens(1)._1,
                crowdFundBox.R5[Coll[Byte]].get == crowdFundBox.tokens(1)._1,
                crowdFundBox.R6[Long].get == 0
            ))
        }

        sigmaProp(allOf(Coll(
            isLendBox,
            isCrowdFundInitiationServiceCheck,
            _serviceFullCheck,
            _serviceLongCheck,
            _SLTCrowdFundCreation
        )))
    }
    else if (_SLTCrowdFundAbsorption)
    {
        // ===== Crowd Fund Creation ===== //
        // Description  : Create crowdFund box
        // Input Boxes  : 0 -> SELF, 1 -> CrowdFundBox
        // Output Boxes : 0 -> OutputSLTServiceBox, 1 -> MiningFee
        // Conditions   : 1. If CrowdFundBox is spendable with ServiceBox
        //                2. Burn the tokens

        val crowdFundBox: Box = INPUTS(1)

        sigmaProp(allOf(Coll(
            _SLTCrowdFundAbsorption,
            _serviceFullCheck,
            _serviceLongCheck
        )))
    }
    else
    {
        sigmaProp(false)
    }
}
