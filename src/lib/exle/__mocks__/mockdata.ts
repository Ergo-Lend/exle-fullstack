/**
 * Mock data for testing Exle lending protocol
 * Contains realistic mock boxes, transactions, and helper functions
 */

import type { NodeBox, NodeInfo, AllExleMetadata, Loan, Donation, ErgoTransaction, CreateLendInputParams } from '../exle'

// Token IDs used in the protocol
export const MOCK_SERVICE_NFT_ID = '18dc4c1da4a0a91c08c0b7b85ccd46e0b2ab91396b38c8216406959356805e3b'
export const MOCK_LEND_TOKEN_ID = 'a624c7e51ffae8f16fe024d8556faf47aac1c7fcaa7f584b95e9784e6426f630'
export const MOCK_REPAYMENT_TOKEN_ID = '302e93e8a379fb7bd750567947d0a396f2b138b51781e743457ee206e5b8ecc0'
export const MOCK_CROWDFUND_TOKEN_ID = '52cdac4eaeeade5c52056b1a5e6ccb5d5c04f81988b15afa27b93dd3b56d4cf9'
export const MOCK_SIGUSD_TOKEN_ID = '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04'

// Mock addresses
export const MOCK_BORROWER_ADDRESS = '9f83nJY4x9QkHmeek6PJMcTrf2xcaHAT3j5HD5sANXibXjMUixn'
export const MOCK_LENDER_ADDRESS = '9gNYeyfRFUipiWZ3JR1ayDMoeh28E6LBCz3Tz8xzfnzTdDdgzga'
export const MOCK_USER_ADDRESS = '9hErcQYQVxQZXJmWqh1BKMkFd7mXrJRVPRBUCGJMmZPTLxXjkZq'

// Mock ergo trees
export const MOCK_BORROWER_ERGOTREE = '0008cd0278c7a765f2c6beaa0908edcdfe9e88b9cc6e3e97a77e8eb7c7b6af8eb8e8f1f'
export const MOCK_LENDER_ERGOTREE = '0008cd0298a1c5f7d8e4b2a3c6d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1'

// Mock box IDs
export const MOCK_SERVICE_BOX_ID = 'abc123service456box789id0123456789abcdef0123456789abcdef01234567'
export const MOCK_LEND_BOX_ID = 'lend123box456id789abc0123456789abcdef0123456789abcdef01234567890'
export const MOCK_REPAYMENT_BOX_ID = 'repay123box456id789abc0123456789abcdef0123456789abcdef01234567890'
export const MOCK_CROWDFUND_BOX_ID = 'crowd123box456id789abc0123456789abcdef0123456789abcdef01234567890'

// Loan ID (this is the token ID minted when creating a loan)
export const MOCK_LOAN_ID = '05692a2965c6bab42ef7e440ce25108e7f5cad42ec97ea7fe4fc6d55b7119141'

