import { describe, expect, test } from 'vitest';

import type { MetaAttribute } from '../../src';
import { parseAttributesFromMeta } from '../../src/meta/parse-attributes-from-meta';

type MetaAttributeMapping = Record<string, MetaAttribute>;

test('return array if meta is nullish', () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	expect(parseAttributesFromMeta(null as any)).toEqual({});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	expect(parseAttributesFromMeta(undefined as any)).toEqual({});
});

test('return empty if meta is empty string', () => {
	expect(parseAttributesFromMeta('')).toEqual({});
});

describe('can parse boolean attribute', () => {
	test('implicitly', () => {
		expect(parseAttributesFromMeta('attr')).toEqual({
			attr: {
				type: 'boolean',
				name: 'attr',
				value: true,
				merge: 'replace',
			},
		} satisfies MetaAttributeMapping);
	});

	test('explicitly true', () => {
		const expected = {
			attr: {
				type: 'boolean',
				name: 'attr',
				value: true,
				merge: 'replace',
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta('attr=true')).toEqual(expected);
		expect(parseAttributesFromMeta('attr="true"')).toEqual(expected);
		expect(parseAttributesFromMeta("attr='true'")).toEqual(expected);
	});

	test('expicitly false', () => {
		const expected = {
			attr: {
				type: 'boolean',
				name: 'attr',
				value: false,
				merge: 'replace',
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta('attr=false')).toEqual(expected);
		expect(parseAttributesFromMeta('attr="false"')).toEqual(expected);
		expect(parseAttributesFromMeta("attr='false'")).toEqual(expected);
	});

	test('^ & $ prefix are considered as if none given', () => {
		const expected = {
			attr: {
				type: 'boolean',
				name: 'attr',
				value: true,
				merge: 'replace',
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta('^attr=true')).toEqual(expected);
		expect(parseAttributesFromMeta('^attr="true"')).toEqual(expected);
		expect(parseAttributesFromMeta("^attr='true'")).toEqual(expected);
		expect(parseAttributesFromMeta('^attr')).toEqual(expected);
		expect(parseAttributesFromMeta('$attr')).toEqual(expected);
		expect(parseAttributesFromMeta('$attr=true')).toEqual(expected);
		expect(parseAttributesFromMeta('$attr="true"')).toEqual(expected);
		expect(parseAttributesFromMeta("$attr='true'")).toEqual(expected);
	});

	test('# prefix means no merge', () => {
		const expected = {
			attr: {
				type: 'boolean',
				name: 'attr',
				value: true,
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta('#attr=true')).toEqual(expected);
		expect(parseAttributesFromMeta('#attr="true"')).toEqual(expected);
		expect(parseAttributesFromMeta("#attr='true'")).toEqual(expected);
		expect(parseAttributesFromMeta('#attr')).toEqual(expected);
	});
});

describe('can parse string attribute', () => {
	test('with no prefix', () => {
		const expected = {
			attr: {
				type: 'string',
				name: 'attr',
				value: 'value',
				merge: 'replace',
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta('attr=value')).toEqual(expected);
		expect(parseAttributesFromMeta('attr="value"')).toEqual(expected);
		expect(parseAttributesFromMeta("attr='value'")).toEqual(expected);
	});

	test('with single quote in value', () => {
		const expected = {
			attr: {
				type: 'string',
				name: 'attr',
				value: "value with 'single' quote",
				merge: 'replace',
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta(`attr="value with 'single' quote"`)).toEqual(expected);
	});

	test('with double quote in value', () => {
		const expected = {
			attr: {
				type: 'string',
				name: 'attr',
				value: 'value with "double" quote',
				merge: 'replace',
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta(`attr='value with "double" quote'`)).toEqual(expected);
	});

	test('^ prefix means prepend', () => {
		const expected = {
			attr: {
				type: 'string',
				name: 'attr',
				value: 'value',
				merge: 'prepend',
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta('^attr=value')).toEqual(expected);
		expect(parseAttributesFromMeta('^attr="value"')).toEqual(expected);
		expect(parseAttributesFromMeta("^attr='value'")).toEqual(expected);
	});

	test('$ prefix means append', () => {
		const expected = {
			attr: {
				type: 'string',
				name: 'attr',
				value: 'value',
				merge: 'append',
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta('$attr=value')).toEqual(expected);
		expect(parseAttributesFromMeta('$attr="value"')).toEqual(expected);
		expect(parseAttributesFromMeta("$attr='value'")).toEqual(expected);
	});

	test('# prefix means no merge', () => {
		const expected = {
			attr: {
				type: 'string',
				name: 'attr',
				value: 'value',
			},
		} satisfies MetaAttributeMapping;
		expect(parseAttributesFromMeta('#attr=value')).toEqual(expected);
		expect(parseAttributesFromMeta('#attr="value"')).toEqual(expected);
		expect(parseAttributesFromMeta("#attr='value'")).toEqual(expected);
	});
});

describe('can parse multiple', () => {
	const expected = {
		attr1: {
			type: 'string',
			name: 'attr1',
			value: 'value1',
			merge: 'replace',
		},
		attr2: {
			type: 'string',
			name: 'attr2',
			value: 'value2',
			merge: 'prepend',
		},
		attr3: {
			type: 'string',
			name: 'attr3',
			value: 'value3',
			merge: 'append',
		},
		attr4: {
			type: 'boolean',
			name: 'attr4',
			value: true,
		},
	} satisfies MetaAttributeMapping;

	test('space separated', () => {
		expect(parseAttributesFromMeta(`attr1=value1 ^attr2="value2" $attr3='value3' #attr4`)).toEqual(
			expected,
		);
	});

	test('without space', () => {
		expect(parseAttributesFromMeta(`attr1="value1"^attr2="value2"$attr3='value3'#attr4`)).toEqual(
			expected,
		);
	});
});

test('should take last occurence if appears multiple times', () => {
	expect(
		parseAttributesFromMeta('attr=frist $attr="second" #attr=third ^attr=forth attr attr="last"'),
	).toEqual({
		attr: {
			type: 'string',
			name: 'attr',
			value: 'last',
			merge: 'replace',
		},
	} satisfies MetaAttributeMapping);
	expect(parseAttributesFromMeta('attr=frist $attr="second" #attr=third ^attr=forth attr')).toEqual(
		{
			attr: {
				type: 'boolean',
				name: 'attr',
				value: true,
				merge: 'replace',
			},
		} satisfies MetaAttributeMapping,
	);
});
