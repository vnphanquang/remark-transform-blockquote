import { u } from 'unist-builder';

/**
 * @internal
 * @param {{ node: import('mdast').Blockquote }} args - matching blockquote node
 */
function addDecorationNode(args) {
	const { node } = args;
	node.children.splice(
		0,
		0,
		u(
			'paragraph',
			{ data: { hName: 'div', hProperties: { class: 'md-sidenote-decoration' } } },
			[],
		),
	);
}

/** @type {import("../../types.public").RemarkTransformBlockquoteMapping[]} */
export const PRESET_MAPPINGS_COMEAU = [
	{
		marker: '!INFO',
		tag: 'aside',
		attributes: {
			class: 'md-sidenote md-sidenote-info',
		},
		hooks: {
			post: addDecorationNode,
		},
	},
	{
		marker: '!SUCCESS',
		tag: 'aside',
		attributes: {
			class: 'md-sidenote md-sidenote-success',
		},
		hooks: {
			post: addDecorationNode,
		},
	},
	{
		marker: '!WARNING',
		tag: 'aside',
		attributes: {
			class: 'md-sidenote md-sidenote-warning',
		},
		hooks: {
			post: addDecorationNode,
		},
	},
];
