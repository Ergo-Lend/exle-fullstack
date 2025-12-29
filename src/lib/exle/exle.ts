import { ErgoAddress, OutputBuilder, TransactionBuilder } from '@fleet-sdk/core';
import { parse, SByte, SColl, SLong } from '@fleet-sdk/serializer';

import { Network } from '@fleet-sdk/common';
import { compile } from '@fleet-sdk/compiler';
import { CROWDFUND_CONTRACT } from './CROWDFUND_CONTRACT';

//const NODE_BASE_URL = 'http://localhost:9053';
const NODE_BASE_URL = 'https://crystalpool.cc:9055';

export const SCALA_MAX_LONG = 9223372036854775807n;

export const EXLE_MINING_FEE = 1_000_000n;
export const EXLE_MAX_BYTE_BOX_FEE = 1_474_560n;
export const EXLE_DEV_ADDRESS = '9f83nJY4x9QkHmeek6PJMcTrf2xcaHAT3j5HD5sANXibXjMUixn';

export const EXLE_CWORD_TREE_POSTFIX =
	'04000580a4e803040004000e2052cdac4eaeeade5c52056b1a5e6ccb5d5c04f81988b15afa27b93dd3b56d4cf905020201050004020402040404060404040204000e20302e93e8a379fb7bd750567947d0a396f2b138b51781e743457ee206e5b8ecc00504040205020100040205000500040405000500040405d00f040204000580897a050005000400050204020402040204040500050005000500050005000500050005000502040204020404050404040502040404020404040404000404040205020402040204020402050004020500040205020400050204020502050004000502040205020500d810d601db6501fed602b27201730000d603db63087202d6047301d605c2a7d606b2a5730200d607db63087206d608db6308a7d60992c1a77303d60ab2a4730400d60bb27203730500d60c9683030193c272027205938c720b017306938c720b027307d60d860283010273087309d60eb27208730a01720dd60fb27207730b01720dd6108c720f029595ed93b17203730c93b17201730dd801d611db6308b27201730e0096830401938cb27211730f0001e4c67202040e938cb2721173100001731193e4c6720206057312938cb272037313000273147315d807d611b5a4d901116394c272117205d612e4c67202050ed613db6308b2a5731600d61499b0dc0c0f721101d9011463b5db63087214d901164d0e938c72160172127317d90114414d0e9a8c7214018c8c72140202b0b57213d901144d0e938c72140172127318d90114414d0e9a8c7214018c8c72140202d615b27201731900d616e4c67215070ed61799b0b57213d901174d0e938c7217017216731ad90117414d0e9a8c7217018c8c72170202b0dc0c0f721101d9011763b5db63087217d901194d0e938c7219017216731bd90117414d0e9a8c7217018c8c72170202d19683030193e4c67202040e720496830201939a72149d9c72149cb2e4c672150411731c0099731db2e4c6b27201731e000811731f00732072179399b0dc0c0fb5a4d901186393c27218720501d9011863b5db63087218d9011a4d0e938c721a0172167321d90118414d0e9a8c7218018c8c72180202b0b57207d901184d0e938c72180172167322d90118414d0e9a8c7218018c8c72180202721793c2720672059596830401ed93c5a7c5720a937205c2b2a57323008f8c720e0272109472107324938c720e018c720f01d805d611b4a473259ab1a47326d612e4c67202050ed613b2a5732700d614db63087213d615e4c6b27201732800070ed19683040193e4c6720206057329968302019399b0dc0c0f721101d9011663b5db63087216d901184d0e938c7218017212732ad90116414d0e9a8c7216018c8c72160202b0b57214d901164d0e938c7216017212732bd90116414d0e9a8c7216018c8c7216020299b0b57214d901164d0e938c7216017215732cd90116414d0e9a8c7216018c8c72160202b0dc0c0f721101d9011663b5db63087216d901184d0e938c7218017215732dd90116414d0e9a8c7216018c8c721602029399b0b57207d901164d0e938c7216017212732ed90116414d0e9a8c7216018c8c72160202b0b57208d901164d0e938c7216017212732fd90116414d0e9a8c7216018c8c7216020299b0b57208d901164d0e938c72160172157330d90116414d0e9a8c7216018c8c72160202b0b57207d901164d0e938c72160172157331d90116414d0e9a8c7216018c8c72160202af7211d901166393c27216c272137209d802d611c67202040ed612c67202050e9593e4c6720206057332d805d613b2a5733300d614e47212d615db63087213d616b27215733400d617b27207733500d19683060193c2721372059683030193e47211e4c67213040e937214e4c67213050e93e4c6721306057336968302019683030193b172157337938c7216017214938c721602733896830201938c721701e4c6720a070e938c7217028cb2720873390002938cb2db6308720a733a00017204720c7209d80ad613b27207733b00d6148c721302d615b27201733c00d616b2e4c672150411733d00d6179372147216d618e4c67215070ed619938c7213017218d61a9972148cb27208733e01720d02d61be47212d61ce47211d19683080196830201957217d801d61db27207733f0096830301938c721d027340938c721d018cb27208734100017219d802d61db27208734200d61eb272077343009683030193998c721d028c721e02721a938c721e018c721d0172199399b0b5db6308b2a5734400d9011d4d0e938c721d01721b7345d9011d414d0e9a8c721d018c8c721d0202b0b5db6308b2a4734600d9011d4d0e938c721d01721b7347d9011d414d0e9a8c721d018c8c721d0202721a968302017219938cb2db6308721573480001721c9683020193721ce4c67206040e93721be4c67206050e9572179683040193e4c6720606057349938cb27207734a0002734b938cb27207734c0002734d72179683030193e4c672060605734e938cb27207734f00027350948cb2720773510002735293c272067205720c720990b0b57207d9011d4d0e938c721d0172187353d9011d414d0e9a8c721d018c8c721d02027216';
const EXLE_STRING_TO_REPLACE = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

const EXLE_TEMPLATE_CROWD_TREE = '105404000e20' + EXLE_STRING_TO_REPLACE + EXLE_CWORD_TREE_POSTFIX;

const configAddress =
	'2MD38oCq4fgxo2C6LSpDf5HDmqqiQ1ZbV4FaP5V9M95AA6MVn8BQpSbwrMA6Y24A4gHTsnaHCBXtLdKVT92mGoW45KXCJ3pqKChMpNPAAC8atEE6YT6QaRtreLFKV2C8j99uSpUmRSg8oe6STMw7nUgtXAeZW1XcqUJSNBw8e9h6eKPUY4gtZfNBP69DJ3xYc9bjuvzYnxdGRYvFu3RUovoB3at1DhsRHR68vhRuDBkscehD5HYLA5TKDVsFyBWhWuhmEWNwV5BpbGs6vQNpRvsGSwpz8z5M4eLznLjcGmyZ65wKUZXdhD7QCY7DqH6ine7aCYoLMhEbshN9d7bsPPmFp3UnFbfMBoG566w2PSj5u7Tt6dXmGJw6mghTy8gcXwbWwmCimZ3R8fy3NKXzJS9WLhxxJGEwgySxgDVTvEh571zN4MNAGxehtEtdLNHHhZ8iLR2M19fXdWHcKmrzLef4BtACoteKNLR4d7wJfePX8CLucSoyEZGVhyB5asXLvRJsZJx3FCiCywEZV5ioUsfw7jXDYphyUY93tUm22vDYCEiu4KuKt3kvrMnV8cKzbvuvvdcNj6ivJnYbuRGRGEqrvr6774SBSXPoTzeFGPEFSexKqVabvKKA4A8Uxyvs77Whmad5HJ78hSSHyfNta7fEDKrJxfYnXAZao2JWUFcbWJohLtEGSBUC1vso273FcuRu5pZUovt4W89kx6tXBMT41CvFEvrWEBCU9ncPQTo2Gpdy4pKQnpKMMFBbMwrBW1Q7Z7Mnk7T4gJHBptYdNCa54ycahNZTH6ZWYejJFQSkg7mygSArAEqFWBHCqDyhzcDpyqTV4GubmF755ZHm7gwYphHEXmQYhaSALq6uXTFdAp8b1sdx6gXW3NvaqSbH48Wwcj7UXSPXNhEqWEonNkicewAohYhf8M3hQ1WJYuEVHSa253pzjBT1GRCQV1hEaJxsquG4dQKQcRcTm54ijbc8EnL2mqsCTmFAvPxERdMy7bZTGWwugdn7GQjF8MfMgAt6Md85MwwZGyp7FHEr1mtm9De3BUYhB5gaRvjNDxFHNzizzMcKrJPqHyPmFHFGn3RjDqBpGE9L92DaSZPGF6WVB9fSRtfkyodbupGz2qL7t2kGCS8XF39KpvrGtkRYhhdvbtZgywtxKuSjeLDdyoVninthhFQ5wPnnQGH2GZ1ZGHxGmVtmMzY2TVeXBe8jvgSbzQ7p4TiGQLxyuXkTqQEs7gMhkXEEVftYEvY9nKFvNg21bHeQEZfFWNJKx92axhjDHcvWvEFknxYKuRn6Bzu8Z4MHmocsG7mLWVmnGj5qjGEatvMQMqiNa9ab73WyXAt4TWXRHVrMqJsSkYuPAf7h3FZsALvGeSzFRLtTXCZXNWiUVhAjPAXaJpScgzGdqrnm3XtKJmBU1uSB3PFQ6PDAYcf3iQ76Ths53dbeiZEuurGppSkVC3vcnPLK6r4SKf5hTcGMoujWD8dGLTkW6HrYE5kR95nVtxPdbFEsBnEBkJSTFaoz3KdNxqEJoGiPGRCXUi67FcoRTUv6AdY7EL3UjR9jZatbqv4xNrE7RxnMyqG7';
const repaymentAddress =
	'61FP1XoupNs44SyzARauWp31V8ZnxJo3FEB8BpUB8DriGaUdvFM2LkwEGbiNACMmozBGfFuAYvNegsxA9rP7yRXizAkXZqqagkDidGhC34KQDfc7QZLjgesZvsaKjXj3KjL3dgKEjqDbaVVfqQkLwv2hfthdjy3L6LuombC5m5akqnmnMWNi7ZgCWL4Bj47XRDPMozrC5Gc5ovy8ww8jXZ1LTKM9rEG9KagnaHNXw2UhnXtGpNHmyXgXH6QTXXt9jUs4nA4ZJFh9pDBS27JDmomWgpjUaNMKj5tfnbkA3WWrpZQN4gif4NZcwCygq9CxgVrowu22fC5NmChHoh4SEeWLzzv68c6L8sCbqetez4VHZZVR1XAW6TVkvVPhhiWpnzztUgzCbwax8aEtLYe7fmYdsbmC8ZeKmpZDqiKeiC4RWCnuHFipYK7FJhbXW75hakxATREvUNSDrMChoXTS4LdDukUbZnnBdEMcBAK5iihxta1EQXZNx9gn5Yq8qB9Z5p1PDdNBgAhQsUJt5NThL2YuCzQ6B8pYc9BJzg5EvzA2aSatXXnsbWX4RFzNdEgpE1UaeM61CuxbytaSXubxUgNGxCin8hTvhhryse7w49PNM9DgpoRzSSEdJRzLLiypb2S8shFsc87R4xuggQzqKjqhjHdA7NGoaqmAZnCf9zU76c9myNuJvqFiNiepDyXDeKt3RQVMmvAwUAdgR24XcXdugawzEwwF2df3apMhKZP35JTUd884KTTDrDygWDvMUVER8kfAxzJt3vPjFMYoiMDtbCmC7m77TUSw2uzdeqgLf6r1er9QY8H2YMirZ5k4op3gA2bnmGJ2ntZd4Scv25eomJLBuv5tFLCZPEEoq2XSfB4MP3GdiSrwJj4YxxaARroaLkQ6QaKTuMAsAWLz7F2atbbRBZTgVwaJ8DvsQ3pXabUSzcDKAstvVjhPJv1AAfiWUKFU2cX95vy16a2Eoh9wk54fTVrFzm37uNygTa1dgumFabWDJWUHxdZGPUXPP7TGr43xWAo3KjwZn9NcZhgQqa4JVRATw1wG6jwYKECSJG6Pck2d7eDHmuYMyKPqPWk2ZdC1mgNdtqqGPLUX6zY4Z5m4XeLCWKgbTYMmbmHeERfvQF3VroYBdVGiv1NQk6kMTyP24EJn6wc7JTnA2tMKkefCbUTVPbqMD4Yk66Z7JB1gu7AtpmtXpTitDkq9VLnEetMq5AwM1RyNjfvkZFG4DtqBsQNQYq3K6gFYR5HCcJhRmuTK8ShWiGVogF3TMqzp2G3cEswdijnskhAVjqSXLxr6TD9ocU7k45K2hqtsAbRncFfBHAjJjfMn9ZmQ3eqXC7YFk2BJfkfdZ7Pa9yRFHGPP';
const proxyAddress =
	'X2pjgtjX7UNPsqNzzut4SPvpW9GV6Z1xcDvvC2DxadcynFMyD8ZsXwYoCu3d92HtFRG4Q9xSDCzZRWGWVauPcNKbpVsGcTPdT1kDz67ZKaUHRmXhnrpNjUKhG9Gvm1SUzH3Ur6NEqEXcMtJnpKTTz7pzDZN88t2SZiVbvkLfNmuQKfCidziiiCih9M6gdbxjqTydf3AZEEstyKuMzxzZtY7oQYSutrEhYPzYySoqCnVgn1p3j2xCpCRL9yuP1tVPefhkrB7VHQmcdhbxznMUqT9bTbpscbKB9xJ7ZRCAsZwvmXEiHpo1PjBRCaYhzEQDPbtEcEC8G5GKWDabRLjizBrrko1okXhtVYzjR1jpxX26h5QHdfMGHcrRaijdd4SmdEzqUzW4tLRXQU4SMpUgAkzV5vS6NjGB5EWqmNDgBiBF6b15CddkGyrDpiETANYaQpurrMkJLViesPF6wRevxWhw54zxQhW2S85pkS5DKkX3S7yxnf9Fi6c';
