import { describe, test } from 'vitest';

import { html, markdown, matchStringIgnoringWhitespace, processWithPlugin } from '../../test-utils';

import { VARIANTS } from './fixtures';

describe('should transform matching blockquote', () => {
	for (const variant of VARIANTS) {
		test(variant.name, async () => {
			const output = await processWithPlugin(
				markdown`
					> [!${variant.name}]
					> ${variant.text}
				`,
				{ preset: 'github' },
			);
			matchStringIgnoringWhitespace(
				output,
				html`
					<div class="${variant.class}" data-title="${variant.title}">
						<p>${variant.text}</p>
					</div>
			`,
			);
		});
	}
});
