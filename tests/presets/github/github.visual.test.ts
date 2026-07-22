import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';

import css from '../../../src/presets/github/github.css?url';
import { html, markdown, processWithPlugin } from '../../test-utils';

import { VARIANTS } from './fixtures';

beforeAll(async () => {
	// load the preset CSS and some defaults
	// for consistent rendering across browsers and platforms
	document.head.insertAdjacentHTML(
		'beforeend',
		html`
			<link rel="stylesheet" href="${css}" />
			<style>
				:root {
					font-family: Arial, sans-serif;
					font-size: 16px;
				}

				code {
					font-family: Arial;
				}
			</style>
	`,
	);
	await page.viewport(800, 600);
});
afterAll(() => {
	document.head.querySelectorAll('link[rel="stylesheet"]').forEach((link) => link.remove());
	document.head.querySelectorAll('style').forEach((style) => style.remove());
});

afterEach(async () => {
	document.body.innerHTML = '';
});

describe('screenshot of output should match', () => {
	for (const colorScheme of ['light', 'dark']) {
		describe(`color-scheme: ${colorScheme}`, () => {
			beforeAll(() => {
				document.documentElement.style.colorScheme = colorScheme;
			});
			afterAll(() => {
				document.documentElement.style.colorScheme = '';
			});

			for (const variant of VARIANTS) {
				test(variant.name, async () => {
					const output = await processWithPlugin(
						markdown`
							> [!${variant.name}]
							> ${variant.text}
							>
							> Another paragraph inside the block.
							>
							> ~~~
							> console.log('some code block inside too');
							> ~~~
						`,
						{ preset: 'github' },
					);
					const main = document.createElement('main');
					main.setAttribute('data-testid', 'main');
					main.innerHTML = html`
						<p>A paragraph before</p>
						${output}
						<p>A paragraph after</p>
					`;
					document.body.appendChild(main);

					await expect(page.getByTestId('main')).toMatchScreenshot();
				});
			}
		});
	}
});
