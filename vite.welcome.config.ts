import merge from 'lodash/merge';
import { resolve } from 'path';
import { UserConfig, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { developmentConfig } from './vite.common-development.config.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const commonConfig: UserConfig = {
    plugins: [
      svelte({
        preprocess: sveltePreprocess(),
      }),
    ],
    root: resolve(__dirname, 'src/welcome'),
    build: {
      outDir: resolve(__dirname, 'dist'),
      rollupOptions: {
        input: resolve(__dirname, 'src/welcome/welcome.html'),
      },
    },
  };

  return merge(commonConfig, mode === 'development' && developmentConfig);
});
