import { describe, test } from 'vitest';

import { RemarkTransformBlockquoteOptions } from '../../src';
import { html, markdown, matchStringIgnoringWhitespace, processWithPlugin } from '../utils';

const INFO = markdown`
	> [!INFO]
	> General information that users should know.
`;

const SUCCESS = markdown`
	> [!SUCCESS]
	> Indicates a successful or positive action.
`;

const WARNING = markdown`
	> [!WARNING]
	> Urgent info that needs immediate user attention to avoid problems.
`;

const options: RemarkTransformBlockquoteOptions = {
	preset: 'comeau',
};

describe('should transform matching blockquote', () => {
	test('INFO', async () => {
		const output = await processWithPlugin(INFO, options);
		matchStringIgnoringWhitespace(
			output,
			html`
				<aside class="md-sidenote md-sidenote-info">
					<div class="md-sidenote-decoration"></div>
					<p>General information that users should know.</p>
				</aside>
		`,
		);
	});

	test('SUCCESS', async () => {
		const output = await processWithPlugin(SUCCESS, options);
		matchStringIgnoringWhitespace(
			output,
			html`
				<aside class="md-sidenote md-sidenote-success">
					<div class="md-sidenote-decoration"></div>
					<p>Indicates a successful or positive action.</p>
				</aside>
		`,
		);
	});

	test('WARNING', async () => {
		const output = await processWithPlugin(WARNING, options);
		matchStringIgnoringWhitespace(
			output,
			html`
				<aside class="md-sidenote md-sidenote-warning">
					<div class="md-sidenote-decoration"></div>
					<p>Urgent info that needs immediate user attention to avoid problems.</p>
				</aside>
		`,
		);
	});
});
