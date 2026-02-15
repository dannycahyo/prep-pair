import { redirect } from "react-router";
import {
	createSessionCookie,
	getSessionUserId,
	hasAnyUser,
	verifyPin,
} from "~/lib/services/auth.service";
import type { Route } from "./+types/login";

export async function loader({ request }: Route.LoaderArgs) {
	const userExists = await hasAnyUser();
	if (!userExists) {
		throw redirect("/setup");
	}

	const userId = await getSessionUserId(request);
	if (userId) {
		throw redirect("/planner");
	}

	return {};
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const pin = formData.get("pin") as string;

	const userId = await verifyPin(pin);
	if (!userId) {
		return { error: "Invalid PIN" };
	}

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/planner",
			"Set-Cookie": createSessionCookie(userId),
		},
	});
}

export default function Login({ actionData }: Route.ComponentProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<form method="post" className="w-72 space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-foreground">PrepPair</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Enter your PIN to continue
					</p>
				</div>

				<div>
					<input
						type="password"
						name="pin"
						inputMode="numeric"
						pattern="[0-9]*"
						maxLength={6}
						placeholder="Enter PIN"
						required
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-widest ring-offset-background placeholder:text-sm placeholder:tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					/>
				</div>

				{actionData?.error && (
					<p className="text-sm text-destructive text-center">
						{actionData.error}
					</p>
				)}

				<button
					type="submit"
					className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					Unlock
				</button>
			</form>
		</div>
	);
}
