/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest';

import type { MetaAttribute } from '../../src';
import { mergeMetaAttributes } from '../../src/meta/merge-meta-attributes';

test('skip if attributes is empty', () => {
	const into = {};
	expect(mergeMetaAttributes({ into, attributes: {} })).toEqual(into);
});

test('merge default should return new object', () => {
	const into = {
		attr: 'value',
	};

	const merged = mergeMetaAttributes({
		attributes: {
			attr: {
				name: 'attr',
				type: 'string',
				value: 'new-value',
				merge: 'replace',
			},
		},
		into,
	});
	expect(merged).not.toBe(into);
	expect(merged.attr).toBe('new-value');
	expect(into.attr).toBe('value');
});

test('merge in place should return the same object', () => {
	const into = {
		attr: 'value',
	};
	const merged = mergeMetaAttributes({
		attributes: {
			attr: {
				name: 'attr',
				type: 'string',
				value: 'new-value',
				merge: 'replace',
			},
		},
		into,
		inplace: true,
	});
	expect(merged).toBe(into);
});

describe('should respect merge strategy for string attribute', () => {
	test('replace', () => {
		const merged = mergeMetaAttributes({
			attributes: {
				attr: {
					name: 'attr',
					type: 'string',
					value: 'new-value',
					merge: 'replace',
				},
			},
			into: {
				attr: 'value',
			},
		});
		expect(merged.attr).toBe('new-value');
	});

	test('prepend', () => {
		const merged = mergeMetaAttributes({
			attributes: {
				attr: {
					name: 'attr',
					type: 'string',
					value: 'new-value ',
					merge: 'prepend',
				},
			},
			into: {
				attr: 'value',
			},
		});
		expect(merged.attr).toBe('new-value value');
	});

	test('append', () => {
		const merged = mergeMetaAttributes({
			attributes: {
				attr: {
					name: 'attr',
					type: 'string',
					value: ' new-value',
					merge: 'append',
				},
			},
			into: {
				attr: 'value',
			},
		});
		expect(merged.attr).toBe('value new-value');
	});

	test('no merge strategy means skip', () => {
		const merged = mergeMetaAttributes({
			attributes: {
				attr: {
					name: 'attr',
					type: 'string',
					value: 'new-value',
				},
			},
			into: {
				attr: 'value',
			},
		});
		expect(merged.attr).toBe('value');
	});
});

describe('should respect merge strategy for boolean attribute', () => {
	test('replace false with true', () => {
		const merged = mergeMetaAttributes({
			attributes: {
				attr: {
					name: 'attr',
					type: 'boolean',
					value: true,
					merge: 'replace',
				},
			},
			into: {},
		});
		expect(merged.attr).toBe(true);
	});

	test('replace true with false', () => {
		const merged = mergeMetaAttributes({
			attributes: {
				attr: {
					name: 'attr',
					type: 'boolean',
					value: false,
					merge: 'replace',
				},
			},
			into: {
				attr: true,
			},
		});
		expect(merged.attr).toBe(undefined);
	});

	test('append or prepend should also means replace', () => {
		const merged = mergeMetaAttributes({
			attributes: {
				attr1: {
					name: 'attr1',
					type: 'boolean',
					value: false,
					merge: 'append' as any,
				},
				attr2: {
					name: 'attr2',
					type: 'boolean',
					value: true,
					merge: 'prepend' as any,
				},
			},
			into: { attr1: true },
		});
		expect(merged.attr1).toBe(undefined);
		expect(merged.attr2).toBe(true);
	});

	test('no merge strategy means skip', () => {
		const merged = mergeMetaAttributes({
			attributes: {
				attr: {
					name: 'attr',
					type: 'boolean',
					value: false,
				},
			},
			into: {
				attr: true,
			},
		});
		expect(merged.attr).toBe(true);
	});
});

describe('mergeClassToClassName', () => {
	const into = {
		class: 'class',
		className: 'className',
	};
	const attributes: Record<string, MetaAttribute> = {
		class: {
			name: 'class',
			type: 'string',
			value: ' new-class',
			merge: 'append',
		},
		className: {
			name: 'className',
			type: 'string',
			value: ' new-className',
			merge: 'append',
		},
	};

	test('merge correctly', () => {
		const merged = mergeMetaAttributes({ attributes, into });
		expect(merged.class).toBeUndefined();
		expect(merged.className).toBe('className new-className class new-class');
	});

	test('can turn off', () => {
		const merged = mergeMetaAttributes({ attributes, into, mergeClassToClassName: false });
		expect(merged.class).toBe('class new-class');
		expect(merged.className).toBe('className new-className');
	});
});
