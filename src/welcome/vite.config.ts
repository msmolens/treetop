import { resolve } from 'path';
import { type ViteUserConfig, defineProject, mergeConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { developmentConfig } from '../../vite.common-development.config.js';
import { getTreetopDistName } from '../../vite.common.config.js';

const dist = getTreetopDistName();

// https://vitejs.dev/config/
export default defineProject(({ mode }) => {
  const commonConfig: ViteUserConfig = {
    plugins: [tsconfigPaths(), svelte(), svelteTesting()],
    build: {
      outDir: resolve(__dirname, '../../', dist),
      rollupOptions: {
        input: resolve(__dirname, './welcome.html'),
      },
    },
    test: {
      environment: 'jsdom',
      restoreMocks: true,
      setupFiles: ['../../test/vitest-setup.ts'],
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
