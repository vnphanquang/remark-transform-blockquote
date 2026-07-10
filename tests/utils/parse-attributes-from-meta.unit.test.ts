import { describe, expect, test } from 'vitest';

import type { MetaAttribute } from '../../src';
import { parseAttributesFromMeta } from '../../src/utils/parse-attributes-from-meta';

test('return array if meta is nullish', () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	expect(parseAttributesFromMeta(null as any)).toEqual([]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	expect(parseAttributesFromMeta(undefined as any)).toEqual([]);
});

test('return empty if meta is empty string', () => {
	expect(parseAttributesFromMeta('')).toEqual([]);
});

describe('can parse boolean attribute', () => {
	test('implicitly', () => {
		expect(parseAttributesFromMeta('attr')).toEqual([
			{
				type: 'boolean',
				name: 'attr',
				value: true,
				merge: 'replace',
			},
		] satisfies MetaAttribute[]);
	});

	test('explicitly true', () => {
		const expected = [
			{
				type: 'boolean',
				name: 'attr',
				value: true,
				merge: 'replace',
			},
		] as MetaAttribute[];
		expect(parseAttributesFromMeta('attr=true')).toEqual(expected);
		expect(parseAttributesFromMeta('attr="true"')).toEqual(expected);
		expect(parseAttributesFromMeta("attr='true'")).toEqual(expected);
	});

	test('expicitly false', () => {
		const expected = [
			{
				type: 'boolean',
				name: 'attr',
				value: false,
				merge: 'replace',
			},
		] as MetaAttribute[];
		expect(parseAttributesFromMeta('attr=false')).toEqual(expected);
		expect(parseAttributesFromMeta('attr="false"')).toEqual(expected);
		expect(parseAttributesFromMeta("attr='false'")).toEqual(expected);
	});

	test('^ & $ prefix are considered as if none given', () => {
		const expected = [
			{
				type: 'boolean',
				name: 'attr',
				value: true,
				merge: 'replace',
			},
		] satisfies MetaAttribute[];
		expect(parseAttributesFromMeta('^attr=true')).toEqual(expected);
		expect(parseAttributesFromMeta('^attr="true"')).toEqual(expected);
		expect(parseAttributesFromMeta("^attr='true'")).toEqual(expected);
		expect(parseAttributesFromMeta('^attr')).toEqual(expected);
		expect(parseAttributesFromMeta('$attr')).toEqual(expected);
		expect(parseAttributesFromMeta('$attr=true')).toEqual(expected);
		expect(parseAttributesFromMeta('$attr="true"')).toEqual(expected);
		expect(parseAttributesFromMeta("$attr='true'")).toEqual(expected);
	});

	test('! prefix means no merge', () => {
		const expected = [
			{
				type: 'boolean',
				name: 'attr',
				value: true,
			},
		] satisfies MetaAttribute[];
		expect(parseAttributesFromMeta('!attr=true')).toEqual(expected);
		expect(parseAttributesFromMeta('!attr="true"')).toEqual(expected);
		expect(parseAttributesFromMeta("!attr='true'")).toEqual(expected);
		expect(parseAttributesFromMeta('!attr')).toEqual(expected);
	});
});

describe('can parse string attribute', () => {
	test('with no prefix', () => {
		const expected = [
			{
				type: 'string',
				name: 'attr',
				value: 'value',
				merge: 'replace',
			},
		] as MetaAttribute[];
		expect(parseAttributesFromMeta('attr=value')).toEqual(expected);
		expect(parseAttributesFromMeta('attr="value"')).toEqual(expected);
		expect(parseAttributesFromMeta("attr='value'")).toEqual(expected);
	});

	test('with single quote in value', () => {
		const expected = [
			{
				type: 'string',
				name: 'attr',
				value: "value with 'single' quote",
				merge: 'replace',
			},
		] as MetaAttribute[];
		expect(parseAttributesFromMeta(`attr="value with 'single' quote"`)).toEqual(expected);
	});

	test('with double quote in value', () => {
		const expected = [
			{
				type: 'string',
				name: 'attr',
				value: 'value with "double" quote',
				merge: 'replace',
			},
		] as MetaAttribute[];
		expect(parseAttributesFromMeta(`attr='value with "double" quote'`)).toEqual(expected);
	});

	test('^ prefix means prepend', () => {
		const expected = [
			{
				type: 'string',
				name: 'attr',
				value: 'value',
				merge: 'prepend',
			},
		] as MetaAttribute[];
		expect(parseAttributesFromMeta('^attr=value')).toEqual(expected);
		expect(parseAttributesFromMeta('^attr="value"')).toEqual(expected);
		expect(parseAttributesFromMeta("^attr='value'")).toEqual(expected);
	});

	test('$ prefix means append', () => {
		const expected = [
			{
				type: 'string',
				name: 'attr',
				value: 'value',
				merge: 'append',
			},
		] as MetaAttribute[];
		expect(parseAttributesFromMeta('$attr=value')).toEqual(expected);
		expect(parseAttributesFromMeta('$attr="value"')).toEqual(expected);
		expect(parseAttributesFromMeta("$attr='value'")).toEqual(expected);
	});

	test('! prefix means no merge', () => {
		const expected = [
			{
				type: 'string',
				name: 'attr',
				value: 'value',
			},
		] as MetaAttribute[];
		expect(parseAttributesFromMeta('!attr=value')).toEqual(expected);
		expect(parseAttributesFromMeta('!attr="value"')).toEqual(expected);
		expect(parseAttributesFromMeta("!attr='value'")).toEqual(expected);
	});
});

describe('can parse multiple', () => {
	const expected = [
		{
			type: 'string',
			name: 'attr1',
			value: 'value1',
			merge: 'replace',
		},
		{
			type: 'string',
			name: 'attr2',
			value: 'value2',
			merge: 'prepend',
		},
		{
			type: 'string',
			name: 'attr3',
			value: 'value3',
			merge: 'append',
		},
		{
			type: 'boolean',
			name: 'attr4',
			value: true,
		},
	] satisfies MetaAttribute[];

	test('space separated', () => {
		expect(parseAttributesFromMeta(`attr1=value1 ^attr2="value2" $attr3='value3' !attr4`)).toEqual(
			expected,
		);
	});

	test('without space', () => {
		expect(parseAttributesFromMeta(`attr1="value1"^attr2="value2"$attr3='value3'!attr4`)).toEqual(
			expected,
		);
	});
});

test('should take last occurence if appears multiple times', () => {
	expect(
		parseAttributesFromMeta('attr=frist $attr="second" !attr=third ^attr=forth attr attr="last"'),
	).toEqual([
		{
			type: 'string',
			name: 'attr',
			value: 'last',
			merge: 'replace',
		},
	] as MetaAttribute[]);
	expect(parseAttributesFromMeta('attr=frist $attr="second" !attr=third ^attr=forth attr')).toEqual(
		[
			{
				type: 'boolean',
				name: 'attr',
				value: true,
				merge: 'replace',
			},
		] as MetaAttribute[],
	);
});
