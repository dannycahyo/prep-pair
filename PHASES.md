# PrepPair — Implementation Phases

> **Development Breakdown & Tracking Checkpoints**

| Field             | Value                                   |
| ----------------- | --------------------------------------- |
| **Product Name**  | PrepPair                                |
| **Document Type** | Implementation Plan                     |
| **Version**       | 1.1                                     |
| **Author**        | Danny (Software Engineer)               |
| **Date**          | February 15, 2026                       |
| **Timeline**      | 10 weeks (5 phases × ~2 weeks each)     |
| **Related**       | [PRD.md](./PRD.md) · [TRD.md](./TRD.md) |

---

## Overview

This document breaks the v1 implementation into **5 focused phases**, each approximately **2 weeks** long. AI features are excluded from v1 and documented in the TRD as a future extension path.

### Phase Map

```
Phase 1 ─── Project Setup & Data Layer          [Weeks 1–2]
Phase 2 ─── Recipe Management                   [Weeks 3–4]
Phase 3 ─── Weekly Meal Planner                  [Weeks 5–6]
Phase 4 ─── Grocery List & Budget Tracking       [Weeks 7–8]
Phase 5 ─── PWA, Polish & Launch Prep            [Weeks 9–10]
```

### Priority Legend

| Tag           | Meaning                                          |
| ------------- | ------------------------------------------------ |
| 🟢 **Must**   | Required for the phase to be considered complete |
| 🟡 **Should** | Important but the phase can pass without it      |
| ⚪ **Nice**   | Can be deferred if time runs short               |

---

## Phase 1 — Project Setup & Data Layer

> **Goal:** A running dev environment with the full database schema, PIN authentication, and a basic app shell. By the end, you can log in and see an empty dashboard.

**Duration:** Weeks 1–2

### Tasks

| #    | Task                  | Tag       | Description                                                                                                                                                                             |
| ---- | --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | Initialize project    | 🟢 Must   | Scaffold React Router v7 (framework mode) with TypeScript, Vite, bun. Configure `react-router.config.ts` and `vite.config.ts`.                                                          |
| 1.2  | Configure tooling     | 🟢 Must   | Setup Biome (lint + format), configure `tsconfig.json`, add `.env.example`, create `README.md` with setup instructions.                                                                 |
| 1.3  | Docker Compose        | 🟢 Must   | Create `docker-compose.yml` with PostgreSQL 16. Verify service starts and is reachable.                                                                                                 |
| 1.4  | Drizzle ORM setup     | 🟢 Must   | Install Drizzle + drizzle-kit. Create `drizzle.config.ts`. Write the full database schema (`schema.ts`) with all 6 tables, enums, relations, and indexes as defined in TRD Section 4.3. |
| 1.5  | Run initial migration | 🟢 Must   | Generate and apply first migration. Verify all tables exist via `drizzle-kit studio`.                                                                                                   |
| 1.6  | Tailwind + shadcn/ui  | 🟢 Must   | Install Tailwind CSS v4, configure theme (`app.css`). Init shadcn/ui. Add core components: button, card, input, label, toast, sidebar, skeleton.                                        |
| 1.7  | App layout shell      | 🟢 Must   | Create `root.tsx`, `_app.tsx` (authenticated layout with sidebar). Sidebar navigates between: Planner, Recipes, Grocery, Budget, Settings. Create placeholder routes for each.          |
| 1.8  | PIN authentication    | 🟢 Must   | Implement `auth.service.ts` (setupPin, verifyPin, requireAuth). Create `setup.tsx` and `login.tsx` routes with session cookie handling.                                                 |
| 1.9  | Auth guard            | 🟢 Must   | `_app.tsx` loader calls `requireAuth()` — redirects to `/login` if no session, to `/setup` if no user exists.                                                                           |
| 1.10 | Seed script           | 🟡 Should | `app/lib/db/seed.ts` — inserts a test user (PIN: "1234") and 3–5 sample recipes with ingredients.                                                                                       |

### Checkpoint ✅

| #    | Criteria                                                                    | Status |
| ---- | --------------------------------------------------------------------------- | ------ |
| C1.1 | `docker-compose up` starts PostgreSQL without errors                        | ☐      |
| C1.2 | `bun dev` starts the app at `localhost:3000`                                | ☐      |
| C1.3 | First-time visit redirects to `/setup` → set PIN → redirected to `/planner` | ☐      |
| C1.4 | Subsequent visits show `/login` → enter PIN → redirected to `/planner`      | ☐      |
| C1.5 | Wrong PIN shows error; correct PIN unlocks the app                          | ☐      |
| C1.6 | Sidebar navigation works between all sections                               | ☐      |
| C1.7 | `drizzle-kit studio` shows all 6 tables with correct columns                | ☐      |
| C1.8 | `bun biome check .` passes with no errors                                   | ☐      |

