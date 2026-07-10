import { expect, test } from 'vitest';

import { mergeMetaAttributes, parseAttributesFromMeta } from '../../src/meta';

test('parseAttributesFromMeta should be exported', () => {
	expect(parseAttributesFromMeta).toBeDefined();
});

test('mergeMetaAttributes should be exported', () => {
	expect(mergeMetaAttributes).toBeDefined();
});
