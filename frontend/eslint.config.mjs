// Minimal ESLint flat config for frontend
// Uses TypeScript parser so TS/TSX files can be linted without extra rules.

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {},
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
