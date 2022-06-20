module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.svelte$': [
      'svelte-jester',
      {
        'preprocess': true,
      }
    ],
    '^.+\\.ts$': 'ts-jest',
    "^.+\\.(js|jsx)$": 'babel-jest'
  },
  // Allow transpiling specific modules.
  // https://jestjs.io/docs/en/configuration#transformignorepatterns-arraystring
  transformIgnorePatterns: [
    "node_modules/(?!(@smui|chalk|lodash-es)/)"
  ],
  moduleFileExtensions: [
    'js',
    'ts',
    'svelte',
  ],
  moduleNameMapper: {
    '^@Treetop/(.*)$': '<rootDir>/src/$1',
    // Fix syntax error when testing components that use SMUI.
    // https://github.com/facebook/jest/issues/6229
    // https://stackoverflow.com/questions/60622265/unable-to-use-jest-to-test-svelte-components-which-import-scss-from-inside-node
    '^.+\\.(css|less|scss)$': '<rootdir>/__mocks__/styleMock.js',
    '^.+\\.svg$': '<rootDir>/__mocks__/fileMock.js',

    // Work around errors like the following when running tests:
    //
    //     Cannot find module '#ansi-styles' from 'node_modules/chalk/source/index.js
    //
    // See https://github.com/facebook/jest/issues/12270.
    "#ansi-styles": "<rootDir>/node_modules/chalk/source/vendor/ansi-styles/index.js",
    "#supports-color": "<rootDir>/node_modules/chalk/source/vendor/supports-color/index.js",
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx,svelte}',
    '!src/types/**',
    '!**/node_modules/**',
  ],
  coverageProvider: 'v8',
};
