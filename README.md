# remark-transform-blockquote

turn a blockquote with special marker into a customisable element, similar but not limited to [Github Markdown Alerts][gfm.alert]

[![MIT][license.badge]][license] [![npm.badge]][npm] [![codecov][codecov.badge]][codecov]

## Installation

```bash
pnpm add -D remark-transform-blockquote # or via npm, yarn, ...
```

## Usage

This code...

```typescript
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkTransformBlockquote from 'remark-transform-blockquote';

const output = await unified()
	.use(remarkParse)
	.use(remarkTransformBlockquote, {
		mappings: [
			{
				marker: '!CUSTOM',
				tag: 'section',
				attributes: { class: 'custom-block' },
			},
		],
	})
	.use(remarkRehype)
	.use(rehypeStringify)
	.process('...');
```

will transform the following input...

```markdown
> [!CUSTOM]
> This will be a custom block.
```

...to this output:

```html
<section class="custom-block">
	<p>This will be a custom block.</p>
</section>
```

## Presets

The package allows some presets for common use cases.

1. Specify preset:

   ```typescript
   const output = await unified()
   	.use(remarkParse)
   	.use(remarkTransformBlockquote, { preset: '<preset>' });
   ```

2. Import CSS

   ```css
   @import 'remark-transform-blockquote/presets/<preset>.css';
   ```

Where `<preset>` is listed in the following sections.

> [!NOTE]
> You may provide additional `mappings` that will take precedence over the preset's mappings.
> Be aware that only the first mapping that matches is applied.

### Preset: `github`

Alerts that matches [Github Markdown Alerts][gfm.alert].

