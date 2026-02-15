import { and, eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { mealPlans, mealSlots } from "~/lib/db/schema";

export async function getOrCreateWeekPlan(
	userId: string,
	weekStartDate: string,
) {
	const existing = await db.query.mealPlans.findFirst({
		where: and(
			eq(mealPlans.userId, userId),
			eq(mealPlans.weekStartDate, weekStartDate),
		),
	});

	if (existing) return existing;

	const [plan] = await db
		.insert(mealPlans)
		.values({ userId, weekStartDate })
		.returning();

	return plan;
}

export async function getWeekPlanWithSlots(planId: string) {
	return db.query.mealPlans.findFirst({
		where: eq(mealPlans.id, planId),
		with: {
			slots: {
				with: {
					recipe: {
						with: { ingredients: true },
					},
				},
			},
		},
	});
}

export async function assignRecipeToSlot(
	mealPlanId: string,
	recipeId: string,
	dayOfWeek: number,
	mealType: "breakfast" | "lunch" | "dinner",
) {
	const existing = await db.query.mealSlots.findFirst({
		where: and(
			eq(mealSlots.mealPlanId, mealPlanId),
			eq(mealSlots.dayOfWeek, dayOfWeek),
			eq(mealSlots.mealType, mealType),
		),
	});

	if (existing) {
		const [updated] = await db
			.update(mealSlots)
			.set({ recipeId, status: "planned" })
			.where(eq(mealSlots.id, existing.id))
			.returning();
		return updated;
	}

	const [slot] = await db
		.insert(mealSlots)
		.values({ mealPlanId, recipeId, dayOfWeek, mealType })
		.returning();

	return slot;
}

export async function removeFromSlot(slotId: string) {
	const [deleted] = await db
		.delete(mealSlots)
		.where(eq(mealSlots.id, slotId))
		.returning();
	return deleted ?? null;
}

export async function moveSlot(
	fromSlotId: string,
	toDayOfWeek: number,
	toMealType: "breakfast" | "lunch" | "dinner",
) {
	const fromSlot = await db.query.mealSlots.findFirst({
		where: eq(mealSlots.id, fromSlotId),
	});

	if (!fromSlot) return null;

	const targetSlot = await db.query.mealSlots.findFirst({
		where: and(
			eq(mealSlots.mealPlanId, fromSlot.mealPlanId),
			eq(mealSlots.dayOfWeek, toDayOfWeek),
			eq(mealSlots.mealType, toMealType),
		),
	});

	return db.transaction(async (tx) => {
		if (targetSlot) {
			// Swap: give the target slot the source's recipe/status
			await tx
				.update(mealSlots)
				.set({
					recipeId: fromSlot.recipeId,
					status: fromSlot.status,
				})
				.where(eq(mealSlots.id, targetSlot.id));

			await tx
				.update(mealSlots)
				.set({
					recipeId: targetSlot.recipeId,
					status: targetSlot.status,
				})
				.where(eq(mealSlots.id, fromSlot.id));
		} else {
			// Move: update position
			await tx
				.update(mealSlots)
				.set({ dayOfWeek: toDayOfWeek, mealType: toMealType })
				.where(eq(mealSlots.id, fromSlotId));
		}

		return { success: true };
	});
}

export async function updateSlotStatus(
	slotId: string,
	status: "planned" | "cooked" | "skipped",
) {
	const [updated] = await db
		.update(mealSlots)
		.set({ status })
		.where(eq(mealSlots.id, slotId))
		.returning();
	return updated ?? null;
}
