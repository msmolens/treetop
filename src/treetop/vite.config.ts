import merge from 'lodash/merge';
import { resolve } from 'path';
import { type UserConfig, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import copy from 'rollup-plugin-copy';
import sveltePreprocess from 'svelte-preprocess';
import tsconfigPaths from 'vite-tsconfig-paths';
import { developmentConfig } from '../../vite.common-development.config.js';
import { getTreetopDistName } from '../../vite.common.config.js';

const dist = getTreetopDistName();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const commonConfig: UserConfig = {
    plugins: [
      copy({
        targets: [
          { src: '_locales', dest: `${dist}/` },
          { src: 'attributions.txt', dest: `${dist}/` },
          { src: 'src/icons/generated/icons/*', dest: `${dist}/icons` },
          { src: 'src/treetop/generated/*', dest: `${dist}/` },
        ],
        verbose: true,
      }),
      tsconfigPaths(),
      svelte({
        preprocess: sveltePreprocess(),
      }),
    ],
    build: {
      outDir: resolve(__dirname, '../../', dist),
      rollupOptions: {
        input: resolve(__dirname, './treetop.html'),
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
  };

  return merge(commonConfig, mode === 'development' && developmentConfig);
});
