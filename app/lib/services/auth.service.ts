import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { db } from "~/lib/db";
import { users } from "~/lib/db/schema";

const SESSION_COOKIE = "preppair_session";

export async function setupPin(pin: string): Promise<string> {
	const pinHash = await bcrypt.hash(pin, 10);
	const [user] = await db.insert(users).values({ pinHash }).returning();
	return user.id;
}

export async function verifyPin(pin: string): Promise<string | null> {
	const allUsers = await db.select().from(users).limit(1);
	if (!allUsers.length) return null;

	const user = allUsers[0];
	const valid = await bcrypt.compare(pin, user.pinHash);
	return valid ? user.id : null;
}

export async function requireAuth(request: Request): Promise<string> {
	const cookieHeader = request.headers.get("Cookie") ?? "";
	const userId = parseCookie(cookieHeader, SESSION_COOKIE);

	if (!userId) throw redirect("/login");

	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});
	if (!user) throw redirect("/login");

	return user.id;
}

export async function getSessionUserId(
	request: Request,
): Promise<string | null> {
	const cookieHeader = request.headers.get("Cookie") ?? "";
	const userId = parseCookie(cookieHeader, SESSION_COOKIE);
	if (!userId) return null;

	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});
	return user ? user.id : null;
}

export async function hasAnyUser(): Promise<boolean> {
	const allUsers = await db.select().from(users).limit(1);
	return allUsers.length > 0;
}

export async function changePin(
	userId: string,
	currentPin: string,
	newPin: string,
): Promise<{ success: boolean; error?: string }> {
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});
	if (!user) return { success: false, error: "User not found" };

	const valid = await bcrypt.compare(currentPin, user.pinHash);
	if (!valid) return { success: false, error: "Current PIN is incorrect" };

	const newHash = await bcrypt.hash(newPin, 10);
	await db
		.update(users)
		.set({ pinHash: newHash, updatedAt: new Date() })
		.where(eq(users.id, userId));

	return { success: true };
}

export function createSessionCookie(userId: string): string {
	return `${SESSION_COOKIE}=${userId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;
}

function parseCookie(header: string, name: string): string | null {
	const match = header.match(new RegExp(`${name}=([^;]+)`));
	return match ? match[1] : null;
}
