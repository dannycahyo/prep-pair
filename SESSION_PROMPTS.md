# PrepPair — Claude Code Session Prompts

> **Copy-paste these prompts into Claude Code at the start of each session.**

| Field             | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| **Document Type** | Session Prompt Templates                                       |
| **Version**       | 1.0                                                            |
| **Date**          | February 15, 2026                                              |
| **Usage**         | One prompt per Claude Code session, executed sequentially       |
| **Related**       | [PRD.md](./PRD.md) · [TRD.md](./TRD.md) · [PHASES.md](./PHASES.md) |

---

## How to Use

1. Before each session, make sure the previous phase's code is committed and working
2. Copy the entire prompt for the current phase
3. Paste it into Claude Code as the first message
4. Let Claude read the existing codebase and reference docs before it starts writing
5. At the end of each session, verify all checkpoint criteria from PHASES.md

### Important Notes

- Each prompt references `PRD.md`, `TRD.md`, and `PHASES.md` in the project root — make sure these files exist in the repo
- Prompts are designed to be self-contained — Claude Code should have enough context from the docs + codebase to execute without ambiguity
- If Claude asks clarifying questions, answer them — but it should rarely need to since the TRD is specific

---

## Phase 1 — Project Setup & Data Layer

```text
You are building a meal planning PWA called "PrepPair". Read the following project documents before doing anything:

1. Read `PRD.md` — the product requirements
2. Read `TRD.md` — the technical requirements (this is your primary reference for all implementation decisions)
3. Read `PHASES.md` — the implementation plan

You are executing **Phase 1 — Project Setup & Data Layer** (Weeks 1–2).

### Goal
A running dev environment with the full database schema, PIN authentication, and a basic app shell. By the end, I should be able to set a PIN, log in, and see a sidebar layout with navigation between empty pages.

### What to do

1. **Initialize the project** with React Router v7 in framework mode, TypeScript, Vite, and pnpm. Follow the project structure defined in TRD Section 3 exactly.

2. **Configure tooling**: Biome for linting/formatting, `tsconfig.json`, `.env.example` with all variables from TRD Section 11.

3. **Create `docker-compose.yml`** with PostgreSQL 16 (alpine) and Ollama as defined in TRD Section 11.

4. **Set up Drizzle ORM**: Install drizzle-orm, drizzle-kit, postgres.js, and @paralleldrive/cuid2. Create the full database schema exactly as defined in TRD Section 4.3 — all 6 tables (users, recipes, recipe_ingredients, meal_plans, meal_slots, grocery_items, budget_entries), all enums, all relations, all indexes. Create `drizzle.config.ts` as shown in TRD Section 4.5. Create the DB client as shown in TRD Section 4.4.

5. **Set up Tailwind CSS v4 + shadcn/ui**: Configure the theme as defined in TRD Section 5.1. Initialize shadcn/ui with the config from TRD Section 5.2. Install the core components: button, card, input, label, toast, sidebar, skeleton, dialog, dropdown-menu, sheet, separator, badge, avatar.

6. **Create the app layout shell**: `root.tsx`, `_app.tsx` (authenticated layout with a sidebar). The sidebar should have navigation links to: Planner, Recipes, Grocery, Budget, Settings. Create placeholder route files for each section that just render the page title.

7. **Implement PIN authentication**: Create `auth.service.ts` with setupPin, verifyPin, requireAuth functions as defined in TRD Section 8.1. Create the `setup.tsx` route (first-time PIN creation) and `login.tsx` route (PIN entry with numeric keypad) as shown in TRD Section 8.2. Session is stored as an HttpOnly cookie.

8. **Wire up auth guards**: The `_app.tsx` loader should call `requireAuth()`. If no session → redirect to `/login`. The `_index.tsx` route should redirect to `/setup` if no user exists, or to `/login` if user exists but no session, or to `/planner` if authenticated.

9. **Create a seed script** at `app/lib/db/seed.ts` that creates a test user (PIN: "1234") and 3-5 sample Indonesian recipes with ingredients.

### Technical constraints
- Use the exact file paths from TRD Section 3
- Use the exact schema from TRD Section 4.3 (CUID2 IDs, JSONB steps, free-text categories)
- Use pnpm as the package manager
- Use Biome (not ESLint/Prettier)
- TypeScript strict mode

### When done
Run these verification steps:
- `docker-compose up -d` starts PostgreSQL and Ollama
- `pnpm drizzle-kit generate` and `pnpm drizzle-kit migrate` create all tables
- `pnpm dev` starts the app
- Visit localhost:3000 → redirected to /setup → set PIN → redirected to /planner
- Subsequent visits → /login → enter PIN → /planner
- Sidebar navigation works between all sections
- `pnpm biome check .` passes
```

