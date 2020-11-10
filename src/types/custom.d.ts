/* eslint-disable @typescript-eslint/no-explicit-any */

// Module for SVG files.
// See https://webpack.js.org/guides/typescript/#importing-other-assets
declare module '*.svg' {
  const content: any;
  export default content;
}
