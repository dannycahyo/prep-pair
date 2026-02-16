import { Info, Lock, Settings } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { SettingsSkeleton } from "~/components/shared/loading-skeleton";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";
import { changePin, requireAuth } from "~/lib/services/auth.service";
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
	const intent = formData.get("intent");

	switch (intent) {
		case "update-settings": {
			const parsed = updateSettingsSchema.safeParse({
				weeklyBudget: formData.get("weeklyBudget"),
				defaultServings: formData.get("defaultServings"),
			});

			if (!parsed.success) {
				return {
					intent: "update-settings",
					errors: parsed.error.flatten().fieldErrors,
					success: false,
				};
			}

			await updateUserSettings(userId, parsed.data);
			return {
				intent: "update-settings",
				success: true,
				errors: null,
			};
		}

		case "change-pin": {
			const currentPin = formData.get("currentPin") as string;
			const newPin = formData.get("newPin") as string;
			const confirmPin = formData.get("confirmPin") as string;

			if (!currentPin || !newPin || !confirmPin) {
				return {
					intent: "change-pin",
					success: false,
					pinError: "All PIN fields are required",
				};
			}

			if (newPin.length < 4) {
				return {
					intent: "change-pin",
					success: false,
					pinError: "New PIN must be at least 4 characters",
				};
			}

			if (newPin !== confirmPin) {
				return {
					intent: "change-pin",
					success: false,
					pinError: "New PINs do not match",
				};
			}

			const result = await changePin(userId, currentPin, newPin);
			if (!result.success) {
				return {
					intent: "change-pin",
					success: false,
					pinError: result.error,
				};
			}

			return { intent: "change-pin", success: true, pinError: null };
		}

		default:
			return { success: false };
	}
}

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
	const { weeklyBudget, defaultServings } = loaderData;
	const settingsFetcher = useFetcher<typeof action>();
	const pinFetcher = useFetcher<typeof action>();
	const { toast } = useToast();
	const pinFormRef = useRef<HTMLFormElement>(null);

	const isSettingsSubmitting = settingsFetcher.state === "submitting";
	const isPinSubmitting = pinFetcher.state === "submitting";

	const settingsData = settingsFetcher.data;
	const pinData = pinFetcher.data;

	useEffect(() => {
		if (settingsData?.intent === "update-settings" && settingsData.success) {
			toast({ title: "Settings updated" });
		}
	}, [settingsData, toast]);

	useEffect(() => {
		if (pinData?.intent === "change-pin" && pinData.success) {
			toast({ title: "PIN changed successfully" });
			pinFormRef.current?.reset();
		}
	}, [pinData, toast]);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">
				<Settings className="inline h-6 w-6 mr-2 align-text-bottom" />
				Settings
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Left column: Budget & Servings */}
				<settingsFetcher.Form method="post" className="space-y-6">
					<input type="hidden" name="intent" value="update-settings" />

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
							{settingsData?.intent === "update-settings" &&
								settingsData.errors?.weeklyBudget && (
									<p className="text-sm text-destructive">
										{settingsData.errors.weeklyBudget[0]}
									</p>
								)}
						</div>
					</div>

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
							{settingsData?.intent === "update-settings" &&
								settingsData.errors?.defaultServings && (
									<p className="text-sm text-destructive">
										{settingsData.errors.defaultServings[0]}
									</p>
								)}
						</div>
					</div>

					<Button
						type="submit"
						disabled={isSettingsSubmitting}
						className="w-full"
					>
						{isSettingsSubmitting ? "Saving..." : "Save Settings"}
					</Button>
				</settingsFetcher.Form>

				{/* Right column: Change PIN & About */}
				<div className="space-y-6">
					<pinFetcher.Form method="post" className="space-y-4" ref={pinFormRef}>
						<input type="hidden" name="intent" value="change-pin" />

						<div className="rounded-lg border border-border bg-card p-4 space-y-4">
							<h2 className="font-semibold">
								<Lock className="inline h-4 w-4 mr-1 align-text-bottom" />
								Change PIN
							</h2>

							{pinData?.intent === "change-pin" &&
								"pinError" in pinData &&
								pinData.pinError && (
									<p className="text-sm text-destructive">{pinData.pinError}</p>
								)}

							<div className="space-y-2">
								<Label htmlFor="currentPin">Current PIN</Label>
								<Input
									id="currentPin"
									name="currentPin"
									type="password"
									required
									autoComplete="current-password"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="newPin">New PIN</Label>
								<Input
									id="newPin"
									name="newPin"
									type="password"
									required
									minLength={4}
									autoComplete="new-password"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPin">Confirm New PIN</Label>
								<Input
									id="confirmPin"
									name="confirmPin"
									type="password"
									required
									minLength={4}
									autoComplete="new-password"
								/>
							</div>

							<Button
								type="submit"
								variant="outline"
								disabled={isPinSubmitting}
							>
								{isPinSubmitting ? "Changing..." : "Change PIN"}
							</Button>
						</div>
					</pinFetcher.Form>

					{/* App Info */}
					<div className="rounded-lg border border-border bg-card p-4 space-y-2">
						<h2 className="font-semibold">
							<Info className="inline h-4 w-4 mr-1 align-text-bottom" />
							About PrepPair
						</h2>
						<div className="text-sm text-muted-foreground space-y-1">
							<p>Version 1.0.0</p>
							<p>Meal prep made easy for couples.</p>
							<p>Built with React Router v7, TypeScript, and PostgreSQL.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function HydrateFallback() {
	return <SettingsSkeleton />;
}
