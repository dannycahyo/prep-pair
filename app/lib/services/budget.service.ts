import { addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "~/lib/db";
import { budgetEntries, users } from "~/lib/db/schema";
import type { CreateBudgetEntryInput } from "~/lib/validators/budget.schema";

export async function createBudgetEntry(
	userId: string,
	data: CreateBudgetEntryInput,
) {
	const [entry] = await db
		.insert(budgetEntries)
		.values({
			userId,
			amount: String(data.amount),
			store: data.store || null,
			date: data.date,
		})
		.returning();

	return entry;
}

export async function getBudgetEntries(
	userId: string,
	dateRange?: { start: string; end: string },
) {
	const conditions = [eq(budgetEntries.userId, userId)];

	if (dateRange) {
		conditions.push(gte(budgetEntries.date, dateRange.start));
		conditions.push(lte(budgetEntries.date, dateRange.end));
	}

	return db.query.budgetEntries.findMany({
		where: and(...conditions),
		orderBy: [desc(budgetEntries.date), desc(budgetEntries.createdAt)],
	});
}

export async function getWeeklySpending(
	userId: string,
	weekStartDate: string,
): Promise<number> {
	const start = new Date(weekStartDate);
	const end = addWeeks(start, 1);
	const endStr = format(end, "yyyy-MM-dd");

	const entries = await db.query.budgetEntries.findMany({
		where: and(
			eq(budgetEntries.userId, userId),
			gte(budgetEntries.date, weekStartDate),
			lte(budgetEntries.date, endStr),
		),
	});

	return entries.reduce((sum, e) => sum + Number(e.amount), 0);
}

export async function getSpendingTrend(
	userId: string,
	weeks = 4,
): Promise<{ week: string; total: number }[]> {
	const now = new Date();
	const currentMonday = startOfWeek(now, { weekStartsOn: 1 });

	const result: { week: string; total: number }[] = [];

	for (let i = weeks - 1; i >= 0; i--) {
		const weekStart = subWeeks(currentMonday, i);
		const weekEnd = addWeeks(weekStart, 1);

		const startStr = format(weekStart, "yyyy-MM-dd");
		const endStr = format(weekEnd, "yyyy-MM-dd");

		const entries = await db.query.budgetEntries.findMany({
			where: and(
				eq(budgetEntries.userId, userId),
				gte(budgetEntries.date, startStr),
				lte(budgetEntries.date, endStr),
			),
		});

		const total = entries.reduce((sum, e) => sum + Number(e.amount), 0);
		result.push({
			week: format(weekStart, "MMM d"),
			total,
		});
	}

	return result;
}

export async function deleteBudgetEntry(entryId: string, userId: string) {
	const [deleted] = await db
		.delete(budgetEntries)
		.where(and(eq(budgetEntries.id, entryId), eq(budgetEntries.userId, userId)))
		.returning();
	return deleted ?? null;
}

export async function getUserSettings(userId: string) {
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: {
			weeklyBudget: true,
			defaultServings: true,
		},
	});
	return user;
}

export async function updateUserSettings(
	userId: string,
	data: { weeklyBudget: number; defaultServings: number },
) {
	const [updated] = await db
		.update(users)
		.set({
			weeklyBudget: String(data.weeklyBudget),
			defaultServings: data.defaultServings,
			updatedAt: new Date(),
		})
		.where(eq(users.id, userId))
		.returning();
	return updated;
}
