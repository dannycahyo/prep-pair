import {
	ArrowLeft,
	Clock,
	Edit,
	Heart,
	Plus,
	Trash2,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Form, Link, redirect, useFetcher, useNavigation } from "react-router";
import {
	IngredientInput,
	createIngredientRow,
} from "~/components/recipes/ingredient-input";
import { ServingScaler } from "~/components/recipes/serving-scaler";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { requireAuth } from "~/lib/services/auth.service";
import {
	deleteRecipe,
	getRecipeById,
	toggleFavorite,
	updateRecipe,
} from "~/lib/services/recipe.service";
import { createRecipeSchema } from "~/lib/validators/recipe.schema";
import type { Route } from "./+types/_app.recipes.$recipeId";

export async function loader({ params, request }: Route.LoaderArgs) {
	const userId = await requireAuth(request);
	const recipe = await getRecipeById(params.recipeId, userId);

	if (!recipe) {
		throw new Response("Recipe not found", { status: 404 });
	}

	return { recipe };
}

export async function action({ params, request }: Route.ActionArgs) {
	const userId = await requireAuth(request);
	const formData = await request.formData();
	const intent = formData.get("intent");

	switch (intent) {
		case "toggle-favorite": {
			await toggleFavorite(params.recipeId, userId);
			return { success: true };
		}
		case "delete": {
			await deleteRecipe(params.recipeId, userId);
			throw redirect("/recipes");
		}
		case "update": {
			const raw = formData.get("data");
			if (typeof raw !== "string") {
				return { errors: { _form: ["Invalid form data"] } };
			}

			let parsed: unknown;
			try {
				parsed = JSON.parse(raw);
			} catch {
				return { errors: { _form: ["Invalid JSON data"] } };
			}

			const result = createRecipeSchema.safeParse(parsed);
			if (!result.success) {
				const fieldErrors: Record<string, string[]> = {};
				for (const issue of result.error.issues) {
					const key = issue.path.join(".");
					if (!fieldErrors[key]) fieldErrors[key] = [];
					fieldErrors[key].push(issue.message);
				}
				return { errors: fieldErrors };
			}

			await updateRecipe(params.recipeId, userId, result.data);
			return { success: true, updated: true };
		}
		default:
			return { errors: { _form: ["Unknown action"] } };
	}
}

type StepRow = {
	_key: string;
	instruction: string;
	timerSeconds: string;
};

let nextStepKey = 0;
function createStepRow(partial?: Partial<Omit<StepRow, "_key">>): StepRow {
	return {
		_key: `step-${++nextStepKey}`,
		instruction: partial?.instruction ?? "",
		timerSeconds: partial?.timerSeconds ?? "",
	};
}

