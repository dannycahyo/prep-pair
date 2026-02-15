import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import { useFetcher } from "react-router";
import { MealSlot } from "~/components/planner/meal-slot";
import { RecipePicker } from "~/components/planner/recipe-picker";
import { Badge } from "~/components/ui/badge";
import { DAYS_OF_WEEK, DAYS_OF_WEEK_FULL, MEAL_TYPES } from "~/lib/utils/date";

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
		estimatedCost: string | null;
		ingredients: unknown[];
	} | null;
};

type PlanData = {
	id: string;
	weekStartDate: string;
	slots: SlotData[];
};

type Recipe = {
	id: string;
	title: string;
	category: string | null;
	cookingStyle: "fresh" | "batch_prep" | null;
	isFavorite: boolean;
};

type WeekCalendarProps = {
	plan: PlanData;
	recipes: Recipe[];
};

function findSlot(slots: SlotData[], dayOfWeek: number, mealType: string) {
	return (
		slots.find((s) => s.dayOfWeek === dayOfWeek && s.mealType === mealType) ??
		null
	);
}

const MEAL_LABELS: Record<string, string> = {
	breakfast: "Breakfast",
	lunch: "Lunch",
	dinner: "Dinner",
};

export function WeekCalendar({ plan, recipes }: WeekCalendarProps) {
	const fetcher = useFetcher();
	const [activeSlot, setActiveSlot] = useState<SlotData | null>(null);
	const [pickerState, setPickerState] = useState<{
		open: boolean;
		dayOfWeek: number;
		mealType: "breakfast" | "lunch" | "dinner";
	}>({ open: false, dayOfWeek: 0, mealType: "breakfast" });

	function handleDragStart(event: DragStartEvent) {
		const slotId = event.active.id as string;
		const slot = plan.slots.find((s) => s.id === slotId);
		if (slot) setActiveSlot(slot);
	}

	function handleDragEnd(event: DragEndEvent) {
		setActiveSlot(null);
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const overData = over.data.current as
			| { dayOfWeek: number; mealType: string }
			| undefined;
		if (!overData) return;

		fetcher.submit(
			{
				intent: "move-slot",
				fromSlotId: String(active.id),
				toDayOfWeek: String(overData.dayOfWeek),
				toMealType: String(overData.mealType),
			},
			{ method: "post" },
		);
	}

	function openPicker(
		dayOfWeek: number,
		mealType: "breakfast" | "lunch" | "dinner",
	) {
		setPickerState({ open: true, dayOfWeek, mealType });
	}

	return (
		<>
			<DndContext
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				{/* Desktop: 7-column grid */}
				<div className="hidden md:grid grid-cols-7 gap-2">
					{DAYS_OF_WEEK.map((day, dayIndex) => (
						<div key={day} className="space-y-1">
							<h3 className="text-xs font-medium text-muted-foreground text-center py-1">
								{day}
							</h3>
							{MEAL_TYPES.map((type) => (
								<div key={`${dayIndex}-${type}`}>
									<p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">
										{type.charAt(0).toUpperCase() + type.slice(1, 3)}
									</p>
									<MealSlot
										dayOfWeek={dayIndex}
										mealType={type}
										slot={findSlot(plan.slots, dayIndex, type)}
										onAddClick={() => openPicker(dayIndex, type)}
									/>
								</div>
							))}
						</div>
					))}
				</div>

				{/* Mobile: vertical day-by-day list */}
				<div className="md:hidden space-y-4">
					{DAYS_OF_WEEK_FULL.map((day, dayIndex) => (
						<div key={day} className="rounded-lg border border-border bg-card">
							<h3 className="text-sm font-medium px-3 py-2 border-b border-border bg-muted/50">
								{day}
							</h3>
							<div className="p-2 space-y-2">
								{MEAL_TYPES.map((type) => (
									<div key={`${dayIndex}-${type}`}>
										<p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 px-1">
											{MEAL_LABELS[type]}
										</p>
										<MealSlot
											dayOfWeek={dayIndex}
											mealType={type}
											slot={findSlot(plan.slots, dayIndex, type)}
											onAddClick={() => openPicker(dayIndex, type)}
										/>
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Drag overlay */}
				<DragOverlay>
					{activeSlot?.recipe ? (
						<div className="rounded-md border bg-card p-2 shadow-lg opacity-90 min-w-[100px]">
							<p className="text-xs font-medium line-clamp-2">
								{activeSlot.recipe.title}
							</p>
							{activeSlot.recipe.cookingStyle && (
								<Badge
									variant="outline"
									className="mt-1 text-[10px] px-1 py-0 h-4"
								>
									{activeSlot.recipe.cookingStyle === "batch_prep"
										? "Batch"
										: "Fresh"}
								</Badge>
							)}
						</div>
					) : null}
				</DragOverlay>
			</DndContext>

			<RecipePicker
				open={pickerState.open}
				onOpenChange={(open) => setPickerState((prev) => ({ ...prev, open }))}
				recipes={recipes}
				mealPlanId={plan.id}
				dayOfWeek={pickerState.dayOfWeek}
				mealType={pickerState.mealType}
			/>
		</>
	);
}
