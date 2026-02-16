import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { groceryItems, mealSlots } from "~/lib/db/schema";

export async function generateGroceryList(mealPlanId: string) {
	const slots = await db.query.mealSlots.findMany({
		where: eq(mealSlots.mealPlanId, mealPlanId),
		with: { recipe: { with: { ingredients: true } } },
	});

	const aggregated = new Map<
		string,
		{
			name: string;
			quantity: number;
			unit: string;
			category: string;
		}
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

	// Clear existing grocery items for this plan
	await db.delete(groceryItems).where(eq(groceryItems.mealPlanId, mealPlanId));

	const items = Array.from(aggregated.values());
	if (items.length) {
		await db.insert(groceryItems).values(
			items.map((item) => ({
				mealPlanId,
				ingredientName: item.name,
				totalQuantity: String(item.quantity),
				unit: item.unit,
				category: item.category,
			})),
		);
	}

	return items;
}

export type GroceryItemRow = {
	id: string;
	ingredientName: string;
	totalQuantity: string | null;
	unit: string | null;
	category: string | null;
	isChecked: boolean;
};

export type GroceryListByCategory = {
	category: string;
	items: GroceryItemRow[];
};

export async function getGroceryList(
	mealPlanId: string,
): Promise<GroceryListByCategory[]> {
	const items = await db.query.groceryItems.findMany({
		where: eq(groceryItems.mealPlanId, mealPlanId),
	});

	const grouped = new Map<string, GroceryItemRow[]>();
	for (const item of items) {
		const category = item.category ?? "Other";
		const existing = grouped.get(category);
		if (existing) {
			existing.push(item);
		} else {
			grouped.set(category, [item]);
		}
	}

	return Array.from(grouped.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([category, items]) => ({ category, items }));
}

export async function toggleGroceryItem(itemId: string) {
	const item = await db.query.groceryItems.findFirst({
		where: eq(groceryItems.id, itemId),
	});
	if (!item) return null;

	const [updated] = await db
		.update(groceryItems)
		.set({ isChecked: !item.isChecked })
		.where(eq(groceryItems.id, itemId))
		.returning();

	return updated;
}

export async function clearCheckedItems(mealPlanId: string) {
	const items = await db.query.groceryItems.findMany({
		where: eq(groceryItems.mealPlanId, mealPlanId),
	});

	const checkedIds = items.filter((i) => i.isChecked).map((i) => i.id);
	if (!checkedIds.length) return;

	for (const id of checkedIds) {
		await db
			.update(groceryItems)
			.set({ isChecked: false })
			.where(eq(groceryItems.id, id));
	}
}

export async function getGroceryItemCount(mealPlanId: string) {
	const items = await db.query.groceryItems.findMany({
		where: eq(groceryItems.mealPlanId, mealPlanId),
	});
	return {
		total: items.length,
		checked: items.filter((i) => i.isChecked).length,
	};
}
