import { Suspense, lazy } from "react";
import { formatIDR } from "~/lib/utils/currency";

/* Warm terracotta / amber / sienna gradient tones for the chart bars */
const BAR_COLORS = ["#A0522D", "#C97B4B", "#D4956B", "#E0B088"] as const;

const LazyBarChart = lazy(() =>
	import("recharts").then((mod) => ({
		default: function SpendingBarChart({
			data,
			budget,
		}: { data: { week: string; total: number }[]; budget: number }) {
			return (
				<mod.ResponsiveContainer width="100%" height={300}>
					<mod.BarChart
						data={data}
						margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
					>
						<defs>
							{data.map((_, i) => (
								<linearGradient
									key={BAR_COLORS[i % BAR_COLORS.length]}
									id={`bar-gradient-${i}`}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="0%"
										stopColor={BAR_COLORS[i % BAR_COLORS.length]}
										stopOpacity={1}
									/>
									<stop
										offset="100%"
										stopColor={BAR_COLORS[i % BAR_COLORS.length]}
										stopOpacity={0.6}
									/>
								</linearGradient>
							))}
						</defs>
						<mod.CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="var(--color-border)"
						/>
						<mod.XAxis
							dataKey="week"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
						/>
						<mod.YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
							tickFormatter={(v: number) =>
								v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
							}
						/>
						<mod.Tooltip
							formatter={(value) => [formatIDR(Number(value ?? 0)), "Spent"]}
							cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
							contentStyle={{
								backgroundColor: "var(--color-card)",
								border: "1px solid var(--color-border)",
								borderRadius: "0.5rem",
								boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
							}}
							wrapperStyle={{ zIndex: 50 }}
						/>
						<mod.ReferenceLine
							y={budget}
							stroke="var(--color-destructive)"
							strokeDasharray="6 3"
							strokeWidth={2}
							label={{
								value: `Budget: ${formatIDR(budget)}`,
								fill: "var(--color-destructive)",
								fontSize: 11,
								position: "insideTopRight",
							}}
						/>
						<mod.Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={40}>
							{data.map((entry, i) => (
								<mod.Cell
									key={entry.week}
									fill={
										entry.total > budget
											? "var(--color-destructive)"
											: `url(#bar-gradient-${i})`
									}
								/>
							))}
						</mod.Bar>
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
