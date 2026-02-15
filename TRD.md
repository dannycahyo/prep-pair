# PrepPair — Technical Requirements Document

> **Technical Architecture & Implementation Specification**

| Field                | Value                                 |
| -------------------- | ------------------------------------- |
| **Product Name**     | PrepPair                              |
| **Document Type**    | Technical Requirements Document (TRD) |
| **Version**          | 1.2                                   |
| **Author**           | Danny (Software Engineer)             |
| **Date**             | February 15, 2026                     |
| **Status**           | Draft                                 |
| **Related Document** | [PRD.md](./PRD.md)                    |

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Design](#4-database-design)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [Authentication](#7-authentication)
8. [PWA Configuration](#8-pwa-configuration)
9. [Environment & Configuration](#9-environment--configuration)
10. [DevOps & Deployment](#10-devops--deployment)
11. [Testing Strategy](#11-testing-strategy)
12. [Performance & Security](#12-performance--security)
13. [Future-Proofing & Scalability](#13-future-proofing--scalability)

---

## 1. Architecture Overview

PrepPair is a **full-stack monolith** built on React Router v7 in **framework mode**. The entire application — UI, server-side logic (loaders/actions), and data access — lives in a single deployable unit.

The v1 design prioritizes **simplicity**: single-user, PIN-protected, no AI, no real-time sync. The codebase is structured with clear separation of concerns (service layer, schema, validators) so that AI integration, multi-user support, and advanced features can be added later without a rewrite.

### 1.1 High-Level Architecture

```
┌────────────────────────────────────────────────┐
│               Client (PWA)                      │
│  React Router v7 · Tailwind CSS v4 · shadcn/ui  │
└─────────────────────┬──────────────────────────┘
                      │ HTTP
┌─────────────────────▼──────────────────────────┐
│         React Router v7 (Framework Mode)        │
│  ┌───────────┐  ┌──────────┐                    │
│  │  Loaders  │  │ Actions  │                    │
│  └─────┬─────┘  └────┬─────┘                    │
│        └──────────────┘                         │
│  ┌─────────────────────────────────────────┐    │
│  │       Service Layer (TypeScript)         │    │
│  │       Drizzle ORM · Zod                  │    │
│  └──────────────┬──────────────────────────┘    │
└─────────────────┼───────────────────────────────┘
                  │
         ┌────────▼──────┐
         │ PostgreSQL 16  │
         └────────────────┘
```

### 1.2 Key Architectural Decisions

| Decision        | Choice                                    | Rationale                                                            |
| --------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| Architecture    | Monolith (React Router v7 framework mode) | Single deployable; loaders/actions as backend                        |
| Data model      | Single-user with `userId` FK              | Simple now; add `householdId` later for multi-user                   |
| ORM             | Drizzle ORM                               | Type-safe, SQL-first, lightweight; consistent with FinIslam          |
| Styling         | Tailwind CSS v4 + shadcn/ui               | Utility-first CSS with accessible components                         |
| Auth            | PIN (bcrypt hashed)                       | Minimal friction for personal use; upgrade to Auth.js for multi-user |
| State           | React Router loaderData + React useState  | No external state library needed for v1 complexity                   |
| Validation      | Zod                                       | Shared client/server schema validation                               |
| AI              | Deferred to v2                            | Ship core app first; add LangChain + LLM integration later           |
| Package Manager | pnpm                                      | Fast, disk-efficient                                                 |

---

## 2. Tech Stack

### 2.1 Core Stack

| Layer          | Technology                       | Version | Purpose                                        |
| -------------- | -------------------------------- | ------- | ---------------------------------------------- |
| **Framework**  | React Router v7 (Framework Mode) | 7.x     | Full-stack monolith with SSR, loaders, actions |
| **Language**   | TypeScript                       | 5.5+    | End-to-end type safety                         |
| **Runtime**    | Node.js                          | 22 LTS  | Server runtime                                 |
| **Database**   | PostgreSQL                       | 16+     | Primary data store                             |
| **ORM**        | Drizzle ORM                      | Latest  | Type-safe SQL, migrations                      |
| **Validation** | Zod                              | 3.x     | Shared schema validation                       |

### 2.2 Frontend Stack

| Technology       | Version | Purpose                                       |
| ---------------- | ------- | --------------------------------------------- |
| **React**        | 19.x    | UI framework                                  |
| **Tailwind CSS** | v4      | Utility-first styling                         |
| **shadcn/ui**    | Latest  | Accessible component library (Radix UI based) |
| **dnd-kit**      | 6.x     | Drag-and-drop for meal calendar               |
| **Recharts**     | 2.x     | Budget charts and spending visualization      |
| **Lucide React** | Latest  | Icon library                                  |
| **date-fns**     | 4.x     | Date manipulation and formatting              |

### 2.3 Backend Stack

| Technology      | Version | Purpose                           |
| --------------- | ------- | --------------------------------- |
| **Drizzle ORM** | Latest  | PostgreSQL queries and migrations |
| **drizzle-kit** | Latest  | Migration generation              |
| **bcryptjs**    | 2.x     | PIN hashing                       |
| **Zod**         | 3.x     | Server-side input validation      |

### 2.4 Development & Tooling

| Tool               | Purpose                                 |
| ------------------ | --------------------------------------- |
| **pnpm**           | Package management                      |
| **Vite**           | Build tool (via React Router v7 plugin) |
| **Biome**          | Linting and formatting                  |
| **Vitest**         | Unit and integration testing            |
| **Playwright**     | E2E testing                             |
| **Docker Compose** | Local PostgreSQL                        |
| **GitHub Actions** | CI/CD pipeline                          |

---

## 3. Project Structure

```
preppair/
├── app/
│   ├── routes/
│   │   ├── _index.tsx                  # Redirect → /planner or /login
│   │   ├── login.tsx                   # PIN entry screen
│   │   ├── setup.tsx                   # First-time setup (PIN, budget, servings)
│   │   ├── _app.tsx                    # Authenticated layout (sidebar, nav)
│   │   ├── _app.planner.tsx            # Weekly meal planner (default view)
│   │   ├── _app.planner.$weekId.tsx    # Specific week plan
│   │   ├── _app.recipes.tsx            # Recipe list layout
│   │   ├── _app.recipes._index.tsx     # Recipe collection
│   │   ├── _app.recipes.new.tsx        # Add recipe (manual)
│   │   ├── _app.recipes.$recipeId.tsx  # Recipe detail / edit
│   │   ├── _app.grocery.$weekId.tsx    # Grocery checklist for a week
│   │   ├── _app.budget.tsx             # Budget overview & trends
│   │   ├── _app.budget.log.tsx         # Log an expense
│   │   └── _app.settings.tsx           # Settings (PIN, budget, servings)
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   ├── planner/
│   │   │   ├── week-calendar.tsx       # 7-day grid
│   │   │   ├── meal-slot.tsx           # Droppable meal slot
│   │   │   └── recipe-card-draggable.tsx
│   │   ├── recipes/
│   │   │   ├── recipe-form.tsx         # Manual entry form
│   │   │   ├── recipe-card.tsx         # Preview card
│   │   │   ├── ingredient-input.tsx    # Dynamic ingredient list
│   │   │   └── serving-scaler.tsx
│   │   ├── budget/
│   │   │   ├── budget-progress.tsx     # Progress bar
│   │   │   ├── expense-form.tsx
│   │   │   └── spending-chart.tsx      # Recharts trends
│   │   ├── grocery/
│   │   │   ├── grocery-list.tsx        # Categorized checklist
│   │   │   └── grocery-item.tsx        # Check-off item
│   │   └── shared/
│   │       ├── app-sidebar.tsx
│   │       ├── empty-state.tsx
│   │       └── loading-skeleton.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts               # Drizzle client
│   │   │   ├── schema.ts              # All table definitions
│   │   │   └── seed.ts                # Optional dev seed data
│   │   ├── services/
│   │   │   ├── auth.service.ts        # PIN verification
│   │   │   ├── recipe.service.ts      # Recipe CRUD
│   │   │   ├── planner.service.ts     # Meal plan & slot management
│   │   │   ├── grocery.service.ts     # Grocery list generation
│   │   │   └── budget.service.ts      # Budget tracking
│   │   ├── validators/
│   │   │   ├── recipe.schema.ts       # Zod schemas
│   │   │   ├── planner.schema.ts
│   │   │   └── budget.schema.ts
│   │   └── utils/
│   │       ├── currency.ts            # IDR formatting
│   │       └── date.ts               # date-fns helpers
│   │
│   ├── root.tsx
│   ├── entry.client.tsx               # Service worker registration
│   └── entry.server.tsx
│
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
│
├── drizzle/
│   └── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker-compose.yml
├── drizzle.config.ts
├── react-router.config.ts
├── vite.config.ts
├── components.json                    # shadcn/ui config
├── biome.json
├── package.json
├── .env.example
├── PRD.md
├── TRD.md
└── README.md
```

---

## 4. Database Design

### 4.1 Entity-Relationship Diagram

```
┌──────────────┐
│    users      │
│              │
│ id (PK)      │──────────────────────────────────────┐
│ pinHash       │                                      │
│ weeklyBudget  │     ┌───────────────────┐            │
│ defaultServ.  │     │     recipes       │            │
│ createdAt     │     │                   │            │
│ updatedAt     │     │ id (PK)           │            │
└──────────────┘     │ userId (FK) ──────┤            │
                      │ title             │            │
                      │ description       │            │
                      │ sourceUrl         │            │
                      │ prepTime          │            │
                      │ cookTime          │            │
                      │ servings          │            │
                      │ category          │            │
                      │ tags (text[])     │            │
                      │ imageUrl          │            │
                      │ cookingStyle      │            │
                      │ isFavorite        │            │
                      │ estimatedCost     │            │
                      │ steps (jsonb)     │◄── JSON    │
                      │ createdAt         │            │
                      │ updatedAt         │            │
                      └────────┬──────────┘            │
                               │                       │
                      ┌────────▼──────────┐            │
                      │recipe_ingredients │            │
                      │                   │            │
                      │ id (PK)           │            │
                      │ recipeId (FK)     │            │
                      │ name              │            │
                      │ quantity           │            │
                      │ unit              │            │
                      │ category (text)   │            │
                      │ sortOrder         │            │
                      └───────────────────┘            │
                                                       │
┌──────────────────┐     ┌──────────────────┐          │
│   meal_plans     │     │   meal_slots      │          │
│                  │     │                  │          │
│ id (PK)          │     │ id (PK)          │          │
│ userId (FK) ─────┼─────│ mealPlanId (FK)  │          │
│ weekStartDate    │     │ recipeId (FK)    │──► recipes│
│ createdAt        │     │ dayOfWeek (0-6)  │          │
│ updatedAt        │     │ mealType         │          │
└──────────────────┘     │ status           │          │
                          │ createdAt        │          │
                          └──────────────────┘          │
                                                       │
┌──────────────────┐     ┌──────────────────┐          │
│  grocery_items   │     │  budget_entries   │          │
│                  │     │                  │          │
│ id (PK)          │     │ id (PK)          │          │
│ mealPlanId (FK)  │     │ userId (FK) ─────┼──────────┘
│ ingredientName   │     │ amount           │
│ totalQuantity    │     │ store            │
│ unit             │     │ date             │
│ category (text)  │     │ createdAt        │
│ isChecked        │     └──────────────────┘
│ createdAt        │
└──────────────────┘
```

### 4.2 Design Decisions

| Decision                                  | Rationale                                                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **`steps` as JSONB on `recipes`**         | Steps are always fetched with the recipe, never queried independently. Eliminates a join.                      |
| **`category` as free text (not enum)**    | Flexible text field avoids rigid enums. Users can type their own categories.                                   |
| **No `households` / `household_members`** | Single user model. All tables use `userId` FK. To go multi-user: add `householdId` column and migrate scoping. |
| **`weekStartDate` as unique per user**    | One plan per week. Enforced by unique index on `(userId, weekStartDate)`.                                      |
| **`sourceUrl` on recipes**                | Preserved for when AI URL import is added in v2. Users can still manually note the source.                     |

### 4.3 Drizzle Schema Definition

```typescript
// app/lib/db/schema.ts
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ── Enums ──────────────────────────────────────────────

export const mealTypeEnum = pgEnum('meal_type', [
  'breakfast',
  'lunch',
  'dinner',
]);

export const mealSlotStatusEnum = pgEnum('meal_slot_status', [
  'planned',
  'cooked',
  'skipped',
]);

export const cookingStyleEnum = pgEnum('cooking_style', [
  'fresh',
  'batch_prep',
]);

// ── Tables ─────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  pinHash: text('pin_hash').notNull(),
  weeklyBudget: decimal('weekly_budget', {
    precision: 15,
    scale: 2,
  }).default('500000'),
  defaultServings: integer('default_servings').notNull().default(2),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const recipes = pgTable(
  'recipes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    sourceUrl: text('source_url'),
    prepTime: integer('prep_time'), // minutes
    cookTime: integer('cook_time'), // minutes
    servings: integer('servings').notNull().default(2),
    category: varchar('category', { length: 100 }),
    tags: text('tags').array(),
    imageUrl: text('image_url'),
    cookingStyle: cookingStyleEnum('cooking_style').default('fresh'),
    isFavorite: boolean('is_favorite').notNull().default(false),
    estimatedCost: decimal('estimated_cost', {
      precision: 15,
      scale: 2,
    }),
    steps: jsonb('steps').$type<RecipeStep[]>().default([]),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('recipes_user_idx').on(table.userId),
    index('recipes_category_idx').on(table.category),
  ],
);

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 3 }),
  unit: varchar('unit', { length: 50 }),
  category: varchar('category', { length: 100 }),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const mealPlans = pgTable(
  'meal_plans',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    weekStartDate: date('week_start_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('meal_plans_week_unique').on(
      table.userId,
      table.weekStartDate,
    ),
  ],
);

export const mealSlots = pgTable(
  'meal_slots',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    mealPlanId: text('meal_plan_id')
      .notNull()
      .references(() => mealPlans.id, { onDelete: 'cascade' }),
    recipeId: text('recipe_id').references(() => recipes.id, {
      onDelete: 'set null',
    }),
    dayOfWeek: integer('day_of_week').notNull(),
    mealType: mealTypeEnum('meal_type').notNull(),
    status: mealSlotStatusEnum('status').notNull().default('planned'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('meal_slots_unique').on(
      table.mealPlanId,
      table.dayOfWeek,
      table.mealType,
    ),
    index('meal_slots_plan_idx').on(table.mealPlanId),
  ],
);

export const groceryItems = pgTable(
  'grocery_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    mealPlanId: text('meal_plan_id')
      .notNull()
      .references(() => mealPlans.id, { onDelete: 'cascade' }),
    ingredientName: varchar('ingredient_name', {
      length: 255,
    }).notNull(),
    totalQuantity: decimal('total_quantity', {
      precision: 10,
      scale: 3,
    }),
    unit: varchar('unit', { length: 50 }),
    category: varchar('category', { length: 100 }),
    isChecked: boolean('is_checked').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('grocery_items_plan_idx').on(table.mealPlanId)],
);

export const budgetEntries = pgTable(
  'budget_entries',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    store: varchar('store', { length: 255 }),
    date: date('date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('budget_entries_user_idx').on(table.userId),
    index('budget_entries_date_idx').on(table.date),
  ],
);

// ── Types ──────────────────────────────────────────────

export type RecipeStep = {
  instruction: string;
  timerSeconds?: number;
};

// ── Relations ──────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  mealPlans: many(mealPlans),
  budgetEntries: many(budgetEntries),
}));

export const recipesRelations = relations(
  recipes,
  ({ one, many }) => ({
    user: one(users, {
      fields: [recipes.userId],
      references: [users.id],
    }),
    ingredients: many(recipeIngredients),
    mealSlots: many(mealSlots),
  }),
);

export const recipeIngredientsRelations = relations(
  recipeIngredients,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredients.recipeId],
      references: [recipes.id],
    }),
  }),
);

export const mealPlansRelations = relations(
  mealPlans,
  ({ one, many }) => ({
    user: one(users, {
      fields: [mealPlans.userId],
      references: [users.id],
    }),
    slots: many(mealSlots),
    groceryItems: many(groceryItems),
  }),
);

export const mealSlotsRelations = relations(mealSlots, ({ one }) => ({
  mealPlan: one(mealPlans, {
    fields: [mealSlots.mealPlanId],
    references: [mealPlans.id],
  }),
  recipe: one(recipes, {
    fields: [mealSlots.recipeId],
    references: [recipes.id],
  }),
}));

export const groceryItemsRelations = relations(
  groceryItems,
  ({ one }) => ({
    mealPlan: one(mealPlans, {
      fields: [groceryItems.mealPlanId],
      references: [mealPlans.id],
    }),
  }),
);

export const budgetEntriesRelations = relations(
  budgetEntries,
  ({ one }) => ({
    user: one(users, {
      fields: [budgetEntries.userId],
      references: [users.id],
    }),
  }),
);
```

### 4.4 Database Client

```typescript
// app/lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
```

### 4.5 Drizzle Kit Config

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './app/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

---

## 5. Frontend Architecture

### 5.1 Tailwind CSS v4 Theme

```css
/* app/app.css */
@import 'tailwindcss';

@theme {
  --color-primary: oklch(0.205 0.064 285.885);
  --color-primary-foreground: oklch(0.985 0 0);
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-muted: oklch(0.97 0 0);
  --color-muted-foreground: oklch(0.556 0.013 285.938);
  --color-destructive: oklch(0.577 0.245 27.325);
  --color-success: oklch(0.627 0.194 149.214);
  --color-warning: oklch(0.769 0.188 70.08);
  --color-border: oklch(0.922 0 0);
  --radius-lg: 0.5rem;
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}
```

### 5.2 shadcn/ui Setup

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/app.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "~/components",
    "utils": "~/lib/utils",
    "ui": "~/components/ui"
  }
}
```

**Required components:**

```bash
pnpm dlx shadcn@latest add button card dialog input label select \
  sidebar table tabs toast form checkbox badge separator \
  skeleton progress popover dropdown-menu sheet
```

### 5.3 Drag-and-Drop (dnd-kit)

```typescript
// app/components/planner/week-calendar.tsx (simplified)
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { useFetcher } from "react-router";

export function WeekCalendar({ plan }: { plan: MealPlanWithSlots }) {
  const fetcher = useFetcher();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    fetcher.submit(
      {
        intent: "move-slot",
        fromSlotId: String(active.id),
        toDay: String(over.data.current?.dayOfWeek),
        toMealType: String(over.data.current?.mealType),
      },
      { method: "post" }
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day, i) => (
          <div key={day} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">{day}</h3>
            {(["breakfast", "lunch", "dinner"] as const).map((type) => (
              <MealSlot
                key={`${i}-${type}`}
                dayOfWeek={i}
                mealType={type}
                slot={findSlot(plan.slots, i, type)}
              />
            ))}
          </div>
        ))}
      </div>
    </DndContext>
  );
}
```

### 5.4 Type-Safe Route Example

```typescript
// app/routes/_app.planner.$weekId.tsx
import type { Route } from "./+types/_app.planner.$weekId";
import { db } from "~/lib/db";
import { mealPlans } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "~/lib/services/auth.service";

export async function loader({ params, request }: Route.LoaderArgs) {
  const userId = await requireAuth(request);

  const plan = await db.query.mealPlans.findFirst({
    where: eq(mealPlans.id, params.weekId),
    with: {
      slots: {
        with: { recipe: { with: { ingredients: true } } },
      },
    },
  });

  if (!plan || plan.userId !== userId) {
    throw new Response("Not found", { status: 404 });
  }

  return { plan };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "move-slot":
      break;
    case "assign-recipe":
      break;
    case "mark-status":
      break;
  }

  return { success: true };
}

export default function PlannerWeek({ loaderData }: Route.ComponentProps) {
  const { plan } = loaderData;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Week of {formatDate(plan.weekStartDate)}
      </h1>
      <WeekCalendar plan={plan} />
    </div>
  );
}
```

---

## 6. Backend Architecture

### 6.1 Service Layer

All business logic lives in the service layer. Services are **plain functions** that accept parameters and return data.

```typescript
// app/lib/services/recipe.service.ts
import { db } from '~/lib/db';
import { recipes, recipeIngredients } from '~/lib/db/schema';
import { eq, and, ilike, desc } from 'drizzle-orm';
import type { CreateRecipeInput } from '~/lib/validators/recipe.schema';

