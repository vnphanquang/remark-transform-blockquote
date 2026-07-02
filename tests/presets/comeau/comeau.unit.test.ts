import { describe, test } from 'vitest';

import { html, markdown, matchStringIgnoringWhitespace, processWithPlugin } from '../../utils';

import { VARIANTS } from './fixtures';

describe('should transform matching blockquote', () => {
	for (const variant of VARIANTS) {
		test(variant.name, async () => {
			const output = await processWithPlugin(
				markdown`
					> [!${variant.name}]
					> ${variant.text}
				`,
				{ preset: 'comeau' },
			);
			matchStringIgnoringWhitespace(
				output,
				html`
					<aside class="${variant.class}">
						<div class="md-sidenote-decoration"></div>
						<p>${variant.text}</p>
					</aside>
			`,
			);
		});
	}
});