const minerAddress =
	'2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe';

export const EXLE_SERVICE_BOX_ERGOTREE =
	'1040040004020400040204040404040604060400040204000400040805020502050208cd024f716db88462f0c69b98d20cc281c0e51d6d1aa9ab79aa266e68b2eada18a18c0502040204020404040005000402050004040500040605000502058080b40105020402040204000400040204020404050204020402050204020404050004060402040204000404040005d00f0402040405000406040004020580a4e8030400040204020100d81fd601b2a4730000d602db63087201d603b27202730100d6048c720302d605b2a5730200d606db63087205d607b27206730300d6088c720702d6099372047208d60ab27202730400d60b8c720a02d60cb27206730500d60d8c720c02d60e93720b720dd60fb27202730600d6108c720f02d611b27206730700d6128c721102d6139372107212d614e4c6a7051ad615b27214730800d616e4c6a70811d617b27216730900d618c6a7070ed6198c720f01d61a96830a0193c27205c27201938cb27206730a00018cb27202730b0001938c7207018c720301938c720c018c720a01938c721101721993b17206730c93c17205c1720193c67205051ac67201051a93c67205060ec67201060e93c67205070ec67201070ed61b9683020193c672050411c67201041193c672050811c672010811d61c939a7204730d7208d61d96830301721c720e7213d61e968303017209720e93997210730e7212d61f968303017209720e939a7210730f721295968303017209720e7213731095968303019399720473117208720e7213d804d620b2a5731200d621e4c672200411d622b2db63087220731300d623b2a5731400d1968304019683070191b2722173150073169199b272217317007ea305731892b27221731900731a91b27221731b00731c938c722201c57201938c722202731d93c17220731e9683030193cbc27220721592c17223721793c27223e47218721a721b9596830301721c9399720b731f720d7213d806d620b2a4732000d621db63087220d622db6308a7d623b2a5732100d624db63087223d625b27224732200d19683040196830201938cb27221732300018cb272227324000193cbc2722072159683040193cbc27223b27214732500938c7225018cb2722273260001938c722502732793b27224732800b27221732900721a721b95968303017209939a720b732a720d7213d802d620b2a4732b00d621e4c67220091195ec93b2e4c672200411732c00732d968302018fb27221732e007ea3058fc17220b27221732f00d1ed721a721bd801d622b2a5733000d1968303019683020193c27222e47218938cb2db63087222733100029d9cb27221733200b272167333007334721a721b95721dd196830301721a721b721d95721ed805d620db6308b2a4733500d621b2a5733600d622db63087221d62393e4c6722106057337d624b2a5733800d196830501938cb27220733900018cb2db6308a7733a00019683080193c17221733b938cb27222733c00017219722392c17224721793c27224e4721893e4c67221040e8cb27220733d000193e4c67221050e8cb27222733e00017223721a721b721e95721fd196830301721f721a721bd1733f';

// Exle: SLT Config Box V1.3 | This identifies the config box that manages the SingleLender Token (SLT) Protocol.
const EXLE_SLE_SERVICE_NFT_ID = '18dc4c1da4a0a91c08c0b7b85ccd46e0b2ab91396b38c8216406959356805e3b';

export const EXLE_LEND_BOX_ERGOTREE =
	'10320404020105000400040405809bee02040004000e2018dc4c1da4a0a91c08c0b7b85ccd46e0b2ab91396b38c8216406959356805e3b040204000402040405020404040204020402040004000404040004040400040405d00f0e20302e93e8a379fb7bd750567947d0a396f2b138b51781e743457ee206e5b8ecc00502058080b40104020404040604060402040401010404040004040402040604020404040004020404040401000580897a058092a803d82ad601db6308a7d602b17201d6039172027300d604860283010273017302d605c6a70411d606e47205d607b27206730300d608ed7203938cb272017304017204027207d609c6a7080ed60ae67209d60bc1a7d60ceded7208720a92720b7305d60ddb6308b2a4730600d60e938cb2720d730700017308d60fb2720d730900d610b2a5730a00d611db63087210d612b27211730b00d613b27211730c00d614eded720eed939a8c720f02730d8c721202938c720f018c72120193b2720d730e007213d615c6a7060ed616e47215d617b2a5730f00d618db63087217d619c6a7051ad61ac6a7070ed61bb27206731000d61cb27201731100d61d917ea305721bd61ec672100411d61fc67210070ed620c67210051ad621b27201731200d622b27211731300d623c17210d624c2a7d625c27210d626c67210060ed627ef720ad62896830801937202b17211937221722293721c721293720b72239372247225937216e47226722797830301947205721e947219722094721a721fd629b1a5d62ab1721895ed720cef7214d806d62bb2a5731400d62cb2db6308722b731500d62db27201731600d62eb27218731700d62fe4c672170911d6309d9c7207b272067318007319d19683060196830301938c722c018c722d01938c722c028c722d0293c2722b721696830301938c722e01731a938c722e02731b93c17217731c9683050193c672170411720593c67217051a721993c67217060e721593c67217070e721a93c67217080e72099683030193b2722f731d009a7207723093b2722f731e00723093b2722f731f009a721bb27206732000720e93b27218732100721c95ed721def7208d196830301720e721d9572038f8cb272017322000272077323957214d801d62b93c2b2a4732400721695720cd19683040193c27217e47209722b93b27218732500b272017326007214d196830201722b7214957228d19683050196830401937205721e93721a721f937212721cefe6c67210080e93b17206b1e4721e93b1e47219b1e47220722893c2b2a473270072169596830201917229732891722a7329d195917229732a96830b01937202722a937221b27218732b0093721cb27218732c0093b27201732d017204b27218732e01720493720bc17217937224c27217937216e4c67217060e7227937205c672170411937219c67217051a93721ac67217070e732fd801d62bed7227720e95722bd196830301722b93c1721799720b733093c272177216d196830401e6c67210080e96830201938c721301e4721a938c72130272079683070193721e72059372207219937226721593721f721a93722572249372227221937212721c9272237331';

//Exle: SLT LoanBox Token V1.3 | This acts as a form of identification for SLT LoanBoxes where borrowers create to receive funding.
const EXLE_SLE_LEND_TOKEN_ID = 'a624c7e51ffae8f16fe024d8556faf47aac1c7fcaa7f584b95e9784e6426f630';

export const EXLE_REPAYMENT_BOX_ERGOTREE =
	'10370404040404000402040004000402040204080e20302e93e8a379fb7bd750567947d0a396f2b138b51781e743457ee206e5b8ecc004020400040004020404040405000404040004000402040404060406058080b401040805d00f05d00f050005d00f050204000580897a05020100040004000404020105000400040404040400040204000404040005809ba204010104020400040404040100d815d601e4c6a70411d602b27201730000d603e4c6a70911d604b27203730100d605db6308a7d606b2a5730200d607e4c672060911d608b27203730300d60993e4c6720604117201d60a93e4c67206051ae4c6a7051ad60b93e4c67206060ee4c6a7060ed60ce4c6a7070ed60d93e4c67206070e720cd60ee4c6a7080ed60f93e4c67206080e720ed61093c27206c2a7d611db63087206d61293b27211730400b27205730500d61393b27211730600b27205730700d614b27203730800d61573099593b1a4730ad809d616b2db6501fe730b00d617b2e4c672160811730c00d618b2a5730d00d6199591b17205730e8cb27205730f00027310d61ab2a5731100d61bc67216070ed61c96830d017209720a720b720d720f93b27207731200b2720373130093b27207731400720893b27207731500720493b27207731600b2720373170072107212721393c172067318d61d93b272077319009a72147219d61e9d9c9d9c72197202731a7217731b95ec937202731c8f9d9c72047217731d731ed801d61fb2db63087218731f00d196830401721c721d96830301938c721f01720c93c27218720e938c721f0272199683020193c2721ae4721b93c1721a7320958f721e7321d17322d802d61fb2db63087218732300d620b2db6308721a732400d196830401721c721d96830301938c721f01720c93c27218720e938c721f02997219721e96830301938c722001720c93c2721ae4721b938c722002721ed805d61691b172057325d617860283010273267327d618957216ededed938cb272057328017217017215938cb27205732901721701720c8f8cb27205732a0172170299720872148f72147208ed938cb27205732b0172170172158f72147208d619b2a4732c00d61a9572169a8cb2db63087219732d00028cb27205732e00028cb2db63087219732f0002957218d801d61b9683040192c1720673307331968309017209720a720b720d720f937207720372107212721372189591721a7208d803d61cb2db6308b2a5733200733300d61d9972087214d61eb27211733400d19683030196830201938c721c0299721a721d938c721c01720c96830201938c721e02721d938c721e01720c721bd801d61cb27211733500d19683020196830201938c721c02721a938c721c01720c721bd17336';
//Exle: SLT RepaymentBox Token V1.3 | This acts as a form of identification for SLT RepaymentBoxes where borrowers use to repay back to lenders.
export const EXLE_SLE_REPAYMENT_TOKEN_ID =
	'302e93e8a379fb7bd750567947d0a396f2b138b51781e743457ee206e5b8ecc0';

//Exle: SLT CrowdFund Token V1.3 | This acts as a form of identification for SLT CrowdFundBox where lenders use to raise funds in a group.
export const EXLE_SLE_CROWD = '52cdac4eaeeade5c52056b1a5e6ccb5d5c04f81988b15afa27b93dd3b56d4cf9';

export const EXLE_PROXY_REPAYMENT =
	'101504000e20302e93e8a379fb7bd750567947d0a396f2b138b51781e743457ee206e5b8ecc00400040002010500040204040404050004000400040204040400040401000400040004e8020100d806d601b2a4730000d602db63087201d6037301d604b2a5730200d605e4c6a7050ed60693c27204720595938cb27202730301860283010273047305017203d804d607b2e4c672010911730600d6089591b1720273078cb27202730800027309d609eded93e4c6a7040ec572019172077208938cb27202730a00017203d60a9a72088cb2db6308a7730b00029572099591720a7207d801d60bb2a5730c00d1eded938cb2db63087204730d0002720796830201938cb2db6308720b730e000299720a720793c2720b72057209d1ed7209938cb2db63087204730f0002720ad17310957206d802d607b2db63087204731100d608b27202731200d1ed96830301938c7207018c720801938c7207028c72080292a39a8cc7a70173137206d17314';

export const EXLE_PROXY_LEND_CREATE =
	'100a040004000580897a04e802040204000e2018dc4c1da4a0a91c08c0b7b85ccd46e0b2ab91396b38c8216406959356805e3b04000e20a624c7e51ffae8f16fe024d8556faf47aac1c7fcaa7f584b95e9784e6426f630058080b401d803d601b2a5730000d602c27201d603e4c6a7060e959372027203d801d604b2a4730100d19683030192c1720199c172047302937202e4c67204060e92a39a8cc7a7017303d801d604b2a5730400d196830801938cb2db63087201730500017306938cb2db6308720473070001730893e4c672040411e4c6a7041193e4c67204051ae4c6a7051a93e4c67204060e720393e4c67204070ee4c6a7070e93c172047309efe6c672040807';

export const EXLE_ERGO_TREES = [
	EXLE_LEND_BOX_ERGOTREE,
	EXLE_SERVICE_BOX_ERGOTREE,
	EXLE_REPAYMENT_BOX_ERGOTREE,
	EXLE_PROXY_LEND_CREATE,
	EXLE_PROXY_REPAYMENT
];

const LENDING_TOKENS: TokenInfo[] = [
	{
		tokenId: '0000000000000000000000000000000000000000000000000000000000000000',
		decimals: 9,
		name: 'Ergo',
		ticker: 'ERG',
		project: 'Ergoplatform',
		description: 'Ergoplatform native coin',
		defaultAmount: 10_000_000_000n
	},
	{
		tokenId: '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04',
		decimals: 2,
		name: 'SigmaUSD',
		ticker: 'SigUSD',
		project: 'Sigma USD',
		description: 'Algorithmic stablecoin',
		defaultAmount: 10_00n
	},
	{
		tokenId: 'f60bff91f7ae3f3a5f0c2d35b46ef8991f213a61d7f7e453d344fa52a42d9f9a',
		decimals: 2,
		name: 'Test SigUSD',
		ticker: 'TestUSD',
		project: 'Test',
		description: 'Algorithmic stablecoin',
		defaultAmount: 10_00n
	},
	{
		tokenId: '6ba45eb59947c2b7a19ec6cff038080776e2303c328b321832d32924dfc297c2',
		decimals: 0,
		name: 'Exle: TestSigUSD',
		ticker: 'ExleTestUSD',
		project: 'Exle',
		description:
			'Tokens to use in place of SigUSD for testing Exle loans. This value is not pegged to anything and holds no value',
		defaultAmount: 10_00n
	}
];

export function tokenByTicker(ticker: string) {
	return LENDING_TOKENS.find((t) => t.ticker == ticker);
}

export function tickerByTokenId(tokenId: string) {
	return LENDING_TOKENS.find((t) => t.tokenId == tokenId)?.ticker ?? '???';
}

export function decimalsByTokenId(tokenId: string): number {
	return LENDING_TOKENS.find((t) => t.tokenId == tokenId)!.decimals;
}

export function decimalsByTicker(ticker: string): number {
	return LENDING_TOKENS.find((t) => t.ticker == ticker)!.decimals;
}

// TYPES
type TokenInfo = {
	tokenId: string;
	decimals: number;
	name: string;
	ticker: string;
	project: string;
	description: string;
	defaultAmount: bigint;
};

export type UnconfirmedNodeBox = {
	additionalRegisters: Record<string, string>;
	assets: {
		amount: bigint;
		tokenId: string;
	}[];
	boxId: string;
	creationHeight: number;
	ergoTree: string;
	index: number;
	transactionId: string;
	value: bigint;
};

export type ConfirmedNodeBox = UnconfirmedNodeBox & {
	address: string;
	globalIndex: number;
	inclusionHeight: number;
	spentTransactionId: string | null;
};

