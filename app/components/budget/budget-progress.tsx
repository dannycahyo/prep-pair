import { cn } from "~/lib/utils";
import { formatIDR } from "~/lib/utils/currency";

type BudgetProgressProps = {
	spent: number;
	budget: number;
};

export function BudgetProgress({ spent, budget }: BudgetProgressProps) {
	const percentage = budget > 0 ? (spent / budget) * 100 : 0;
	const clampedPercentage = Math.min(percentage, 100);

	const colorClass =
		percentage > 100
			? "bg-destructive"
			: percentage >= 80
				? "bg-warning"
				: "bg-success";

	const labelColor =
		percentage > 100
			? "text-destructive"
			: percentage >= 80
				? "text-warning"
				: "text-success";

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-sm">
				<span className="text-muted-foreground">Weekly Spending</span>
				<span className={cn("font-semibold", labelColor)}>
					{Math.round(percentage)}%
				</span>
			</div>

			{/* Progress bar */}
			<div className="h-3 w-full overflow-hidden rounded-full bg-muted">
				<div
					className={cn(
						"h-full rounded-full transition-all duration-500",
						colorClass,
					)}
					style={{ width: `${clampedPercentage}%` }}
				/>
			</div>

			<div className="flex items-center justify-between text-sm">
				<span className="font-medium">{formatIDR(spent)}</span>
				<span className="text-muted-foreground">of {formatIDR(budget)}</span>
			</div>
		</div>
	);
}
