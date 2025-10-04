import merge from 'lodash/merge';
import { resolve } from 'path';
import { type UserConfig, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { developmentConfig } from '../../vite.common-development.config.js';
import { getTreetopDistName } from '../../vite.common.config.js';

const dist = getTreetopDistName();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const commonConfig: UserConfig = {
    plugins: [tsconfigPaths(), svelte(), svelteTesting()],
    build: {
      lib: {
        entry: 'main.ts',
        name: 'background_script',
        fileName: () => 'background_script.js',
        formats: ['es'],
      },
      outDir: resolve(__dirname, '../../', dist),
    },
    test: {
      restoreMocks: true,
      setupFiles: ['../../test/mock-chrome-api.ts'],
    },
  };

  return merge(commonConfig, mode === 'development' && developmentConfig);
});