export type NodeBox = UnconfirmedNodeBox | ConfirmedNodeBox;

type ExleFundingInfo = {
	fundingGoal: bigint;
	deadlineHeight: bigint;
	interestRate: bigint;
	repaymentHeightLength: bigint;
	serviceFee?: bigint; // опционально, если есть 5-й элемент
};
type ExleRepaymentDetails = {
	fundedHeight: bigint;
	repaymentAmount: bigint;
	interestAmount: bigint;
	repaymentDeadlineHeight: bigint;
	repaidAmount: bigint;
};

type ExleRepaymentTokensStatus = {
	lockedAmount: bigint;
	lockedLevel: bigint;
	repaymentLevel: bigint;
};

type ExleLendParametersTokens = ExleLendParametersErg & {
	tokenId: string;
};

type ExleLendParametersErg = {
	exleFundingInfo: ExleFundingInfo;
	projectDetails: string[];
	borrowerErgoTree: string;
};

type ExleFundingTokensStatus = { fundedAmount: bigint; fundingLevel: bigint };

export type NodeInfo = {
	lastMemPoolUpdateTime: number;
	currentTime: number;
	network: string;
	name: string;
	stateType: string;
	difficulty: number;
	bestFullHeaderId: string;
	bestHeaderId: string;
	peersCount: number;
	unconfirmedCount: number;
	appVersion: string;
	eip37Supported: boolean;
	stateRoot: string;
	genesisBlockId: string;
	restApiUrl: string;
	previousFullHeaderId: string;
	fullHeight: number;
	headersHeight: number;
	stateVersion: string;
	fullBlocksScore: number;
	maxPeerHeight: number;
	launchTime: number;
	isExplorer: boolean;
	lastSeenMessageTime: number;
	eip27Supported: boolean;
	headersScore: number;
	parameters: {
		outputCost: number;
		tokenAccessCost: number;
		maxBlockCost: number;
		height: number;
		maxBlockSize: number;
		dataInputCost: number;
		blockVersion: number;
		inputCost: number;
		storageFeeFactor: number;
		minValuePerByte: number;
	};
	isMining: boolean;
};

// utils start
export function convertToBigInt(obj: any): any {
	if (Array.isArray(obj)) {
		return obj.map(convertToBigInt);
	} else if (obj && typeof obj === 'object') {
		const copy: any = {};
		for (const [k, v] of Object.entries(obj)) {
			if (typeof v == 'string' && v.includes('.')) {
				copy[k] = v;
			} else if (k === 'value' || k === 'amount') {
				copy[k] = BigInt(String(v));
			} else {
				copy[k] = convertToBigInt(v);
			}
		}
		return copy;
	}
	return obj;
}

export function decodeBigInt(box: NodeBox | undefined, register: string): bigint[] {
	if (!box) return [];
	const r = box.additionalRegisters[register];
	if (r) {
		const parsed = parse<bigint | bigint[]>(r);
		return Array.isArray(parsed) ? parsed : [parsed];
	}
	return [];
}

export function decodeUint8Array(box: NodeBox | undefined, register: string): string {
	if (!box) return '';
	const r = box.additionalRegisters[register];
	if (r) {
		const parsed = Buffer.from(parse(r)).toString('hex');
		return parsed;
	}
	return '';
}

export function decodeBorrowerPk(box: NodeBox | undefined, register: string): string {
	if (!box) return '';
	const r = box.additionalRegisters[register];
	if (r) {
		const parsed = Buffer.from(parse(r)).toString('hex');
		return parsed;
	}
	return '';
}

export function decodeCrowdfundLoanId(box: NodeBox | undefined): string {
	if (!box) return '';
	const r = box.additionalRegisters['R4'];
	if (r) {
		const parsed = Buffer.from(parse(r)).toString('hex');
		return parsed;
	}
	return '';
}

export function jsonParseBigInt(text: string) {
	// Match "value" or "amount" fields with any number format, handling whitespace and newlines
	const valueAmountRegex = /"(value|amount)"\s*:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*([,\}\]])/g;

	// Replace with string version while preserving the structure
	const processedText = text.replace(valueAmountRegex, '"$1":"$2"$3');

	return JSON.parse(processedText);
}

function blocksToDays(blocks: bigint): number {
	if (blocks === 0n) return 0;
	const blocksPerDay = 720n;
	const left = Number((blocks + blocksPerDay - 1n) / blocksPerDay);
	return left < 0 ? 0 : left;
}

export function isErgoAddress(checkString: string): boolean {
	return ErgoAddress.fromBase58(checkString).getPublicKeys().length > 0;
}

export function isPK(checkString: string): boolean {
	return ErgoAddress.fromErgoTree(checkString).getPublicKeys().length > 0;
}

export function parseLoanToken(box: NodeBox): TokenInfo | undefined {
	const r7 = box.additionalRegisters.R7;
	if (isPK(r7)) {
		return LENDING_TOKENS.find((t) => t.ticker == 'ERG');
	}
	if (r7) {
		const tokenId = Buffer.from(parse(r7)).toString('hex');
		return LENDING_TOKENS.find((t) => t.tokenId == tokenId);
	}
}

export function createCrowdfundContract(map = {}): string {
	const tree = compile(CROWDFUND_CONTRACT, {
		map,
		version: 0,
		includeSize: false
	});
	return tree.toAddress(Network.Mainnet).toString();
}
// utils end

// fetch info
export async function fetchNodeInfo(): Promise<NodeInfo | null> {
	const url = `${NODE_BASE_URL}/info`;

	try {
		const response = await fetch(url, {
			headers: { accept: 'application/json' }
		});

		if (!response.ok) {
			const body = await response.text();
			console.error(`[GET /info] HTTP Error ${response.status}: ${body}`);
			return null;
		}

		const data = await response.json();
		return data as NodeInfo;
	} catch (error) {
		console.error(`[GET /info] Request failed:`, error);
		return null;
	}
}

// fetch data start
export type ErgoTransaction = {
	id: string;
	inputs: any[];
	outputs: any[];
	[key: string]: any;
};

type TransactionsResponse = {
	items: ErgoTransaction[];
};

async function fetchTransactionById(txId: string): Promise<ErgoTransaction | null> {
	const url = `${NODE_BASE_URL}/blockchain/transaction/byId/${txId}`;

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP ${response.status}: ${errorText}`);
		}

		const text = await response.text();
		const data = jsonParseBigInt(text);
		return data;
	} catch (error) {
		console.error(`Failed to fetch transaction by ID (${txId}):`, error);
		return null;
	}
}

async function fetchTransactionsByAddress(
	address: string,
	offset: number = 0,
	limit: number = 100
): Promise<ErgoTransaction[]> {
	const url = `${NODE_BASE_URL}/blockchain/transaction/byAddress?offset=${offset}&limit=${limit}`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify(address)
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP ${response.status}: ${errorText}`);
		}

		const text = await response.text();
		const data = jsonParseBigInt(text);

		if (Array.isArray(data.items)) {
			return data.items;
		} else {
			console.error('Unexpected response format:', data);
			return [];
		}
	} catch (error) {
		console.error('Failed to fetch transactions:', error);
		return [];
	}
}

async function fetchTransactionsByTree(
	tree: string,
	offset: number = 0,
	limit: number = 100
): Promise<ErgoTransaction[]> {
	const address = ErgoAddress.fromErgoTree(tree).toString();
	return fetchTransactionsByAddress(address, offset, limit);
}

export async function fetchLoanHistory(
	offset: number = 0,
	limit: number = 100
): Promise<ErgoTransaction[]> {
	return fetchTransactionsByTree(EXLE_LEND_BOX_ERGOTREE, offset, limit);
}

async function fetchAllBoxesByTokenId(
	tokenId: string,
	offset: number = 0,
	limit: number = 100
): Promise<NodeBox[]> {
	const url = `${NODE_BASE_URL}/blockchain/box/byTokenId/${tokenId}?offset=${offset}&limit=${limit}`;

	try {
		const response = await fetch(url, {
			headers: { accept: 'application/json' }
		});

		if (!response.ok) {
			const body = await response.text();
			console.error(`[box/byTokenId] HTTP Error ${response.status}: ${body}`);
			return [];
		}

		const text = await response.text();
		const data = jsonParseBigInt(text);
		return data.items;
	} catch (error) {
		console.error(`[box/byTokenId] Request failed:`, error);
		return [];
	}
}

async function fetchBoxesByTokenId(
	tokenId: string,
	offset: number = 0,
	limit: number = 1
): Promise<NodeBox[]> {
	const url = `${NODE_BASE_URL}/blockchain/box/unspent/byTokenId/${tokenId}?offset=${offset}&limit=${limit}&sortDirection=desc&includeUnconfirmed=true`;

	try {
		const response = await fetch(url, {
			headers: { accept: 'application/json' }
		});

		if (!response.ok) {
			const body = await response.text();
			console.error(`[box/unspent/byTokenId] HTTP Error ${response.status}: ${body}`);
			return [];
		}

		const text = await response.text();
		const data = jsonParseBigInt(text);
		return Array.isArray(data) ? data : [];
	} catch (error) {
		console.error(`[box/unspent/byTokenId] Request failed:`, error);
		return [];
	}
}

async function fetchUnspentBoxesByErgoTree(ergoTree: string): Promise<NodeBox[]> {
	const url = `${NODE_BASE_URL}/blockchain/box/unspent/byErgoTree?offset=0&limit=100&sortDirection=desc&includeUnconfirmed=true&excludeMempoolSpent=true`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(ergoTree)
		});

		if (!response.ok) {
			const body = await response.text();
			console.error(`[box/unspent/byErgoTree] HTTP Error ${response.status}: ${body}`);
			return [];
		}

		const text = await response.text();
		const data = jsonParseBigInt(text);
		console.log({ text });
		console.log({ data });
		return Array.isArray(data) ? data : [];
	} catch (error) {
		console.error(`[box/unspent/byErgoTree] Request failed:`, error);
		return [];
	}
}

export function fetchRepayments() {
	return fetchUnspentBoxesByErgoTree(EXLE_REPAYMENT_BOX_ERGOTREE);
}

export function fetchLoans() {
	return fetchUnspentBoxesByErgoTree(EXLE_LEND_BOX_ERGOTREE);
}

export async function fetchServiceBox(): Promise<NodeBox | undefined> {
	const boxes = await fetchBoxesByTokenId(EXLE_SLE_SERVICE_NFT_ID);
	return boxes[0];
}

export async function fetchLendBox(tokenId: string): Promise<NodeBox | undefined> {
	const boxes = await fetchBoxesByTokenId(tokenId);
	return boxes[0];
}

export async function fetchBoxByTokenId(tokenId: string): Promise<NodeBox | undefined> {
	const boxes = await fetchBoxesByTokenId(tokenId);
	return boxes[0];
}

export function fetchCrowdFundBoxesByLoanId(loanId: string) {
	const crowdErgoTree = createCrowdBoxErgoTree(loanId);
	return fetchUnspentBoxesByErgoTree(crowdErgoTree);
}

export async function fetchAllCrowdfundBoxes(): Promise<NodeBox[]> {
	const maybeCrowdfundBoxes = await fetchBoxesByTokenId(EXLE_SLE_CROWD, 0, 100);
	return maybeCrowdfundBoxes.filter(isCrowdFundBox);
}

export function getCrowdfundLoanIds(crowdfundBoxes: NodeBox[]): Set<string> {
	const loanIds = crowdfundBoxes.map(decodeCrowdfundLoanId).filter(Boolean);
	return new Set(loanIds);
}

/**
 * Fetch contributors for a specific crowdfund loan by its loan ID
 */
export async function fetchCrowdfundContributors(
	loanId: string,
	tokenDecimals: number = 2,
	tokenTicker: string = 'SigUSD'
): Promise<CrowdfundContributor[]> {
	// Find the crowdfund box for this loan
	const crowdfundBoxes = await fetchCrowdFundBoxesByLoanId(loanId);

	if (crowdfundBoxes.length === 0) {
		return [];
	}

	const crowdfundBox = crowdfundBoxes[0];
	const crowdfundTokenId = crowdfundBox.assets[1]?.tokenId;

	if (!crowdfundTokenId) {
		return [];
	}

	// Fetch all boxes that have this crowdfund token (historical and current)
	const allBoxes = await fetchAllBoxesByTokenId(crowdfundTokenId, 0, 100);

	// Get unique transaction IDs
	const txIds = [...new Set(allBoxes.map((b) => b.transactionId))];

	// Fetch all transactions
	const transactions = await Promise.all(txIds.map(fetchTransactionById));

	// Extract contributors
	return getCrowdfundContributors(transactions, loanId, tokenDecimals, tokenTicker);
}

export type Donation = {
	loanId: string;
	type: LoanType;
	amount: bigint;
	status: DonationStatus;
	title: string;
	ticker: string;
};

export type LoanType = 'Crowdloan' | 'Solofund';

export type DonationStatus =
	| 'Fully Repaid'
	| 'Partialy Repaid'
	| 'In repayment'
	| 'Fully Funded'
	| 'Funding'
	| 'Cancelled';

