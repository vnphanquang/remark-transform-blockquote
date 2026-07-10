import { expect, test } from 'vitest';

import { ErrorInvalidPreset } from '../../src/errors.js';
import { markdown, processWithPlugin } from '../test-utils';

test('should throw error for unknown preset', async () => {
	const output = processWithPlugin(markdown`> [!UNKNOWN]`, {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		preset: 'unknown' as any,
	});

	await expect(output).rejects.toThrow(ErrorInvalidPreset);
});
