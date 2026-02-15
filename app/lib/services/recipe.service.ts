import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "~/lib/db";
import { recipeIngredients, recipes } from "~/lib/db/schema";
import type { CreateRecipeInput } from "~/lib/validators/recipe.schema";

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
	if (filters?.favoritesOnly) conditions.push(eq(recipes.isFavorite, true));

	return db.query.recipes.findMany({
		where: and(...conditions),
		with: { ingredients: true },
		orderBy: [desc(recipes.updatedAt)],
	});
}

export async function getRecipeById(recipeId: string, userId: string) {
	const recipe = await db.query.recipes.findFirst({
		where: and(eq(recipes.id, recipeId), eq(recipes.userId, userId)),
		with: { ingredients: { orderBy: (ing, { asc }) => [asc(ing.sortOrder)] } },
	});
	return recipe ?? null;
}

export async function createRecipe(input: CreateRecipeInput, userId: string) {
	return db.transaction(async (tx) => {
		const [recipe] = await tx
			.insert(recipes)
			.values({
				userId,
				title: input.title,
				description: input.description,
				sourceUrl: input.sourceUrl || null,
				prepTime: input.prepTime,
				cookTime: input.cookTime,
				servings: input.servings,
				category: input.category,
				tags: input.tags,
				cookingStyle: input.cookingStyle,
				estimatedCost: input.estimatedCost?.toString(),
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

export async function updateRecipe(
	recipeId: string,
	userId: string,
	input: Partial<CreateRecipeInput>,
) {
	return db.transaction(async (tx) => {
		const [recipe] = await tx
			.update(recipes)
			.set({
				...(input.title !== undefined && { title: input.title }),
				...(input.description !== undefined && {
					description: input.description,
				}),
				...(input.sourceUrl !== undefined && {
					sourceUrl: input.sourceUrl || null,
				}),
				...(input.prepTime !== undefined && { prepTime: input.prepTime }),
				...(input.cookTime !== undefined && { cookTime: input.cookTime }),
				...(input.servings !== undefined && { servings: input.servings }),
				...(input.category !== undefined && { category: input.category }),
				...(input.tags !== undefined && { tags: input.tags }),
				...(input.cookingStyle !== undefined && {
					cookingStyle: input.cookingStyle,
				}),
				...(input.estimatedCost !== undefined && {
					estimatedCost: input.estimatedCost?.toString(),
				}),
				...(input.steps !== undefined && { steps: input.steps }),
				updatedAt: new Date(),
			})
			.where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)))
			.returning();

		if (!recipe) return null;

		if (input.ingredients) {
			await tx
				.delete(recipeIngredients)
				.where(eq(recipeIngredients.recipeId, recipeId));

			if (input.ingredients.length) {
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
		}

		return recipe;
	});
}

export async function deleteRecipe(recipeId: string, userId: string) {
	const [deleted] = await db
		.delete(recipes)
		.where(and(eq(recipes.id, recipeId), eq(recipes.userId, userId)))
		.returning();
	return deleted ?? null;
}

export async function toggleFavorite(recipeId: string, userId: string) {
	const recipe = await db.query.recipes.findFirst({
		where: and(eq(recipes.id, recipeId), eq(recipes.userId, userId)),
	});
	if (!recipe) return null;

	const [updated] = await db
		.update(recipes)
		.set({ isFavorite: !recipe.isFavorite, updatedAt: new Date() })
		.where(eq(recipes.id, recipeId))
		.returning();
	return updated;
}

export async function getCategories(userId: string) {
	const allRecipes = await db.query.recipes.findMany({
		where: eq(recipes.userId, userId),
		columns: { category: true },
	});
	const categories = [
		...new Set(
			allRecipes.map((r) => r.category).filter((c): c is string => !!c),
		),
	];
	return categories.sort();
}
