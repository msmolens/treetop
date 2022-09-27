import { merge } from 'lodash';
import { resolve } from 'path';
import { UserConfig, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { developmentConfig } from './vite.common-development.config.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  /** @type {UserConfig} */
  const commonConfig = {
    plugins: [svelte()],
    root: resolve(__dirname, 'src/background_script'),
    build: {
      lib: {
        entry: 'main.ts',
        name: 'background_script',
        fileName: () => 'background_script.js',
        formats: ['es'],
      },
      outDir: resolve(__dirname, 'dist'),
    },
  };

  return merge(commonConfig, mode === 'development' && developmentConfig);
});
