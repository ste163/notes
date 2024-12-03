import globals from 'globals'
import js from '@eslint/js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import testingLibrary from 'eslint-plugin-testing-library'
import { FlatCompat } from '@eslint/eslintrc'

// TODO:
// - reimplement each piece with the TSconfig first
// - remove the compat piece as it won't be needed.
// - will then hopefully be able to remove globals

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: [
      '**/node_modules/**/*',
      'dist/*',
      'dbdata/*',
      '.github/*',
      'src-tauri/*',
      '**/*.yaml',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'prettier/recommended': prettierRecommended,
      'testing-library': testingLibrary,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      'no-prototype-builtins': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  ...compat.extends('plugin:testing-library/dom').map((config) => ({
    ...config,
    files: ['**/*.spec.ts'],
  })),
  {
    files: ['**/*.spec.ts'],
    rules: {
      'testing-library/prefer-screen-queries': 'off',
    },
  },
]
