export class ErrorInvalidPreset extends Error {
	/**
	 * @type {string}
	 */
	parsed;

	/**
	 * @param {string} parsed the invalid preset string input
	 */
	constructor(parsed) {
		const presets = ['github', 'comeau'];
		super(
			`[remark-transform-blockquote] Invalid preset "${parsed}". Valid presets are: ${presets.join(', ')}`,
		);
		this.parsed = parsed;
	}
}

/**
 * @param {string} parsed the meta string parsed from input
 * @returns {string}
 */
export function createInactivatedMetaWarning(parsed) {
	return `[remark-transform-blockquote] meta string \`${parsed}\` is detected but skip because meta processing not enabled in the plugin options.`;
}