export async function getRecipes(
  userId: string,
  filters?: {
    category?: string;
    search?: string;
    favoritesOnly?: boolean;
  },
) {
  const conditions = [eq(recipes.userId, userId)];
  if (filters?.category)
    conditions.push(eq(recipes.category, filters.category));
  if (filters?.search)
    conditions.push(ilike(recipes.title, `%${filters.search}%`));
  if (filters?.favoritesOnly)
    conditions.push(eq(recipes.isFavorite, true));

  return db.query.recipes.findMany({
    where: and(...conditions),
    with: { ingredients: true },
    orderBy: [desc(recipes.updatedAt)],
  });
}

export async function createRecipe(
  input: CreateRecipeInput,
  userId: string,
) {
  return db.transaction(async (tx) => {
    const [recipe] = await tx
      .insert(recipes)
      .values({
        userId,
        title: input.title,
        description: input.description,
        sourceUrl: input.sourceUrl,
        prepTime: input.prepTime,
        cookTime: input.cookTime,
        servings: input.servings,
        category: input.category,
        tags: input.tags,
        cookingStyle: input.cookingStyle,
        estimatedCost: input.estimatedCost,
        steps: input.steps,
      })
      .returning();

    if (input.ingredients?.length) {
      await tx.insert(recipeIngredients).values(
        input.ingredients.map((ing, i) => ({
          recipeId: recipe.id,
          name: ing.name,
          quantity: ing.quantity?.toString(),
          unit: ing.unit,
          category: ing.category,
          sortOrder: i,
        })),
      );
    }

    return recipe;
  });
}
```

### 6.2 Grocery List Generation

```typescript
// app/lib/services/grocery.service.ts
import { db } from '~/lib/db';
import { groceryItems, mealSlots } from '~/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function generateGroceryList(mealPlanId: string) {
  const slots = await db.query.mealSlots.findMany({
    where: eq(mealSlots.mealPlanId, mealPlanId),
    with: { recipe: { with: { ingredients: true } } },
  });

  const aggregated = new Map<
    string,
    {
      name: string;
      quantity: number;
      unit: string;
      category: string;
    }
  >();

  for (const slot of slots) {
    if (!slot.recipe) continue;
    for (const ing of slot.recipe.ingredients) {
      const key = `${ing.name.toLowerCase().trim()}::${(ing.unit ?? '').toLowerCase()}`;
      const existing = aggregated.get(key);
      if (existing) {
        existing.quantity += Number(ing.quantity ?? 0);
      } else {
        aggregated.set(key, {
          name: ing.name,
          quantity: Number(ing.quantity ?? 0),
          unit: ing.unit ?? '',
          category: ing.category ?? 'other',
        });
      }
    }
  }

  await db
    .delete(groceryItems)
    .where(eq(groceryItems.mealPlanId, mealPlanId));

  const items = Array.from(aggregated.values());
  if (items.length) {
    await db.insert(groceryItems).values(
      items.map((item) => ({
        mealPlanId,
        ingredientName: item.name,
        totalQuantity: String(item.quantity),
        unit: item.unit,
        category: item.category,
      })),
    );
  }

  return items;
}
```

### 6.3 Zod Validators

```typescript
// app/lib/validators/recipe.schema.ts
import { z } from 'zod';

