// Copyright (c) Quang Phan. All rights reserved. Licensed under the MIT license.

export * from "./plugin.js";
export * from "./types.public.js";
export { ErrorInvalidPreset } from './errors.js';

import { remarkTransformBlockquote } from "./plugin.js";
export default remarkTransformBlockquote;
