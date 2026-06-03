# Pantry Pilot — Project Overview

**A polished smart-kitchen command center, taken from a single throwaway HTML prototype to a typed, tested, continuously deployed production web app — without moving a single pixel of the original design.**

> **At a glance**
> - **What it is:** A client-side product prototype for a "smart kitchen" — pantry tracking, meal planning, guided cooking, shopping, and health — presented as one cohesive command center.
> - **Status:** Live and shipping. The full feature build is complete; the project is in a polish-and-hardening phase (v1.1).
> - **Live:** https://project-33nu9.vercel.app
> - **Source:** github.com/hemanthballa07/pantry-pilot
> - **Stack:** React + TypeScript (strict), Vite, Zustand, React Router — deployed on Vercel with CI on every push.
> - **Quality bar:** 191 automated tests (170 unit + 21 end-to-end), a 21-baseline visual-regression suite, an enforced bundle-size budget, an automated code-review gate, and a complete decision log.

---

## 1. What the project is

Pantry Pilot is a **smart-kitchen command center** — a single application that brings together everything a household does around food, framed as an assistant that watches your pantry, expiry dates, budget, and habits and proactively helps you cook what you have, waste less, and shop smarter:

- **Pantry** — what you have, what's running low, what's about to expire.
- **Plan** — a weekly meal plan you can rearrange.
- **Cook** — a guided "cook mode" that scales recipes and walks you through each step, plus a short-video recipe feed ("Reels").
- **Shop** — a smart grocery list with a checkout flow.
- **Health & Insights** — nutrition signals and cooking-habit analytics.
- **Capture** — add items by scanning a receipt, a barcode, or a photo of your fridge.
- **Household, Settings, Imports** — the supporting surfaces that make it feel like a real, shipped product.

Everything runs **client-side off a single mock dataset**, by deliberate design. The point of the project is not a backend; it is to demonstrate **product look, feel, and interaction design at production quality** — and the engineering discipline required to ship and maintain it.

## 2. The core thesis (why it's interesting)

The project's real subject is a **migration done well**: taking a ~12,000-line, single-file HTML/React prototype — the kind a designer hands off — and turning it into a **typed, tested, deployable production codebase**, *while treating the original design as immutable*.

That last clause is the whole game. Most rewrites quietly drift from the design they started with. Here, **pixel-for-pixel design fidelity is the #1 constraint** — recorded explicitly, and every structural change has to prove it did not move a pixel. The interesting engineering is doing aggressive refactoring underneath a frozen surface: introducing types, real routing, a state layer, code-splitting, and an entire overlay system, all without the product looking even slightly different.

## 3. Where it stands today

- **Shipped and live**, deployed to Vercel, with continuous integration on every push: type-check, lint, formatting, unit tests, a bundle-size budget, and end-to-end tests.
- **The full product surface is built** — 11 routed screens and 7 modal/drawer overlays (recipe detail, guided cook mode, checkout, capture, the assistant panel, add-item, and the kitchen inbox).
- **Now in v1.1**, a polish-and-hardening phase. The feature build is done; the remaining work is internal quality — shared component primitives, accessibility, and a visual safety net (see §6).

A quick sense of the rigor:

| Dimension | Where it is |
|---|---|
| Tests | 170 unit + 21 end-to-end + 21 visual-regression baselines, all green |
| Initial JS payload | ~248 KB raw / ~81 KB gzip, enforced by a CI budget |
| Code review | Automated reviewer gate on every change; zero critical/high findings to merge |
| Decision record | Every non-trivial choice logged with the alternatives that were rejected |
| Process | Test-driven, Conventional Commits, adversarial planning before non-trivial work |

## 4. Architecture & stack

Migrated from a Babel-in-the-browser prototype to a modern toolchain:

