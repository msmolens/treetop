// @tsconfig/svelte
/// <reference types="svelte" />

// Module for SVG files.
// See https://webpack.js.org/guides/typescript/#importing-other-assets
declare module '*.svg' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any;
  export default content;
}
