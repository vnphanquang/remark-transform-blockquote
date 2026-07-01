/** @type {import("../../types.public").RemarkTransformBlockquoteMapping[]} */
export const PRESET_MAPPINGS_GITHUB = [
	{
		marker: '!NOTE',
		attributes: {
			class: 'markdown-alert markdown-alert-note',
			'data-title': 'Note',
		},
	},
	{
		marker: '!TIP',
		attributes: {
			class: 'markdown-alert markdown-alert-tip',
			'data-title': 'Tip',
		},
	},
	{
		marker: '!IMPORTANT',
		attributes: {
			class: 'markdown-alert markdown-alert-important',
			'data-title': 'Important',
		},
	},
	{
		marker: '!WARNING',
		attributes: {
			class: 'markdown-alert markdown-alert-warning',
			'data-title': 'Warning',
		},
	},
	{
		marker: '!CAUTION',
		attributes: {
			class: 'markdown-alert markdown-alert-caution',
			'data-title': 'Caution',
		},
	},
];
