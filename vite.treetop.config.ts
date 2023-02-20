import merge from 'lodash/merge';
import { resolve } from 'path';
import { UserConfig, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import copy from 'rollup-plugin-copy';
import sveltePreprocess from 'svelte-preprocess';
import tsconfigPaths from 'vite-tsconfig-paths';
import { developmentConfig } from './vite.common-development.config.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const commonConfig: UserConfig = {
    plugins: [
      copy({
        targets: [
          { src: '_locales', dest: 'dist/' },
          { src: 'attributions.txt', dest: 'dist/' },
          { src: 'src/manifest.json', dest: 'dist/' },
          { src: 'src/icons/generated/icons/*', dest: 'dist/icons' },
          { src: 'src/treetop/generated/*', dest: 'dist/' },
        ],
        verbose: true,
      }),
      svelte({
        preprocess: sveltePreprocess(),
      }),
      tsconfigPaths({
        root: __dirname,
      }),
    ],
    root: resolve(__dirname, 'src/treetop'),
    build: {
      outDir: resolve(__dirname, 'dist'),
      rollupOptions: {
        input: resolve(__dirname, 'src/treetop/treetop.html'),
      },
    },
  };

  return merge(commonConfig, mode === 'development' && developmentConfig);
});
