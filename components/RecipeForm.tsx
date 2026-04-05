"use client";

import { useState } from "react";
import type { Recipe, JainTag, RecipeCategory } from "@/lib/types";

const CATEGORIES: RecipeCategory[] = ["Main Dish", "Dessert", "Snack", "Fasting", "Breakfast"];
const JAIN_TAGS: { value: JainTag; label: string }[] = [
  { value: "no_root_veg",     label: "No Root Veg" },
  { value: "paryushan",       label: "Paryushan-friendly" },
  { value: "upvas",           label: "Upvas / Fasting" },
  { value: "no_onion_garlic", label: "No Onion/Garlic" },
];

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  category: RecipeCategory;
  jain_tags: JainTag[];
  image_url: string;
}

interface RecipeFormProps {
  initial?: Partial<Recipe>;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitLabel?: string;
}

export default function RecipeForm({ initial, onSubmit, submitLabel = "Submit Recipe" }: RecipeFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [ingredients, setIngredients] = useState<string[]>(initial?.ingredients ?? [""]);
  const [steps, setSteps] = useState<string[]>(initial?.steps ?? [""]);
  const [category, setCategory] = useState<RecipeCategory>(initial?.category ?? "Main Dish");
  const [jainTags, setJainTags] = useState<JainTag[]>(initial?.jain_tags ?? []);
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (tag: JainTag) =>
    setJainTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const updateList = (list: string[], idx: number, val: string, setter: (v: string[]) => void) => {
    const updated = [...list];
    updated[idx] = val;
    setter(updated);
  };

  const addItem = (list: string[], setter: (v: string[]) => void) => setter([...list, ""]);
  const removeItem = (list: string[], idx: number, setter: (v: string[]) => void) =>
    setter(list.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanIngredients = ingredients.filter((s) => s.trim());
    const cleanSteps = steps.filter((s) => s.trim());
    if (!title.trim() || cleanIngredients.length === 0 || cleanSteps.length === 0) {
      setError("Title, at least one ingredient, and one step are required.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ title, description, ingredients: cleanIngredients, steps: cleanSteps, category, jain_tags: jainTags, image_url: imageUrl });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Gujarati Dal"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief description of the dish…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as RecipeCategory)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Jain Tags</label>
        <div className="flex flex-wrap gap-2">
          {JAIN_TAGS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleTag(value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                jainTags.includes(value)
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients *</label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={ing}
                onChange={(e) => updateList(ingredients, i, e.target.value, setIngredients)}
                placeholder={`Ingredient ${i + 1}`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
              />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeItem(ingredients, i, setIngredients)}
                  className="px-3 text-gray-400 hover:text-red-400 transition-colors">✕</button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addItem(ingredients, setIngredients)}
          className="mt-2 text-sm text-orange-500 hover:underline font-medium"
        >
          + Add ingredient
        </button>
      </div>

      {/* Steps */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Steps *</label>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2.5 w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <textarea
                value={step}
                onChange={(e) => updateList(steps, i, e.target.value, setSteps)}
                placeholder={`Step ${i + 1}…`}
                rows={2}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm resize-none"
              />
              {steps.length > 1 && (
                <button type="button" onClick={() => removeItem(steps, i, setSteps)}
                  className="mt-2.5 px-2 text-gray-400 hover:text-red-400 transition-colors">✕</button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addItem(steps, setSteps)}
          className="mt-2 text-sm text-orange-500 hover:underline font-medium"
        >
          + Add step
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
