import { describe, expect, it } from "vitest";

/**
 * Planner slot logic tests (pure function equivalents).
 */

type Slot = {
	id: string;
	dayOfWeek: number;
	mealType: "breakfast" | "lunch" | "dinner";
	recipeId: string | null;
	status: "planned" | "cooked" | "skipped";
};

function findSlot(slots: Slot[], dayOfWeek: number, mealType: string) {
	return (
		slots.find((s) => s.dayOfWeek === dayOfWeek && s.mealType === mealType) ??
		null
	);
}

function getWeekSummary(slots: Slot[]) {
	const filledSlots = slots.filter((s) => s.recipeId !== null);
	const cookedSlots = slots.filter((s) => s.status === "cooked");
	const skippedSlots = slots.filter((s) => s.status === "skipped");
	const totalMeals = 7 * 3; // 7 days * 3 meals

	return {
		planned: filledSlots.length,
		cooked: cookedSlots.length,
		skipped: skippedSlots.length,
		totalMeals,
		coveragePercent: Math.round((filledSlots.length / totalMeals) * 100),
	};
}

describe("Planner Slot Logic", () => {
	const sampleSlots: Slot[] = [
		{
			id: "1",
			dayOfWeek: 0,
			mealType: "breakfast",
			recipeId: "recipe-1",
			status: "planned",
		},
		{
			id: "2",
			dayOfWeek: 0,
			mealType: "lunch",
			recipeId: "recipe-2",
			status: "cooked",
		},
		{
			id: "3",
			dayOfWeek: 1,
			mealType: "dinner",
			recipeId: null,
			status: "planned",
		},
		{
			id: "4",
			dayOfWeek: 2,
			mealType: "breakfast",
			recipeId: "recipe-3",
			status: "skipped",
		},
	];

	describe("findSlot", () => {
		it("finds an existing slot", () => {
			const slot = findSlot(sampleSlots, 0, "breakfast");
			expect(slot).not.toBeNull();
			expect(slot?.id).toBe("1");
			expect(slot?.recipeId).toBe("recipe-1");
		});

		it("returns null for non-existent slot", () => {
			const slot = findSlot(sampleSlots, 5, "dinner");
			expect(slot).toBeNull();
		});

		it("matches exact day and meal type", () => {
			const slot = findSlot(sampleSlots, 0, "lunch");
			expect(slot?.id).toBe("2");
		});
	});

	describe("getWeekSummary", () => {
		it("counts planned meals correctly", () => {
			const summary = getWeekSummary(sampleSlots);
			expect(summary.planned).toBe(3); // 3 slots with recipeId
		});

		it("counts cooked meals correctly", () => {
			const summary = getWeekSummary(sampleSlots);
			expect(summary.cooked).toBe(1);
		});

		it("counts skipped meals correctly", () => {
			const summary = getWeekSummary(sampleSlots);
			expect(summary.skipped).toBe(1);
		});

		it("calculates total meals as 21", () => {
			const summary = getWeekSummary(sampleSlots);
			expect(summary.totalMeals).toBe(21);
		});

		it("calculates coverage percentage", () => {
			const summary = getWeekSummary(sampleSlots);
			expect(summary.coveragePercent).toBe(Math.round((3 / 21) * 100));
		});

		it("handles empty slots array", () => {
			const summary = getWeekSummary([]);
			expect(summary.planned).toBe(0);
			expect(summary.cooked).toBe(0);
			expect(summary.skipped).toBe(0);
			expect(summary.coveragePercent).toBe(0);
		});
	});
});