export type AllExleMetadata = {
	nodeInfo: NodeInfo | null;
	loanBoxes: NodeBox[];
	repaymentBoxes: NodeBox[];
	crowdfundBoxes: NodeBox[];
	loanIds: string[];
	crowdfundLoanIds: (string | undefined)[];
	crowdfundHistoryTxs: (ErgoTransaction | null)[];
	loanHistoryTxs: (ErgoTransaction | null)[];
};
export async function fetchAllExleMetadata(): Promise<AllExleMetadata> {
	const nodeInfo = await fetchNodeInfo();
	const maybeLoanBoxes = await fetchBoxesByTokenId(EXLE_SLE_LEND_TOKEN_ID, 0, 100);
	const maybeRepaymentBoxes = await fetchBoxesByTokenId(EXLE_SLE_REPAYMENT_TOKEN_ID, 0, 100);
	const maybeCrowdfundBoxes = await fetchBoxesByTokenId(EXLE_SLE_CROWD, 0, 100);

	const loanBoxes = maybeLoanBoxes.filter(isExleLendTokenBox);
	const repaymentBoxes = maybeRepaymentBoxes.filter(isExleRepaymentTokenBox);
	const crowdfundBoxes = maybeCrowdfundBoxes.filter(isCrowdFundBox);
	const loanIds = [...loanBoxes, ...repaymentBoxes].map((b) => b.assets[1].tokenId);

	const crowdfundLoanIds = crowdfundBoxes.map(decodeCrowdfundLoanId);

	const crowdfundIds = crowdfundBoxes.map((b) => b.assets[1].tokenId);
	const crowdfundHistoryBoxes = (
		await Promise.all(crowdfundIds.map((lId) => fetchAllBoxesByTokenId(lId, 0, 100)))
	).flatMap((x) => x);
	console.log({ crowdfundHistoryBoxes });
	const crowdfundHistoryTxIds = crowdfundHistoryBoxes.map((b) => b.transactionId);
	const crowdfundHistoryTxs = await Promise.all(crowdfundHistoryTxIds.map(fetchTransactionById));

	const loanHistoryBoxes = (
		await Promise.all(loanIds.map((lId) => fetchAllBoxesByTokenId(lId, 0, 100)))
	).flatMap((x) => x);
	const loanHistoryTxIds = loanHistoryBoxes.map((b) => b.transactionId);
	const loanHistoryTxs = await Promise.all(loanHistoryTxIds.map(fetchTransactionById));

	const allMetadata = {
		nodeInfo,
		loanBoxes,
		repaymentBoxes,
		crowdfundBoxes,
		loanIds,
		crowdfundLoanIds,
		crowdfundHistoryTxs,
		loanHistoryTxs
	};
	console.log({ allMetadata });

	return allMetadata;
}

// fetch data end
export type TxAction =
	| '🎉 Loan Funded'
	| 'Loan Created'
	| 'Crowdfund Created'
	| 'Loan Repayment'
	| 'Loan Funding'
	| 'Loan Crowdfunding'
	| 'Repayment Crowdfunding';
export type LoanRole = 'Borrower' | 'Lender';
export type HistoryItem = {
	action: TxAction;
	role: LoanRole;
	txId: string;
	timestamp: number;
	amount: bigint | undefined;
	tokenId: string | undefined;
};

export interface Loan {
	phase: 'loan' | 'repayment';
	loanId: string;
	loanType: string;
	loanTitle: string;
	loanDescription: string;
	repaymentPeriod: string;
	interestRate: string;
	fundingGoal: string;
	fundingToken: string;
	fundedAmount: string;
	fundedPercentage: number;
	daysLeft: number;
	creator: string;
	isReadyForWithdrawal?: boolean;
	isRepayed?: boolean;
}

export function parseRepaymentBox(box: NodeBox, nodeInfo: NodeInfo): Loan | undefined {
	if (box.assets.length < 2 || !box.additionalRegisters.R7) return;
	const token = parseLoanToken(box);
	if (!token) return;

	const funding = decodeExleFundingInfo(box);
	const project = decodeExleProjectDetails(box);
	const repay = decodeExleRepaymentDetailsTokens(box);
	const { repaymentLevel, lockedAmount } = getExleRepaymentTokensStatus(box);

	const repaymentGoal = Number(Number(repay.repaymentAmount) / 10 ** token.decimals).toFixed(2);
	const repaidAmount = Number(Number(repay.repaidAmount) / 10 ** token.decimals).toFixed(2);

	const repayment = {
		phase: 'repayment' as const,
		loanId: box.assets[1].tokenId,
		loanType: 'Crowdloan',
		loanTitle: project[0],
		loanDescription: project.slice(1).join('\n'),
		repaymentPeriod: '' + blocksToDays(funding.repaymentHeightLength), // TODO: - height?
		interestRate: `${(Number(funding.interestRate) / 10).toFixed(1)}%`,
		fundingGoal: repaymentGoal,
		fundingToken: token.ticker,
		fundedAmount: repaidAmount + ' ' + token.ticker,
		fundedPercentage: Number(repaymentLevel),
		daysLeft: blocksToDays(repay.repaymentDeadlineHeight - BigInt(nodeInfo.fullHeight)), // TODO: - height
		creator: ErgoAddress.fromErgoTree(decodeExleBorrower(box)).toString(),
		isReadyForWithdrawal: lockedAmount > 0n, // TODO: handle erg
		isRepayed: repaymentLevel == 100n
	};

	return repayment;
}

export function parseLoanBox(
	box: NodeBox,
	nodeInfo: NodeInfo,
	loanType: LoanType = 'Solofund',
	crowdfundFundedAmount?: bigint
): Loan | undefined {
	if (box.assets.length < 2 || !box.additionalRegisters.R7) return;
	const token = parseLoanToken(box);
	if (!token) return;

	const funding = decodeExleFundingInfo(box);
	const project = decodeExleProjectDetails(box);

	// For crowdloans, use the funded amount from the crowdfund box
	// For soloFund, use the funded amount from the lend box
	let fundedAmount: bigint;
	let fundingLevel: bigint;

	if (loanType === 'Crowdloan' && crowdfundFundedAmount !== undefined) {
		fundedAmount = crowdfundFundedAmount;
		fundingLevel = funding.fundingGoal > 0n ? (fundedAmount * 100n) / funding.fundingGoal : 0n;
	} else {
		const lendStatus = getExleLendTokensStatus(box);
		fundedAmount = lendStatus.fundedAmount;
		fundingLevel = lendStatus.fundingLevel;
	}

	const fundingGoal = Number(Number(funding.fundingGoal) / 10 ** token.decimals).toFixed(2);
	const fundedAmountFormatted = Number(Number(fundedAmount) / 10 ** token.decimals).toFixed(2);

	const repayment = {
		phase: 'loan' as const,
		loanId: box.assets[1].tokenId,
		loanType: loanType,
		loanTitle: project[0],
		loanDescription: project.slice(1).join('\n'),
		repaymentPeriod: '' + blocksToDays(funding.repaymentHeightLength), // TODO: - height?
		interestRate: `${(Number(funding.interestRate) / 10).toFixed(1)}%`,
		fundingGoal: fundingGoal,
		fundingToken: token.ticker,
		fundedAmount: fundedAmountFormatted + ' ' + token.ticker,
		fundedPercentage: Number(fundingLevel),
		daysLeft: blocksToDays(funding.deadlineHeight - BigInt(nodeInfo.fullHeight)),
		creator: ErgoAddress.fromErgoTree(decodeExleBorrower(box)).toString(),
		isReadyForWithdrawal: fundingLevel >= 100n // TODO: handle erg
	};

	return repayment;
}

export function exleHighLevelRecogniser(tx: ErgoTransaction): string {
	const inServiceBox = tx.inputs.find(isExleServiceBox);
	const outServiceBox = tx.outputs.find(isExleServiceBox);
	const inLendBox = tx.inputs.find(isExleLendTokenBox);
	const outLendBox = tx.outputs.find(isExleLendTokenBox);
	const inRepaymentBox = tx.inputs.find(isExleRepaymentTokenBox);
	const outRepaymentBox = tx.outputs.find(isExleRepaymentTokenBox);
	const inProxyCreateBox = tx.inputs.find(isProxyCreateBox);
	const outProxyCreateBox = tx.outputs.find(isProxyCreateBox);
	const inProxyRepaymentBox = tx.inputs.find(isProxyRepaymentBox);
	const outProxyRepaymentBox = tx.outputs.find(isProxyRepaymentBox);
	const inCrowdFundBox = tx.inputs.find(isCrowdFundBox);
	const outCrowdFundBox = tx.outputs.find(isCrowdFundBox);

	let label = '';

	// tx 1 type : 'Create Lend'
	// tx 2 type : 'Create CrowdFund'

	if (inServiceBox && outServiceBox) {
		if (!inLendBox && outLendBox) {
			label = 'Create Lend';

			// ERG or TOKENS
			if (outLendBox.additionalRegisters.R7) {
				label = 'Create Lend | Tokens';
				if (inProxyCreateBox) {
					label = 'PROXY: Create Lend | Tokens';
				}
			} else {
				label = 'Create Lend | Erg';
				if (inProxyCreateBox) {
					label = 'PROXY: Create Lend | Erg';
				}
			}
		}
		if (inLendBox && outRepaymentBox) {
			label = 'Lend to Repayment';
			if (outRepaymentBox.additionalRegisters.R9) {
				label = 'Lend to Repayment | Tokens';
			} else {
				label = 'Lend to Repayment | Erg';
			}
		}
		if (inLendBox && outLendBox && outCrowdFundBox) {
			if (tx.outputs[2]?.assets[1]) {
				if (tx.outputs[2].assets[0].tokenId == EXLE_SLE_CROWD) {
					label = 'Create Crowdfund | Tokens';
				}
			}
		}
	} else {
		if (inCrowdFundBox && outCrowdFundBox) {
			const inAmount = getExleCrowdFundTokensAmount(inCrowdFundBox);
			const outAmount = getExleCrowdFundTokensAmount(outCrowdFundBox);
			if (inAmount) {
				if (outAmount) {
					label = outAmount > inAmount ? 'Fund Crowdfund | Tokens' : 'Repayment Crowdfund | Tokens';
				} else {
					label = 'Repayment Crowdfund | Tokens';
				}
			} else {
				if (outAmount) {
					label = 'Fund Crowdfund | Tokens';
				} else {
					label = '';
				}
			}
		}

		if (inLendBox && outLendBox) {
			label = 'Lend to Lend';
			if (outLendBox.additionalRegisters.R7 && !isPK(outLendBox.additionalRegisters.R7)) {
				label = 'Lend to Lend | Tokens';
			} else {
				label = 'Lend to Lend | Erg';
			}
		}
		if (inRepaymentBox && outRepaymentBox) {
			label = 'Repayment to Repayment';
			if (outRepaymentBox.additionalRegisters.R9) {
				label = 'Repayment to Repayment | Tokens';
			} else {
				label = 'Repayment to Repayment | Erg';
			}
		}

		if (inRepaymentBox && inProxyRepaymentBox && outRepaymentBox) {
			label = 'PROXY: Repayment to Repayment';
			if (outRepaymentBox.additionalRegisters.R9) {
				label = 'PROXY: Repayment to Repayment | Tokens';
			} else {
				label = 'PROXY: Repayment to Repayment | Erg';
			}
		}
		if (outProxyCreateBox) {
			label = 'PROXY Lend Initiation';
		}
		if (outProxyRepaymentBox) {
			label = 'PROXY Repayment Initiation';
		}
	}
	// PROXY X
	// console.log(inServiceBox?.boxId);
	// console.log(outServiceBox?.boxId);
	// console.log(inLendBox?.boxId);
	// console.log(outLendBox?.boxId);
	// console.log(inRepaymentBox?.boxId);
	// console.log(outRepaymentBox?.boxId);
	return label;
}

export function txToHistoryItem(tx: ErgoTransaction): HistoryItem | undefined {
	const label = exleHighLevelRecogniser(tx);
	return txToHistoryItemFromLabel(tx, label);
}

export function txToHistoryItemFromLabel(
	tx: ErgoTransaction,
	label: string
): HistoryItem | undefined {
	if (label == 'Lend to Repayment | Tokens') {
		const role = 'Borrower';

		const inLendBox = tx.inputs.find(isExleLendTokenBox);
		const tokenId = decodeExleLoanTokenId(inLendBox);
		const { fundingGoal: amount } = decodeExleFundingInfo(inLendBox);

		return {
			action: '🎉 Loan Funded',
			role,
			txId: tx.id,
			timestamp: tx.timestamp,
			amount,
			tokenId
		};
	} else if (label == 'Create Lend | Tokens') {
		return {
			action: 'Loan Created',
			role: 'Borrower',
			txId: tx.id,
			timestamp: tx.timestamp,
			amount: undefined,
			tokenId: undefined
		};
	} else if (label == 'PROXY Lend Initiation') {
		return {
			action: 'Loan Created',
			role: 'Borrower',
			txId: tx.id,
			timestamp: tx.timestamp,
			amount: undefined,
			tokenId: undefined
		};
	} else if (label == 'PROXY Repayment Initiation') {
		const outProxyRepaymentBox = tx.outputs.find(isProxyRepaymentBox);
		return {
			action: 'Loan Repayment',
			role: 'Borrower',
			txId: tx.id,
			timestamp: tx.timestamp,
			amount: getExleProxyTokensAmount(outProxyRepaymentBox),
			tokenId: getExleProxyTokensTokenId(outProxyRepaymentBox)
		};
	} else if (label == 'Repayment to Repayment | Tokens') {
		const inRepaymentBox = tx.inputs.find(isExleRepaymentTokenBox);
		const outRepaymentBox = tx.outputs.find(isExleRepaymentTokenBox);

		const { lockedAmount: lockedIn, repaymentLevel: repaymentIn } =
			getExleRepaymentTokensStatus(inRepaymentBox);
		const { lockedAmount: lockedOut, repaymentLevel: repaymentOut } =
			getExleRepaymentTokensStatus(outRepaymentBox);

		if (repaymentIn < repaymentOut) {
			const amount = lockedIn - lockedOut;

			return {
				action: 'Loan Repayment',
				role: 'Lender',
				txId: tx.id,
				timestamp: tx.timestamp,
				amount: amount,
				tokenId: decodeExleLoanTokenId(inRepaymentBox)
			};
		} else {
			const amount = (lockedIn - lockedOut) * -1n;
			return {
				action: 'Loan Repayment',
				role: 'Borrower',
				txId: tx.id,
				timestamp: tx.timestamp,
				amount: amount,
				tokenId: decodeExleLoanTokenId(outRepaymentBox)
			};
		}
	} else if (label == 'Fund Crowdfund | Tokens') {
		const inCrowdFundBox = tx.inputs.find(isCrowdFundBox);
		const outCrowdFundBox = tx.outputs.find(isCrowdFundBox);
		return {
			action: 'Loan Crowdfunding',
			role: 'Lender',
			txId: tx.id,
			timestamp: tx.timestamp,
			amount:
				(getExleCrowdFundTokensAmount(outCrowdFundBox) ?? 0n) -
				(getExleCrowdFundTokensAmount(inCrowdFundBox) ?? 0n),
			tokenId: getExleCrowdFundTokensTokenId(outCrowdFundBox)
		};
	} else if (label == 'Repayment Crowdfund | Tokens') {
		const inCrowdFundBox = tx.inputs.find(isCrowdFundBox);
		const outCrowdFundBox = tx.outputs.find(isCrowdFundBox);
		return {
			action: 'Repayment Crowdfunding',
			role: 'Lender',
			txId: tx.id,
			timestamp: tx.timestamp,
			amount:
				(getExleCrowdFundTokensAmount(inCrowdFundBox) ?? 0n) -
				(getExleCrowdFundTokensAmount(outCrowdFundBox) ?? 0n),
			tokenId: getExleCrowdFundTokensTokenId(outCrowdFundBox)
		};
	} else if (label == 'Create Crowdfund | Tokens') {
		// o/ o/ o/ o/ o/
		const inCrowdFundBox = tx.inputs.find(isCrowdFundBox);
		const outCrowdFundBox = tx.outputs.find(isCrowdFundBox);
		return {
			action: 'Crowdfund Created',
			role: 'Borrower',
			txId: tx.id,
			timestamp: tx.timestamp,
			amount: undefined,
			tokenId: undefined
		};
	} else if (label == 'Lend to Lend | Tokens') {
		const outLendBox = tx.outputs.find(isExleLendTokenBox);

		return {
			action: 'Loan Funding',
			role: 'Lender',
			txId: tx.id,
			timestamp: tx.timestamp,
			amount: getExleTokensAmount(outLendBox),
			tokenId: decodeExleLoanTokenId(outLendBox)
		};
	}
}

