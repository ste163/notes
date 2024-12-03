import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import testingLibrary from 'eslint-plugin-testing-library'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  eslintConfigPrettier,
  prettierRecommended,
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
  {
    rules: {
      'no-prototype-builtins': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    ...testingLibrary.configs['flat/dom'],
    rules: {
      'testing-library/prefer-screen-queries': 'off',
    },
  }
)
