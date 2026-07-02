import { PRESET_MAPPINGS_GITHUB } from '../../../src/presets';

const VARIANT_TO_TEXT: Record<string, string> = {
	NOTE: 'Useful information that users should know, even when skimming content.',
	TIP: 'Helpful advice for doing things better or more easily.',
	IMPORTANT: 'Key information users need to know to achieve their goal.',
	WARNING: 'Urgent info that needs immediate user attention to avoid problems.',
	CAUTION: 'Advises about risks or negative outcomes of certain actions.',
};

export const VARIANTS = PRESET_MAPPINGS_GITHUB.map((mapping) => {
	const variant = mapping.marker.replace('!', '');
	return {
		name: variant,
		text: VARIANT_TO_TEXT[variant],
		title: mapping.attributes['data-title'],
		class: mapping.attributes.class,
	};
});
