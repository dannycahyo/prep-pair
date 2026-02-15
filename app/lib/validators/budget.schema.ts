import { z } from "zod";

export const createBudgetEntrySchema = z.object({
	amount: z.coerce.number().positive("Amount must be positive"),
	store: z.string().max(255).optional(),
	date: z.string().date("Invalid date format"),
});

export type CreateBudgetEntryInput = z.infer<typeof createBudgetEntrySchema>;

export const updateSettingsSchema = z.object({
	weeklyBudget: z.coerce.number().nonnegative("Budget must be non-negative"),
	defaultServings: z.coerce
		.number()
		.int()
		.positive("Servings must be positive"),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
