import type { GroceryListByCategory } from "~/lib/services/grocery.service";
import { GroceryItem } from "./grocery-item";

type GroceryListProps = {
	categories: GroceryListByCategory[];
};

export function GroceryList({ categories }: GroceryListProps) {
	if (categories.length === 0) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<p className="text-lg font-medium">No grocery items yet</p>
				<p className="mt-1 text-sm">
					Generate a grocery list from your meal plan.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{categories.map(({ category, items }) => {
				const checkedCount = items.filter((i) => i.isChecked).length;
				return (
					<div key={category}>
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								{category}
							</h3>
							<span className="text-xs text-muted-foreground">
								{checkedCount}/{items.length}
							</span>
						</div>
						<div className="rounded-lg border border-border bg-card divide-y divide-border">
							{items.map((item) => (
								<GroceryItem
									key={item.id}
									id={item.id}
									name={item.ingredientName}
									quantity={item.totalQuantity}
									unit={item.unit}
									isChecked={item.isChecked}
								/>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