---

## Phase 2 — Recipe Management

```text
You are continuing work on "PrepPair", a meal planning PWA. Read the project documents first:

1. Read `PRD.md` — product requirements
2. Read `TRD.md` — technical requirements (your primary reference)
3. Read `PHASES.md` — specifically Phase 2

Then read the existing codebase to understand what Phase 1 built. Start by reading:
- `app/lib/db/schema.ts` (database schema)
- `app/lib/services/auth.service.ts` (auth pattern)
- `app/routes/_app.tsx` (layout structure)
- `app/components/ui/` (available shadcn components)

You are executing **Phase 2 — Recipe Management** (Weeks 3–4).

### Goal
Full recipe CRUD — create, read, update, delete recipes with ingredients and steps. This is the data foundation all other features depend on.

### What to do

1. **Create Zod validators** at `app/lib/validators/recipe.schema.ts` — follow the schema from TRD Section 6.3. Include `createRecipeSchema` with nested ingredient and step arrays.

2. **Create recipe service** at `app/lib/services/recipe.service.ts` — follow the pattern from TRD Section 6.1. Implement: `getRecipes()` (with filters: search, category, favoritesOnly), `getRecipeById()`, `createRecipe()` (use Drizzle transaction for recipe + ingredients atomically), `updateRecipe()`, `deleteRecipe()`, `toggleFavorite()`.

3. **Recipe list page** at `_app.recipes._index.tsx` — loader fetches all recipes for the user. Display as a card grid using shadcn Card components. Include a search input (filters by title) and a category filter dropdown. Show an empty state with a CTA to add the first recipe.

4. **Add recipe page** at `_app.recipes.new.tsx` — full form with all fields: title, description, category (text input), tags (comma-separated), prep time, cook time, servings, cooking style (select: fresh/batch_prep), estimated cost (IDR). Dynamic ingredient list (add/remove rows — each row: name, quantity, unit, category). Dynamic step list (add/remove — each row: instruction, optional timer). Action validates with Zod and calls createRecipe.

5. **Ingredient input component** at `app/components/recipes/ingredient-input.tsx` — reusable component for dynamic ingredient rows. Use React state to manage the list. Each row has: name (text), quantity (number), unit (text), category (text), and a remove button. "Add ingredient" button at the bottom.

6. **Recipe detail page** at `_app.recipes.$recipeId.tsx` — loader fetches recipe with ingredients by ID. Display all info: title, description, category, tags, times, servings, cost, cooking style, ingredients list, steps list. Include Edit and Delete buttons.

7. **Edit recipe** — can be a separate route or an edit mode on the detail page. Pre-fill the form with existing data. On submit, update the recipe and replace all ingredients (delete old, insert new within a transaction).

8. **Delete recipe** — confirmation dialog (use shadcn AlertDialog or Dialog). On confirm, call deleteRecipe (cascade deletes ingredients).

9. **Favorite toggle** — heart icon button on both recipe cards and detail page. Uses useFetcher to toggle `isFavorite` without full page reload.

10. **Serving scaler component** at `app/components/recipes/serving-scaler.tsx` — a number input on the recipe detail page. Changing servings recalculates all ingredient quantities proportionally (client-side only, no DB write).

### Technical constraints
- Follow the service layer pattern established in Phase 1 (plain functions, not classes)
- Use useFetcher for mutations that shouldn't cause full navigation (favorite toggle, delete)
- Use React Router actions for form submissions
- All forms must validate with Zod server-side
- Follow existing shadcn/ui component patterns
- Maintain the authenticated layout from _app.tsx

### When done
Verify these scenarios work:
- Create a recipe with 5+ ingredients and 3+ steps → appears in recipe list
- Edit the recipe → changes persist after reload
- Delete the recipe → removed from list, ingredients cleaned up (check DB)
- Toggle favorite → heart icon updates, persists after reload
- Search filters recipes by title
- Category filter narrows the recipe list
- Form validation shows errors for missing required fields
- Serving scaler recalculates ingredient quantities proportionally
```

