import { format } from "date-fns";
import { Plus, Trash2, Wallet } from "lucide-react";
import { Link, useFetcher } from "react-router";
import { BudgetProgress } from "~/components/budget/budget-progress";
import { SpendingChart } from "~/components/budget/spending-chart";
import { Button } from "~/components/ui/button";
import { requireAuth } from "~/lib/services/auth.service";
import {
	deleteBudgetEntry,
	getBudgetEntries,
	getSpendingTrend,
	getUserSettings,
	getWeeklySpending,
} from "~/lib/services/budget.service";
import { formatIDR } from "~/lib/utils/currency";
import { getCurrentWeekMonday } from "~/lib/utils/date";

type BudgetEntry = {
	id: string;
	amount: string;
	store: string | null;
	date: string;
};

export async function loader({ request }: { request: Request }) {
	const userId = await requireAuth(request);

	const settings = await getUserSettings(userId);
	const weeklyBudget = Number(settings?.weeklyBudget ?? 500000);

	const currentMonday = getCurrentWeekMonday();
	const weeklySpent = await getWeeklySpending(userId, currentMonday);

	const recentEntries = await getBudgetEntries(userId);
	const spendingTrend = await getSpendingTrend(userId, 8);

	return {
		weeklyBudget,
		weeklySpent,
		recentEntries: recentEntries.slice(0, 10),
		spendingTrend,
	};
}

export async function action({ request }: { request: Request }) {
	const userId = await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "delete-entry") {
		const entryId = formData.get("entryId") as string;
		if (!entryId) return { error: "Missing entry ID" };
		await deleteBudgetEntry(entryId, userId);
		return { success: true };
	}

	return { error: "Unknown intent" };
}

export default function BudgetOverview({
	loaderData,
}: {
	loaderData: {
		weeklyBudget: number;
		weeklySpent: number;
		recentEntries: BudgetEntry[];
		spendingTrend: { week: string; total: number }[];
	};
}) {
	const { weeklyBudget, weeklySpent, recentEntries, spendingTrend } =
		loaderData;
	const fetcher = useFetcher();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">
					<Wallet className="inline h-6 w-6 mr-2 align-text-bottom" />
					Budget
				</h1>
				<Button asChild>
					<Link to="/budget/log">
						<Plus className="h-4 w-4 mr-2" />
						Log Expense
					</Link>
				</Button>
			</div>

			{/* Budget Progress */}
			<div className="rounded-lg border border-border bg-card p-4">
				<h2 className="text-sm font-medium text-muted-foreground mb-3">
					This Week
				</h2>
				<BudgetProgress spent={weeklySpent} budget={weeklyBudget} />
			</div>

			{/* Spending Trend Chart */}
			<div className="rounded-lg border border-border bg-card p-4">
				<h2 className="text-sm font-medium text-muted-foreground mb-3">
					Spending Trend (Last 8 Weeks)
				</h2>
				<SpendingChart data={spendingTrend} budget={weeklyBudget} />
			</div>

			{/* Recent Entries */}
			<div className="rounded-lg border border-border bg-card p-4">
				<h2 className="text-sm font-medium text-muted-foreground mb-3">
					Recent Expenses
				</h2>
				{recentEntries.length === 0 ? (
					<p className="text-sm text-muted-foreground py-4 text-center">
						No expenses logged yet.{" "}
						<Link to="/budget/log" className="text-primary underline">
							Log your first expense
						</Link>
					</p>
				) : (
					<div className="divide-y divide-border">
						{recentEntries.map((entry) => (
							<div
								key={entry.id}
								className="flex items-center justify-between py-3"
							>
								<div>
									<p className="text-sm font-medium">
										{formatIDR(Number(entry.amount))}
									</p>
									<p className="text-xs text-muted-foreground">
										{format(new Date(entry.date), "MMM d, yyyy")}
										{entry.store && ` · ${entry.store}`}
									</p>
								</div>
								<fetcher.Form method="post">
									<input type="hidden" name="intent" value="delete-entry" />
									<input type="hidden" name="entryId" value={entry.id} />
									<Button
										variant="ghost"
										size="icon"
										type="submit"
										className="h-8 w-8 text-muted-foreground hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</fetcher.Form>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
