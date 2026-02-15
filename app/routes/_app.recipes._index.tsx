import { Clock, Heart, Plus, Search, UtensilsCrossed, X } from "lucide-react";
import { Link, useFetcher, useSearchParams } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { requireAuth } from "~/lib/services/auth.service";
import { getCategories, getRecipes } from "~/lib/services/recipe.service";
import type { Route } from "./+types/_app.recipes._index";

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireAuth(request);

	const url = new URL(request.url);
	const search = url.searchParams.get("search") || undefined;
	const category = url.searchParams.get("category") || undefined;
	const favoritesOnly = url.searchParams.get("favorites") === "true";

	const [recipes, categories] = await Promise.all([
		getRecipes(userId, { search, category, favoritesOnly }),
		getCategories(userId),
	]);

	return { recipes, categories };
}

export default function RecipeList({ loaderData }: Route.ComponentProps) {
	const { recipes, categories } = loaderData;
	const [searchParams, setSearchParams] = useSearchParams();
	const fetcher = useFetcher();

	const search = searchParams.get("search") || "";
	const category = searchParams.get("category") || "";
	const favoritesOnly = searchParams.get("favorites") === "true";

	function updateParam(key: string, value: string) {
		setSearchParams((prev) => {
			if (value) {
				prev.set(key, value);
			} else {
				prev.delete(key);
			}
			return prev;
		});
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Recipes</h1>
				<Button asChild>
					<Link to="/recipes/new">
						<Plus className="h-4 w-4 mr-1" />
						Add Recipe
					</Link>
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search recipes..."
						value={search}
						onChange={(e) => updateParam("search", e.target.value)}
						className="pl-9"
					/>
					{search && (
						<button
							type="button"
							onClick={() => updateParam("search", "")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
				<Select
					value={category}
					onValueChange={(val) =>
						updateParam("category", val === "all" ? "" : val)
					}
				>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="All categories" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All categories</SelectItem>
						{categories.map((cat) => (
							<SelectItem key={cat} value={cat}>
								{cat}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					variant={favoritesOnly ? "default" : "outline"}
					size="icon"
					onClick={() => updateParam("favorites", favoritesOnly ? "" : "true")}
					title="Show favorites only"
				>
					<Heart className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`} />
				</Button>
			</div>

			{/* Recipe Grid */}
			{recipes.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
					<h2 className="text-lg font-semibold">No recipes yet</h2>
					<p className="text-muted-foreground mt-1 mb-4">
						{search || category || favoritesOnly
							? "No recipes match your filters. Try adjusting your search."
							: "Start building your recipe collection by adding your first recipe."}
					</p>
					{!search && !category && !favoritesOnly && (
						<Button asChild>
							<Link to="/recipes/new">
								<Plus className="h-4 w-4 mr-1" />
								Add your first recipe
							</Link>
						</Button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{recipes.map((recipe) => (
						<Card key={recipe.id} className="flex flex-col">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between gap-2">
									<Link to={`/recipes/${recipe.id}`} className="flex-1 min-w-0">
										<CardTitle className="text-base hover:underline truncate">
											{recipe.title}
										</CardTitle>
									</Link>
									<fetcher.Form method="post" action={`/recipes/${recipe.id}`}>
										<input
											type="hidden"
											name="intent"
											value="toggle-favorite"
										/>
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											className="h-8 w-8 shrink-0"
										>
											<Heart
												className={`h-4 w-4 ${
													recipe.isFavorite
														? "fill-red-500 text-red-500"
														: "text-muted-foreground"
												}`}
											/>
										</Button>
									</fetcher.Form>
								</div>
								{recipe.description && (
									<CardDescription className="line-clamp-2">
										{recipe.description}
									</CardDescription>
								)}
							</CardHeader>
							<CardContent className="pb-3 flex-1">
								<div className="flex flex-wrap gap-1.5">
									{recipe.category && (
										<Badge variant="secondary">{recipe.category}</Badge>
									)}
									{recipe.cookingStyle && (
										<Badge variant="outline">
											{recipe.cookingStyle === "batch_prep"
												? "Batch Prep"
												: "Fresh"}
										</Badge>
									)}
									{recipe.tags?.map((tag) => (
										<Badge key={tag} variant="outline">
											{tag}
										</Badge>
									))}
								</div>
							</CardContent>
							<CardFooter className="text-xs text-muted-foreground gap-3">
								{(recipe.prepTime || recipe.cookTime) && (
									<span className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										{[recipe.prepTime, recipe.cookTime]
											.filter(Boolean)
											.reduce((a, b) => (a ?? 0) + (b ?? 0), 0)}
										m
									</span>
								)}
								<span>{recipe.servings} servings</span>
								{recipe.estimatedCost && (
									<span>
										Rp {Number(recipe.estimatedCost).toLocaleString("id-ID")}
									</span>
								)}
								<span className="ml-auto">
									{recipe.ingredients.length} ingredients
								</span>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
