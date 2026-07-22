# Changelog

## 1.2.2

### Patch Changes

- [`f0529ff`](https://github.com/vnphanquang/remark-transform-blockquote/commit/f0529ffbc3b2b301879b20aad4ec501a2e37725e) Thanks [@vnphanquang](https://github.com/vnphanquang)! - merge class -> className to keep consistent with mdast/hast convention, avoid multiple class attributes set on end HTML node

- [`20a11c6`](https://github.com/vnphanquang/remark-transform-blockquote/commit/20a11c67ee297bf4bee178697a8e0b37eca4f4a9) Thanks [@vnphanquang](https://github.com/vnphanquang)! - export `RemarkTransformBlockquoteHookPost` type

## 1.2.1

### Patch Changes

- [`9e8dc0a`](https://github.com/vnphanquang/remark-transform-blockquote/commit/9e8dc0aa27b25ac2fd260b19706bf2af657de2f5) Thanks [@vnphanquang](https://github.com/vnphanquang)! - [BREAKING] `options.mapping.hooks.post` now accept the `meta` in params as `Record<string, MetaAttribute>` instead of array

- [`9e8dc0a`](https://github.com/vnphanquang/remark-transform-blockquote/commit/9e8dc0aa27b25ac2fd260b19706bf2af657de2f5) Thanks [@vnphanquang](https://github.com/vnphanquang)! - [BREAKING] `utils` submodule is now `meta`

- [`9e8dc0a`](https://github.com/vnphanquang/remark-transform-blockquote/commit/9e8dc0aa27b25ac2fd260b19706bf2af657de2f5) Thanks [@vnphanquang](https://github.com/vnphanquang)! - export `mergeMetaAttributes` utility in `meta` submodule

## 1.2.0

### Minor Changes

- [`88f2942`](https://github.com/vnphanquang/remark-transform-blockquote/commit/88f2942a86fc05af8eeba82328bff78f68106ad6) Thanks [@vnphanquang](https://github.com/vnphanquang)! - export utils module

## 1.1.1

### Patch Changes

- [`37403a5`](https://github.com/vnphanquang/remark-transform-blockquote/commit/37403a5d48356fa73fdf5cf1592c8f05069db98e) Thanks [@vnphanquang](https://github.com/vnphanquang)! - [BREAKING] use `#` instead of `!` prefix to indicate no merge

## 1.1.0

### Minor Changes

- [`28f8f88`](https://github.com/vnphanquang/remark-transform-blockquote/commit/28f8f88a381b4c400c7c967403c0a7141dd20f4e) Thanks [@vnphanquang](https://github.com/vnphanquang)! - allow passing (replacing, appending, prepending) attributes via a meta string, e.g. ``[!CUSTOM] `$class=' added'` ``

### Patch Changes

- [`28f8f88`](https://github.com/vnphanquang/remark-transform-blockquote/commit/28f8f88a381b4c400c7c967403c0a7141dd20f4e) Thanks [@vnphanquang](https://github.com/vnphanquang)! - [BREAKING] args to `options.mappings.hooks.post` is now properties of one single object instead of multiple positional params

- [`a14e671`](https://github.com/vnphanquang/remark-transform-blockquote/commit/a14e6718e36fd5ffc97da0ab58b636a6f31de25c) Thanks [@vnphanquang](https://github.com/vnphanquang)! - set `options.mappings.attribute` to optional

## 1.0.1

### Patch Changes

- [`aad8f4d`](https://github.com/vnphanquang/remark-transform-blockquote/commit/aad8f4d13cf82063de06aab7bfe5062642cb35f5) Thanks [@vnphanquang](https://github.com/vnphanquang)! - correct `homepage` field in `package.json`