---

## Phase 2 — Recipe Management

> **Goal:** Full recipe CRUD — create, read, update, delete recipes with ingredients and steps.

**Duration:** Weeks 3–4

### Tasks

| #    | Task                       | Tag       | Description                                                                                                                                                                 |
| ---- | -------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1  | Zod validators             | 🟢 Must   | Create `recipe.schema.ts` with `createRecipeSchema` and `updateRecipeSchema`.                                                                                               |
| 2.2  | Recipe service             | 🟢 Must   | Implement `recipe.service.ts`: `getRecipes()`, `getRecipeById()`, `createRecipe()`, `updateRecipe()`, `deleteRecipe()`, `toggleFavorite()`. Use Drizzle transactions.       |
| 2.3  | Recipe list page           | 🟢 Must   | `_app.recipes._index.tsx` — card grid with search and category filter. Empty state when no recipes.                                                                         |
| 2.4  | Add recipe page            | 🟢 Must   | `_app.recipes.new.tsx` — full form: title, description, category, tags, times, servings, cooking style, cost, dynamic ingredients, dynamic steps. Zod validation on action. |
| 2.5  | Ingredient input component | 🟢 Must   | `ingredient-input.tsx` — dynamic rows: name, quantity, unit, category. Add/remove rows.                                                                                     |
| 2.6  | Recipe detail page         | 🟢 Must   | `_app.recipes.$recipeId.tsx` — displays all recipe info with edit and delete buttons.                                                                                       |
| 2.7  | Edit recipe                | 🟢 Must   | Edit mode on detail page. Updates recipe + replaces ingredients in transaction.                                                                                             |
| 2.8  | Delete recipe              | 🟢 Must   | Confirmation dialog → delete with cascade.                                                                                                                                  |
| 2.9  | Favorite toggle            | 🟢 Must   | Heart icon via fetcher action.                                                                                                                                              |
| 2.10 | Serving scaler             | 🟡 Should | Client-side ingredient quantity recalculation based on serving adjustment.                                                                                                  |
| 2.11 | Recipe image URL           | ⚪ Nice   | Optional `imageUrl` field. Display on card and detail page.                                                                                                                 |

### Checkpoint ✅

| #    | Criteria                                                        | Status |
| ---- | --------------------------------------------------------------- | ------ |
| C2.1 | Can create a recipe with 5+ ingredients and 3+ steps            | ☐      |
| C2.2 | Recipe appears in list immediately after creation               | ☐      |
| C2.3 | Can edit a recipe — changes persist after reload                | ☐      |
| C2.4 | Can delete a recipe — removed from list, ingredients cleaned up | ☐      |
| C2.5 | Can toggle favorite — persists after reload                     | ☐      |
| C2.6 | Search filters recipes by title                                 | ☐      |
| C2.7 | Category filter narrows the recipe list                         | ☐      |
| C2.8 | Form validation shows errors for missing required fields        | ☐      |
| C2.9 | Ingredient input allows adding and removing rows dynamically    | ☐      |

---

## Phase 3 — Weekly Meal Planner

> **Goal:** A visual 7-day calendar where you can assign recipes to slots, drag-and-drop them, and track cooked/skipped status.

**Duration:** Weeks 5–6

### Tasks

| #    | Task                 | Tag       | Description                                                                                                                    |
| ---- | -------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 3.1  | Planner service      | 🟢 Must   | `planner.service.ts`: `getOrCreateWeekPlan()`, `assignRecipeToSlot()`, `removeFromSlot()`, `moveSlot()`, `updateSlotStatus()`. |
| 3.2  | Week navigation      | 🟢 Must   | `_app.planner.tsx` — calculates current Monday, redirects to `$weekId`. Previous/next week arrows.                             |
| 3.3  | Weekly calendar grid | 🟢 Must   | `week-calendar.tsx` — 7 columns (Mon–Sun), 3 rows (breakfast, lunch, dinner).                                                  |
| 3.4  | Meal slot component  | 🟢 Must   | `meal-slot.tsx` — empty state with "+", filled state with recipe title + cooking style badge.                                  |
| 3.5  | Recipe picker dialog | 🟢 Must   | Dialog showing recipe list with search. Select to assign via fetcher.                                                          |
| 3.6  | Install dnd-kit      | 🟢 Must   | `@dnd-kit/core` + `@dnd-kit/utilities`. Wrap calendar in DndContext.                                                           |
| 3.7  | Drag-and-drop        | 🟢 Must   | Drag recipes between slots. Swap if target is occupied. Submit via fetcher.                                                    |
| 3.8  | Meal status toggle   | 🟢 Must   | Toggle planned → cooked → skipped with visual indicators.                                                                      |
| 3.9  | Week summary bar     | 🟡 Should | Top bar: X/21 filled, X cooked, X skipped, estimated cost.                                                                     |
| 3.10 | Responsive layout    | 🟡 Should | Mobile: vertical day-by-day view instead of 7-column grid.                                                                     |

