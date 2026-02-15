import { addWeeks, format, startOfWeek, subWeeks } from "date-fns";

/**
 * Get the Monday of the current week.
 */
export function getCurrentWeekMonday(): string {
	const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
	return format(monday, "yyyy-MM-dd");
}

/**
 * Get the Monday of the week containing the given date string.
 */
export function getWeekMonday(dateStr: string): string {
	const monday = startOfWeek(new Date(dateStr), { weekStartsOn: 1 });
	return format(monday, "yyyy-MM-dd");
}

/**
 * Get the previous week's Monday from a given date string.
 */
export function getPreviousWeekMonday(dateStr: string): string {
	const date = new Date(dateStr);
	const prevWeek = subWeeks(date, 1);
	const monday = startOfWeek(prevWeek, { weekStartsOn: 1 });
	return format(monday, "yyyy-MM-dd");
}

/**
 * Get the next week's Monday from a given date string.
 */
export function getNextWeekMonday(dateStr: string): string {
	const date = new Date(dateStr);
	const nextWeek = addWeeks(date, 1);
	const monday = startOfWeek(nextWeek, { weekStartsOn: 1 });
	return format(monday, "yyyy-MM-dd");
}

/**
 * Format a week start date for display, e.g. "Feb 10 – Feb 16, 2025"
 */
export function formatWeekRange(weekStartDate: string): string {
	const start = new Date(weekStartDate);
	const end = addWeeks(start, 1);
	end.setDate(end.getDate() - 1); // Sunday

	const startMonth = format(start, "MMM d");
	const endFormatted = format(end, "MMM d, yyyy");

	return `${startMonth} – ${endFormatted}`;
}

export const DAYS_OF_WEEK = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun",
] as const;

export const DAYS_OF_WEEK_FULL = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
] as const;

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