export function exleLowLevelRecogniser(tx: ErgoTransaction, label: string) {
	let inServiceBox;
	let outServiceBox;
	let inLendBox;
	let outLendBox;
	let inRepaymentBox;
	let outRepaymentBox;
	let fundingLevel: bigint = 0n;
	let repaymentLevel: bigint = 0n;
	let inLenderBox;
	let outLenderBox;
	let inBorrowerBox;
	let outBorrowerBox;
	let lowLevelLabel: string = '';
	let lockedLevel: bigint = 0n;

	if (label == 'Create Lend | Tokens') {
		outLendBox = tx.outputs.find(isExleLendTokenBox);
		const funding = decodeExleFundingInfo(outLendBox);
		const borrower = decodeExleBorrower(outLendBox);
		const loanTokenId = decodeExleLoanTokenId(outLendBox);
		const lender = decodeExleLenderTokens(outLendBox);
		// console.log('out value', outLendBox.value);
		// console.log('out assets', outLendBox.assets);
		// console.log('registers', outLendBox.additionalRegisters);
		// console.log('funding', funding);
		// console.log('borrower', borrower);
		//console.log('loanTokenId', loanTokenId);
		// console.log('lender', lender);
		fundingLevel = 0n;
		repaymentLevel = 0n;
		lowLevelLabel = 'Create Lend | Tokens';
	}

	if (label == 'Create Crowdfund | Tokens') {
		outLendBox = tx.outputs.find(isExleLendTokenBox);
		fundingLevel = 0n;
		repaymentLevel = 0n;
		lowLevelLabel = 'Create Crowdfund | Tokens';
	}

	if (label == 'Lend to Repayment | Tokens') {
		inLendBox = tx.inputs.find(isExleLendTokenBox);
		outRepaymentBox = tx.outputs.find(isExleRepaymentTokenBox);
		const { repaymentAmount, interestAmount } = decodeExleRepaymentDetailsTokens(outRepaymentBox);
		const outTokens = BigInt(outRepaymentBox.assets[2]?.amount ?? 0n);

		const funding = decodeExleFundingInfo(outRepaymentBox);
		const project = decodeExleProjectDetails(outRepaymentBox);
		const repay = decodeExleRepaymentDetailsTokens(outRepaymentBox);
		({ repaymentLevel } = getExleRepaymentTokensStatus(outRepaymentBox));
		fundingLevel = 100n;
		lowLevelLabel = 'Lend to Repayment | Tokens';
	}
	if (label == 'Lend to Lend | Tokens') {
		//console.log('Low');
		inLendBox = tx.inputs.find(isExleLendTokenBox);
		outLendBox = tx.outputs.find(isExleLendTokenBox);

		const { fundedAmount: fundedAmountIn, fundingLevel: fundingLevelIn } =
			getExleLendTokensStatus(inLendBox);
		const { fundedAmount: fundedAmountOut, fundingLevel: fundingLevelOut } =
			getExleLendTokensStatus(outLendBox);

		if (fundedAmountIn < fundedAmountOut) {
			lowLevelLabel = 'Fund Lend Box | Tokens';
			//console.log(tx.id);
			//console.log(decodeExleLenderTokens(outLendBox));
		} else {
			lowLevelLabel = 'unknown | Tokens'; //<= Не понятный случай - надо чекнуть если такие вообще
		}
		fundingLevel = fundingLevelOut;
		repaymentLevel = 0n;
	}
	if (label == 'Repayment to Repayment | Tokens') {
		inRepaymentBox = tx.inputs.find(isExleRepaymentTokenBox);
		outRepaymentBox = tx.outputs.find(isExleRepaymentTokenBox);
		const { repaidAmount, repaymentAmount, interestAmount, fundedHeight, repaymentDeadlineHeight } =
			decodeExleRepaymentDetailsTokens(outRepaymentBox);

		const {
			lockedAmount: lockedAmountIn,
			lockedLevel: lockedLevelIn,
			repaymentLevel: repaymentLevelIn
		} = getExleRepaymentTokensStatus(inRepaymentBox);
		const {
			lockedAmount: lockedAmountOut,
			lockedLevel: lockedLevelOut,
			repaymentLevel: repaymentLevelOut
		} = getExleRepaymentTokensStatus(outRepaymentBox);

		//console.log(lockedAmountIn, lockedLevelIn, repaymentLevelIn);
		//console.log(lockedAmountOut, lockedLevelOut, repaymentLevelOut);
		if (repaymentLevelIn < repaymentLevelOut) {
			lowLevelLabel = 'Repayment to Lender | Tokens';
		} else {
			if (lockedAmountIn < lockedAmountOut) lowLevelLabel = 'Fund Repayment Box | Tokens';
		}

		fundingLevel = 100n;
		repaymentLevel = repaymentLevelOut;
		lockedLevel = lockedLevelOut;
	}

	// inServiceBox = tx.inputs.find(isExleServiceBox);
	// outServiceBox = tx.outputs.find(isExleServiceBox);
	// inLendBox = tx.inputs.find(isExleLendTokenBox);
	// outLendBox = tx.outputs.find(isExleLendTokenBox);
	// inRepaymentBox = tx.inputs.find(isExleRepaymentTokenBox);
	// outRepaymentBox = tx.outputs.find(isExleRepaymentTokenBox);

	return { fundingLevel, repaymentLevel, lowLevelLabel, lockedLevel };
}

//BOX CHECK

export function isExleServiceBox(box: NodeBox): boolean {
	return (
		box.ergoTree === EXLE_SERVICE_BOX_ERGOTREE &&
		box.assets?.[0]?.tokenId === EXLE_SLE_SERVICE_NFT_ID
	);
}

export function isExleLendTokenBox(box: NodeBox): boolean {
	return (
		box.ergoTree === EXLE_LEND_BOX_ERGOTREE &&
		box.assets?.[0]?.tokenId === EXLE_SLE_LEND_TOKEN_ID &&
		box.assets[0]?.amount == 1n
	);
}

export function isExleRepaymentTokenBox(box: NodeBox): boolean {
	return (
		box.ergoTree === EXLE_REPAYMENT_BOX_ERGOTREE &&
		box.assets?.[0]?.tokenId === EXLE_SLE_REPAYMENT_TOKEN_ID &&
		box.assets[0]?.amount == 1n
	);
}

export function isCrowdFundBox(box: NodeBox): boolean {
	return box.ergoTree.endsWith(EXLE_CWORD_TREE_POSTFIX);
}

export function isProxyBox(box: ConfirmedNodeBox): boolean {
	if (box.address == proxyAddress) return true;
	return false;
}

export function isMinerBox(box: ConfirmedNodeBox): boolean {
	if (box.address == minerAddress) return true;
	return false;
}

export function isProxyCreateBox(box: NodeBox): boolean {
	if (box.ergoTree == EXLE_PROXY_LEND_CREATE) return true;
	return false;
}
export function isProxyRepaymentBox(box: NodeBox): boolean {
	if (box.ergoTree == EXLE_PROXY_REPAYMENT) return true;
	return false;
}

export function isExleTx(tx: ErgoTransaction) {
	return exleHighLevelRecogniser(tx);
}

export function isUserTx(tx: ErgoTransaction, userAddress: string) {
	if (
		tx.inputs.flatMap((i) => i.address).includes(userAddress) ||
		tx.outputs.flatMap((o) => o.address).includes(userAddress)
	)
		return true;
	return false;
}

// DECODE
export function decodeExleProjectDetails(box: NodeBox): string[] {
	const parsed = parse(box.additionalRegisters?.R5 ?? '');
	if (!Array.isArray(parsed)) return [];

	// Каждый элемент — это Uint8Array (Coll[Byte])
	return parsed.map((bytes) => Buffer.from(bytes).toString('utf8'));
}
export function decodeExleFundingInfo(box: NodeBox): ExleFundingInfo {
	const raw = decodeBigInt(box, 'R4');

	return {
		fundingGoal: BigInt(raw[0]),
		deadlineHeight: BigInt(raw[1]),
		interestRate: BigInt(raw[2]),
		repaymentHeightLength: BigInt(raw[3]),
		serviceFee: raw[4] !== undefined ? BigInt(raw[4]) : undefined
	};
}
export function decodeExleRepaymentDetailsErg(box: NodeBox): ExleRepaymentDetails {
	const raw = decodeBigInt(box, 'R8');
	return {
		fundedHeight: BigInt(raw[0]),
		repaymentAmount: BigInt(raw[1]),
		interestAmount: BigInt(raw[2]),
		repaymentDeadlineHeight: BigInt(raw[3]),
		repaidAmount: BigInt(raw[4])
	};
}
export function decodeExleRepaymentDetailsTokens(box: NodeBox): ExleRepaymentDetails {
	const raw = decodeBigInt(box, 'R9');
	return {
		fundedHeight: BigInt(raw[0]),
		repaymentAmount: BigInt(raw[1]),
		interestAmount: BigInt(raw[2]),
		repaymentDeadlineHeight: BigInt(raw[3]),
		repaidAmount: BigInt(raw[4])
	};
}
export function decodeExleBorrower(box: NodeBox | undefined): string {
	if (!box) return '';
	const r = box.additionalRegisters.R6;
	if (r) {
		const parsed = Buffer.from(parse(r)).toString('hex');
		return parsed;
	}
	return '';
}
export function decodeExleLenderTokens(box: NodeBox | undefined): string {
	if (!box) return '';
	const r = box.additionalRegisters.R8;
	if (r) {
		const parsed = Buffer.from(parse(r)).toString('hex');
		return parsed;
	}
	return '';
}

export function getExleLoanId(box: NodeBox | undefined): string {
	if (!box) return '';
	return box.assets[1]?.tokenId ?? '';
}

export function decodeExleServiceFee(box: NodeBox | undefined): bigint {
	return decodeBigInt(box, 'R8')[1] ?? 0n;
}

export function decodeExleLoanTokenId(box: NodeBox | undefined): string {
	if (!box) return '';
	const r = box.additionalRegisters.R7;
	if (r) {
		const parsed = Buffer.from(parse(r)).toString('hex');
		return parsed;
	}
	return '';
}
function decodeExleLenderErg(box: NodeBox | undefined): string {
	if (!box) return '';
	const r = box.additionalRegisters.R7;
	if (r) {
		const parsed = Buffer.from(parse(r)).toString('hex');
		return parsed;
	}
	return '';
}

// GET LEND/REPAYMENT TOKENS AMOUNT
export function getExleTokensAmount(box: NodeBox): bigint | undefined {
	const tokenId = decodeExleLoanTokenId(box);
	const amount = box.assets.find((a) => a.tokenId == tokenId)?.amount;
	if (amount) {
		return BigInt(amount);
	} else {
		return undefined;
	}
}
export function getExleCrowdFundTokensAmount(box: NodeBox): bigint | undefined {
	const amount = box?.assets[2]?.amount;
	if (amount) {
		return BigInt(amount);
	} else {
		return undefined;
	}
}
export function getExleCrowdFundTokensTokenId(box: NodeBox): string | undefined {
	const tokenId = box?.assets[2]?.tokenId;
	if (tokenId) {
		return tokenId;
	} else {
		return undefined;
	}
}

export type CrowdfundContributor = {
	address: string;
	amount: string;
	rawAmount: bigint;
	timestamp: number;
	txId: string;
};

/**
 * Extract contributors from crowdfund transaction history for a specific loan
 */
