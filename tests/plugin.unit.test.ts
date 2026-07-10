import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { createInactivatedMetaWarning } from '../src/errors';
import { remarkTransformBlockquote } from '../src/plugin';
import type { MetaAttribute, RemarkTransformBlockquoteMapping } from '../src/types.public';

import { html, markdown, matchStringIgnoringWhitespace, processWithPlugin } from './test-utils';

const mappings: RemarkTransformBlockquoteMapping[] = [
	{
		marker: '!CUSTOM',
		attributes: { class: 'custom-block' },
	},
];

afterEach(() => {
	vi.restoreAllMocks();
});

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
	const output = await processWithPlugin(markdown`> [!CUSTOM] This is a regular blockquote`);
	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<p>[!CUSTOM] This is a regular blockquote</p>
			</blockquote>
		`,
	);
});

test('skip if no options provided', async () => {
	const output = await processWithPlugin(markdown`> [!CUSTOM] This is a regular blockquote`);
	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<p>[!CUSTOM] This is a regular blockquote</p>
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
			> This is a regular blockquote
		`,
		{
			mappings,
		},
	);

	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<p>[!CUSTOM This is a regular blockquote</p>
			</blockquote>
		`,
	);
});

test('skip if no newline between marker and content', async () => {
	const output = await processWithPlugin(markdown` > [!CUSTOM] This is a regular blockquote `, {
		mappings,
	});

	matchStringIgnoringWhitespace(
		output,
		html`
			<blockquote>
				<p>[!CUSTOM] This is a regular blockquote</p>
			</blockquote>
	`,
	);
});

describe('custom blockquote is transformed', () => {
	test('no extra newline between', async () => {
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

	test('extra newline between marker and content', async () => {
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

test('properties set by other plugin should be preserved', async () => {
	const input = `> [!CUSTOM]`;
	const output = await unified()
		.use(remarkParse)
		.use(() => (tree) => {
			visit(tree, { type: 'blockquote' }, (node) => {
				node.data ??= {};
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(node.data as any).hProperties = { 'data-test-before': '.' };
			});
		})
		.use(remarkTransformBlockquote, {
			mappings: [
				{
					marker: '!CUSTOM',
					attributes: { class: 'custom-block' },
				},
			],
		})
		.use(() => (tree) => {
			visit(tree, { type: 'blockquote' }, (node) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(node.data as any).hProperties['data-test-after'] = '.';
			});
		})
		.use(remarkRehype)
		.use(rehypeStringify)
		.process(input);

	matchStringIgnoringWhitespace(
		String(output),
		html`
			<div data-test-before="." class="custom-block" data-test-after="."></div>
		`,
	);
});

describe('should preserve placeholder/variable pattern', () => {
	test('double braces {{}}', async () => {
		const input = markdown`
			> [!CUSTOM]
			> This is a custom blockquote with a placeholder variable: {{variable_name}}
		`;

		const output = await processWithPlugin(input, { mappings });

		matchStringIgnoringWhitespace(
			output,
			html`
				<div class="custom-block">
					<p>This is a custom blockquote with a placeholder variable: {{variable_name}}</p>
				</div>
			`,
		);
	});

	test('singled braces {}', async () => {
		const input = markdown`
			> [!CUSTOM]
			> This is a custom blockquote with a placeholder variable: {variable_name}
		`;

		const output = await processWithPlugin(input, { mappings });

		matchStringIgnoringWhitespace(
			output,
			html`
				<div class="custom-block">
					<p>This is a custom blockquote with a placeholder variable: {variable_name}</p>
				</div>
			`,
		);
	});
});

describe('should handle meta string', () => {
	test('skip empty meta', async () => {
		const input = markdown`
			> [!CUSTOM] \`\`
			> This is a custom blockquote with empty meta string.
		`;
		const ouptut = await processWithPlugin(input, { mappings });
		matchStringIgnoringWhitespace(
			ouptut,
			html`
				<div class="custom-block">
					<p>\`\` This is a custom blockquote with empty meta string.</p>
				</div>
				`,
		);
	});

	test('print warning if not explicitly allowed', async () => {
		const meta = 'class="ignored"';
		const input = markdown`
			> [!CUSTOM] \`${meta}\`
			> This is a custom blockquote with a meta string that should be ignored.
		`;

		const spiedWarning = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const ouptut = await processWithPlugin(input, { mappings });
		matchStringIgnoringWhitespace(
			ouptut,
			html`
				<div class="custom-block">
					<p>This is a custom blockquote with a meta string that should be ignored.</p>
				</div>
				`,
		);
		expect(spiedWarning).toHaveBeenCalledWith(createInactivatedMetaWarning(meta));
	});

	test('trim newline from next node', async () => {
		const input = markdown`
			> [!CUSTOM] \`attr="value" boolean\`
			> This is a custom blockquote with a meta string that should be ignored.
		`;
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const ouptut = await processWithPlugin(input, { mappings });
		matchStringIgnoringWhitespace(
			ouptut,
			html`
				<div class="custom-block">
					<p>This is a custom blockquote with a meta string that should be ignored.</p>
				</div>
				`,
		);
	});

	test('remove newline-only next node', async () => {
		const input = markdown`
			> [!CUSTOM] \`attr="value" boolean\`
			> **This** meta string should be ignored.
		`;
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const ouptut = await processWithPlugin(input, { mappings });
		matchStringIgnoringWhitespace(
			ouptut,
			html`
				<div class="custom-block">
					<p><strong>This</strong> meta string should be ignored.</p>
				</div>
				`,
		);
	});

	test('no content', async () => {
		const input = markdown` > [!CUSTOM] \`attr="value" boolean\` `;
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const ouptut = await processWithPlugin(input, { mappings });
		matchStringIgnoringWhitespace(ouptut, html`<div class="custom-block"></div>`);
	});

	test('prepending string attribute', async () => {
		const input = markdown`
			> [!CUSTOM] \`^class="extra " ^data-attr=value\`
			> This is a custom blockquote with a meta string that should be applied
		`;
		const ouptut = await processWithPlugin(input, { mappings, meta: true });
		matchStringIgnoringWhitespace(
			ouptut,
			html`
				<div class="extra custom-block" data-attr="value">
					<p>This is a custom blockquote with a meta string that should be applied</p>
				</div>
				`,
		);
	});

	test('appending string attribute', async () => {
		const input = markdown`
			> [!CUSTOM] \`$class=" extra" $data-attr=value\`
			> This is a custom blockquote with a meta string that should be applied
		`;
		const ouptut = await processWithPlugin(input, { mappings, meta: true });
		matchStringIgnoringWhitespace(
			ouptut,
			html`
				<div class="custom-block extra" data-attr="value">
					<p>This is a custom blockquote with a meta string that should be applied</p>
				</div>
				`,
		);
	});

	test('replacing string attribute', async () => {
		const input = markdown`
			> [!CUSTOM] \`class="replaced"\`
			> This is a custom blockquote with a meta string that should be applied
		`;
		const ouptut = await processWithPlugin(input, { mappings, meta: true });
		matchStringIgnoringWhitespace(
			ouptut,
			html`
				<div class="replaced">
					<p>This is a custom blockquote with a meta string that should be applied</p>
				</div>
				`,
		);
	});

	test('replacing boolean attribute', async () => {
		const input = markdown`
			> [!CUSTOM] \`data-boolean1=false data-boolean2 data-boolean3="true" ^data-boolean4=false $data-boolean5=true\`
			> This is a custom blockquote with a meta string that should be applied
		`;
		const ouptut = await processWithPlugin(input, {
			mappings: [
				{
					marker: '!CUSTOM',
					tag: 'div',
					attributes: { 'data-boolean1': true },
				},
			],
			meta: true,
		});
		matchStringIgnoringWhitespace(
			ouptut,
			html`
				<div data-boolean2 data-boolean3 data-boolean5>
					<p>This is a custom blockquote with a meta string that should be applied</p>
				</div>
				`,
		);
	});

	test('skipping attributes', async () => {
		const post = vi.fn();
		const input = markdown`
			> [!CUSTOM] \`!class="internal" data-boolean=false !data-boolean-internal\`
			> This is a custom blockquote with a meta string that should be skipped
		`;
		const ouptut = await processWithPlugin(input, {
			mappings: [
				{
					marker: '!CUSTOM',
					tag: 'div',
					attributes: { class: 'custom-block', 'data-boolean': true },
					hooks: { post },
				},
			],
			meta: true,
		});
		matchStringIgnoringWhitespace(
			ouptut,
			html`
				<div class="custom-block">
					<p>This is a custom blockquote with a meta string that should be skipped</p>
				</div>
				`,
		);
		expect(post).toHaveBeenCalledWith(
			expect.objectContaining({
				meta: {
					raw: `!class="internal" data-boolean=false !data-boolean-internal`,
					attributes: [
						{
							type: 'string',
							name: 'class',
							value: 'internal',
						},
						{
							type: 'boolean',
							name: 'data-boolean',
							value: false,
							merge: 'replace',
						},
						{
							type: 'boolean',
							name: 'data-boolean-internal',
							value: true,
						},
					] satisfies MetaAttribute[],
				},
			}),
		);
	});
});
