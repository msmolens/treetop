module.exports = {
  env: {
    es6: true,
    browser: true,
    webextensions: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    'ecmaVersion': 9,
    'sourceType': 'module',
    'tsconfigRootDir': __dirname,
    'project': './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended'
  ],
  plugins: [
    '@typescript-eslint',
    'simple-import-sort',
    'svelte3',
    'prettier'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // Configuration based on https://github.com/lydell/eslint-plugin-simple-import-sort/blob/7b29c07/examples/.eslintrc.js#L71-L89
          // Packages.
          ["^svelte", "^@?\\w"],
          // Internal packages.
          ["^(@Treetop)(/.*|$)"],
          // Side effect imports.
          ["^\\u0000"],
          // Parent imports. Put `..` last.
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          // Other relative imports. Put same-folder imports and `.` last.
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          // Style imports.
          ["^.+\\.s?css$"],
        ]
      }
    ],
    'simple-import-sort/exports': 'error',
    'prettier/prettier': 'error'
  }
};