- **React 18 + TypeScript (strict)** — roughly 50 hand-authored domain types replace untyped prototype data.
- **Vite** build; **React Router** gives real, URL-addressable screens (replacing a hand-rolled `useState` screen switch).
- **Zustand** holds the small amount of genuinely global state (toasts, navigation, search, overlays), replacing prototype `window.*` globals.
- **Vitest + React Testing Library + Playwright** cover unit, component, and end-to-end behavior.
- **Code-split by route** with lazy loading, behind an enforced bundle budget, so the app stays fast as it grows.
- **A dedicated overlay system** — one store plus a single lazy-loaded host that can render any overlay over any route, in three shared "shell" shapes (side drawer, centered modal, full-screen).
- **The original `styles.css` is preserved verbatim** — a ~70-variable design-token system with a dark theme. No CSS framework was introduced, precisely because rewriting the styling would destroy the design fidelity that is the entire point.

## 5. How it is actually built (the discipline)

For a senior reader, this is the part that matters: the project is run like a small, well-governed engineering effort, not a hack.

- **Two-file source of truth.** A `STATUS.md` snapshot (where we are now) and an append-only `PROJECT_LOG.md` (every decision, session, metric, and open question). A contributor can reconstruct full context cold.
- **Architecture Decision Records.** Fourteen so far — each with context, the decision, **the alternatives rejected and why**, and the consequences (e.g. "mock data only, no backend in v1"; "route-split to hold a bundle budget"; "one overlay store, not two").
- **A gate before every commit.** Type-check, lint, format, full test suite, bundle-size check, end-to-end tests, *and* an automated code-review pass — all must come back clean, with zero critical or high findings.
- **Test-driven, behavior by behavior.** New behavior gets a failing test first, then the implementation.
- **Adversarial planning.** Non-trivial work is planned, then the plan is deliberately *attacked* (a critique pass) and patched in a loop until the objections are trivial — before any code is written.

## 6. Design directions — what's next

The feature build is complete, so the open questions are about **quality and hardening**, not new screens. The work spans three directions — the first now built, the other two by design owner-gated:

**(a) A visual-regression safety net — built.**
Because design fidelity is the #1 constraint and was previously verified *by hand*, the project now has an automated **screenshot-based safety net**: a browser-automation suite captures every screen and overlay, and CI fails if any pixel changes unexpectedly. It covers all 11 routes plus the 7 modal/drawer overlays and the animation-heavy recipe-reel feed — **21 reference images** in total. The non-obvious challenge was **determinism**: reference screenshots must be byte-identical between a developer's Mac (Apple Silicon) and the Linux CI servers, which required generating them inside a CPU-architecture-matched container and neutralizing every source of non-deterministic rendering — a heat-map that re-randomizes each render (masked), web-fonts that load lazily (force-loaded and asserted), still-mounting tall pages (height-stabilized), and looping CSS animations (frozen). This is the missing leg of the test pyramid, and the thing that makes the primitive-consolidation cleanup in (b) safe to attempt. The final hardening step — making the suite fully hermetic by self-hosting the web fonts instead of loading them from a CDN at runtime — is now done, and the safety net verified its own change: the self-hosted fonts produced byte-identical screenshots, so the existing reference images passed unchanged.

**(b) Consolidating duplicated UI primitives (design-gated).**
The prototype inlined its own copy of small building blocks — icons, pills, buttons — across many files. Half have already been unified into a shared library: specifically the half that was *provably pixel-identical*. The remaining half **genuinely render differently** from file to file (the same icon name maps to different glyphs in different places — including a latent bug where a "next" chevron actually points left). Unifying them therefore cannot be done silently; it needs a human decision per conflict plus design sign-off. That is exactly why the visual safety net in (a) comes first — it makes this cleanup safe to attempt.

**(c) Operational polish (account-level).**
A cleaner production domain and branch-protection rules on the repository — small, owner-only dashboard tasks.

## 7. The one idea to take away

If you remember one thing: **this is a disciplined production migration of a finished design, where "don't change how it looks" is treated as a hard engineering constraint rather than a hope.** Every decision — strict types, a bundle budget, a purpose-built overlay architecture, and now a pixel-level visual safety net — exists to let the code evolve freely while the product stays exactly as it was designed.

---

*Live: https://project-33nu9.vercel.app · Source: github.com/hemanthballa07/pantry-pilot*