const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().positive().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
});

const stepSchema = z.object({
  instruction: z.string().min(1),
  timerSeconds: z.coerce.number().int().positive().optional(),
});

export const createRecipeSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  prepTime: z.coerce.number().int().nonnegative().optional(),
  cookTime: z.coerce.number().int().nonnegative().optional(),
  servings: z.coerce.number().int().positive().default(2),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  cookingStyle: z.enum(['fresh', 'batch_prep']).default('fresh'),
  estimatedCost: z.coerce.number().nonnegative().optional(),
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(stepSchema).min(1),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;

// app/lib/validators/budget.schema.ts
export const createBudgetEntrySchema = z.object({
  amount: z.coerce.number().positive(),
  store: z.string().max(255).optional(),
  date: z.string().date(),
});
```

---

## 7. Authentication

### 7.1 PIN-Based Auth

```typescript
// app/lib/services/auth.service.ts
import bcrypt from 'bcryptjs';
import { db } from '~/lib/db';
import { users } from '~/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'react-router';

const SESSION_COOKIE = 'preppair_session';

export async function setupPin(pin: string): Promise<string> {
  const pinHash = await bcrypt.hash(pin, 10);
  const [user] = await db
    .insert(users)
    .values({ pinHash })
    .returning();
  return user.id;
}

