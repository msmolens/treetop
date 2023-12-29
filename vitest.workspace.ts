import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'src/background_script/vite.config.ts',
  'src/options/vite.config.ts',
  'src/treetop/vite.config.ts',
  'src/welcome/vite.config.ts',
]);
