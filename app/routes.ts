import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	index("routes/_index.tsx"),
	route("login", "routes/login.tsx"),
	route("setup", "routes/setup.tsx"),
	layout("routes/_app.tsx", [
		route("planner", "routes/_app.planner.tsx"),
		route("recipes", "routes/_app.recipes.tsx"),
		route("grocery", "routes/_app.grocery.tsx"),
		route("budget", "routes/_app.budget.tsx"),
		route("settings", "routes/_app.settings.tsx"),
	]),
] satisfies RouteConfig;
