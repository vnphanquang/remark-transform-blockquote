import dedent from 'dedent';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, test } from 'vitest';

import { remarkTransformBlockquote } from '../src/plugin';
import type {
	RemarkTransformBlockquoteMapping,
	RemarkTransformBlockquoteOptions,
} from '../src/types.public';

const markdown = dedent;
const html = dedent;

function matchStringIgnoringWhitespace(actual: string, expected: string) {
	// collapse newline
	const normalize = (str: string) =>
		str.trim().replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').replace(/>\s+</g, '><'); // remove whitespace between tags
	expect(normalize(actual)).toBe(normalize(expected));
}

const mappings: RemarkTransformBlockquoteMapping[] = [
	{
		marker: '!CUSTOM',
		attributes: { class: 'custom-block' },
	},
];

async function processWithPlugin(input: string, options?: RemarkTransformBlockquoteOptions) {
	const output = await unified()
		.use(remarkParse)
		.use(remarkTransformBlockquote, options)
		.use(remarkRehype)
		.use(rehypeStringify)
		.process(input);
	return String(output);
}

test('regular blockquote is not affected', async () => {
	const output = await processWithPlugin(markdown`> This is a regular blockquote.`, { mappings });
	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<p>This is a regular blockquote.</p>
			</blockquote>
		`,
	);
});

test('skip if no mappings provided', async () => {
	const output = await processWithPlugin(markdown`> [!CUSTOM] This is an custom blockquote`);
	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<p>[!CUSTOM] This is an custom blockquote</p>
			</blockquote>
		`,
	);
});

test('skip if no options provided', async () => {
	const output = await processWithPlugin(markdown`> [!CUSTOM] This is an custom blockquote`);
	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<p>[!CUSTOM] This is an custom blockquote</p>
			</blockquote>
		`,
	);
});

test('skip empty blockquote', async () => {
	const output = await processWithPlugin(markdown`>  `, { mappings });
	matchStringIgnoringWhitespace(output, html`
			<blockquote></blockquote>
		`);
});

test('skip if first node is not a paragraph', async () => {
	const output = await processWithPlugin(markdown`> - This is a list item `, { mappings });

	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<ul>
					<li>This is a list item</li>
				</ul>
			</blockquote>
		`,
	);
});

test('skip if first paragraph child node is not a text node', async () => {
	const output = await processWithPlugin(markdown`> **This is bold text** `, {
		mappings,
	});

	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<p><strong>This is bold text</strong></p>
			</blockquote>
		`,
	);
});

test('skip if missing closing bracket', async () => {
	const output = await processWithPlugin(
		markdown`
			> [!CUSTOM
			> This is an custom blockquote
		`,
		{
			mappings,
		},
	);

	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<p>[!CUSTOM This is an custom blockquote</p>
			</blockquote>
		`,
	);
});

describe('custom blockquote is transformed', () => {
	test('no space between', async () => {
		const output = await processWithPlugin(
			markdown`
				> [!CUSTOM]
				> This is an custom blockquote
			`,
			{ mappings },
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<div class="custom-block">
					<p>This is an custom blockquote</p>
				</div>
		`,
		);
	});

	test('no content', async () => {
		const output = await processWithPlugin(markdown`> [!CUSTOM]`, { mappings });

		matchStringIgnoringWhitespace(output, html`
			<div class="custom-block"></div>
		`);
	});

	test('newline between marker and content', async () => {
		const output = await processWithPlugin(
			markdown`
				> [!CUSTOM]
				>
				> This is an custom blockquote

				> [!CUSTOM]
				>
				> **some bold text**

				> [!CUSTOM]
				>
				> ~~~
				> some code block
				> ~~~

				> [!CUSTOM]
			`,
			{ mappings },
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<div class="custom-block">
					<p>This is an custom blockquote</p>
				</div>
				<div class="custom-block">
					<p><strong>some bold text</strong></p>
				</div>
				<div class="custom-block">
					<pre><code>some code block </code></pre>
				</div>
				<div class="custom-block"></div>
		`,
		);
	});

	test('newline before marker', async () => {
		const output = await processWithPlugin(
			markdown`
				> [!CUSTOM]
				> This is an custom blockquote
			`,
			{ mappings },
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<div class="custom-block">
					<p>This is an custom blockquote</p>
				</div>
		`,
		);
	});

	test('mixed in other content', async () => {
		const output = await processWithPlugin(
			markdown`
				> This is a regular blockquote

				> [!CUSTOM]
				> This is an custom blockquote

				This is another regular text block
			`,
			{ mappings },
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<blockquote>
					<p>This is a regular blockquote</p>
				</blockquote>
				<div class="custom-block">
					<p>This is an custom blockquote</p>
				</div>
				<p>This is another regular text block</p>
		`,
		);
	});

	test('multiple marker', async () => {
		const output = await processWithPlugin(
			markdown`
				> [!INFO]
				> This is an custom blockquote

				> [!WARNING]
				> This is another custom blockquote
			`,
			{
				mappings: [
					{
						marker: '!INFO',
						attributes: { class: 'info-blockquote' },
					},
					{
						marker: '!WARNING',
						attributes: { class: 'warning-blockquote' },
					},
				],
			},
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<div class="info-blockquote">
					<p>This is an custom blockquote</p>
				</div>
				<div class="warning-blockquote">
					<p>This is another custom blockquote</p>
				</div>
		`,
		);
	});

	test('matching marker but empty attributes', async () => {
		const output = await processWithPlugin(
			markdown`
				> [!CUSTOM]
				> This is an custom blockquote
			`,
			{
				mappings: [
					{
						marker: '!CUSTOM',
						attributes: {},
					},
				],
			},
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<div>
					<p>This is an custom blockquote</p>
				</div>
		`,
		);
	});

	test('matching marker but no attributes', async () => {
		const output = await processWithPlugin(
			markdown`
				> [!CUSTOM]
				> This is an custom blockquote
			`,
			{
				mappings: [
					{
						marker: '!CUSTOM',
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
					} as any,
				],
			},
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<div>
					<p>This is an custom blockquote</p>
				</div>
		`,
		);
	});

	test('break early once a match is found', async () => {
		const output = await processWithPlugin(
			markdown`
				> [!CUSTOM]
				> This is an custom blockquote
			`,
			{
				mappings: [
					{
						marker: '!CUSTOM',
						attributes: { class: 'custom-block' },
					},
					{
						marker: '!CUSTOM',
						attributes: { class: 'another-custom-block' },
					},
				],
			},
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<div class="custom-block">
					<p>This is an custom blockquote</p>
				</div>
		`,
		);
	});

	test('with custom tag', async () => {
		const output = await processWithPlugin(
			markdown`
				> [!CUSTOM]
				> This is an custom blockquote
			`,
			{
				mappings: [
					{
						marker: '!CUSTOM',
						tag: 'section',
						attributes: { class: 'custom-block' },
					},
				],
			},
		);

		matchStringIgnoringWhitespace(
			output,
			html`
				<section class="custom-block">
					<p>This is an custom blockquote</p>
				</section>
		`,
		);
	});
});
