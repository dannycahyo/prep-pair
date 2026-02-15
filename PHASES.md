# PrepPair — Implementation Phases

> **Development Breakdown & Tracking Checkpoints**

| Field             | Value                                   |
| ----------------- | --------------------------------------- |
| **Product Name**  | PrepPair                                |
| **Document Type** | Implementation Plan                     |
| **Version**       | 1.0                                     |
| **Author**        | Danny (Software Engineer)               |
| **Date**          | February 15, 2026                       |
| **Timeline**      | 12 weeks (6 phases × ~2 weeks each)     |
| **Related**       | [PRD.md](./PRD.md) · [TRD.md](./TRD.md) |

---

## Overview

The PRD defines 3 broad phases over 12 weeks. This document breaks those down into **6 focused implementation phases**, each approximately **2 weeks** long. Every phase has a clear goal, a concrete task list, and a tracking checkpoint to verify completion before moving forward.

### Phase Map

```
Phase 1 ─── Project Setup & Data Layer          [Weeks 1–2]
Phase 2 ─── Recipe Management                   [Weeks 3–4]
Phase 3 ─── Weekly Meal Planner                  [Weeks 5–6]
Phase 4 ─── Grocery List & Budget Tracking       [Weeks 7–8]
Phase 5 ─── AI Features                          [Weeks 9–10]
Phase 6 ─── PWA, Polish & Launch Prep            [Weeks 11–12]
```

### Priority Legend

Each task is tagged with effort and priority:

| Tag           | Meaning                                             |
| ------------- | --------------------------------------------------- |
| 🟢 **Must**   | Required for the phase to be considered complete    |
| 🟡 **Should** | Important but the phase can pass without it         |
| ⚪ **Nice**   | Can be deferred to a later phase if time runs short |

---

## Phase 1 — Project Setup & Data Layer

> **Goal:** A running dev environment with the full database schema, PIN authentication, and a basic app shell. By the end, you can log in and see an empty dashboard.

**Duration:** Weeks 1–2

### Tasks

| #    | Task                     | Tag       | Description                                                                                                                                                                                                                                               |
| ---- | ------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | Initialize project       | 🟢 Must   | Scaffold React Router v7 (framework mode) with TypeScript, Vite, pnpm. Configure `react-router.config.ts` and `vite.config.ts`.                                                                                                                           |
| 1.2  | Configure tooling        | 🟢 Must   | Setup Biome (lint + format), configure `tsconfig.json`, add `.env.example`, create `README.md` with setup instructions.                                                                                                                                   |
| 1.3  | Docker Compose           | 🟢 Must   | Create `docker-compose.yml` with PostgreSQL 16 + Ollama. Verify both services start and are reachable.                                                                                                                                                    |
| 1.4  | Drizzle ORM setup        | 🟢 Must   | Install Drizzle + drizzle-kit. Create `drizzle.config.ts`. Write the full database schema (`schema.ts`) with all 6 tables: `users`, `recipes`, `recipe_ingredients`, `meal_plans`, `meal_slots`, `grocery_items`, `budget_entries`. Define all relations. |
| 1.5  | Run initial migration    | 🟢 Must   | Generate and apply first migration. Verify all tables exist in PostgreSQL via `drizzle-kit studio`.                                                                                                                                                       |
| 1.6  | Tailwind + shadcn/ui     | 🟢 Must   | Install Tailwind CSS v4, configure theme (`app.css`). Init shadcn/ui with `components.json`. Add core components: `button`, `card`, `input`, `label`, `toast`, `sidebar`, `skeleton`.                                                                     |
| 1.7  | App layout shell         | 🟢 Must   | Create `root.tsx`, `_app.tsx` (authenticated layout with sidebar navigation), and placeholder routes for planner, recipes, grocery, budget, settings. Sidebar should navigate between sections.                                                           |
| 1.8  | PIN authentication       | 🟢 Must   | Implement `auth.service.ts` (setupPin, verifyPin, requireAuth). Create `setup.tsx` route (first-time PIN creation), `login.tsx` route (PIN entry), and session cookie handling.                                                                           |
| 1.9  | Auth guard on `_app.tsx` | 🟢 Must   | `_app.tsx` loader calls `requireAuth()` — redirects to `/login` if no session, redirects to `/setup` if no user exists.                                                                                                                                   |
| 1.10 | Seed script              | 🟡 Should | Create `app/lib/db/seed.ts` that inserts a test user and 3–5 sample recipes with ingredients for development.                                                                                                                                             |

