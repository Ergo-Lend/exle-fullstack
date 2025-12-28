import { describe, it, expect } from 'vitest';
import { loanHistoryTxs } from './loanHistory.mockdata';
import { convertToBigInt, exleHighLevelRecogniser, txToHistoryItem } from './exle';

describe('bob history', () => {
	it('has 10 entries', () => {
		const expected = [
			{
				amount: 10000n,
				role: 'Borrower',
				timestamp: 1745351710309,
				tokenId: 'f60bff91f7ae3f3a5f0c2d35b46ef8991f213a61d7f7e453d344fa52a42d9f9a',
				txId: 'b289d514f599df612cf1a51d917c54e4474559811156f09f70e6bef08c2d106d',
				type: '🎉 Loan Funded'
			},
			{
				type: '🎉 Loan Funded',
				role: 'Borrower',
				txId: '4d0ebe00e8c907c7e1aca80965f822546866fb31d78c6a444091aa5981cb44b5',
				timestamp: 1746361186550,
				amount: 10n,
				tokenId: '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04'
			},
			{
				type: 'Loan Created',
				role: 'Borrower',
				txId: 'cf61246861923d7f596e01f1f9acd86c0ed7466c0958addc04121a41cb6daa62',
				timestamp: 1746355674287,
				amount: undefined,
				tokenId: undefined
			}
		];
		const parsed = loanHistoryTxs
			//.map(convertToBigInt)
			.map((tx) => {
				const label = exleHighLevelRecogniser(tx);
				if (label) {
					return txToHistoryItem(tx, label);
				}
			})
			.filter(Boolean);

		expect(parsed).toStrictEqual(expected);
	});
});
