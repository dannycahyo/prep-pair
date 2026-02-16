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
		route("planner", "routes/_app.planner.tsx", [
			index("routes/_app.planner._index.tsx"),
			route(":weekId", "routes/_app.planner.$weekId.tsx"),
		]),
		route("recipes", "routes/_app.recipes.tsx", [
			index("routes/_app.recipes._index.tsx"),
			route("new", "routes/_app.recipes.new.tsx"),
			route(":recipeId", "routes/_app.recipes.$recipeId.tsx"),
		]),
		route("grocery", "routes/_app.grocery.tsx", [
			index("routes/_app.grocery._index.tsx"),
			route(":weekId", "routes/_app.grocery.$weekId.tsx"),
		]),
		route("budget", "routes/_app.budget.tsx", [
			index("routes/_app.budget._index.tsx"),
			route("log", "routes/_app.budget.log.tsx"),
		]),
		route("settings", "routes/_app.settings.tsx"),
	]),
] satisfies RouteConfig;
