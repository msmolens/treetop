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
  // Allow transpiling SMUI modules.
  // https://jestjs.io/docs/en/configuration#transformignorepatterns-arraystring
  transformIgnorePatterns: [
    "node_modules/(?!(@smui)/)"
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
    '^.+\\.(css|less|scss)$': 'babel-jest',
    '^.+\\.svg$': 'babel-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect', './src/setupTests.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx,svelte}',
    '!src/types/**',
    '!**/node_modules/**',
  ],
};
