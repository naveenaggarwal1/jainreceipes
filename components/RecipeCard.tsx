"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { Recipe } from "@/lib/types";

const TAG_LABELS: Record<string, string> = {
  no_root_veg: "No Root Veg",
  paryushan: "Paryushan",
  upvas: "Upvas",
  no_onion_garlic: "No Onion/Garlic",
};

const TAG_COLORS: Record<string, string> = {
  no_root_veg: "bg-green-100 text-green-700",
  paryushan: "bg-purple-100 text-purple-700",
  upvas: "bg-amber-100 text-amber-700",
  no_onion_garlic: "bg-blue-100 text-blue-700",
};

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("bookmarks")
      .select("id")
      .eq("recipe_id", recipe.id)
      .eq("user_id", userId)
      .single()
      .then(({ data }) => setBookmarked(!!data));
  }, [userId, recipe.id]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) { window.location.href = "/auth"; return; }
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("recipe_id", recipe.id).eq("user_id", userId);
      setBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({ recipe_id: recipe.id, user_id: userId });
      setBookmarked(true);
    }
  };

  const stars = Math.round(recipe.avg_rating ?? 0);

  return (
    <Link href={`/recipe?id=${recipe.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
      <div className="relative aspect-[4/3] bg-gray-100">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-orange-50 to-amber-100">
            🍲
          </div>
        )}
        <button
          onClick={toggleBookmark}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition-transform"
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark recipe"}
        >
          {bookmarked ? "❤️" : "🤍"}
        </button>
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 text-xs font-medium text-gray-700">
          {recipe.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-orange-500 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{recipe.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-sm ${s <= stars ? "text-amber-400" : "text-gray-200"}`}>★</span>
            ))}
            {recipe.rating_count ? (
              <span className="text-xs text-gray-400 ml-1">({recipe.rating_count})</span>
            ) : null}
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {recipe.jain_tags.slice(0, 2).map((tag) => (
              <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] ?? "bg-gray-100 text-gray-600"}`}>
                {TAG_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