export function getCrowdfundContributors(
	crowdfundHistoryTxs: (ErgoTransaction | null)[],
	loanId: string,
	tokenDecimals: number = 2,
	tokenTicker: string = 'SigUSD'
): CrowdfundContributor[] {
	const contributors: CrowdfundContributor[] = [];

	for (const tx of crowdfundHistoryTxs) {
		if (!tx) continue;

		const label = exleHighLevelRecogniser(tx);
		if (label !== 'Fund Crowdfund | Tokens') continue;

		const inCrowdFundBox = tx.inputs.find(isCrowdFundBox);
		const outCrowdFundBox = tx.outputs.find(isCrowdFundBox);

		if (!outCrowdFundBox) continue;

		// Check if this transaction is for the specified loan
		const txLoanId = decodeCrowdfundLoanId(outCrowdFundBox);
		if (txLoanId !== loanId) continue;

		// Calculate contribution amount
		const inAmount = getExleCrowdFundTokensAmount(inCrowdFundBox) ?? 0n;
		const outAmount = getExleCrowdFundTokensAmount(outCrowdFundBox) ?? 0n;
		const contributionAmount = outAmount - inAmount;

		if (contributionAmount <= 0n) continue;

		// Find contributor address - it's in the non-crowdfund-box inputs
		// The contributor's address is the one that provided the funding tokens
		const contributorInput = tx.inputs.find((input: any) => !isCrowdFundBox(input));
		const contributorAddress = contributorInput?.address || 'Unknown';

		// Format amount with decimals
		const formattedAmount = Number(Number(contributionAmount) / 10 ** tokenDecimals).toFixed(2);

		contributors.push({
			address: contributorAddress,
			amount: `${formattedAmount} ${tokenTicker}`,
			rawAmount: contributionAmount,
			timestamp: tx.timestamp || 0,
			txId: tx.id
		});
	}

	// Sort by timestamp (newest first)
	return contributors.sort((a, b) => b.timestamp - a.timestamp);
}

function getExleProxyTokensAmount(box: NodeBox): bigint | undefined {
	const amount = box?.assets[0]?.amount;
	if (amount) {
		return BigInt(amount);
	} else {
		return undefined;
	}
}
function getExleProxyTokensTokenId(box: NodeBox): string | undefined {
	const tokenId = box?.assets[0]?.tokenId;
	if (tokenId) {
		return tokenId;
	} else {
		return undefined;
	}
}

export function getExleRepaymentTokensStatus(box: NodeBox): ExleRepaymentTokensStatus {
	let lockedAmount = 0n,
		lockedLevel = 0n;

	const { repaymentAmount, repaidAmount } = decodeExleRepaymentDetailsTokens(box);
	const locked = getExleTokensAmount(box);

	const repaymentLevel = (repaidAmount * 100n) / repaymentAmount;
	if (locked) {
		lockedAmount = locked;
		lockedLevel = (lockedAmount * 100n) / repaymentAmount;
	}
	return { lockedAmount, lockedLevel, repaymentLevel };
}

export function getExleLendTokensStatus(box: NodeBox): ExleFundingTokensStatus {
	let fundingLevel = 0n;
	let fundedAmount = 0n;

	const { fundingGoal } = decodeExleFundingInfo(box);
	const funded = getExleTokensAmount(box);

	if (funded) {
		fundedAmount = funded;
		fundingLevel = (fundedAmount * 100n) / fundingGoal;
	}
	return { fundedAmount, fundingLevel };
}

export function donationsFromExleMetadata(allMetadata: AllExleMetadata, me: string): Donation[] {
	const loanHistoryTxs = allMetadata.loanHistoryTxs;
	const crowdfundHistoryTxs = allMetadata.crowdfundHistoryTxs;
	const loanIds = allMetadata.loanIds;
	const crowdfundLoanIds = allMetadata.crowdfundLoanIds;
	const soloFundLoanIds = loanIds.filter((l) => !crowdfundLoanIds.includes(l));
	const nodeInfo = allMetadata.nodeInfo;

	// if amount < ... repayment
	const myCrowdfundTxes = crowdfundHistoryTxs.filter((tx): tx is ErgoTransaction => tx !== null && isUserTx(tx, me));
	const myLoanTxes = loanHistoryTxs.filter((tx): tx is ErgoTransaction => tx !== null && isUserTx(tx, me));

	// JOIN resultLoan + resultCrowd
	function getCombinedDonations(
		loanHistoryTxs: (ErgoTransaction | null)[],
		soloFundLoanIds: string[],
		crowdfundHistoryTxs: (ErgoTransaction | null)[],
		crowdfundLoanIds: (string | undefined)[],
		me: string
	): Omit<Donation, 'status' | 'title'>[] {
		const resultLoan = calculateUserDonationsSolofund(loanHistoryTxs, soloFundLoanIds, me);
		const filteredCrowdfundLoanIds = crowdfundLoanIds.filter((id): id is string => id !== undefined);
		const resultCrowd = calculateUserDonationsCrowdfund(crowdfundHistoryTxs, filteredCrowdfundLoanIds, me);

		const combined: Omit<Donation, 'status' | 'title'>[] = [];

		resultLoan.forEach(([loanId, amount]) => {
			combined.push({ loanId: loanId, type: 'Solofund', amount: amount, ticker: 'SigUSD' });
		});

		resultCrowd.forEach(([loanId, amount]) => {
			combined.push({ loanId: loanId, type: 'Crowdloan', amount: amount, ticker: 'SigUSD' });
		});

		return combined;
	}

	// Example usage:
	const donations = getCombinedDonations(
		loanHistoryTxs,
		soloFundLoanIds,
		crowdfundHistoryTxs,
		crowdfundLoanIds,
		me
	);

	// userLoans + allBoxes
	const loanBoxes = allMetadata.loanBoxes;
	const repaymentBoxes = allMetadata.repaymentBoxes;

	if (nodeInfo) {
		donations.forEach((d) => {
			Object.assign(d, getLoanDonationStatus(d.loanId, repaymentBoxes, loanBoxes, nodeInfo));
		});
	}

	const crowdfundBoxes = allMetadata.crowdfundBoxes;

	function getLoanDonationStatus(
		loanId: string,
		repaymentBoxes: NodeBox[],
		loanBoxes: NodeBox[],
		nodeInfo: NodeInfo
	) {
		const repaymentBox = repaymentBoxes.find((b) => getExleLoanId(b) == loanId);
		const loanBox = loanBoxes.find((b) => getExleLoanId(b) == loanId);
		if (!repaymentBox) {
			if (!loanBox) {
				return { status: 'Cancelled' };
			} else {
				const loan = parseLoanBox(loanBox, nodeInfo);

				if (!loan) {
					return { status: 'Cancelled' };
				}

				if (loan.isReadyForWithdrawal) {
					return { status: 'Fully Funded', title: loan.loanTitle, ticker: loan.fundingToken };
				} else {
					if (loan.daysLeft != 0) {
						return { status: 'Funding', title: loan.loanTitle, ticker: loan.fundingToken };
					} else {
						return { status: 'Cancelled', title: loan.loanTitle, ticker: loan.fundingToken };
					}
				}
			}
		} else {
			const repayment = parseRepaymentBox(repaymentBox, nodeInfo);

			if (!repayment) {
				return { status: 'Cancelled' };
			}

			if (repayment.isRepayed) {
				return {
					status: 'Fully Repaid',
					title: repayment.loanTitle,
					ticker: repayment.fundingToken
				};
			} else {
				if (repayment.daysLeft != 0) {
					return {
						status: 'In repayment',
						title: repayment.loanTitle,
						ticker: repayment.fundingToken
					};
				} else {
					return {
						status: 'Partialy Repaid',
						title: repayment.loanTitle,
						ticker: repayment.fundingToken
					};
				}
			}
		}
	}

	function calculateUserDonationsSolofund(txes: (ErgoTransaction | null)[], soloFundLoanIds: string[], me: string) {
		const soloFundAmount = new Map<string, bigint>(soloFundLoanIds.map((c) => [c, 0n]));

		// PROXY?
		txes.forEach((tx) => {
			if (!tx) return;
			const label = exleHighLevelRecogniser(tx);
			if (label == 'Lend to Lend | Tokens') {
				const outLendBox = tx.outputs.find(isExleLendTokenBox);
				const amount = getExleTokensAmount(outLendBox);
				const lender = decodeExleLenderTokens(outLendBox);
				const loanId = outLendBox?.assets[1]?.tokenId ?? '';
				if (loanId && lender == ErgoAddress.fromBase58(me).ergoTree) {
					soloFundAmount.set(loanId, (soloFundAmount.get(loanId) ?? 0n) + (amount ?? 0n));
				}
			}
		});
		return Array.from(soloFundAmount.entries()).filter((x) => x[1]);
	}

	function calculateUserDonationsCrowdfund(txes: (ErgoTransaction | null)[], crowdfundLoanIds: string[], me: string) {
		const crowdfundAmount = new Map<string, bigint>(crowdfundLoanIds.map((c) => [c, 0n]));

		const userTxes = txes.filter((tx): tx is ErgoTransaction => tx !== null && isUserTx(tx, me));

		userTxes.forEach((tx) => {
			const label = exleHighLevelRecogniser(tx);
			if (label == 'Fund Crowdfund | Tokens') {
				const inCrowdFundBox = tx.inputs.find(isCrowdFundBox);
				const outCrowdFundBox = tx.outputs.find(isCrowdFundBox);
				const inAmount = getExleCrowdFundTokensAmount(inCrowdFundBox) ?? 0n;
				const outAmount = getExleCrowdFundTokensAmount(outCrowdFundBox) ?? 0n;
				const diff = outAmount - inAmount;

				const loanId = decodeCrowdfundLoanId(outCrowdFundBox)!;
				crowdfundAmount.set(loanId, crowdfundAmount.get(loanId)! + diff);
			}
		});
		return Array.from(crowdfundAmount.entries()).filter((x) => x[1]);
	}

	return donations as Donation[];
}

