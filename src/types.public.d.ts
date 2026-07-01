export interface RemarkTransformBlockquoteOptions {
	mappings: RemarkTransformBlockquoteMapping[];
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
