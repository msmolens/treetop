// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import svelte from 'eslint-plugin-svelte';
import svelteConfig from './svelte.config.js';
import ts from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  ...svelte.configs.recommended,
  ...svelte.configs.prettier,
  globalIgnores([
    'bin/',
    'dist/',
    'coverage/',
    'eslint.config.js',
    'svelte.config.js',
    '**/vite.*.ts',
  ]),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^svelte', '^@?\\w'],
            ['^(@Treetop)(/.*|$)'],
            ['^\\u0000'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$'],
          ],
        },
      ],

      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
);
