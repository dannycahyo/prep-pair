import { Skeleton } from "~/components/ui/skeleton";

export function RecipeGridSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-9 w-28" />
			</div>
			<div className="flex flex-col sm:flex-row gap-3">
				<Skeleton className="h-9 flex-1" />
				<Skeleton className="h-9 w-full sm:w-[180px]" />
				<Skeleton className="h-9 w-9" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={`recipe-skel-${i}`}
						className="rounded-lg border border-border p-4 space-y-3"
					>
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<div className="flex gap-2">
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-12" />
						</div>
						<div className="flex gap-3">
							<Skeleton className="h-3 w-12" />
							<Skeleton className="h-3 w-16" />
							<Skeleton className="h-3 w-20" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function PlannerSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-9 w-9" />
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-9 w-9" />
			</div>
			<div className="flex gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={`summary-skel-${i}`} className="h-5 w-20" />
				))}
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
				{Array.from({ length: 7 }).map((_, day) => (
					<div key={`day-skel-${day}`} className="space-y-2">
						<Skeleton className="h-4 w-12" />
						{Array.from({ length: 3 }).map((_, meal) => (
							<Skeleton
								key={`slot-skel-${day}-${meal}`}
								className="h-16 w-full rounded-md"
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export function GrocerySkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-9 w-9" />
				<div className="text-center space-y-1">
					<Skeleton className="h-7 w-36 mx-auto" />
					<Skeleton className="h-4 w-28 mx-auto" />
				</div>
				<Skeleton className="h-9 w-9" />
			</div>
			<Skeleton className="h-12 w-full rounded-lg" />
			{Array.from({ length: 3 }).map((_, cat) => (
				<div key={`gcat-skel-${cat}`} className="space-y-2">
					<Skeleton className="h-5 w-24" />
					{Array.from({ length: 4 }).map((_, item) => (
						<div
							key={`gitem-skel-${cat}-${item}`}
							className="flex items-center gap-3 py-2"
						>
							<Skeleton className="h-5 w-5 rounded" />
							<Skeleton className="h-4 flex-1" />
							<Skeleton className="h-4 w-12" />
						</div>
					))}
				</div>
			))}
		</div>
	);
}

export function BudgetSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-9 w-28" />
			</div>
			<div className="rounded-lg border border-border p-4 space-y-3">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-6 w-full" />
				<div className="flex justify-between">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
			<div className="rounded-lg border border-border p-4 space-y-3">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-48 w-full" />
			</div>
			<div className="rounded-lg border border-border p-4 space-y-3">
				<Skeleton className="h-4 w-32" />
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={`bentry-skel-${i}`}
						className="flex items-center justify-between py-3"
					>
						<div className="space-y-1">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-32" />
						</div>
						<Skeleton className="h-8 w-8" />
					</div>
				))}
			</div>
		</div>
	);
}

export function SettingsSkeleton() {
	return (
		<div className="space-y-6 max-w-md">
			<Skeleton className="h-8 w-28" />
			<div className="rounded-lg border border-border p-4 space-y-4">
				<Skeleton className="h-5 w-20" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-9 w-full" />
				</div>
			</div>
			<div className="rounded-lg border border-border p-4 space-y-4">
				<Skeleton className="h-5 w-28" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-9 w-full" />
				</div>
			</div>
			<Skeleton className="h-9 w-full" />
		</div>
	);
}

export function RecipeDetailSkeleton() {
	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Skeleton className="h-9 w-9" />
				<Skeleton className="h-8 flex-1" />
				<Skeleton className="h-9 w-9" />
				<Skeleton className="h-9 w-16" />
				<Skeleton className="h-9 w-16" />
			</div>
			<Skeleton className="h-4 w-3/4" />
			<div className="flex gap-2">
				<Skeleton className="h-5 w-16" />
				<Skeleton className="h-5 w-16" />
			</div>
			<div className="flex gap-6">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-4 w-20" />
			</div>
			<Skeleton className="h-px w-full" />
			<div className="space-y-3">
				<Skeleton className="h-6 w-28" />
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={`ing-skel-${i}`} className="h-4 w-full" />
				))}
			</div>
			<Skeleton className="h-px w-full" />
			<div className="space-y-4">
				<Skeleton className="h-6 w-16" />
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={`step-skel-${i}`} className="flex gap-3">
						<Skeleton className="h-7 w-7 rounded-full" />
						<Skeleton className="h-12 flex-1" />
					</div>
				))}
			</div>
		</div>
	);
}
