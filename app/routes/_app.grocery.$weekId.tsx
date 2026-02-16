import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	ListRestart,
	ShoppingCart,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";
import { GroceryList } from "~/components/grocery/grocery-list";
import { GrocerySkeleton } from "~/components/shared/loading-skeleton";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { requireAuth } from "~/lib/services/auth.service";
import {
	clearCheckedItems,
	getGroceryItemCount,
	getGroceryList,
	toggleGroceryItem,
} from "~/lib/services/grocery.service";
import {
	getOrCreateWeekPlan,
	getWeekPlanWithSlots,
} from "~/lib/services/planner.service";
import { formatIDR } from "~/lib/utils/currency";
import {
	formatWeekRange,
	getNextWeekMonday,
	getPreviousWeekMonday,
} from "~/lib/utils/date";
import type { Route } from "./+types/_app.grocery.$weekId";

export async function loader({ params, request }: Route.LoaderArgs) {
	const userId = await requireAuth(request);

	const plan = await getWeekPlanWithSlots(params.weekId);
	if (!plan || plan.userId !== userId) {
		throw new Response("Not found", { status: 404 });
	}

	const groceryCategories = await getGroceryList(plan.id);
	const counts = await getGroceryItemCount(plan.id);

	// Calculate estimated cost from recipes in the plan
	const estimatedCost = plan.slots.reduce((sum, slot) => {
		if (slot.recipe?.estimatedCost) {
			return sum + Number(slot.recipe.estimatedCost);
		}
		return sum;
	}, 0);

	// Get prev/next week plan IDs for navigation
	const prevWeekMonday = getPreviousWeekMonday(plan.weekStartDate);
	const nextWeekMonday = getNextWeekMonday(plan.weekStartDate);
	const prevPlan = await getOrCreateWeekPlan(userId, prevWeekMonday);
	const nextPlan = await getOrCreateWeekPlan(userId, nextWeekMonday);

	return {
		plan,
		groceryCategories,
		counts,
		estimatedCost,
		prevPlanId: prevPlan.id,
		nextPlanId: nextPlan.id,
	};
}

export async function action({ params, request }: Route.ActionArgs) {
	await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "toggle-item": {
			const itemId = formData.get("itemId") as string;
			if (!itemId) return { error: "Missing item ID" };
			await toggleGroceryItem(itemId);
			return { success: true };
		}

		case "clear-checked": {
			await clearCheckedItems(params.weekId);
			return { success: true };
		}

		default:
			return { error: "Unknown intent" };
	}
}

export default function GroceryWeek({ loaderData }: Route.ComponentProps) {
	const {
		plan,
		groceryCategories,
		counts,
		estimatedCost,
		prevPlanId,
		nextPlanId,
	} = loaderData;
	const fetcher = useFetcher();
	const [searchParams, setSearchParams] = useSearchParams();
	const { toast } = useToast();

	// Toast for newly generated grocery list
	useEffect(() => {
		if (searchParams.get("generated") === "true") {
			toast({ title: "Grocery list generated" });
			setSearchParams((prev) => {
				prev.delete("generated");
				return prev;
			});
		}
	}, [searchParams, setSearchParams, toast]);

	return (
		<div className="space-y-4">
			{/* Header with week navigation */}
			<div className="flex items-center justify-between">
				<Button variant="outline" size="icon" asChild>
					<Link to={`/grocery/${prevPlanId}`}>
						<ChevronLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div className="text-center">
					<h1 className="text-lg sm:text-2xl font-bold">
						<ShoppingCart className="inline h-5 w-5 mr-2 align-text-bottom" />
						Grocery List
					</h1>
					<p className="text-sm text-muted-foreground">
						{formatWeekRange(plan.weekStartDate)}
					</p>
				</div>
				<Button variant="outline" size="icon" asChild>
					<Link to={`/grocery/${nextPlanId}`}>
						<ChevronRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>

			{/* Summary bar */}
			{counts.total > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
					<div className="flex items-center gap-4 text-sm">
						<span>
							<span className="font-semibold">{counts.checked}</span>
							<span className="text-muted-foreground">
								/{counts.total} checked
							</span>
						</span>
						{estimatedCost > 0 && (
							<span className="text-muted-foreground">
								Est. {formatIDR(estimatedCost)}
							</span>
						)}
					</div>
					{counts.checked > 0 && (
						<fetcher.Form method="post">
							<input type="hidden" name="intent" value="clear-checked" />
							<Button variant="ghost" size="sm" type="submit">
								<ListRestart className="h-4 w-4 mr-1" />
								Uncheck all
							</Button>
						</fetcher.Form>
					)}
				</div>
			)}

			{/* Grocery list */}
			<GroceryList categories={groceryCategories} />

			{/* Empty state with link to planner */}
			{counts.total === 0 && (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
					<h2 className="text-lg font-semibold">No grocery items yet</h2>
					<p className="text-muted-foreground mt-1 mb-4">
						Plan your meals first, then generate a grocery list.
					</p>
					<Button asChild>
						<Link to={`/planner/${plan.id}`}>
							<Calendar className="h-4 w-4 mr-1" />
							Go to Meal Plan
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
}

export function HydrateFallback() {
	return <GrocerySkeleton />;
}
