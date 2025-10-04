import merge from 'lodash/merge';
import { resolve } from 'path';
import { type UserConfig, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltePreprocess } from 'svelte-preprocess';
import tsconfigPaths from 'vite-tsconfig-paths';
import { developmentConfig } from '../../vite.common-development.config.js';
import { getTreetopDistName } from '../../vite.common.config.js';

const dist = getTreetopDistName();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const commonConfig: UserConfig = {
    plugins: [
      tsconfigPaths(),
      svelte({
        preprocess: sveltePreprocess(),
      }),
      svelteTesting(),
    ],
    build: {
      outDir: resolve(__dirname, '../../', dist),
      rollupOptions: {
        input: resolve(__dirname, './welcome.html'),
      },
    },
    test: {
      // Work around onMount not being called when running tests
      // https://github.com/vitest-dev/vitest/issues/2834#issuecomment-1439576110
      alias: [
        {
          find: /^svelte$/,
          replacement: 'svelte/internal',
        },
      ],
      environment: 'jsdom',
      restoreMocks: true,
      setupFiles: ['../../test/vitest-setup.ts'],
    },
  };

  return merge(commonConfig, mode === 'development' && developmentConfig);
});