### Checkpoint ✅

| #    | Criteria                                                                     | Status |
| ---- | ---------------------------------------------------------------------------- | ------ |
| C1.1 | `docker-compose up` starts PostgreSQL and Ollama without errors              | ☐      |
| C1.2 | `pnpm dev` starts the app at `localhost:3000`                                | ☐      |
| C1.3 | First-time visit redirects to `/setup` → set PIN → redirected to `/planner`  | ☐      |
| C1.4 | Subsequent visits show `/login` → enter PIN → redirected to `/planner`       | ☐      |
| C1.5 | Wrong PIN shows error; correct PIN unlocks the app                           | ☐      |
| C1.6 | Sidebar navigation works between planner, recipes, grocery, budget, settings | ☐      |
| C1.7 | `drizzle-kit studio` shows all 6 tables with correct columns and relations   | ☐      |
| C1.8 | `pnpm biome check .` passes with no errors                                   | ☐      |

---

## Phase 2 — Recipe Management

> **Goal:** Full recipe CRUD — create, read, update, delete recipes with ingredients and steps. The recipe library is the foundation that all other features depend on.

**Duration:** Weeks 3–4

### Tasks

| #    | Task                       | Tag       | Description                                                                                                                                                                                                                                                                  |
| ---- | -------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1  | Zod validators             | 🟢 Must   | Create `recipe.schema.ts` with `createRecipeSchema` and `updateRecipeSchema` (ingredients, steps, all fields).                                                                                                                                                               |
| 2.2  | Recipe service             | 🟢 Must   | Implement `recipe.service.ts`: `getRecipes()`, `getRecipeById()`, `createRecipe()`, `updateRecipe()`, `deleteRecipe()`. Use Drizzle transactions for create/update (recipe + ingredients atomically).                                                                        |
| 2.3  | Recipe list page           | 🟢 Must   | `_app.recipes._index.tsx` — loader fetches all recipes; displays as a card grid. Include search input (filter by title) and category filter. Empty state when no recipes.                                                                                                    |
| 2.4  | Add recipe page            | 🟢 Must   | `_app.recipes.new.tsx` — full form with: title, description, category, tags, prep time, cook time, servings, cooking style, estimated cost, dynamic ingredient list (add/remove rows), step list (add/remove/reorder). Action validates with Zod and calls `createRecipe()`. |
| 2.5  | Ingredient input component | 🟢 Must   | `ingredient-input.tsx` — dynamic form rows: name, quantity, unit, category. Add row / remove row buttons.                                                                                                                                                                    |
| 2.6  | Recipe detail page         | 🟢 Must   | `_app.recipes.$recipeId.tsx` — loader fetches recipe with ingredients. Display all info. Include edit and delete buttons.                                                                                                                                                    |
| 2.7  | Edit recipe                | 🟢 Must   | Same route `$recipeId.tsx` with an edit mode (toggle or separate dialog). Action updates recipe and ingredients (delete old ingredients, insert new ones within transaction).                                                                                                |
| 2.8  | Delete recipe              | 🟢 Must   | Confirmation dialog → action deletes recipe (cascade deletes ingredients).                                                                                                                                                                                                   |
| 2.9  | Favorite toggle            | 🟢 Must   | Toggle `isFavorite` on recipe card and detail page via fetcher action. Visual heart icon.                                                                                                                                                                                    |
| 2.10 | Serving scaler             | 🟡 Should | `serving-scaler.tsx` — slider/input on recipe detail that recalculates all ingredient quantities client-side (no DB write).                                                                                                                                                  |
| 2.11 | Recipe image URL           | ⚪ Nice   | Optional `imageUrl` field in the form. Display image on card and detail page. (No file upload — just URL for v1.)                                                                                                                                                            |

