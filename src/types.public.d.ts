/** configure the behavior of `remark-transform-blockquote` */
export interface RemarkTransformBlockquoteOptions {
	/**
	 * define what to match and how to transform the blockquote node;
	 * this will take precedence when merged on top of a preset if one is specified
	 */
	mappings?: RemarkTransformBlockquoteMapping[];
	/**
	 * a set of predefined mappings to use:
	 *
	 * - `'github'`: matches GitHub-style alerts
	 * - `'comeau'`: matches callout styles similar to (but not exact) those used in Josh Comeau's blog posts
	 *
	 * Note:
	 *
	 * - pass `mappings` to provide additional configuration on top of a preset
	 * - setting this alone is not sufficient to render the desired style. You will need to import the
	 *   corresponding CSS at `remark-transform-blockquote/presets/<preset>.css`.
	 */
	preset?: 'github' | 'comeau';
}

export interface RemarkTransformBlockquoteMapping {
	/**
	 * pattern to match against, in the format "!<string>" where <string> is case-sensitive.
	 *
	 * @example
	 *
	 * this settings...
	 *
	 * ```typescript
	 * await unified().use(remarkParse).use(remarkTransformBlockquote, {
	 *   mappings: [
	 *     { marker: '!INFO', attributes: { class: 'alert-info' } },
	 *     { marker: '!WARNING', attributes: { class: 'alert-warning' } },
	 *     ...
	 *   ]
	 * })
	 * ```
	 *
	 * ...will match:
	 *
	 * ```markdown
	 * > [!INFO]
	 * > This is an info blockquote
	 *
	 * > [!WARNING]
	 * > This is a warning blockquote
	 * ```
	 */
	marker: `!${string}`;
	/**
	 * set `node.data.hName` to this value, typically this should be the corresponding HTML tag name
	 * @default 'div'
	 */
	tag?: string;
	/**
	 * attributes to add to `node.data.hProperties`,
	 * typically this should be the corresponding attributes if converted to HTML
	 */
	attributes: Record<string, string>;
}