export async function verifyPin(pin: string): Promise<string | null> {
  const allUsers = await db.select().from(users).limit(1);
  if (!allUsers.length) return null;

  const user = allUsers[0];
  const valid = await bcrypt.compare(pin, user.pinHash);
  return valid ? user.id : null;
}

export async function requireAuth(request: Request): Promise<string> {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const userId = parseCookie(cookieHeader, SESSION_COOKIE);

  if (!userId) throw redirect('/login');

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) throw redirect('/login');

  return user.id;
}

function parseCookie(header: string, name: string): string | null {
  const match = header.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}
```

### 7.2 Login Route

```typescript
// app/routes/login.tsx
import type { Route } from './+types/login';
import { verifyPin } from '~/lib/services/auth.service';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const pin = formData.get('pin') as string;

  const userId = await verifyPin(pin);
  if (!userId) return { error: 'Invalid PIN' };

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/planner',
      'Set-Cookie': `preppair_session=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
    },
  });
}
```

**Future migration path:** When going multi-user, replace PIN with Auth.js v5 (Google OAuth + email/password). `requireAuth()` still returns a `userId` string — all downstream code remains untouched.

---

## 8. PWA Configuration

### 8.1 Manifest

```json
{
  "name": "PrepPair",
  "short_name": "PrepPair",
  "description": "Weekly meal planning for couples",
  "start_url": "/planner",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1F4E79",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 8.2 Caching Strategy

| Resource                  | Strategy               | Rationale                        |
| ------------------------- | ---------------------- | -------------------------------- |
| App shell (HTML, CSS, JS) | Cache-First            | Fast loads; update in background |
| Recipes & Meal Plans      | Stale-While-Revalidate | Show cached data immediately     |
| Grocery List              | Network-First          | Checklist needs latest state     |
| Recipe Images             | Cache-First (30-day)   | Images rarely change             |

---

## 9. Environment & Configuration

```bash
# .env.example

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/preppair