---

## Phase 3 — Weekly Meal Planner

```text
You are continuing work on "PrepPair", a meal planning PWA. Read the project documents first:

1. Read `PRD.md` — product requirements
2. Read `TRD.md` — technical requirements (your primary reference, especially Sections 5.3, 5.4, 5.5)
3. Read `PHASES.md` — specifically Phase 3

Then read the existing codebase. Important files to understand:
- `app/lib/db/schema.ts` (meal_plans and meal_slots tables)
- `app/lib/services/recipe.service.ts` (service pattern to follow)
- `app/routes/_app.recipes.*` (route patterns to follow)
- `app/components/` (existing component patterns)

You are executing **Phase 3 — Weekly Meal Planner** (Weeks 5–6).

### Goal
The core meal planning experience — a visual 7-day calendar where I can assign recipes to meal slots, drag-and-drop them between slots, and mark meals as cooked or skipped.

### What to do

1. **Create planner service** at `app/lib/services/planner.service.ts`:
   - `getOrCreateWeekPlan(userId, weekStartDate)` — finds existing plan or creates a new one. weekStartDate should always be a Monday.
   - `assignRecipeToSlot(mealPlanId, recipeId, dayOfWeek, mealType)` — creates or updates a meal_slot
   - `removeFromSlot(slotId)` — sets recipeId to null or deletes the slot
   - `moveSlot(fromSlotId, toDayOfWeek, toMealType)` — handles moving a recipe from one slot to another, including swapping if target is occupied
   - `updateSlotStatus(slotId, status)` — mark as "cooked" or "skipped"
   - `getWeekPlanWithSlots(planId)` — returns plan with all slots and their recipes + ingredients

2. **Planner index route** at `_app.planner.tsx` — loader calculates current week's Monday, calls getOrCreateWeekPlan, redirects to `_app.planner.$weekId.tsx`.

3. **Weekly planner route** at `_app.planner.$weekId.tsx` — follow the pattern from TRD Section 5.5. Loader fetches the plan with slots and recipes. Action handles intents: "assign-recipe", "remove-slot", "move-slot", "mark-status". Include previous/next week navigation.

4. **Week calendar component** at `app/components/planner/week-calendar.tsx` — follow the dnd-kit implementation from TRD Section 5.3. Install @dnd-kit/core and @dnd-kit/utilities. 7-column grid (Mon–Sun), 3 rows per column (breakfast, lunch, dinner). Wrap in DndContext.

5. **Meal slot component** at `app/components/planner/meal-slot.tsx` — droppable target. When empty: show "+" button and a muted placeholder. When filled: show recipe title, cooking style badge, and a status indicator. The component should be draggable when filled.

6. **Recipe picker dialog** — when user clicks "+" on an empty slot, open a dialog/sheet showing the recipe collection with search. Selecting a recipe assigns it to the slot via fetcher.

7. **Drag-and-drop** — make filled meal slots draggable. On drop to a different slot, submit a "move-slot" action via fetcher. If the target slot already has a recipe, swap them.

8. **Meal status toggle** — small icon button on each filled slot to cycle: planned → cooked → skipped. Use different visual styles: cooked = green check, skipped = gray strikethrough. Submit via fetcher.

9. **Week summary bar** — top section showing: "X/21 slots filled", "X cooked", "X skipped", and estimated total cost (sum of all assigned recipes' estimatedCost).

10. **Mobile responsive** — on screens < 768px, switch from 7-column grid to a vertical scrollable list (one day at a time, or stacked days). Use Tailwind responsive classes.

### Technical constraints
- Use useFetcher (not useSubmit) for all slot mutations — this avoids full page navigation
- dnd-kit should handle the drag UI; the actual data mutation goes through React Router actions
- Date handling should use date-fns: startOfWeek (weekStartsOn: 1 for Monday), addWeeks, subWeeks, format
- The planner should auto-create a new week plan if one doesn't exist for the selected week
- All slot operations should be optimistic where possible

### When done
Verify these scenarios:
- Open /planner → shows current week's calendar (auto-created)
- Navigate to previous/next week → shows correct dates
- Click "+" on empty slot → recipe picker opens → select recipe → slot fills
- Drag a recipe from one slot to another → it moves
- Drag onto an occupied slot → recipes swap
- Mark a meal as cooked → green check appears, persists on reload
- Mark a meal as skipped → strikethrough appears
- Week summary shows correct counts
- Works on mobile viewport (375px width)
```

