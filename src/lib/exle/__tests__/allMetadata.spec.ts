import { describe, it, expect, vi, beforeEach } from 'vitest';
import { allMetadata } from './allMetadata.mockdata';

describe('Exle Metadata', () => {
	it('is defined', async () => {
		expect(allMetadata).toBeDefined();
	});
});