### Checkpoint ✅

| #    | Criteria                                                        | Status |
| ---- | --------------------------------------------------------------- | ------ |
| C2.1 | Can create a recipe with 5+ ingredients and 3+ steps            | ☐      |
| C2.2 | Recipe appears in the recipe list immediately after creation    | ☐      |
| C2.3 | Can edit a recipe — changes persist after reload                | ☐      |
| C2.4 | Can delete a recipe — removed from list, ingredients cleaned up | ☐      |
| C2.5 | Can toggle favorite — icon updates, persists after reload       | ☐      |
| C2.6 | Search filters recipes by title in real time                    | ☐      |
| C2.7 | Category filter narrows the recipe list correctly               | ☐      |
| C2.8 | Form validation shows clear errors for missing required fields  | ☐      |
| C2.9 | Ingredient input allows adding and removing rows dynamically    | ☐      |

---

## Phase 3 — Weekly Meal Planner

> **Goal:** The core meal planning experience — a visual 7-day calendar where you can assign recipes to slots, move them around with drag-and-drop, and track what you've cooked.

**Duration:** Weeks 5–6

### Tasks

| #    | Task                 | Tag       | Description                                                                                                                                                                                        |
| ---- | -------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1  | Planner service      | 🟢 Must   | Implement `planner.service.ts`: `getOrCreateWeekPlan()` (auto-creates a plan for the current week if none exists), `assignRecipeToSlot()`, `removeFromSlot()`, `moveSlot()`, `updateSlotStatus()`. |
| 3.2  | Week navigation      | 🟢 Must   | `_app.planner.tsx` — loader determines current week's Monday, redirects to `_app.planner.$weekId.tsx`. Previous/next week navigation arrows.                                                       |
| 3.3  | Weekly calendar grid | 🟢 Must   | `week-calendar.tsx` — 7-column grid (Mon–Sun), 3 rows per column (breakfast, lunch, dinner). Each cell is a `MealSlot` component.                                                                  |
| 3.4  | Meal slot component  | 🟢 Must   | `meal-slot.tsx` — displays assigned recipe title + cooking style tag. Empty state with "+" button. Click to open recipe picker dialog.                                                             |
| 3.5  | Recipe picker dialog | 🟢 Must   | Dialog/sheet that opens from an empty slot — shows recipe list with search, select a recipe to assign it to the slot. Uses fetcher to submit assignment.                                           |
| 3.6  | Install dnd-kit      | 🟢 Must   | Install `@dnd-kit/core` and `@dnd-kit/utilities`. Wrap calendar in `DndContext`. Make recipe cards draggable, meal slots droppable.                                                                |
| 3.7  | Drag-and-drop        | 🟢 Must   | Drag a recipe from one slot to another. On drop, submit a `move-slot` action via fetcher. Handle swap logic (if target slot has a recipe, swap them).                                              |
| 3.8  | Meal status toggle   | 🟢 Must   | On each filled slot, a small toggle/button to mark as "cooked" or "skipped". Visual indicator (checkmark for cooked, strikethrough for skipped). Persists via action.                              |
| 3.9  | Week summary bar     | 🟡 Should | Top bar showing: X/21 slots filled, X cooked, X skipped, estimated total cost for the week.                                                                                                        |
| 3.10 | Responsive layout    | 🟡 Should | On mobile, switch from 7-column grid to a vertical day-by-day list view. Use Tailwind responsive breakpoints.                                                                                      |

### Checkpoint ✅

