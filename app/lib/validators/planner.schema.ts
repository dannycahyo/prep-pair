import { z } from "zod";

export const assignRecipeSchema = z.object({
	mealPlanId: z.string().min(1),
	recipeId: z.string().min(1),
	dayOfWeek: z.coerce.number().int().min(0).max(6),
	mealType: z.enum(["breakfast", "lunch", "dinner"]),
});

export const removeSlotSchema = z.object({
	slotId: z.string().min(1),
});

export const moveSlotSchema = z.object({
	fromSlotId: z.string().min(1),
	toDayOfWeek: z.coerce.number().int().min(0).max(6),
	toMealType: z.enum(["breakfast", "lunch", "dinner"]),
});

export const updateStatusSchema = z.object({
	slotId: z.string().min(1),
	status: z.enum(["planned", "cooked", "skipped"]),
});

export type AssignRecipeInput = z.infer<typeof assignRecipeSchema>;
export type RemoveSlotInput = z.infer<typeof removeSlotSchema>;
export type MoveSlotInput = z.infer<typeof moveSlotSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
