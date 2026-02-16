import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Link, redirect, useActionData, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { requireAuth } from "~/lib/services/auth.service";
import { createBudgetEntry } from "~/lib/services/budget.service";
import { createBudgetEntrySchema } from "~/lib/validators/budget.schema";
import type { Route } from "./+types/_app.budget.log";

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireAuth(request);
	const formData = await request.formData();

	const parsed = createBudgetEntrySchema.safeParse({
		amount: formData.get("amount"),
		store: formData.get("store") || undefined,
		date: formData.get("date"),
	});

	if (!parsed.success) {
		return {
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	await createBudgetEntry(userId, parsed.data);
	throw redirect("/budget");
}

export default function LogExpense() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const today = format(new Date(), "yyyy-MM-dd");

	return (
		<div className="space-y-6 max-w-md">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link to="/budget">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h1 className="text-2xl font-bold">Log Expense</h1>
			</div>

			<form method="post" className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="amount">Amount (IDR)</Label>
					<Input
						id="amount"
						name="amount"
						type="number"
						placeholder="350000"
						min="1"
						step="1"
						required
					/>
					{actionData?.errors?.amount && (
						<p className="text-sm text-destructive">
							{actionData.errors.amount[0]}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="store">Store (optional)</Label>
					<Input
						id="store"
						name="store"
						type="text"
						placeholder="e.g., Superindo, Pasar"
					/>
					{actionData?.errors?.store && (
						<p className="text-sm text-destructive">
							{actionData.errors.store[0]}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="date">Date</Label>
					<Input
						id="date"
						name="date"
						type="date"
						defaultValue={today}
						required
					/>
					{actionData?.errors?.date && (
						<p className="text-sm text-destructive">
							{actionData.errors.date[0]}
						</p>
					)}
				</div>

				<div className="flex gap-3 pt-2">
					<Button type="submit" disabled={isSubmitting} className="flex-1">
						{isSubmitting ? "Saving..." : "Save Expense"}
					</Button>
					<Button variant="outline" asChild>
						<Link to="/budget">Cancel</Link>
					</Button>
				</div>
			</form>
		</div>
	);
}