export default function RecipeDetail({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const { recipe } = loaderData;
	const fetcher = useFetcher();
	const navigation = useNavigation();

	const [isEditing, setIsEditing] = useState(false);
	const [scaledServings, setScaledServings] = useState(recipe.servings);
	const servingMultiplier = scaledServings / recipe.servings;

	// Edit form state
	const [title, setTitle] = useState(recipe.title);
	const [description, setDescription] = useState(recipe.description || "");
	const [category, setCategory] = useState(recipe.category || "");
	const [tagsInput, setTagsInput] = useState(recipe.tags?.join(", ") || "");
	const [prepTime, setPrepTime] = useState(recipe.prepTime?.toString() || "");
	const [cookTime, setCookTime] = useState(recipe.cookTime?.toString() || "");
	const [servings, setServings] = useState(recipe.servings.toString());
	const [cookingStyle, setCookingStyle] = useState<string>(
		recipe.cookingStyle || "fresh",
	);
	const [estimatedCost, setEstimatedCost] = useState(
		recipe.estimatedCost?.toString() || "",
	);
	const [sourceUrl, setSourceUrl] = useState(recipe.sourceUrl || "");
	const [ingredients, setIngredients] = useState(() =>
		recipe.ingredients.map((ing) =>
			createIngredientRow({
				name: ing.name,
				quantity: ing.quantity?.toString() || "",
				unit: ing.unit || "",
				category: ing.category || "",
			}),
		),
	);
	const [steps, setSteps] = useState(() =>
		(recipe.steps || []).map((s) =>
			createStepRow({
				instruction: s.instruction,
				timerSeconds: s.timerSeconds?.toString() || "",
			}),
		),
	);

	// Reset form to recipe data when entering edit mode
	function enterEditMode() {
		setTitle(recipe.title);
		setDescription(recipe.description || "");
		setCategory(recipe.category || "");
		setTagsInput(recipe.tags?.join(", ") || "");
		setPrepTime(recipe.prepTime?.toString() || "");
		setCookTime(recipe.cookTime?.toString() || "");
		setServings(recipe.servings.toString());
		setCookingStyle(recipe.cookingStyle || "fresh");
		setEstimatedCost(recipe.estimatedCost?.toString() || "");
		setSourceUrl(recipe.sourceUrl || "");
		setIngredients(
			recipe.ingredients.map((ing) =>
				createIngredientRow({
					name: ing.name,
					quantity: ing.quantity?.toString() || "",
					unit: ing.unit || "",
					category: ing.category || "",
				}),
			),
		);
		setSteps(
			(recipe.steps || []).map((s) =>
				createStepRow({
					instruction: s.instruction,
					timerSeconds: s.timerSeconds?.toString() || "",
				}),
			),
		);
		setIsEditing(true);
	}

	// Exit edit mode when update succeeds
	if (
		actionData &&
		"updated" in actionData &&
		actionData.updated &&
		isEditing
	) {
		setIsEditing(false);
	}

	function buildFormData() {
		const tags = tagsInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		return JSON.stringify({
			title,
			description: description || undefined,
			sourceUrl: sourceUrl || undefined,
			prepTime: prepTime ? Number(prepTime) : undefined,
			cookTime: cookTime ? Number(cookTime) : undefined,
			servings: Number(servings) || 2,
			category: category || undefined,
			tags: tags.length > 0 ? tags : undefined,
			cookingStyle,
			estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
			ingredients: ingredients
				.filter((ing) => ing.name.trim())
				.map((ing) => ({
					name: ing.name.trim(),
					quantity: ing.quantity ? Number(ing.quantity) : undefined,
					unit: ing.unit || undefined,
					category: ing.category || undefined,
				})),
			steps: steps
				.filter((s) => s.instruction.trim())
				.map((s) => ({
					instruction: s.instruction.trim(),
					timerSeconds: s.timerSeconds ? Number(s.timerSeconds) : undefined,
				})),
		});
	}

	const isFavorite =
		fetcher.formData?.get("intent") === "toggle-favorite"
			? !recipe.isFavorite
			: recipe.isFavorite;
	const isSubmitting = navigation.state === "submitting";
	const errors =
		actionData && "errors" in actionData ? actionData.errors : undefined;

	function addStep() {
		setSteps([...steps, createStepRow()]);
	}

	function removeStep(index: number) {
		setSteps(steps.filter((_, i) => i !== index));
	}

	function updateStep(index: number, field: keyof StepRow, value: string) {
		setSteps(
			steps.map((step, i) =>
				i === index ? { ...step, [field]: value } : step,
			),
		);
	}

	if (isEditing) {
		return (
			<div className="max-w-2xl mx-auto space-y-6">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsEditing(false)}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-2xl font-bold">Edit Recipe</h1>
				</div>

				{errors?._form && (
					<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{errors._form.join(", ")}
					</div>
				)}

				<Form
					method="post"
					onSubmit={(e) => {
						const hiddenInput = e.currentTarget.querySelector(
							'input[name="data"]',
						) as HTMLInputElement;
						hiddenInput.value = buildFormData();
					}}
				>
					<input type="hidden" name="intent" value="update" />
					<input type="hidden" name="data" value="" />
					<div className="space-y-6">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">
									Title <span className="text-destructive">*</span>
								</Label>
								<Input
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
								{errors?.title && (
									<p className="text-sm text-destructive">{errors.title[0]}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={3}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="category">Category</Label>
									<Input
										id="category"
										value={category}
										onChange={(e) => setCategory(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="tags">Tags (comma-separated)</Label>
									<Input
										id="tags"
										value={tagsInput}
										onChange={(e) => setTagsInput(e.target.value)}
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								<div className="space-y-2">
									<Label htmlFor="prepTime">Prep Time (min)</Label>
									<Input
										id="prepTime"
										type="number"
										value={prepTime}
										onChange={(e) => setPrepTime(e.target.value)}
										min="0"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="cookTime">Cook Time (min)</Label>
									<Input
										id="cookTime"
										type="number"
										value={cookTime}
										onChange={(e) => setCookTime(e.target.value)}
										min="0"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="servings">Servings</Label>
									<Input
										id="servings"
										type="number"
										value={servings}
										onChange={(e) => setServings(e.target.value)}
										min="1"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="estimatedCost">Est. Cost (IDR)</Label>
									<Input
										id="estimatedCost"
										type="number"
										value={estimatedCost}
										onChange={(e) => setEstimatedCost(e.target.value)}
										min="0"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Cooking Style</Label>
									<Select value={cookingStyle} onValueChange={setCookingStyle}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="fresh">Fresh Cook</SelectItem>
											<SelectItem value="batch_prep">Batch Prep</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="sourceUrl">Source URL</Label>
									<Input
										id="sourceUrl"
										value={sourceUrl}
										onChange={(e) => setSourceUrl(e.target.value)}
									/>
								</div>
							</div>
						</div>

						<Separator />

						<div className="space-y-3">
							<Label>
								Ingredients <span className="text-destructive">*</span>
							</Label>
							<IngredientInput
								ingredients={ingredients}
								onChange={setIngredients}
								errors={
									errors?.ingredients ? [errors.ingredients[0]] : undefined
								}
							/>
						</div>

						<Separator />

						<div className="space-y-3">
							<Label>
								Steps <span className="text-destructive">*</span>
							</Label>
							{errors?.steps && (
								<p className="text-sm text-destructive">{errors.steps[0]}</p>
							)}
							{steps.map((step, index) => (
								<div key={step._key} className="flex gap-2">
									<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-medium">
										{index + 1}
									</span>
									<div className="flex-1 space-y-2">
										<Textarea
											value={step.instruction}
											onChange={(e) =>
												updateStep(index, "instruction", e.target.value)
											}
											rows={2}
										/>
										<div className="flex items-center gap-2">
											<Label className="text-xs text-muted-foreground shrink-0">
												Timer (seconds):
											</Label>
											<Input
												type="number"
												value={step.timerSeconds}
												onChange={(e) =>
													updateStep(index, "timerSeconds", e.target.value)
												}
												placeholder="Optional"
												min="0"
												className="w-28"
											/>
										</div>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeStep(index)}
										disabled={steps.length <= 1}
										className="shrink-0 self-start"
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								</div>
							))}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addStep}
							>
								<Plus className="h-4 w-4 mr-1" />
								Add step
							</Button>
						</div>

						<Separator />

						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsEditing(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</div>
				</Form>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link to="/recipes">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h1 className="text-2xl font-bold flex-1">{recipe.title}</h1>
				<fetcher.Form method="post">
					<input type="hidden" name="intent" value="toggle-favorite" />
					<Button type="submit" variant="ghost" size="icon">
						<Heart
							className={`h-5 w-5 ${
								isFavorite
									? "fill-red-500 text-red-500"
									: "text-muted-foreground"
							}`}
						/>
					</Button>
				</fetcher.Form>
				<Button variant="outline" size="sm" onClick={enterEditMode}>
					<Edit className="h-4 w-4 mr-1" />
					Edit
				</Button>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="destructive" size="sm">
							<Trash2 className="h-4 w-4 mr-1" />
							Delete
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Recipe</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete "{recipe.title}"? This action
								cannot be undone. All ingredients will also be removed.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<fetcher.Form method="post">
								<input type="hidden" name="intent" value="delete" />
								<AlertDialogAction type="submit">Delete</AlertDialogAction>
							</fetcher.Form>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			{/* Description */}
			{recipe.description && (
				<p className="text-muted-foreground">{recipe.description}</p>
			)}

			{/* Metadata */}
			<div className="flex flex-wrap gap-2">
				{recipe.category && (
					<Badge variant="secondary">{recipe.category}</Badge>
				)}
				{recipe.cookingStyle && (
					<Badge variant="outline">
						{recipe.cookingStyle === "batch_prep" ? "Batch Prep" : "Fresh"}
					</Badge>
				)}
				{recipe.tags?.map((tag) => (
					<Badge key={tag} variant="outline">
						{tag}
					</Badge>
				))}
			</div>

			{/* Stats */}
			<div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
				{recipe.prepTime != null && (
					<span className="flex items-center gap-1.5">
						<Clock className="h-4 w-4" />
						Prep: {recipe.prepTime}m
					</span>
				)}
				{recipe.cookTime != null && (
					<span className="flex items-center gap-1.5">
						<Clock className="h-4 w-4" />
						Cook: {recipe.cookTime}m
					</span>
				)}
				<span className="flex items-center gap-1.5">
					<Users className="h-4 w-4" />
					{recipe.servings} servings
				</span>
				{recipe.estimatedCost && (
					<span>Rp {Number(recipe.estimatedCost).toLocaleString("id-ID")}</span>
				)}
			</div>

			<Separator />

			{/* Ingredients */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Ingredients</h2>
					<ServingScaler
						servings={scaledServings}
						onChange={setScaledServings}
					/>
				</div>
				<ul className="space-y-2">
					{recipe.ingredients.map((ing) => {
						const scaledQty = ing.quantity
							? (Number(ing.quantity) * servingMultiplier).toFixed(
									Number(ing.quantity) * servingMultiplier ===
										Math.floor(Number(ing.quantity) * servingMultiplier)
										? 0
										: 1,
								)
							: null;
						return (
							<li key={ing.id} className="flex items-center gap-2 text-sm">
								<span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
								<span>
									{scaledQty && (
										<span className="font-medium">{scaledQty}</span>
									)}
									{ing.unit && <span className="ml-1">{ing.unit}</span>}
									<span className="ml-1">{ing.name}</span>
									{ing.category && (
										<span className="text-muted-foreground ml-1">
											({ing.category})
										</span>
									)}
								</span>
							</li>
						);
					})}
				</ul>
			</div>

			<Separator />

			{/* Steps */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Steps</h2>
				{(recipe.steps || []).map((step, index) => (
					<div key={step.instruction} className="flex gap-3">
						<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
							{index + 1}
						</span>
						<div className="space-y-1 pt-0.5">
							<p className="text-sm">{step.instruction}</p>
							{step.timerSeconds && (
								<p className="text-xs text-muted-foreground">
									Timer: {Math.floor(step.timerSeconds / 60)}m{" "}
									{step.timerSeconds % 60}s
								</p>
							)}
						</div>
					</div>
				))}
			</div>

			{recipe.sourceUrl && (
				<>
					<Separator />
					<p className="text-sm text-muted-foreground">
						Source:{" "}
						<a
							href={recipe.sourceUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							{recipe.sourceUrl}
						</a>
					</p>
				</>
			)}
		</div>
	);
}
