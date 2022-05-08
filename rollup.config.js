import url from 'postcss-url'
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy'
import html from '@rollup/plugin-html';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';

const preprocess = sveltePreprocess();
const production = !process.env.ROLLUP_WATCH;

export default [{
  input: 'src/treetop/main.ts',
  output: {
    file: 'dist/treetop.bundle.js',
    format: 'iife',
    name: 'treetop',
    sourcemap: !production
  },
  plugins: [
    svelte({
      emitCss: true,
      preprocess,
      compilerOptions: {
        dev: !production,
        css: false,
      }
    }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    typescript({ sourceMap: !production }),
    production && terser(),
    postcss({
      to: 'dist/treetop.bundle.css',
      extract: true,
      sourceMap: false,
      plugins: [
        url({
          url: 'copy',
          assetsPath: 'assets'
        }),
      ],
      use: [
        ['sass', {
          includePaths: [
            './src/theme',
            './node_modules'
          ]
        }]
      ]
    }),
    image(),
    html({
      fileName: 'treetop.html',
      title: 'Treetop'
    }),
  ],
}, {
  input: 'src/options/main.ts',
  output: {
    file: 'dist/options.bundle.js',
    format: 'iife',
    name: 'options',
    sourcemap: !production
  },
  plugins: [
    svelte({
      emitCss: true,
      preprocess,
      compilerOptions: {
        dev: !production,
        css: false,
      }
    }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    typescript({ sourceMap: !production }),
    production && terser(),
    postcss({
      extract: true,
      sourceMap: false
    }),
    html({
      fileName: 'options.html',
      title: 'Treetop Options'
    })
  ]
}, {
  input: 'src/welcome/main.ts',
  output: {
    file: 'dist/welcome.bundle.js',
    format: 'iife',
    name: 'welcome',
    sourcemap: !production
  },
  plugins: [
    svelte({
      emitCss: true,
      preprocess,
      compilerOptions: {
        dev: !production,
        css: false,
      }
    }),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    typescript({ sourceMap: !production }),
    production && terser(),
    postcss({
      extract: true,
      sourceMap: false
    }),
    image(),
    html({
      fileName: 'welcome.html',
      title: 'Treetop'
    })
  ]
}, {
  input: 'src/background_script/main.ts',
  output: {
    file: 'dist/background_script.bundle.js',
    format: 'iife',
    name: 'background_script',
    sourcemap: !production
  },
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({ sourceMap: !production }),
    production && terser(),
    copy({
      targets: [
        { src: '_locales', dest: 'dist/' },
        { src: 'attributions.txt', dest: 'dist/' },
        { src: 'src/manifest.json', dest: 'dist/' },
        { src: 'src/icons/generated/icons/*', dest: 'dist/icons' },
        { src: 'src/treetop/generated/*', dest: 'dist/' },
      ],
      verbose: true
    })
  ],
}];
