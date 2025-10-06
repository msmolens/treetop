import { resolve } from 'path';
import { type ViteUserConfig, defineProject, mergeConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltePreprocess } from 'svelte-preprocess';
import tsconfigPaths from 'vite-tsconfig-paths';
import { developmentConfig } from '../../vite.common-development.config.js';
import { getTreetopDistName } from '../../vite.common.config.js';

const dist = getTreetopDistName();

// https://vitejs.dev/config/
export default defineProject(({ mode }) => {
  const commonConfig: ViteUserConfig = {
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
        input: resolve(__dirname, './options.html'),
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
      setupFiles: [
        '../../test/mock-chrome-api.ts',
        '../../test/vitest-setup.ts',
      ],
    },
    cacheDir: process.env.VITEST
      ? resolve(__dirname, '../../', '.vitest')
      : undefined,
  };

  return mergeConfig(
    commonConfig,
    mode === 'development' ? developmentConfig : {},
  );
});
