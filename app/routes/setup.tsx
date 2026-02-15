import { redirect } from "react-router";
import {
	createSessionCookie,
	hasAnyUser,
	setupPin,
} from "~/lib/services/auth.service";
import type { Route } from "./+types/setup";

export async function loader() {
	const userExists = await hasAnyUser();
	if (userExists) {
		throw redirect("/login");
	}
	return {};
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const pin = formData.get("pin") as string;
	const confirmPin = formData.get("confirmPin") as string;

	if (!pin || pin.length < 4 || pin.length > 6) {
		return { error: "PIN must be 4-6 digits" };
	}

	if (!/^\d+$/.test(pin)) {
		return { error: "PIN must contain only numbers" };
	}

	if (pin !== confirmPin) {
		return { error: "PINs do not match" };
	}

	const userId = await setupPin(pin);

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/planner",
			"Set-Cookie": createSessionCookie(userId),
		},
	});
}

export default function Setup({ actionData }: Route.ComponentProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<form method="post" className="w-72 space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-foreground">PrepPair</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Set up your PIN to get started
					</p>
				</div>

				<div className="space-y-4">
					<div>
						<label
							htmlFor="pin"
							className="block text-sm font-medium text-foreground mb-1"
						>
							Create PIN
						</label>
						<input
							id="pin"
							type="password"
							name="pin"
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={6}
							minLength={4}
							placeholder="Enter 4-6 digit PIN"
							required
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-widest ring-offset-background placeholder:text-sm placeholder:tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						/>
					</div>

					<div>
						<label
							htmlFor="confirmPin"
							className="block text-sm font-medium text-foreground mb-1"
						>
							Confirm PIN
						</label>
						<input
							id="confirmPin"
							type="password"
							name="confirmPin"
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={6}
							minLength={4}
							placeholder="Re-enter PIN"
							required
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl tracking-widest ring-offset-background placeholder:text-sm placeholder:tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						/>
					</div>
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
					Set PIN
				</button>
			</form>
		</div>
	);
}
