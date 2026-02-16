import { describe, expect, it } from "vitest";

/**
 * Grocery aggregation logic (pure function extracted for testing).
 * Mirrors the aggregation logic in grocery.service.ts.
 */
function aggregateIngredients(
	slots: Array<{
		recipe: {
			ingredients: Array<{
				name: string;
				quantity: string | null;
				unit: string | null;
				category: string | null;
			}>;
		} | null;
	}>,
) {
	const aggregated = new Map<
		string,
		{ name: string; quantity: number; unit: string; category: string }
	>();

	for (const slot of slots) {
		if (!slot.recipe) continue;
		for (const ing of slot.recipe.ingredients) {
			const key = `${ing.name.toLowerCase().trim()}::${(ing.unit ?? "").toLowerCase()}`;
			const existing = aggregated.get(key);
			if (existing) {
				existing.quantity += Number(ing.quantity ?? 0);
			} else {
				aggregated.set(key, {
					name: ing.name,
					quantity: Number(ing.quantity ?? 0),
					unit: ing.unit ?? "",
					category: ing.category ?? "Other",
				});
			}
		}
	}

	return Array.from(aggregated.values());
}

describe("Grocery Aggregation", () => {
	it("aggregates ingredients from multiple slots", () => {
		const slots = [
			{
				recipe: {
					ingredients: [
						{ name: "Rice", quantity: "300", unit: "g", category: "Grains" },
						{
							name: "Chicken",
							quantity: "500",
							unit: "g",
							category: "Protein",
						},
					],
				},
			},
			{
				recipe: {
					ingredients: [
						{ name: "Rice", quantity: "200", unit: "g", category: "Grains" },
						{ name: "Onion", quantity: "2", unit: "pcs", category: "Produce" },
					],
				},
			},
		];

		const result = aggregateIngredients(slots);

		expect(result).toHaveLength(3);
		const rice = result.find((r) => r.name === "Rice");
		expect(rice?.quantity).toBe(500);
		expect(rice?.unit).toBe("g");
	});

	it("handles empty slots (no recipe)", () => {
		const slots = [{ recipe: null }, { recipe: null }];
		const result = aggregateIngredients(slots);
		expect(result).toHaveLength(0);
	});

	it("handles case-insensitive ingredient matching", () => {
		const slots = [
			{
				recipe: {
					ingredients: [
						{
							name: "Garlic",
							quantity: "3",
							unit: "cloves",
							category: "Produce",
						},
					],
				},
			},
			{
				recipe: {
					ingredients: [
						{
							name: "garlic",
							quantity: "2",
							unit: "cloves",
							category: "Produce",
						},
					],
				},
			},
		];

		const result = aggregateIngredients(slots);
		expect(result).toHaveLength(1);
		expect(result[0].quantity).toBe(5);
	});

	it("treats different units as separate items", () => {
		const slots = [
			{
				recipe: {
					ingredients: [
						{ name: "Sugar", quantity: "100", unit: "g", category: "Pantry" },
						{ name: "Sugar", quantity: "2", unit: "tbsp", category: "Pantry" },
					],
				},
			},
		];

		const result = aggregateIngredients(slots);
		expect(result).toHaveLength(2);
	});

	it("handles ingredients without quantity", () => {
		const slots = [
			{
				recipe: {
					ingredients: [
						{ name: "Salt", quantity: null, unit: null, category: "Seasoning" },
						{ name: "Salt", quantity: null, unit: null, category: "Seasoning" },
					],
				},
			},
		];

		const result = aggregateIngredients(slots);
		expect(result).toHaveLength(1);
		expect(result[0].quantity).toBe(0);
	});

	it("preserves category from first occurrence", () => {
		const slots = [
			{
				recipe: {
					ingredients: [
						{ name: "Tomato", quantity: "3", unit: "pcs", category: "Produce" },
					],
				},
			},
			{
				recipe: {
					ingredients: [
						{
							name: "tomato",
							quantity: "2",
							unit: "pcs",
							category: "Vegetables",
						},
					],
				},
			},
		];

		const result = aggregateIngredients(slots);
		expect(result).toHaveLength(1);
		expect(result[0].category).toBe("Produce");
	});
});
