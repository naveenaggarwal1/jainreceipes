"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import RecipeCard from "@/components/RecipeCard";
import FilterBar from "@/components/FilterBar";
import type { Recipe, JainTag } from "@/lib/types";

export default function HomePage() {
  const [featured, setFeatured] = useState<Recipe[]>([]);
  const [activeTags, setActiveTags] = useState<JainTag[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("recipes_with_ratings")
        .select("*")
        .eq("approved", true)
        .order("avg_rating", { ascending: false })
        .limit(3);
      setFeatured(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function filter() {
      let query = supabase
        .from("recipes_with_ratings")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (activeTags.length > 0) {
        query = query.contains("jain_tags", activeTags);
      }
      const { data } = await query;
      setFiltered(data ?? []);
    }
    filter();
  }, [activeTags]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-500 to-amber-600 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🙏</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Authentic Jain Recipes,<br />Made with Ahimsa
          </h1>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Discover, share, and celebrate vegetarian cooking that honours Jain principles — no root vegetables, fasting-friendly, and full of flavour.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/recipes"
              className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-colors shadow"
            >
              Browse Recipes
            </Link>
            <Link
              href="/submit"
              className="px-6 py-3 bg-orange-700/50 text-white font-semibold rounded-full hover:bg-orange-700/70 transition-colors border border-orange-400"
            >
              Share a Recipe
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Top Rated</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>

      {/* Browse by filter */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Diet</h2>
          <Link href="/recipes" className="text-sm text-orange-500 font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="mb-6">
          <FilterBar active={activeTags} onChange={setActiveTags} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
        {filtered.length === 0 && !loading && (
          <p className="text-center text-gray-400 py-12">No recipes match these filters yet.</p>
        )}
      </section>
    </div>
  );
}