### Checkpoint ✅

| #    | Criteria                                                        | Status |
| ---- | --------------------------------------------------------------- | ------ |
| C3.1 | Opening `/planner` shows current week's calendar (auto-created) | ☐      |
| C3.2 | Can navigate to previous and next weeks                         | ☐      |
| C3.3 | Can assign a recipe to an empty slot via picker                 | ☐      |
| C3.4 | Can remove a recipe from a slot                                 | ☐      |
| C3.5 | Can drag a recipe from one slot to another                      | ☐      |
| C3.6 | Can mark a slot as cooked or skipped — visual indicator updates | ☐      |
| C3.7 | Cooking style tag displays on filled slots                      | ☐      |
| C3.8 | Week summary shows correct counts                               | ☐      |
| C3.9 | Calendar is usable on mobile (≤ 640px)                          | ☐      |

---

## Phase 4 — Grocery List & Budget Tracking

> **Goal:** Auto-generate a grocery checklist from the weekly plan and track grocery spending against a weekly budget.

**Duration:** Weeks 7–8

### Tasks

| #    | Task                         | Tag       | Description                                                                                                      |
| ---- | ---------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| 4.1  | Grocery service              | 🟢 Must   | `grocery.service.ts`: `generateGroceryList()`, `getGroceryList()`, `toggleGroceryItem()`, `clearCheckedItems()`. |
| 4.2  | Generate grocery list action | 🟢 Must   | Button on planner page triggers generation, redirects to grocery page.                                           |
| 4.3  | Grocery list page            | 🟢 Must   | `_app.grocery.$weekId.tsx` — categorized checklist with item counts.                                             |
| 4.4  | Check-off interaction        | 🟢 Must   | `grocery-item.tsx` — optimistic toggle via fetcher. Checked items get line-through.                              |
| 4.5  | Grocery cost estimate        | 🟡 Should | Show estimated total at top if recipes have cost data.                                                           |
| 4.6  | Budget service               | 🟢 Must   | `budget.service.ts`: `createBudgetEntry()`, `getBudgetEntries()`, `getWeeklySpending()`, `getSpendingTrend()`.   |
| 4.7  | Zod budget validator         | 🟢 Must   | `budget.schema.ts`: amount, store, date.                                                                         |
| 4.8  | Log expense page             | 🟢 Must   | `_app.budget.log.tsx` — form: amount (IDR), store (optional), date.                                              |
| 4.9  | Budget overview page         | 🟢 Must   | `_app.budget.tsx` — progress bar, recent entries, spending trend chart.                                          |
| 4.10 | Budget progress bar          | 🟢 Must   | `budget-progress.tsx` — green/yellow/red based on percentage.                                                    |
| 4.11 | Spending trend chart         | 🟡 Should | Recharts bar chart, last 8 weeks.                                                                                |
| 4.12 | Budget in settings           | 🟢 Must   | `_app.settings.tsx` — update weekly budget and default servings.                                                 |
| 4.13 | Currency utility             | 🟢 Must   | `currency.ts` — IDR formatting via `Intl.NumberFormat("id-ID")`.                                                 |

### Checkpoint ✅

| #     | Criteria                                                  | Status |
| ----- | --------------------------------------------------------- | ------ |
| C4.1  | "Generate Grocery List" creates correct deduplicated list | ☐      |
| C4.2  | Duplicate ingredients across recipes are aggregated       | ☐      |
| C4.3  | Items are grouped by category                             | ☐      |
| C4.4  | Can check off items — persists after reload               | ☐      |
| C4.5  | Can log a grocery expense with amount and store           | ☐      |
| C4.6  | Budget overview shows correct spent vs. budget            | ☐      |
| C4.7  | Progress bar color changes based on spending level        | ☐      |
| C4.8  | Spending trend chart displays history                     | ☐      |
| C4.9  | Can update weekly budget and servings in settings         | ☐      |
| C4.10 | Currency displays correctly (e.g., Rp 350.000)            | ☐      |

---

## Phase 5 — PWA, Polish & Launch Prep

> **Goal:** Make PrepPair installable, offline-capable, and production-quality. Fix rough edges, add proper states, and prepare for daily use.

**Duration:** Weeks 9–10

### Tasks