![Screenshot of "github" preset](https://raw.githubusercontent.com/vnphanquang/remark-transform-blockquote/main/.github/assets/preset-github.jpg)

Input:

```markdown
> [!<VARIANT>]
> ...
```

Output:

```html
<div class="markdown-alert markdown-alert-<variant>" data-title="<Variant>">...</div>
```

Where `<VARIANT>` is one of `{NOTE, TIP, IMPORTANT, WARNING, CAUTION}`.

#### CSS Custom Properties

| CSS Variable                      | Description                              | Fallback |
| --------------------------------- | ---------------------------------------- | -------- |
| `--alert-padding-block`           | [padding-inline] of container            | `1rem`   |
| `--alert-padding-inline`          | [padding-block] of container             | `0.5rem` |
| `--alert-margin-block-end`        | [margin-block-end] of container          | `1rem`   |
| `--alert-border-width`            | [border-inline-start-width] of container | `0.25em` |
| `--alert-icon-size`               | `width` & `height` of the icon           | `1rem`   |
| `--alert-header-margin-block-end` | [margin-block-end] of the title and icon | `1rem`   |
| `--alert-title-font-weight`       | `color` of the title                     | `500`    |

Modifier variables (changed per variant):

| CSS Variable           | Description                              | Fallback       | Set to                           |
| ---------------------- | ---------------------------------------- | -------------- | -------------------------------- |
| `--alert-border-color` | [border-inline-start-color] of container | `currentcolor` | `--alert-<variant>-border-color` |
| `--alert-header-color` | `color` of the title and icon            | `currentcolor` | `--alert-<variant>-header-color` |
| `--alert-icon`         | an url-encoded SVG                       |                | `--alert-<variant>-icon`         |

See [presets/github.css](https://github.com/vnphanquang/remark-transform-blockquote/blob/main/src/presets/github/github.css) for more information.

> [!NOTE]
> The color variables use CSS new [light-dark] function for minimal light/dark mode support.

To provide customisation, set the CSS variables where appropriate, e.g.

```css
/* my-design-system.css */
:root {
	--alert-icon-size: 1.25rem;
	--alert-note-icon: url('...');
	--alert-success-border-color: green;
	--alert-success-header-color: darkgreen;
	/* ... */
}
```

#### Icons

SVG icons are also available should you need to reference / use them. For example:

```javascript
// assuming vite or some bundler that supports importing SVG.
import svg from 'remark-transform-blockquote/presets/github/icons/note.svg'; // replace with <variant>.svg as needed
```

### Preset: `comeau`

Sidenotes based on [Josh Comeau's Blog](https://www.joshwcomeau.com/blog/how-i-built-my-blog-v2/).

![Screenshot of "comeau" preset](https://raw.githubusercontent.com/vnphanquang/remark-transform-blockquote/main/.github/assets/preset-comeau.jpg)

Input:

```markdown
> [!<VARIANT>]
> ...
```

Output:

```html
<aside class="md-sidenote md-sidenote-<variant>">
	<div class="md-sidenote-decoration"></div>
	...
</aside>
```

Where `<VARIANT>` is one of `{INFO, SUCCESS, WARNING}`.

#### CSS Custom Properties

| CSS Variable                    | Description                       | Fallback |
| ------------------------------- | --------------------------------- | -------- |
| `--sidenote-margin-block-start` | [margin-block-start] of container | 2rem     |
| `--sidenote-margin-block-end`   | [margin-block-end] of container   | 4rem     |
| `--sidenote-padding-block`      | [padding-block] of container      | 1.5rem   |

Modifier variables (changed per variant):

| CSS Variable                  | Description                   | Set to                                |
| ----------------------------- | ----------------------------- | ------------------------------------- |
| `--sidenote-icon`             | an 32x32 url-encoded SVG      | `--sidenote-<variant>-icon`           |
| `--sidenote-decoration-color` | color for icon & left border  | `sidenote-<variant>-decoration-color` |
| `--sidenote-background-color` | background color of container | `sidenote-<variant>-background-color` |

> [!NOTE]
> The color variables use CSS new [light-dark] function for minimal light/dark mode support.

Responsive variables:

| CSS Variable                | Description                           | Fallback | Fallback (>= 35.1875rem) |
| --------------------------- | ------------------------------------- | -------- | ------------------------ |
| `--sidenote-padding-inline` | [padding-inline] of container         | 1rem     | 2rem                     |
| `--sidenote-margin-inline`  | negative [margin-inline] of container | 1rem     | 2rem                     |

When you provide custom value for responsive variables, make sure to set them at each breakpoint, e.g.

```css
:root {
	--sidenote-padding-inline: 0.5rem;
	--sidenote-margin-inline: 0.5rem;

	@media (width >= 35.1875rem) {
		--sidenote-padding-inline: 1rem;
		--sidenote-margin-inline: 1rem;
	}
}
```

See [presets/comeau.css](https://github.com/vnphanquang/remark-transform-blockquote/blob/main/src/presets/comeau/comeau.css) for more information.

> [!NOTE]
> For simplicity, this preset does not include some enhancements that Josh has for his component,
> for example `:selection` color or contextual colors for codeblocks within.

#### Icons

SVG icons are also available should you need to reference / use them. For example:

```javascript
// assuming vite or some bundler that supports importing SVG.
import svg from 'remark-transform-blockquote/presets/comeau/icons/info.svg'; // replace with <variant>.svg as needed
```

## Per-Transformation Attributes via Meta String

Sometimes it is helpful to allow users to customise the final HTML attribute per transformed element.
For this, turn on the `meta` option. For example, using [preset:github](#preset-github)...

```typescript
unified.use(remarkTransformBlockquote, {
	preset: 'github',
	meta: true,
});
```

...user can provide i18n translation for the title:

```markdown
> [!NOTE] `data-title="Thông tin"`
> "Thông tin" is Vietnamese for "Information"
```

### Meta String

The meta string is an inline code, i.e. `\`...\``, that follows immediately after the marker.
Inside, it can contain key-value pairs for string attribute, or standalone strings that will be
understood as boolean attributes. Some example:

- Simple string attribute, no space: `[!MARKER] \`attr=value\``
- For string attribute with single quote in value, wrap in double quote: `[!MARKER] \`attr="value with 'single' quote"\``
- For string attribute with double quote in value, wrap in single quote: `[!MARKER] \`attr='value with "double" quote'\``
- Boolean attributes, implicitly `true`: `[!MARKER] \`attr\``
- Boolean attributes with explicit value: `[!MARKER] \`attr=true attr=false\`

### Merging Strategy via Prefixes

By default, parsed attributes from meta string will replace existing attributes with the same name in `node.data.hProperties`. This can be changed by providing a `prefix` to the attribute name:

- `^`: prepend the value to existing attribute value, e.g. \`^class=" prepend"\,
- `$`: append the value to existing attribute value, e.g. \`$class="append "\`,
- `!`: parsed but skip merging, useful if you want to do some post-processing with [hooks](#complex-transformation), e.g. \`!attr="internal"\`.

Note that, on boolean attributes, `^` and `$` can be used but have no effect. Also, remember to
consider adding space when prepending / appending attribute values.

## Complex Transformation

Should you need to do more than just change tag name / attributes, you can specify a `post` hook

```typescript
unified.use(remarkTransformBlockquote, {
	mappings: [
		{
			marker: '!CUSTOM',
			tag: 'section',
			attributes: { class: 'custom-block' },
			hooks: {
				post: ({ node, index, parent, tree, meta }) => {
					// do something with node, e.g. adding child, changing content, etc.
				},
			},
		},
	],
});
```

## Related Projects / Prior Arts

- [montogeek/remark-custom-blockquotes](https://github.com/montogeek/remark-custom-blockquotes)
- [jaywcjlove/remark-github-blockquote-alert](https://github.com/jaywcjlove/remark-github-blockquote-alert)
- [nylonbricks/remark-blockquote-alerts](https://github.com/nylonbricks/remark-blockquote-alerts)
- [lin-stephanie/remark-admonition-to-blockquote-callout](https://github.com/lin-stephanie/remark-admonition-to-blockquote-callout)
- [incentro-ecx/remark-github-admonitions-to-directives](https://github.com/incentro-ecx/remark-github-admonitions-to-directives)

## CONTRIBUTING

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## More `unified` Plugins by Me

- [remark-codeblock-source](https://github.com/vnphanquang/remark-codeblock-source)
- [remark-enhance-codeblock](https://github.com/vnphanquang/remark-enhance-codeblock)

---

[built by me, not agents](https://gist.github.com/vnphanquang/018ee2b2080c9dc9890327f3d233998b).

[gfm.alert]: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts

<!-- header badges -->

[license.badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[npm.badge]: https://img.shields.io/npm/v/remark-transform-blockquote
[npm]: https://www.npmjs.com/package/remark-transform-blockquote
[codecov]: https://codecov.io/github/vnphanquang/remark-transform-blockquote
[codecov.badge]: https://codecov.io/github/vnphanquang/remark-transform-blockquote/graph/badge.svg?token=dKkYUy4evr
[padding-inline]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/padding-inline
[padding-block]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/padding-block
[margin-block-start]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/margin-block-start
[margin-block-end]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/margin-block-end
[margin-inlin]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/margin-inlin
[border-inline-start-width]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-inline-start-width
[border-inline-start-color]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-inline-start-color
[light-dark]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark
