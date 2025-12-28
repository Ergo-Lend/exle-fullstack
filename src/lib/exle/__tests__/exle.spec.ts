import { describe, expect, it } from 'vitest';
import {
	decodeCrowdfundLoanId,
	decodeExleLenderTokens,
	decodeExleRepaymentDetailsTokens,
	donationsFromExleMetadata,
	EXLE_LEND_BOX_ERGOTREE,
	EXLE_PROXY_LEND_CREATE,
	EXLE_PROXY_REPAYMENT,
	EXLE_REPAYMENT_BOX_ERGOTREE,
	EXLE_SERVICE_BOX_ERGOTREE,
	getExleCrowdFundTokensAmount,
	getExleLoanId,
	getExleRepaymentTokensStatus,
	getExleTokensAmount,
	isCrowdFundBox,
	isExleTx,
	isUserTx,
	jsonParseBigInt,
	parseLoanBox,
	parseRepaymentBox,
	txToHistoryItem,
	txToHistoryItemFromLabel,
	type AllExleMetadata,
	type Donation,
	type LoanType,
	type NodeBox,
	type NodeInfo
} from './exle';
import {
	exleCrowdfundTxes,
	exleMockBoxesByTokenId,
	exleMockTxes,
	exleUnspendOnRepaymentBoxes,
	exleUnspendWithCrowdToken,
	exleUnspendWithRepaymentToken
} from './exleTx.mockdata';
import {
	decodeExleFundingInfo,
	decodeExleLoanTokenId,
	decodeExleProjectDetails,
	decodeExleRepaymentDetailsErg,
	decodeExleServiceFee,
	EXLE_MINING_FEE,
	exleHighLevelRecogniser,
	exleLowLevelRecogniser,
	isExleLendTokenBox,
	isExleRepaymentTokenBox,
	isExleServiceBox,
	isMinerBox,
	isProxyBox,
	preparefundLendTokensProxyTx,
	preparefundLendTokensTx,
	prepareLendToRepaymentTokensTx
} from './exle';
import { loanHistoryTxs } from './loanHistory.mockdata';
import { allMetadata } from './allMetadata.mockdata';
import { ErgoAddress } from '@fleet-sdk/core';
// ERG  => DEXY ???
// DEXY => ERG

