import { Settings } from "lucide-react";
import { useActionData, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { requireAuth } from "~/lib/services/auth.service";
import {
	getUserSettings,
	updateUserSettings,
} from "~/lib/services/budget.service";
import { formatIDR } from "~/lib/utils/currency";
import { updateSettingsSchema } from "~/lib/validators/budget.schema";
import type { Route } from "./+types/_app.settings";

export async function loader({ request }: Route.LoaderArgs) {
	const userId = await requireAuth(request);
	const settings = await getUserSettings(userId);
	return {
		weeklyBudget: Number(settings?.weeklyBudget ?? 500000),
		defaultServings: settings?.defaultServings ?? 2,
	};
}

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireAuth(request);
	const formData = await request.formData();

	const parsed = updateSettingsSchema.safeParse({
		weeklyBudget: formData.get("weeklyBudget"),
		defaultServings: formData.get("defaultServings"),
	});

	if (!parsed.success) {
		return {
			errors: parsed.error.flatten().fieldErrors,
			success: false,
		};
	}

	await updateUserSettings(userId, parsed.data);
	return { success: true, errors: null };
}

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
	const { weeklyBudget, defaultServings } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="space-y-6 max-w-md">
			<h1 className="text-2xl font-bold">
				<Settings className="inline h-6 w-6 mr-2 align-text-bottom" />
				Settings
			</h1>

			<form method="post" className="space-y-6">
				{/* Budget Settings */}
				<div className="rounded-lg border border-border bg-card p-4 space-y-4">
					<h2 className="font-semibold">Budget</h2>

					<div className="space-y-2">
						<Label htmlFor="weeklyBudget">Weekly Budget (IDR)</Label>
						<Input
							id="weeklyBudget"
							name="weeklyBudget"
							type="number"
							defaultValue={weeklyBudget}
							min="0"
							step="1000"
							required
						/>
						<p className="text-xs text-muted-foreground">
							Current: {formatIDR(weeklyBudget)}
						</p>
						{actionData?.errors?.weeklyBudget && (
							<p className="text-sm text-destructive">
								{actionData.errors.weeklyBudget[0]}
							</p>
						)}
					</div>
				</div>

				{/* Meal Planning Settings */}
				<div className="rounded-lg border border-border bg-card p-4 space-y-4">
					<h2 className="font-semibold">Meal Planning</h2>

					<div className="space-y-2">
						<Label htmlFor="defaultServings">Default Servings</Label>
						<Input
							id="defaultServings"
							name="defaultServings"
							type="number"
							defaultValue={defaultServings}
							min="1"
							max="20"
							required
						/>
						<p className="text-xs text-muted-foreground">
							Number of servings when adding new recipes
						</p>
						{actionData?.errors?.defaultServings && (
							<p className="text-sm text-destructive">
								{actionData.errors.defaultServings[0]}
							</p>
						)}
					</div>
				</div>

				<Button type="submit" disabled={isSubmitting} className="w-full">
					{isSubmitting ? "Saving..." : "Save Settings"}
				</Button>

				{actionData?.success && (
					<p className="text-sm text-success text-center">
						Settings saved successfully.
					</p>
				)}
			</form>
		</div>
	);
}
