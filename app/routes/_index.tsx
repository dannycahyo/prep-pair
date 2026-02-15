import { redirect } from "react-router";
import { getSessionUserId, hasAnyUser } from "~/lib/services/auth.service";
import type { Route } from "./+types/_index";

export async function loader({ request }: Route.LoaderArgs) {
	const userExists = await hasAnyUser();
	if (!userExists) {
		throw redirect("/setup");
	}

	const userId = await getSessionUserId(request);
	if (!userId) {
		throw redirect("/login");
	}

	throw redirect("/planner");
}

export default function Index() {
	return null;
}
