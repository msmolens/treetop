import { resolve } from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

// https://vitejs.dev/config/
export default defineConfig({
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
});
