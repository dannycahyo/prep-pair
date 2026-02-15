import { Minus, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function ServingScaler({
	servings,
	onChange,
}: {
	servings: number;
	onChange: (servings: number) => void;
}) {
	return (
		<div className="flex items-center gap-2">
			<span className="text-sm font-medium text-muted-foreground">
				Servings:
			</span>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="h-8 w-8"
				onClick={() => onChange(Math.max(1, servings - 1))}
				disabled={servings <= 1}
			>
				<Minus className="h-3 w-3" />
			</Button>
			<Input
				type="number"
				value={servings}
				onChange={(e) => {
					const val = Number.parseInt(e.target.value, 10);
					if (val > 0) onChange(val);
				}}
				min="1"
				className="w-16 text-center h-8"
			/>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="h-8 w-8"
				onClick={() => onChange(servings + 1)}
			>
				<Plus className="h-3 w-3" />
			</Button>
		</div>
	);
}