| #    | Criteria                                                                   | Status |
| ---- | -------------------------------------------------------------------------- | ------ |
| C3.1 | Opening `/planner` shows the current week's calendar (auto-created if new) | ☐      |
| C3.2 | Can navigate to previous and next weeks                                    | ☐      |
| C3.3 | Can assign a recipe to an empty slot via the recipe picker                 | ☐      |
| C3.4 | Can remove a recipe from a slot                                            | ☐      |
| C3.5 | Can drag a recipe from one slot to another                                 | ☐      |
| C3.6 | Can mark a slot as cooked or skipped — visual indicator updates            | ☐      |
| C3.7 | Cooking style tag (fresh/batch prep) displays on each filled slot          | ☐      |
| C3.8 | Week summary shows correct slot count and estimated cost                   | ☐      |
| C3.9 | Calendar renders acceptably on mobile (≤ 640px)                            | ☐      |

---

## Phase 4 — Grocery List & Budget Tracking

> **Goal:** Auto-generate a grocery checklist from the weekly plan and track grocery spending against a weekly budget.

**Duration:** Weeks 7–8

### Tasks

| #    | Task                         | Tag       | Description                                                                                                                                                                                            |
| ---- | ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 4.1  | Grocery service              | 🟢 Must   | Implement `grocery.service.ts`: `generateGroceryList()` (aggregate ingredients from plan, group by category, deduplicate), `toggleGroceryItem()`, `getGroceryList()`.                                  |
| 4.2  | Generate grocery list action | 🟢 Must   | On the planner page or a dedicated button, trigger grocery list generation for the current week. Creates/replaces `grocery_items` rows.                                                                |
| 4.3  | Grocery list page            | 🟢 Must   | `_app.grocery.$weekId.tsx` — loader fetches grocery items grouped by category. Displays as a categorized checklist.                                                                                    |
| 4.4  | Check-off interaction        | 🟢 Must   | `grocery-item.tsx` — tap/click to toggle `isChecked`. Uses fetcher for optimistic updates (checkbox toggles instantly, syncs in background).                                                           |
| 4.5  | Grocery cost estimate        | 🟡 Should | If recipes have `estimatedCost`, show a total estimated cost at the top of the grocery list.                                                                                                           |
| 4.6  | Budget service               | 🟢 Must   | Implement `budget.service.ts`: `createBudgetEntry()`, `getBudgetEntries()` (filter by date range), `getWeeklySpending()`, `getSpendingTrend()` (last N weeks).                                         |
| 4.7  | Zod budget validator         | 🟢 Must   | `budget.schema.ts` with `createBudgetEntrySchema` (amount, store, date).                                                                                                                               |
| 4.8  | Log expense page             | 🟢 Must   | `_app.budget.log.tsx` — simple form: amount (IDR), store name (optional), date. Action validates and creates entry.                                                                                    |
| 4.9  | Budget overview page         | 🟢 Must   | `_app.budget.tsx` — loader fetches current week's spending and weekly budget from user settings. Display: budget progress bar (spent / budget), list of recent entries, weekly trend chart (Recharts). |
| 4.10 | Budget progress bar          | 🟢 Must   | `budget-progress.tsx` — visual bar showing percentage spent. Green when under 80%, yellow 80–100%, red over budget.                                                                                    |
| 4.11 | Spending trend chart         | 🟡 Should | `spending-chart.tsx` — Recharts bar chart showing weekly spending over the last 8 weeks.                                                                                                               |
| 4.12 | Budget in settings           | 🟢 Must   | `_app.settings.tsx` — allow changing weekly budget (IDR) and default servings. Persists to `users` table.                                                                                              |

### Checkpoint ✅

