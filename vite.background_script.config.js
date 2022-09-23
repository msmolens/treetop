import { resolve } from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
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
});
