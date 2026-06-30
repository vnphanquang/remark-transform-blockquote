export interface RemarkCustomBlockquoteOptions {
	mappings: RemarkCustomBlockquoteMapping[];
}

export interface RemarkCustomBlockquoteMapping {
	/**
	 * pattern to match against
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
