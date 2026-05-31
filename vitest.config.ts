import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// Vitest config kept separate from vite.config.ts so the build config stays
// free of test concerns. Reuses the React plugin (JSX transform) and
// vite-tsconfig-paths (the `@/*` alias) so tests import exactly as the app does.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
