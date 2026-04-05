"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import RecipeCard from "@/components/RecipeCard";
import FilterBar from "@/components/FilterBar";
import type { Recipe, JainTag, RecipeCategory } from "@/lib/types";

const CATEGORIES: RecipeCategory[] = ["Main Dish", "Dessert", "Snack", "Fasting", "Breakfast"];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<JainTag[]>([]);
  const [category, setCategory] = useState<RecipeCategory | "">("");
  const supabase = createClient();

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      let query = supabase
        .from("recipes_with_ratings")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (search.trim().length >= 2) {
        query = query.ilike("title", `%${search.trim()}%`);
      }
      if (activeTags.length > 0) {
        query = query.contains("jain_tags", activeTags);
      }
      if (category) {
        query = query.eq("category", category);
      }

      const { data } = await query;
      setRecipes(data ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, activeTags, category]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">All Recipes</h1>
      <p className="text-gray-500 mb-8">
        {recipes.length} Jain-friendly recipe{recipes.length !== 1 ? "s" : ""}
      </p>

      {/* Search */}
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes…"
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setCategory("")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${category === "" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === category ? "" : c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${category === c ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Jain tag filters */}
      <div className="mb-8">
        <FilterBar active={activeTags} onChange={setActiveTags} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="font-medium">No recipes found.</p>
          <p className="text-sm mt-1">Try different filters or{" "}
            <a href="/submit" className="text-orange-500 hover:underline">submit your own</a>!
          </p>
        </div>
      )}
    </div>
  );
}