// ErgoTrees from the actual contracts
export const EXLE_SERVICE_BOX_ERGOTREE = '1040040004020400040204040404040604060400040204000400040805020502050208cd024f716db88462f0c69b98d20cc281c0e51d6d1aa9ab79aa266e68b2eada18a18c0502040204020404040005000402050004040500040605000502058080b40105020402040204000400040204020404050204020402050204020404050004060402040204000404040005d00f0402040405000406040004020580a4e8030400040204020100d81fd601b2a4730000d602db63087201d603b27202730100d6048c720302d605b2a5730200d606db63087205d607b27206730300d6088c720702d6099372047208d60ab27202730400d60b8c720a02d60cb27206730500d60d8c720c02d60e93720b720dd60fb27202730600d6108c720f02d611b27206730700d6128c721102d6139372107212d614e4c6a7051ad615b27214730800d616e4c6a70811d617b27216730900d618c6a7070ed6198c720f01d61a96830a0193c27205c27201938cb27206730a00018cb27202730b0001938c7207018c720301938c720c018c720a01938c721101721993b17206730c93c17205c1720193c67205051ac67201051a93c67205060ec67201060e93c67205070ec67201070ed61b9683020193c672050411c67201041193c672050811c672010811d61c939a7204730d7208d61d96830301721c720e7213d61e968303017209720e93997210730e7212d61f968303017209720e939a7210730f721295968303017209720e7213731095968303019399720473117208720e7213d804d620b2a5731200d621e4c672200411d622b2db63087220731300d623b2a5731400d1968304019683070191b2722173150073169199b272217317007ea305731892b27221731900731a91b27221731b00731c938c722201c57201938c722202731d93c17220731e9683030193cbc27220721592c17223721793c27223e47218721a721b9596830301721c9399720b731f720d7213d806d620b2a4732000d621db63087220d622db6308a7d623b2a5732100d624db63087223d625b27224732200d19683040196830201938cb27221732300018cb272227324000193cbc2722072159683040193cbc27223b27214732500938c7225018cb2722273260001938c722502732793b27224732800b27221732900721a721b95968303017209939a720b732a720d7213d802d620b2a4732b00d621e4c67220091195ec93b2e4c672200411732c00732d968302018fb27221732e007ea3058fc17220b27221732f00d1ed721a721bd801d622b2a5733000d1968303019683020193c27222e47218938cb2db63087222733100029d9cb27221733200b272167333007334721a721b95721dd196830301721a721b721d95721ed805d620db6308b2a4733500d621b2a5733600d622db63087221d62393e4c6722106057337d624b2a5733800d196830501938cb27220733900018cb2db6308a7733a00019683080193c17221733b938cb27222733c00017219722392c17224721793c27224e4721893e4c67221040e8cb27220733d000193e4c67221050e8cb27222733e00017223721a721b721e95721fd196830301721f721a721bd1733f'
export const EXLE_LEND_BOX_ERGOTREE = '10320404020105000400040405809bee02040004000e2018dc4c1da4a0a91c08c0b7b85ccd46e0b2ab91396b38c8216406959356805e3b040204000402040405020404040204020402040004000404040004040400040405d00f0e20302e93e8a379fb7bd750567947d0a396f2b138b51781e743457ee206e5b8ecc00502058080b40104020404040604060402040401010404040004040402040604020404040004020404040401000580897a058092a803d82ad601db6308a7d602b17201d6039172027300d604860283010273017302d605c6a70411d606e47205d607b27206730300d608ed7203938cb272017304017204027207d609c6a7080ed60ae67209d60bc1a7d60ceded7208720a92720b7305d60ddb6308b2a4730600d60e938cb2720d730700017308d60fb2720d730900d610b2a5730a00d611db63087210d612b27211730b00d613b27211730c00d614eded720eed939a8c720f02730d8c721202938c720f018c72120193b2720d730e007213d615c6a7060ed616e47215d617b2a5730f00d618db63087217d619c6a7051ad61ac6a7070ed61bb27206731000d61cb27201731100d61d917ea305721bd61ec672100411d61fc67210070ed620c67210051ad621b27201731200d622b27211731300d623c17210d624c2a7d625c27210d626c67210060ed627ef720ad62896830801937202b17211937221722293721c721293720b72239372247225937216e47226722797830301947205721e947219722094721a721fd629b1a5d62ab1721895ed720cef7214d806d62bb2a5731400d62cb2db6308722b731500d62db27201731600d62eb27218731700d62fe4c672170911d6309d9c7207b272067318007319d19683060196830301938c722c018c722d01938c722c028c722d0293c2722b721696830301938c722e01731a938c722e02731b93c17217731c9683050193c672170411720593c67217051a721993c67217060e721593c67217070e721a93c67217080e72099683030193b2722f731d009a7207723093b2722f731e00723093b2722f731f009a721bb27206732000720e93b27218732100721c95ed721def7208d196830301720e721d9572038f8cb272017322000272077323957214d801d62b93c2b2a4732400721695720cd19683040193c27217e47209722b93b27218732500b272017326007214d196830201722b7214957228d19683050196830401937205721e93721a721f937212721cefe6c67210080e93b17206b1e4721e93b1e47219b1e47220722893c2b2a473270072169596830201917229732891722a7329d195917229732a96830b01937202722a937221b27218732b0093721cb27218732c0093b27201732d017204b27218732e01720493720bc17217937224c27217937216e4c67217060e7227937205c672170411937219c67217051a93721ac67217070e732fd801d62bed7227720e95722bd196830301722b93c1721799720b733093c272177216d196830401e6c67210080e96830201938c721301e4721a938c72130272079683070193721e72059372207219937226721593721f721a93722572249372227221937212721c9272237331'
export const EXLE_REPAYMENT_BOX_ERGOTREE = '10370404040404000402040004000402040204080e20302e93e8a379fb7bd750567947d0a396f2b138b51781e743457ee206e5b8ecc004020400040004020404040405000404040004000402040404060406058080b401040805d00f05d00f050005d00f050204000580897a05020100040004000404020105000400040404040400040204000404040005809ba204010104020400040404040100d815d601e4c6a70411d602b27201730000d603e4c6a70911d604b27203730100d605db6308a7d606b2a5730200d607e4c672060911d608b27203730300d60993e4c6720604117201d60a93e4c67206051ae4c6a7051ad60b93e4c67206060ee4c6a7060ed60ce4c6a7070ed60d93e4c67206070e720cd60ee4c6a7080ed60f93e4c67206080e720ed61093c27206c2a7d611db63087206d61293b27211730400b27205730500d61393b27211730600b27205730700d614b27203730800d61573099593b1a4730ad809d616b2db6501fe730b00d617b2e4c672160811730c00d618b2a5730d00d6199591b17205730e8cb27205730f00027310d61ab2a5731100d61bc67216070ed61c96830d017209720a720b720d720f93b27207731200b2720373130093b27207731400720893b27207731500720493b27207731600b2720373170072107212721393c172067318d61d93b272077319009a72147219d61e9d9c9d9c72197202731a7217731b95ec937202731c8f9d9c72047217731d731ed801d61fb2db63087218731f00d196830401721c721d96830301938c721f01720c93c27218720e938c721f0272199683020193c2721ae4721b93c1721a7320958f721e7321d17322d802d61fb2db63087218732300d620b2db6308721a732400d196830401721c721d96830301938c721f01720c93c27218720e938c721f02997219721e96830301938c722001720c93c2721ae4721b938c722002721ed805d61691b172057325d617860283010273267327d618957216ededed938cb272057328017217017215938cb27205732901721701720c8f8cb27205732a0172170299720872148f72147208ed938cb27205732b0172170172158f72147208d619b2a4732c00d61a9572169a8cb2db63087219732d00028cb27205732e00028cb2db63087219732f0002957218d801d61b9683040192c1720673307331968309017209720a720b720d720f937207720372107212721372189591721a7208d803d61cb2db6308b2a5733200733300d61d9972087214d61eb27211733400d19683030196830201938c721c0299721a721d938c721c01720c96830201938c721e02721d938c721e01720c721bd801d61cb27211733500d19683020196830201938c721c02721a938c721c01720c721bd17336'

