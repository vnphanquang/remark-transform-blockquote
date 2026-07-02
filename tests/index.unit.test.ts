import { expect, test } from 'vitest';

import asDefault, { remarkTransformBlockquote as asNamed } from '../src';

test('named exported should be available', () => {
	expect(asNamed).toBeDefined();
});

test('default exported should be available', () => {
	expect(asDefault).toBeDefined();
});

test('default and named exports should be the same', () => {
	expect(asDefault).toBe(asNamed);
});
