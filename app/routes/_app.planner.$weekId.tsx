import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Link, redirect, useFetcher } from "react-router";
import { WeekCalendar } from "~/components/planner/week-calendar";
import { WeekSummary } from "~/components/planner/week-summary";
import { Button } from "~/components/ui/button";
import { requireAuth } from "~/lib/services/auth.service";
import { generateGroceryList } from "~/lib/services/grocery.service";
import {
	assignRecipeToSlot,
	getOrCreateWeekPlan,
	getWeekPlanWithSlots,
	moveSlot,
	removeFromSlot,
	updateSlotStatus,
} from "~/lib/services/planner.service";
import { getRecipes } from "~/lib/services/recipe.service";
import {
	formatWeekRange,
	getNextWeekMonday,
	getPreviousWeekMonday,
} from "~/lib/utils/date";
import {
	assignRecipeSchema,
	moveSlotSchema,
	removeSlotSchema,
	updateStatusSchema,
} from "~/lib/validators/planner.schema";
import type { Route } from "./+types/_app.planner.$weekId";

export async function loader({ params, request }: Route.LoaderArgs) {
	const userId = await requireAuth(request);

	const plan = await getWeekPlanWithSlots(params.weekId);
	if (!plan || plan.userId !== userId) {
		throw new Response("Not found", { status: 404 });
	}

	const recipes = await getRecipes(userId);

	const prevWeekMonday = getPreviousWeekMonday(plan.weekStartDate);
	const nextWeekMonday = getNextWeekMonday(plan.weekStartDate);

	const prevPlan = await getOrCreateWeekPlan(userId, prevWeekMonday);
	const nextPlan = await getOrCreateWeekPlan(userId, nextWeekMonday);

	return {
		plan,
		recipes,
		prevPlanId: prevPlan.id,
		nextPlanId: nextPlan.id,
	};
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "assign-recipe": {
			const parsed = assignRecipeSchema.safeParse({
				mealPlanId: formData.get("mealPlanId"),
				recipeId: formData.get("recipeId"),
				dayOfWeek: formData.get("dayOfWeek"),
				mealType: formData.get("mealType"),
			});
			if (!parsed.success) {
				return { error: "Invalid input" };
			}
			const plan = await getWeekPlanWithSlots(parsed.data.mealPlanId);
			if (!plan || plan.userId !== userId) {
				return { error: "Not authorized" };
			}
			await assignRecipeToSlot(
				parsed.data.mealPlanId,
				parsed.data.recipeId,
				parsed.data.dayOfWeek,
				parsed.data.mealType,
			);
			return { success: true };
		}

		case "remove-slot": {
			const parsed = removeSlotSchema.safeParse({
				slotId: formData.get("slotId"),
			});
			if (!parsed.success) {
				return { error: "Invalid input" };
			}
			await removeFromSlot(parsed.data.slotId);
			return { success: true };
		}

		case "move-slot": {
			const parsed = moveSlotSchema.safeParse({
				fromSlotId: formData.get("fromSlotId"),
				toDayOfWeek: formData.get("toDayOfWeek"),
				toMealType: formData.get("toMealType"),
			});
			if (!parsed.success) {
				return { error: "Invalid input" };
			}
			await moveSlot(
				parsed.data.fromSlotId,
				parsed.data.toDayOfWeek,
				parsed.data.toMealType,
			);
			return { success: true };
		}

		case "mark-status": {
			const parsed = updateStatusSchema.safeParse({
				slotId: formData.get("slotId"),
				status: formData.get("status"),
			});
			if (!parsed.success) {
				return { error: "Invalid input" };
			}
			await updateSlotStatus(parsed.data.slotId, parsed.data.status);
			return { success: true };
		}

		case "generate-grocery": {
			const mealPlanId = formData.get("mealPlanId") as string;
			if (!mealPlanId) return { error: "Missing plan ID" };
			const plan = await getWeekPlanWithSlots(mealPlanId);
			if (!plan || plan.userId !== userId) {
				return { error: "Not authorized" };
			}
			await generateGroceryList(mealPlanId);
			throw redirect(`/grocery/${mealPlanId}`);
		}

		default:
			return { error: "Unknown intent" };
	}
}

export default function PlannerWeek({ loaderData }: Route.ComponentProps) {
	const { plan, recipes, prevPlanId, nextPlanId } = loaderData;
	const fetcher = useFetcher();
	const isGenerating =
		fetcher.state !== "idle" &&
		fetcher.formData?.get("intent") === "generate-grocery";

	const hasRecipes = plan.slots.some(
		(s: { recipeId: string | null }) => s.recipeId,
	);

	return (
		<div className="space-y-4">
			{/* Header with week navigation */}
			<div className="flex items-center justify-between">
				<Button variant="outline" size="icon" asChild>
					<Link to={`/planner/${prevPlanId}`}>
						<ChevronLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h1 className="text-lg sm:text-2xl font-bold text-center">
					{formatWeekRange(plan.weekStartDate)}
				</h1>
				<Button variant="outline" size="icon" asChild>
					<Link to={`/planner/${nextPlanId}`}>
						<ChevronRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>

			<WeekSummary slots={plan.slots} />

			{/* Generate Grocery List button */}
			{hasRecipes && (
				<fetcher.Form method="post">
					<input type="hidden" name="intent" value="generate-grocery" />
					<input type="hidden" name="mealPlanId" value={plan.id} />
					<Button
						type="submit"
						className="w-full sm:w-auto"
						disabled={isGenerating}
					>
						<ShoppingCart className="h-4 w-4 mr-2" />
						{isGenerating ? "Generating..." : "Generate Grocery List"}
					</Button>
				</fetcher.Form>
			)}

			<WeekCalendar plan={plan} recipes={recipes} />
		</div>
	);
}