# App
NODE_ENV=development
PORT=3000
```

### Docker Compose (Local Dev)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: preppair
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 10. DevOps & Deployment

### 10.1 Targets

| Environment     | Platform                  | Database                    |
| --------------- | ------------------------- | --------------------------- |
| **Development** | Local (Docker + pnpm dev) | Local PostgreSQL            |
| **Staging**     | Vercel Preview            | Neon PostgreSQL (free tier) |
| **Production**  | Vercel / Cloudflare       | Neon or Supabase PostgreSQL |

### 10.2 CI Pipeline (GitHub Actions)

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  check:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
          POSTGRES_DB: preppair_test
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm biome check .
      - run: pnpm tsc --noEmit
      - run: pnpm vitest run
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/preppair_test
      - run: pnpm build
```

### 10.3 Database Migrations

```bash
pnpm drizzle-kit generate    # Generate migration from schema changes
pnpm drizzle-kit migrate     # Apply migrations
pnpm drizzle-kit push        # Push schema directly (dev only)
pnpm drizzle-kit studio      # Visual DB inspector
```

---

## 11. Testing Strategy

| Layer           | Tool             | Scope                                   |
| --------------- | ---------------- | --------------------------------------- |
| **Unit**        | Vitest           | Services, validators, utility functions |
| **Integration** | Vitest + test DB | Service layer with real PostgreSQL      |
| **E2E**         | Playwright       | Full user flows                         |

