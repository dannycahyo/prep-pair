import { Book, Calendar, Settings, ShoppingCart, Wallet } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { requireAuth } from "~/lib/services/auth.service";
import type { Route } from "./+types/_app";

export async function loader({ request }: Route.LoaderArgs) {
	await requireAuth(request);
	return {};
}

const navItems = [
	{ to: "/planner", label: "Planner", icon: Calendar },
	{ to: "/recipes", label: "Recipes", icon: Book },
	{ to: "/grocery", label: "Grocery", icon: ShoppingCart },
	{ to: "/budget", label: "Budget", icon: Wallet },
	{ to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout() {
	return (
		<div className="flex h-screen">
			{/* Desktop sidebar */}
			<aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar">
				<div className="p-6">
					<h1 className="text-xl font-bold text-sidebar-foreground">
						PrepPair
					</h1>
				</div>
				<nav className="flex-1 px-3 space-y-1">
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
									isActive
										? "bg-sidebar-accent text-sidebar-accent-foreground"
										: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
								}`
							}
						>
							<item.icon className="h-4 w-4" />
							{item.label}
						</NavLink>
					))}
				</nav>
			</aside>

			{/* Main content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Mobile header */}
				<header className="flex md:hidden items-center justify-between border-b border-border px-4 py-3">
					<h1 className="text-lg font-bold">PrepPair</h1>
				</header>

				<main className="flex-1 overflow-y-auto p-6">
					<Outlet />
				</main>

				{/* Mobile bottom nav */}
				<nav className="flex md:hidden border-t border-border bg-background">
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
									isActive
										? "text-primary"
										: "text-muted-foreground hover:text-foreground"
								}`
							}
						>
							<item.icon className="h-5 w-5" />
							{item.label}
						</NavLink>
					))}
				</nav>
			</div>
		</div>
	);
}
