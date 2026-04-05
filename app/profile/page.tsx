"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Recipe } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [tab, setTab] = useState<"submitted" | "saved">("submitted");
  const [submitted, setSubmitted] = useState<Recipe[]>([]);
  const [saved, setSaved] = useState<Recipe[]>([]);
  const [username, setUsername] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  useEffect(() => {
    if (!user) return;
    // Load profile
    supabase.from("profiles").select("username").eq("id", user.id).single()
      .then(({ data }) => setUsername(data?.username ?? ""));
    // Load submitted recipes (all — includes pending)
    supabase.from("recipes").select("*").eq("author_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setSubmitted(data ?? []));
    // Load bookmarked recipes
    supabase.from("bookmarks").select("recipe_id, recipes(*)").eq("user_id", user.id)
      .then(({ data }) => setSaved((data ?? []).map((b: { recipes: Recipe | Recipe[] }) => Array.isArray(b.recipes) ? b.recipes[0] : b.recipes).filter(Boolean)));
  }, [user]);

  if (user === undefined) return null;
  if (!user) { router.push("/auth"); return null; }

  const list = tab === "submitted" ? submitted : saved;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xl font-bold">
          {username?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{username || user.email}</h1>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 mb-6 max-w-xs">
        {(["submitted", "saved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t === "submitted" ? `My Recipes (${submitted.length})` : `Saved (${saved.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">{tab === "submitted" ? "📝" : "❤️"}</div>
          <p className="font-medium">
            {tab === "submitted" ? "You haven't submitted any recipes yet." : "No saved recipes yet."}
          </p>
          <Link
            href={tab === "submitted" ? "/submit" : "/recipes"}
            className="mt-3 inline-block text-orange-500 text-sm hover:underline font-medium"
          >
            {tab === "submitted" ? "Submit your first recipe →" : "Browse recipes →"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipe?id=${recipe.id}`}
              className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all"
            >
              <div>
                <p className="font-semibold text-gray-900">{recipe.title}</p>
                <p className="text-sm text-gray-400">{recipe.category}</p>
              </div>
              <div className="flex items-center gap-3">
                {tab === "submitted" && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${recipe.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {recipe.approved ? "Published" : "Pending"}
                  </span>
                )}
                <span className="text-gray-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
