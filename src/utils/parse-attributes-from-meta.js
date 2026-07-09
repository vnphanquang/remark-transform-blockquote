/**
 * @param {string} meta - the meta string to parse
 * @returns {import('../types.public').MetaAttribute[]} - a record of attributes parsed from the meta string
 */
export function parseAttributesFromMeta(meta) {
	if (!meta) return [];

	/** @type {Record<string, import('../types.public').MetaAttribute>} */
	const attributes = {};
	const matches = meta.matchAll(/([\^$!]?)([\w-]+)(?:=(\w+)|="([^"]+)"|='([^']+)')?/g);
	for (const match of matches) {
		const [, prefix, name, valueNoQuote, valueInDoubleQuote, valueInSingleQuote] = match;
		const value = valueNoQuote || valueInDoubleQuote || valueInSingleQuote;
		if (value && value !== 'false' && value !== 'true') {
			attributes[name] = {
				type: 'string',
				name,
				value,
			};
			if (!prefix) {
				attributes[name].merge = 'replace';
			} else if (prefix === '^') {
				attributes[name].merge = 'prepend';
			} else if (prefix === '$') {
				attributes[name].merge = 'append';
			}
		} else {
			attributes[name] = {
				type: 'boolean',
				name,
				value: value === 'false' ? false : true,
			};
			if (!prefix || prefix === '^' || prefix === '$') {
				attributes[name].merge = 'replace';
			}
		}
	}
	return Object.values(attributes);
}
