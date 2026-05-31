import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

// Flat config (ESLint 10 + typescript-eslint 8). Lints only the migrated
// TypeScript surface; the prototype `.jsx`/`.js` files in src/ and everything
// under legacy/ remain quarantined (ADR-006) and are ignored.
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'legacy/**',
      'scraps/**',
      'screenshots/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      // Prototype quarantine still on disk (unbundled). Lint TS only —
      // every src/*.js / *.jsx is legacy (data.js, screens/recipe-defs.js, …).
      '**/*.jsx',
      'src/**/*.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2022 },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // TypeScript already resolves identifiers; core no-undef double-reports.
      'no-undef': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // `_`-prefixed args are intentional (matches tsconfig noUnusedParameters).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Don't block on `any` in the prototype-port code; surface as a warning.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Node-context files: build/test config + scripts.
  {
    files: ['scripts/**/*.{mjs,js}', '*.config.{ts,js,mjs}', 'vitest.config.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  // Router modules co-locate the route table (a non-component export) with the
  // lazy() component handles; react-refresh's component-only rule is about HMR
  // of component files and doesn't apply here.
  {
    files: ['src/router/**/*.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  // Vitest test files use injected globals (config has `globals: true`).
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
  prettier,
);
