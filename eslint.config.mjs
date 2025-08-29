import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";

const compat = new FlatCompat({ baseDirectory: path.resolve() });

export default [
  // Ignorar build y deps
  { ignores: ["node_modules/**", ".next/**"] },

  // Reglas base JS
  js.configs.recommended,

  // Reglas TS sin type-check (rápidas)
  ...tseslint.configs.recommended,

  // Reglas Next (equivale a "extends: ['next', 'next/core-web-vitals']")
  ...compat.extends("next", "next/core-web-vitals")
];