---

## 12. Performance & Security

### 12.1 Performance

| Area                | Strategy                                                          |
| ------------------- | ----------------------------------------------------------------- |
| **Route Splitting** | React Router auto-splits by route; lazy-load Recharts and dnd-kit |
| **DB Connections**  | Pool via postgres.js (max 10)                                     |
| **Images**          | Compress on upload; serve via CDN                                 |
| **SSR**             | Server-render critical pages for fast first paint                 |
| **Bundle**          | Tree-shake shadcn/ui; monitor with vite-bundle-visualizer         |

### 12.2 Security

| Concern              | Mitigation                                            |
| -------------------- | ----------------------------------------------------- |
| **SQL Injection**    | Drizzle uses parameterized queries by default         |
| **XSS**              | React auto-escapes JSX; sanitize any user HTML        |
| **PIN Security**     | bcrypt hashed; HttpOnly session cookie; 30-day expiry |
| **Input Validation** | Zod on all action inputs server-side                  |
| **Secrets**          | Environment variables; never commit `.env`            |

---

## 13. Future-Proofing & Scalability

The v1 architecture is intentionally simple but designed with clear extension points.

### 13.1 AI Integration Path (v2)

When ready to add AI features, the extension is isolated:

```
Add to project:
  app/lib/ai/
  ├── provider.ts            # LLM factory (Ollama/OpenAI/Anthropic)
  ├── meal-suggestion.ts     # LangChain suggestion chain
  ├── recipe-parser.ts       # LangChain URL → recipe chain
  └── prompts.ts             # Prompt templates

  app/lib/services/
  └── scraper.service.ts     # Cheerio URL scraping

  app/routes/api/
  ├── api.ai.suggest.ts      # Suggestion API route
  └── api.ai.parse-url.ts    # URL parse API route

  app/routes/
  └── _app.recipes.import.tsx # URL import page

Add to docker-compose.yml:
  ollama service

Add to .env:
  LLM_PROVIDER, OLLAMA_*, OPENAI_*, ANTHROPIC_*

Add to package.json:
  langchain, @langchain/core, @langchain/openai,
  @langchain/anthropic, @langchain/ollama, cheerio
```

No existing files need to change. The AI layer plugs in as new routes and services.

### 13.2 Multi-User Migration Path

```
v1 (current):  userId scopes all data
v2 (future):   Add households table + householdId FK
               Replace userId scoping with householdId in services
               requireAuth() still returns userId; add requireHousehold()
```

### 13.3 Features Deferred to v2+

| Feature                   | What to Add                                      | Complexity |
| ------------------------- | ------------------------------------------------ | ---------- |
| **AI meal suggestions**   | LangChain chain + API route + Quick Fill UI      | Medium     |
| **AI recipe URL import**  | Cheerio scraper + LangChain parser + import page | Medium     |
| **Multi-user auth**       | Auth.js v5 with Google OAuth                     | Medium     |
| **Household workspaces**  | `households` + `household_members` tables        | Medium     |
| **Real-time sync**        | SSE resource route                               | Medium     |
| **Meal ratings**          | `meal_ratings` table                             | Low        |
| **Week templates**        | `templateName` column + clone action             | Low        |
| **Nutritional dashboard** | AI-powered macro analysis                        | Medium     |
| **Batch cook planner**    | Prep schedule generator                          | Medium     |

---

_End of Document_