// Mock Node Info
export const mockNodeInfo: NodeInfo = {
  lastMemPoolUpdateTime: 1703721600000,
  currentTime: 1703721600000,
  network: 'mainnet',
  name: 'ergo-mainnet-5.0.4',
  stateType: 'utxo',
  difficulty: 1234567890,
  bestFullHeaderId: 'abc123def456789',
  bestHeaderId: 'abc123def456789',
  peersCount: 10,
  unconfirmedCount: 5,
  appVersion: '5.0.4',
  eip37Supported: true,
  stateRoot: 'abc123stateroot',
  genesisBlockId: 'genesis123',
  restApiUrl: 'https://crystalpool.cc:9055',
  previousFullHeaderId: 'prev123',
  fullHeight: 1000000,
  headersHeight: 1000000,
  stateVersion: 'v1',
  fullBlocksScore: 1000000,
  maxPeerHeight: 1000000,
  launchTime: 1600000000000,
  isExplorer: false,
  lastSeenMessageTime: 1703721600000,
  eip27Supported: true,
  headersScore: 1000000,
  parameters: {
    outputCost: 100,
    tokenAccessCost: 100,
    maxBlockCost: 8000000,
    height: 1000000,
    maxBlockSize: 500000,
    dataInputCost: 100,
    blockVersion: 2,
    inputCost: 2000,
    storageFeeFactor: 1250000,
    minValuePerByte: 360,
  },
  isMining: false,
}

