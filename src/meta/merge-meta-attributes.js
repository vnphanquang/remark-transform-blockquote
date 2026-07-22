/* eslint-disable jsdoc/reject-any-type */

/**
 * @typedef MergeMetaAttributesOptions
 * @property {Record<string, import('../types.public').MetaAttribute>} attributes - the meta attributes to merge
 * @property {Record<string, any>} into - the object to merge the attributes into
 * @property {boolean} [inplace=false] - whether to modify the object in place or return a new object
 * @property {boolean} [mergeClassToClassName=true] - whether to merge the `class` attribute into `className` (recommended when working with `data.hProperties`)
 */

/**
 * merge meta attributes into some object, typically `node.data.hProperties`
 * @param {MergeMetaAttributesOptions} options - configure where and how to merge
 * @returns {Record<string, any>} - the object with the merged attributes
 */
export function mergeMetaAttributes(options) {
	const { attributes, into, inplace = false, mergeClassToClassName = true } = options;
	const ref = inplace ? into : { ...into };
	const aAttributes = Object.values(attributes);
	if (!aAttributes.length) return ref;
	for (const attribute of aAttributes) {
		if (!attribute.merge) continue;
		if (attribute.type === 'boolean') {
			if (attribute.value) {
				ref[attribute.name] = true;
			} else {
				delete ref[attribute.name];
			}
		} else {
			const { name, value, merge } = attribute;
			if (merge === 'append') {
				ref[name] = `${ref[name] ?? ''}${value}`;
			} else if (merge === 'prepend') {
				ref[name] = `${value}${ref[name] ?? ''}`;
			} else {
				ref[name] = value;
			}
		}
	}

	if (mergeClassToClassName && 'class' in ref) {
		ref.className = ref.className ? `${ref.className} ${ref.class}` : ref.class;
		delete ref.class;
	}
	return ref;
}
