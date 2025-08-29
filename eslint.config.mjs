// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import next from '@next/eslint-plugin-next'

export default [
  { ignores: ['.next/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,          // rápido, sin type-check pesado
  next.configs['core-web-vitals'],
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@next/next/no-img-element': 'warn'
    }
  }
]
