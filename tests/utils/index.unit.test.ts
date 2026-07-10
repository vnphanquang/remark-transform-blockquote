import { expect, test } from 'vitest';

import { parseAttributesFromMeta } from '../../src/utils';

test('parseAttributesFromMeta should be exported', () => {
	expect(parseAttributesFromMeta).toBeDefined();
})