// Mock Service Box
export const mockServiceBox: NodeBox = {
  boxId: MOCK_SERVICE_BOX_ID,
  transactionId: 'tx123service456',
  index: 0,
  ergoTree: EXLE_SERVICE_BOX_ERGOTREE,
  creationHeight: 999990,
  value: 1000000000n,
  assets: [
    { tokenId: MOCK_SERVICE_NFT_ID, amount: 1n },
    { tokenId: MOCK_LEND_TOKEN_ID, amount: 100n },
    { tokenId: MOCK_REPAYMENT_TOKEN_ID, amount: 100n },
    { tokenId: MOCK_CROWDFUND_TOKEN_ID, amount: 100n },
  ],
  additionalRegisters: {
    R4: '0580a4e803',
    R5: '0580a4e803',
    R6: '0580a4e803',
    R7: '0580a4e803',
    R8: '11020580897a0580a4e803', // [1000000, 2000000] - [devFee, ?]
  },
}

// Mock Lend Box (unfunded - waiting for funding)
export const mockLendBoxUnfunded: NodeBox = {
  boxId: MOCK_LEND_BOX_ID,
  transactionId: 'tx123lend456unfunded',
  index: 1,
  ergoTree: EXLE_LEND_BOX_ERGOTREE,
  creationHeight: 999995,
  value: 1474560n,
  assets: [
    { tokenId: MOCK_LEND_TOKEN_ID, amount: 1n },
    { tokenId: MOCK_LOAN_ID, amount: 1n },
  ],
  additionalRegisters: {
    // R4: [fundingGoal, deadlineHeight, interestRate, repaymentHeightLength, serviceFee]
    R4: '1105808092a80380a8d6b9070a80b89c0100', // [100000000, 1000720, 10, 5040, 0] - 100 SigUSD goal, ~1 day deadline, 1% interest, 7 day repayment
    // R5: Project details [title, description]
    R5: '0c02084d79204c6f616e1b54686973206973206120746573742064657363726970696f6e',
    // R6: Borrower ErgoTree
    R6: '0e210008cd0278c7a765f2c6beaa0908edcdfe9e88b9cc6e3e97a77e8eb7c7b6af8eb8e8f1f',
    // R7: Loan Token ID (SigUSD)
    R7: '0e2003faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04',
  },
}

// Mock Lend Box (funded - ready for withdrawal)
export const mockLendBoxFunded: NodeBox = {
  ...mockLendBoxUnfunded,
  boxId: 'funded123box456id789abc0123456789abcdef0123456789abcdef01234567890',
  transactionId: 'tx123lend456funded',
  value: 3474560n,
  assets: [
    { tokenId: MOCK_LEND_TOKEN_ID, amount: 1n },
    { tokenId: MOCK_LOAN_ID, amount: 1n },
    { tokenId: MOCK_SIGUSD_TOKEN_ID, amount: 10000n }, // 100.00 SigUSD funded
  ],
  additionalRegisters: {
    ...mockLendBoxUnfunded.additionalRegisters,
    // R8: Lender ErgoTree
    R8: '0e210008cd0298a1c5f7d8e4b2a3c6d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
  },
}

