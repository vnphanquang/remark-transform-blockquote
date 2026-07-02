import { expect, test } from 'vitest';

import { markdown, processWithPlugin } from '../utils';

test('should throw error for unknown preset', async () => {
	const output = processWithPlugin(markdown`> [!UNKNOWN]`, {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preset: 'unknown' as any,
	});

	await expect(output).rejects.toThrow(
		'Invalid preset "unknown". Valid presets are: github, comeau',
	);
});