---

## Phase 4 — Grocery List & Budget Tracking

```text
You are continuing work on "PrepPair", a meal planning PWA. Read the project documents first:

1. Read `PRD.md` — product requirements
2. Read `TRD.md` — technical requirements (especially Sections 6.2, 6.3 for grocery and budget)
3. Read `PHASES.md` — specifically Phase 4

Then read the existing codebase. Important files:
- `app/lib/db/schema.ts` (grocery_items and budget_entries tables)
- `app/lib/services/planner.service.ts` (how plan data is structured)
- `app/lib/services/recipe.service.ts` (service pattern)

You are executing **Phase 4 — Grocery List & Budget Tracking** (Weeks 7–8).

### Goal
Two features: (1) Auto-generate a grocery checklist from the weekly meal plan, and (2) track grocery spending against a weekly budget in IDR.

### Part A: Grocery List

1. **Create grocery service** at `app/lib/services/grocery.service.ts` — follow TRD Section 6.2:
   - `generateGroceryList(mealPlanId)` — fetches all slots with recipes and ingredients, aggregates duplicates by normalized name + unit, groups by category, replaces existing grocery items for the plan
   - `getGroceryList(mealPlanId)` — returns items grouped by category
   - `toggleGroceryItem(itemId)` — flip isChecked boolean
   - `clearCheckedItems(mealPlanId)` — reset all checks

2. **Generate button** — on the planner page (`_app.planner.$weekId.tsx`), add a "Generate Grocery List" button. Action calls generateGroceryList, then redirects to the grocery page.

3. **Grocery list page** at `_app.grocery.$weekId.tsx` — loader fetches grocery items grouped by category. Display as categorized sections with checkboxes. Show total item count and checked count in a header.

4. **Check-off interaction** — `grocery-item.tsx` component with a checkbox. Toggle via fetcher with optimistic UI (checkbox changes instantly, syncs in background). Checked items should have a line-through style and move to the bottom of their category or a separate "Done" section.

5. **Cost estimate** — if recipes have estimatedCost, show estimated total at the top of the grocery list.

### Part B: Budget Tracking

6. **Create budget service** at `app/lib/services/budget.service.ts`:
   - `createBudgetEntry(userId, data)` — insert a new expense
   - `getBudgetEntries(userId, dateRange)` — fetch entries for a date range
   - `getWeeklySpending(userId, weekStartDate)` — sum of entries for a specific week
   - `getSpendingTrend(userId, weeks)` — returns an array of { week, total } for the last N weeks

7. **Create Zod validators** at `app/lib/validators/budget.schema.ts` — follow TRD Section 6.3: amount (positive number), store (optional string), date.

8. **Log expense page** at `_app.budget.log.tsx` — simple form: amount in IDR (number input), store name (text, optional), date (date picker, defaults to today). Validate with Zod, create entry via action, redirect to budget overview.

9. **Budget overview page** at `_app.budget.tsx` — loader fetches: user's weeklyBudget setting, current week's spending (sum), recent entries for current week, and spending trend (last 8 weeks). Display:
   - Budget progress bar (`budget-progress.tsx`) — spent / budget. Green < 80%, yellow 80–100%, red > 100%
   - List of this week's expense entries (amount, store, date)
   - "Log Expense" button linking to the log page
   - Spending trend chart (Recharts bar chart: week labels on x-axis, IDR amounts on y-axis)

10. **Budget progress component** at `app/components/budget/budget-progress.tsx` — visual bar using shadcn Progress or a custom Tailwind implementation. Shows "Rp X / Rp Y" text with the percentage.

11. **Spending chart** at `app/components/budget/spending-chart.tsx` — install Recharts. Simple bar chart showing weekly totals. Use IDR formatting (Rp with thousands separators).

12. **Settings update** — make sure `_app.settings.tsx` allows updating weeklyBudget and defaultServings. These should already be in the users table from Phase 1.

### Technical constraints
- IDR currency formatting: use Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }) — create a utility in `app/lib/utils/currency.ts`
- Grocery check-off must use optimistic UI via fetcher (instant feedback)
- Budget amounts are stored as decimal(15,2) — always parse/format consistently
- Recharts should be lazy-loaded (React.lazy) since it's a heavy library
- date-fns for all date operations: startOfWeek, endOfWeek, format, subWeeks

### When done
Verify these scenarios:
- Generate grocery list from a plan with 5+ recipes → correct deduplicated list appears
- Two recipes both using "garlic, 3 cloves" → grocery shows "garlic, 6 cloves"
- Items are grouped by category
- Check off items → strikethrough, persists on reload
- Log an expense → appears in budget overview
- Budget progress bar shows correct percentage and color
- Spending trend chart shows data for past weeks
- Settings page can update weekly budget
- Currency displays correctly in IDR format (e.g., Rp 350.000)
```

