import { describe, expect, it } from 'vitest';
import {
	createLendTokensTx,
	fetchServiceBox,
	jsonParseBigInt,
	type CreateLendChainContext,
	type CreateLendInputParams,
	type NodeBox
} from './exle';
// ERG  => DEXY ???
// DEXY => ERG

const sampleSolofundLend: CreateLendInputParams = {
	loanType: 'Solofund',
	project: ['Foo', 'Bar'],
	loanTokenId: 'f60bff91f7ae3f3a5f0c2d35b46ef8991f213a61d7f7e453d344fa52a42d9f9a', // Test SigUSD
	fundingGoal: 100n * 100n,
	interestRate: 20n, // 2%
	fundingDeadlineLength: 100_000n,
	repaymentHeightLength: 720n * 30n,
	borrowerAddress: '9euvZDx78vhK5k1wBXsNvVFGc5cnoSasnXCzANpaawQveDCHLbU'
};

describe('Exle Function ', () => {
	let utxos = [
		{
			globalIndex: 47516554,
			inclusionHeight: 1509290,
			address: '9euvZDx78vhK5k1wBXsNvVFGc5cnoSasnXCzANpaawQveDCHLbU',
			spentTransactionId: null,
			boxId: '25b1b9aa3092a26c0f40cb0aae3013d0b47878e372e5630d39f4d423c88810a9',
			value: 1000000n,
			ergoTree: '0008cd0233e9a9935c8bbb8ae09b2c944c1d060492a8832252665e043b0732bdf593bf2c',
			assets: [
				{
					tokenId: 'f60bff91f7ae3f3a5f0c2d35b46ef8991f213a61d7f7e453d344fa52a42d9f9a',
					amount: 10000n
				}
			],
			creationHeight: 1509288,
			additionalRegisters: {},
			transactionId: 'b289d514f599df612cf1a51d917c54e4474559811156f09f70e6bef08c2d106d',
			index: 2
		},
		{
			globalIndex: 47515431,
			inclusionHeight: 1509230,
			address: '9euvZDx78vhK5k1wBXsNvVFGc5cnoSasnXCzANpaawQveDCHLbU',
			spentTransactionId: null,
			boxId: '24ed6b1fe909fc3724a22c0a89d4055c8607c03f752f5c4fbad6f0eac84b905e',
			value: 242444242n,
			ergoTree: '0008cd0233e9a9935c8bbb8ae09b2c944c1d060492a8832252665e043b0732bdf593bf2c',
			assets: [
				{
					tokenId: '23b682cde32b4d0e8492caa472b526f8419f7181363534e0cbab92b3c5d452d4',
					amount: 6403948148n
				},
				{
					tokenId: 'f679b3efbcd969c3f9699013e33169966211ac409a250332ca3dcb6694a512ed',
					amount: 19272n
				},
				{
					tokenId: '4e8f38135867f99f064e3dbac43a1402e830cd768bcb73e6c8e205b166ba9ec5',
					amount: 99999n
				},
				{
					tokenId: '02486eeb56b6157afc07be1f5a45c29db6148f1819eb9bc1e2e7f4b611c2d951',
					amount: 10000000000000n
				},
				{
					tokenId: '3809ed2b41d5868307be9b77523861cfd332445596a238cad0c780ccc9b215ea',
					amount: 35n
				},
				{
					tokenId: '47db2393c6f6210b9d7e655eabb2ced8aa9830457d69f3290732b804a363085b',
					amount: 1n
				},
				{
					tokenId: 'e952616014257d62dd52edf006413783aa93d6107413248ff35f094214cc3b39',
					amount: 1n
				},
				{
					tokenId: 'a662b14dcabc8dddc93bafe77de53adffdb8fb3dcf81d7be899dd383e46fffa1',
					amount: 5n
				},
				{
					tokenId: '5f2d7a3eebbcfa1d74d558489aca5485bc83f1adbcf59c89145450bfae10774a',
					amount: 1n
				},
				{
					tokenId: '74648d5d515e37fd578e3fbe7aa0764f5edd27e0c311d82ffcd5596934daf431',
					amount: 1n
				},
				{
					tokenId: 'f60bff91f7ae3f3a5f0c2d35b46ef8991f213a61d7f7e453d344fa52a42d9f9a',
					amount: 40000000000n
				},
				{
					tokenId: 'fffe6122886e3b0ab9b72b401b39bf8d3f13580c1335a41d91d19deb8038ccd4',
					amount: 1000000000000n
				},
				{
					tokenId: '471eec389bebd266b5be1163451775d15c22df12af911e8ff0b919b60c862bae',
					amount: 1n
				},
				{
					tokenId: '69feaac1e621c76d0f45057191ba740c2b4aa1ca28aff58fd889d071a0d795b8',
					amount: 47997989999998290n
				},
				{
					tokenId: '61e8c9d9cb5975fb4f54eec7d62286febcd58aba97cf6798691e3acc728cf3d1',
					amount: 1n
				},
				{
					tokenId: 'bd0c25c373ad606d78412ae1198133f4573b4e4c2d4ed3fc4c2a4547c6c6e12e',
					amount: 1000n
				},
				{
					tokenId: 'd2d0deb3b0b2c511e523fd43ae838ba7b89e4583f165169b90215ff11d942c1f',
					amount: 49000000000000000n
				},
				{
					tokenId: '3f61f140d3fe334a845df647245a9e534337458f976a9d2a32ce4a7a3ee89232',
					amount: 1
				},
				{
					tokenId: '5bf691fbf0c4b17f8f8cece83fa947f62f480bfbd242bd58946f85535125db4d',
					amount: 1999999899970000n
				},
				{
					tokenId: '2b4e0c286b470a9403c10fe557c58c1b5b678a2078b50d28baad0629e237e69c',
					amount: 1n
				},
				{
					tokenId: '2b1d40e38098e666740177c9f296a6ec8898c9a28c645576cca37e0449402a09',
					amount: 1n
				}
			],
			creationHeight: 1509228,
			additionalRegisters: {},
			transactionId: '6fd4942786987a674a093b1818a137713db4567b042efb4a502a041ca83ed223',
			index: 5
		}
	];

	let service;
	let height = 1_512_787 + 10;

	it('Create Lend', async () => {
		const userInput = sampleSolofundLend;
		// take UTXOS from initial set:
		const serviceBox = await fetchServiceBox();
		if (!serviceBox) {
			throw new Error('Failed to fetch service box');
		}

		const chainData: CreateLendChainContext = {
			userUtxo: utxos,
			serviceBox,
			height
		};
		const unsignedTx = createLendTokensTx(userInput, chainData);
		expect(unsignedTx).toBeTruthy();
	});

	it('Create Crowd', () => {});
	it('Load Crowd', () => {});
	it('Crowd + Lend => Repayment', () => {});
	it('Load Repayment to Crowd', () => {});
	it('Unload Crowd Box ', () => {
		const allFunction = `
		createSolofundLoanTokens,
		createCrowdfundLoanTokens,
		fundCrowdfundLoanTokens,
		fundLoanWithCrowdBoxTokens,
		withdrawLendTokensTx,
		fundRepaymentTokens,
		`;
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
