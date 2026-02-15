import { Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export type IngredientRow = {
	_key: string;
	name: string;
	quantity: string;
	unit: string;
	category: string;
};

let nextKey = 0;
export function createIngredientRow(
	partial?: Partial<Omit<IngredientRow, "_key">>,
): IngredientRow {
	return {
		_key: `ing-${++nextKey}`,
		name: partial?.name ?? "",
		quantity: partial?.quantity ?? "",
		unit: partial?.unit ?? "",
		category: partial?.category ?? "",
	};
}

export function IngredientInput({
	ingredients,
	onChange,
	errors,
}: {
	ingredients: IngredientRow[];
	onChange: (ingredients: IngredientRow[]) => void;
	errors?: string[];
}) {
	function addRow() {
		onChange([...ingredients, createIngredientRow()]);
	}

	function removeRow(index: number) {
		onChange(ingredients.filter((_, i) => i !== index));
	}

	function updateRow(index: number, field: keyof IngredientRow, value: string) {
		const updated = ingredients.map((ing, i) =>
			i === index ? { ...ing, [field]: value } : ing,
		);
		onChange(updated);
	}

	return (
		<div className="space-y-3">
			<div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_100px_40px] gap-2 text-xs font-medium text-muted-foreground">
				<span>Name</span>
				<span>Qty</span>
				<span>Unit</span>
				<span>Category</span>
				<span />
			</div>

			{ingredients.map((ing, index) => (
				<div
					key={ing._key}
					className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_80px_80px_100px_40px] gap-2"
				>
					<Input
						placeholder="Ingredient name"
						value={ing.name}
						onChange={(e) => updateRow(index, "name", e.target.value)}
						className="col-span-1 sm:col-span-1"
					/>
					<div className="flex gap-2 sm:contents">
						<Input
							type="number"
							placeholder="Qty"
							value={ing.quantity}
							onChange={(e) => updateRow(index, "quantity", e.target.value)}
							min="0"
							step="any"
						/>
						<Input
							placeholder="Unit"
							value={ing.unit}
							onChange={(e) => updateRow(index, "unit", e.target.value)}
						/>
						<Input
							placeholder="Category"
							value={ing.category}
							onChange={(e) => updateRow(index, "category", e.target.value)}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => removeRow(index)}
							disabled={ingredients.length <= 1}
							className="shrink-0"
						>
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</div>
				</div>
			))}

			{errors?.map((error) => (
				<p key={error} className="text-sm text-destructive">
					{error}
				</p>
			))}

			<Button type="button" variant="outline" size="sm" onClick={addRow}>
				<Plus className="h-4 w-4 mr-1" />
				Add ingredient
			</Button>
		</div>
	);
}