// Mock Repayment Box (partially repaid)
export const mockRepaymentBox: NodeBox = {
  boxId: MOCK_REPAYMENT_BOX_ID,
  transactionId: 'tx123repayment456',
  index: 0,
  ergoTree: EXLE_REPAYMENT_BOX_ERGOTREE,
  creationHeight: 999998,
  value: 1000000n,
  assets: [
    { tokenId: MOCK_REPAYMENT_TOKEN_ID, amount: 1n },
    { tokenId: MOCK_LOAN_ID, amount: 1n },
    { tokenId: MOCK_SIGUSD_TOKEN_ID, amount: 5000n }, // 50.00 SigUSD locked for lender
  ],
  additionalRegisters: {
    // R4: Same as lend box
    R4: '1105808092a80380a8d6b9070a80b89c0100',
    // R5: Project details
    R5: '0c02084d79204c6f616e1b54686973206973206120746573742064657363726970696f6e',
    // R6: Borrower ErgoTree
    R6: '0e210008cd0278c7a765f2c6beaa0908edcdfe9e88b9cc6e3e97a77e8eb7c7b6af8eb8e8f1f',
    // R7: Loan Token ID (SigUSD)
    R7: '0e2003faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04',
    // R8: Lender ErgoTree
    R8: '0e210008cd0298a1c5f7d8e4b2a3c6d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    // R9: [fundedHeight, repaymentAmount, interestAmount, repaymentDeadlineHeight, repaidAmount]
    R9: '110580a0bc0e80a4e80380e59a017880d40a', // [999996, 101000000, 1000000, 1005040, 50000000]
  },
}

// Mock Repayment Box (fully repaid, ready for lender withdrawal)
export const mockRepaymentBoxFullyRepaid: NodeBox = {
  ...mockRepaymentBox,
  boxId: 'repaidfull123box456id789abc0123456789abcdef0123456789abcdef0123456',
  assets: [
    { tokenId: MOCK_REPAYMENT_TOKEN_ID, amount: 1n },
    { tokenId: MOCK_LOAN_ID, amount: 1n },
    { tokenId: MOCK_SIGUSD_TOKEN_ID, amount: 10100n }, // 101.00 SigUSD (principal + interest)
  ],
  additionalRegisters: {
    ...mockRepaymentBox.additionalRegisters,
    // R9: Fully repaid
    R9: '110580a0bc0e80a4e80380e59a017880a4e803', // repaidAmount = repaymentAmount
  },
}

