import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
	{ rel: "manifest", href: "/manifest.webmanifest" },
	{ rel: "icon", href: "/icons/icon-192.png", type: "image/png" },
	{
		rel: "apple-touch-icon",
		href: "/icons/icon-192.png",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" content="#1F4E79" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message =
			error.status === 404 ? "404 — Page Not Found" : `Error ${error.status}`;
		details =
			error.status === 404
				? "The page you're looking for doesn't exist."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="flex min-h-screen items-center justify-center p-6">
			<div className="text-center max-w-md space-y-4">
				<h1 className="text-4xl font-bold">{message}</h1>
				<p className="text-muted-foreground">{details}</p>
				<div className="flex justify-center gap-3 pt-2">
					<a
						href="/"
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Go Home
					</a>
				</div>
				{stack && (
					<pre className="w-full p-4 overflow-x-auto mt-4 text-left text-xs bg-muted rounded-md">
						<code>{stack}</code>
					</pre>
				)}
			</div>
		</main>
	);
}
