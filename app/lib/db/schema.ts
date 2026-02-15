import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	decimal,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────

export const mealTypeEnum = pgEnum("meal_type", [
	"breakfast",
	"lunch",
	"dinner",
]);

export const mealSlotStatusEnum = pgEnum("meal_slot_status", [
	"planned",
	"cooked",
	"skipped",
]);

export const cookingStyleEnum = pgEnum("cooking_style", [
	"fresh",
	"batch_prep",
]);

// ── Tables ─────────────────────────────────────────────

export const users = pgTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	pinHash: text("pin_hash").notNull(),
	weeklyBudget: decimal("weekly_budget", {
		precision: 15,
		scale: 2,
	}).default("500000"),
	defaultServings: integer("default_servings").notNull().default(2),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const recipes = pgTable(
	"recipes",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		title: varchar("title", { length: 500 }).notNull(),
		description: text("description"),
		sourceUrl: text("source_url"),
		prepTime: integer("prep_time"),
		cookTime: integer("cook_time"),
		servings: integer("servings").notNull().default(2),
		category: varchar("category", { length: 100 }),
		tags: text("tags").array(),
		imageUrl: text("image_url"),
		cookingStyle: cookingStyleEnum("cooking_style").default("fresh"),
		isFavorite: boolean("is_favorite").notNull().default(false),
		estimatedCost: decimal("estimated_cost", {
			precision: 15,
			scale: 2,
		}),
		steps: jsonb("steps").$type<RecipeStep[]>().default([]),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("recipes_user_idx").on(table.userId),
		index("recipes_category_idx").on(table.category),
	],
);

export const recipeIngredients = pgTable("recipe_ingredients", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	recipeId: text("recipe_id")
		.notNull()
		.references(() => recipes.id, { onDelete: "cascade" }),
	name: varchar("name", { length: 255 }).notNull(),
	quantity: decimal("quantity", { precision: 10, scale: 3 }),
	unit: varchar("unit", { length: 50 }),
	category: varchar("category", { length: 100 }),
	sortOrder: integer("sort_order").notNull().default(0),
});

export const mealPlans = pgTable(
	"meal_plans",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		weekStartDate: date("week_start_date").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("meal_plans_week_unique").on(table.userId, table.weekStartDate),
	],
);

export const mealSlots = pgTable(
	"meal_slots",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		mealPlanId: text("meal_plan_id")
			.notNull()
			.references(() => mealPlans.id, { onDelete: "cascade" }),
		recipeId: text("recipe_id").references(() => recipes.id, {
			onDelete: "set null",
		}),
		dayOfWeek: integer("day_of_week").notNull(),
		mealType: mealTypeEnum("meal_type").notNull(),
		status: mealSlotStatusEnum("status").notNull().default("planned"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("meal_slots_unique").on(
			table.mealPlanId,
			table.dayOfWeek,
			table.mealType,
		),
		index("meal_slots_plan_idx").on(table.mealPlanId),
	],
);

export const groceryItems = pgTable(
	"grocery_items",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		mealPlanId: text("meal_plan_id")
			.notNull()
			.references(() => mealPlans.id, { onDelete: "cascade" }),
		ingredientName: varchar("ingredient_name", {
			length: 255,
		}).notNull(),
		totalQuantity: decimal("total_quantity", {
			precision: 10,
			scale: 3,
		}),
		unit: varchar("unit", { length: 50 }),
		category: varchar("category", { length: 100 }),
		isChecked: boolean("is_checked").notNull().default(false),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index("grocery_items_plan_idx").on(table.mealPlanId)],
);

export const budgetEntries = pgTable(
	"budget_entries",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
		store: varchar("store", { length: 255 }),
		date: date("date").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		index("budget_entries_user_idx").on(table.userId),
		index("budget_entries_date_idx").on(table.date),
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

export const recipesRelations = relations(recipes, ({ one, many }) => ({
	user: one(users, {
		fields: [recipes.userId],
		references: [users.id],
	}),
	ingredients: many(recipeIngredients),
	mealSlots: many(mealSlots),
}));

export const recipeIngredientsRelations = relations(
	recipeIngredients,
	({ one }) => ({
		recipe: one(recipes, {
			fields: [recipeIngredients.recipeId],
			references: [recipes.id],
		}),
	}),
);

export const mealPlansRelations = relations(mealPlans, ({ one, many }) => ({
	user: one(users, {
		fields: [mealPlans.userId],
		references: [users.id],
	}),
	slots: many(mealSlots),
	groceryItems: many(groceryItems),
}));

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

export const groceryItemsRelations = relations(groceryItems, ({ one }) => ({
	mealPlan: one(mealPlans, {
		fields: [groceryItems.mealPlanId],
		references: [mealPlans.id],
	}),
}));

export const budgetEntriesRelations = relations(budgetEntries, ({ one }) => ({
	user: one(users, {
		fields: [budgetEntries.userId],
		references: [users.id],
	}),
}));
