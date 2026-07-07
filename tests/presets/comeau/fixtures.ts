import { PRESET_MAPPINGS_COMEAU } from '../../../src/presets';

const VARIANT_TO_TEXT: Record<string, string> = {
	INFO: 'General information that users should know.',
	SUCCESS: 'Indicates a successful or positive action.',
	WARNING: 'Urgent info that needs immediate user attention to avoid problems.',
};

export const VARIANTS = PRESET_MAPPINGS_COMEAU.map((mapping) => {
	const variant = mapping.marker.replace('!', '');
	return {
		name: variant,
		text: VARIANT_TO_TEXT[variant],
		title: mapping.attributes?.['data-title'],
		class: mapping.attributes?.class,
	};
});
