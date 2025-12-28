export function shortenAddress(str: string) {
	if (str) {
		return str.slice(0, 5) + '-' + str.slice(-5);
	} else {
		return '';
	}
}

type TimeUnit = 'Days' | 'Weeks' | 'Months';
export const BLOCKS_PER_DAY = 720;

export function toErgoBlocks(value: number, unit: TimeUnit): number {
	switch (unit) {
		case 'Days':
			return value * BLOCKS_PER_DAY;
		case 'Weeks':
			return value * 7 * BLOCKS_PER_DAY;
		case 'Months':
			return value * 30 * BLOCKS_PER_DAY; // Assuming 30 days in a month
		default:
			throw new Error(`Unsupported time unit: ${unit}`);
	}
}
