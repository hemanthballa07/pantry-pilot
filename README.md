# Pantry Pilot

A smart-kitchen command center — an AI assistant that watches your pantry, expiry dates, budget, and habits, and proactively helps you cook what you have, waste less, and shop smarter.

> **Stage:** Phase 0 — high-fidelity React + Babel-standalone prototype handed off from Claude Design. Vite + TypeScript migration planned for Phases 1–6.

## Quickstart (Phase 0)

The prototype is self-contained — no install step. It runs from any static-file server.

```bash
python3 -m http.server 4173 --bind 127.0.0.1
# open http://127.0.0.1:4173/PantryPilot.html
```

## What's inside

- `PantryPilot.html` — prototype entry; loads React 18.3.1 + Babel standalone from unpkg
- `src/styles.css` — design tokens (~70 CSS custom properties + dark theme)
- `src/data.js` — `PP_DATA` mock (pantry, recipes, grocery, household, …)
- `src/screens/*.jsx` — 16 screens (dashboard, pantry, cook-mode, plan, shop, …)
- `src/components.jsx`, `src/shell.jsx`, `src/overlays.jsx` — UI primitives and drawers
- `PROJECT_BRIEF.md` — full product spec and feature inventory (immutable)
- `STATUS.md` — current-phase snapshot (read first on every session)
- `PROJECT_LOG.md` — append-only history: Decisions, Sessions, Metrics, Open Questions

## For maintainers (Claude or human)

Start here on every session:
1. `STATUS.md` — what phase, what's done, what's next
2. `PROJECT_LOG.md` — tail of Sessions + any new ADRs
3. `CLAUDE.md` — session protocol and engineering bar
4. `PROJECT_BRIEF.md` only if touching product behavior

## Roadmap

| Phase | Scope |
|-------|-------|
| 0 ✅ | Docs, source-of-truth files, `.claude/` bundle, first commit |
| 1 | Vite + TS scaffold; quarantine prototype to `legacy/` |
| 2 | Port `data.js` + `recipe-defs.js` to TypeScript with ~50 interfaces |
| 3 | Convert UI primitives to ES modules; error boundaries per route |
| 4 | Convert 16 screens; React Router v6; Zustand for global actions |
| 5 | Vitest + Playwright smoke tests |
| 6 | GitHub Actions + Vercel deploy with PR previews |

Full migration plan and decision rationale: see `PROJECT_LOG.md`.

## License

Not licensed for public use yet — prototype phase.