// Mock Crowdfund Box (partially funded)
export const mockCrowdfundBox: NodeBox = {
  boxId: MOCK_CROWDFUND_BOX_ID,
  transactionId: 'tx123crowdfund456',
  index: 2,
  ergoTree: '105404000e20' + MOCK_LOAN_ID + '04000580a4e803040004000e2052cdac4eaeeade5c52056b1a5e6ccb5d5c04f81988b15afa27b93dd3b56d4cf905020201050004020402040404060404040204000e20302e93e8a379fb7bd750567947d0a396f2b138b51781e743457ee206e5b8ecc00504040205020100040205000500040405000500040405d00f040204000580897a050005000400050204020402040204040500050005000500050005000500050005000502040204020404050404040502040404020404040404000404040205020402040204020402050004020500040205020400050204020502050004000502040205020500d810d601db6501fed602b27201730000d603db63087202d6047301d605c2a7d606b2a5730200d607db63087206d608db6308a7d60992c1a77303d60ab2a4730400d60bb27203730500d60c9683030193c272027205938c720b017306938c720b027307d60d860283010273087309d60eb27208730a01720dd60fb27207730b01720dd6108c720f029595ed93b17203730c93b17201730dd801d611db6308b27201730e0096830401938cb27211730f0001e4c67202040e938cb2721173100001731193e4c6720206057312938cb272037313000273147315d807d611b5a4d901116394c272117205d612e4c67202050ed613db6308b2a5731600d61499b0dc0c0f721101d9011463b5db63087214d901164d0e938c72160172127317d90114414d0e9a8c7214018c8c72140202b0b57213d901144d0e938c72140172127318d90114414d0e9a8c7214018c8c72140202d615b27201731900d616e4c67215070ed61799b0b57213d901174d0e938c7217017216731ad90117414d0e9a8c7217018c8c72170202b0dc0c0f721101d9011763b5db63087217d901194d0e938c7219017216731bd90117414d0e9a8c7217018c8c72170202d19683030193e4c67202040e720496830201939a72149d9c72149cb2e4c672150411731c0099731db2e4c6b27201731e000811731f00732072179399b0dc0c0fb5a4d901186393c27218720501d9011863b5db63087218d9011a4d0e938c721a0172167321d90118414d0e9a8c7218018c8c72180202b0b57207d901184d0e938c72180172167322d90118414d0e9a8c7218018c8c72180202721793c2720672059596830401ed93c5a7c5720a937205c2b2a57323008f8c720e0272109472107324938c720e018c720f01d805d611b4a473259ab1a47326d612e4c67202050ed613b2a5732700d614db63087213d615e4c6b27201732800070ed19683040193e4c6720206057329968302019399b0dc0c0f721101d9011663b5db63087216d901184d0e938c7218017212732ad90116414d0e9a8c7216018c8c72160202b0b57214d901164d0e938c7216017212732bd90116414d0e9a8c7216018c8c7216020299b0b57214d901164d0e938c7216017215732cd90116414d0e9a8c7216018c8c72160202b0dc0c0f721101d9011663b5db63087216d901184d0e938c7218017215732dd90116414d0e9a8c7216018c8c721602029399b0b57207d901164d0e938c7216017212732ed90116414d0e9a8c7216018c8c72160202b0b57208d901164d0e938c7216017212732fd90116414d0e9a8c7216018c8c7216020299b0b57208d901164d0e938c72160172157330d90116414d0e9a8c7216018c8c72160202b0b57207d901164d0e938c72160172157331d90116414d0e9a8c7216018c8c72160202af7211d901166393c27216c272137209d802d611c67202040ed612c67202050e9593e4c6720206057332d805d613b2a5733300d614e47212d615db63087213d616b27215733400d617b27207733500d19683060193c2721372059683030193e47211e4c67213040e937214e4c67213050e93e4c6721306057336968302019683030193b172157337938c7216017214938c721602733896830201938c721701e4c6720a070e938c7217028cb2720873390002938cb2db6308720a733a00017204720c7209d80ad613b27207733b00d6148c721302d615b27201733c00d616b2e4c672150411733d00d6179372147216d618e4c67215070ed619938c7213017218d61a9972148cb27208733e01720d02d61be47212d61ce47211d19683080196830201957217d801d61db27207733f0096830301938c721d027340938c721d018cb27208734100017219d802d61db27208734200d61eb272077343009683030193998c721d028c721e02721a938c721e018c721d0172199399b0b5db6308b2a5734400d9011d4d0e938c721d01721b7345d9011d414d0e9a8c721d018c8c721d0202b0b5db6308b2a4734600d9011d4d0e938c721d01721b7347d9011d414d0e9a8c721d018c8c721d0202721a968302017219938cb2db6308721573480001721c9683020193721ce4c67206040e93721be4c67206050e9572179683040193e4c6720606057349938cb27207734a0002734b938cb27207734c0002734d72179683030193e4c672060605734e938cb27207734f00027350948cb2720773510002735293c272067205720c720990b0b57207d9011d4d0e938c721d0172187353d9011d414d0e9a8c721d018c8c721d02027216',
  creationHeight: 999997,
  value: 4000000n,
  assets: [
    { tokenId: MOCK_CROWDFUND_TOKEN_ID, amount: 1n },
    { tokenId: 'cf123token456id789', amount: 9223372036854775807n }, // CF tokens (near max long)
    { tokenId: MOCK_SIGUSD_TOKEN_ID, amount: 5000n }, // 50.00 SigUSD funded so far
  ],
  additionalRegisters: {
    // R4: LoanId
    R4: '0e20' + MOCK_LOAN_ID,
    // R5: CrowdFundTokenId
    R5: '0e20cf123token456id789abc0123456789abcdef0123456789abcdef012345678901',
    // R6: Status (0 = funding, 1 = fully funded, 2 = funded lend box)
    R6: '0500', // 0n - still funding
  },
}