| #     | Criteria                                                                                         | Status |
| ----- | ------------------------------------------------------------------------------------------------ | ------ |
| C4.1  | Clicking "Generate Grocery List" creates a correct, deduplicated list from the week's plan       | ☐      |
| C4.2  | Duplicate ingredients across recipes are aggregated (e.g., garlic from 2 recipes = total garlic) | ☐      |
| C4.3  | Grocery items are grouped by category (produce, protein, etc.)                                   | ☐      |
| C4.4  | Can check off items — persists after page reload                                                 | ☐      |
| C4.5  | Can log a grocery expense with amount and store                                                  | ☐      |
| C4.6  | Budget overview shows correct spent vs. budget with progress bar                                 | ☐      |
| C4.7  | Progress bar color changes based on spending level (green/yellow/red)                            | ☐      |
| C4.8  | Weekly trend chart displays spending history for past weeks                                      | ☐      |
| C4.9  | Can update weekly budget and default servings in settings                                        | ☐      |
| C4.10 | Expense list on budget page shows entries for the current week                                   | ☐      |

---

## Phase 5 — AI Features

> **Goal:** Integrate LLM-powered meal suggestions and recipe URL import. This is the "magic" layer that differentiates PrepPair from a simple spreadsheet.

**Duration:** Weeks 9–10

### Tasks

| #    | Task                           | Tag       | Description                                                                                                                                                                                                                                                                      |
| ---- | ------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1  | LLM provider factory           | 🟢 Must   | Implement `provider.ts` — factory function that returns the correct LangChain chat model based on `LLM_PROVIDER` env var (Ollama, OpenAI, or Anthropic).                                                                                                                         |
| 5.2  | Verify Ollama setup            | 🟢 Must   | Pull `llama3.1:8b` model via Ollama Docker container. Verify the provider factory can call it and get a response.                                                                                                                                                                |
| 5.3  | Meal suggestion chain          | 🟢 Must   | Implement `meal-suggestion.ts` — LangChain prompt template + structured output parser (Zod schema). Takes: meal type, count, recent meals, remaining budget, favorite cuisines. Returns: array of meal suggestions with title, description, category, estimated cost, reasoning. |
| 5.4  | Suggestion API route           | 🟢 Must   | `api.ai.suggest.ts` — resource route (POST). Validates input, gathers context (recent meals from DB, remaining budget, favorite categories), calls suggestion chain, returns JSON.                                                                                               |
| 5.5  | Quick Fill UI                  | 🟢 Must   | `quick-fill-button.tsx` on the planner page. Opens a dialog showing AI suggestions for a selected slot. User picks one → creates a recipe from the suggestion and assigns it to the slot.                                                                                        |
| 5.6  | Suggestion → Recipe conversion | 🟢 Must   | When user accepts a suggestion, create a new recipe entry in the DB (title, description, category, estimated cost from AI) with a placeholder "AI-suggested" tag. User can edit details later.                                                                                   |
| 5.7  | Scraper service                | 🟢 Must   | Implement `scraper.service.ts` — fetches URL with timeout (10s), loads HTML into Cheerio, strips noise (scripts, nav, ads), extracts text from recipe-relevant selectors.                                                                                                        |
| 5.8  | Recipe parser chain            | 🟢 Must   | Implement `recipe-parser.ts` — LangChain prompt + structured output parser. Takes scraped text, returns structured recipe (title, description, ingredients, steps, times, servings).                                                                                             |
| 5.9  | URL import API route           | 🟢 Must   | `api.ai.parse-url.ts` — resource route (POST). Takes URL, calls scraper → parser chain, returns structured recipe JSON.                                                                                                                                                          |
| 5.10 | URL import UI                  | 🟢 Must   | `_app.recipes.import.tsx` — form with URL input. On submit, calls API, shows parsed preview. User can edit fields before saving. Save button calls `createRecipe()`.                                                                                                             |
| 5.11 | URL import dialog              | 🟡 Should | Alternative: `url-import-dialog.tsx` accessible from the recipe list page as a modal, so the user doesn't leave the page.                                                                                                                                                        |
| 5.12 | AI response caching            | 🟡 Should | Cache meal suggestions in memory or DB with a 24h TTL keyed by (mealType + recentMeals hash). Avoid re-calling the LLM for identical contexts.                                                                                                                                   |
| 5.13 | Error handling & fallbacks     | 🟢 Must   | Graceful error UI if LLM is unavailable (Ollama down, API key invalid, rate limit). Show user-friendly message with retry option. Never crash the app.                                                                                                                           |

