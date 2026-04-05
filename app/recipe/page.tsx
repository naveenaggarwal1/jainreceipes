"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import StarRating from "@/components/StarRating";
import type { Recipe, Rating } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

const TAG_LABELS: Record<string, string> = {
  no_root_veg: "No Root Veg",
  paryushan: "Paryushan",
  upvas: "Upvas",
  no_onion_garlic: "No Onion/Garlic",
};

function RecipeDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [myRating, setMyRating] = useState<Rating | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const supabase = createClient();

  const loadRecipe = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("recipes_with_ratings")
      .select("*")
      .eq("id", id)
      .single();
    if (!data) { setNotFound(true); return; }
    setRecipe(data);
  };

  const loadRatings = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("ratings")
      .select("*, profiles(username)")
      .eq("recipe_id", id)
      .order("created_at", { ascending: false });
    setRatings(data ?? []);
  };

  useEffect(() => {
    loadRecipe();
    loadRatings();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    setMyRating(ratings.find((r) => r.user_id === user.id) ?? null);
    supabase
      .from("bookmarks")
      .select("id")
      .eq("recipe_id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setBookmarked(!!data));
  }, [user, ratings]);

  const toggleBookmark = async () => {
    if (!user) { window.location.href = "/jainreceipes/auth"; return; }
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("recipe_id", id).eq("user_id", user.id);
      setBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({ recipe_id: id, user_id: user.id });
      setBookmarked(true);
    }
  };

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        <div className="text-5xl mb-3">🍽️</div>
        <p className="font-medium text-lg">Recipe not found.</p>
        <a href="/jainreceipes/recipes" className="text-orange-500 hover:underline text-sm mt-2 inline-block">← Browse all recipes</a>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-2/3" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  const avgStars = Math.round(recipe.avg_rating ?? 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Hero image */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100 mb-8">
        {recipe.image_url ? (
          <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">🍲</div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">{recipe.category}</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{recipe.title}</h1>
        </div>
        <button
          onClick={toggleBookmark}
          className="flex-shrink-0 w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-xl hover:scale-110 transition-transform"
          aria-label="Bookmark"
        >
          {bookmarked ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Rating summary */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={`text-lg ${s <= avgStars ? "text-amber-400" : "text-gray-200"}`}>★</span>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          {recipe.avg_rating ? `${recipe.avg_rating} · ` : ""}{recipe.rating_count ?? 0} review{recipe.rating_count !== 1 ? "s" : ""}
        </span>
        <span className="text-gray-300">·</span>
        <span className="text-sm text-gray-500">by {recipe.author_name}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {recipe.jain_tags.map((tag) => (
          <span key={tag} className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100">
            {TAG_LABELS[tag] ?? tag}
          </span>
        ))}
      </div>

      <p className="text-gray-600 leading-relaxed mb-8">{recipe.description}</p>

      {/* Ingredients */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-3 text-gray-700">
              <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              {ing}
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Method</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-gray-700 leading-relaxed pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ratings section */}
      <section className="border-t border-gray-100 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">
            {myRating ? "Update your rating" : "Rate this recipe"}
          </h3>
          <StarRating
            recipeId={id}
            userId={user?.id ?? null}
            existingScore={myRating?.score}
            existingReview={myRating?.review ?? undefined}
            onSaved={() => { loadRecipe(); loadRatings(); }}
          />
        </div>

        {ratings.length > 0 ? (
          <div className="space-y-5">
            {ratings.map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-800">
                    {r.profiles?.username ?? "Anonymous"}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-sm ${s <= r.score ? "text-amber-400" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                </div>
                {r.review && <p className="text-gray-600 text-sm leading-relaxed">{r.review}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No reviews yet — be the first!</p>
        )}
      </section>
    </div>
  );
}

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded w-2/3" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>}>
      <RecipeDetailContent />
    </Suspense>
  );
}