// Mock Crowdfund Box (fully funded)
export const mockCrowdfundBoxFullyFunded: NodeBox = {
  ...mockCrowdfundBox,
  boxId: 'crowdfull123box456id789abc0123456789abcdef0123456789abcdef0123456',
  assets: [
    { tokenId: MOCK_CROWDFUND_TOKEN_ID, amount: 1n },
    { tokenId: 'cf123token456id789', amount: 1n }, // Only 1 CF token left
    { tokenId: MOCK_SIGUSD_TOKEN_ID, amount: 10000n }, // 100.00 SigUSD fully funded
  ],
  additionalRegisters: {
    ...mockCrowdfundBox.additionalRegisters,
    R6: '0501', // 1n - fully funded
  },
}

// Mock User UTXOs
export const mockUserUtxos: NodeBox[] = [
  {
    boxId: 'user123box456utxo1',
    transactionId: 'tx123user456',
    index: 0,
    ergoTree: MOCK_BORROWER_ERGOTREE,
    creationHeight: 999990,
    value: 10000000000n, // 10 ERG
    assets: [
      { tokenId: MOCK_SIGUSD_TOKEN_ID, amount: 100000n }, // 1000.00 SigUSD
    ],
    additionalRegisters: {},
  },
  {
    boxId: 'user123box456utxo2',
    transactionId: 'tx123user457',
    index: 0,
    ergoTree: MOCK_BORROWER_ERGOTREE,
    creationHeight: 999991,
    value: 5000000000n, // 5 ERG
    assets: [],
    additionalRegisters: {},
  },
]

// Mock Transactions
export const mockUnsignedTx = {
  inputs: [{ boxId: mockServiceBox.boxId }],
  outputs: [{ boxId: 'output1' }, { boxId: 'output2' }],
  dataInputs: [],
}

export const mockSignedTx = {
  id: 'signed123tx456id789',
  inputs: mockUnsignedTx.inputs,
  outputs: mockUnsignedTx.outputs,
  dataInputs: [],
}

// Mock Loan objects (parsed from boxes)
export const mockLoanUnfunded: Loan = {
  phase: 'loan',
  loanId: MOCK_LOAN_ID,
  loanType: 'Solofund',
  loanTitle: 'My Loan',
  loanDescription: 'This is a test description',
  repaymentPeriod: '7',
  interestRate: '10.0 %',
  fundingGoal: '100.00',
  fundingToken: 'SigUSD',
  fundedAmount: '0.00 SigUSD',
  fundedPercentage: 0,
  daysLeft: 1,
  creator: MOCK_BORROWER_ADDRESS,
  isReadyForWithdrawal: false,
  isRepayed: false,
}

export const mockLoanFunded: Loan = {
  ...mockLoanUnfunded,
  loanId: 'funded' + MOCK_LOAN_ID.slice(6),
  fundedAmount: '100.00 SigUSD',
  fundedPercentage: 100,
  isReadyForWithdrawal: true,
}

export const mockLoanRepayment: Loan = {
  phase: 'repayment',
  loanId: MOCK_LOAN_ID,
  loanType: 'Crowdloan',
  loanTitle: 'My Loan',
  loanDescription: 'This is a test description',
  repaymentPeriod: '7',
  interestRate: '10.0 %',
  fundingGoal: '101.00',
  fundingToken: 'SigUSD',
  fundedAmount: '50.00 SigUSD',
  fundedPercentage: 50,
  daysLeft: 5,
  creator: MOCK_BORROWER_ADDRESS,
  isReadyForWithdrawal: false,
  isRepayed: false,
}

export const mockLoanFullyRepaid: Loan = {
  ...mockLoanRepayment,
  loanId: 'repaid' + MOCK_LOAN_ID.slice(6),
  fundedAmount: '101.00 SigUSD',
  fundedPercentage: 100,
  isReadyForWithdrawal: true,
  isRepayed: true,
}

