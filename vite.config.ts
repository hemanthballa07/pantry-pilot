import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    // Prefer .tsx/.ts over .jsx/.js so that during the Phase 2–4 migration —
    // when newly-converted Foo.tsx coexists with the legacy foo.jsx on
    // macOS's case-insensitive APFS — imports resolve to the TS version.
    extensions: ['.tsx', '.ts', '.mjs', '.mts', '.jsx', '.js', '.json'],
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
