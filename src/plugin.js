/* eslint-disable jsdoc/reject-any-type */
import { CONTINUE, SKIP, visit } from 'unist-util-visit';

import { ErrorInvalidPreset, createInactivatedMetaWarning } from './errors.js';
import { PRESET_MAPPINGS_COMEAU, PRESET_MAPPINGS_GITHUB } from './presets/index.js';
import { parseAttributesFromMeta } from './utils/parse-attributes-from-meta.js';

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
			throw new ErrorInvalidPreset(preset);
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
			const firstLineText = firstTextNode.value.split('\n')[0].trim();

			const [, marker] = firstLineText.match(/^\[([^\]]+)\]\s*`{0,2}$/) || [];
			if (!marker) return CONTINUE;

			/** @type {string | null} */
			let meta = null;
			/** @type {import('./types.public').MetaAttribute[]} */
			let attributes = [];
			const metaCodeNode = firstParagraphNode.children[1];
			if (metaCodeNode && metaCodeNode.type === 'inlineCode') {
				meta = metaCodeNode.value.trim();

				// remove this node from the AST tree
				firstParagraphNode.children.splice(1, 1);

				// trim newline from the next text node, if any
				const secondNode = firstParagraphNode.children[1];
				if (secondNode && secondNode.type === 'text') {
					if (secondNode.value === '\n') {
						// if the entire text node is just a newline, remove it entirely
						firstParagraphNode.children.splice(1, 1);
					} else {
						secondNode.value = secondNode.value.replace(/^\n+/, '');
					}
				}

				if (!options?.meta) {
					console.warn(createInactivatedMetaWarning(meta));
				} else {
					attributes = parseAttributesFromMeta(meta);
				}
			}

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
					/** @type {any} */ (node.data).hName = mapping.tag ?? 'div';

					/** @type {any} */ (node.data).hProperties ??= {};
					const hProperties = /** @type {Record<string, any>} */ (
						/** @type {any} */ (node.data).hProperties
					);
					for (const [key, value] of Object.entries(mapping.attributes ?? {})) {
						hProperties[key] = value;
					}
					if (options?.meta && attributes.length) {
						for (const attribute of attributes) {
							if (!attribute.merge) continue;
							if (attribute.type === 'boolean') {
								if (attribute.value) {
									hProperties[attribute.name] = true;
								} else {
									delete hProperties[attribute.name];
								}
							} else {
								const { name, value, merge } = attribute;
								if (merge === 'append') {
									hProperties[name] = `${hProperties[name] ?? ''}${value}`;
								} else if (merge === 'prepend') {
									hProperties[name] = `${value}${hProperties[name] ?? ''}`;
								} else {
									hProperties[name] = value;
								}
							}
						}
					}

					if (mapping.hooks?.post) {
						mapping.hooks.post({
							node,
							index,
							parent,
							tree,
							...(options?.meta && meta && {
								meta: {
									raw: meta,
									attributes,
								},
							}),
						});
					}

					break;
				}
			}

			return SKIP;
		});
	};
}
