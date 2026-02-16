import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	Form,
	Link,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
import {
	IngredientInput,
	createIngredientRow,
} from "~/components/recipes/ingredient-input";
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
import { createRecipe } from "~/lib/services/recipe.service";
import { createRecipeSchema } from "~/lib/validators/recipe.schema";
import type { Route } from "./+types/_app.recipes.new";

export async function action({ request }: Route.ActionArgs) {
	const userId = await requireAuth(request);
	const formData = await request.formData();
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

	const recipe = await createRecipe(result.data, userId);
	throw redirect(`/recipes/${recipe.id}?created=true`);
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

export default function NewRecipe() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("");
	const [tagsInput, setTagsInput] = useState("");
	const [prepTime, setPrepTime] = useState("");
	const [cookTime, setCookTime] = useState("");
	const [servings, setServings] = useState("2");
	const [cookingStyle, setCookingStyle] = useState("fresh");
	const [estimatedCost, setEstimatedCost] = useState("");
	const [sourceUrl, setSourceUrl] = useState("");
	const [ingredients, setIngredients] = useState(() => [createIngredientRow()]);
	const [steps, setSteps] = useState(() => [createStepRow()]);

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

	function buildFormData() {
		const tags = tagsInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		const data = {
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
		};
		return JSON.stringify(data);
	}

	const errors = actionData?.errors;

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link to="/recipes">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h1 className="text-2xl font-bold">Add Recipe</h1>
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
				<input type="hidden" name="data" value="" />
				<div className="space-y-6">
					{/* Basic Info */}
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">
								Title <span className="text-destructive">*</span>
							</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Recipe name"
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
								placeholder="Brief description of the recipe"
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
									placeholder="e.g. Indonesian, Japanese"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="tags">Tags (comma-separated)</Label>
								<Input
									id="tags"
									value={tagsInput}
									onChange={(e) => setTagsInput(e.target.value)}
									placeholder="e.g. spicy, quick, healthy"
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
									placeholder="https://..."
								/>
							</div>
						</div>
					</div>

					<Separator />

					{/* Ingredients */}
					<div className="space-y-3">
						<Label>
							Ingredients <span className="text-destructive">*</span>
						</Label>
						<IngredientInput
							ingredients={ingredients}
							onChange={setIngredients}
							errors={errors?.ingredients ? [errors.ingredients[0]] : undefined}
						/>
					</div>

					<Separator />

					{/* Steps */}
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
										placeholder="Describe this step..."
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
						<Button type="button" variant="outline" size="sm" onClick={addStep}>
							<Plus className="h-4 w-4 mr-1" />
							Add step
						</Button>
					</div>

					<Separator />

					<div className="flex justify-end gap-3">
						<Button variant="outline" asChild>
							<Link to="/recipes">Cancel</Link>
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create Recipe"}
						</Button>
					</div>
				</div>
			</Form>
		</div>
	);
}
