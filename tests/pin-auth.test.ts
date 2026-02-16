import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

/**
 * PIN authentication logic tests.
 * Tests the hashing and comparison logic without needing a database.
 */

describe("PIN Authentication", () => {
	describe("PIN hashing", () => {
		it("hashes a PIN successfully", async () => {
			const pin = "1234";
			const hash = await bcrypt.hash(pin, 10);
			expect(hash).toBeDefined();
			expect(hash).not.toBe(pin);
			expect(hash.startsWith("$2")).toBe(true);
		});

		it("produces different hashes for the same PIN", async () => {
			const pin = "1234";
			const hash1 = await bcrypt.hash(pin, 10);
			const hash2 = await bcrypt.hash(pin, 10);
			expect(hash1).not.toBe(hash2);
		});
	});

	describe("PIN verification", () => {
		it("verifies correct PIN", async () => {
			const pin = "1234";
			const hash = await bcrypt.hash(pin, 10);
			const isValid = await bcrypt.compare(pin, hash);
			expect(isValid).toBe(true);
		});

		it("rejects incorrect PIN", async () => {
			const pin = "1234";
			const hash = await bcrypt.hash(pin, 10);
			const isValid = await bcrypt.compare("5678", hash);
			expect(isValid).toBe(false);
		});

		it("handles long PINs", async () => {
			const pin = "abcdefgh123456";
			const hash = await bcrypt.hash(pin, 10);
			const isValid = await bcrypt.compare(pin, hash);
			expect(isValid).toBe(true);
		});
	});

	describe("PIN change flow", () => {
		it("allows changing PIN when current PIN is correct", async () => {
			const currentPin = "1234";
			const newPin = "5678";
			const currentHash = await bcrypt.hash(currentPin, 10);

			// Verify current PIN
			const isCurrentValid = await bcrypt.compare(currentPin, currentHash);
			expect(isCurrentValid).toBe(true);

			// Hash new PIN
			const newHash = await bcrypt.hash(newPin, 10);
			const isNewValid = await bcrypt.compare(newPin, newHash);
			expect(isNewValid).toBe(true);

			// Old PIN should not work with new hash
			const isOldWithNewHash = await bcrypt.compare(currentPin, newHash);
			expect(isOldWithNewHash).toBe(false);
		});

		it("rejects PIN change when current PIN is wrong", async () => {
			const currentHash = await bcrypt.hash("1234", 10);
			const isValid = await bcrypt.compare("wrong", currentHash);
			expect(isValid).toBe(false);
		});
	});

	describe("Session cookie parsing", () => {
		function parseCookie(header: string, name: string): string | null {
			const match = header.match(new RegExp(`${name}=([^;]+)`));
			return match ? match[1] : null;
		}

		it("parses a session cookie", () => {
			const cookie = "preppair_session=user123; Path=/; HttpOnly";
			const userId = parseCookie(cookie, "preppair_session");
			expect(userId).toBe("user123");
		});

		it("returns null for missing cookie", () => {
			const cookie = "other_cookie=value";
			const userId = parseCookie(cookie, "preppair_session");
			expect(userId).toBeNull();
		});

		it("handles empty cookie header", () => {
			const userId = parseCookie("", "preppair_session");
			expect(userId).toBeNull();
		});

		it("handles multiple cookies", () => {
			const cookie = "a=1; preppair_session=user456; b=2";
			const userId = parseCookie(cookie, "preppair_session");
			expect(userId).toBe("user456");
		});
	});
});
