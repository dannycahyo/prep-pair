import { Check, ChefHat, SkipForward, UtensilsCrossed } from "lucide-react";

type Slot = {
	recipeId: string | null;
	status: "planned" | "cooked" | "skipped";
	recipe?: {
		estimatedCost: string | null;
	} | null;
};

export function WeekSummary({ slots }: { slots: Slot[] }) {
	const totalSlots = 21;
	const filledSlots = slots.filter((s) => s.recipeId).length;
	const cookedSlots = slots.filter((s) => s.status === "cooked").length;
	const skippedSlots = slots.filter((s) => s.status === "skipped").length;

	const estimatedCost = slots.reduce((sum, slot) => {
		if (slot.recipe?.estimatedCost) {
			return sum + Number(slot.recipe.estimatedCost);
		}
		return sum;
	}, 0);

	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
			<div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
				<UtensilsCrossed className="h-4 w-4 text-muted-foreground shrink-0" />
				<div className="min-w-0">
					<p className="text-xs text-muted-foreground">Filled</p>
					<p className="text-sm font-semibold">
						{filledSlots}/{totalSlots}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
				<Check className="h-4 w-4 text-green-600 shrink-0" />
				<div className="min-w-0">
					<p className="text-xs text-muted-foreground">Cooked</p>
					<p className="text-sm font-semibold">{cookedSlots}</p>
				</div>
			</div>
			<div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
				<SkipForward className="h-4 w-4 text-muted-foreground shrink-0" />
				<div className="min-w-0">
					<p className="text-xs text-muted-foreground">Skipped</p>
					<p className="text-sm font-semibold">{skippedSlots}</p>
				</div>
			</div>
			<div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
				<ChefHat className="h-4 w-4 text-muted-foreground shrink-0" />
				<div className="min-w-0">
					<p className="text-xs text-muted-foreground">Est. Cost</p>
					<p className="text-sm font-semibold truncate">
						{estimatedCost > 0
							? `Rp ${estimatedCost.toLocaleString("id-ID")}`
							: "–"}
					</p>
				</div>
			</div>
		</div>
	);
}