### Checkpoint ✅

| #    | Criteria                                                                                          | Status |
| ---- | ------------------------------------------------------------------------------------------------- | ------ |
| C5.1 | LLM provider factory works with Ollama locally (returns a valid response)                         | ☐      |
| C5.2 | Meal suggestion API returns structured suggestions (valid JSON matching schema)                   | ☐      |
| C5.3 | Quick Fill button on planner shows AI suggestions in a dialog                                     | ☐      |
| C5.4 | Selecting a suggestion creates a recipe and assigns it to the slot                                | ☐      |
| C5.5 | URL import: pasting a recipe blog URL returns a correctly parsed recipe                           | ☐      |
| C5.6 | URL import: user can review, edit, and save the parsed recipe                                     | ☐      |
| C5.7 | URL import handles failure gracefully (invalid URL, non-recipe page, timeout)                     | ☐      |
| C5.8 | AI features degrade gracefully when LLM is unavailable (no crash, clear error message)            | ☐      |
| C5.9 | Switching `LLM_PROVIDER` env var between `ollama`/`openai`/`anthropic` works without code changes | ☐      |

---

## Phase 6 — PWA, Polish & Launch Prep

> **Goal:** Make PrepPair feel like a native app — installable, offline-capable, fast. Fix rough edges, add final polish, and prepare for daily use.

**Duration:** Weeks 11–12

### Tasks

| #    | Task                        | Tag       | Description                                                                                                                                                          |
| ---- | --------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1  | PWA manifest                | 🟢 Must   | Create `manifest.webmanifest` with app name, icons (192x192, 512x512), theme color, start URL (`/planner`), display: standalone.                                     |
| 6.2  | App icons                   | 🟢 Must   | Design or generate PrepPair icons (regular + maskable) for PWA install.                                                                                              |
| 6.3  | Service worker              | 🟢 Must   | Implement `sw.js` with caching strategies: cache-first for app shell, stale-while-revalidate for recipes/plans, network-first for grocery list, network-only for AI. |
| 6.4  | Offline support             | 🟢 Must   | Cached meal plans and recipes should be viewable offline. Grocery checklist shows last cached state. Show "offline" indicator banner when disconnected.              |
| 6.5  | Install prompt              | 🟡 Should | Detect `beforeinstallprompt` event. Show a subtle banner encouraging PWA install on first few visits.                                                                |
| 6.6  | Loading states              | 🟢 Must   | Add `loading-skeleton.tsx` for all pages (planner, recipes, grocery, budget). Show skeletons while loaders run.                                                      |
| 6.7  | Empty states                | 🟢 Must   | Design empty states for: no recipes yet, no plan this week, no grocery items, no budget entries. Include call-to-action buttons.                                     |
| 6.8  | Toast notifications         | 🟢 Must   | Success/error toasts for all mutations: recipe saved, slot assigned, expense logged, grocery generated, etc.                                                         |
| 6.9  | Mobile responsiveness audit | 🟢 Must   | Test all pages on mobile viewport (375px). Fix any layout issues. Ensure grocery checklist is thumb-friendly for in-store use.                                       |
| 6.10 | Settings page               | 🟢 Must   | `_app.settings.tsx` — change PIN, update weekly budget, update default servings. All persist to DB.                                                                  |
| 6.11 | Error boundaries            | 🟢 Must   | Add React Router error boundaries on `root.tsx` and `_app.tsx`. Show user-friendly error pages instead of white screens.                                             |
| 6.12 | Performance audit           | 🟡 Should | Run Lighthouse audit. Target: Performance > 90, PWA badge. Optimize largest contentful paint. Lazy-load Recharts and dnd-kit.                                        |
| 6.13 | CI pipeline                 | 🟡 Should | Setup GitHub Actions: Biome check → TypeScript check → Vitest run → build. Runs on push to `main` and PRs.                                                           |
| 6.14 | Write tests                 | 🟡 Should | Unit tests for: `grocery.service.ts` (aggregation logic), `recipe.service.ts` (CRUD), `auth.service.ts` (PIN verify). Integration tests for at least one full flow.  |
| 6.15 | README                      | 🟢 Must   | Comprehensive README with: project overview, tech stack, prerequisites, setup instructions (Docker + pnpm), env vars, dev commands, folder structure overview.       |
| 6.16 | Deploy to staging           | ⚪ Nice   | Deploy to Vercel with Neon PostgreSQL. Verify everything works in a production-like environment.                                                                     |