describe('Exle Function ', () => {
	const contractInfo = `
    |  val lendingBoxFundAccounting = SELF.R4[Coll[Long]]
    |  val lendingBoxFundDetails = SELF.R5[Coll[Coll[Byte]]]
    |  val fundingGoal = lendingBoxFundAccounting.get(0)
    |  val deadlineHeight = lendingBoxFundAccounting.get(1)
    |  val interestRate = lendingBoxFundAccounting.get(2)
    |  val repaymentHeightLength = lendingBoxFundAccounting.get(3)
    |  val serviceFee = lendingBoxFundAccounting.get(4)

     |    val repaymentBoxFundAccounting = repaymentBox.R4[Coll[Long]]
     |    val repaymentBoxFundDetails = repaymentBox.R5[Coll[Coll[Byte]]]
            |    val repaymentDetails = repaymentBox.R7[Coll[Long]]

     `;

	// SCRIPTS ERGS
	// LEND
	// ИСПОЛЬЗУЕТСЯ НА РАЗЛИЧНЫХ ЭТАПАХ - В ОСНОВНОМ В НЕГО ЗАПИСЫВАЕТСЯ КТО ЗАДОНАТИЛ В РЕГИСТРЕ И ПРОВЕРЯЕТСЯ ЗАПОЛНЕННОСТЬ
	// SERVICE
	// •	NFT-бокс идентификации (tokens(0))
	// •	Токен ленда (tokens(1))
	// •	Токен погашения (tokens(2))
	// Создание бокса
	//
	// REPAYMENT

	// SCRIPTS TOKENS
	// LEND
	// SERVICE
	// REPAYMENT

	// MOCK TXES
	// [1 - 3] MIX
	// [4 - 7] Lend => Repayment | TOKENS

	// [8]  - add tokens to Repayment | TOKENS
	// [9]  - Repayment to Lenders | TOKENS

	// [10] - add tokens to Repayment | TOKENS
	// [11] - Repayment to Lenders | TOKENS

	// [12] - add tokens to Repayment | TOKENS
	// [13] - Repayment to Lenders | TOKENS

	// [14] - add tokens to Repayment | TOKENS
	// [15] - Repayment to Lenders | TOKENS (NO TOKENS IN FEE)

	// [16] - Zero TX | TOKENS // Create Loan
	// [17] - Zero TX | TOKENS // Load Loan
	// [18] - Zero TX | TOKENS // Loan => Repayment
	// [19] - Zero TX | TOKENS // Load Repayment
	// [20] - Zero TX | TOKENS // Repayment -> Empty  (After)

	it.skip('Check Txes', () => {
		const testTxes = exleMockTxes; //.splice(16);

		testTxes.forEach((testTx, ii) => {
			const inputs = testTx.inputs;
			const outputs = testTx.outputs;
			const dataInputs = testTx.dataInputs;
			console.log('----------', ii, '----------');
			console.log('in:', inputs.length, ' out:', outputs.length, ' data:', dataInputs.length);

			testTx.inputs.forEach((i) => {
				if (isExleServiceBox(i)) {
					console.log('service input');
				} else if (isExleLendTokenBox(i)) {
					console.log('lend input');
				} else if (isExleRepaymentTokenBox(i)) {
					if (i.assets.length == 3) {
						console.log('full repayment input');
					} else {
						console.log('empty repayment input');
					}
				} else if (isProxyBox(i)) {
					console.log('proxy input');
				} else {
					console.log('other input');
				}
			});

			testTx.outputs.forEach((o) => {
				if (isExleServiceBox(o)) {
					console.log('service output');
				} else if (isExleRepaymentTokenBox(o)) {
					if (o.assets.length == 3) {
						console.log('full repayment output');
					} else {
						console.log('empty repayment output');
					}
				} else if (isMinerBox(o)) {
					console.log('miner output');
				} else if (isProxyBox(o)) {
					console.log('proxy output');
				} else {
					console.log('other output');
				}
			});
			console.log('');
		});
	});
	it.skip('Parse Lend -> Repayment Tx [index 4]', () => {
		const txIndex = 4;
		printTxDetails(exleMockTxes[txIndex], txIndex);
	});
	it.skip('Parse Lend -> Repayment Tx [index 4]', async () => {
		const txIndex = 4;
		const rawTx = exleMockTxes[txIndex];
		const enrichedTx = await enrichTxWithDataInputs(rawTx);
		await printTxDetails(enrichedTx, txIndex);
	});
	it('CHECK CURRENT TX 9', () => {
		const tx = exleMockTxes[8]; //32 partial // 8 full
		const tx2 = exleMockTxes[32]; //32 partial // 8 full

		console.log({ tx });
		console.log({ tx2 });
		// console.log(decodeExleRepaymentDetailsTokens(tx.inputs[0]));
		// console.log(decodeExleRepaymentDetailsTokens(tx.outputs[0]));

		console.log(tx.inputs[0].value == tx2.inputs[0].value);
		console.log(tx.outputs[1].value == tx2.outputs[1].value);
		console.log(tx.inputs[0].value == tx2.inputs[0].value);
		console.log(tx.outputs[1].value == tx2.outputs[1].value);

		console.log(tx.inputs[1].assets);
		console.log(tx2.inputs[1].assets);
		//console.log(tx.outputs[0].assets);
		//console.log(tx2.outputs[0].assets);
		console.log(decodeExleRepaymentDetailsTokens(tx2.outputs[0]));

		//Box [1] input overfunded ........

		console.log(tx.outputs[0].ergoTree == tx2.outputs[0].ergoTree);
		console.log(tx2.outputs[0].ergoTree);

		console.log(
			JSON.stringify(tx.inputs[0].additionalRegisters) ==
				JSON.stringify(tx.outputs[0].additionalRegisters)
		);

		// a624c7 - LEND
		// 302e93 - REPAYMENT
		// 52cdac - CROWD

		//console.log('Unsigned Lend -> Repayment Tx:');
		//console.dir(unsignedTx, { depth: null });
	});
	it('Test lendToRepayment from tx[4]', () => {
		const tx = exleMockTxes[4];
		const serviceBox = tx.inputs.find(isExleServiceBox);
		const lendBox = tx.inputs.find(isExleLendTokenBox);

		console.log({ tx });
		console.log(tx.outputs);
		// a624c7 - LEND
		// 302e93 - REPAYMENT
		// 52cdac - CROWD

		if (!serviceBox || !lendBox) {
			throw new Error('Missing service or lend box in tx[4]');
		}

		//console.log(lendBox.boxId);
		const height = 123456; // допустимая высота
		const miningFee = 1_000_000n; //1_000_000n
		const changeAddress =
			'61FP1XoupNs44SyzARauWp31V8ZnxJo3FEB8BpUB8DriGaUdvFM2LkwEGbiNACMmozBGfFuAYvNegsxA9rP7yRXizAkXZqqagkDidGhC34KQDfc7QZLjgesZvsaKjXj3KjL3dgKEjqDbaVVfqQkLwv2hfthdjy3L6LuombC5m5akqnmnMWNi7ZgCWL4Bj47XRDPMozrC5Gc5ovy8ww8jXZ1LTKM9rEG9KagnaHNXw2UhnXtGpNHmyXgXH6QTXXt9jUs4nA4ZJFh9pDBS27JDmomWgpjUaNMKj5tfnbkA3WWrpZQN4gif4NZcwCygq9CxgVrowu22fC5NmChHoh4SEeWLzzv68c6L8sCbqetez4VHZZVR1XAW6TVkvVPhhiWpnzztUgzCbwax8aEtLYe7fmYdsbmC8ZeKmpZDqiKeiC4RWCnuHFipYK7FJhbXW75hakxATREvUNSDrMChoXTS4LdDukUbZnnBdEMcBAK5iihxta1EQXZNx9gn5Yq8qB9Z5p1PDdNBgAhQsUJt5NThL2YuCzQ6B8pYc9BJzg5EvzA2aSatXXnsbWX4RFzNdEgpE1UaeM61CuxbytaSXubxUgNGxCin8hTvhhryse7w49PNM9DgpoRzSSEdJRzLLiypb2S8shFsc87R4xuggQzqKjqhjHdA7NGoaqmAZnCf9zU76c9myNuJvqFiNiepDyXDeKt3RQVMmvAwUAdgR24XcXdugawzEwwF2df3apMhKZP35JTUd884KTTDrDygWDvMUVER8kfAxzJt3vPjFMYoiMDtbCmC7m77TUSw2uzdeqgLf6r1er9QY8H2YMirZ5k4op3gA2bnmGJ2ntZd4Scv25eomJLBuv5tFLCZPEEoq2XSfB4MP3GdiSrwJj4YxxaARroaLkQ6QaKTuMAsAWLz7F2atbbRBZTgVwaJ8DvsQ3pXabUSzcDKAstvVjhPJv1AAfiWUKFU2cX95vy16a2Eoh9wk54fTVrFzm37uNygTa1dgumFabWDJWUHxdZGPUXPP7TGr43xWAo3KjwZn9NcZhgQqa4JVRATw1wG6jwYKECSJG6Pck2d7eDHmuYMyKPqPWk2ZdC1mgNdtqqGPLUX6zY4Z5m4XeLCWKgbTYMmbmHeERfvQF3VroYBdVGiv1NQk6kMTyP24EJn6wc7JTnA2tMKkefCbUTVPbqMD4Yk66Z7JB1gu7AtpmtXpTitDkq9VLnEetMq5AwM1RyNjfvkZFG4DtqBsQNQYq3K6gFYR5HCcJhRmuTK8ShWiGVogF3TMqzp2G3cEswdijnskhAVjqSXLxr6TD9ocU7k45K2hqtsAbRncFfBHAjJjfMn9ZmQ3eqXC7YFk2BJfkfdZ7Pa9yRFHGPP';

		const unsignedTx = prepareLendToRepaymentTokensTx(
			height,
			serviceBox,
			lendBox,
			miningFee,
			changeAddress
		);

		//console.log('Unsigned Lend -> Repayment Tx:');
		//console.dir(unsignedTx, { depth: null });
		expect(unsignedTx).toBeTruthy();
	});
	it('Fund Lend Box from Proxy| from tx[17]', () => {
		const tx = exleMockTxes[17];
		const lendBox = tx.inputs.find(isExleLendTokenBox);
		const fundingBox = tx.inputs.find((i) => !isExleLendTokenBox(i));
		// console.log(lendBox);

		if (!lendBox || !fundingBox) {
			throw new Error('Missing service or funding box ');
		}
		//console.log(lendBox.boxId);
		const amount = 135000n;
		const tokenId = '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04';

		const height = 1187956;
		const miningFee = EXLE_MINING_FEE;

		const unsignedTx = preparefundLendTokensProxyTx(amount, fundingBox, lendBox, height, miningFee);

		// const unsignedTx = preparefundLendTokensTx(
		// 	amount,
		// 	lenderBase58PK,
		// 	[fundingBox],
		// 	lendBox,
		// 	height,
		// 	miningFee,
		// );

		//console.log('Unsigned Lend -> Repayment Tx:');
		//console.dir(unsignedTx, { depth: null });

		expect(unsignedTx).toBeTruthy();

		//expect(unsignedTx.outputs).toBe(tx.outputs);
	});

	it('High/Low Level Recogniser', () => {
		// [16] - Zero TX | TOKENS // Create Loan
		// [17] - Zero TX | TOKENS // Load Loan
		// [18] - Zero TX | TOKENS // Loan => Repayment
		// [19] - Zero TX | TOKENS // Load Repayment
		// [20] - Zero TX | TOKENS // Repayment -> Empty  (After)
		// 16 -> 21
		// 21 -> 34
		//const txes = exleMockTxes.slice(0, 34); //16 - 21
		const txes = loanHistoryTxs;
		//const txes = loanHistoryTxs.slice(0, 20); //16 - 21
		//const txes = exleMockTxes.slice(17, 18); //16 - 21

		txes.forEach((tx, i) => {
			const label = exleHighLevelRecogniser(tx);
			const exleTx = isExleTx(tx);

			const { fundingLevel, repaymentLevel, lowLevelLabel, lockedLevel } = exleLowLevelRecogniser(
				tx,
				label
			);

			//console.log('Label:', label, '|', fundingLevel, '|', repaymentLevel);
			//if (lowLevelLabel == 'Create Lend | Tokens') {

			if (exleTx) {
				//console.log(tx.id);
				console.log(txToHistoryItem(tx));
			}
			// console.log(
			// 	exleTx,
			// 	tx.inclusionHeight,
			// 	'HIGH:',
			// 	label,
			// 	'LOW:',
			// 	lowLevelLabel,
			// 	'|',
			// 	fundingLevel,
			// 	'|',
			// 	repaymentLevel,
			// 	'(',
			// 	lockedLevel,
			// 	')'
			// );

			//console.log(txToHistoryItem(tx, label));
			//const lendBox = tx.outputs.find(isExleLendTokenBox);
			//const funding = (lendBox);decodeExleFundingInfo
			//	console.log(funding);
			//console.log('Loan initial box:');
			//console.log(tx.id);
			//console.log(tx.inputs[1]); // SLT Fee Box

			//console.log(tx.outputs[0]); // SLT Fee Box
			//console.log('Take Service input[0] => Drop it new NFT + give 1 Lend Token');

			//val serviceFeeBox: Box      = OUTPUTS(2)
			//val sltLendBox: Box         = OUTPUTS(1)
			//console.log(tx.outputs[0].additionalRegisters);
			//}

			//console.log('Label:', label, '|', lowLevelLabel, '|', fundingLevel, '|', repaymentLevel);
			//console.log('', lowLevelLabel);
		});
	});

	it('MockBoxes check TokenId vs ErgoTree Repayment', () => {
		const boxesByToken = exleUnspendWithRepaymentToken;
		const boxesByErgoTree = exleUnspendOnRepaymentBoxes;

		const filteredByToken = boxesByToken.filter(isExleRepaymentTokenBox);
		const filteredByErgoTree = exleUnspendOnRepaymentBoxes.filter(isExleRepaymentTokenBox);

		expect(filteredByToken.length).toBe(filteredByErgoTree.length);
	});
	it('Boxes by id CrowdFund', () => {
		const boxesByToken = exleUnspendWithCrowdToken;

		const filteredByToken = boxesByToken.filter(isCrowdFundBox);
		const exceptThis = boxesByToken.filter((b) => !isCrowdFundBox(b));
		console.log(exceptThis);

		expect(filteredByToken.length).toBe(boxesByToken.length);
	});
	it('Recognise all Loan History', () => {
		//const txes = exleCrowdfundTxes;
		const txes = allMetadata.loanHistoryTxs;

		txes.forEach((tx, i) => {
			const label = exleHighLevelRecogniser(tx);
			if (!isExleTx(tx)) {
				return;
			}
			const { fundingLevel, repaymentLevel, lowLevelLabel, lockedLevel } = exleLowLevelRecogniser(
				tx,
				label
			);
			const action = txToHistoryItemFromLabel(tx, label);

			if (!action) {
				console.log(tx);
			}
		});
	});
	it.only('Recognise real TX History', () => {
		//const txes = exleCrowdfundTxes;
		const txes = [...allMetadata.loanHistoryTxs, ...allMetadata.crowdfundHistoryTxs];

		txes.forEach((tx, i) => {
			if (!isExleTx(tx)) {
				return;
			}
			const action = txToHistoryItem(tx);

			// PROXY: Repayment to Repayment | Tokens
			// PROXY: Create Lend | Tokens
			// Create CrowdFund | Tokens

			if (typeof action === 'string') {
				console.log(action);
			}
		});
	});

	//loanHistoryTxs

	it('Donation From Txes', () => {
		const me = '9f83nJY4x9QkHmeek6PJMcTrf2xcaHAT3j5HD5sANXibXjMUixn';
		//const me = '9gJa6Mict6TVu9yipUX5aRUW87Yv8J62bbPEtkTje28sh5i3Lz8'; // <= ADD as Param to Function
		const donations = donationsFromExleMetadata(allMetadata, me);
		//console.log(donations);
		expect(donations).toBeTruthy();
		expect(donations.length).toBe(5);
	});
	it('High/Low Level Recogniser', () => {
		//const txes = exleCrowdfundTxes;
		const txes = exleMockTxes.slice(20, 21); //16 - 21

		txes.forEach((tx) => {
			const label = exleHighLevelRecogniser(tx);
			const { fundingLevel, repaymentLevel, lowLevelLabel, lockedLevel } = exleLowLevelRecogniser(
				tx,
				label
			);
			//console.log('Label:', label, '|', fundingLevel, '|', repaymentLevel);
			console.log('Label:', label, '|', lowLevelLabel, '|', fundingLevel, '|', repaymentLevel);
			//console.log(decodeExleLenderTokens(tx.outputs[0]) == tx.outputs[1].ergoTree);

			console.log(decodeExleRepaymentDetailsTokens(tx.inputs[0]));
			console.log(decodeExleRepaymentDetailsTokens(tx.outputs[0]));

			//console.log('', lowLevelLabel);
		});
	});
});

