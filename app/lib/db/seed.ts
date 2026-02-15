import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
	console.log("Seeding database...");

	// Create test user with PIN "1234"
	const pinHash = await bcrypt.hash("1234", 10);
	const userId = createId();

	const [user] = await db
		.insert(schema.users)
		.values({
			id: userId,
			pinHash,
			weeklyBudget: "500000",
			defaultServings: 2,
		})
		.returning();

	console.log(`Created user: ${user.id}`);

	// Sample Indonesian recipes
	const recipesData = [
		{
			title: "Nasi Goreng",
			description:
				"Classic Indonesian fried rice with sweet soy sauce, garlic, and shallots. A staple comfort food.",
			category: "Indonesian",
			tags: ["rice", "quick", "comfort food"],
			prepTime: 10,
			cookTime: 15,
			servings: 2,
			cookingStyle: "fresh" as const,
			estimatedCost: "25000",
			steps: [
				{ instruction: "Cook rice and let it cool (day-old rice works best)" },
				{
					instruction: "Mince garlic and shallots, slice chili peppers",
				},
				{
					instruction: "Heat oil in a wok over high heat",
					timerSeconds: 60,
				},
				{
					instruction: "Stir-fry garlic and shallots until fragrant",
					timerSeconds: 120,
				},
				{
					instruction:
						"Add rice, kecap manis, and soy sauce. Toss until well coated",
					timerSeconds: 180,
				},
				{
					instruction:
						"Push rice to the side, scramble eggs, then mix everything together",
				},
				{
					instruction:
						"Serve with sliced cucumber, fried shallots, and kerupuk",
				},
			],
			ingredients: [
				{ name: "Cooked rice", quantity: "400", unit: "g", category: "grains" },
				{ name: "Eggs", quantity: "2", unit: "pcs", category: "protein" },
				{ name: "Garlic", quantity: "3", unit: "cloves", category: "produce" },
				{
					name: "Shallots",
					quantity: "4",
					unit: "pcs",
					category: "produce",
				},
				{
					name: "Kecap manis",
					quantity: "2",
					unit: "tbsp",
					category: "pantry",
				},
				{
					name: "Soy sauce",
					quantity: "1",
					unit: "tbsp",
					category: "pantry",
				},
				{
					name: "Vegetable oil",
					quantity: "2",
					unit: "tbsp",
					category: "pantry",
				},
			],
		},
		{
			title: "Soto Ayam",
			description:
				"Indonesian chicken soup with turmeric broth, vermicelli, and boiled eggs. Perfect for rainy days.",
			category: "Indonesian",
			tags: ["soup", "chicken", "comfort food"],
			prepTime: 20,
			cookTime: 45,
			servings: 2,
			cookingStyle: "fresh" as const,
			estimatedCost: "35000",
			steps: [
				{
					instruction:
						"Boil chicken thighs in water with lemongrass and bay leaves",
					timerSeconds: 1800,
				},
				{
					instruction:
						"Blend garlic, shallots, turmeric, and ginger into a paste",
				},
				{
					instruction: "Remove chicken, shred the meat, strain the broth",
				},
				{
					instruction: "Sauté the spice paste until fragrant",
					timerSeconds: 180,
				},
				{
					instruction: "Add spice paste to broth, simmer for 10 minutes",
					timerSeconds: 600,
				},
				{
					instruction:
						"Serve broth over vermicelli, shredded chicken, boiled eggs, and bean sprouts",
				},
			],
			ingredients: [
				{
					name: "Chicken thighs",
					quantity: "300",
					unit: "g",
					category: "protein",
				},
				{
					name: "Vermicelli",
					quantity: "100",
					unit: "g",
					category: "grains",
				},
				{ name: "Eggs", quantity: "2", unit: "pcs", category: "protein" },
				{
					name: "Turmeric",
					quantity: "2",
					unit: "cm",
					category: "produce",
				},
				{ name: "Garlic", quantity: "3", unit: "cloves", category: "produce" },
				{
					name: "Shallots",
					quantity: "5",
					unit: "pcs",
					category: "produce",
				},
				{
					name: "Lemongrass",
					quantity: "2",
					unit: "stalks",
					category: "produce",
				},
				{
					name: "Bean sprouts",
					quantity: "100",
					unit: "g",
					category: "produce",
				},
			],
		},
		{
			title: "Gado-Gado",
			description:
				"Indonesian salad with mixed vegetables, tofu, and peanut sauce dressing.",
			category: "Indonesian",
			tags: ["salad", "vegetarian", "peanut sauce"],
			prepTime: 20,
			cookTime: 15,
			servings: 2,
			cookingStyle: "fresh" as const,
			estimatedCost: "20000",
			steps: [
				{
					instruction:
						"Boil or steam vegetables: cabbage, green beans, bean sprouts, spinach",
					timerSeconds: 300,
				},
				{
					instruction: "Fry tofu until golden brown",
					timerSeconds: 300,
				},
				{
					instruction: "Boil potatoes and eggs",
					timerSeconds: 900,
				},
				{
					instruction:
						"Make peanut sauce: blend roasted peanuts, garlic, chili, tamarind, kecap manis, and water",
				},
				{
					instruction:
						"Arrange vegetables, tofu, potatoes, and eggs on a plate",
				},
				{ instruction: "Pour peanut sauce generously over everything" },
			],
			ingredients: [
				{
					name: "Firm tofu",
					quantity: "200",
					unit: "g",
					category: "protein",
				},
				{
					name: "Cabbage",
					quantity: "150",
					unit: "g",
					category: "produce",
				},
				{
					name: "Green beans",
					quantity: "100",
					unit: "g",
					category: "produce",
				},
				{
					name: "Bean sprouts",
					quantity: "100",
					unit: "g",
					category: "produce",
				},
				{
					name: "Potatoes",
					quantity: "2",
					unit: "pcs",
					category: "produce",
				},
				{ name: "Eggs", quantity: "2", unit: "pcs", category: "protein" },
				{
					name: "Roasted peanuts",
					quantity: "100",
					unit: "g",
					category: "pantry",
				},
				{ name: "Garlic", quantity: "2", unit: "cloves", category: "produce" },
				{
					name: "Kecap manis",
					quantity: "1",
					unit: "tbsp",
					category: "pantry",
				},
			],
		},
		{
			title: "Ayam Bakar",
			description:
				"Indonesian grilled chicken marinated in a sweet and savory kecap manis glaze. Great for batch prep.",
			category: "Indonesian",
			tags: ["chicken", "grilled", "batch prep"],
			prepTime: 15,
			cookTime: 30,
			servings: 2,
			cookingStyle: "batch_prep" as const,
			estimatedCost: "30000",
			steps: [
				{
					instruction:
						"Blend garlic, shallots, ginger, lemongrass, and chili into a paste",
				},
				{
					instruction: "Mix paste with kecap manis, soy sauce, and lime juice",
				},
				{
					instruction:
						"Marinate chicken in the mixture for at least 30 minutes",
					timerSeconds: 1800,
				},
				{
					instruction: "Grill or bake chicken at 200°C, basting with marinade",
					timerSeconds: 1500,
				},
				{
					instruction:
						"Flip and continue cooking until charred and cooked through",
					timerSeconds: 900,
				},
				{ instruction: "Serve with steamed rice and sambal" },
			],
			ingredients: [
				{
					name: "Chicken thighs",
					quantity: "400",
					unit: "g",
					category: "protein",
				},
				{
					name: "Kecap manis",
					quantity: "3",
					unit: "tbsp",
					category: "pantry",
				},
				{
					name: "Soy sauce",
					quantity: "1",
					unit: "tbsp",
					category: "pantry",
				},
				{ name: "Garlic", quantity: "4", unit: "cloves", category: "produce" },
				{
					name: "Shallots",
					quantity: "3",
					unit: "pcs",
					category: "produce",
				},
				{
					name: "Lemongrass",
					quantity: "1",
					unit: "stalk",
					category: "produce",
				},
				{ name: "Lime", quantity: "1", unit: "pcs", category: "produce" },
				{ name: "Ginger", quantity: "2", unit: "cm", category: "produce" },
			],
		},
		{
			title: "Mie Goreng",
			description:
				"Indonesian stir-fried noodles with vegetables and a sweet-savory sauce. Quick weeknight dinner.",
			category: "Indonesian",
			tags: ["noodles", "quick", "stir-fry"],
			prepTime: 10,
			cookTime: 10,
			servings: 2,
			cookingStyle: "fresh" as const,
			estimatedCost: "20000",
			steps: [
				{
					instruction: "Cook noodles according to package, drain well",
					timerSeconds: 180,
				},
				{
					instruction: "Mince garlic, slice cabbage, and chop bok choy",
				},
				{
					instruction: "Heat oil in a wok over high heat",
					timerSeconds: 60,
				},
				{
					instruction: "Stir-fry garlic until fragrant, add vegetables",
					timerSeconds: 120,
				},
				{
					instruction:
						"Add noodles, kecap manis, soy sauce, and oyster sauce. Toss well",
					timerSeconds: 180,
				},
				{
					instruction:
						"Serve topped with a fried egg, fried shallots, and sliced chili",
				},
			],
			ingredients: [
				{
					name: "Egg noodles",
					quantity: "200",
					unit: "g",
					category: "grains",
				},
				{ name: "Garlic", quantity: "3", unit: "cloves", category: "produce" },
				{
					name: "Cabbage",
					quantity: "100",
					unit: "g",
					category: "produce",
				},
				{
					name: "Bok choy",
					quantity: "100",
					unit: "g",
					category: "produce",
				},
				{ name: "Eggs", quantity: "2", unit: "pcs", category: "protein" },
				{
					name: "Kecap manis",
					quantity: "2",
					unit: "tbsp",
					category: "pantry",
				},
				{
					name: "Soy sauce",
					quantity: "1",
					unit: "tbsp",
					category: "pantry",
				},
				{
					name: "Vegetable oil",
					quantity: "2",
					unit: "tbsp",
					category: "pantry",
				},
			],
		},
	];

	for (const recipeData of recipesData) {
		const { ingredients, ...recipeFields } = recipeData;
		const recipeId = createId();

		await db.insert(schema.recipes).values({
			id: recipeId,
			userId: user.id,
			...recipeFields,
		});

		await db.insert(schema.recipeIngredients).values(
			ingredients.map((ing, i) => ({
				recipeId,
				name: ing.name,
				quantity: ing.quantity,
				unit: ing.unit,
				category: ing.category,
				sortOrder: i,
			})),
		);

		console.log(`Created recipe: ${recipeData.title}`);
	}

	console.log("Seeding complete!");
	await client.end();
	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
