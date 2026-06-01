# Pantry Pilot

A smart-kitchen command center — an AI assistant that watches your pantry, expiry dates, budget, and habits, and proactively helps you cook what you have, waste less, and shop smarter.

**[Live demo ↗](https://project-33nu9.vercel.app)** &nbsp;·&nbsp; [![CI](https://github.com/hemanthballa07/pantry-pilot/actions/workflows/ci.yml/badge.svg)](https://github.com/hemanthballa07/pantry-pilot/actions/workflows/ci.yml)

> **Stage:** Phase 5 complete — live on Vercel. Vite + React 18 + TypeScript (strict), React Router v7, Zustand. All 11 screens are native TypeScript; the original prototype is quarantined under `legacy/`.

## Quickstart

```bash
npm install
npm run dev      # Vite dev server at http://127.0.0.1:5173
```

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` (route-split chunks) |
| `npm run preview` | Serve the built bundle |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (flat config) |
| `npm test` | Vitest unit/component tests |
| `npm run e2e` | Playwright end-to-end route tests |
| `npm run build:check` | Build + bundle-size budget guard (≤500 kB raw / ≤150 kB gzip initial JS) |
| `npm run format` / `format:check` | Prettier write / check |

## What's inside

- `src/main.tsx` → `src/App.tsx` → `src/router/` — `createBrowserRouter`, `RootLayout`, `ShellLayout` (Sidebar + TopBar)
- `src/screens/*.tsx` — the 11 route screens (lazy-loaded)
- `src/components/`, `src/stores/` (Zustand: toast / nav / search), `src/data/` (typed mock), `src/types/`
- `src/styles.css` — design tokens (~70 CSS custom properties + dark theme)
- `legacy/` — original Babel-standalone prototype (reference only, not built)

## CI & deploy

- **CI** (`.github/workflows/ci.yml`): on every push to `main` and every PR, GitHub Actions runs `typecheck`, `lint`, `test`, `build:check`, and `e2e` on Node 22.
- **Deploy** (Vercel): connected via Vercel's Git integration — each PR gets a preview URL, and `main` deploys to production. `vercel.json` sets the build/output and an SPA rewrite so client-side routes (e.g. `/cook`) resolve on deep-link and refresh.

## Roadmap

| Phase | Scope | |
|-------|-------|---|
| 0–4 | Docs → Vite/TS scaffold → typed data → UI modules → all 16 screens converted (Router v7 + Zustand) | ✅ |
| 5 | Route-split + bundle budget · Vitest/RTL/ESLint/Prettier/Playwright · shell chrome + search · CI + Vercel | ✅ |
| 6 | Deferred overlays (recipe detail, cook mode, capture/scan, reels, checkout) | — |

## License

Not licensed for public use yet — prototype phase.