// Lend => Repayment
export function prepareLendToRepaymentTokensTx(
	height: number,
	serviceBox: NodeBox,
	lendBox: NodeBox,
	miningFee: bigint,
	changeAddress: string
) {
	const lendingInfo = decodeBigInt(lendBox, 'R4');
	console.log('lendingINfo', lendingInfo);
	console.log('interest', lendingInfo[2]);

	const borrowerErgoTree = decodeBorrowerPk(lendBox, 'R6');
	//const loanTokenId = decodeBorrowerPk(lendBox, 'R7');
	//const lenderPk = decodeBorrowerPk(lendBox, 'R8');

	const fundingGoal = BigInt(lendingInfo[0]);
	const interestRate = BigInt(lendingInfo[2]);
	const repaymentPeriod = BigInt(lendingInfo[3]);
	const interestAmount = (fundingGoal * interestRate) / 1000n;
	const repaymentAmount = fundingGoal + interestAmount;
	const repaymentDeadlineHeight = BigInt(height) + repaymentPeriod;

	const updatedServiceBox = {
		...serviceBox,
		assets: [...serviceBox.assets]
	};

	updatedServiceBox.assets[1] = {
		tokenId: serviceBox.assets[1].tokenId,
		amount: BigInt(serviceBox.assets[1].amount) + 1n
	};

	updatedServiceBox.assets[2] = {
		tokenId: serviceBox.assets[2].tokenId,
		amount: BigInt(serviceBox.assets[2].amount) - 1n
	};

	return lendToRepaymentTokensTx(
		height,
		serviceBox,
		lendBox,
		borrowerErgoTree,
		EXLE_REPAYMENT_BOX_ERGOTREE,
		repaymentAmount,
		interestAmount,
		repaymentDeadlineHeight,
		EXLE_SERVICE_BOX_ERGOTREE,
		updatedServiceBox,
		miningFee,
		changeAddress
	);
}
function lendToRepaymentTokensTx(
	height: number,
	serviceBox: NodeBox,
	lendBox: NodeBox,
	borrowerErgoTree: string,
	repaymentBoxErgoTree: string,
	repaymentAmount: bigint,
	interestAmount: bigint,
	repaymentDeadlineHeight: bigint,
	serviceBoxErgoTree: string,
	serviceBoxUpdated: NodeBox,
	miningFee: bigint,
	changeAddress: string
) {
	const lendAssets = lendBox.assets;
	const borowerAssets = lendAssets.slice(2);
	const borrowerValue = BigInt(lendBox.value) - 2n * miningFee;

	// === R9: сериализуем repaymentDetails ===
	const fundedHeight = BigInt(height);

	const repaymentR9 = SColl(SLong, [
		fundedHeight,
		repaymentAmount,
		interestAmount,
		repaymentDeadlineHeight,
		0n
	]).toHex();

	// === Repayment Box ===
	const repaymentBox = new OutputBuilder(miningFee, repaymentBoxErgoTree)
		.addTokens([{ tokenId: serviceBox.assets[2].tokenId, amount: 1n }, lendBox.assets[1]])
		.setAdditionalRegisters({
			R4: lendBox.additionalRegisters.R4,
			R5: lendBox.additionalRegisters.R5,
			R6: lendBox.additionalRegisters.R6,
			R7: lendBox.additionalRegisters.R7,
			R8: lendBox.additionalRegisters.R8,
			R9: repaymentR9
		});

	// === Borrower ===
	const borrowerFundBox = new OutputBuilder(borrowerValue, borrowerErgoTree).addTokens(
		borowerAssets
	);

	// === Обновлённый ServiceBox ===
	const updatedServiceBox = new OutputBuilder(serviceBoxUpdated.value, serviceBoxErgoTree)
		.addTokens(serviceBoxUpdated.assets)
		.setAdditionalRegisters(serviceBoxUpdated.additionalRegisters);

	// === Сборка транзакции ===
	const unsignedTx = new TransactionBuilder(height)
		.from([serviceBox, lendBox])
		.to([updatedServiceBox, borrowerFundBox, repaymentBox])
		.payFee(miningFee)
		.sendChangeTo(changeAddress)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

function prepareLendToRepaymentErgTx(
	height: number,
	serviceBox: NodeBox,
	lendBox: NodeBox,
	miningFee: bigint,
	changeAddress: string
) {
	const lendingInfo = decodeBigInt(lendBox, 'R4'); // [fundingGoal, deadline, interestRate, repayHeightLength]
	const borrowerErgoTree = decodeBorrowerPk(lendBox, 'R6');
	const lenderPk = decodeBorrowerPk(lendBox, 'R7');

	const fundingGoal = BigInt(lendingInfo[0]);
	const interestRate = BigInt(lendingInfo[2]);
	const repaymentPeriod = BigInt(lendingInfo[3]);
	const interestAmount = (fundingGoal * interestRate) / 1000n;
	const repaymentAmount = fundingGoal + interestAmount;
	const repaymentDeadlineHeight = BigInt(height) + repaymentPeriod;

	const updatedServiceBox = {
		...serviceBox,
		assets: [...serviceBox.assets]
	};

	updatedServiceBox.assets[1] = {
		tokenId: serviceBox.assets[1].tokenId,
		amount: BigInt(serviceBox.assets[1].amount) + 1n
	};

	updatedServiceBox.assets[2] = {
		tokenId: serviceBox.assets[2].tokenId,
		amount: BigInt(serviceBox.assets[2].amount) - 1n
	};

	return lendToRepaymentTokensTx(
		height,
		serviceBox,
		lendBox,
		borrowerErgoTree,
		EXLE_REPAYMENT_BOX_ERGOTREE,
		repaymentAmount,
		interestAmount,
		repaymentDeadlineHeight,
		EXLE_SERVICE_BOX_ERGOTREE,
		updatedServiceBox,
		miningFee,
		changeAddress
	);
}

function lendToRepaymentErgTx(
	height: number,
	serviceBox: NodeBox,
	lendBox: NodeBox,
	borrowerErgoTree: string,
	repaymentBoxErgoTree: string,
	repaymentAmount: bigint,
	interestAmount: bigint,
	repaymentDeadlineHeight: bigint,
	serviceBoxErgoTree: string,
	serviceBoxUpdated: NodeBox,
	miningFee: bigint,
	changeAddress: string
) {
	const lendAssets = lendBox.assets;
	const borowerAssets = lendAssets.slice(2);
	const borrowerValue = BigInt(lendBox.value) - 2n * miningFee;

	// === R9: сериализуем repaymentDetails ===
	const fundedHeight = BigInt(height);

	const repaymentR8 = SColl(SLong, [
		fundedHeight,
		repaymentAmount,
		interestAmount,
		repaymentDeadlineHeight,
		0n
	]).toHex();

	// === Repayment Box ===
	const repaymentBox = new OutputBuilder(miningFee, repaymentBoxErgoTree)
		.addTokens([{ tokenId: serviceBox.assets[2].tokenId, amount: 1n }, lendBox.assets[1]])
		.setAdditionalRegisters({
			R4: lendBox.additionalRegisters.R4,
			R5: lendBox.additionalRegisters.R5,
			R6: lendBox.additionalRegisters.R6,
			R7: lendBox.additionalRegisters.R7,
			R8: repaymentR8
		});

	// === Borrower ===
	const borrowerFundBox = new OutputBuilder(borrowerValue, borrowerErgoTree).addTokens(
		borowerAssets
	);

	// === Обновлённый ServiceBox ===
	const updatedServiceBox = new OutputBuilder(serviceBoxUpdated.value, serviceBoxErgoTree)
		.addTokens(serviceBoxUpdated.assets)
		.setAdditionalRegisters(serviceBoxUpdated.additionalRegisters);

	// === Сборка транзакции ===
	const unsignedTx = new TransactionBuilder(height)
		.from([serviceBox, lendBox])
		.to([updatedServiceBox, borrowerFundBox, repaymentBox])
		.payFee(miningFee)
		.sendChangeTo(changeAddress)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

export function preparefundLendTokensTx(
	fundingAmount: bigint,
	lenderBase58PK: string,
	utxos: Array<any>,
	lendBox: NodeBox,
	height: number,
	miningFee: bigint
) {
	return fundLendTokensTx(fundingAmount, lenderBase58PK, utxos, lendBox, height, miningFee);
}

export function preparefundLendTokensProxyTx(
	fundingAmount: bigint,
	proxyBox: NodeBox,
	lendBox: NodeBox,
	height: number,
	miningFee: bigint
) {
	const lenderErgoTree = decodeUint8Array(proxyBox, 'R5');
	const lenderBase58PK = ErgoAddress.fromErgoTree(lenderErgoTree).toString();

	return fundLendTokensTx(fundingAmount, lenderBase58PK, [proxyBox], lendBox, height, miningFee);
}

function fundLendTokensTx(
	fundingAmount: bigint,
	lenderBase58PK: string,
	utxos: Array<any>,
	lendBox: NodeBox,
	height: number,
	miningFee: bigint
) {
	const lenderAddress = ErgoAddress.fromBase58(lenderBase58PK);
	const lenderErgoTree = lenderAddress.ergoTree;

	const lendAssets = lendBox.assets;
	const fundingTokenId = decodeExleLoanTokenId(lendBox);

	// === Обновлённый lendBox ===
	let finalAmount = fundingAmount;
	if (lendAssets[2]) {
		const initialAmount = BigInt(lendAssets[2].amount);
		finalAmount = finalAmount + initialAmount;
	}

	// === Add Funding tokens + 2 mining Fee
	const updatedLendBox = new OutputBuilder(
		BigInt(lendBox.value) + 2n * miningFee,
		lendBox.ergoTree
	).addTokens([
		lendBox.assets[0],
		lendBox.assets[1],
		{ amount: finalAmount, tokenId: fundingTokenId }
	]);

	// === Add registers ===
	updatedLendBox.setAdditionalRegisters({
		R4: lendBox.additionalRegisters.R4,
		R5: lendBox.additionalRegisters.R5,
		R6: lendBox.additionalRegisters.R6,
		R7: lendBox.additionalRegisters.R7,
		R8: SColl(SByte, lenderErgoTree).toHex() // Add Lender ErgoTree
	});

	// === Сборка транзакции ===
	const unsignedTx = new TransactionBuilder(height)
		.from([lendBox], {
			ensureInclusion: true
		})
		.from([...utxos])
		.to([updatedLendBox])
		.payFee(miningFee)
		.sendChangeTo(lenderAddress)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

export function fundLendWithCrowdBoxTokensTx(
	crowdBox: NodeBox,
	lendBox: NodeBox,
	height: number,
	miningFee: bigint
) {
	const lenderErgoTree = crowdBox.ergoTree;

	const fundingTokenId = decodeExleLoanTokenId(lendBox);
	const { fundingGoal } = decodeExleFundingInfo(lendBox);

	// === Add Funding tokens + 2 mining Fee
	const updatedLendBox = new OutputBuilder(
		BigInt(lendBox.value) + 2n * miningFee,
		lendBox.ergoTree
	).addTokens([
		lendBox.assets[0],
		lendBox.assets[1],
		{ amount: fundingGoal, tokenId: fundingTokenId }
	]);

	// === Add registers ===
	updatedLendBox.setAdditionalRegisters({
		R4: lendBox.additionalRegisters.R4,
		R5: lendBox.additionalRegisters.R5,
		R6: lendBox.additionalRegisters.R6,
		R7: lendBox.additionalRegisters.R7,
		R8: SColl(SByte, lenderErgoTree).toHex() // Add Lender ErgoTree
	});

	const updatedCrowdBox = new OutputBuilder(miningFee, crowdBox.ergoTree)
		.addTokens([crowdBox.assets[0], crowdBox.assets[1]])
		.setAdditionalRegisters({
			R4: crowdBox.additionalRegisters.R4,
			R5: crowdBox.additionalRegisters.R5,
			R6: SLong(2n).toHex()
		});

	// === Сборка транзакции ===
	const unsignedTx = new TransactionBuilder(height)
		.from([lendBox, crowdBox], {
			ensureInclusion: true
		})
		.withDataFrom([crowdBox, lendBox])
		.to([updatedLendBox, updatedCrowdBox])
		.payFee(miningFee)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

export type CreateLendInputParams = {
	loanType: LoanType;
	project: string[]; //project[0] - loanTitle, project[1] - loanDescription
	loanTokenId: null | string;
	fundingGoal: bigint; // funding goal
	interestRate: bigint; // in / 1000n
	fundingDeadlineLength: bigint; // in height + blocks
	repaymentHeightLength: bigint; // in blocks
	borrowerAddress: string;
};

export type CreateLendChainContext = {
	userUtxo: Object[];
	serviceBox: NodeBox;
	height: number;
};

export function createLendTokensTx(
	userInput: CreateLendInputParams,
	chainData: CreateLendChainContext
) {
	const exleFundingInfo = {
		fundingGoal: userInput.fundingGoal,
		deadlineHeight: userInput.fundingDeadlineLength + BigInt(chainData.height),
		interestRate: userInput.interestRate,
		repaymentHeightLength: userInput.repaymentHeightLength,
		serviceFee: decodeExleServiceFee(chainData.serviceBox)
	};

	const lendParams: ExleLendParametersTokens = {
		exleFundingInfo: exleFundingInfo,
		projectDetails: userInput.project,
		borrowerErgoTree: ErgoAddress.fromBase58(userInput.borrowerAddress).ergoTree,
		tokenId: userInput.loanTokenId ?? ''
	};

	const unsignedTx = createLendTokens(
		userInput.borrowerAddress,
		chainData.userUtxo,
		chainData.serviceBox,
		chainData.height,
		EXLE_MINING_FEE,
		lendParams
	);
	return unsignedTx;
}

export function createLendCrowdfundBoxTx(signedTx: Object, userInput: CreateLendInputParams) {
	const params = {
		_MinFee: SLong(EXLE_MINING_FEE).toHex(),
		_MaxByteBoxFee: SLong(EXLE_MAX_BYTE_BOX_FEE).toHex(),
		_LoanId: SColl(
			SByte,
			'05692a2965c6bab42ef7e440ce25108e7f5cad42ec97ea7fe4fc6d55b7119141'
		).toHex(),
		_SLTCFTokenId: SColl(SByte, EXLE_SLE_CROWD).toHex(),
		_SLTRepaymentTokenId: SColl(SByte, EXLE_SLE_REPAYMENT_TOKEN_ID).toHex()
	};
	const result = createCrowdfundContract(params);
}

function createLendTokens(
	borrowerBase58PK: string,
	utxos: Array<any>,
	serviceBox: NodeBox,
	height: number,
	miningFee: bigint,
	lendParams: ExleLendParametersTokens
) {
	const serviceBoxId = serviceBox.boxId;
	const devFeeAmount = decodeExleServiceFee(serviceBox);
	const borrowerAddress = ErgoAddress.fromBase58(borrowerBase58PK);

	// create new lend
	const newLendOutWithoutRegisters = new OutputBuilder(
		EXLE_MAX_BYTE_BOX_FEE,
		EXLE_LEND_BOX_ERGOTREE
	)
		.addTokens({ tokenId: serviceBox.assets[1].tokenId, amount: 1n })
		.mintToken({
			tokenId: serviceBoxId,
			amount: 1n,
			decimals: 0
		});

	const newLendOut = setExleLendRegistersTokens(newLendOutWithoutRegisters, lendParams);

	const devFeeBox = new OutputBuilder(devFeeAmount, EXLE_DEV_ADDRESS);

	// === Обновлённый ServiceBox ===
	const updatedServiceBox = new OutputBuilder(serviceBox.value, serviceBox.ergoTree)
		.addTokens([
			serviceBox.assets[0],
			{ amount: BigInt(serviceBox.assets[1].amount) - 1n, tokenId: serviceBox.assets[1].tokenId },
			serviceBox.assets[2],
			serviceBox.assets[3]
		])
		.setAdditionalRegisters(serviceBox.additionalRegisters);

	// === Сборка транзакции ===
	const unsignedTx = new TransactionBuilder(height)
		.from([serviceBox], {
			ensureInclusion: true
		})
		.from([...utxos])
		.to([updatedServiceBox, newLendOut, devFeeBox])
		.payFee(miningFee)
		.sendChangeTo(borrowerAddress)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

function setExleLendRegistersTokens(
	box: OutputBuilder,
	lendParams: ExleLendParametersTokens
): OutputBuilder {
	const { fundingGoal, deadlineHeight, interestRate, repaymentHeightLength, serviceFee } =
		lendParams.exleFundingInfo;

	box.setAdditionalRegisters({
		R4: SColl(SLong, [
			fundingGoal,
			deadlineHeight,
			interestRate,
			repaymentHeightLength,
			serviceFee ?? 0n
		]).toHex(),
		R5: encodeProjectDetails(lendParams.projectDetails),
		R6: SColl(SByte, lendParams.borrowerErgoTree).toHex(),
		R7: SColl(SByte, lendParams.tokenId).toHex()
	});

	return box;
}

export function encodeProjectDetails(strings: string[]): string {
	const byteArrays = strings.map((str) => Array.from(Buffer.from(str, 'utf8')));
	return SColl(SColl(SByte), byteArrays).toHex();
}

export function prepareCrowdFundFromLendTx(signedTx: { outputs: NodeBox[] }, height: number, me: string) {
	const serviceBox = signedTx.outputs[0];
	const lendBox = signedTx.outputs[1];

	const userUtxo = signedTx.outputs.slice(4);
	const miningFee = EXLE_MINING_FEE;
	const loanId = lendBox.assets[1].tokenId;
	// Crowd Adress or Crowd Ergo Tree ??
	const crowdErgoTree = createCrowdBoxErgoTree(loanId);

	const unsignedTx = crowdFundFromLendTokensTx(
		serviceBox,
		lendBox,
		crowdErgoTree,
		userUtxo,
		height,
		miningFee,
		me
	);

	return unsignedTx;
}

export function prepareNewCrowdFundTx(
	serviceBox: NodeBox,
	lendBox: NodeBox,
	utxo: any,
	height: number,
	me: string
) {
	const miningFee = EXLE_MINING_FEE;
	const loanId = lendBox.assets[1].tokenId;
	const crowdErgoTree = createCrowdBoxErgoTree(loanId);

	const unsignedTx = crowdFundFromLendTokensTx(
		serviceBox,
		lendBox,
		crowdErgoTree,
		utxo,
		height,
		miningFee,
		me
	);

	return unsignedTx;
}

function createCrowdBoxErgoTree(loanId: string): string {
	return EXLE_TEMPLATE_CROWD_TREE.replace(EXLE_STRING_TO_REPLACE, loanId);
}

export function crowdFundFromLendTokensTx(
	serviceBox: NodeBox,
	lendBox: NodeBox,
	crowdErgoTree: string,
	utxo: any,
	height: number,
	miningFee: bigint,
	changeAddress: string
) {
	const updatedLendBox = new OutputBuilder(BigInt(lendBox.value), lendBox.ergoTree)
		.addTokens(lendBox.assets)
		.setAdditionalRegisters(lendBox.additionalRegisters);

	const updatedServiceBox = new OutputBuilder(BigInt(serviceBox.value), serviceBox.ergoTree)
		.addTokens([
			serviceBox.assets[0],
			serviceBox.assets[1],
			serviceBox.assets[2],
			{ tokenId: serviceBox.assets[3].tokenId, amount: BigInt(serviceBox.assets[3].amount) - 1n }
		])
		.setAdditionalRegisters(serviceBox.additionalRegisters);

	const loanId = lendBox.assets[1].tokenId;

	const devFeeAmount = decodeExleServiceFee(serviceBox);
	const devFeeBox = new OutputBuilder(devFeeAmount, EXLE_DEV_ADDRESS);

	const crowdFundBox = new OutputBuilder(4n * EXLE_MINING_FEE, crowdErgoTree)
		.addTokens({ tokenId: serviceBox.assets[3].tokenId, amount: 1n })
		.mintToken({
			tokenId: serviceBox.boxId,
			amount: SCALA_MAX_LONG,
			decimals: 0
		})
		.setAdditionalRegisters({
			R4: SColl(SByte, loanId).toHex(), //R4: LoanId
			R5: SColl(SByte, serviceBox.boxId).toHex(), //R5: CrowdFundTokenId
			R6: SLong(0n).toHex() //R6: 0
		});

	console.log(serviceBox);
	console.log(updatedServiceBox);
	const unsignedTx = new TransactionBuilder(height)
		.from([serviceBox, lendBox], {
			ensureInclusion: true
		})
		.from([...utxo])
		.to([updatedServiceBox, updatedLendBox, crowdFundBox, devFeeBox])
		.payFee(miningFee)
		.sendChangeTo(changeAddress)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

//findSuitableBox
function findSuitableBox(utxo: NodeBox[], loanTokenId: string, amount: bigint): { paymentBox: NodeBox | null; otherUtxo: NodeBox[] } {
	// check check
	// check if not enough amount in one single box
	// error(u have enough tokens - but you need to consolidate them in One box)

	//find suitable paymentBox from all Utxo?
	// enough loan?
	// TODO: Implement proper box selection logic
	const paymentBox = utxo.find(box =>
		box.assets?.some(a => a.tokenId === loanTokenId && BigInt(a.amount) >= amount)
	) ?? null;
	const otherUtxo = utxo.filter(box => box !== paymentBox);
	return { paymentBox, otherUtxo };
}

export function fundCrowdFundBoxTokensTx(
	amount: bigint,
	crowdFundBox: NodeBox,
	lendBox: NodeBox,
	serviceBox: NodeBox,
	paymentBox: NodeBox,
	otherUtxo: any,
	height: number,
	miningFee: bigint,
	changeAddress: string
) {
	const outCrowdFundBox = new OutputBuilder(crowdFundBox.value, crowdFundBox.ergoTree);

	const loanTokenId = decodeExleLoanTokenId(lendBox);
	const { fundingGoal } = decodeExleFundingInfo(lendBox);
	const fundedAmount = BigInt(crowdFundBox.assets[2]?.amount ?? 0n);
	console.log('fundedAmount,', fundedAmount);
	let usedAmount = amount;

	//CALCULATE LOANTOKEN AMOUNT IN USER PAYMENT BOX
	const paymentBoxLoanTokenAmount =
		paymentBox.assets.find((a) => a.tokenId == loanTokenId)?.amount ?? 0n;
	// ---------------------------------------------
	// error check?
	if (paymentBoxLoanTokenAmount < amount) {
		// + check otherUtxos?
		console.error('not enough'); //
	}
	//
	let burnTokens = undefined;
	console.log(BigInt(crowdFundBox.assets[1].amount), amount);
	if (BigInt(fundingGoal) <= amount + fundedAmount) {
		usedAmount = fundingGoal - fundedAmount;

		//vsego assets[1].amount - usedAmount
		(burnTokens = {
			tokenId: crowdFundBox.assets[1].tokenId,
			amount: BigInt(crowdFundBox.assets[1].amount) - 1n - usedAmount
		}),
			outCrowdFundBox
				.addTokens([
					crowdFundBox.assets[0],
					{ tokenId: crowdFundBox.assets[1].tokenId, amount: 1n },
					{ tokenId: loanTokenId, amount: fundedAmount + usedAmount }
				])
				.setAdditionalRegisters({
					R4: crowdFundBox.additionalRegisters.R4,
					R5: crowdFundBox.additionalRegisters.R5,
					R6: SLong(1n).toHex()
				});
	} else {
		outCrowdFundBox
			.addTokens([
				crowdFundBox.assets[0],
				{
					tokenId: crowdFundBox.assets[1].tokenId,
					amount: BigInt(crowdFundBox.assets[1].amount) - amount
				},
				{ tokenId: loanTokenId, amount: fundedAmount + amount }
			])
			.setAdditionalRegisters(crowdFundBox.additionalRegisters);
	}

	// Calculate total available ERG from payment box and other utxos
	const paymentBoxErg = BigInt(paymentBox.value);
	const otherUtxoErg = otherUtxo.reduce((sum: bigint, box: NodeBox) => sum + BigInt(box.value), 0n);
	const totalAvailableErg = paymentBoxErg + otherUtxoErg;

	// Minimum box value for a box with tokens (needs ~0.002-0.004 ERG)
	const MIN_BOX_VALUE = 2_000_000n; // 0.002 ERG for boxes with tokens

	// Receipt box gets a fair share of the available ERG minus fees
	const receiptBoxValue = totalAvailableErg > miningFee + MIN_BOX_VALUE
		? MIN_BOX_VALUE + miningFee // Give it enough to cover minimum + some buffer
		: MIN_BOX_VALUE;
	const receiptBox = new OutputBuilder(receiptBoxValue, changeAddress);

	// unUsed loanTokenAmount
	if (BigInt(paymentBoxLoanTokenAmount) > usedAmount) {
		receiptBox.addTokens([
			{
				tokenId: crowdFundBox.assets[1].tokenId,
				amount: usedAmount
			},
			{ tokenId: loanTokenId, amount: BigInt(paymentBoxLoanTokenAmount) - usedAmount }
		]);
	} else {
		receiptBox.addTokens({
			tokenId: crowdFundBox.assets[1].tokenId,
			amount: usedAmount
		});
	}

	//dataInput 0 - CrowdStateBox
	const crowdStateBox = crowdFundBox;
	//dataInput 1 - ServiceBox
	//dataInput 2 - LoanBox
	console.log('7bd13a421902c1202c2f78617e2065429cd2d2f65cce2749122fbe145312e30d?');

	console.log('crowdFundBox', { crowdFundBox });
	console.log('paymentBox value:', paymentBox.value);
	console.log('otherUtxo count:', otherUtxo.length);
	console.log('otherUtxo total ERG:', otherUtxo.reduce((sum: bigint, box: NodeBox) => sum + BigInt(box.value), 0n));

	// Combine all inputs - crowdFundBox and paymentBox are required, otherUtxo provides additional ERG
	const allInputs = [crowdFundBox, paymentBox, ...otherUtxo];

	let unsignedTx;
	if (burnTokens) {
		unsignedTx = new TransactionBuilder(height)
			.from(allInputs, { ensureInclusion: true })
			.withDataFrom([crowdStateBox, serviceBox, lendBox])
			.to([outCrowdFundBox, receiptBox])
			.burnTokens(burnTokens)
			.payFee(miningFee)
			.sendChangeTo(changeAddress)
			.build()
			.toEIP12Object();
	} else {
		unsignedTx = new TransactionBuilder(height)
			.from(allInputs, { ensureInclusion: true })
			.withDataFrom([crowdStateBox, serviceBox, lendBox])
			.to([outCrowdFundBox, receiptBox])
			.payFee(miningFee)
			.sendChangeTo(changeAddress)
			.build()
			.toEIP12Object();
	}

	return unsignedTx;
}

// missing functions
export function fundRepaymentTokensSruProxyTx(
	fundingAmount: bigint,
	funderBase58PK: string,
	utxos: Array<any>,
	repaymentBox: NodeBox,
	height: number,
	miningFee: bigint
) {
	const fundingTokenId = decodeExleLoanTokenId(repaymentBox);

	const proxyRepaymentBox = new OutputBuilder(4n * miningFee, EXLE_PROXY_REPAYMENT)
		.setAdditionalRegisters({
			R4: SColl(SByte, repaymentBox.boxId).toHex(),
			R5: SColl(SByte, ErgoAddress.fromBase58(funderBase58PK).ergoTree).toHex()
		})
		.addTokens({ amount: fundingAmount, tokenId: fundingTokenId });

	// === Сборка транзакции ===
	const unsignedTx = new TransactionBuilder(height)
		.from([...utxos])
		.to([proxyRepaymentBox])
		.payFee(miningFee)
		.sendChangeTo(funderBase58PK)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

export function fundRepaymentTokensTx(
	fundingAmount: bigint,
	funderBase58PK: string,
	utxos: Array<any>,
	repaymentBox: NodeBox,
	serviceBox: NodeBox,
	height: number,
	miningFee: bigint
) {
	const fundingTokenId = decodeExleLoanTokenId(repaymentBox);

	const updatedRepaymentBox = new OutputBuilder(
		BigInt(repaymentBox.value) + 3n * miningFee, // value???
		repaymentBox.ergoTree
	);

	if (repaymentBox.assets[2]) {
		updatedRepaymentBox.addTokens([
			repaymentBox.assets[0],
			repaymentBox.assets[1],
			{
				amount: BigInt(repaymentBox.assets[2].amount) + fundingAmount,
				tokenId: fundingTokenId
			}
		]);
	} else {
		updatedRepaymentBox.addTokens([
			repaymentBox.assets[0],
			repaymentBox.assets[1],
			{ amount: fundingAmount, tokenId: fundingTokenId }
		]);
	}

	// === Add registers ===
	updatedRepaymentBox.setAdditionalRegisters(repaymentBox.additionalRegisters);

	// === Сборка транзакции ===
	const unsignedTx = new TransactionBuilder(height)
		.from([repaymentBox], {
			ensureInclusion: true
		})
		.from([...utxos])
		.withDataFrom([serviceBox])
		.to([updatedRepaymentBox])
		.payFee(miningFee)
		.sendChangeTo(funderBase58PK)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

//sendFromRepaymentBoxToLender
export function sendFromRepaymentBoxToLenderTokensTx(
	repaymentBox: NodeBox,
	height: number,
	miningFee: bigint
) {
	const lenderErgoTree = decodeExleLenderTokens(repaymentBox);

	const updatedRepaymentBox = new OutputBuilder(
		BigInt(repaymentBox.value) - 2n * miningFee, //
		repaymentBox.ergoTree
	).addTokens([repaymentBox.assets[0], repaymentBox.assets[1]]);

	const { fundedHeight, repaymentAmount, interestAmount, repaymentDeadlineHeight, repaidAmount } =
		decodeExleRepaymentDetailsTokens(repaymentBox);

	const amountToRepay = repaymentBox.assets[2].amount;
	const newRepaidAmount = repaidAmount + amountToRepay; //<==

	const repaymentR9 = SColl(SLong, [
		fundedHeight,
		repaymentAmount,
		interestAmount,
		repaymentDeadlineHeight,
		newRepaidAmount
	]).toHex();

	updatedRepaymentBox.setAdditionalRegisters({
		R4: repaymentBox.additionalRegisters.R4,
		R5: repaymentBox.additionalRegisters.R5,
		R6: repaymentBox.additionalRegisters.R6,
		R7: repaymentBox.additionalRegisters.R7,
		R8: repaymentBox.additionalRegisters.R8,
		R9: repaymentR9
	});

	const lenderBox = new OutputBuilder(miningFee, lenderErgoTree).addTokens(repaymentBox.assets[2]);

	// === Сборка транзакции ===
	const unsignedTx = new TransactionBuilder(height)
		.from([repaymentBox], {
			ensureInclusion: true
		})
		.to([updatedRepaymentBox, lenderBox])
		.payFee(miningFee)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

//sendFromCrowdBoxToLenders	// lender box + Crowd => lender box + Crowd ??
export function sendFromCrowdBoxToLenderTokensTx(
	crowdFundBox: NodeBox,
	utxos: any,
	height: number,
	miningFee: bigint
) {
	const updatedCrowdFundBox = new OutputBuilder(
		BigInt(crowdFundBox.value) - 2n * miningFee, //
		crowdFundBox.ergoTree
	).addTokens([crowdFundBox.assets[0], crowdFundBox.assets[1]]);

	updatedCrowdFundBox.setAdditionalRegisters({
		R4: crowdFundBox.additionalRegisters.R4,
		R5: crowdFundBox.additionalRegisters.R5,
		R6: crowdFundBox.additionalRegisters.R6
	});

	// TODO: Implement lender box creation - needs lenderErgoTree from somewhere
	const lenderErgoTree = crowdFundBox.additionalRegisters.R5 ?? crowdFundBox.ergoTree;
	const lenderBox = new OutputBuilder(miningFee, lenderErgoTree);

	// === Сборка транзакции ===
	const unsignedTx = new TransactionBuilder(height)
		.from([crowdFundBox], {
			ensureInclusion: true
		})
		.to([updatedCrowdFundBox, lenderBox])
		.payFee(miningFee)
		.build()
		.toEIP12Object();

	return unsignedTx;
}

export async function checkTransaction(tx: object): Promise<any> {
	const response = await fetch('https://crystalpool.cc:4004/api/transactions/check', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ tx })
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(`Check failed: ${error.error || response.statusText}`);
	}

	return response.json();
}

export async function submitTransaction(tx: object): Promise<any> {
	const response = await fetch('https://crystalpool.cc:4004/api/transactions/submit', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ tx })
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(`Submit failed: ${error.error || response.statusText}`);
	}

	return response.json();
}