// Mock Donations
export const mockDonations: Donation[] = [
  {
    loanId: MOCK_LOAN_ID,
    type: 'Solofund',
    amount: 10000n,
    status: 'In repayment',
    title: 'My Loan',
    ticker: 'SigUSD',
  },
  {
    loanId: 'crowdfund' + MOCK_LOAN_ID.slice(9),
    type: 'Crowdloan',
    amount: 5000n,
    status: 'Fully Funded',
    title: 'Community Project',
    ticker: 'SigUSD',
  },
]

// Mock AllExleMetadata
export const mockAllExleMetadata: AllExleMetadata = {
  nodeInfo: mockNodeInfo,
  loanBoxes: [mockLendBoxUnfunded, mockLendBoxFunded],
  repaymentBoxes: [mockRepaymentBox],
  crowdfundBoxes: [mockCrowdfundBox],
  loanIds: [MOCK_LOAN_ID],
  crowdfundLoanIds: [MOCK_LOAN_ID],
  crowdfundHistoryTxs: [],
  loanHistoryTxs: [],
}

// Mock ErgoTransaction
export const mockErgoTransaction: ErgoTransaction = {
  id: 'tx123ergo456',
  inputs: [
    { boxId: mockServiceBox.boxId, address: MOCK_BORROWER_ADDRESS },
  ],
  outputs: [
    { ...mockServiceBox, address: MOCK_BORROWER_ADDRESS },
    { ...mockLendBoxUnfunded, address: MOCK_BORROWER_ADDRESS },
  ],
  timestamp: 1703721600000,
}

// Mock CreateLendInputParams
export const mockCreateLendInputParams: CreateLendInputParams = {
  loanType: 'Solofund',
  borrowerAddress: MOCK_BORROWER_ADDRESS,
  project: ['Test Loan', 'This is a test loan description for testing purposes'],
  loanTokenId: MOCK_SIGUSD_TOKEN_ID,
  fundingGoal: 10000n, // 100.00 SigUSD
  fundingDeadlineLength: 720n, // ~1 day
  interestRate: 10n, // 1% (10/1000)
  repaymentHeightLength: 5040n, // ~7 days
}

export const mockCreateCrowdfundInputParams: CreateLendInputParams = {
  ...mockCreateLendInputParams,
  loanType: 'Crowdloan',
  project: ['Community Project', 'A crowdfunded community lending project'],
}

// Mock window.ergo wallet connector
export const createMockErgoWallet = () => ({
  get_change_address: vi.fn().mockResolvedValue(MOCK_USER_ADDRESS),
  get_utxos: vi.fn().mockResolvedValue(mockUserUtxos),
  get_current_height: vi.fn().mockResolvedValue(1000000),
  sign_tx: vi.fn().mockResolvedValue(mockSignedTx),
  submit_tx: vi.fn().mockResolvedValue('submitted123tx456id789'),
})

export const createMockErgoConnector = () => ({
  nautilus: {
    connect: vi.fn().mockResolvedValue(true),
    disconnect: vi.fn().mockResolvedValue(undefined),
  },
})

// Helper to setup window mocks
export function setupWindowMocks() {
  const mockWallet = createMockErgoWallet()
  const mockConnector = createMockErgoConnector()

  Object.defineProperty(window, 'ergo', {
    value: mockWallet,
    writable: true,
    configurable: true,
  })

  Object.defineProperty(window, 'ergoConnector', {
    value: mockConnector,
    writable: true,
    configurable: true,
  })

  return { mockWallet, mockConnector }
}

// Helper to cleanup window mocks
export function cleanupWindowMocks() {
  // @ts-ignore
  delete window.ergo
  // @ts-ignore
  delete window.ergoConnector
}

// Helper functions to create variations of mock data
export function createMockLoan(overrides: Partial<Loan> = {}): Loan {
  return {
    ...mockLoanUnfunded,
    ...overrides,
  }
}

export function createMockNodeBox(overrides: Partial<NodeBox> = {}): NodeBox {
  return {
    ...mockLendBoxUnfunded,
    ...overrides,
  }
}

export function createMockDonation(overrides: Partial<Donation> = {}): Donation {
  return {
    ...mockDonations[0],
    ...overrides,
  }
}