async function fetchBoxByIdLocal(boxId: string): Promise<NodeBox> {
	const URL = 'http://213.239.193.208:9053';
	const response = await fetch(URL + `/blockchain/box/byId/${boxId}`);
	const text = await response.text();
	return jsonParseBigInt(text);
}
async function enrichTxWithDataInputs(tx): Promise<typeof tx> {
	if (!tx.dataInputs?.length) return tx;

	const enrichedDataInputs = await Promise.all(
		tx.dataInputs.map(async (input) => {
			try {
				const fullBox = await fetchBoxByIdLocal(input.boxId);
				return fullBox;
			} catch (err) {
				console.warn(`⚠️ Failed to fetch box ${input.boxId}:`, err);
				return { boxId: input.boxId, error: true }; // fallback
			}
		})
	);

	return {
		...tx,
		dataInputs: enrichedDataInputs
	};
}

function printTxDetails(tx, label: string = '') {
	console.log(`\n--- TX ${label} ---`);
	console.log(
		`Inputs: ${tx.inputs.length}, Outputs: ${tx.outputs.length}, DataInputs: ${tx.dataInputs.length}`
	);

	for (let i = 0; i < tx.inputs.length; i++) {
		printBoxDetails(tx.inputs[i], `Input[${i}]`);
	}

	if (tx.dataInputs.length > 0) {
		console.log('');
		console.log('Data Inputs:');
		for (let i = 0; i < tx.dataInputs.length; i++) {
			const box = tx.dataInputs[i];
			if ('ergoTree' in box) {
				printBoxDetails(box, `DataInput[${i}]`);
			} else {
				console.log(`DataInput[${i}]: ⚠️ Not fetched: ${box.boxId}`);
			}
		}
	}

	console.log('');
	for (let i = 0; i < tx.outputs.length; i++) {
		printBoxDetails(tx.outputs[i], `Output[${i}]`);
	}
}

function printBoxDetails(box: NodeBox, label: string) {
	console.log(`${label}:`);
	if (isExleServiceBox(box)) {
		console.log(' - ✅ Service Box');
	} else if (isExleLendTokenBox(box)) {
		console.log(' - ✅ Lend Box');

		const funding = decodeExleFundingInfo(box);
		const project = decodeExleProjectDetails(box);

		console.log('   ↪ funding:', funding);
		console.log('   ↪ project description:');
		project.forEach((line, idx) => {
			console.log(`      ${idx + 1}. ${line}`);
		});
	} else if (isExleRepaymentTokenBox(box)) {
		console.log(' - ✅ Repayment Box');

		const repay = decodeExleRepaymentDetailsErg(box);
		const project = decodeExleProjectDetails(box);

		console.log('   ↪ repayment details:', repay);
		console.log('   ↪ project description:');
		project.forEach((line, idx) => {
			console.log(`      ${idx + 1}. ${line}`);
		});
	} else if (isMinerBox(box)) {
		console.log(' - ⚒️ Miner Box');
	} else if (isProxyBox(box)) {
		console.log(' - 🧭 Proxy Box');
	} else {
		console.log(' - 🤷 Unknown Box');
	}
}
