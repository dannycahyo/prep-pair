import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Check, GripVertical, SkipForward, X } from "lucide-react";
import { useFetcher } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type SlotData = {
	id: string;
	recipeId: string | null;
	dayOfWeek: number;
	mealType: "breakfast" | "lunch" | "dinner";
	status: "planned" | "cooked" | "skipped";
	recipe?: {
		id: string;
		title: string;
		cookingStyle: "fresh" | "batch_prep" | null;
	} | null;
};

type MealSlotProps = {
	dayOfWeek: number;
	mealType: "breakfast" | "lunch" | "dinner";
	slot?: SlotData | null;
	onAddClick: () => void;
};

function nextStatus(current: "planned" | "cooked" | "skipped") {
	if (current === "planned") return "cooked";
	if (current === "cooked") return "skipped";
	return "planned";
}

export function MealSlot({
	dayOfWeek,
	mealType,
	slot,
	onAddClick,
}: MealSlotProps) {
	const fetcher = useFetcher();
	const isFilled = slot?.recipeId != null;

	const droppableId = `${dayOfWeek}-${mealType}`;
	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id: droppableId,
		data: { dayOfWeek, mealType },
	});

	const {
		attributes,
		listeners,
		setNodeRef: setDragRef,
		isDragging,
	} = useDraggable({
		id: slot?.id ?? droppableId,
		data: { slotId: slot?.id, dayOfWeek, mealType },
		disabled: !isFilled,
	});

	// Determine optimistic status
	const optimisticStatus =
		fetcher.formData?.get("intent") === "mark-status" &&
		fetcher.formData?.get("slotId") === slot?.id
			? (fetcher.formData.get("status") as "planned" | "cooked" | "skipped")
			: (slot?.status ?? "planned");

	const isRemoved =
		fetcher.formData?.get("intent") === "remove-slot" &&
		fetcher.formData?.get("slotId") === slot?.id;

	if (isRemoved) {
		return (
			<div
				ref={setDropRef}
				className="rounded-md border border-dashed border-border p-2 min-h-[60px] flex items-center justify-center"
			>
				<button
					type="button"
					onClick={onAddClick}
					className="text-xs text-muted-foreground hover:text-foreground transition-colors"
				>
					+ Add
				</button>
			</div>
		);
	}

	if (!isFilled) {
		return (
			<div
				ref={setDropRef}
				className={cn(
					"rounded-md border border-dashed border-border p-2 min-h-[60px] flex items-center justify-center transition-colors",
					isOver && "border-primary bg-primary/5",
				)}
			>
				<button
					type="button"
					onClick={onAddClick}
					className="text-xs text-muted-foreground hover:text-foreground transition-colors"
				>
					+ Add
				</button>
			</div>
		);
	}

	return (
		<div
			ref={(node) => {
				setDropRef(node);
				setDragRef(node);
			}}
			{...attributes}
			className={cn(
				"rounded-md border bg-card p-2 min-h-[60px] transition-all group relative",
				isOver && "border-primary bg-primary/5",
				isDragging && "opacity-50 shadow-lg",
				optimisticStatus === "cooked" && "border-green-300 bg-green-50",
				optimisticStatus === "skipped" && "border-muted bg-muted/50",
			)}
		>
			{/* Drag handle */}
			<div
				{...listeners}
				className="absolute top-1 left-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity touch-none"
			>
				<GripVertical className="h-3 w-3 text-muted-foreground" />
			</div>

			{/* Recipe title */}
			<p
				className={cn(
					"text-xs font-medium leading-tight line-clamp-2 pr-5",
					optimisticStatus === "skipped" &&
						"line-through text-muted-foreground",
				)}
			>
				{slot.recipe?.title}
			</p>

			{/* Cooking style badge */}
			{slot.recipe?.cookingStyle && (
				<Badge variant="outline" className="mt-1 text-[10px] px-1 py-0 h-4">
					{slot.recipe.cookingStyle === "batch_prep" ? "Batch" : "Fresh"}
				</Badge>
			)}

			{/* Action buttons */}
			<div className="flex items-center gap-0.5 mt-1">
				{/* Status toggle */}
				<fetcher.Form method="post">
					<input type="hidden" name="intent" value="mark-status" />
					<input type="hidden" name="slotId" value={slot.id} />
					<input
						type="hidden"
						name="status"
						value={nextStatus(optimisticStatus)}
					/>
					<Button
						type="submit"
						variant="ghost"
						size="icon"
						className="h-5 w-5"
						title={`Status: ${optimisticStatus}`}
					>
						{optimisticStatus === "cooked" ? (
							<Check className="h-3 w-3 text-green-600" />
						) : optimisticStatus === "skipped" ? (
							<SkipForward className="h-3 w-3 text-muted-foreground" />
						) : (
							<Check className="h-3 w-3 text-muted-foreground/40" />
						)}
					</Button>
				</fetcher.Form>

				{/* Remove button */}
				<fetcher.Form method="post">
					<input type="hidden" name="intent" value="remove-slot" />
					<input type="hidden" name="slotId" value={slot.id} />
					<Button
						type="submit"
						variant="ghost"
						size="icon"
						className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
						title="Remove from slot"
					>
						<X className="h-3 w-3 text-muted-foreground" />
					</Button>
				</fetcher.Form>
			</div>
		</div>
	);
}
