import { Search, X } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { Badge } from "~/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

type Recipe = {
	id: string;
	title: string;
	category: string | null;
	cookingStyle: "fresh" | "batch_prep" | null;
	isFavorite: boolean;
};

type RecipePickerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	recipes: Recipe[];
	mealPlanId: string;
	dayOfWeek: number;
	mealType: "breakfast" | "lunch" | "dinner";
};

export function RecipePicker({
	open,
	onOpenChange,
	recipes,
	mealPlanId,
	dayOfWeek,
	mealType,
}: RecipePickerProps) {
	const [search, setSearch] = useState("");
	const fetcher = useFetcher();

	const filtered = recipes.filter((r) =>
		r.title.toLowerCase().includes(search.toLowerCase()),
	);

	function handleSelect(recipeId: string) {
		fetcher.submit(
			{
				intent: "assign-recipe",
				mealPlanId,
				recipeId,
				dayOfWeek: String(dayOfWeek),
				mealType,
			},
			{ method: "post" },
		);
		onOpenChange(false);
		setSearch("");
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Choose a Recipe</DialogTitle>
				</DialogHeader>

				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search recipes..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
					{search && (
						<button
							type="button"
							onClick={() => setSearch("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				<div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-1">
					{filtered.length === 0 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							No recipes found.
						</p>
					) : (
						filtered.map((recipe) => (
							<button
								key={recipe.id}
								type="button"
								onClick={() => handleSelect(recipe.id)}
								className="w-full text-left rounded-md px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2"
							>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{recipe.title}</p>
									<div className="flex gap-1 mt-0.5">
										{recipe.category && (
											<Badge
												variant="secondary"
												className="text-[10px] px-1 py-0 h-4"
											>
												{recipe.category}
											</Badge>
										)}
										{recipe.cookingStyle && (
											<Badge
												variant="outline"
												className="text-[10px] px-1 py-0 h-4"
											>
												{recipe.cookingStyle === "batch_prep"
													? "Batch"
													: "Fresh"}
											</Badge>
										)}
									</div>
								</div>
								{recipe.isFavorite && (
									<span className="text-red-500 text-xs shrink-0">&#9829;</span>
								)}
							</button>
						))
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
