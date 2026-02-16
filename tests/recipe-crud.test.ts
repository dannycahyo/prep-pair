import { describe, expect, it } from "vitest";
import { createRecipeSchema } from "~/lib/validators/recipe.schema";

/**
 * Recipe CRUD validation tests.
 * Tests the Zod schema validation logic without needing a database.
 */

describe("Recipe CRUD Validation", () => {
	describe("createRecipeSchema", () => {
		it("validates a minimal valid recipe", () => {
			const result = createRecipeSchema.safeParse({
				title: "Test Recipe",
				servings: 2,
				ingredients: [{ name: "Salt" }],
				steps: [{ instruction: "Add salt" }],
			});

			expect(result.success).toBe(true);
		});

		it("validates a fully populated recipe", () => {
			const result = createRecipeSchema.safeParse({
				title: "Nasi Goreng",
				description: "Indonesian fried rice",
				sourceUrl: "https://example.com/nasi-goreng",
				prepTime: 10,
				cookTime: 15,
				servings: 4,
				category: "Indonesian",
				tags: ["spicy", "fried rice"],
				cookingStyle: "fresh",
				estimatedCost: 25000,
				ingredients: [
					{ name: "Rice", quantity: 500, unit: "g", category: "Grains" },
					{ name: "Egg", quantity: 2, unit: "pcs", category: "Protein" },
				],
				steps: [
					{ instruction: "Cook rice", timerSeconds: 600 },
					{ instruction: "Fry egg" },
				],
			});

			expect(result.success).toBe(true);
		});

		it("requires a title", () => {
			const result = createRecipeSchema.safeParse({
				servings: 2,
				ingredients: [{ name: "Salt" }],
				steps: [{ instruction: "Add salt" }],
			});

			expect(result.success).toBe(false);
		});

		it("requires at least one ingredient", () => {
			const result = createRecipeSchema.safeParse({
				title: "Test",
				servings: 2,
				ingredients: [],
				steps: [{ instruction: "Do something" }],
			});

			expect(result.success).toBe(false);
		});

		it("requires at least one step", () => {
			const result = createRecipeSchema.safeParse({
				title: "Test",
				servings: 2,
				ingredients: [{ name: "Salt" }],
				steps: [],
			});

			expect(result.success).toBe(false);
		});

		it("validates servings as positive integer", () => {
			const result = createRecipeSchema.safeParse({
				title: "Test",
				servings: 0,
				ingredients: [{ name: "Salt" }],
				steps: [{ instruction: "Do something" }],
			});

			expect(result.success).toBe(false);
		});

		it("validates cooking style enum", () => {
			const result = createRecipeSchema.safeParse({
				title: "Test",
				servings: 2,
				cookingStyle: "invalid_style",
				ingredients: [{ name: "Salt" }],
				steps: [{ instruction: "Do something" }],
			});

			expect(result.success).toBe(false);
		});

		it("accepts batch_prep cooking style", () => {
			const result = createRecipeSchema.safeParse({
				title: "Batch Cook",
				servings: 8,
				cookingStyle: "batch_prep",
				ingredients: [{ name: "Rice", quantity: 1000, unit: "g" }],
				steps: [{ instruction: "Cook everything" }],
			});

			expect(result.success).toBe(true);
		});

		it("handles optional fields gracefully", () => {
			const result = createRecipeSchema.safeParse({
				title: "Simple Recipe",
				servings: 2,
				ingredients: [{ name: "Water" }],
				steps: [{ instruction: "Boil water" }],
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.description).toBeUndefined();
				expect(result.data.category).toBeUndefined();
				expect(result.data.tags).toBeUndefined();
				expect(result.data.prepTime).toBeUndefined();
				expect(result.data.cookTime).toBeUndefined();
			}
		});
	});
});
