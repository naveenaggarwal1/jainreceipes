"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import RecipeForm, { type RecipeFormData } from "@/components/RecipeForm";
import type { User } from "@supabase/supabase-js";

export default function SubmitPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  if (user === undefined) return null; // loading
  if (!user) {
    router.push("/auth");
    return null;
  }

  const handleSubmit = async (data: RecipeFormData) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("recipes").insert({
      ...data,
      author_id: user.id,
      author_name: profile?.username ?? "Anonymous",
      approved: false,
    });
    if (error) throw new Error(error.message);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Recipe submitted!</h1>
          <p className="text-gray-500 mb-6">Your recipe is pending review and will appear once approved.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSubmitted(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50"
            >
              Submit another
            </button>
            <button
              onClick={() => router.push("/recipes")}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600"
            >
              Browse recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Submit a Recipe</h1>
      <p className="text-gray-500 mb-8">Share a Jain recipe with the community. All submissions are reviewed before publishing.</p>
      <RecipeForm onSubmit={handleSubmit} submitLabel="Submit for Review" />
    </div>
  );
}