---

## Phase 5 — AI Features

```text
You are continuing work on "PrepPair", a meal planning PWA. Read the project documents first:

1. Read `PRD.md` — product requirements
2. Read `TRD.md` — technical requirements (especially Section 7 — AI/LLM Integration)
3. Read `PHASES.md` — specifically Phase 5

Then read the existing codebase. Important files:
- `app/lib/db/schema.ts` (to understand data structures AI will work with)
- `app/lib/services/recipe.service.ts` (createRecipe — AI will create recipes)
- `app/lib/services/planner.service.ts` (assignRecipeToSlot — AI suggestions get assigned)
- `app/lib/services/budget.service.ts` (getWeeklySpending — AI needs budget context)

You are executing **Phase 5 — AI Features** (Weeks 9–10).

### Goal
Integrate LLM-powered meal suggestions and recipe URL import. Two features: (1) AI suggests meals for empty planner slots, and (2) paste a recipe URL and AI extracts structured recipe data.

### Part A: LLM Foundation

1. **Install LangChain dependencies**:
   ```
   pnpm add langchain @langchain/core @langchain/openai @langchain/anthropic @langchain/ollama
   ```

2. **Create LLM provider factory** at `app/lib/ai/provider.ts` — follow TRD Section 7.1 exactly. Factory function that reads LLM_PROVIDER env var and returns the appropriate LangChain chat model (ChatOllama, ChatOpenAI, or ChatAnthropic). Include a low-temperature variant for parsing tasks.

3. **Verify Ollama works** — the Docker Compose from Phase 1 should have Ollama running. Pull a model: `docker exec -it <ollama_container> ollama pull llama3.1:8b`. Test the provider factory returns a valid response.

### Part B: Meal Suggestions

4. **Create prompt templates** at `app/lib/ai/prompts.ts` — store all prompt templates in one file. Include the meal suggestion system prompt from TRD Section 7.2.

5. **Create meal suggestion chain** at `app/lib/ai/meal-suggestion.ts` — follow TRD Section 7.2. LangChain prompt template + StructuredOutputParser with Zod schema. Input: mealType, count, recentMeals, remainingBudget, favoriteCuisines. Output: array of { title, description, category, estimatedCost, cookingStyle, reasoning }.

6. **Create suggestion API route** at `app/routes/api.ai.suggest.ts` — resource route (POST only, no UI). Validates input with Zod. Gathers context from DB: recent cooked meals (last 30 slots), remaining budget for the week, favorite recipe categories. Calls the suggestion chain. Returns JSON array of suggestions. Handle errors gracefully (return 503 if LLM unavailable).

7. **Quick Fill UI** — on the planner page, add a "Quick Fill" button (or per-slot "Suggest" button). Clicking it opens a dialog that:
   - Calls the suggestion API for the selected meal type
   - Shows a loading state while waiting
   - Displays 3 suggestions as selectable cards (title, description, estimated cost, reasoning)
   - Selecting one creates a new recipe in the DB and assigns it to the slot
   - Shows error state if AI is unavailable, with a "Try again" button

8. **Suggestion → Recipe conversion** — when user picks a suggestion, create a recipe with: title, description, category, estimatedCost, cookingStyle from the suggestion. Add a tag "ai-suggested" for identification. Ingredients and steps should be empty (user fills later) or you can make a second LLM call to generate them.

### Part C: URL Recipe Import

9. **Create scraper service** at `app/lib/services/scraper.service.ts` — fetch URL with 10-second timeout and a User-Agent header. Load into Cheerio. Remove noise elements (script, style, nav, footer, header, .ad, .sidebar). Extract text from recipe-relevant selectors (article, .recipe, [itemtype*='Recipe'], main). Trim to 6000 chars max.

10. **Create recipe parser chain** at `app/lib/ai/recipe-parser.ts` — follow TRD Section 7.3. LangChain prompt + StructuredOutputParser. Input: scraped page text. Output: { title, description, prepTime, cookTime, servings, category, ingredients[], steps[] }.

11. **Create URL parse API route** at `app/routes/api.ai.parse-url.ts` — resource route (POST). Takes a URL string. Calls scraper → parser chain. Returns structured recipe JSON. Handles errors: invalid URL, fetch timeout, non-recipe page, LLM failure.

12. **URL import page** at `_app.recipes.import.tsx` — form with a URL input field. On submit:
    - Show loading state ("Analyzing recipe...")
    - Call the parse API
    - Display parsed result in an editable recipe form (pre-filled with AI output)
    - User reviews, edits if needed, then saves
    - On save, call createRecipe and redirect to the recipe detail page

13. **Error handling** — all AI features must degrade gracefully:
    - If Ollama is not running: show "AI unavailable — please check Ollama is running"
    - If API key is missing/invalid: show "AI service configuration error"
    - If LLM returns unparseable output: show "Could not understand the response — try again"
    - Never crash the app or show raw error traces to the user

### Technical constraints
- All LLM calls must be server-side only (inside resource route actions, never in client code)
- Use StructuredOutputParser with Zod schemas for all LLM outputs — never raw string parsing
- Provider factory must be switchable via LLM_PROVIDER env var without code changes
- URL scraping must have a 10-second timeout (AbortSignal.timeout)
- Rate limit: don't implement formal rate limiting, but design API routes so it can be added later

### When done
Verify these scenarios:
- Set LLM_PROVIDER=ollama → suggestion API returns valid JSON with meal suggestions
- Quick Fill on planner shows suggestions → selecting one creates a recipe and fills the slot
- Paste a recipe blog URL → parsed preview shows correct title, ingredients, steps
- Edit the parsed recipe → save → recipe appears in library
- Try a non-recipe URL (e.g., news article) → graceful error message
- Stop Ollama container → AI features show "unavailable" message, app continues working
- Switch LLM_PROVIDER to openai (with valid key) → same features work with OpenAI
```