| #    | Task                | Tag       | Description                                                                    |
| ---- | ------------------- | --------- | ------------------------------------------------------------------------------ |
| 5.1  | PWA manifest        | 🟢 Must   | `manifest.webmanifest` with icons, theme, start URL.                           |
| 5.2  | App icons           | 🟢 Must   | Icons at 192x192, 512x512 (regular + maskable).                                |
| 5.3  | Service worker      | 🟢 Must   | `sw.js` with caching strategies per TRD Section 8.2.                           |
| 5.4  | Offline support     | 🟢 Must   | Cached recipes and plans viewable offline. "Offline" banner when disconnected. |
| 5.5  | Install prompt      | 🟡 Should | Detect `beforeinstallprompt`, show install banner.                             |
| 5.6  | Loading skeletons   | 🟢 Must   | Skeleton states for all pages while loaders run.                               |
| 5.7  | Empty states        | 🟢 Must   | All pages: helpful message + CTA when no data exists.                          |
| 5.8  | Toast notifications | 🟢 Must   | Success/error toasts for all mutations.                                        |
| 5.9  | Mobile audit        | 🟢 Must   | Test all pages at 375px. Fix layout issues. Thumb-friendly grocery list.       |
| 5.10 | Settings page       | 🟢 Must   | Change PIN, update budget, update servings.                                    |
| 5.11 | Error boundaries    | 🟢 Must   | Error elements on root and app layouts. No white screens.                      |
| 5.12 | Performance audit   | 🟡 Should | Lighthouse > 90 performance. Lazy-load Recharts, dnd-kit.                      |
| 5.13 | CI pipeline         | 🟡 Should | GitHub Actions: biome → tsc → vitest → build.                                  |
| 5.14 | Core tests          | 🟡 Should | Unit tests for grocery aggregation, recipe CRUD, PIN auth, planner logic.      |
| 5.15 | README              | 🟢 Must   | Comprehensive setup guide: prerequisites, Docker, env vars, dev commands.      |
| 5.16 | Deploy to staging   | ⚪ Nice   | Vercel + Neon PostgreSQL.                                                      |

### Checkpoint ✅

| #     | Criteria                                           | Status |
| ----- | -------------------------------------------------- | ------ |
| C5.1  | App is installable as PWA on mobile and desktop    | ☐      |
| C5.2  | Cached recipes and plans viewable offline          | ☐      |
| C5.3  | Offline indicator appears when disconnected        | ☐      |
| C5.4  | All pages show loading skeletons                   | ☐      |
| C5.5  | All empty states have helpful CTAs                 | ☐      |
| C5.6  | Toasts appear for all create/update/delete actions | ☐      |
| C5.7  | Grocery checklist usable one-handed on mobile      | ☐      |
| C5.8  | Settings allows changing PIN, budget, servings     | ☐      |
| C5.9  | No white-screen crashes (error boundaries work)    | ☐      |
| C5.10 | Lighthouse PWA badge achieved                      | ☐      |
| C5.11 | `biome check && tsc --noEmit && vitest run` passes | ☐      |
| C5.12 | README enables setup from scratch in < 15 minutes  | ☐      |

---

## Summary

| Phase       | Weeks | Focus              | Key Deliverable                                |
| ----------- | ----- | ------------------ | ---------------------------------------------- |
| **Phase 1** | 1–2   | Setup & Data Layer | Running app with auth, DB, app shell           |
| **Phase 2** | 3–4   | Recipe Management  | Full recipe CRUD with ingredients and steps    |
| **Phase 3** | 5–6   | Meal Planner       | 7-day calendar with drag-and-drop              |
| **Phase 4** | 7–8   | Grocery & Budget   | Auto grocery list + budget tracking in IDR     |
| **Phase 5** | 9–10  | PWA & Polish       | Installable, offline-ready, production-quality |

### Milestone Markers

| Milestone                | After Phase | Significance                           |
| ------------------------ | ----------- | -------------------------------------- |
| 🏁 **Skeleton Complete** | Phase 1     | App runs, auth works, DB is live       |
| 🏁 **Data Foundation**   | Phase 2     | Recipe library is usable               |
| 🏁 **Core Loop**         | Phase 3     | Weekly planning workflow is functional |
| 🏁 **Full MVP**          | Phase 4     | All P0 features working                |
| 🏁 **Launch Ready**      | Phase 5     | PWA optimized, ready for daily use     |

### How to Use This Document

1. **Before starting a phase:** Read all tasks and checkpoint criteria
2. **During a phase:** Check off tasks as completed; don't move to next phase until all 🟢 Must tasks are done
3. **At phase end:** All checkpoint criteria must pass before moving forward
4. **If behind schedule:** Complete 🟢 Must items; defer 🟡 Should and ⚪ Nice to Phase 5 or post-launch

---

_End of Document_