### Checkpoint ✅

| #     | Criteria                                                                           | Status |
| ----- | ---------------------------------------------------------------------------------- | ------ |
| C6.1  | App is installable as PWA on mobile (Android Chrome) and desktop                   | ☐      |
| C6.2  | Cached recipes and meal plans are viewable when offline                            | ☐      |
| C6.3  | Offline indicator appears when network is disconnected                             | ☐      |
| C6.4  | All pages show loading skeletons during data fetch                                 | ☐      |
| C6.5  | All empty states display helpful messages with CTAs                                | ☐      |
| C6.6  | Toast notifications appear for all create/update/delete actions                    | ☐      |
| C6.7  | Grocery checklist is usable on a mobile phone held in one hand (in-store scenario) | ☐      |
| C6.8  | Settings page allows changing PIN, budget, and servings                            | ☐      |
| C6.9  | App does not show white-screen crashes on any route (error boundaries work)        | ☐      |
| C6.10 | Lighthouse PWA badge achieved                                                      | ☐      |
| C6.11 | `pnpm biome check . && pnpm tsc --noEmit && pnpm vitest run` passes                | ☐      |
| C6.12 | README allows a new developer to set up and run the project in < 15 minutes        | ☐      |

---

## Summary

| Phase       | Weeks | Focus              | Key Deliverable                                |
| ----------- | ----- | ------------------ | ---------------------------------------------- |
| **Phase 1** | 1–2   | Setup & Data Layer | Running app with auth, DB, app shell           |
| **Phase 2** | 3–4   | Recipe Management  | Full recipe CRUD with ingredients and steps    |
| **Phase 3** | 5–6   | Meal Planner       | 7-day calendar with drag-and-drop              |
| **Phase 4** | 7–8   | Grocery & Budget   | Auto grocery list + budget tracking in IDR     |
| **Phase 5** | 9–10  | AI Features        | Meal suggestions + URL recipe import           |
| **Phase 6** | 11–12 | PWA & Polish       | Installable, offline-ready, production-quality |

### Milestone Markers

| Milestone                | After Phase | Significance                                               |
| ------------------------ | ----------- | ---------------------------------------------------------- |
| 🏁 **Skeleton Complete** | Phase 1     | App runs, auth works, DB is live                           |
| 🏁 **Data Foundation**   | Phase 2     | Recipe library is usable — can start entering real recipes |
| 🏁 **Core Loop**         | Phase 3     | The weekly planning workflow is functional end-to-end      |
| 🏁 **Full MVP**          | Phase 4     | All P0 features working — grocery list + budget tracking   |
| 🏁 **AI-Enhanced**       | Phase 5     | All P1 features working — the app is "smart"               |
| 🏁 **Launch Ready**      | Phase 6     | PWA optimized, polished, installable — ready for daily use |

### How to Use This Document

1. **Before starting a phase:** Read all tasks and checkpoint criteria
2. **During a phase:** Check off tasks as completed; don't move to the next phase until all 🟢 Must tasks are done
3. **At phase end:** Go through every checkpoint criterion. All must pass before moving forward
4. **If behind schedule:** Complete all 🟢 Must items; defer 🟡 Should and ⚪ Nice to Phase 6 or post-launch
5. **Track progress:** Copy the checkpoint tables to your project management tool or simply check them off in this markdown file

---

_End of Document_