---

## Phase 6 — PWA, Polish & Launch Prep

```text
You are continuing work on "PrepPair", a meal planning PWA. Read the project documents first:

1. Read `PRD.md` — product requirements
2. Read `TRD.md` — technical requirements (especially Section 9 — PWA Configuration)
3. Read `PHASES.md` — specifically Phase 6

Then read the full existing codebase to understand everything that's been built. This phase is about polish and production-readiness, not new features.

You are executing **Phase 6 — PWA, Polish & Launch Prep** (Weeks 11–12).

### Goal
Make PrepPair feel like a native app — installable, offline-capable, fast. Fix rough edges across all pages, add proper loading/empty/error states, and prepare for daily use.

### Part A: PWA

1. **Create manifest** at `public/manifest.webmanifest` — follow TRD Section 9.1. App name "PrepPair", start_url "/planner", display standalone, theme color #1F4E79.

2. **Create app icons** — generate or create simple icons at 192x192 and 512x512 (PNG). Include a maskable variant. Place in `public/icons/`.

3. **Service worker** at `public/sw.js` — implement caching strategies from TRD Section 9.2:
   - Cache-first for app shell (HTML, CSS, JS bundles)
   - Stale-while-revalidate for recipe and meal plan data
   - Network-first for grocery list
   - Network-only for AI endpoints
   - Cache-first with 30-day expiry for images

4. **Register service worker** in `app/entry.client.tsx` — register sw.js on app load.

5. **Offline support** — when offline, cached recipes and meal plans should be viewable. Show an "You're offline" banner at the top of the app when navigator.onLine is false.

6. **Install prompt** — listen for `beforeinstallprompt` event. Show a dismissible banner on the planner page: "Install PrepPair for quick access" with an Install button.

### Part B: Loading & Empty States

7. **Loading skeletons** — create `loading-skeleton.tsx` variations for:
   - Recipe card grid (3 skeleton cards)
   - Weekly planner grid (7x3 skeleton slots)
   - Grocery list (8 skeleton rows)
   - Budget overview (skeleton bar + skeleton entries)
   Use shadcn Skeleton component. Show these while loaders are pending.

8. **Empty states** — create `empty-state.tsx` component. Add to:
   - Recipes page (no recipes): "Add your first recipe" with CTA button → /recipes/new
   - Planner (empty week): "Start planning your week" with guidance text
   - Grocery list (no items): "Generate your grocery list from the planner"
   - Budget (no entries): "Log your first grocery expense"

### Part C: Error Handling & Feedback

9. **Error boundaries** — add React Router errorElement on `root.tsx` (catch-all) and `_app.tsx` (authenticated area). Show a user-friendly error page with "Something went wrong" message and a "Go back" button. Never show raw stack traces.

10. **Toast notifications** — ensure all mutations show toast feedback:
    - Recipe created/updated/deleted
    - Meal slot assigned/moved/status changed
    - Grocery list generated
    - Grocery item checked (no toast needed — too frequent)
    - Budget entry logged
    - Settings updated
    - AI suggestion accepted
    - URL import succeeded/failed

### Part D: Settings & Final Pages

11. **Settings page** at `_app.settings.tsx` — complete implementation:
    - Change PIN (current PIN + new PIN + confirm)
    - Update weekly budget (IDR amount)
    - Update default servings
    - App info section (version, "Built with love by Danny")

### Part E: Quality & Deployment

12. **Mobile responsiveness audit** — test every page at 375px width:
    - Planner calendar should stack vertically on mobile
    - Grocery checklist should be thumb-friendly (large touch targets)
    - Forms should not overflow horizontally
    - Sidebar should collapse to a hamburger menu on mobile

13. **Performance** — lazy-load heavy dependencies:
    - `React.lazy(() => import("recharts"))` for budget charts
    - Ensure dnd-kit is only loaded on the planner route
    - Run `pnpm build` and check bundle sizes

14. **CI pipeline** — create `.github/workflows/ci.yml` following TRD Section 12.2. Jobs: biome check → tsc --noEmit → vitest run → build.

15. **Write core tests** with Vitest:
    - `grocery.service.test.ts` — test ingredient aggregation logic
    - `recipe.service.test.ts` — test CRUD operations
    - `auth.service.test.ts` — test PIN hash/verify
    - `planner.service.test.ts` — test slot assignment and move logic

16. **README.md** — comprehensive project README:
    - Project description and screenshots placeholder
    - Tech stack summary
    - Prerequisites (Node 22, pnpm, Docker)
    - Setup instructions (clone, install, docker-compose up, migrate, seed, dev)
    - Environment variables reference
    - Project structure overview
    - Available scripts (dev, build, test, lint, migrate)

### Technical constraints
- Service worker must not interfere with dev mode (only register in production)
- PWA manifest must be linked in root.tsx <head>
- All toasts should use the existing shadcn toast system from Phase 1
- Tests should use a test database (separate from dev)
- CI pipeline should use PostgreSQL service container

### When done
Verify these scenarios:
- App is installable as PWA on Android Chrome and desktop Chrome
- Installed PWA opens directly to /planner
- Turn off WiFi → cached recipes and plans are still viewable → "offline" banner shows
- All pages show loading skeletons during data fetch
- All empty states have helpful messages with action buttons
- Toasts appear for all create/update/delete actions
- Grocery checklist is usable one-handed on mobile
- Settings allows changing PIN, budget, servings
- Error boundary catches a simulated error (no white screen)
- `pnpm biome check . && pnpm tsc --noEmit && pnpm vitest run && pnpm build` all pass
- Lighthouse audit: Performance > 85, PWA badge
- README allows setup from scratch
```

---

## Quick Reference

| Phase   | Session Prompt                | Prerequisites                    |
| ------- | ----------------------------- | -------------------------------- |
| Phase 1 | Setup & Data Layer            | Empty repo                       |
| Phase 2 | Recipe Management             | Phase 1 complete + verified      |
| Phase 3 | Meal Planner                  | Phase 2 complete + verified      |
| Phase 4 | Grocery & Budget              | Phase 3 complete + verified      |
| Phase 5 | AI Features                   | Phase 4 complete + verified      |
| Phase 6 | PWA & Polish                  | Phase 5 complete + verified      |

> **Rule:** Never start Phase N+1 until all checkpoints from Phase N pass.
