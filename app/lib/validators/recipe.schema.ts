import { z } from "zod";

const ingredientSchema = z.object({
	name: z.string().min(1, "Ingredient name is required"),
	quantity: z.coerce.number().positive().optional(),
	unit: z.string().optional(),
	category: z.string().optional(),
});

const stepSchema = z.object({
	instruction: z.string().min(1, "Step instruction is required"),
	timerSeconds: z.coerce.number().int().positive().optional(),
});

export const createRecipeSchema = z.object({
	title: z.string().min(1, "Title is required").max(500),
	description: z.string().optional(),
	sourceUrl: z.string().url().optional().or(z.literal("")),
	prepTime: z.coerce.number().int().nonnegative().optional(),
	cookTime: z.coerce.number().int().nonnegative().optional(),
	servings: z.coerce.number().int().positive().default(2),
	category: z.string().max(100).optional(),
	tags: z.array(z.string()).optional(),
	cookingStyle: z.enum(["fresh", "batch_prep"]).default("fresh"),
	estimatedCost: z.coerce.number().nonnegative().optional(),
	ingredients: z
		.array(ingredientSchema)
		.min(1, "At least one ingredient is required"),
	steps: z.array(stepSchema).min(1, "At least one step is required"),
});

export const updateRecipeSchema = createRecipeSchema.partial().extend({
	id: z.string().min(1),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
