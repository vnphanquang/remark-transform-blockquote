import type { Blockquote, Root, RootContent } from 'mdast';

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
	/**
	 * allow meta string after the marker, e.g. \[!MARKER\] \`prop="value" boolean\`.
	 *
	 * - `false` | `undefined` (default): meta string is skipped
	 * - `true`: meta string is parsed and potentially merged into `node.data.hProperties`
	 *
	 * ## Restrictions
	 *
	 * A meta string must be written within an inline code, e.g. \`...\`. It can contain key-value pairs
	 * for string attribute, or standalone strings that will be understood as boolean attributes:
	 *
	 * - attributes are typically space-separated,
	 * - value for string attribute can be written without quotes if there is no space in it, e.g.
	 *   \`prop=value\`, or wrapped in single or double quotes depending on your preference and
	 *   whether it contains spaces and/or quotes,
	 * - boolean attributes can also be given explicit value, e.g. \`prop=true\` or \`prop=false\`.
	 *
	 * ## Prefixes
	 *
	 * By default, parsed attributes from meta string will replace existing attributes with the same name
	 * in `node.data.hProperties`. This can be changed by providing a `prefix` to the attribute name:
	 *
	 * - `^`: prepend the value to existing attribute value, e.g. \`^class=" prepend"\
	 * - `$`: append the value to existing attribute value, e.g. \`$class="append "\`
	 * - `!`: parsed but skip merging, useful if you want to do some post-processing with hooks, e.g. \`!attr="internal"\`
	 *
	 * Note that `^` and `$` have no effect on boolean attributes.
	 *
	 * ## Example
	 *
	 * Meta can be used to overwrite attributes defined in a preset. For example, using the `github` preset,
	 * user can add i18n translation for the title per instance.
	 *
	 * ```js
	 * await unified().use(remarkParse).use(remarkTransformBlockquote, {
	 *   preset: 'github',
	 *   meta: true,
	 * })
	 * ```
	 *
	 * ```markdown
	 * > \[!INFO\] \`data-title="Thông tin"\`
	 * > "Thông tin" is Vietnamese for "Information"
	 * ```
	 */
	meta?: boolean;
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
	 * > \[!INFO\]
	 * > This is an info blockquote
	 *
	 * > \[!WARNING\]
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
	attributes?: Record<string, string | boolean>;
	/**
	 * additional processing to perform on matching node
	 */
	hooks?: {
		/**
		 * called after the blockquote node is matched and transformed with `tag` & `attributes` options
		 */
		post?: (args: {
			node: Blockquote;
			index: number | undefined;
			parent: Root | RootContent | undefined;
			tree: Root;
			meta?: {
				raw: string;
				attributes: MetaAttribute[];
			};
		}) => void;
	};
}

type MetaAttributeMerge = 'prepend' | 'append' | 'replace';
export interface MetaStringAttribute {
	type: 'string';
	name: string;
	value: string;
	/** how to merge the attribute into `hProperties`, if at all */
	merge?: MetaAttributeMerge;
}
export interface MetaBooleanAttribute {
	type: 'boolean';
	name: string;
	value: boolean;
	merge?: 'replace';
}
export type MetaAttribute = MetaStringAttribute | MetaBooleanAttribute;
