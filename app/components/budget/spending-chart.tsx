import { Suspense, lazy } from "react";
import { formatIDR } from "~/lib/utils/currency";

const LazyBarChart = lazy(() =>
	import("recharts").then((mod) => ({
		default: function SpendingBarChart({
			data,
			budget,
		}: { data: { week: string; total: number }[]; budget: number }) {
			return (
				<mod.ResponsiveContainer width="100%" height={300}>
					<mod.BarChart data={data}>
						<mod.CartesianGrid
							strokeDasharray="3 3"
							className="stroke-border"
						/>
						<mod.XAxis
							dataKey="week"
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<mod.YAxis
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
							tickFormatter={(v: number) =>
								v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
							}
						/>
						<mod.Tooltip
							formatter={(value) => [formatIDR(Number(value ?? 0)), "Spent"]}
							contentStyle={{
								backgroundColor: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "0.5rem",
							}}
						/>
						<mod.ReferenceLine
							y={budget}
							stroke="hsl(var(--destructive))"
							strokeDasharray="4 4"
							label={{
								value: "Budget",
								fill: "hsl(var(--destructive))",
								fontSize: 12,
							}}
						/>
						<mod.Bar
							dataKey="total"
							fill="hsl(var(--primary))"
							radius={[4, 4, 0, 0]}
						/>
					</mod.BarChart>
				</mod.ResponsiveContainer>
			);
		},
	})),
);

type SpendingChartProps = {
	data: { week: string; total: number }[];
	budget: number;
};

export function SpendingChart({ data, budget }: SpendingChartProps) {
	if (data.length === 0) {
		return (
			<div className="flex h-[300px] items-center justify-center text-muted-foreground">
				No spending data yet
			</div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className="flex h-[300px] items-center justify-center text-muted-foreground">
					Loading chart...
				</div>
			}
		>
			<LazyBarChart data={data} budget={budget} />
		</Suspense>
	);
}
