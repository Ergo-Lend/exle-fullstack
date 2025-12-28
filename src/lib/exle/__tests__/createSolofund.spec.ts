import { describe, expect, it } from 'vitest';
import { exleSolofundCreateUnsignedTxes } from './exleTx.mockdata';
import { decodeExleFundingInfo, isExleLendTokenBox, isExleServiceBox } from './exle';

describe('Unsigned Solofund transaction', () => {
	it('should decode funding info from lendBox', () => {
		const tx = exleSolofundCreateUnsignedTxes[0];
		const lendBox = tx.outputs.find(isExleLendTokenBox);
		const fundingInfo = decodeExleFundingInfo(lendBox);

		expect(fundingInfo).toBeDefined();
		expect(fundingInfo).toStrictEqual({
			deadlineHeight: 1539188n,
			fundingGoal: 10n,
			interestRate: 1n,
			repaymentHeightLength: 43200n,
			serviceFee: 100000000n
		});
	});
});
