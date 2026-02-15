import { Check } from "lucide-react";
import { useFetcher } from "react-router";
import { cn } from "~/lib/utils";

type GroceryItemProps = {
	id: string;
	name: string;
	quantity: string | null;
	unit: string | null;
	isChecked: boolean;
};

export function GroceryItem({
	id,
	name,
	quantity,
	unit,
	isChecked,
}: GroceryItemProps) {
	const fetcher = useFetcher();

	// Optimistic UI: use the pending state if available
	const optimisticChecked =
		fetcher.formData != null
			? fetcher.formData.get("isChecked") === "true"
			: isChecked;

	return (
		<fetcher.Form method="post">
			<input type="hidden" name="intent" value="toggle-item" />
			<input type="hidden" name="itemId" value={id} />
			<input
				type="hidden"
				name="isChecked"
				value={String(!optimisticChecked)}
			/>
			<button
				type="submit"
				className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted"
			>
				<div
					className={cn(
						"flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
						optimisticChecked
							? "border-primary bg-primary text-primary-foreground"
							: "border-border",
					)}
				>
					{optimisticChecked && <Check className="h-3 w-3" />}
				</div>
				<span
					className={cn(
						"flex-1 text-sm transition-all",
						optimisticChecked && "text-muted-foreground line-through",
					)}
				>
					{name}
				</span>
				{quantity && Number(quantity) > 0 && (
					<span
						className={cn(
							"text-xs text-muted-foreground tabular-nums",
							optimisticChecked && "line-through",
						)}
					>
						{Number(quantity) % 1 === 0
							? Number(quantity).toFixed(0)
							: Number(quantity).toFixed(1)}
						{unit ? ` ${unit}` : ""}
					</span>
				)}
			</button>
		</fetcher.Form>
	);
}
