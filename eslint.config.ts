import tseslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';
export default [
  {
    files: ['**/*.ts'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    rules: {
      ...prettier.rules,
    },
  },
];