// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import next from '@next/eslint-plugin-next';

export default [
  // Ignora artefactos de build
  { ignores: ['.next/**', 'node_modules/**'] },

  // Reglas base JS
  js.configs.recommended,

  // Reglas TS sin type-check (rápidas)
  ...tseslint.configs.recommended,

  // Reglas de Next (Core Web Vitals)
  next.configs['core-web-vitals'],
];
