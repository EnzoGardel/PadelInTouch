import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import next from '@next/eslint-plugin-next';

const compat = new FlatCompat({ baseDirectory: path.resolve() });

export default [
  // Reglas Next (core web vitals)
  next.configs['core-web-vitals'],

  // Reglas base JS
  js.configs.recommended,

  // Reglas TS sin type-check (rápidas)
  ...tseslint.configs.recommended,

  // Reglas Next (equivale a "extends: ['next', 'next/core-web-vitals']")
  ...compat.extends("next", "next/core-web-vitals")
];
