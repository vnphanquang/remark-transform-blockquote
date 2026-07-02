import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';

import css from '../../../src/presets/comeau/comeau.css?url';
import { html, markdown, processWithPlugin } from '../../utils';

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

				main {
					@media (width >= 35.1875rem) {
						padding-inline: 2rem;
					}
					@media (width >= 51.6875rem) {
						padding-inline: 4rem;
					}
				}

				.prose {
					padding-inline: 1rem;

					@media (width >= 35.1875rem) {
						padding-inline: 2rem;
					}
				}
			</style>
	`,
	);
});
afterAll(() => {
	document.head.querySelectorAll('link[rel="stylesheet"]').forEach((link) => link.remove());
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

			const screens: [string, { width: number; height: number }][] = [
				// mobile
				['width < 35.1875rem (563px)', { width: 375, height: 800 }],
				// tablet
				['35.1875rem (563px) <= width < 51.6875rem (827px)', { width: 768, height: 1024 }],
				// desktop
				['51.6875rem (827px) <= width', { width: 1024, height: 768 }],
			];

			for (const [title, screen] of screens) {
				describe(title, () => {
					beforeAll(async () => {
						await page.viewport(screen.width, screen.height);
					});
					afterAll(async () => {
						await page.viewport(800, 600);
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
								{ preset: 'comeau' },
							);
							const main = document.createElement('main');
							main.setAttribute('data-testid', 'main');
							main.innerHTML = html`
								<div class="prose">
									<p>A paragraph before</p>
									${output}
									<p>A paragraph after</p>
								</div>
							`;
							document.body.appendChild(main);

							await expect(page.getByTestId('main')).toMatchScreenshot();
						});
					}
				});
			}
		});
	}
});
