import { redirect } from "react-router";
import { requireAuth } from "~/lib/services/auth.service";
import { getOrCreateWeekPlan } from "~/lib/services/planner.service";
import { getCurrentWeekMonday } from "~/lib/utils/date";
import type { Route } from "./+types/_app.planner._index";

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireAuth(request);
	const weekStartDate = getCurrentWeekMonday();
	const plan = await getOrCreateWeekPlan(userId, weekStartDate);
	throw redirect(`/planner/${plan.id}`);
}

export default function PlannerIndex() {
	return null;
}
