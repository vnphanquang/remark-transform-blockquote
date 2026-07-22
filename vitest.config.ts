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
					include: ['tests/**/*.visual.test.ts'],
					name: 'visual',
					browser: {
						enabled: true,
						provider: playwright(),
						headless: true,
						instances: [
							{
								browser: 'chromium',
								headless: true,
							},
						],
					},
				},
			},
		],
	},
});
