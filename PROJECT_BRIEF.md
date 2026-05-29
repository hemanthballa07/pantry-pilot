# Pantry Pilot — Project Brief & Feature-Ideation Pack

> Hand this file (and the project files alongside it) to a fresh Claude session
> when you want help brainstorming or building new features. It is written so a
> Claude that was **not** part of the original build can understand the whole app
> from this document alone.

---

## What Pantry Pilot is

Pantry Pilot is a **smart-kitchen command center** — a high-fidelity, interactive
product prototype for a student/shared-apartment cook ("Hemanth", Apartment 4B,
2 roommates). The premise: an AI assistant ("Pilot") that watches your pantry,
expiry dates, budget, and habits, and proactively helps you cook what you have,
waste less, and shop smarter.

It is built as an **HTML + React (inline Babel JSX) prototype** — not a production
app. Everything runs client-side off a single mock data file. The point is to
demonstrate look, feel, and interaction design.

**Tone:** warm, calm, "premium kitchen journal." Cream paper palette, a serif
display face (Newsreader) for headings, Geist for UI text, hand-drawn line-art
ingredient illustrations, and a recurring "Pilot says…" assistant voice.

---

## Current feature inventory

Navigation is a left sidebar. Top-level screens and what each does today:

### Dashboard ("Today")
- **Today's Plan** hero — breakfast/lunch/dinner/snack slots with cook, reheat, or grab-and-go states.
- **Coverage score** — how many days/meals you can make from current stock.
- **Waste Rescue** — a 3-day plan to use ingredients before they expire.
- **Expiring soon** list + **Pilot suggestions** card.

### Pantry
- Full inventory (location, qty, expiry, owner, store, price) with expiry status colors.
- **Auto-restock rules** (e.g. "keep ≥6 eggs", "add milk when below 25%").
- **Low-stock** tracker and a **pantry-staples** builder/score.

### Cook  ← *most-developed area*
- **Explore cuisines** — "What would you like to try tonight?" Cuisine chips
  (Indian, Chinese, Mexican, Italian, Mediterranean, Asian, Indo-Chinese,
  American, Breakfast) and recipes grouped by cuisine.
- **Cook what I have** — recipes ranked by ingredient match / freshness / budget,
  with shelves (expiring, under 20 min, budget, high-protein, breakfast).
- **Craving mode** — pick a mood ("spicy & quick", "comfort", "no cooking"…) → matching recipes.
- **Recipe unlocks** — "buy 1 thing → unlock N meals."
- **Notebook** — personal/saved recipes (family recipes, TikTok finds).
- **Cook Mode** (the flagship interaction): pre-cook setup (servings + spice level
  → scaled mise en place), then a fluid **card-deck** step-by-step walkthrough
  with per-step timers, beginner "how to know it's ready" cues, an ingredient
  checklist, a timer, and a live "Pilot says" leftover-tracking prompt.
- 22 recipes total, 13 with full scaled-ingredient + step-by-step scripts.

### Plan
- Weekly meal plan grid (B/L/D per day).
- Budget basket + **occasion plans** ("meal-prep Sunday", "exam week", "friends over").

### Shop (Grocery)
- Smart grocery list grouped by store section, with who-added, priority, why-needed.
- **Scan receipt** flow — 4-phase: capture → OCR detection animation → confidence-grouped review → done.

### Other
- **Insights** — budget by category/store, waste analytics, kitchen "memory" (habit patterns), kitchen wins.
- **Household** — roommates, who-added/spent, activity timeline.
- **Kitchen Inbox** — universal capture (recipe links, voice notes, photos, todos).
- **Ask Pilot** — assistant modal. **Leftovers** tracking. **Takeout swaps** (home vs. takeout cost/time).

---

## Architecture (for anyone editing the code)

Entry point: **`PantryPilot.html`** loads pinned React 18.3.1 + Babel, then
`src/styles.css`, then a series of `<script type="text/babel">` modules in order.
Each module attaches to a `window.PP*` global; `src/app.jsx` wires them into the shell.

| File | Role |
|---|---|
| `src/styles.css` | All design tokens. Light `:root` + `[data-theme="dark"]`. |
| `src/data.js` | `window.PP_DATA` — all mock data (pantry, recipes, grocery, budget, …). |
| `src/components.jsx` | `window.PPUI` = Pill, Card, Button, Tabs, Chip, Avatar, … |
| `src/icons.jsx` / `src/illustrations.jsx` | `PPIcon.Icon` (line icons) / `PPIllo.Illo` (ingredient art). |
| `src/screens/recipe-defs.js` | `window.PPRecipeDefs` — per-recipe scaled ingredients + step scripts. |
| `src/screens/cook-mode.jsx` | `PPCookMode.CookNow` — pre-cook setup + card-deck cook flow. |
| `src/screens/scan-receipt.jsx` | `PPScanReceipt.ScanReceipt` — receipt scan flow. |
| `src/screens/*.jsx` | dashboard, pantry, grocery, recipes, planner, extras, landing. |
| `src/overlays.jsx` | drawers + modals (item, recipe, Ask Pilot, add item, inbox). |
| `src/app.jsx` | root shell + screen routing + global window hooks. |

**Conventions:**
- Design system lives at a separate project; explore it before adding visuals —
  copy fonts/colors/components, don't invent.
- Each Babel module gets its own scope → share via `window`; never name a style
  object `styles` (collisions break the build) — use unique names.
- Tinted-surface colors use **semantic tokens that swap by theme**
  (`--amber-ink`, `--tomato-ink`, `--amber-line`, `--on-tint-pad`, …). Never
  hardcode warm-light hex in screens or dark mode breaks.
- Canonical HTML (explicit closing tags, double-quoted attrs).
- New variations belong as **Tweaks** or in a design canvas, not forked files.

---

## How to ask Claude for new features

Paste something like this into a fresh Claude session (with the project files attached):

> This is **Pantry Pilot**, a smart-kitchen prototype (see PROJECT_BRIEF.md for the
> full feature inventory and architecture). I want to expand it. Please:
> 1. Suggest 8–12 new features that fit the product's premise (an AI kitchen
>    assistant that reduces waste, saves money, and makes cooking easier for a
>    student in a shared apartment), ranked by user value vs. effort.
> 2. For each, note which existing screen it lives in (or whether it's new),
>    what data it needs, and the key interaction.
> 3. Flag anything that would clash with the calm, warm, anti-slop design tone.
> Then build the top 2 as Tweaks or new screens, following the existing
> conventions in PROJECT_BRIEF.md.

---

## Some directions worth considering (starter list)

Use these to prime the conversation — not exhaustive:

- **Cook Mode upgrades:** hands-free voice step navigation, "I'm missing X — substitute?" inline swaps, multi-recipe parallel timers ("cook 2 dishes to finish together").
- **Social / household:** "who's cooking tonight" claim system, shared shopping run coordination, splitting grocery cost fairly across roommates.
- **Health:** weekly nutrition trends, dietary-goal tracking, "balance my week" auto-planner.
- **Waste:** photo "what's in my fridge?" → instant recipe, freeze-before-it-spoils reminders, a running waste-saved $ counter with streaks.
- **Discovery:** "cook the world" passport (try N cuisines), seasonal/sale-aware suggestions, import any recipe URL and auto-scale it.
- **Onboarding:** first-run pantry setup via receipt scan or barcode, taste/spice/diet profile.
```
