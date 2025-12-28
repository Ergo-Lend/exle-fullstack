{
    // ===== Contract Info ===== //
    // Name             : SLT [Single Lender Tokens] Fund Repayment Box Proxy Contract
    // Description      : A contract to ensure that the funding goes to the right
    //                    repayment box and if there is any overfunded amount, this script
    //                    ensures that the overfunded payment goes back to the lender.
    // Type             : Proxy Contract
    // Author           : Kii
    // Last Modified    : Nov 5th 2022
    // Version          : v 2.0
    // Status           : Live Testing Phase

    // ===== Contract Hard-Coded Constants ===== //
    // val _BoxIdToFund:                    Coll[Byte]
    // val _FunderPk:                       Coll[Byte]
    // val _MinFee:                         Long
    // val _SLTRepaymentTokenId:            Coll[Byte]
    // val _RefundInterval:                 Long

    // ===== Contract Conditions ===== //
    // 1. Fund Repayment
    // 2. Refund

    // ===== Refund ===== //
    // Description: Checks to see if the output box is of
    //              lender, and then returns the correct
    //              amount back to them.
    // Input Boxes      -> (0: PaymentBox)
    // Output Boxes     -> (0: RefundToFunderBox)
    val emptyToken: (Coll[Byte], Long)                  = (Coll(1.toByte), 0L)
    val _FunderPk: Coll[Byte]                           = SELF.R5[Coll[Byte]].get
    val _BoxIdToFund: Coll[Byte]                        = SELF.R4[Coll[Byte]].get

    val isFundingRepaymentBox: Boolean = INPUTS(0).tokens.getOrElse(0, emptyToken)._1 == _SLTRepaymentTokenId
    val isRefund: Boolean = OUTPUTS(0).propositionBytes == _FunderPk

    if (isFundingRepaymentBox) {
        // ===== Variable Declaration ===== //
        val inputSltRepaymentBox: Box   = INPUTS(0)
        val fundRepaymentProxy: Box     = SELF
        val outputSltRepaymentBox: Box  = OUTPUTS(0)

        val repaymentDetails: Coll[Long]= inputSltRepaymentBox.R9[Coll[Long]]
        val repaymentGoal: Long         = repaymentDetails.get(1)
        val repaymentBoxId: Coll[Byte]  = inputSltRepaymentBox.id

        val amountRepaid: Long          =
            if (inputSltRepaymentBox.tokens.size > 2) {
                // If this does not pass, do 0 + SELF.tokens(1)._2
                inputSltRepaymentBox.tokens(2)._2
            } else 0L
        val allFundsOutput: Long        = amountRepaid + SELF.tokens(0)._2

        // ===== Fund ===== //
        val repaymentGoalReached: Boolean   = repaymentGoal <= amountRepaid
        val boxIdCheck: Boolean             = _BoxIdToFund == repaymentBoxId
        val repaymentCheck: Boolean         = inputSltRepaymentBox.tokens(0)._1 == _SLTRepaymentTokenId
        val fundable: Boolean               = boxIdCheck && !repaymentGoalReached && repaymentCheck

        if (fundable) {

            // ===== OverFunded ===== //
            // Input Boxes      -> 0: InputSltRepaymentBox, 1: SELF | PaymentBox
            // Output Boxes     -> 0: OutputSltRepaymentBox, 1: RefundExtraToFunderBox, 2: MiningFee
            val isOverFunded = allFundsOutput > repaymentGoal
            if (isOverFunded) {
                val refundExtraToFunderBox: Box             = OUTPUTS(1)

                val repaymentBoxFunded: Boolean             = outputSltRepaymentBox.tokens(2)._2 == repaymentGoal
                val extraFundsReturnedToFunder: Boolean     = {
                    allOf(Coll(
                        refundExtraToFunderBox.tokens(0)._2 == (allFundsOutput - repaymentGoal),
                        refundExtraToFunderBox.propositionBytes == _FunderPk
                    ))
                }

                sigmaProp(repaymentBoxFunded && extraFundsReturnedToFunder && fundable)
            } else {
                // ===== Fund Success ===== //
                // Input Boxes      -> 0: InputSltRepaymentBox, 1: SELF | PaymentBox
                // Output Boxes     -> 0: OutputSltRepaymentBox, 1: MiningFee
                val valueTransferred: Boolean       = outputSltRepaymentBox.tokens(2)._2 == allFundsOutput

                sigmaProp(fundable && valueTransferred)
            }
        } else {
            // ===== Failed Funding ===== //
            sigmaProp(false)
        }
    } else if (isRefund) {
        // @todo kii ensure that boxes return value is correct
        val tokenValueRefunded: Boolean = {
            allOf(Coll(
                OUTPUTS(0).tokens(0)._1 == INPUTS(0).tokens(0)._1,
                OUTPUTS(0).tokens(0)._2 == INPUTS(0).tokens(0)._2,
                HEIGHT >= SELF.creationInfo._1 + _RefundInterval
            ))
        }
        val refundToFunder: Boolean     = OUTPUTS(0).propositionBytes == _FunderPk

        sigmaProp(tokenValueRefunded && refundToFunder)
    } else {
        // ===== Failed Funding ===== //
        sigmaProp(false)
    }
}