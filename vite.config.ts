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
    fs: {
      // Deny direct dev-server access to the prototype quarantine, design
      // scraps, and any internal tooling/docs that happen to live in the
      // repo. The production bundle never includes these (verified — the
      // dist/assets/*.js bundle has 0 PP_DATA / PPUI / PPIcon symbols), but
      // Vite's dev server otherwise serves any file under the project root
      // by direct URL. Legacy src/*.jsx prototype modules are intentionally
      // left servable: they are converted in-place during Phases 2–4 and a
      // path-by-path deny list would rot as files get deleted.
      deny: [
        // Vite's fs.deny uses picomatch. Single-segment basenames match
        // anywhere, but for whole-directory bans we need `**/<dir>/**` so
        // every descendant matches regardless of nesting.
        '**/legacy/**',
        '**/scraps/**',
        '**/.claude/**',
        'CLAUDE.md',
        'STATUS.md',
        'PROJECT_LOG.md',
      ],
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
