CREATE TYPE "public"."cooking_style" AS ENUM('fresh', 'batch_prep');--> statement-breakpoint
CREATE TYPE "public"."meal_slot_status" AS ENUM('planned', 'cooked', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner');--> statement-breakpoint
CREATE TABLE "budget_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"store" varchar(255),
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grocery_items" (
	"id" text PRIMARY KEY NOT NULL,
	"meal_plan_id" text NOT NULL,
	"ingredient_name" varchar(255) NOT NULL,
	"total_quantity" numeric(10, 3),
	"unit" varchar(50),
	"category" varchar(100),
	"is_checked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"week_start_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_slots" (
	"id" text PRIMARY KEY NOT NULL,
	"meal_plan_id" text NOT NULL,
	"recipe_id" text,
	"day_of_week" integer NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"status" "meal_slot_status" DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"quantity" numeric(10, 3),
	"unit" varchar(50),
	"category" varchar(100),
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"source_url" text,
	"prep_time" integer,
	"cook_time" integer,
	"servings" integer DEFAULT 2 NOT NULL,
	"category" varchar(100),
	"tags" text[],
	"image_url" text,
	"cooking_style" "cooking_style" DEFAULT 'fresh',
	"is_favorite" boolean DEFAULT false NOT NULL,
	"estimated_cost" numeric(15, 2),
	"steps" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"pin_hash" text NOT NULL,
	"weekly_budget" numeric(15, 2) DEFAULT '500000',
	"default_servings" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_entries" ADD CONSTRAINT "budget_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grocery_items" ADD CONSTRAINT "grocery_items_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_slots" ADD CONSTRAINT "meal_slots_meal_plan_id_meal_plans_id_fk" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_slots" ADD CONSTRAINT "meal_slots_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "budget_entries_user_idx" ON "budget_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "budget_entries_date_idx" ON "budget_entries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "grocery_items_plan_idx" ON "grocery_items" USING btree ("meal_plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "meal_plans_week_unique" ON "meal_plans" USING btree ("user_id","week_start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "meal_slots_unique" ON "meal_slots" USING btree ("meal_plan_id","day_of_week","meal_type");--> statement-breakpoint
CREATE INDEX "meal_slots_plan_idx" ON "meal_slots" USING btree ("meal_plan_id");--> statement-breakpoint
CREATE INDEX "recipes_user_idx" ON "recipes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recipes_category_idx" ON "recipes" USING btree ("category");