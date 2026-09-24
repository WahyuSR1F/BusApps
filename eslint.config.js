import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // api/index.js adalah bundle hasil `npm run build:api` (generated),
  // sama seperti dist — jangan dilint.
  globalIgnores(['dist', 'api/index.js']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Komponen shadcn/ui lazim mengekspor helper bersama (variants, FormProvider,
    // dll) dari file komponen — bukan pelanggaran fast-refresh yang perlu dipecah.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // File provider tRPC lazim mengekspor instance `trpc` bersama komponen
    // Provider — konsekuensi hanya full reload saat HMR, bukan bug.
    files: ['src/providers/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['server/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
])
