import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

const STORAGE_KEY = "preppair-theme";

function getInitialTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "dark" || stored === "light") return stored;

	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function ThemeToggle() {
	const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

	const applyTheme = useCallback((t: "light" | "dark") => {
		document.documentElement.classList.toggle("dark", t === "dark");
		localStorage.setItem(STORAGE_KEY, t);
	}, []);

	// Sync on mount (handles SSR hydration mismatch gracefully)
	useEffect(() => {
		const current = getInitialTheme();
		setTheme(current);
		applyTheme(current);
	}, [applyTheme]);

	function toggle() {
		const next = theme === "light" ? "dark" : "light";
		setTheme(next);
		applyTheme(next);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggle}
			aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
			title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
		>
			{theme === "light" ? (
				<Moon className="h-4 w-4" />
			) : (
				<Sun className="h-4 w-4" />
			)}
		</Button>
	);
}
