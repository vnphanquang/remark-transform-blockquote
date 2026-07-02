import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
		},
		projects: [
			{
				test: {
					include: ['tests/**/*.unit.test.ts'],
					name: 'unit',
					environment: 'node',
				},
			},
			{
				test: {
					include: ['tests/**/*.browser.test.ts'],
					name: 'browser',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
});
