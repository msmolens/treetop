import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'src/background_script',
      'src/options',
      'src/treetop',
      'src/welcome',
    ],
  },
});
