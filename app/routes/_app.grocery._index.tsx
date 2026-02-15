import { redirect } from "react-router";
import { requireAuth } from "~/lib/services/auth.service";
import { getOrCreateWeekPlan } from "~/lib/services/planner.service";
import { getCurrentWeekMonday } from "~/lib/utils/date";
import type { Route } from "./+types/_app.grocery._index";

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireAuth(request);
	const weekStartDate = getCurrentWeekMonday();
	const plan = await getOrCreateWeekPlan(userId, weekStartDate);
	throw redirect(`/grocery/${plan.id}`);
}

export default function GroceryIndex() {
	return null;
}
