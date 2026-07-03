/* eslint-disable jsdoc/reject-any-type */
import { CONTINUE, SKIP, visit } from 'unist-util-visit';

import { PRESET_MAPPINGS_COMEAU, PRESET_MAPPINGS_GITHUB } from './presets/index.js';

const PRESET_TO_MAPPINGS = /** @type {const} */ ({
	github: PRESET_MAPPINGS_GITHUB,
	comeau: PRESET_MAPPINGS_COMEAU,
});

/**
 * Remark plugin that turns a blockquote with special marker into a customisable element,
 * similar to {@link https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts|Github Markdown Alerts}
 * @param {import('./types.public').RemarkTransformBlockquoteOptions} [options] - configure the plugin behavior
 * @returns {import('unified').Transformer<import('mdast').Root, import('mdast').Root>}
 */
export function remarkTransformBlockquote(options) {
	const { preset } = options ?? {};
	let mappings = options?.mappings ?? [];

	if (preset) {
		if (!Object.keys(PRESET_TO_MAPPINGS).includes(preset)) {
			throw new Error(
				`Invalid preset "${preset}". Valid presets are: ${Object.keys(PRESET_TO_MAPPINGS).join(', ')}`,
			);
		}
		mappings = [...mappings, ...PRESET_TO_MAPPINGS[preset]];
	}

	return function (tree) {
		if (mappings.length === 0) return;

		visit(tree, (node, index, parent) => {
			if (node.type !== 'blockquote') return CONTINUE;

			if (!node.children || node.children.length === 0) return CONTINUE;

			const firstParagraphNode = node.children[0];
			if (firstParagraphNode.type !== 'paragraph') return CONTINUE;

			const firstTextNode = firstParagraphNode.children[0];
			if (!firstTextNode || firstTextNode.type !== 'text') return CONTINUE;

			const firstLineText = firstTextNode.value.trim().split('\n')[0];

			if (!firstLineText.startsWith('[!')) return CONTINUE;
			if (!firstLineText.endsWith(']')) return CONTINUE;

			const marker = firstLineText.slice(1, -1);

			for (const mapping of mappings) {
				if (mapping.marker === marker) {
					if (firstTextNode.value.trim() === `[${marker}]`) {
						// if the entire text node is just the marker, remove it entirely
						firstParagraphNode.children.shift();
						// if there is any newline between marker and content, remove that node
						const secondParagraphNode = node.children[0];
						if (
							secondParagraphNode &&
							secondParagraphNode.type === 'paragraph' &&
							secondParagraphNode.children.length === 0
						) {
							node.children.splice(0, 1);
						}
					} else {
						// otherwise, remove just the marker from the text node
						firstTextNode.value = firstTextNode.value.replace(`[${marker}]`, '').trim();
					}

					// adding attributes to `hProperties`, as documented here:
					// https://github.com/syntax-tree/mdast-util-to-hast#fields-on-nodes
					node.data ??= {};
					/** @type {any} */ (node.data).hProperties ??= {};
					for (const [key, value] of Object.entries(mapping.attributes ?? {})) {
						/** @type {any} */ (node.data).hProperties[key] = value;
					}

					/** @type {any} */ (node.data).hName = mapping.tag ?? 'div';

					if (mapping.hooks?.post) {
						mapping.hooks.post(node, index, parent, tree);
					}

					break;
				}
			}

			return [SKIP, index];
		});
	};
}
